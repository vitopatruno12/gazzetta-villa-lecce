-- Password: admin123  (bcrypt)
INSERT INTO users (email, password_hash, name, role) VALUES
(
  'admin@testata.local',
  '$2a$10$SC9ZszdpxP6UbAYJw5tfDeMgodqUCPWcRq5R/NAVrXGn3RbjT430m',
  'Amministratore',
  'admin'
);

INSERT INTO ad_slots (code, name, description, width, height) VALUES
('header-leaderboard', 'Header leaderboard', 'Banner orizzontale sotto la testata', 970, 180),
('sidebar-home', 'Sidebar home', 'Riquadro pubblicità in colonna destra', 300, 250),
('article-below', 'Sotto articolo', 'Dopo il corpo della notizia', 728, 90),
('feed-sponsored', 'Feed sponsorizzati', 'Card native nel flusso news', NULL, NULL),
('mobile-sticky', 'Mobile sticky', 'Banner fisso in basso su mobile', 320, 50);

INSERT INTO companies (name, slug, website, city, email, logo_url) VALUES
('Bar del Parco', 'bar-del-parco', 'https://example.com/bar', 'Lecce', 'info@bardelparco.local', NULL),
('Farmacia Centro', 'farmacia-centro', 'https://example.com/farmacia', 'Lecce', 'info@farmacia.local', NULL),
('Ristorante Salento', 'ristorante-salento', 'https://example.com/ristorante', 'Lecce', 'prenota@ristorante.local', NULL),
('Le Mani in Pasta', 'le-mani-in-pasta', NULL, 'Lecce', NULL, '/pubblicita/le-mani-in-pasta.jpg'),
('Gazza Ladra', 'gazza-ladra', NULL, 'Lecce', NULL, '/pubblicita/gazza-ladra.jpg'),
('Le Mucche Volanti', 'le-mucche-volanti', NULL, 'Lecce', NULL, '/pubblicita/le-mucche-volanti.jpg'),
('Quarta Stefania · Casa Quarta', 'quarta-caffe', 'https://www.quartastore.it/', 'Lecce', NULL, '/pubblicita/quarta-stefania.png');

INSERT INTO articles (slug, title, subtitle, body, type, status, location, event_start, is_sponsored, published_at) VALUES
(
  'lecce-sotterranea-villa-comunale',
  'Lecce sotterranea: i segreti sotto la Villa Comunale',
  'Esplorazioni nei cunicoli del rifugio antiaereo',
  'Sotto il verde della Villa Comunale si cela un patrimonio storico silenzioso. Speleologi e ricercatori sono tornati a mappare i cunicoli del rifugio antiaereo, con l''obiettivo di valorizzare e, in futuro, riaprire al pubblico una pagina della memoria cittadina.',
  'notizia',
  'published',
  'Villa Comunale, Lecce',
  NULL,
  FALSE,
  NOW() - INTERVAL '2 days'
),
(
  'fontana-villa-comunale',
  'Fontana della Villa Comunale di nuovo in funzione',
  'Manutenzione e decoro nel cuore del parco',
  'La fontana monumentale torna a essere uno degli angoli più fotografati della città. L''intervento di manutenzione rientra nel piano di tutela del verde e dei beni monumentali.',
  'notizia',
  'published',
  'Villa Comunale, Lecce',
  NULL,
  FALSE,
  NOW() - INTERVAL '1 day'
),
(
  'oversound-music-festival-lecce',
  'Oversound Music Festival: tappa salentina da record',
  'Folla e luci sul grande palco a Lecce',
  'Una spianata gremita ha accolto la tappa leccese del festival. L''evento si conferma tra gli appuntamenti clou della stagione dei grandi concerti nel Salento.',
  'evento',
  'published',
  'Lecce',
  CURRENT_DATE + 12,
  FALSE,
  NOW() - INTERVAL '6 hours'
);

INSERT INTO articles (slug, title, subtitle, body, type, status, location, event_start, event_end, published_at) VALUES
(
  'jem-section-giardini-garibaldi',
  'Jem Section ai Giardini pubblici Giuseppe Garibaldi',
  'Tappe e serate dal 5 al 10 novembre',
  'Il gruppo musicale Jem Section arriva ai Giardini pubblici Giuseppe Garibaldi. Dal 5 al 10 novembre 2026 le serate si svolgono nella Villa Comunale di Lecce.

Tappe e serate
5 novembre — Giardini pubblici Giuseppe Garibaldi
6 novembre — Giardini pubblici Giuseppe Garibaldi
7 novembre — Giardini pubblici Giuseppe Garibaldi
8 novembre — Giardini pubblici Giuseppe Garibaldi
9 novembre — Giardini pubblici Giuseppe Garibaldi
10 novembre — Giardini pubblici Giuseppe Garibaldi',
  'evento',
  'published',
  'Giardini pubblici Giuseppe Garibaldi, Lecce',
  DATE '2026-11-05',
  DATE '2026-11-10',
  NOW()
);

INSERT INTO articles (slug, title, subtitle, body, type, status, cover_url, gallery_urls, published_at) VALUES
(
  'trh-this',
  'TRH This',
  'Gruppo musicale',
  'Il gruppo musicale TRH This in concerto. Chitarra, tromba, basso e batteria.',
  'evento',
  'published',
  '/eventi/trh-this/01.jpg',
  '["/eventi/trh-this/01.jpg","/eventi/trh-this/02.jpg","/eventi/trh-this/03.jpg","/eventi/trh-this/04.jpg","/eventi/trh-this/05.jpg","/eventi/trh-this/06.jpg"]',
  NOW()
);

INSERT INTO articles (slug, title, subtitle, body, type, status, cover_url, event_start, published_at) VALUES
(
  'metropolitan-trio-christmas',
  'Metropolitan Trio',
  'Christmas Edition. Giusy Colì, Paco Carrieri e Alessio Borgia · 12 dicembre',
  'Il 12 dicembre il Metropolitan Trio porta in scena la Christmas Edition. In voce Giusy Colì, alle tastiere Paco Carrieri, alla batteria Alessio Borgia.

Colì e Carrieri sono una coppia di palco del Salento. Lei è una delle voci più seguite della black music locale, dal jazz al soul e al funk. Lui sta al piano e alle tastiere, sugli arrangiamenti. Insieme hanno costruito un groove che mescola jazz contemporaneo, blues e funk. A dicembre quel sound vira sulle canzoni di Natale.',
  'evento',
  'published',
  '/eventi/metropolitan-trio/locandina.jpg',
  DATE '2026-12-12',
  NOW() - INTERVAL '3 days'
),
(
  'nitecity',
  'NiteCity',
  'Dance, pop e latino, dal vivo · 5 dicembre',
  'Il 5 dicembre suona NiteCity. Il progetto nasce da Ciki Forchetti, dj e cantante salentino, che ha riportato sul palco la sua trasmissione radiofonica Nite City.

Il repertorio pesca nella dance e nel pop dagli anni ’70 a oggi, con soul, funk e musica latina, italiana compresa. A Lecce la band è da anni un live da ballare e da cantare.',
  'evento',
  'published',
  '/eventi/nitecity/locandina.jpg',
  DATE '2026-12-05',
  NOW() - INTERVAL '3 days'
),
(
  'le-circostanze',
  'Le Circostanze',
  'La musica italiana dagli anni ’70 a oggi, dal vivo · 19 dicembre',
  'Il 19 dicembre Le Circostanze portano in live la musica italiana dagli anni ’70 a oggi. La formazione salentina è Paolo Liberti alla voce e alla chitarra, Ramona Ricchiuto alla voce, Mauro De Carlo alla chitarra, Luca Sarinelli al basso e Gianmarco Razzano alla batteria.

Il viaggio passa da Battisti e Rino Gaetano a Vanoni, e da Cremonini a Vasco. Canzoni che il pubblico conosce a memoria, restituite da una band che le suona dal vivo.',
  'evento',
  'published',
  '/eventi/le-circostanze/locandina.jpg',
  DATE '2026-12-19',
  NOW() - INTERVAL '3 days'
),
(
  'the-dytt',
  'The Dytt',
  'La Jam del Caffè del Teatro · 13 novembre, ore 22.00',
  'Il 13 novembre, alle 22, The Dytt sale sul palco del Caffè del Teatro per La Jam del Caffè del Teatro. Sul palco Leo Gaballo, Alessio Vergari, Giorgio Campiti, Francesco Perrone e Filippo Trinchera.

The Dytt propone un viaggio nel rock ’n’ roll, nel blues, nel funk e nel soul, con grandi classici della musica italiana e internazionale. Lo spettacolo alterna atmosfere blues e sonorità raffinate a ritmi funky, groove e momenti di puro rock ’n’ roll.

La scaletta passa dai Beatles ai Police, da Bill Withers a Stevie Ray Vaughan, e ancora da John Mayer a Prince, Oasis, Daft Punk e Red Hot Chili Peppers. Dalla musica italiana arrivano Pino Daniele, Jovanotti, Neffa e Alex Britti.',
  'evento',
  'published',
  '/eventi/the-dytt/locandina.jpg',
  DATE '2026-11-13',
  NOW() - INTERVAL '3 days'
),
(
  'cristiana-vergari-yoga-villa-comunale',
  'Cristiana Vergari | Yoga, Pilates, Holistic Yoga Walking & Yoga Bambini',
  'Tutti i venerdì in Villa Comunale · Benessere, movimento e Yoga Bambini Educational',
  'Ciao, sono Cristiana Vergari, insegnante di Yoga e Pilates, da oltre 23 anni nel mondo del benessere e del movimento.

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
Instagram: https://www.instagram.com/cristianavergari_academy?exln=MXBqdjFpdzg5ODE1Yw%3D%3D&utm_source=qr',
  'evento',
  'published',
  '/eventi/yoga-cristiana-vergari/cover.jpg',
  NULL,
  NOW() - INTERVAL '2 days'
),
(
  'un-natale-in-villa',
  'Natale in Villa',
  'Dicembre 2026 – Febbraio 2027 · Mercatini, laboratori, musica, famiglie, yoga e cultura',
  'La Villa Comunale di Lecce si anima da dicembre 2026 a febbraio 2027 con un calendario diffuso di eventi, cultura e intrattenimento aperto alla città, alle famiglie, ai giovani e ai visitatori.

Dicembre 2026 si apre nei fine settimana del 5–6, 12–13 e 19–20 con i Mercatini di Natale e, ogni sabato, musica live e jam session. Martedì 8 dicembre la Festa dell’Immacolata Concezione porta in Villa mercatini, musica e attività per famiglie, mentre venerdì 11 dicembre arriva lo Spettacolo con i Falchi. Dal 23 al 27 dicembre prende vita Il Villaggio di Babbo Natale con mercatini e laboratori per bambini (giovedì 24 spettacolo con i falchi, sabato 26 musica live), seguito il 28 e 29 dicembre dal Laboratorio di Cartapesta e Argilla.

Gennaio 2027 prosegue dall’1 al 3 gennaio con mercatini, laboratori di creta, spettacolo con i falchi (1 gennaio) e jam session musicali (2 gennaio); lunedì 4 e martedì 5 con il Laboratorio di Cartapesta e Argilla; mercoledì 6 gennaio per l’Epifania con mercatini e attività per le famiglie.

Febbraio 2027 accoglie Lecce Comic, l’appuntamento dedicato al fumetto, all’illustrazione, al collezionismo e alla cultura pop.

Ogni settimana in Villa: tutti i venerdì Yoga, Pilates, Holistic Yoga Walking & Yoga Bambini con Cristiana Vergari; tutte le domeniche la Passeggiata con i Pony.',
  'evento',
  'published',
  '/eventi/natale-in-villa/locandina-natale-2026.jpg',
  DATE '2026-12-05',
  NOW()
);

-- Campagna attiva + creatività di esempio
INSERT INTO ad_campaigns (company_id, name, status, starts_at, ends_at, priority)
SELECT id, 'Autunno al Bar del Parco', 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', 10
FROM companies WHERE slug = 'bar-del-parco';

INSERT INTO ad_creatives (campaign_id, slot_id, title, image_url, click_url, kind, active)
SELECT c.id, s.id,
  'Colazione e aperitivo al Bar del Parco',
  NULL,
  'https://example.com/bar',
  'banner',
  TRUE
FROM ad_campaigns c
JOIN companies co ON co.id = c.company_id
JOIN ad_slots s ON s.code = 'sidebar-home'
WHERE co.slug = 'bar-del-parco';

INSERT INTO ad_creatives (campaign_id, slot_id, title, html_body, click_url, kind, active)
SELECT c.id, s.id,
  'Partner locale: Bar del Parco',
  'Dal mattino all''aperitivo, un punto di ritrovo a due passi dalla Villa.',
  'https://example.com/bar',
  'sponsored_post',
  TRUE
FROM ad_campaigns c
JOIN companies co ON co.id = c.company_id
JOIN ad_slots s ON s.code = 'feed-sponsored'
WHERE co.slug = 'bar-del-parco';

-- Banner società rotanti nel riquadro sidebar
INSERT INTO ad_campaigns (company_id, name, status, starts_at, ends_at, priority)
SELECT id, 'Display · Quarta Caffè', 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 20
FROM companies WHERE slug = 'quarta-caffe';

INSERT INTO ad_campaigns (company_id, name, status, starts_at, ends_at, priority)
SELECT id, 'Display · Le Mani in Pasta', 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 18
FROM companies WHERE slug = 'le-mani-in-pasta';

INSERT INTO ad_campaigns (company_id, name, status, starts_at, ends_at, priority)
SELECT id, 'Display · Gazza Ladra', 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 16
FROM companies WHERE slug = 'gazza-ladra';

INSERT INTO ad_campaigns (company_id, name, status, starts_at, ends_at, priority)
SELECT id, 'Display · Le Mucche Volanti', 'active', NOW() - INTERVAL '1 day', NOW() + INTERVAL '90 days', 14
FROM companies WHERE slug = 'le-mucche-volanti';

INSERT INTO ad_creatives (campaign_id, slot_id, title, image_url, click_url, kind, active)
SELECT c.id, s.id, 'Quarta Caffè', '/pubblicita/quarta-caffe.png', '/sponsor', 'banner', TRUE
FROM ad_campaigns c
JOIN companies co ON co.id = c.company_id
JOIN ad_slots s ON s.code = 'sidebar-home'
WHERE co.slug = 'quarta-caffe' AND c.name = 'Display · Quarta Caffè';

INSERT INTO ad_creatives (campaign_id, slot_id, title, image_url, click_url, kind, active)
SELECT c.id, s.id, 'Le Mani in Pasta', '/pubblicita/le-mani-in-pasta.jpg', '/sponsor', 'banner', TRUE
FROM ad_campaigns c
JOIN companies co ON co.id = c.company_id
JOIN ad_slots s ON s.code = 'sidebar-home'
WHERE co.slug = 'le-mani-in-pasta' AND c.name = 'Display · Le Mani in Pasta';

INSERT INTO ad_creatives (campaign_id, slot_id, title, image_url, click_url, kind, active)
SELECT c.id, s.id, 'Gazza Ladra', '/pubblicita/gazza-ladra.jpg', '/sponsor', 'banner', TRUE
FROM ad_campaigns c
JOIN companies co ON co.id = c.company_id
JOIN ad_slots s ON s.code = 'sidebar-home'
WHERE co.slug = 'gazza-ladra' AND c.name = 'Display · Gazza Ladra';

INSERT INTO ad_creatives (campaign_id, slot_id, title, image_url, click_url, kind, active)
SELECT c.id, s.id, 'Le Mucche Volanti', '/pubblicita/le-mucche-volanti.jpg', '/sponsor', 'banner', TRUE
FROM ad_campaigns c
JOIN companies co ON co.id = c.company_id
JOIN ad_slots s ON s.code = 'sidebar-home'
WHERE co.slug = 'le-mucche-volanti' AND c.name = 'Display · Le Mucche Volanti';
