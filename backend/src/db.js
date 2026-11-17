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

const YOGA_GALLERY = [
  '/eventi/yoga-cristiana-vergari/holistic-walking.jpg',
  '/eventi/yoga-cristiana-vergari/bosco-gruppo.jpg',
  '/eventi/yoga-cristiana-vergari/bosco-yoga.jpg',
  '/eventi/yoga-cristiana-vergari/pilates-postura.jpg',
  '/eventi/yoga-cristiana-vergari/yoga-mare.jpg',
  '/eventi/yoga-cristiana-vergari/libro-yoga-bambini.jpg',
  '/eventi/yoga-cristiana-vergari/yoga-bambini-festa.jpg',
  '/eventi/yoga-cristiana-vergari/logo-yoga-bambini.jpg',
  '/eventi/yoga-cristiana-vergari/logo-academy.jpg',
];

const VILLA_PROGRAM_EVENTS = [
  {
    slug: 'cristiana-vergari-yoga-villa-comunale',
    title: 'Cristiana Vergari | Yoga, Pilates, Holistic Yoga Walking & Yoga Bambini',
    subtitle: 'Tutti i venerdì in Villa Comunale · Benessere, movimento e Yoga Bambini Educational',
    body: `Ciao, sono Cristiana Vergari, insegnante di Yoga e Pilates, da oltre 23 anni nel mondo del benessere e del movimento.

Sono leccese di origine, ma ho vissuto per tanti anni in Lombardia, dove ho sviluppato il mio percorso professionale, formandomi sia in Italia che all’estero.

Oggi sono felice di portare la mia esperienza nella mia terra, a Lecce, attraverso diverse attività dedicate al benessere di grandi e piccoli.

Holistic Yoga Walking: una camminata olistica all’aria aperta, accompagnata dalla musica in cuffia, che unisce movimento, Yoga, Pilates e respirazione consapevole. Un’esperienza adatta a tutti, che aiuta a scaricare lo stress, migliorare la postura, ritrovare energia e soprattutto divertirsi!

Yoga: lezioni dedicate al benessere fisico e mentale. Attraverso il movimento, il respiro e l’ascolto del corpo, lavoreremo sulla centratura mentale, sulla flessibilità e sulla capacità di ritrovare calma ed equilibrio nella vita quotidiana.

Pilates: lezioni mirate alla tonificazione muscolare, al miglioramento della postura e alla mobilità articolare. Un lavoro completo che aiuta a rinforzare il corpo, con particolare attenzione alla muscolatura profonda e al benessere della schiena.

Yoga Bambini: sono anche un punto di riferimento in Italia nel mondo dello Yoga Bambini, ideatrice del metodo Yoga Bambini Educational e autrice di un libro dedicato a questo tema, che ha raggiunto il primo posto nelle classifiche Amazon.

Il mio percorso formativo Yoga Bambini Educational è riconosciuto dal MIM (Ministero dell’Istruzione e del Merito).

Da anni mi occupo della formazione degli insegnanti e della diffusione dello Yoga nelle scuole, aiutando i bambini a conoscere il proprio corpo, riconoscere le emozioni e sviluppare maggiore consapevolezza attraverso il gioco, il movimento e il respiro.

Per questo porteremo anche lo Yoga Bambini all’interno del progetto della Villa Comunale di Lecce, con attività pensate per i più piccoli, dove imparare e divertirsi insieme.

Il mio obiettivo? Far stare bene le persone, a qualsiasi età, attraverso il movimento, con semplicità, energia e un sorriso!

Sono davvero felice di far parte di questo bellissimo progetto e di poter condividere la mia esperienza proprio nella mia Lecce!

I miei riferimenti
Sito web: www.cristianavergari.com
Instagram: https://www.instagram.com/cristianavergari_academy?exln=MXBqdjFpdzg5ODE1Yw%3D%3D&utm_source=qr`,
    cover: '/eventi/yoga-cristiana-vergari/cover.jpg',
    gallery: JSON.stringify(YOGA_GALLERY),
    start: null,
    end: null,
    location: 'Villa Comunale di Lecce · Tutti i venerdì',
  },
  {
    slug: 'mercatini-di-natale-in-villa',
    title: 'Mercatini di Natale in Villa',
    subtitle: '5–6, 8, 12–13, 19–20, 23–27 dicembre 2026 · 1–3 e 6 gennaio 2027',
    body: `Un percorso tra artigianato, idee regalo, prodotti tipici e atmosfere natalizie lungo i viali della Villa Comunale di Lecce.

Date in calendario:
• 5 – 6 dicembre 2026
• 8 dicembre 2026 (Festa dell’Immacolata Concezione)
• 12 – 13 dicembre 2026
• 19 – 20 dicembre 2026
• 23 – 24 – 25 – 26 – 27 dicembre 2026 (con Il Villaggio di Babbo Natale)
• 1 – 2 – 3 gennaio 2027 (con laboratori di creta e jam session)
• 6 gennaio 2027 (Epifania, con attività per le famiglie)`,
    cover: '/eventi/natale-in-villa/schede/mercatini-natale.jpg',
    gallery: null,
    start: '2026-12-05',
    end: '2027-01-06',
    location: 'Villa Comunale di Lecce',
  },
  {
    slug: 'festa-immacolata-villa-comunale',
    title: 'Festa dell’Immacolata Concezione',
    subtitle: '8 dicembre 2026 · Tradizione, mercatini, musica e famiglie',
    body: `Martedì 8 dicembre 2026 la Villa Comunale di Lecce celebra la Festa dell’Immacolata Concezione con un appuntamento speciale dedicato alla tradizione, alla fede e alla cultura del nostro territorio.

In programma:
• Mercatini di Natale nella Villa
• Momenti di musica e intrattenimento
• Attività per famiglie e bambini`,
    cover: '/eventi/natale-in-villa/schede/immacolata.jpg',
    gallery: null,
    start: '2026-12-08',
    end: null,
    location: 'Villa Comunale di Lecce',
  },
  {
    slug: 'villaggio-di-babbo-natale',
    title: 'Il Villaggio di Babbo Natale',
    subtitle: '23 – 27 dicembre 2026 · Cinque giornate dedicate alla magia delle feste',
    body: `Dal 23 al 27 dicembre 2026 la Villa Comunale di Lecce accoglie Il Villaggio di Babbo Natale: cinque giornate dedicate all’atmosfera e alla magia delle feste per bambini e famiglie.

In programma:
• Incontro con Babbo Natale
• Attività e intrattenimento per bambini
• Laboratori creativi e manuali
• Musica e animazione per famiglie (24 dicembre Spettacolo con i Falchi · 26 dicembre Musica Live e Jam Session)`,
    cover: '/eventi/natale-in-villa/schede/villaggio-babbo-natale.jpg',
    gallery: null,
    start: '2026-12-23',
    end: '2026-12-27',
    location: 'Villa Comunale di Lecce',
  },
  {
    slug: 'laboratorio-cartapesta-e-argilla',
    title: 'Laboratorio Cartapesta, Argilla e Creta',
    subtitle: '28–29 dicembre 2026 · 1–3 e 4–5 gennaio 2027 · Arte, tradizione e creatività',
    body: `La tradizione dell’arte artigianale leccese diventa protagonista in Villa Comunale attraverso attività pratiche e creative per grandi e piccoli.

Appuntamenti in calendario:
• 28 – 29 dicembre 2026: Laboratorio di Cartapesta e Argilla
• 1 – 3 gennaio 2027: Creatività e musica per il nuovo anno — laboratori di modellazione e costruzione con la creta, attività manuali e jam session musicali
• 4 – 5 gennaio 2027: Laboratorio di Cartapesta e Argilla`,
    cover: '/eventi/natale-in-villa/schede/cartapesta-argilla.jpg',
    gallery: JSON.stringify(['/eventi/natale-in-villa/schede/creativita-nuovo-anno.jpg']),
    start: '2026-12-28',
    end: '2027-01-05',
    location: 'Villa Comunale di Lecce',
  },
  {
    slug: 'passeggiata-con-i-pony',
    title: 'Passeggiata con i Pony',
    subtitle: 'Tutte le domeniche · Un’esperienza speciale nel parco per i più piccoli',
    body: `Ogni domenica in Villa Comunale un’esperienza speciale pensata per i più piccoli, per scoprire il parco in modo divertente e sicuro.

• Passeggiate nel parco a misura di bambino
• Accompagnamento da personale qualificato
• Un’attività all’aria aperta per tutta la famiglia`,
    cover: '/eventi/natale-in-villa/schede/passeggiata-pony.jpg',
    gallery: null,
    start: null,
    end: null,
    location: 'Villa Comunale di Lecce · Tutte le domeniche',
  },
  {
    slug: 'spettacolo-con-i-falchi',
    title: 'Spettacolo con i Falchi',
    subtitle: '11 e 24 dicembre 2026 · 1 gennaio 2027 · Dimostrazione di falconeria',
    body: `Un’affascinante dimostrazione di falconeria nella cornice della Villa Comunale di Lecce per scoprire da vicino il mondo dei rapaci, tra natura, tradizione ed emozione.

Date in calendario:
• Venerdì 11 dicembre 2026
• Giovedì 24 dicembre 2026
• Venerdì 1 gennaio 2027`,
    cover: '/eventi/natale-in-villa/schede/spettacolo-falchi.jpg',
    gallery: null,
    start: '2026-12-11',
    end: '2027-01-01',
    location: 'Villa Comunale di Lecce',
  },
  {
    slug: 'musica-live-e-jam-session',
    title: 'Musica Live e Jam Session in Villa',
    subtitle: '5, 12, 19 e 26 dicembre 2026 · 2 gennaio 2027 · Palcoscenico a cielo aperto',
    body: `La Villa Comunale di Lecce diventa un palcoscenico a cielo aperto per artisti, musicisti e giovani talenti, tra concerti dal vivo e jam session aperte.

Date in programma:
• Sabato 5 dicembre 2026 (con NiteCity)
• Sabato 12 dicembre 2026 (con Metropolitan Trio – Christmas Edition)
• Sabato 19 dicembre 2026 (con Le Circostanze)
• Sabato 26 dicembre 2026
• Sabato 2 gennaio 2027`,
    cover: '/eventi/natale-in-villa/schede/musica-jam-session.jpg',
    gallery: null,
    start: '2026-12-05',
    end: '2027-01-02',
    location: 'Villa Comunale di Lecce',
  },
  {
    slug: 'lecce-comic',
    title: 'Lecce Comic · Fumetto, Illustrazione e Cultura Pop',
    subtitle: 'Febbraio 2027 · Creatività contemporanea, autori, disegno e cultura pop',
    body: `A febbraio 2027 la programmazione della Villa Comunale di Lecce prosegue con Lecce Comic, un evento dedicato al mondo del fumetto, dell’illustrazione e della creatività contemporanea.

In programma:
• Incontri con autori e illustratori
• Mostre e laboratori di disegno
• Stand tematici e collezionismo
• Spazio alla cultura pop e al gaming`,
    cover: '/eventi/natale-in-villa/schede/lecce-comic.jpg',
    gallery: null,
    start: '2027-02-01',
    end: '2027-02-28',
    location: 'Villa Comunale di Lecce · Febbraio 2027',
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

  for (const item of VILLA_PROGRAM_EVENTS) {
    await queryImpl(
      `INSERT INTO articles
         (slug, title, subtitle, body, type, status, cover_url, gallery_urls, event_start, event_end, location, published_at)
       VALUES ($1, $2, $3, $4, 'evento', 'published', $5, $6, $7, $8, $9, NOW() - INTERVAL '2 days')
       ON CONFLICT (slug) DO UPDATE
         SET title = EXCLUDED.title,
             subtitle = EXCLUDED.subtitle,
             body = EXCLUDED.body,
             type = 'evento',
             status = 'published',
             cover_url = EXCLUDED.cover_url,
             gallery_urls = EXCLUDED.gallery_urls,
             event_start = EXCLUDED.event_start,
             event_end = EXCLUDED.event_end,
             location = EXCLUDED.location`,
      [
        item.slug,
        item.title,
        item.subtitle,
        item.body,
        item.cover,
        item.gallery,
        item.start,
        item.end,
        item.location,
      ]
    );
  }

  await queryImpl(
    `INSERT INTO articles
       (slug, title, subtitle, body, type, status, cover_url, gallery_urls, location, event_start, event_end, published_at)
     VALUES ($1, $2, $3, $4, 'evento', 'published', $5, $6, $7, $8, $9, NOW())
     ON CONFLICT (slug) DO UPDATE
       SET title = EXCLUDED.title,
           subtitle = EXCLUDED.subtitle,
           body = EXCLUDED.body,
           type = 'evento',
           status = 'published',
           cover_url = EXCLUDED.cover_url,
           gallery_urls = EXCLUDED.gallery_urls,
           location = EXCLUDED.location,
           event_start = EXCLUDED.event_start,
           event_end = EXCLUDED.event_end`,
    [
      'un-natale-in-villa',
      'Natale in Villa',
      'Dicembre 2026 – Febbraio 2027 · Mercatini, laboratori, musica, famiglie, yoga e cultura',
      `La Villa Comunale di Lecce si anima da dicembre 2026 a febbraio 2027 con un calendario diffuso di eventi, cultura e intrattenimento aperto alla città, alle famiglie, ai giovani e ai visitatori.

Dicembre 2026 si apre nei fine settimana del 5–6, 12–13 e 19–20 con i Mercatini di Natale e, ogni sabato, musica live e jam session. Martedì 8 dicembre la Festa dell’Immacolata Concezione porta in Villa mercatini, musica e attività per famiglie, mentre venerdì 11 dicembre arriva lo Spettacolo con i Falchi. Dal 23 al 27 dicembre prende vita Il Villaggio di Babbo Natale con mercatini e laboratori per bambini (giovedì 24 spettacolo con i falchi, sabato 26 musica live), seguito il 28 e 29 dicembre dal Laboratorio di Cartapesta e Argilla.

Gennaio 2027 prosegue dall’1 al 3 gennaio con mercatini, laboratori di creta, spettacolo con i falchi (1 gennaio) e jam session musicali (2 gennaio); lunedì 4 e martedì 5 con il Laboratorio di Cartapesta e Argilla; mercoledì 6 gennaio per l’Epifania con mercatini e attività per le famiglie.

Febbraio 2027 accoglie Lecce Comic, l’appuntamento dedicato al fumetto, all’illustrazione, al collezionismo e alla cultura pop.

Ogni settimana in Villa: tutti i venerdì Yoga, Pilates, Holistic Yoga Walking & Yoga Bambini con Cristiana Vergari; tutte le domeniche la Passeggiata con i Pony.`,
      '/eventi/natale-in-villa/locandina-2026.jpg',
      JSON.stringify(['/eventi/natale-in-villa/programma-completo.jpg']),
      'Villa Comunale di Lecce',
      '2026-12-05',
      '2027-02-28',
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
