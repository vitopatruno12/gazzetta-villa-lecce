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
  ['le-mani-in-pasta', 'Le Mani in Pasta', '/pubblicita/le-mani-in-pasta.jpg', null],
  ['gazza-ladra', 'Gazza Ladra', '/pubblicita/gazza-ladra.jpg', null],
  ['le-mucche-volanti', 'Le Mucche Volanti', '/pubblicita/le-mucche-volanti.jpg', null],
  ['quarta-caffe', 'Quarta Stefania · Casa Quarta', '/pubblicita/quarta-stefania.png', 'https://www.quartastore.it/'],
  ['cristiana-vergari-academy', 'Cristiana Vergari Academy', '/pubblicita/cristiana-vergari-academy.png', 'https://www.cristianavergari.com/'],
];

async function ensureCompanyLogos() {
  for (const [slug, name, logo, website] of SPONSOR_LOGOS) {
    await queryImpl(
      `INSERT INTO companies (name, slug, logo_url, website, city)
       VALUES ($1, $2, $3, $4, 'Lecce')
       ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name,
             logo_url = EXCLUDED.logo_url,
             website = COALESCE(EXCLUDED.website, companies.website)`,
      [name, slug, logo, website]
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
  await ensureDisplayAdSlots();
}

const DISPLAY_AD_SLOTS = [
  ['sidebar-home', 'Sidebar home', 'Riquadro pubblicità in colonna destra', 300, 250],
];

const DISPLAY_AD_CREATIVES = [
  {
    company: 'quarta-caffe',
    campaign: 'Display · Quarta Stefania',
    priority: 20,
    slots: [
      [
        'sidebar-home',
        'Quarta Stefania · Casa Quarta',
        '/pubblicita/quarta-stefania.png',
        '/articolo/stefania-quarta-casa-quarta',
      ],
    ],
  },
  {
    company: 'cristiana-vergari-academy',
    campaign: 'Display · Cristiana Vergari Academy',
    priority: 19,
    slots: [
      [
        'sidebar-home',
        'Cristiana Vergari Academy',
        '/pubblicita/cristiana-vergari-academy.png',
        '/articolo/cristiana-vergari-yoga-villa-comunale',
      ],
    ],
  },
  {
    company: 'le-mani-in-pasta',
    campaign: 'Display · Le Mani in Pasta',
    priority: 18,
    slots: [['sidebar-home', 'Le Mani in Pasta', '/pubblicita/le-mani-in-pasta.jpg', '/sponsor']],
  },
  {
    company: 'gazza-ladra',
    campaign: 'Display · Gazza Ladra',
    priority: 16,
    slots: [['sidebar-home', 'Gazza Ladra', '/pubblicita/gazza-ladra.jpg', '/sponsor']],
  },
  {
    company: 'le-mucche-volanti',
    campaign: 'Display · Le Mucche Volanti',
    priority: 14,
    slots: [['sidebar-home', 'Le Mucche Volanti', '/pubblicita/le-mucche-volanti.jpg', '/sponsor']],
  },
];

async function ensureDisplayAdSlots() {
  for (const [code, name, description, width, height] of DISPLAY_AD_SLOTS) {
    await queryImpl(
      `INSERT INTO ad_slots (code, name, description, width, height)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (code) DO UPDATE
         SET name = EXCLUDED.name,
             description = EXCLUDED.description,
             width = EXCLUDED.width,
             height = EXCLUDED.height`,
      [code, name, description, width, height]
    );
  }

  await queryImpl(
    `UPDATE ad_creatives cr
     SET active = FALSE
     FROM ad_slots s
     WHERE cr.slot_id = s.id
       AND s.code IN ('skyscraper-left', 'skyscraper-right', 'header-leaderboard')`
  );
  await queryImpl(
    `UPDATE ad_creatives
     SET active = FALSE
     WHERE image_url LIKE '/pubblicita/banner-side-%.svg'
        OR image_url LIKE '/pubblicita/banner-sky-%.svg'
        OR image_url LIKE '/pubblicita/banner-leader-%.svg'
        OR image_url = '/pubblicita/quarta-caffe.png'`
  );
  await queryImpl(
    `UPDATE ad_creatives cr
     SET active = FALSE
     FROM ad_slots s, ad_campaigns ca, companies co
     WHERE cr.slot_id = s.id
       AND cr.campaign_id = ca.id
       AND ca.company_id = co.id
       AND s.code = 'sidebar-home'
       AND co.slug = 'bar-del-parco'`
  );

  for (const item of DISPLAY_AD_CREATIVES) {
    const company = await queryImpl('SELECT id FROM companies WHERE slug = $1', [item.company]);
    if (!company.rows.length) continue;
    const companyId = company.rows[0].id;

    let campaign = await queryImpl(
      `SELECT id FROM ad_campaigns WHERE company_id = $1 AND name = $2 LIMIT 1`,
      [companyId, item.campaign]
    );
    if (!campaign.rows.length) {
      campaign = await queryImpl(
        `INSERT INTO ad_campaigns (company_id, name, status, starts_at, ends_at, priority)
         VALUES ($1, $2, 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', $3)
         RETURNING id`,
        [companyId, item.campaign, item.priority]
      );
    } else {
      await queryImpl(
        `UPDATE ad_campaigns
         SET status = 'active', priority = $2, ends_at = NOW() + INTERVAL '90 days'
         WHERE id = $1`,
        [campaign.rows[0].id, item.priority]
      );
    }
    const campaignId = campaign.rows[0].id;

    for (const [slotCode, title, image, clickUrl] of item.slots) {
      const slot = await queryImpl('SELECT id FROM ad_slots WHERE code = $1', [slotCode]);
      if (!slot.rows.length) continue;
      const existing = await queryImpl(
        `SELECT id FROM ad_creatives
         WHERE campaign_id = $1 AND slot_id = $2 AND image_url = $3
         LIMIT 1`,
        [campaignId, slot.rows[0].id, image]
      );
      if (existing.rows.length) {
        await queryImpl(
          `UPDATE ad_creatives SET active = TRUE, title = $2, click_url = $3 WHERE id = $1`,
          [existing.rows[0].id, title, clickUrl || '/sponsor']
        );
        continue;
      }
      await queryImpl(
        `INSERT INTO ad_creatives
           (campaign_id, slot_id, title, image_url, click_url, kind, active)
         VALUES ($1, $2, $3, $4, $5, 'banner', TRUE)`,
        [campaignId, slot.rows[0].id, title, image, clickUrl || '/sponsor']
      );
    }
  }
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
      'Gruppo musicale · Chitarra, tromba, basso e batteria dal vivo',
      `Il gruppo musicale TRH This porta sul palco un dialogo serrato tra chitarra, tromba, basso e batteria, costruendo un suono strumentale e contemporaneo capace di alternare improvvisazione, dinamica ritmica e melodie avvolgenti.

L’intreccio tra il timbro caldo dei fiati e la spinta della sezione ritmica accompagna il pubblico in un percorso sonoro pensato per essere vissuto dal vivo, all’aperto, tra ascolto attento, energia condivisa e atmosfere che uniscono ricerca musicale e immediatezza espressiva.`,
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
    body: `Sabato 12 dicembre il Metropolitan Trio porta in scena la speciale Christmas Edition nell’ambito degli appuntamenti musicali del periodo natalizio. Sul palco Giusy Colì alla voce, Paco Carrieri al pianoforte e alle tastiere, e Alessio Borgia alla batteria.

Giusy Colì e Paco Carrieri formano da anni un sodalizio artistico consolidato nella scena salentina: lei è una delle interpreti più apprezzate della black music del territorio, capace di muoversi con naturalezza tra jazz, soul, blues e funk; lui cura gli arrangiamenti e l’architettura armonica alle tastiere.

Con la spinta ritmica di Alessio Borgia alla batteria, il trio rilegge i brani simbolo della tradizione natalizia internazionale insieme a pagine scelte del repertorio soul e jazz contemporaneo, avvolgendo il pubblico in un’atmosfera calda, intima e luminosa nel pieno delle festività dicembrine.`,
    cover: '/eventi/metropolitan-trio/locandina.jpg',
    start: '2026-12-12',
  },
  {
    slug: 'nitecity',
    title: 'NiteCity',
    subtitle: 'Dance, pop e latino, dal vivo · 5 dicembre',
    body: `Sabato 5 dicembre inaugura il calendario musicale di dicembre NiteCity, il progetto nato dall’idea di Ciki Forchetti, dj e cantante salentino che ha trasformato il ritmo e lo spirito della sua storica trasmissione radiofonica Nite City in uno spettacolo dal vivo ad alta energia.

La scaletta attraversa cinquant’anni di grande musica da ballare e da cantare insieme: dai classici intramontabili della dance e della disco anni ’70 e ’80 fino al pop contemporaneo, intrecciando soul, funk e sonorità latine e italiane dal forte impatto ritmico.

Conosciuta e seguita in tutto il Salento per il coinvolgimento diretto del pubblico, la band trasforma ogni appuntamento in una vera festa collettiva a cielo aperto, ideale per aprire il primo fine settimana natalizio tra musica, luci e condivisione.`,
    cover: '/eventi/nitecity/locandina.jpg',
    start: '2026-12-05',
  },
  {
    slug: 'le-circostanze',
    title: 'Le Circostanze',
    subtitle: 'La musica italiana dagli anni ’70 a oggi, dal vivo · 19 dicembre',
    body: `Sabato 19 dicembre Le Circostanze portano dal vivo un ampio e appassionato tributo alla canzone d’autore e al pop-rock italiano dagli anni ’70 fino ai giorni nostri. Sul palco la formazione salentina composta da Paolo Liberti alla voce e chitarra, Ramona Ricchiuto alla voce, Mauro De Carlo alla chitarra, Luca Sarinelli al basso e Gianmarco Razzano alla batteria.

Il concerto ripercorre melodie e parole entrate nella memoria collettiva di più generazioni: dall’intensità senza tempo di Lucio Battisti e Ornella Vanoni all’ironia graffiante di Rino Gaetano, passando per le atmosfere di Cesare Cremonini, l’energia rock di Vasco Rossi e molti altri grandi interpreti italiani.

L’intreccio delle due voci soliste e una sezione strumentale affiatata restituiscono nuova freschezza a ogni brano, regalando al pubblico del sabato prenatalizio una serata tutta da cantare dal vivo.`,
    cover: '/eventi/le-circostanze/locandina.jpg',
    start: '2026-12-19',
  },
  {
    slug: 'the-dytt',
    title: 'The Dytt',
    subtitle: 'La Jam del Caffè del Teatro · 13 novembre, ore 22.00',
    body: `Il 13 novembre, alle ore 22.00, The Dytt sale sul palco del Caffè del Teatro per l’appuntamento con La Jam del Caffè del Teatro. Protagonisti della serata Leo Gaballo, Alessio Vergari, Giorgio Campiti, Francesco Perrone e Filippo Trinchera, cinque musicisti affiatati uniti dal gusto per l’interplay dal vivo, l’improvvisazione e il suono caldo degli strumenti.

The Dytt propone un viaggio sonoro avvincente nel rock ’n’ roll, nel blues, nel funk e nel soul, rileggendo con carattere grandi classici della musica internazionale e italiana. Lo spettacolo alterna atmosfere blues avvolgenti e sonorità ricercate a ritmi funky serrati, groove trascinanti e momenti di puro rock ’n’ roll.

La scaletta attraversa decenni di grande musica passando dai Beatles ai Police, da Bill Withers a Stevie Ray Vaughan, fino a John Mayer, Prince, Oasis, Daft Punk e Red Hot Chili Peppers. Sul versante italiano trovano spazio l’anima mediterranea e blues di Pino Daniele insieme a Jovanotti, Neffa e Alex Britti, in un live dinamico pensato per chi ama la musica suonata dal vivo.`,
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
    slug: 'stefania-quarta-casa-quarta',
    title: 'Quarta Store è Stefania Quarta · Casa Quarta',
    subtitle: 'Un’esperienza fatta di passione che nasce nel 1943 · Tradizione, creatività e concept store',
    body: `Quarta Store è Stefania Quarta
Un’esperienza fatta di passione che nasce nel 1943

La mia esperienza è l’esperienza di mio padre e prima ancora dei miei nonni. È il ricordo degli insegnamenti ereditati. Tra questi la cura nella selezione dei prodotti dai sapori autentici e l’attenzione speciale verso il cliente.

Quarta Store è l’unione tra il gusto autentico della tradizione e il potere della creatività.

La tradizione è quella tramandata da padre in figlia, fatta di passione nella selezione di sapori autentici e dedizione al cliente.

La creatività è nella scelta di non far mancare mai quei sapori da nessuna casa dotandosi degli strumenti di comunicazione più innovativi e dei mezzi di consegna più efficienti. Ma anche nella sapiente selezione di ceramiche, porcellane, tessuti, vetri e latte per completare la soddisfazione di una confezione fatta a regola d’arte.

In una delicata armonia tra passato e presente è racchiuso il segreto di un’azienda che ogni giorno coccola i propri clienti sparsi nel mondo, solleticandone anche i palati più esigenti e raffinati. Un’azienda che negli anni si è specializzata nella spedizione di prodotti d’eccellenza divenendo punto di riferimento per la passione e l’affidabilità con cui lavora.

Link Quarta Store
Sito web: www.quartastore.it
Facebook: https://www.facebook.com/QuartaStore/
Instagram: https://www.instagram.com/quartastore/

Casa Quarta

Casa Quarta è un nuovo concept store che ha la pretesa di essere unico ed inimitabile perché nasce dall’esigenza di soddisfare una richiesta sempre più evidente: un luogo in cui sentirsi a casa e dove si restituisca leggerezza e “joie de vivre”.

Alla nostra gamma di prodotti si aggiunge la possibilità di degustarli in spazi accoglienti e curati nei dettagli.

Dalla più classica tazzina di espresso alla cioccolata calda fondente passando per la nostra amatissima offerta di tea e tisane accompagnate dai nostri biscottini, tutto parla di autenticità e sapori veri.

A Casa Quarta troverete torte, muffin e colazioni salate per i più esigenti ma non solo: aperitivi a buffet, coppe gelato e yogurt con frutta serviti da uno staff sorridente ed accogliente.

Casa Quarta è gioco che si declina in cambi di abbigliamento del personale che seguono i diversi momenti della giornata con un unico obiettivo: restituire stupore e meraviglia.

Link Casa Quarta
Sito web: https://www.quartastore.it/casa-quarta/
Facebook: https://www.facebook.com/CasaQuarta/
Instagram: https://www.instagram.com/casaquartastore/`,
    cover: '/eventi/quarta-stefania/logo.png',
    gallery: null,
    start: null,
    end: null,
    location: 'Lecce · Quarta Store & Casa Quarta',
  },
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
    title: 'Mercatini dell’Artigianato Salentino · Diciottesimomeridiano APS',
    subtitle: '5–6, 8, 12–13, 19–20, 23–27 dicembre 2026 · 1–3 e 6 gennaio 2027 · Vero fatto a mano salentino',
    body: `I Mercatini dell’Artigianato Salentino animano i viali alberati della Villa Comunale di Lecce nell’ambito di Natale in Villa, a cura dell’Associazione Culturale Diciottesimomeridiano APS, realtà impegnata da anni nella valorizzazione della cultura, delle arti manuali, delle mostre e delle tradizioni identitarie del Salento.

Il percorso espositivo nasce per celebrare il vero “fatto a mano” locale e restituire centralità al lavoro paziente delle botteghe, lontano dalla grande produzione standardizzata: lungo gli stand maestri artigiani e creativi del territorio presentano pezzi unici realizzati interamente a mano — sculture e manufatti in pietra leccese, opere in cartapesta, ceramiche e terrecotte dipinte, lavorazioni in legno, vetro e rame, cucito creativo, tessuti, pelletteria e preziosi merletti dell’antica arte del tombolo — offrendo a famiglie, cittadini e visitatori idee regalo autentiche e atmosfere natalizie da vivere passeggiando nel parco.

Date in calendario in Villa Comunale:
• 5 – 6 dicembre 2026
• 8 dicembre 2026 (Festa dell’Immacolata Concezione)
• 12 – 13 dicembre 2026
• 19 – 20 dicembre 2026
• 23 – 24 – 25 – 26 – 27 dicembre 2026 (con Il Villaggio di Babbo Natale)
• 1 – 2 – 3 gennaio 2027 (con laboratori di creta e jam session)
• 6 gennaio 2027 (Epifania, con attività per le famiglie)

Riferimenti e canali ufficiali Diciottesimomeridiano
Sito web: https://www.diciottesimomeridiano.it/
Facebook: https://www.facebook.com/Diciottesimomeridiano/`,
    cover: '/eventi/mercatini-artigianato/logo-mercatini.jpg',
    gallery: JSON.stringify(['/eventi/natale-in-villa/schede/mercatini-natale.jpg']),
    start: '2026-12-05',
    end: '2027-01-06',
    location: 'Villa Comunale di Lecce',
  },
  {
    slug: 'festa-immacolata-villa-comunale',
    title: 'Festa dell’Immacolata Concezione',
    subtitle: '8 dicembre 2026 · Tradizione, mercatini, musica e famiglie',
    body: `Martedì 8 dicembre 2026 la Villa Comunale di Lecce inaugura il cuore tradizionale delle festività con la giornata dedicata alla Festa dell’Immacolata Concezione: un appuntamento pensato per riunire generazioni diverse nel parco storico cittadino, tra il calore delle usanze salentine, la passeggiata tra gli alberi illuminati e la riscoperta dello stare insieme.

Per l’intera giornata i viali dei Giardini pubblici Giuseppe Garibaldi si animano con gli stand dei Mercatini di Natale e dell’artigianato locale, accompagnati da momenti musicali, intrattenimento diffuso e iniziative dedicate ai bambini e alle famiglie, trasformando la Villa in una piazza verde accogliente e festosa.

In programma:
• Mercatini di Natale e dell’artigianato lungo i viali della Villa
• Momenti di musica dal vivo e intrattenimento nel parco
• Attività ricreative e spazi dedicati a famiglie e bambini`,
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
    body: `Dal 23 al 27 dicembre 2026 il cuore della Villa Comunale di Lecce si trasforma ne Il Villaggio di Babbo Natale: cinque giornate consecutive interamente dedicate allo stupore dei più piccoli, ai racconti natalizi e alla serenità delle famiglie nei giorni più attesi dell’anno.

Tra luminarie, allestimenti a tema e i profumi dei mercatini natalizi, i bambini possono vivere l’emozione dell’incontro dal vivo con Babbo Natale, partecipare a laboratori creativi e manuali pensati per stimolare fantasia e condivisione, e assistere agli appuntamenti speciali nel parco, con l’incontro ravvicinato con i rapaci nella vigilia del 24 dicembre e la musica dal vivo di Santo Stefano il 26 dicembre.

In programma:
• Incontro con Babbo Natale e spazi fotografici per i bambini
• Attività ludiche, letture animate e intrattenimento per famiglie
• Laboratori creativi e manuali di Natale
• Musica e appuntamenti speciali (24 dicembre Rapaci in Villa · 26 dicembre Musica Live e Jam Session)`,
    cover: '/eventi/natale-in-villa/schede/villaggio-babbo-natale.jpg',
    gallery: null,
    start: '2026-12-23',
    end: '2026-12-27',
    location: 'Villa Comunale di Lecce',
  },
  {
    slug: 'laboratorio-cartapesta-e-argilla',
    title: 'Villa Lab · Piccole mani, grandi meraviglie — Laboratori Creativi per Bambini',
    subtitle: 'Cartapesta, terracotta, argilla, creta e tanta fantasia · Dicembre 2026 e Gennaio 2027',
    body: `Villa Lab – Piccole mani, grandi meraviglie porta nella Villa Comunale di Lecce il fascino senza tempo delle botteghe artigiane salentine tradotto a misura di bambino: uno spazio accogliente dove giocare, creare e immaginare mettendo letteralmente le mani nella materia, tra cartapesta leccese, terracotta, argilla, creta, colori e tanta fantasia.

Accompagnati passo dopo passo nelle attività manuali, bambini e ragazzi scoprono come da materiali semplici e naturali — acqua, carta, colla e terra — possano nascere forme, personaggi natalizi e piccoli manufatti da portare a casa come ricordo vivo dell’esperienza. Un percorso educativo e divertente che unisce manualità, espressione artistica e amore per la tradizione storica di Lecce.

Appuntamenti in calendario:
• Dicembre in Villa Comunale: laboratori creativi per bambini di cartapesta e terracotta (inclusi i giorni 23–27 dicembre nel Villaggio di Babbo Natale)
• 28 – 29 dicembre 2026: Laboratorio dedicato di Cartapesta e Argilla
• 1 – 3 gennaio 2027: Creatività e musica per il nuovo anno — laboratori di modellazione e costruzione con la creta e attività manuali
• 4 – 5 gennaio 2027: Laboratorio di Cartapesta e Argilla aspettando l’Epifania`,
    cover: '/eventi/villa-lab/locandina.jpg',
    gallery: JSON.stringify([
      '/eventi/natale-in-villa/schede/cartapesta-argilla.jpg',
      '/eventi/natale-in-villa/schede/creativita-nuovo-anno.jpg',
    ]),
    start: '2026-12-28',
    end: '2027-01-05',
    location: 'Villa Comunale di Lecce',
  },
  {
    slug: 'passeggiata-con-i-pony',
    title: 'Passeggiata con i Pony',
    subtitle: 'Tutte le domeniche · Un’esperienza speciale nel parco per i più piccoli',
    body: `Tutte le domeniche la Villa Comunale di Lecce rinnova uno degli appuntamenti più amati dalle famiglie e dai bambini: la Passeggiata con i Pony lungo i viali alberati dei Giardini pubblici Giuseppe Garibaldi, pensata per avvicinare i più piccoli al contatto dolce e rispettoso con gli animali.

Accompagnati in ogni passo da personale esperto e qualificato, i bambini vivono l’emozione di un giro in sella nel verde del parco in totale tranquillità e sicurezza, trasformando la domenica mattina o il pomeriggio in Villa in un ricordo speciale da condividere con tutta la famiglia.

• Passeggiate nel parco a misura di bambino lungo i viali della Villa
• Accompagnamento costante da parte di personale qualificato
• Un’esperienza educativa all’aria aperta dedicata a tutta la famiglia`,
    cover: '/eventi/natale-in-villa/schede/passeggiata-pony.jpg',
    gallery: null,
    start: null,
    end: null,
    location: 'Villa Comunale di Lecce · Tutte le domeniche',
  },
  {
    slug: 'spettacolo-con-i-falchi',
    title: 'Educazione Ambientale e Spettacolo con i Rapaci · Yuna Lucky Owl',
    subtitle: '11 e 24 dicembre 2026 · 1 gennaio 2027 · Aquila delle steppe, Gufo bengalese e Falco pellegrino',
    body: `Nella cornice della Villa Comunale di Lecce arriva l’appuntamento dedicato all’educazione ambientale con rapaci in presenza, curato sul territorio tra attività didattiche, eventi e rievocazioni storiche con Federico Quarta e il progetto salentino Yuna Lucky Owl, già raccontato anche dalle cronache per gli incontri ravvicinati dedicati a famiglie, bambini e scuole.

Durante le giornate in programma i visitatori potranno osservare da vicino tre straordinari esemplari — l’Aquila delle steppe (Aquila nipalensis), il Gufo bengalese (Bubo bengalensis) con la celebre Yuna e il Falco pellegrino (Falco peregrinus) — scoprendo le caratteristiche del volo, la biologia diurna e notturna e il ruolo insostituibile che i rapaci svolgono per la salute e l’equilibrio dell’ecosistema naturale.

Cosa prevede l’incontro in Villa:
• Sessioni didattiche interattive con osservazioni guidate da vicino
• Esposizione di materiale, attrezzature tradizionali e libri dedicati ai rapaci e all’arte della falconeria (riconosciuta Patrimonio culturale immateriale dell’umanità UNESCO)
• Approfondimenti divulgativi sulla tutela della biodiversità e sul rispetto della fauna selvatica
• Possibilità per bambini, famiglie e visitatori di scattare foto ricordo insieme ai rapaci

Date in calendario:
• Venerdì 11 dicembre 2026
• Giovedì 24 dicembre 2026
• Venerdì 1 gennaio 2027

Riferimenti e foto social
Instagram (@yuna.lucky.owl): https://www.instagram.com/yuna.lucky.owl`,
    cover: '/eventi/spettacolo-falchi/falco-pellegrino.jpg',
    gallery: JSON.stringify([
      '/eventi/spettacolo-falchi/aquila.jpg',
      '/eventi/spettacolo-falchi/gufo-reale.jpg',
      '/eventi/natale-in-villa/schede/spettacolo-falchi.jpg',
    ]),
    start: '2026-12-11',
    end: '2027-01-01',
    location: 'Villa Comunale di Lecce',
  },
  {
    slug: 'musica-live-e-jam-session',
    title: 'Musica Live e Jam Session in Villa',
    subtitle: '5, 12, 19 e 26 dicembre 2026 · 2 gennaio 2027 · Palcoscenico a cielo aperto',
    body: `Per tutto il calendario delle festività la Villa Comunale di Lecce si trasforma in un vero palcoscenico a cielo aperto dedicato alla musica suonata dal vivo, all’incontro tra musicisti salentini, band affermate e giovani talenti del territorio.

Ogni sabato in programma alterna i concerti principali — dal groove dance e pop di NiteCity alle atmosfere soul-jazz natalizie del Metropolitan Trio, fino al grande cantautorato italiano de Le Circostanze — a momenti di jam session aperta, in cui l’energia dell’improvvisazione e della condivisione musicale accompagna la passeggiata tra i mercatini e gli spazi del parco.

Date in programma:
• Sabato 5 dicembre 2026 (con NiteCity e jam session)
• Sabato 12 dicembre 2026 (con Metropolitan Trio – Christmas Edition)
• Sabato 19 dicembre 2026 (con Le Circostanze)
• Sabato 26 dicembre 2026 (Santo Stefano in musica)
• Sabato 2 gennaio 2027 (Jam session di inizio anno)`,
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
    body: `A febbraio 2027 la programmazione invernale della Villa Comunale di Lecce culmina con Lecce Comic, l’appuntamento interamente dedicato all’universo del fumetto, dell’illustrazione d’autore, del gioco e della creatività contemporanea, pensato per coinvolgere giovani, appassionati, scuole e famiglie.

I viali e gli spazi del parco ospiteranno incontri dal vivo con fumettisti e illustratori, esposizioni di tavole originali, workshop di disegno e narrazione visiva, insieme a stand tematici dedicati all’editoria indipendente, al collezionismo, alla cultura pop e al gaming, confermando la vocazione culturale e intergenerazionale della nuova Villa Comunale.

In programma:
• Incontri, talk e sessioni di dediche con autori e illustratori
• Mostre espositive e laboratori pratici di disegno e fumetto
• Stand tematici, fumetterie e spazi per il collezionismo
• Aree dedicate alla cultura pop, all’animazione e al gaming`,
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
