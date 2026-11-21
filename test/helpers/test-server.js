// Spawns app.js as a child process with an isolated cwd (=> isolated NeDB file) and a free port.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

const APP = path.join(__dirname, '..', '..', 'app.js');

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.once('error', reject);
    s.listen(0, () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });
}

async function startServer(env = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'r2b-'));
  const port = await freePort();
  const child = spawn(process.execPath, ['--require', path.join(__dirname, 'graceful-exit.js'), APP], {
    cwd: dir,
    env: { ...process.env, PORT: String(port), ...env },
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  const exited = new Promise((r) => child.once('exit', r));
  let out = '';
  let timer;
  await new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`server start timeout; output: ${out}`)), 15000);
    child.once('error', reject);
    void exited.then((c) => reject(new Error(`server exited early (${c}); output: ${out}`)));
    child.stdout.on('data', (d) => {
      out += d;
      if (/listening on port/.test(out)) {
        resolve();
      }
    });
  }).catch((e) => {
    child.kill();
    fs.rmSync(dir, { recursive: true, force: true });
    throw e;
  }).finally(() => clearTimeout(timer));
  const base = `http://127.0.0.1:${port}`;
  return {
    base,
    get: (p) => fetch(base + p),
    post: (p, form) =>
      fetch(base + p, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(form),
      }),
    async stop() {
      child.kill();
      await exited;
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

module.exports = { startServer };
