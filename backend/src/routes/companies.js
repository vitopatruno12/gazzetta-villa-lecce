import { Router } from 'express';
import slugify from 'slugify';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res) => {
  const { rows } = await query(
    `SELECT id, name, slug, logo_url, website, city, active
     FROM companies WHERE active = TRUE ORDER BY name`
  );
  res.json(rows);
});

router.get('/admin/all', requireAuth, async (_req, res) => {
  const { rows } = await query('SELECT * FROM companies ORDER BY name');
  res.json(rows);
});

router.post('/', requireAuth, async (req, res) => {
  const b = req.body || {};
  if (!b.name) return res.status(400).json({ error: 'Nome obbligatorio' });
  const slug =
    b.slug ||
    slugify(b.name, { lower: true, strict: true, locale: 'it' }) +
      '-' +
      Date.now().toString(36);

  const { rows } = await query(
    `INSERT INTO companies (name, slug, logo_url, website, email, phone, city, notes, active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9, TRUE))
     RETURNING *`,
    [
      b.name,
      slug,
      b.logo_url || null,
      b.website || null,
      b.email || null,
      b.phone || null,
      b.city || null,
      b.notes || null,
      b.active,
    ]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', requireAuth, async (req, res) => {
  const b = req.body || {};
  const { rows } = await query(
    `UPDATE companies SET
      name = COALESCE($1, name),
      logo_url = COALESCE($2, logo_url),
      website = COALESCE($3, website),
      email = COALESCE($4, email),
      phone = COALESCE($5, phone),
      city = COALESCE($6, city),
      notes = COALESCE($7, notes),
      active = COALESCE($8, active)
     WHERE id = $9
     RETURNING *`,
    [
      b.name ?? null,
      b.logo_url ?? null,
      b.website ?? null,
      b.email ?? null,
      b.phone ?? null,
      b.city ?? null,
      b.notes ?? null,
      b.active ?? null,
      req.params.id,
    ]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Azienda non trovata' });
  res.json(rows[0]);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const result = await query('DELETE FROM companies WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: 'Azienda non trovata' });
  res.status(204).end();
});

export default router;
