import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const usePglite =
  process.env.USE_PGLITE === '1' ||
  (process.env.DATABASE_URL || '').startsWith('pglite');

let pool;
let queryImpl;

const FACEBOOK_VIDEO_URL = 'https://www.facebook.com/watch/?v=886800934367716';

async function ensureArticleVideo() {
  await queryImpl('ALTER TABLE articles ADD COLUMN IF NOT EXISTS video_url TEXT');
  await queryImpl(
    `INSERT INTO articles
       (slug, title, subtitle, body, type, status, location, video_url, published_at)
     VALUES ($1, $2, $3, $4, 'notizia', 'published', $5, $6, NOW())
     ON CONFLICT (slug) DO NOTHING`,
    [
      'nuovo-volto-villa-comunale-lecce',
      'Nuovo volto per la Villa Comunale di Lecce',
      'Il progetto di riqualificazione presentato a Palazzo Carafa',
      'A Palazzo Carafa è stato presentato il progetto per la riqualificazione e la gestione della Villa Comunale: uno spazio per tutti, più sicuro e con più servizi. Il video è pubblicato da TeleRama.',
      'Villa Comunale, Lecce',
      FACEBOOK_VIDEO_URL,
    ]
  );
}

const SPONSOR_LOGOS = [
  ['le-mani-in-pasta', 'Le Mani in Pasta', '/pubblicita/le-mani-in-pasta.jpg'],
  ['gazza-ladra', 'Gazza Ladra', '/pubblicita/gazza-ladra.jpg'],
  ['le-mucche-volanti', 'Le Mucche Volanti', '/pubblicita/le-mucche-volanti.jpg'],
];

async function ensureCompanyLogos() {
  for (const [slug, name, logo] of SPONSOR_LOGOS) {
    await queryImpl(
      `INSERT INTO companies (name, slug, logo_url, city)
       VALUES ($1, $2, $3, 'Lecce')
       ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name, logo_url = EXCLUDED.logo_url`,
      [name, slug, logo]
    );
  }
  await queryImpl(
    `UPDATE companies SET logo_url = NULL
     WHERE slug IN ('bar-del-parco', 'farmacia-centro', 'ristorante-salento')`
  );
}

export async function initDb() {
  if (usePglite) {
    const { PGlite } = await import('@electric-sql/pglite');
    const dataDir = path.resolve(__dirname, '..', '.pglite-data');
    const db = new PGlite(dataDir);
    await db.waitReady;

    const marker = path.join(dataDir, '.initialized');
    if (!fs.existsSync(marker)) {
      const sqlDir = path.resolve(__dirname, '..', 'sql');
      const schema = fs.readFileSync(path.join(sqlDir, 'schema.sql'), 'utf8');
      const seed = fs.readFileSync(path.join(sqlDir, 'seed.sql'), 'utf8');
      // pgcrypto non serve in PGlite: gen_random_uuid è già disponibile
      const schemaSafe = schema.replace(
        /CREATE EXTENSION IF NOT EXISTS "pgcrypto";\s*/i,
        ''
      );
      await db.exec(schemaSafe);
      await db.exec(seed);
      fs.writeFileSync(marker, new Date().toISOString());
      console.log('PGlite: schema e seed applicati');
    } else {
      console.log('PGlite: database locale già inizializzato');
    }

    pool = {
      query: (text, params) => db.query(text, params),
      end: async () => db.close(),
    };
    queryImpl = (text, params) => db.query(text, params);
  } else {
    const pg = await import('pg');
    pool = new pg.default.Pool({
      connectionString: process.env.DATABASE_URL,
    });
    queryImpl = (text, params) => pool.query(text, params);
  }

  await ensureArticleVideo();
  await ensureCompanyLogos();
}

export { pool };

export async function query(text, params) {
  if (!queryImpl) {
    throw new Error('Database non inizializzato: chiama initDb() all’avvio');
  }
  return queryImpl(text, params);
}
