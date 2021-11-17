/*
 * GET home page.
 */

const crypto = require("crypto");
const app = require("../app");

exports.index = function (req, res) {
  try {
    const nedb = app.nedb;
    const CIPHER_ALGORITHM = "aes256";
    const ERR_NO_SUCH_ENTRY = "ERR_NO_SUCH_ENTRY";
    const FILE_KEY_LENGTH = 8;
    const PASSWORD_KEY_LENGTH = 12;

    let url = "";
    let encrypted = "";

    if (req.body.secret) {
      const secret = req.body.secret;
      const key = uid(FILE_KEY_LENGTH);
      // TODO: Look for key in database
      // if exists, create another key
      const password = uid(PASSWORD_KEY_LENGTH);
      const timestamp = new Date().getTime();
      const cipherSecret = new Buffer.from(password, "binary");
      const cipher = crypto.createCipher(CIPHER_ALGORITHM, cipherSecret);
      encrypted = cipher.update(secret, "utf8", "hex") + cipher.final("hex");
      const entry = { key, timestamp, encrypted };
      nedb.insert(entry, function (err, doc) {
        url = `${req.protocol}://${req.get("host")}/?key=${key + password}`;
        res.render("index", {
          url: url,
          secret: secret,
          error: undefined,
          found: false,
        });
        console.log("Inserted", doc.key, "with ID", doc._id);
      });
    } else if (req.query.key || req.body.key) {
      let p = req.query.key;
      if (!p) p = req.body.key;
      const key = p.substr(0, FILE_KEY_LENGTH);
      const password = p.substr(FILE_KEY_LENGTH, PASSWORD_KEY_LENGTH);
      nedb.findOne({ key }, function (err, doc) {
        try {
          if (doc.encrypted && req.body.show) {
            const encrypted = doc.encrypted;
            const decipherSecret = new Buffer.from(password, "binary");
            const decipher = crypto.createDecipher(
              CIPHER_ALGORITHM,
              decipherSecret
            );
            const decrypted =
              decipher.update(encrypted, "hex", "utf8") +
              decipher.final("utf8");
            /*eslint no-unused-vars: "warn"*/
            nedb.remove({ key }, function (err, numDeleted) {
              nedb.persistence.compactDatafile();
            });
            res.render("index", {
              url: url,
              secret: decrypted,
              error: undefined,
              found: true,
            });
          } else {
            res.render("index", {
              url: url,
              secret: false,
              error: undefined,
              found: true,
              key: p,
            });
          }
        } catch (e) {
          res.render("index", {
            url: url,
            secret: false,
            error: ERR_NO_SUCH_ENTRY,
            found: false,
          });
        }
      });
    } else {
      res.render("index", {
        url: url,
        secret: encrypted,
        error: undefined,
        found: false,
      });
    }
  } catch (err) {
    console.log(err);
  }
};

// Generate a secure random string of a given length, containing characters a-zA-Z0-9. If no length is given, return a random string of length 7.
function uid(len) {
  len = len || 7;
  return crypto
    .randomBytes(len)
    .toString("base64")
    .slice(0, len)
    .replace(/\+/g, "0")
    .replace(/\//g, "0");
}
