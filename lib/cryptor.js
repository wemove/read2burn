const crypto = require('crypto');
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = require('base-x').default(BASE62);

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
    constructor() {
        this.KEY_LENGTH = 8;
        this.key = null;
    }

    encrypt() {
        throw new Error('This method must be implemented by concrete classes.');
    }

    decrypt() {
        throw new Error('This method must be implemented by concrete classes.');
    }

    getId() {
        throw new Error('This method must be implemented by concrete classes.');
    }

    validateId() {
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
    constructor() {
        super();
        this.PASSWORD_LENGTH = 12;
        this.CIPHER_ALGORITHM = "aes256";
        this.key = null;
        this.password = null;
        this.KEY_LENGTH = 8;
    }

    encrypt() {
        throw new Error('Method not valid for this implementation.');
    }

    decrypt(message, id) {
        const password = id.slice(this.KEY_LENGTH, this.KEY_LENGTH + this.PASSWORD_LENGTH);
        const decipherSecret = Buffer.from(password).toString('binary');
        const decipher = crypto.createDecipher(this.CIPHER_ALGORITHM, decipherSecret);
        return decipher.update(message, 'hex', 'utf8') + decipher.final('utf8');
    }

    validateId(id) {
        return id.length === this.KEY_LENGTH + this.PASSWORD_LENGTH - 1 && id.match(/^[a-z0-9]+$/);
    }
}

class CryptorV2 extends Cryptor {
    constructor() {
        super();
        this.PASSWORD_LENGTH = 32;
        this.IV_LENGTH = 16;
        this.SALT_LENGTH = 16;
        this.CIPHER_ALGORITHM = "aes-256-cbc";
        this.password = null;
        this.iV = null;
        this.salt = null;
        this.KEY_LENGTH = 8;
    }

    encrypt(message) {
        // store in members to be used later to create the parameter 'id'
        this.password = Buffer.from(this.uid(this.PASSWORD_LENGTH)).subarray(0, 32);
        this.iV = Buffer.from(this.uid(this.IV_LENGTH)).subarray(0, 16);
        this.salt = Buffer.from(this.uid(this.SALT_LENGTH)).subarray(0, 16);
        const passKey = crypto.scryptSync(this.password, this.salt, 32);
        const cipher = crypto.createCipheriv(this.CIPHER_ALGORITHM, passKey, this.iV);
        return cipher.update(message, 'utf8', 'hex') + cipher.final('hex');
    }

    decrypt(message, id) {
        const baseBuf = Buffer.from(id);
        const password = baseBuf.subarray(this.KEY_LENGTH, this.KEY_LENGTH + this.PASSWORD_LENGTH);
        const iV = baseBuf.subarray(this.KEY_LENGTH + this.PASSWORD_LENGTH, this.KEY_LENGTH + this.PASSWORD_LENGTH + this.IV_LENGTH);
        const salt = baseBuf.subarray(this.KEY_LENGTH + this.PASSWORD_LENGTH + this.IV_LENGTH, this.KEY_LENGTH + this.PASSWORD_LENGTH + this.IV_LENGTH + this.SALT_LENGTH);
        const passKey = crypto.scryptSync(password, salt, 32);
        const decipher = crypto.createDecipheriv(this.CIPHER_ALGORITHM, passKey, iV);
        return decipher.update(message, 'hex', 'utf8') + decipher.final('utf8');
    }

    getId() {
        return this.key.toString() + this.password.toString() + this.iV.toString() + this.salt.toString();
    }

    validateId(id) {
        return id.length === this.KEY_LENGTH + this.PASSWORD_LENGTH + this.IV_LENGTH + this.SALT_LENGTH && id.match(/^[a-zA-Z0-9]+$/);
    }
}

module.exports = { CryptorFactory, Cryptor, CryptorV1, CryptorV2 };