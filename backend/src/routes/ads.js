import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/** Pubblico: creatività attive per uno slot */
router.get('/serve/:slotCode', async (req, res) => {
  const { rows } = await query(
    `SELECT cr.id, cr.title, cr.image_url, cr.html_body, cr.click_url, cr.kind,
            s.code AS slot_code, s.width, s.height,
            co.name AS company_name, co.logo_url AS company_logo
     FROM ad_creatives cr
     JOIN ad_campaigns ca ON ca.id = cr.campaign_id
     JOIN ad_slots s ON s.id = cr.slot_id
     JOIN companies co ON co.id = ca.company_id
     WHERE s.code = $1
       AND cr.active = TRUE
       AND ca.status = 'active'
       AND co.active = TRUE
       AND (ca.starts_at IS NULL OR ca.starts_at <= NOW())
       AND (ca.ends_at IS NULL OR ca.ends_at >= NOW())
     ORDER BY ca.priority DESC, RANDOM()
     LIMIT 5`,
    [req.params.slotCode]
  );
  res.json(rows);
});

router.post('/events', async (req, res) => {
  const { creative_id, event_type } = req.body || {};
  if (!creative_id || !['impression', 'click'].includes(event_type)) {
    return res.status(400).json({ error: 'creative_id e event_type richiesti' });
  }
  await query(
    'INSERT INTO ad_events (creative_id, event_type) VALUES ($1, $2)',
    [creative_id, event_type]
  );
  res.status(201).json({ ok: true });
});

router.get('/slots', requireAuth, async (_req, res) => {
  const { rows } = await query('SELECT * FROM ad_slots ORDER BY code');
  res.json(rows);
});

router.get('/campaigns', requireAuth, async (_req, res) => {
  const { rows } = await query(
    `SELECT ca.*, co.name AS company_name
     FROM ad_campaigns ca
     JOIN companies co ON co.id = ca.company_id
     ORDER BY ca.created_at DESC`
  );
  res.json(rows);
});

router.post('/campaigns', requireAuth, async (req, res) => {
  const b = req.body || {};
  if (!b.company_id || !b.name) {
    return res.status(400).json({ error: 'company_id e name obbligatori' });
  }
  const { rows } = await query(
    `INSERT INTO ad_campaigns (company_id, name, status, starts_at, ends_at, priority)
     VALUES ($1,$2,COALESCE($3,'draft'),$4,$5,COALESCE($6,0))
     RETURNING *`,
    [b.company_id, b.name, b.status, b.starts_at || null, b.ends_at || null, b.priority]
  );
  res.status(201).json(rows[0]);
});

router.put('/campaigns/:id', requireAuth, async (req, res) => {
  const b = req.body || {};
  const { rows } = await query(
    `UPDATE ad_campaigns SET
      name = COALESCE($1, name),
      status = COALESCE($2, status),
      starts_at = COALESCE($3, starts_at),
      ends_at = COALESCE($4, ends_at),
      priority = COALESCE($5, priority)
     WHERE id = $6
     RETURNING *`,
    [b.name, b.status, b.starts_at, b.ends_at, b.priority, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Campagna non trovata' });
  res.json(rows[0]);
});

router.get('/creatives', requireAuth, async (_req, res) => {
  const { rows } = await query(
    `SELECT cr.*, s.code AS slot_code, ca.name AS campaign_name
     FROM ad_creatives cr
     JOIN ad_slots s ON s.id = cr.slot_id
     JOIN ad_campaigns ca ON ca.id = cr.campaign_id
     ORDER BY cr.created_at DESC`
  );
  res.json(rows);
});

router.post('/creatives', requireAuth, async (req, res) => {
  const b = req.body || {};
  if (!b.campaign_id || !b.slot_id) {
    return res.status(400).json({ error: 'campaign_id e slot_id obbligatori' });
  }
  const { rows } = await query(
    `INSERT INTO ad_creatives
      (campaign_id, slot_id, title, image_url, html_body, click_url, kind, active)
     VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,'banner'),COALESCE($8,TRUE))
     RETURNING *`,
    [
      b.campaign_id,
      b.slot_id,
      b.title || null,
      b.image_url || null,
      b.html_body || null,
      b.click_url || null,
      b.kind,
      b.active,
    ]
  );
  res.status(201).json(rows[0]);
});

router.get('/stats', requireAuth, async (_req, res) => {
  const { rows } = await query(
    `SELECT cr.id, cr.title, s.code AS slot_code,
            COUNT(*) FILTER (WHERE e.event_type = 'impression') AS impressions,
            COUNT(*) FILTER (WHERE e.event_type = 'click') AS clicks
     FROM ad_creatives cr
     JOIN ad_slots s ON s.id = cr.slot_id
     LEFT JOIN ad_events e ON e.creative_id = cr.id
     GROUP BY cr.id, s.code
     ORDER BY impressions DESC`
  );
  res.json(rows);
});

export default router;
