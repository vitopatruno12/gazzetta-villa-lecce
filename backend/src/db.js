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
  ['quarta-caffe', 'Quarta Caffè', '/pubblicita/quarta-caffe.png'],
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
  await ensureJemSectionEvent();
  await ensureTrhThisEvent();
  await ensureDecemberConcerts();
  await ensureClientAccounts();
}

async function ensureClientAccounts() {
  const columns = ['first_name', 'last_name', 'company_name', 'vat_number', 'city', 'address'];
  for (const column of columns) {
    await queryImpl(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${column} TEXT`);
  }
  await queryImpl('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
  await queryImpl(
    `ALTER TABLE users ADD CONSTRAINT users_role_check
     CHECK (role IN ('admin', 'editor', 'cliente'))`
  );
}

const JEM_BODY = `Il gruppo musicale Jem Section arriva ai Giardini pubblici Giuseppe Garibaldi. Dal 5 al 10 novembre 2026 le serate si svolgono nella Villa Comunale di Lecce.

Tappe e serate
5 novembre — Giardini pubblici Giuseppe Garibaldi
6 novembre — Giardini pubblici Giuseppe Garibaldi
7 novembre — Giardini pubblici Giuseppe Garibaldi
8 novembre — Giardini pubblici Giuseppe Garibaldi
9 novembre — Giardini pubblici Giuseppe Garibaldi
10 novembre — Giardini pubblici Giuseppe Garibaldi`;

async function ensureJemSectionEvent() {
  const fields = [
    'jem-section-giardini-garibaldi',
    'Jem Section ai Giardini pubblici Giuseppe Garibaldi',
    'Tappe e serate dal 5 al 10 novembre',
    JEM_BODY,
    'Giardini pubblici Giuseppe Garibaldi, Lecce',
    '2026-11-05',
    '2026-11-10',
  ];
  await queryImpl(
    `UPDATE articles
     SET slug = $1, title = $2, subtitle = $3, body = $4, location = $5,
         event_start = $6, event_end = $7, type = 'evento', status = 'published'
     WHERE slug IN ($1, 'jaeim-secion-giardini-garibaldi')`,
    fields
  );
  await queryImpl(
    `INSERT INTO articles
       (slug, title, subtitle, body, type, status, location, event_start, event_end, published_at)
     VALUES ($1, $2, $3, $4, 'evento', 'published', $5, $6, $7, NOW())
     ON CONFLICT (slug) DO NOTHING`,
    fields
  );
}

const TRH_PHOTOS = [
  '/eventi/trh-this/01.jpg',
  '/eventi/trh-this/02.jpg',
  '/eventi/trh-this/03.jpg',
  '/eventi/trh-this/04.jpg',
  '/eventi/trh-this/05.jpg',
  '/eventi/trh-this/06.jpg',
];

async function ensureTrhThisEvent() {
  await queryImpl('ALTER TABLE articles ADD COLUMN IF NOT EXISTS gallery_urls TEXT');
  await queryImpl(
    `INSERT INTO articles
       (slug, title, subtitle, body, type, status, cover_url, gallery_urls, published_at)
     VALUES ($1, $2, $3, $4, 'evento', 'published', $5, $6, NOW())
     ON CONFLICT (slug) DO UPDATE
       SET title = EXCLUDED.title,
           subtitle = EXCLUDED.subtitle,
           body = EXCLUDED.body,
           type = 'evento',
           status = 'published',
           cover_url = EXCLUDED.cover_url,
           gallery_urls = EXCLUDED.gallery_urls`,
    [
      'trh-this',
      'TRH This',
      'Gruppo musicale',
      'Il gruppo musicale TRH This in concerto. Chitarra, tromba, basso e batteria.',
      TRH_PHOTOS[0],
      JSON.stringify(TRH_PHOTOS),
    ]
  );
}

const DECEMBER_CONCERTS = [
  {
    slug: 'metropolitan-trio-christmas',
    title: 'Metropolitan Trio',
    subtitle: 'Christmas Edition. Giusy Colì, Paco Carrieri e Alessio Borgia · 12 dicembre',
    body: `Il 12 dicembre il Metropolitan Trio porta in scena la Christmas Edition. In voce Giusy Colì, alle tastiere Paco Carrieri, alla batteria Alessio Borgia.

Colì e Carrieri sono una coppia di palco del Salento. Lei è una delle voci più seguite della black music locale, dal jazz al soul e al funk. Lui sta al piano e alle tastiere, sugli arrangiamenti. Insieme hanno costruito un groove che mescola jazz contemporaneo, blues e funk. A dicembre quel sound vira sulle canzoni di Natale.`,
    cover: '/eventi/metropolitan-trio/locandina.jpg',
    start: '2026-12-12',
  },
  {
    slug: 'nitecity',
    title: 'NiteCity',
    subtitle: 'Dance, pop e latino, dal vivo · 5 dicembre',
    body: `Il 5 dicembre suona NiteCity. Il progetto nasce da Ciki Forchetti, dj e cantante salentino, che ha riportato sul palco la sua trasmissione radiofonica Nite City.

Il repertorio pesca nella dance e nel pop dagli anni ’70 a oggi, con soul, funk e musica latina, italiana compresa. A Lecce la band è da anni un live da ballare e da cantare.`,
    cover: '/eventi/nitecity/locandina.jpg',
    start: '2026-12-05',
  },
  {
    slug: 'le-circostanze',
    title: 'Le Circostanze',
    subtitle: 'La musica italiana dagli anni ’70 a oggi, dal vivo · 19 dicembre',
    body: `Il 19 dicembre Le Circostanze portano in live la musica italiana dagli anni ’70 a oggi. La formazione salentina è Paolo Liberti alla voce e alla chitarra, Ramona Ricchiuto alla voce, Mauro De Carlo alla chitarra, Luca Sarinelli al basso e Gianmarco Razzano alla batteria.

Il viaggio passa da Battisti e Rino Gaetano a Vanoni, e da Cremonini a Vasco. Canzoni che il pubblico conosce a memoria, restituite da una band che le suona dal vivo.`,
    cover: '/eventi/le-circostanze/locandina.jpg',
    start: '2026-12-19',
  },
  {
    slug: 'the-dytt',
    title: 'The Dytt',
    subtitle: 'La Jam del Caffè del Teatro · 13 novembre, ore 22.00',
    body: `Il 13 novembre, alle 22, The Dytt sale sul palco del Caffè del Teatro per La Jam del Caffè del Teatro. Sul palco Leo Gaballo, Alessio Vergari, Giorgio Campiti, Francesco Perrone e Filippo Trinchera.

The Dytt propone un viaggio nel rock ’n’ roll, nel blues, nel funk e nel soul, con grandi classici della musica italiana e internazionale. Lo spettacolo alterna atmosfere blues e sonorità raffinate a ritmi funky, groove e momenti di puro rock ’n’ roll.

La scaletta passa dai Beatles ai Police, da Bill Withers a Stevie Ray Vaughan, e ancora da John Mayer a Prince, Oasis, Daft Punk e Red Hot Chili Peppers. Dalla musica italiana arrivano Pino Daniele, Jovanotti, Neffa e Alex Britti.`,
    cover: '/eventi/the-dytt/locandina.jpg',
    start: '2026-11-13',
    location: 'Caffè del Teatro',
  },
];

async function ensureDecemberConcerts() {
  for (const concert of DECEMBER_CONCERTS) {
    await queryImpl(
      `INSERT INTO articles
         (slug, title, subtitle, body, type, status, cover_url, event_start, location, published_at)
       VALUES ($1, $2, $3, $4, 'evento', 'published', $5, $6, $7, NOW() - INTERVAL '3 days')
       ON CONFLICT (slug) DO UPDATE
         SET title = EXCLUDED.title,
             subtitle = EXCLUDED.subtitle,
             body = EXCLUDED.body,
             type = 'evento',
             status = 'published',
             cover_url = EXCLUDED.cover_url,
             event_start = EXCLUDED.event_start,
             location = EXCLUDED.location`,
      [concert.slug, concert.title, concert.subtitle, concert.body, concert.cover, concert.start, concert.location || null]
    );
  }

  await queryImpl(
    `INSERT INTO articles
       (slug, title, subtitle, body, type, status, cover_url, location, event_start, event_end, published_at)
     VALUES ($1, $2, $3, $4, 'evento', 'published', $5, $6, $7, $8, NOW())
     ON CONFLICT (slug) DO UPDATE
       SET title = EXCLUDED.title,
           subtitle = EXCLUDED.subtitle,
           body = EXCLUDED.body,
           type = 'evento',
           status = 'published',
           cover_url = EXCLUDED.cover_url,
           location = EXCLUDED.location,
           event_start = EXCLUDED.event_start,
           event_end = EXCLUDED.event_end`,
    [
      'un-natale-in-villa',
      'Natale in Villa',
      '5 dicembre 2026 – 6 gennaio 2027 · Mercatini, musica, laboratori e famiglie',
      `Dal 5 dicembre 2026 al 6 gennaio 2027 la Villa Comunale di Lecce ospita Natale in Villa: un mese di mercatini, musica dal vivo, laboratori e appuntamenti per le famiglie.

Dicembre 2026 si apre nei fine settimana del 5–6, 12–13 e 19–20 con i Mercatini di Natale e, ogni sabato, musica live e jam session. Martedì 8 dicembre la Festa dell’Immacolata porta in Villa mercatini, musica e attività per famiglie, mentre venerdì 11 dicembre arriva lo spettacolo con i falchi. Dal 23 al 27 dicembre prende vita il Villaggio di Babbo Natale con mercatini e laboratori per bambini (giovedì 24 spettacolo con i falchi, sabato 26 musica live), seguito il 28 e 29 dicembre dal laboratorio di cartapesta e argilla.

Gennaio 2027 prosegue venerdì 1 con mercatini, laboratorio di creta e spettacolo con i falchi; sabato 2 con mercatini, laboratorio di creta, musica live e jam session; domenica 3 con mercatini e laboratorio di creta; lunedì 4 e martedì 5 con il laboratorio di cartapesta e argilla, fino a mercoledì 6 gennaio per l’Epifania con mercatini e attività per famiglie.

Ogni settimana: il venerdì Yoga e Fitness, la domenica la passeggiata con i pony.`,
      '/eventi/natale-in-villa/locandina-2026.jpg',
      'Villa Comunale di Lecce',
      '2026-12-05',
      '2027-01-06',
    ]
  );
}

export { pool };

export async function query(text, params) {
  if (!queryImpl) {
    throw new Error('Database non inizializzato: chiama initDb() all’avvio');
  }
  return queryImpl(text, params);
}
