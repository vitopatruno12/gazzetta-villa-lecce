-- Password: admin123  (bcrypt)
INSERT INTO users (email, password_hash, name, role) VALUES
(
  'admin@testata.local',
  '$2a$10$SC9ZszdpxP6UbAYJw5tfDeMgodqUCPWcRq5R/NAVrXGn3RbjT430m',
  'Amministratore',
  'admin'
);

INSERT INTO ad_slots (code, name, description, width, height) VALUES
('header-leaderboard', 'Header leaderboard', 'Banner orizzontale sotto la testata', 728, 90),
('sidebar-home', 'Sidebar home', 'Colonna destra homepage', 300, 250),
('article-below', 'Sotto articolo', 'Dopo il corpo della notizia', 728, 90),
('feed-sponsored', 'Feed sponsorizzati', 'Card native nel flusso news', NULL, NULL),
('mobile-sticky', 'Mobile sticky', 'Banner fisso in basso su mobile', 320, 50);

INSERT INTO companies (name, slug, website, city, email, logo_url) VALUES
('Bar del Parco', 'bar-del-parco', 'https://example.com/bar', 'Lecce', 'info@bardelparco.local', NULL),
('Farmacia Centro', 'farmacia-centro', 'https://example.com/farmacia', 'Lecce', 'info@farmacia.local', NULL),
('Ristorante Salento', 'ristorante-salento', 'https://example.com/ristorante', 'Lecce', 'prenota@ristorante.local', NULL),
('Le Mani in Pasta', 'le-mani-in-pasta', NULL, 'Lecce', NULL, '/pubblicita/le-mani-in-pasta.jpg'),
('Gazza Ladra', 'gazza-ladra', NULL, 'Lecce', NULL, '/pubblicita/gazza-ladra.jpg'),
('Le Mucche Volanti', 'le-mucche-volanti', NULL, 'Lecce', NULL, '/pubblicita/le-mucche-volanti.jpg');

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
