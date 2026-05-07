const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');

const projectRoot = path.resolve(__dirname, '../..');

function request({ port, method, pathname, form, rawBody, extraHeaders }) {
  let body = '';
  const headers = { ...(extraHeaders || {}) };

  if (rawBody !== undefined) {
    body = rawBody;
  } else if (form) {
    body = new URLSearchParams(form).toString();
  }

  if (body) {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    headers['Content-Length'] = Buffer.byteLength(body);
  }

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: pathname,
        method,
        headers
      },
      (res) => {
        let responseBody = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body: responseBody });
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function waitForServer(port, timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await request({ port, method: 'GET', pathname: '/' });
      if (response.statusCode === 200) return;
    } catch (err) {
      // Server not ready yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Server did not start in time.');
}

async function stopProcess(child) {
  if (!child || child.killed) return;
  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
    }, 2000);
    child.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
    child.kill('SIGTERM');
  });
}

async function startServer({ portBase = 34000, env = {} } = {}) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'read2burn-test-'));
  const dbFile = path.join(tmpDir, 'read2burn.db');
  const port = portBase + Math.floor(Math.random() * 1000);

  const child = spawn(process.execPath, ['app.js'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      ...env,
      PORT: String(port),
      READ2BURN_DB_FILE: dbFile
    },
    stdio: 'ignore'
  });

  await waitForServer(port);
  return { child, port, dbFile, tmpDir };
}

async function stopServer(server) {
  await stopProcess(server.child);
  await fs.rm(server.tmpDir, { recursive: true, force: true });
}

module.exports = {
  request,
  startServer,
  stopServer
};
