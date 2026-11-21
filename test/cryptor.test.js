const test = require('node:test');
const assert = require('node:assert/strict');
const { CryptorFactory } = require('../lib/cryptor');

test('V2 encrypt/decrypt round-trip via id', () => {
  const c = new CryptorFactory().createCurrent();
  c.createKey();
  const enc = c.encrypt('héllo secret');
  const id = c.getId();
  assert.ok(c.validateId(id));
  const d = new CryptorFactory().createFromId(id);
  assert.equal(d.decrypt(enc, id), 'héllo secret');
  assert.equal(d.parseKey(id), c.key);
});

test('validateId rejects malformed ids', () => {
  const c = new CryptorFactory().createCurrent();
  assert.ok(!c.validateId('short'));
  assert.ok(!c.validateId('!'.repeat(72)));
});
