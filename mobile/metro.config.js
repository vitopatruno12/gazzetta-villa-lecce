const http = require('node:http');
const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const BACKEND_PORT = 4000;
const BACKEND_PREFIXES = ['/api/', '/eventi/', '/pubblicita/', '/uploads/', '/progetto/'];

let backendChild = null;
let backendBootPromise = null;

function isPortOpen(port, host = '127.0.0.1', timeoutMs = 250) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

function ensureBackendRunning() {
  if (backendBootPromise) return backendBootPromise;

  backendBootPromise = (async () => {
    if (await isPortOpen(BACKEND_PORT)) return true;

    const backendDir = path.resolve(__dirname, '..', 'backend');
    if (!backendChild || backendChild.killed || backendChild.exitCode !== null) {
      backendChild = spawn(process.execPath, ['src/index.js'], {
        cwd: backendDir,
        stdio: 'ignore',
        windowsHide: true,
      });
      const cleanup = () => {
        if (backendChild && !backendChild.killed) {
          try {
            backendChild.kill();
          } catch {
            // ignore
          }
        }
      };
      process.once('exit', cleanup);
      process.once('SIGINT', cleanup);
      process.once('SIGTERM', cleanup);
    }

    const deadline = Date.now() + 9000;
    while (Date.now() < deadline) {
      if (await isPortOpen(BACKEND_PORT)) return true;
      await new Promise((r) => setTimeout(r, 200));
    }
    return false;
  })().finally(() => {
    backendBootPromise = null;
  });

  return backendBootPromise;
}

// Avvia preventivamente il backend se non è già acceso
ensureBackendRunning().catch(() => {});

config.server = config.server || {};
const prevEnhance = config.server.enhanceMiddleware;

config.server.enhanceMiddleware = (metroMiddleware, metroServer) => {
  const baseMiddleware = prevEnhance
    ? prevEnhance(metroMiddleware, metroServer)
    : metroMiddleware;

  return async (req, res, next) => {
    const url = req.url || '';
    const shouldProxy =
      url === '/api' || BACKEND_PREFIXES.some((prefix) => url.startsWith(prefix));

    if (!shouldProxy) {
      return baseMiddleware(req, res, next);
    }

    await ensureBackendRunning();

    const proxyReq = http.request(
      {
        hostname: '127.0.0.1',
        port: BACKEND_PORT,
        path: url,
        method: req.method,
        headers: {
          ...req.headers,
          host: `127.0.0.1:${BACKEND_PORT}`,
        },
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, {
          ...proxyRes.headers,
          'access-control-allow-origin': '*',
        });
        proxyRes.pipe(res, { end: true });
      }
    );

    proxyReq.on('error', () => {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          error: 'Backend non attivo sulla porta 4000. Avvia `npm run dev` nella cartella principale.',
        })
      );
    });

    req.pipe(proxyReq, { end: true });
    return undefined;
  };
};

module.exports = config;
