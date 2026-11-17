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
    slug: 'cristiana-vergari-yoga-villa-comunale',
    label: 'Yoga, Pilates & Yoga Bambini · Cristiana Vergari',
    when: 'Tutti i venerdì',
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
        detail: 'Sessioni di Yoga, Pilates, camminata olistica in cuffia e Yoga Bambini Educational per adulti e famiglie.',
        category: 'yoga',
        slug: 'cristiana-vergari-yoga-villa-comunale',
      },
      {
        dates: 'Tutte le domeniche',
        title: 'Passeggiata con i Pony',
        detail: 'Passeggiate nel parco a misura di bambino accompagnate da personale qualificato.',
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
        title: 'Mercatini di Natale & Musica Live (sabato 5: NiteCity + Jam Session)',
        detail: 'Apertura dei mercatini tra i viali; sabato musica dal vivo e jam session.',
        category: 'mercatini',
        extraCategories: ['musica'],
        slug: 'mercatini-di-natale-in-villa',
      },
      {
        dates: '5 dicembre',
        title: 'NiteCity in concerto + Musica Live e Jam Session',
        detail: 'Dance, pop, soul, funk e musica latina dal vivo.',
        category: 'musica',
        slug: 'nitecity',
      },
      {
        dates: '8 dicembre',
        title: 'Festa dell’Immacolata Concezione',
        detail: 'Mercatini di Natale nella Villa, momenti di musica e intrattenimento, attività per famiglie e bambini.',
        category: 'famiglie',
        extraCategories: ['mercatini', 'musica'],
        slug: 'festa-immacolata-villa-comunale',
      },
      {
        dates: '11 dicembre',
        title: 'Spettacolo con i Falchi',
        detail: 'Dimostrazione di falconeria per scoprire da vicino il mondo dei rapaci.',
        category: 'famiglie',
        slug: 'spettacolo-con-i-falchi',
      },
      {
        dates: '12 – 13 dicembre',
        title: 'Mercatini di Natale & Musica Live (sabato 12: Metropolitan Trio)',
        detail: 'Artigianato, prodotti tipici e musica dal vivo il sabato.',
        category: 'mercatini',
        extraCategories: ['musica'],
        slug: 'metropolitan-trio-christmas',
      },
      {
        dates: '19 – 20 dicembre',
        title: 'Mercatini di Natale & Musica Live (sabato 19: Le Circostanze)',
        detail: 'Mercatini natalizi e, il sabato, grande musica italiana dal vivo e jam session.',
        category: 'mercatini',
        extraCategories: ['musica'],
        slug: 'le-circostanze',
      },
      {
        dates: '23 – 27 dicembre',
        title: 'Il Villaggio di Babbo Natale & Mercatini di Natale',
        detail: 'Cinque giornate con incontro con Babbo Natale, laboratori creativi, falchi (24 dic) e musica live (26 dic).',
        category: 'famiglie',
        extraCategories: ['mercatini', 'laboratori', 'musica'],
        slug: 'villaggio-di-babbo-natale',
      },
      {
        dates: '28 – 29 dicembre',
        title: 'Laboratorio Cartapesta e Argilla',
        detail: 'La tradizione dell’arte artigianale leccese in attività pratiche e creative.',
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
        detail: 'Mercatini di Natale, laboratori di modellazione con la creta, Spettacolo con i Falchi (1 gen) e Jam Session (2 gen).',
        category: 'laboratori',
        extraCategories: ['mercatini', 'musica', 'famiglie'],
        slug: 'laboratorio-cartapesta-e-argilla',
      },
      {
        dates: '4 – 5 gennaio',
        title: 'Laboratorio Cartapesta e Argilla',
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
    subtitle: 'Fumetto, illustrazione e cultura pop',
    entries: [
      {
        dates: 'Febbraio 2027',
        title: 'Lecce Comic — Fumetto, Illustrazione e Cultura Pop',
        detail: 'Incontri con autori e illustratori, mostre e laboratori di disegno, stand tematici, collezionismo e gaming.',
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
