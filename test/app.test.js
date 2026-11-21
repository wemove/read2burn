const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('./helpers/test-server');

let srv;
test.before(async () => { srv = await startServer(); });
test.after(() => srv.stop());

const extractId = (html) => /\?id=([A-Za-z0-9]+)/.exec(html)[1];

test('create, preview, read once', async () => {
  const created = await (await srv.post('/', { secret: 'top secret' })).text();
  const id = extractId(created);

  // preview must not consume the secret
  const preview = await srv.get(`/?id=${id}`);
  assert.equal(preview.status, 200);
  assert.ok(!(await preview.text()).includes('top secret'));

  const shown = await (await srv.post('/', { id, show: '1' })).text();
  assert.ok(shown.includes('top secret'));

  const again = await (await srv.post('/', { id, show: '1' })).text();
  assert.ok(!again.includes('top secret'));
});

test('invalid id returns 422', async () => {
  const res = await srv.get('/?id=bogus');
  assert.equal(res.status, 422);
});

test('home page renders', async () => {
  assert.equal((await srv.get('/')).status, 200);
});
