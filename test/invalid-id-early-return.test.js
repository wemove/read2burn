const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { request, startServer, stopServer } = require('./helpers/test-server');

test('invalid id returns 422 and stops normal flow', async () => {
  const server = await startServer({ portBase: 35000 });

  try {
    const response = await request({
      port: server.port,
      method: 'POST',
      pathname: '/',
      form: { id: 'not-a-valid-id' }
    });

    assert.equal(response.statusCode, 422);
    assert.match(response.body, /Invalid argument\./);
    assert.equal(response.body.includes('No entry found!'), false);
    assert.equal(response.body.includes('id='), false);

    let dbContents = '';
    try {
      dbContents = await fs.readFile(server.dbFile, 'utf8');
    } catch (err) {
      if (err && err.code !== 'ENOENT') throw err;
    }
    assert.equal(
      dbContents.includes('"encrypted"'),
      false,
      'Invalid id request must not persist data'
    );
  } finally {
    await stopServer(server);
  }
});
