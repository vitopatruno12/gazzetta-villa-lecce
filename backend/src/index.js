import http from 'node:http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import articlesRoutes from './routes/articles.js';
import companiesRoutes from './routes/companies.js';
import adsRoutes from './routes/ads.js';
import mediaRoutes from './routes/media.js';
import seoRoutes from './routes/seo.js';
import { initDb, pool } from './db.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT) || 4000;

const origins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origins.length ? origins : true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(
  '/uploads',
  express.static(path.resolve(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'))
);
app.use(express.static(path.resolve(__dirname, '..', '..', 'frontend', 'public')));

let dbReady = null;

app.use(async (_req, _res, next) => {
  try {
    if (!dbReady) dbReady = initDb();
    await dbReady;
    next();
  } catch (err) {
    next(err);
  }
});

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: true, mode: process.env.USE_PGLITE === '1' ? 'pglite' : 'postgres' });
  } catch (err) {
    res.status(503).json({ ok: false, db: false, error: err.message });
  }
});

app.use('/', seoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/media', mediaRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Errore server' });
});

function isExistingBackendHealthy(targetPort) {
  return new Promise((resolve) => {
    const req = http.get(
      { hostname: '127.0.0.1', port: targetPort, path: '/api/health', timeout: 1500 },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            resolve(Boolean(parsed && parsed.ok));
          } catch {
            resolve(false);
          }
        });
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

const server = app.listen(port, () => {
  dbReady = initDb();
  dbReady
    .then(() => {
      console.log(`API testata in ascolto su http://localhost:${port}`);
    })
    .catch((err) => {
      console.error('Errore avvio database:', err);
      process.exit(1);
    });
});

server.on('error', async (err) => {
  if (err.code === 'EADDRINUSE') {
    if (await isExistingBackendHealthy(port)) {
      console.log(`API testata già attiva su http://localhost:${port} (riutilizzo istanza attiva)`);
      setInterval(() => {}, 1 << 30);
      return;
    }
    console.error(
      `Porta ${port} già in uso. Chiudi il processo precedente oppure cambia PORT nel file .env.`
    );
    process.exit(1);
  }
  throw err;
});
