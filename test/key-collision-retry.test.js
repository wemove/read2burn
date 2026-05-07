const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const base62 = require('base-x')('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
const { request, startServer, stopServer } = require('./helpers/test-server');

test('duplicate generated key is retried and still creates a secret', async () => {
  const preloadPath = path.join(__dirname, 'helpers', 'random-bytes-key-collision-preload.js');
  const existingNodeOptions = process.env.NODE_OPTIONS ? `${process.env.NODE_OPTIONS} ` : '';
  const server = await startServer({
    portBase: 39000,
    env: {
      NODE_OPTIONS: `${existingNodeOptions}--require=${preloadPath}`
    }
  });

  try {
    const expectedFirstKey = base62.encode(Buffer.from('0001020304050607', 'hex')).slice(0, 8);
    const expectedRetryKey = base62.encode(Buffer.from('1011121314151617', 'hex')).slice(0, 8);

    const firstCreateResponse = await request({
      port: server.port,
      method: 'POST',
      pathname: '/',
      form: { secret: 'first-secret' }
    });
    assert.equal(firstCreateResponse.statusCode, 200);

    const firstIdMatch = firstCreateResponse.body.match(/[?&]id=([A-Za-z0-9]+)/);
    assert.ok(firstIdMatch, 'Expected to extract id from first create response');
    const firstId = firstIdMatch[1];
    assert.equal(firstId.startsWith(expectedFirstKey), true);

    const secondCreateResponse = await request({
      port: server.port,
      method: 'POST',
      pathname: '/',
      form: { secret: 'second-secret' }
    });
    assert.equal(secondCreateResponse.statusCode, 200);

    const secondIdMatch = secondCreateResponse.body.match(/[?&]id=([A-Za-z0-9]+)/);
    assert.ok(secondIdMatch, 'Expected to extract id from second create response');
    const secondId = secondIdMatch[1];
    assert.equal(secondId.startsWith(expectedRetryKey), true);
    assert.notEqual(secondId, firstId);
  } finally {
    await stopServer(server);
  }
});
