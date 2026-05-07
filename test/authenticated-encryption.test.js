const test = require('node:test');
const assert = require('node:assert/strict');
const { CryptorFactory, CryptorV2, CryptorV3 } = require('../routes');

function flipSingleHexChar(hex) {
  if (!hex || hex.length < 1) {
    throw new Error('Cannot tamper with empty hex string.');
  }
  const replacement = hex[0].toLowerCase() === 'a' ? 'b' : 'a';
  return `${replacement}${hex.slice(1)}`;
}

test('cryptor v3 decrypt fails on ciphertext or tag tampering', () => {
  const cryptor = new CryptorV3();
  cryptor.createKey();

  const secret = `secret-${Date.now()}`;
  const encrypted = cryptor.encrypt(secret);
  const id = cryptor.getId();

  const decrypted = cryptor.decrypt(encrypted, id);
  assert.equal(decrypted, secret);

  const separatorIdx = encrypted.lastIndexOf(':');
  assert.ok(separatorIdx > 0);

  const cipherHex = encrypted.slice(0, separatorIdx);
  const tagHex = encrypted.slice(separatorIdx + 1);

  const tamperedCipherPayload = `${flipSingleHexChar(cipherHex)}:${tagHex}`;
  assert.throws(
    () => cryptor.decrypt(tamperedCipherPayload, id),
    /auth|unsupported state|unable to authenticate/i
  );

  const tamperedTagPayload = `${cipherHex}:${flipSingleHexChar(tagHex)}`;
  assert.throws(
    () => cryptor.decrypt(tamperedTagPayload, id),
    /auth|unsupported state|unable to authenticate/i
  );
});

test('factory supports v2 compatibility and defaults to v3 for new secrets', () => {
  const secret = `compat-${Date.now()}`;
  const factory = new CryptorFactory();

  const v2 = new CryptorV2();
  v2.createKey();
  const v2Encrypted = v2.encrypt(secret);
  const v2Id = v2.getId();
  assert.equal(v2.decrypt(v2Encrypted, v2Id), secret);
  assert.ok(factory.createFromId(v2Id) instanceof CryptorV2);

  const current = factory.createCurrent();
  assert.ok(current instanceof CryptorV3);

  current.createKey();
  const v3Encrypted = current.encrypt(secret);
  const v3Id = current.getId();
  assert.equal(current.decrypt(v3Encrypted, v3Id), secret);
  assert.ok(factory.createFromId(v3Id) instanceof CryptorV3);
});
