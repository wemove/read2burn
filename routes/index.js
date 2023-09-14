const crypto = require('crypto');
const app = require('../app');

exports.index = function (req, res) {
	try {
		const nedb = app.nedb;
		const CIPHER_ALGORITHM = 'aes-256-cbc';
		const ERR_NO_SUCH_ENTRY = 'ERR_NO_SUCH_ENTRY';
		const PASSWORD_KEY_LENGTH = 32;

		let url = "";

		if (req.body.secretUserMessage) {
			const secretUserMessage = req.body.secretUserMessage;
			const password = crypto.randomBytes(PASSWORD_KEY_LENGTH).toString('hex');
			const IV = crypto.randomBytes(16); // Generate a new IV for each encryption
			const key = generateRandomKey(PASSWORD_KEY_LENGTH);


			let cipher = crypto.createCipheriv(CIPHER_ALGORITHM, Buffer.from(password, 'hex'), IV);
			let encrypted = cipher.update(secretUserMessage, 'utf8', 'base64') + cipher.final('base64');

			const entry = { key, password, timestamp: Date.now(), encrypted }; // Store only the password
			nedb.insert(entry, function(err, doc) {
				url = `https://${req.get('host')}/?key=${key}${IV.toString('hex')}`; // Concatenate password and IV in the URL
				res.render('index', { url: url, secretUserMessage: secretUserMessage, error: undefined, found: false });
				console.log(`Inserted ${key} with ID ${doc._id}`);
			});
		} else if (req.query.key || req.body.key) {
			let p = req.query.key;
			if (!p) p = req.body.key;
			const key = p.substr(0, PASSWORD_KEY_LENGTH * 2); // Hexadecimal representation
			const IV = p.substr(PASSWORD_KEY_LENGTH * 2);

			nedb.findOne({ key }, function(err, doc) {
				try {
					if (doc.encrypted && req.body.show) {
						const encrypted = doc.encrypted;
						let decipher = crypto.createDecipheriv(CIPHER_ALGORITHM, Buffer.from(doc.password, 'hex'), Buffer.from(IV, 'hex'));
						let decrypted = decipher.update(encrypted, 'base64', 'utf8') + decipher.final('utf8');

						nedb.remove({ _id: doc._id }, function(err, numDeleted) {
							nedb.persistence.compactDatafile();
						});
						res.render('index', { url: url, secretUserMessage: decrypted, error: undefined, found: true });
					} else {
						res.render('index', { url: url, secretUserMessage: false, error: undefined, found: true, key: p });
					}
				} catch (e) {
					res.render('index', { url: url, secretUserMessage: false, error: ERR_NO_SUCH_ENTRY, found: false });
				}
			});
		} else {
			res.render('index', { url: url, secretUserMessage: "", error: undefined, found: false });
		}
	} catch (err) {
		console.log(err);
	}
};

function generateRandomKey(len){
	len = len || 32
	key = crypto.randomBytes(len).toString('hex')

	app.nedb.findOne({ key }, function(err, doc) {
		if (doc) {
			console.log("Key already exists")
			generateRandomKey(len)
		}
	});
	return key
}
