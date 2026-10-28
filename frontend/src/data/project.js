export const PROJECT_PATH = '/progetto';
export const PROJECT_PHOTOS_PATH = '/progetto/foto';
export const PROJECT_ARTICLE_SLUG = 'nuovo-volto-villa-comunale-lecce';
export const PROJECT_PDF = '/progetto/villa-comunale-presentazione.pdf';
export const PROJECT_VIDEO = '/progetto/nuovo-volto-villa.mp4';

export const PROJECT_PHOTOS = [
  {
    src: '/progetto/foto/planimetria.jpg',
    caption:
      'Planimetria dei Giardini Garibaldi: bar, ristorante, ludoteca, aree gioco, zona eventi e percorsi espositivi.',
  },
  {
    src: '/progetto/foto/percorsi.jpg',
    caption:
      'Percorsi espositivi con banchi richiudibili per mercatini, mostre temporanee e iniziative culturali.',
  },
  {
    src: '/progetto/foto/piazzale.jpg',
    caption: 'Piazzale intorno al chiosco, con gli allestimenti temporanei del progetto.',
  },
];

const captions = [
  'Città di Lecce',
  'Giardini pubblici Giuseppe Garibaldi, il progetto',
  'Planimetria: bar, ristorante, ludoteca, parco giochi, eventi e mostre',
  'Tavola del progetto',
  'Riporteremo l’immobile allo stato originale',
  'Riporteremo l’immobile allo stato originale',
  'Realizzeremo un moderno bar',
  'Per restituirlo ai leccesi',
  'Tavola del progetto',
  'Tavola del progetto',
  'Recupereremo l’edificio',
  'Recupereremo l’edificio',
  'Realizzeremo un ristorante',
  'Un nuovo luogo di incontro e convivialità',
  'Tavola del progetto',
  'Tavola del progetto',
  'Tavola del progetto',
  'Ripristineremo la ludoteca',
  'Ripristineremo la ludoteca',
  'Migliorandone la funzionalità',
  'Un luogo sicuro per i nostri bambini',
  'Tavola del progetto',
  'Tavola del progetto',
  'Area gioco 1',
  'Area gioco 2',
  'Rinnoveremo le aree gioco',
  'Per renderle ancora più inclusive',
  'Villa da vivere',
  'Corsi di yoga',
  'Corsi di musica',
  'Corsi di pittura',
  'Mostre all’aperto',
  'Mostre all’aperto',
  'Mercatini',
  'Mercatini',
  'Intrattenimento',
  'Intrattenimento',
  'Intrattenimento',
  'Intrattenimento',
  'Progetto realizzato da Progettazione Giliberti S.r.l.',
];

export const PROJECT_SLIDES = captions.map((caption, index) => {
  const n = String(index + 1).padStart(2, '0');
  return {
    src: `/progetto/slide-${n}.jpg`,
    thumb: `/progetto/thumbs/slide-${n}.jpg`,
    caption,
  };
});

export const PROJECT_AREAS = [
  {
    title: 'Bar',
    text: 'L’immobile storico torna allo stato originale, con un bar moderno restituito ai leccesi.',
  },
  {
    title: 'Ristorante',
    text: 'L’edificio viene recuperato come luogo di incontro e convivialità.',
  },
  {
    title: 'Ludoteca',
    text: 'La ludoteca viene ripristinata e resa più funzionale, un luogo sicuro per i bambini.',
  },
  {
    title: 'Parco giochi',
    text: 'Le aree gioco vengono rinnovate per essere più inclusive.',
  },
  {
    title: 'Eventi e mostre',
    text: 'Villa da vivere: corsi, mostre all’aperto, mercatini e intrattenimento.',
  },
];
