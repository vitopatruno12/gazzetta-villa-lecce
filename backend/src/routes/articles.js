import { Router } from 'express';
import slugify from 'slugify';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function makeSlug(title) {
  const base = slugify(title || 'articolo', { lower: true, strict: true, locale: 'it' });
  return `${base}-${Date.now().toString(36)}`;
}

/** Pubblico: elenco articoli pubblicati */
router.get('/', async (req, res) => {
  const { type, q, limit = 20, offset = 0 } = req.query;
  const params = [];
  const where = ["status = 'published'"];

  if (type) {
    params.push(type);
    where.push(`type = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    where.push(`(title ILIKE $${params.length} OR body ILIKE $${params.length})`);
  }

  params.push(Number(limit) || 20);
  params.push(Number(offset) || 0);

  const { rows } = await query(
    `SELECT id, slug, title, subtitle, type, cover_url, video_url, location, event_start, event_end,
            is_sponsored, company_id, published_at, created_at
     FROM articles
     WHERE ${where.join(' AND ')}
     ORDER BY published_at DESC NULLS LAST
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  res.json(rows);
});

router.get('/slug/:slug', async (req, res) => {
  const { rows } = await query(
    `SELECT a.*, c.name AS company_name, c.logo_url AS company_logo
     FROM articles a
     LEFT JOIN companies c ON c.id = a.company_id
     WHERE a.slug = $1 AND a.status = 'published'`,
    [req.params.slug]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Articolo non trovato' });
  res.json(rows[0]);
});

/** Admin: tutti gli articoli */
router.get('/admin/all', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT id, slug, title, type, status, is_sponsored, published_at, updated_at
     FROM articles
     ORDER BY updated_at DESC`
  );
  res.json(rows);
});

router.get('/admin/:id', requireAuth, async (req, res) => {
  const { rows } = await query('SELECT * FROM articles WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Articolo non trovato' });
  res.json(rows[0]);
});

router.post('/', requireAuth, async (req, res) => {
  const b = req.body || {};
  const slug = b.slug || makeSlug(b.title);
  const status = b.status || 'draft';
  const publishedAt = status === 'published' ? new Date() : null;

  const { rows } = await query(
    `INSERT INTO articles
      (slug, title, subtitle, body, type, status, cover_url, video_url, location, event_start, event_end,
       is_sponsored, company_id, author_id, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING *`,
    [
      slug,
      b.title,
      b.subtitle || null,
      b.body || '',
      b.type || 'notizia',
      status,
      b.cover_url || null,
      b.video_url || null,
      b.location || null,
      b.event_start || null,
      b.event_end || null,
      Boolean(b.is_sponsored),
      b.company_id || null,
      req.user.id,
      publishedAt,
    ]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', requireAuth, async (req, res) => {
  const b = req.body || {};
  const { rows: existing } = await query('SELECT * FROM articles WHERE id = $1', [req.params.id]);
  if (!existing[0]) return res.status(404).json({ error: 'Articolo non trovato' });

  const prev = existing[0];
  const status = b.status ?? prev.status;
  let publishedAt = prev.published_at;
  if (status === 'published' && !publishedAt) publishedAt = new Date();
  if (status !== 'published') publishedAt = status === 'draft' ? publishedAt : publishedAt;

  const { rows } = await query(
    `UPDATE articles SET
      title = $1, subtitle = $2, body = $3, type = $4, status = $5, cover_url = $6,
      video_url = $7, location = $8, event_start = $9, event_end = $10, is_sponsored = $11,
      company_id = $12, published_at = $13, updated_at = NOW()
     WHERE id = $14
     RETURNING *`,
    [
      b.title ?? prev.title,
      b.subtitle ?? prev.subtitle,
      b.body ?? prev.body,
      b.type ?? prev.type,
      status,
      b.cover_url ?? prev.cover_url,
      b.video_url !== undefined ? b.video_url || null : prev.video_url,
      b.location ?? prev.location,
      b.event_start ?? prev.event_start,
      b.event_end ?? prev.event_end,
      b.is_sponsored != null ? Boolean(b.is_sponsored) : prev.is_sponsored,
      b.company_id !== undefined ? b.company_id : prev.company_id,
      publishedAt,
      req.params.id,
    ]
  );
  res.json(rows[0]);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const result = await query('DELETE FROM articles WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Articolo non trovato' });
  res.status(204).end();
});

export default router;
