import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

const DEFAULT_SITE_URL = 'https://www.villacomunalelecce.it';

function resolveSiteUrl() {
  const configured = (process.env.PUBLIC_SITE_URL || DEFAULT_SITE_URL).trim().replace(/\/+$/, '');
  return configured || DEFAULT_SITE_URL;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const STATIC_PATHS = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/sezione/evento', changefreq: 'daily', priority: '0.95' },
  { path: '/sezione/evento?categoria=mercatini', changefreq: 'weekly', priority: '0.9' },
  { path: '/sezione/evento?categoria=musica', changefreq: 'weekly', priority: '0.9' },
  { path: '/sezione/evento?categoria=laboratori', changefreq: 'weekly', priority: '0.9' },
  { path: '/sezione/evento?categoria=yoga', changefreq: 'weekly', priority: '0.88' },
  { path: '/sezione/evento?categoria=famiglie', changefreq: 'weekly', priority: '0.88' },
  { path: '/sezione/evento?categoria=cultura', changefreq: 'weekly', priority: '0.85' },
  { path: '/foto', changefreq: 'daily', priority: '0.9' },
  { path: '/foto?categoria=video', changefreq: 'weekly', priority: '0.85' },
  { path: '/foto?categoria=musica', changefreq: 'weekly', priority: '0.85' },
  { path: '/foto?categoria=yoga', changefreq: 'weekly', priority: '0.85' },
  { path: '/foto?categoria=mercatini', changefreq: 'weekly', priority: '0.85' },
  { path: '/foto?categoria=laboratori', changefreq: 'weekly', priority: '0.85' },
  { path: '/foto?categoria=famiglie', changefreq: 'weekly', priority: '0.85' },
  { path: '/foto?categoria=cultura', changefreq: 'weekly', priority: '0.82' },
  { path: '/sezione/notizia', changefreq: 'daily', priority: '0.85' },
  { path: '/sezione/avviso', changefreq: 'weekly', priority: '0.75' },
  { path: '/progetto', changefreq: 'monthly', priority: '0.85' },
  { path: '/progetto/foto', changefreq: 'monthly', priority: '0.75' },
  { path: '/sponsor', changefreq: 'monthly', priority: '0.65' },
  { path: '/fai-pubblicita', changefreq: 'monthly', priority: '0.55' },
  { path: '/lavora-con-noi', changefreq: 'monthly', priority: '0.5' },
];

router.get('/robots.txt', (req, res) => {
  const baseUrl = resolveSiteUrl(req);
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /profilo',
    'Disallow: /accedi',
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`,
    '',
  ].join('\n');
  res.type('text/plain; charset=utf-8').send(body);
});

router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const baseUrl = resolveSiteUrl(req);
    const { rows } = await query(
      `SELECT slug, type, updated_at, published_at
       FROM articles
       WHERE status = 'published'
       ORDER BY published_at DESC NULLS LAST`
    );

    const today = new Date().toISOString().slice(0, 10);

    const staticEntries = STATIC_PATHS.map(
      (item) => `  <url>
    <loc>${escapeXml(`${baseUrl}${item.path}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
    );

    const articleEntries = rows.map((row) => {
      const mod = row.updated_at || row.published_at;
      const lastmod = mod ? new Date(mod).toISOString().slice(0, 10) : today;
      const priority = row.type === 'evento' ? '0.88' : '0.8';
      return `  <url>
    <loc>${escapeXml(`${baseUrl}/articolo/${row.slug}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...staticEntries,
      ...articleEntries,
      '</urlset>',
    ].join('\n');

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

export default router;
