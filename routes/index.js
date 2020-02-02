
/*
 * GET home page.
 */

var crypto = require('crypto');
var fs = require('extfs');
var rimraf = require('rimraf');
var path = require('path');


var db = require('./chaos')('data');


exports.index = function (req, res) {

	try {

		var CIPHER_ALGORITHM = 'aes256'
		var ERR_NO_SUCH_ENTRY = 'ERR_NO_SUCH_ENTRY'
		var FILE_KEY_LENGTH = 8
		var PASSWD_KEY_LENGTH = 12

		var url = "";
		var encrypted = "";
		if (req.body.secret) {
			var secret = req.body.secret;
			var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
			var key = uid(FILE_KEY_LENGTH);
			// TODO: Look for key in database
			// if exists, create another key
			var passwd = uid(PASSWD_KEY_LENGTH);
			var cipherSecret = new Buffer(passwd).toString('binary');
			var cipher = crypto.createCipher(CIPHER_ALGORITHM, cipherSecret);
			encrypted = cipher.update(secret, 'utf8', 'hex') + cipher.final('hex');
			var relPath = "";
			if (process.env.REL_PATH) relPath=process.env.REL_PATH;
			url = req.protocol + '://' + req.get('host') + relPath + "/?key=" + key + passwd;
			db.hset(key.substr(0, 3), key, { encrypted: encrypted });
			res.render('index', { url: url, secret: secret, error: undefined, found: false });
		} else if (req.query.key || req.body.key) {
			var p = req.query.key;
			if (!p) p = req.body.key;
			var key = p.substr(0, FILE_KEY_LENGTH);
			var passwd = p.substr(FILE_KEY_LENGTH, PASSWD_KEY_LENGTH);
			db.hget(key.substr(0, 3), key, function (err, dbValue) {
				if (err) {
					res.render('index', { url: url, secret: decrypted, error: ERR_NO_SUCH_ENTRY, found: false });
				} else {
					if (dbValue) {
						if (req.body.show) {
							var encrypted = dbValue.encrypted;
							var decipherSecret = new Buffer(passwd).toString('binary');
							var decipher = crypto.createDecipher(CIPHER_ALGORITHM, decipherSecret);
							var decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
							db.hdel(key.substr(0, 3), key);
							res.render('index', { url: url, secret: decrypted, error: undefined, found: true });
						} else {
							res.render('index', { url: url, secret: false, error: undefined, found: true, key: p });
						}
					} else {
						res.render('index', { url: url, secret: decrypted, error: ERR_NO_SUCH_ENTRY, found: false });
					}
				}
			});
		} else {
			res.render('index', { url: url, secret: encrypted, error: undefined, found: false });
		}
	} catch (err) {
		console.log(err);
	}
};

function uid(len) {
	len = len || 7;
	return Math.random().toString(35).substr(2, len);
}

