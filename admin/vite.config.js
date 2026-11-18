import net from 'node:net';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND_PORT = 4000;
const PROXY_PREFIXES = ['/api', '/uploads'];

function checkPortOnce(port, host = '127.0.0.1', timeoutMs = 250) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

async function waitForBackend(maxWaitMs = 8000) {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    if (await checkPortOnce(BACKEND_PORT)) return true;
    await new Promise((r) => setTimeout(r, 150));
  }
  return false;
}

function waitForBackendPlugin() {
  return {
    name: 'wait-for-backend',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!PROXY_PREFIXES.some((prefix) => url === prefix || url.startsWith(`${prefix}/`) || url.startsWith(`${prefix}?`))) {
          return next();
        }
        const up = await waitForBackend();
        if (!up) {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'Backend non ancora attivo sulla porta 4000' }));
          return undefined;
        }
        return next();
      });
    },
  };
}

export default defineConfig({
  plugins: [waitForBackendPlugin(), react()],
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:4000',
      '/uploads': 'http://127.0.0.1:4000',
    },
  },
});
