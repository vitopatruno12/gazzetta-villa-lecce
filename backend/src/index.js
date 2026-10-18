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

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: true, mode: process.env.USE_PGLITE === '1' ? 'pglite' : 'postgres' });
  } catch (err) {
    res.status(503).json({ ok: false, db: false, error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/media', mediaRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Errore server' });
});

await initDb();
app.listen(port, () => {
  console.log(`API testata in ascolto su http://localhost:${port}`);
});
