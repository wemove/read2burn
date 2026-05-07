const test = require('node:test');
const assert = require('node:assert/strict');
const { request, startServer, stopServer } = require('./helpers/test-server');

test('only one concurrent read can reveal a secret', async () => {
  const server = await startServer({ portBase: 34000 });

  try {
    const secret = `race-secret-${Date.now()}`;
    const createResponse = await request({
      port: server.port,
      method: 'POST',
      pathname: '/',
      form: { secret }
    });

    assert.equal(createResponse.statusCode, 200);
    const idMatch = createResponse.body.match(/[?&]id=([A-Za-z0-9]+)/);
    assert.ok(idMatch, 'Expected to extract secret id from create response');
    const id = idMatch[1];

    const [r1, r2] = await Promise.all([
      request({ port: server.port, method: 'POST', pathname: '/', form: { id, show: 'true' } }),
      request({ port: server.port, method: 'POST', pathname: '/', form: { id, show: 'true' } })
    ]);

    const responses = [r1, r2];
    const successfulReads = responses.filter((r) => r.body.includes(secret)).length;
    const missingReads = responses.filter((r) => r.body.includes('No entry found!')).length;

    assert.equal(successfulReads, 1, 'Exactly one request should reveal the secret');
    assert.equal(missingReads, 1, 'Exactly one request should fail after secret is consumed');
  } finally {
    await stopServer(server);
  }
});
