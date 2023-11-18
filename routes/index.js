const app = require('../app');
const crypto = require('crypto');
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = require('base-x')(BASE62);

exports.index = function (req, res) {
	try {
		const nedb = app.nedb;
		const ERR_NO_SUCH_ENTRY = 'ERR_NO_SUCH_ENTRY';

		let url = "";
		let encrypted = "";

		const cf = new CryptorFactory();

		if (req.body.secret) {
			
			if (req.body.secret.length > 10000000) {
				res.status(413);
				res.send('Argument too large.');
			}
			
			const cryptor = cf.createCurrent();
			let found = false;
			let key = null;
			const secret = req.body.secret;
			do {
				key = cryptor.createKey();
				nedb.findOne({ key }, function (err, doc) {
					if (doc) {
						found = true;
					}
				});
			} while (found);
	
			const timestamp = new Date().getTime();
			const encrypted = cryptor.encrypt(secret);
			const entry = { key, timestamp, encrypted }
			nedb.insert(entry, function (err, doc) {
				url = `${req.protocol}://${req.get('host')}/?id=${cryptor.getId()}`;
				res.render('index', { url: url, secret: secret, error: undefined, found: false });
			});
		// parameter 'key' is deprecated, remove related code after 01.01.2025
		} else if (req.query.key || req.body.id || req.query.id) {
			let id = req.query.key;
			if (!id) id = req.query.id;
			if (!id) id = req.body.id;

			const crypt = cf.createFromId(id);

			if (!crypt.validateId(id)) {
				res.status(422);
				res.send('Invalid argument.');
			} else {

				const key = crypt.parseKey(id);
				
				nedb.findOne({ key }, function (err, doc) {
					if (err) {
						res.render('index', { url: url, secret: false, error: ERR_NO_SUCH_ENTRY, found: false });
					} else {
						try {
							if (doc.encrypted && req.body.show) {
								const encrypted = doc.encrypted;
								
								const decrypted = crypt.decrypt(encrypted, id);
								nedb.remove({ key }, function (err, numDeleted) {
									nedb.compactDatafile();
								});
								res.render('index', { url: url, secret: decrypted, error: undefined, found: true });
							} else {
								res.render('index', { url: url, secret: false, error: undefined, found: true, id: id });
							}
						} catch (e) {
							res.render('index', { url: url, secret: false, error: ERR_NO_SUCH_ENTRY, found: false });
						}
					}
				});
			}
		} else {
			res.render('index', { url: url, secret: encrypted, error: undefined, found: false });
		}
	} catch (err) {
		console.log(err);
		res.status(500);
		res.send('Unexpected server error.');
	}

};



class CryptorFactory {
	createFromVersion(version) {
		switch (version) {
			case 'v1': 
				return new CryptorV1();
			default:
				return new CryptorV2();
		}
	}

	createFromId(id) {
		switch (id.length) {
			case 19: 
				return this.createFromVersion("v1");

			default: 
				return this.createFromVersion("v2");
		}
	}

	createCurrent() {
		return this.createFromVersion("CURRENT");
	}

}

class Cryptor {

	KEY_LENGTH = 8;

	key = null;

	encrypt( message ) {
		throw new Error('This method must be implemented by concrete classes.');
	}

	decrypt( message, key ) {
		throw new Error('This method must be implemented by concrete classes.');
	}

	getId( id ) {
		throw new Error('This method must be implemented by concrete classes.');
	}

	validateId( id ) {
		throw new Error('This method must be implemented by concrete classes.');
	}

	parseKey(id) {
		return id.substr(0, this.KEY_LENGTH);
	}

	createKey() {
		this.key = this.uid(this.KEY_LENGTH);
		return this.key;
	}
	
	uid(len) {
		return base62.encode(crypto.randomBytes(len)).slice(0, len);
	}

}


/**
 * Deprecated, remove after 01.01.2025
 * 
 * This implementation is just used to decrypt existing deprecated secrets.
 */
class CryptorV1 extends Cryptor {

	PASSWORD_LENGTH = 12;
	CIPHER_ALGORITHM = "aes256";

	key = null;
	password = null;

	constructor() {
		super();
		this.KEY_LENGTH = 8;
	}

	encrypt( message ) {
		throw new Error('Method not valid for this implementation.');
	}

	decrypt( message, id ) {
		const password = id.slice(this.KEY_LENGTH, this.KEY_LENGTH + this.PASSWORD_LENGTH)
		const decipherSecret = new Buffer.from(password).toString('binary');
		const decipher = crypto.createDecipher(this.CIPHER_ALGORITHM, decipherSecret);
		return decipher.update(message, 'hex', 'utf8') + decipher.final('utf8');
	}

	validateId(id) {
		return id.length == this.KEY_LENGTH + this.PASSWORD_LENGTH -1 && id.match(/^[a-z0-9]+$/);
	}


}

class CryptorV2 extends Cryptor {

	PASSWORD_LENGTH = 32;
	IV_LENGTH = 16;
	SALT_LENGTH = 16;
	CIPHER_ALGORITHM = "aes-256-cbc"

	password = null;
	iV = null;
	salt = null;

	constructor() {
		super();
		this.KEY_LENGTH = 8;
	}

	encrypt( message ) {
		// store in members to be used later to create the parameter 'id'
		this.password  = Buffer.from(this.uid(this.PASSWORD_LENGTH)).subarray(0, 32);
		this.iV = Buffer.from(this.uid(this.IV_LENGTH)).subarray(0, 16);
		this.salt = Buffer.from(this.uid(this.SALT_LENGTH)).subarray(0, 16);

		const passKey = crypto.scryptSync(this.password, this.salt, 32);
		const cipher = crypto.createCipheriv(this.CIPHER_ALGORITHM, passKey, this.iV);
		return cipher.update(message, 'utf8', 'hex') + cipher.final('hex');
	}

	decrypt(message, id ) {
		const baseBuf = Buffer.from(id);
		const password = baseBuf.subarray(this.KEY_LENGTH, this.KEY_LENGTH + this.PASSWORD_LENGTH)
		const iV = baseBuf.subarray(this.KEY_LENGTH + this.PASSWORD_LENGTH, this.KEY_LENGTH + this.PASSWORD_LENGTH + this.IV_LENGTH)
		const salt = baseBuf.subarray(this.KEY_LENGTH + this.PASSWORD_LENGTH + this.IV_LENGTH, this.KEY_LENGTH + this.PASSWORD_LENGTH + this.IV_LENGTH + this.SALT_LENGTH)

		const passKey = crypto.scryptSync(password, salt, 32);
		const decipher = crypto.createDecipheriv(this.CIPHER_ALGORITHM, passKey, iV);
		return decipher.update(message, 'hex', 'utf8') + decipher.final('utf8');
	}

	getId() {
		return this.key.toString() + this.password.toString() + this.iV.toString() + this.salt.toString();
	}

	validateId(id) {
		return id.length == this.KEY_LENGTH + this.PASSWORD_LENGTH + this.IV_LENGTH + this.SALT_LENGTH && id.match(/^[a-zA-Z0-9]+$/);
	}

}