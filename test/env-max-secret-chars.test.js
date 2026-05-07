const test = require('node:test');
const assert = require('node:assert/strict');
const { request, startServer, stopServer } = require('./helpers/test-server');

test('READ2BURN_MAX_SECRET_CHARS allows max-sized secret and rejects max+1', async () => {
  const maxSecretChars = 8;
  const server = await startServer({
    portBase: 36000,
    env: { READ2BURN_MAX_SECRET_CHARS: String(maxSecretChars) }
  });

  try {
    const atLimitSecret = '€'.repeat(maxSecretChars);
    const atLimitResponse = await request({
      port: server.port,
      method: 'POST',
      pathname: '/',
      form: { secret: atLimitSecret }
    });
    assert.equal(atLimitResponse.statusCode, 200);
    assert.equal(
      atLimitResponse.body.includes('id='),
      true,
      'Expected successful creation at configured max chars'
    );

    const overLimitSecret = '€'.repeat(maxSecretChars + 1);
    const overLimitResponse = await request({
      port: server.port,
      method: 'POST',
      pathname: '/',
      form: { secret: overLimitSecret }
    });
    assert.equal(overLimitResponse.statusCode, 413);
    assert.match(overLimitResponse.body, /Argument too large\./);
  } finally {
    await stopServer(server);
  }
});
