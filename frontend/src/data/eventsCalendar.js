export const EVENT_CATEGORIES = [
  { id: 'tutti', label: 'Tutte le categorie', shortLabel: 'Tutti gli eventi' },
  { id: 'yoga', label: 'Yoga, Pilates & Benessere', shortLabel: 'Yoga & Benessere' },
  { id: 'mercatini', label: 'Mercatini di Natale', shortLabel: 'Mercatini' },
  { id: 'laboratori', label: 'Laboratori Creativi', shortLabel: 'Laboratori' },
  { id: 'musica', label: 'Musica Live & Concerti', shortLabel: 'Musica & Live' },
  { id: 'famiglie', label: 'Famiglie, Bambini & Natura', shortLabel: 'Famiglie & Natura' },
  { id: 'cultura', label: 'Cultura & Fumetto (Lecce Comic)', shortLabel: 'Cultura & Fumetto' },
];

export const SLUG_CATEGORIES = {
  'un-natale-in-villa': ['mercatini', 'laboratori', 'musica', 'famiglie', 'yoga', 'cultura'],
  'stefania-quarta-casa-quarta': ['mercatini', 'cultura', 'famiglie'],
  'cristiana-vergari-yoga-villa-comunale': ['yoga', 'famiglie'],
  'mercatini-di-natale-in-villa': ['mercatini', 'famiglie'],
  'festa-immacolata-villa-comunale': ['mercatini', 'famiglie', 'musica'],
  'villaggio-di-babbo-natale': ['famiglie', 'mercatini', 'laboratori', 'musica'],
  'laboratorio-cartapesta-e-argilla': ['laboratori', 'famiglie'],
  'passeggiata-con-i-pony': ['famiglie'],
  'spettacolo-con-i-falchi': ['famiglie'],
  'musica-live-e-jam-session': ['musica'],
  'lecce-comic': ['cultura', 'famiglie', 'laboratori'],
  'the-dytt': ['musica'],
  'nitecity': ['musica'],
  'metropolitan-trio-christmas': ['musica'],
  'le-circostanze': ['musica'],
  'jem-section-giardini-garibaldi': ['musica'],
  'trh-this': ['musica'],
  'oversound-music-festival-lecce': ['musica'],
};

export const FEATURED_DROPDOWN_EVENTS = [
  {
    slug: 'stefania-quarta-casa-quarta',
    label: 'Quarta Store & Casa Quarta · Stefania Quarta',
    when: 'Tradizione dal 1943',
  },
  {
    slug: 'cristiana-vergari-yoga-villa-comunale',
    label: 'Yoga, Pilates & Yoga Bambini · Cristiana Vergari',
    when: 'Tutti i venerdì',
  },
  {
    slug: 'villa-lab-laboratori-bambini',
    toSlug: 'laboratorio-cartapesta-e-argilla',
    label: 'Villa Lab · Cartapesta, Terracotta e Creta',
    when: 'Dicembre – Gennaio',
  },
  {
    slug: 'mercatini-artigianato-salentino',
    toSlug: 'mercatini-di-natale-in-villa',
    label: 'Mercatini dell’Artigianato Salentino · Diciottesimomeridiano',
    when: 'Dicembre – 6 Gennaio',
  },
  {
    slug: 'un-natale-in-villa',
    label: 'Natale in Villa · Il programma generale',
    when: 'Dic 2026 – Feb 2027',
  },
  {
    slug: 'villaggio-di-babbo-natale',
    label: 'Il Villaggio di Babbo Natale',
    when: '23–27 dicembre',
  },
  {
    slug: 'spettacolo-con-i-falchi',
    label: 'Rapaci in Villa · Yuna Lucky Owl',
    when: '11 e 24 dic · 1 gen',
  },
  {
    slug: 'lecce-comic',
    label: 'Lecce Comic · Fumetto e Cultura Pop',
    when: 'Febbraio 2027',
  },
];

export const EVENT_CALENDARS = [
  {
    id: 'settimanali',
    period: 'Appuntamenti settimanali fissi',
    subtitle: 'Iniziative ricorrenti nella Villa Comunale di Lecce',
    entries: [
      {
        dates: 'Tutti i venerdì',
        title: 'Yoga, Pilates, Holistic Yoga Walking & Yoga Bambini — Cristiana Vergari',
        detail:
          'Percorsi settimanali all’aria aperta dedicati al benessere psicofisico, alla postura e al respiro consapevole: sessioni di Yoga e Pilates per adulti, camminata olistica dinamica con musica in cuffia e laboratori Yoga Bambini Educational riconosciuti dal MIM.',
        category: 'yoga',
        slug: 'cristiana-vergari-yoga-villa-comunale',
      },
      {
        dates: 'Tutte le domeniche',
        title: 'Passeggiata con i Pony',
        detail:
          'Un’esperienza dolce ed educativa immersa nel verde dei Giardini pubblici Giuseppe Garibaldi: passeggiate domenicali a misura di bambino in totale sicurezza, accompagnate passo dopo passo da personale esperto e qualificato.',
        category: 'famiglie',
        slug: 'passeggiata-con-i-pony',
      },
    ],
  },
  {
    id: 'dicembre-2026',
    period: 'Dicembre 2026',
    subtitle: 'Mercatini, concerti, tradizione e Villaggio di Babbo Natale',
    entries: [
      {
        dates: '5 – 6 dicembre',
        title: 'Mercatini dell’Artigianato Salentino (Diciottesimomeridiano) & Musica Live',
        detail:
          'Inaugurazione dei mercatini natalizi curati da Diciottesimomeridiano APS tra pietra leccese, cartapesta, ceramiche e manufatti fatti a mano lungo i viali della Villa; sabato spazio alla musica dal vivo e alle jam session.',
        category: 'mercatini',
        extraCategories: ['musica'],
        slug: 'mercatini-di-natale-in-villa',
      },
      {
        dates: '5 dicembre',
        title: 'NiteCity in concerto + Musica Live e Jam Session',
        detail:
          'Il progetto live ideato da Ciki Forchetti apre i sabati musicali in Villa con un viaggio trascinante tra dance anni ’70 e ’80, pop contemporaneo, soul, funk e ritmi latini e italiani tutti da ballare.',
        category: 'musica',
        slug: 'nitecity',
      },
      {
        dates: '8 dicembre',
        title: 'Festa dell’Immacolata Concezione',
        detail:
          'Giornata speciale dedicata alla tradizione salentina e alle famiglie nel cuore del parco: stand dei Mercatini di Natale, momenti musicali diffusi, animazione e attività ricreative pensate per grandi e piccoli.',
        category: 'famiglie',
        extraCategories: ['mercatini', 'musica'],
        slug: 'festa-immacolata-villa-comunale',
      },
      {
        dates: '11 dicembre',
        title: 'Educazione Ambientale e Spettacolo con i Rapaci · Yuna Lucky Owl',
        detail:
          'Incontro ravvicinato di educazione ambientale e falconeria UNESCO con Federico Quarta e il progetto Yuna Lucky Owl: osservazioni guidate, didattica sull’ecosistema e foto con Aquila delle steppe, Gufo bengalese e Falco pellegrino.',
        category: 'famiglie',
        slug: 'spettacolo-con-i-falchi',
      },
      {
        dates: '12 – 13 dicembre',
        title: 'Mercatini di Natale & Musica Live (sabato 12: Metropolitan Trio)',
        detail:
          'Secondo fine settimana tra le botteghe dell’artigianato salentino e idee regalo fatte a mano; sabato sera concerto Christmas Edition del Metropolitan Trio (Giusy Colì, Paco Carrieri e Alessio Borgia) tra jazz, soul e classici natalizi.',
        category: 'mercatini',
        extraCategories: ['musica'],
        slug: 'metropolitan-trio-christmas',
      },
      {
        dates: '19 – 20 dicembre',
        title: 'Mercatini di Natale & Musica Live (sabato 19: Le Circostanze)',
        detail:
          'Ultimo weekend prima di Natale tra gli stand artigianali illuminati nel parco e, nella serata di sabato, il concerto dal vivo de Le Circostanze dedicato alla grande canzone d’autore e al pop-rock italiano dagli anni ’70 a oggi.',
        category: 'mercatini',
        extraCategories: ['musica'],
        slug: 'le-circostanze',
      },
      {
        dates: '23 – 27 dicembre',
        title: 'Il Villaggio di Babbo Natale & Mercatini di Natale',
        detail:
          'Cinque giornate consecutive nel pieno della magia natalizia: incontro dal vivo con Babbo Natale, laboratori creativi per bambini, mercatini, l’appuntamento della vigilia con i rapaci (24 dicembre) e la musica live di Santo Stefano (26 dicembre).',
        category: 'famiglie',
        extraCategories: ['mercatini', 'laboratori', 'musica'],
        slug: 'villaggio-di-babbo-natale',
      },
      {
        dates: '28 – 29 dicembre',
        title: 'Villa Lab · Laboratorio Cartapesta, Terracotta e Argilla',
        detail:
          'Piccole mani, grandi meraviglie: due giornate di laboratori pratici dedicati ai bambini per scoprire e modellare cartapesta leccese, terracotta e argilla tra gioco, manualità e fantasia.',
        category: 'laboratori',
        slug: 'laboratorio-cartapesta-e-argilla',
      },
    ],
  },
  {
    id: 'gennaio-2027',
    period: 'Gennaio 2027',
    subtitle: 'Creatività, laboratori di creta, musica ed Epifania',
    entries: [
      {
        dates: '1 – 3 gennaio',
        title: 'Creatività e musica per il nuovo anno',
        detail:
          'Il 2027 si apre in Villa con tre giornate di Mercatini di Natale, laboratori di modellazione e costruzione con la creta, l’incontro didattico con i rapaci di Capodanno (1 gennaio) e la musica dal vivo con jam session (2 gennaio).',
        category: 'laboratori',
        extraCategories: ['mercatini', 'musica', 'famiglie'],
        slug: 'laboratorio-cartapesta-e-argilla',
      },
      {
        dates: '4 – 5 gennaio',
        title: 'Villa Lab · Laboratorio Cartapesta e Argilla',
        detail:
          'Nuovo appuntamento con i laboratori artigianali di Villa Lab aspettando l’Epifania: attività manuali guidate di cartapesta e argilla per stimolare creatività ed espressione artistica in bambini e ragazzi.',
        category: 'laboratori',
        slug: 'laboratorio-cartapesta-e-argilla',
      },
      {
        dates: '6 gennaio',
        title: 'Epifania in Villa',
        detail:
          'Gran finale delle festività natalizie nei Giardini pubblici Giuseppe Garibaldi con l’apertura dei Mercatini dell’Artigianato Salentino, animazione e iniziative dedicate a tutte le famiglie.',
        category: 'mercatini',
        extraCategories: ['famiglie'],
        slug: 'mercatini-di-natale-in-villa',
      },
    ],
  },
  {
    id: 'febbraio-2027',
    period: 'Febbraio 2027',
    subtitle: 'Fumetto, illustrazione e cultura pop',
    entries: [
      {
        dates: 'Febbraio 2027',
        title: 'Lecce Comic — Fumetto, Illustrazione e Cultura Pop',
        detail:
          'La programmazione invernale prosegue a febbraio con la rassegna dedicata alla nona arte e alla creatività contemporanea: incontri con autori e illustratori, mostre di tavole, laboratori di disegno, collezionismo, cultura pop e gaming.',
        category: 'cultura',
        extraCategories: ['laboratori', 'famiglie'],
        slug: 'lecce-comic',
      },
    ],
  },
];

export function matchesEventCategory(slug, category) {
  if (!category || category === 'tutti') return true;
  const cats = SLUG_CATEGORIES[slug] || ['musica'];
  return cats.includes(category);
}

export function entryMatchesCategory(entry, category) {
  if (!category || category === 'tutti') return true;
  if (entry.category === category) return true;
  return Array.isArray(entry.extraCategories) && entry.extraCategories.includes(category);
}

export function categoryLabelOf(id) {
  return EVENT_CATEGORIES.find((c) => c.id === id)?.shortLabel || 'Evento';
}
