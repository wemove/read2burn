const test = require('node:test');
const assert = require('node:assert/strict');
const { request, startServer, stopServer } = require('./helpers/test-server');

test('READ2BURN_PUBLIC_URL enforces canonical base URL for generated links', async () => {
  const server = await startServer({
    portBase: 37000,
    env: { READ2BURN_PUBLIC_URL: 'https://safe.example' }
  });

  try {
    const response = await request({
      port: server.port,
      method: 'POST',
      pathname: '/',
      form: { secret: 'canonical-link-test' },
      extraHeaders: {
        Host: 'evil.example',
        'X-Forwarded-Proto': 'http'
      }
    });

    assert.equal(response.statusCode, 200);
    assert.match(response.body, /https:\/\/safe\.example\/\?id=[A-Za-z0-9]+/);
    assert.equal(response.body.includes('evil.example'), false);
  } finally {
    await stopServer(server);
  }
});

test('READ2BURN_PUBLIC_URL preserves optional context path', async () => {
  const server = await startServer({
    portBase: 37100,
    env: { READ2BURN_PUBLIC_URL: 'https://safe.example/read2burn' }
  });

  try {
    const response = await request({
      port: server.port,
      method: 'POST',
      pathname: '/',
      form: { secret: 'context-path-test' },
      extraHeaders: {
        Host: 'evil.example',
        'X-Forwarded-Proto': 'http'
      }
    });

    assert.equal(response.statusCode, 200);
    assert.match(response.body, /https:\/\/safe\.example\/read2burn\/\?id=[A-Za-z0-9]+/);
    assert.equal(response.body.includes('https://safe.example/?id='), false);
  } finally {
    await stopServer(server);
  }
});

test('without READ2BURN_PUBLIC_URL link generation keeps request-based behavior', async () => {
  const server = await startServer({ portBase: 38000 });

  try {
    const response = await request({
      port: server.port,
      method: 'POST',
      pathname: '/',
      form: { secret: 'fallback-link-test' },
      extraHeaders: {
        Host: 'attacker.example',
        'X-Forwarded-Proto': 'https'
      }
    });

    assert.equal(response.statusCode, 200);
    assert.match(response.body, /https:\/\/attacker\.example\/\?id=[A-Za-z0-9]+/);
  } finally {
    await stopServer(server);
  }
});
