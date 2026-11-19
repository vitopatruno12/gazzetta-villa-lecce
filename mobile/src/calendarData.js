export const EVENT_CATEGORIES = [
  { id: 'tutti', label: 'Tutte', fullLabel: 'Tutte le categorie' },
  { id: 'yoga', label: 'Yoga & Benessere', fullLabel: 'Yoga, Pilates & Benessere' },
  { id: 'mercatini', label: 'Mercatini', fullLabel: 'Mercatini di Natale' },
  { id: 'laboratori', label: 'Laboratori', fullLabel: 'Laboratori Creativi (Villa Lab)' },
  { id: 'musica', label: 'Musica & Live', fullLabel: 'Musica Live & Concerti' },
  { id: 'famiglie', label: 'Famiglie & Natura', fullLabel: 'Famiglie, Bambini & Rapaci' },
  { id: 'cultura', label: 'Cultura & Fumetto', fullLabel: 'Lecce Comic & Cultura' },
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

export const EVENT_CALENDARS = [
  {
    id: 'settimanali',
    period: 'Appuntamenti settimanali fissi',
    entries: [
      {
        dates: 'Tutti i venerdì',
        title: 'Yoga, Pilates, Holistic Yoga Walking & Yoga Bambini — Cristiana Vergari',
        detail: 'Benessere psicofisico, camminata olistica in cuffia e Yoga Bambini Educational.',
        category: 'yoga',
        slug: 'cristiana-vergari-yoga-villa-comunale',
      },
      {
        dates: 'Tutte le domeniche',
        title: 'Passeggiata con i Pony',
        detail: 'Passeggiate nel parco a misura di bambino con personale qualificato.',
        category: 'famiglie',
        slug: 'passeggiata-con-i-pony',
      },
    ],
  },
  {
    id: 'dicembre-2026',
    period: 'Dicembre 2026',
    entries: [
      {
        dates: '5 – 6 dicembre',
        title: 'Mercatini dell’Artigianato Salentino (Diciottesimomeridiano) & Musica Live',
        detail: 'Apertura dei mercatini del vero fatto a mano salentino tra i viali; sabato NiteCity e jam session.',
        category: 'mercatini',
        extraCategories: ['musica'],
        slug: 'mercatini-di-natale-in-villa',
      },
      {
        dates: '5 dicembre',
        title: 'NiteCity in concerto + Jam Session',
        detail: 'Dance, pop, soul, funk e musica latina dal vivo.',
        category: 'musica',
        slug: 'nitecity',
      },
      {
        dates: '8 dicembre',
        title: 'Festa dell’Immacolata Concezione',
        detail: 'Mercatini di Natale nella Villa, musica e attività per famiglie e bambini.',
        category: 'famiglie',
        extraCategories: ['mercatini', 'musica'],
        slug: 'festa-immacolata-villa-comunale',
      },
      {
        dates: '11 dicembre',
        title: 'Educazione Ambientale e Spettacolo con i Rapaci · Yuna Lucky Owl',
        detail: 'Aquila delle steppe, Gufo bengalese e Falco pellegrino: didattica e falconeria UNESCO.',
        category: 'famiglie',
        slug: 'spettacolo-con-i-falchi',
      },
      {
        dates: '12 – 13 dicembre',
        title: 'Mercatini di Natale & Musica Live (sabato 12: Metropolitan Trio)',
        detail: 'Artigianato, prodotti tipici e Christmas Edition live il sabato.',
        category: 'mercatini',
        extraCategories: ['musica'],
        slug: 'metropolitan-trio-christmas',
      },
      {
        dates: '19 – 20 dicembre',
        title: 'Mercatini di Natale & Musica Live (sabato 19: Le Circostanze)',
        detail: 'Mercatini natalizi e musica italiana dal vivo il sabato.',
        category: 'mercatini',
        extraCategories: ['musica'],
        slug: 'le-circostanze',
      },
      {
        dates: '23 – 27 dicembre',
        title: 'Il Villaggio di Babbo Natale & Mercatini di Natale',
        detail: 'Incontro con Babbo Natale, laboratori bambini, rapaci (24 dic) e musica live (26 dic).',
        category: 'famiglie',
        extraCategories: ['mercatini', 'laboratori', 'musica'],
        slug: 'villaggio-di-babbo-natale',
      },
      {
        dates: '28 – 29 dicembre',
        title: 'Villa Lab · Laboratorio Cartapesta, Terracotta e Argilla',
        detail: 'Piccole mani, grandi meraviglie: laboratori creativi per bambini.',
        category: 'laboratori',
        slug: 'laboratorio-cartapesta-e-argilla',
      },
    ],
  },
  {
    id: 'gennaio-2027',
    period: 'Gennaio 2027',
    entries: [
      {
        dates: '1 – 3 gennaio',
        title: 'Creatività e musica per il nuovo anno',
        detail: 'Mercatini, laboratori con la creta, Rapaci (1 gen) e Jam Session (2 gen).',
        category: 'laboratori',
        extraCategories: ['mercatini', 'musica', 'famiglie'],
        slug: 'laboratorio-cartapesta-e-argilla',
      },
      {
        dates: '4 – 5 gennaio',
        title: 'Villa Lab · Laboratorio Cartapesta e Argilla',
        detail: 'Attività manuali e artigianali per grandi e piccoli.',
        category: 'laboratori',
        slug: 'laboratorio-cartapesta-e-argilla',
      },
      {
        dates: '6 gennaio',
        title: 'Epifania in Villa',
        detail: 'Mercatini di Natale e attività dedicate alle famiglie.',
        category: 'mercatini',
        extraCategories: ['famiglie'],
        slug: 'mercatini-di-natale-in-villa',
      },
    ],
  },
  {
    id: 'febbraio-2027',
    period: 'Febbraio 2027',
    entries: [
      {
        dates: 'Febbraio 2027',
        title: 'Lecce Comic — Fumetto, Illustrazione e Cultura Pop',
        detail: 'Autori, mostre, laboratori di disegno, stand tematici e cultura pop.',
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
  return EVENT_CATEGORIES.find((c) => c.id === id)?.label || 'Evento';
}
