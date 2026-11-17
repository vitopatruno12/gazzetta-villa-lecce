import { useEffect, useState } from 'react';
import { Badge, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { apiGet } from '../api/client';
import FacebookVideo from '../components/FacebookVideo';
import PageAside from '../components/PageAside';
import SeoHead, { SITE_URL } from '../components/SeoHead';
import {
  EVENT_CALENDARS,
  EVENT_CATEGORIES,
  SLUG_CATEGORIES,
  categoryLabelOf,
  entryMatchesCategory,
  matchesEventCategory,
} from '../data/eventsCalendar';

const SECTION_TITLES = {
  notizia: 'Cronaca',
  evento: 'Eventi',
  avviso: 'Avvisi',
  sponsorizzato: 'Sponsorizzati',
};

const CATEGORY_SEO = {
  tutti: {
    title: 'Eventi Villa Comunale Lecce – Calendario Natale in Villa, Mercatini, Concerti e Laboratori',
    description:
      'Calendario ufficiale degli eventi alla Villa Comunale Giuseppe Garibaldi di Lecce: Natale in Villa, mercatini di Natale, eventi musicali, laboratori Villa Comunale, yoga e attività per famiglie.',
    keywords:
      'eventi Villa Comunale, eventi Villa Comunale Lecce, Natale in Villa, Villa Comunale Giuseppe Garibaldi Lecce, mercatini di Natale, eventi musicali Villa Comunale, laboratori Villa Comunale',
  },
  mercatini: {
    title: 'Mercatini di Natale Villa Comunale Lecce – Date e Programma Natale in Villa',
    description:
      'Tutte le date dei Mercatini di Natale nella Villa Comunale Giuseppe Garibaldi di Lecce per Natale in Villa: artigianato, prodotti tipici, Festa dell’Immacolata, Villaggio di Babbo Natale ed Epifania.',
    keywords:
      'mercatini di Natale, mercatini di Natale Lecce, mercatini di Natale Villa Comunale, Natale in Villa Lecce, Villa Comunale Giuseppe Garibaldi Lecce',
  },
  musica: {
    title: 'Eventi Musicali Villa Comunale Lecce – Concerti, Jam Session e Musica Live',
    description:
      'Eventi musicali nella Villa Comunale Giuseppe Garibaldi di Lecce: concerti dal vivo, jam session e serate musicali di Natale in Villa.',
    keywords:
      'eventi musicali Villa Comunale, concerti Villa Comunale Lecce, musica live Villa Comunale Lecce, Natale in Villa concerti, Giardini Giuseppe Garibaldi Lecce',
  },
  laboratori: {
    title: 'Laboratori Villa Comunale Lecce – Cartapesta, Argilla, Creta e Creatività',
    description:
      'Laboratori alla Villa Comunale Giuseppe Garibaldi di Lecce: laboratori di cartapesta, argilla e creta per bambini, famiglie e adulti durante Natale in Villa.',
    keywords:
      'laboratori Villa Comunale, laboratori Villa Comunale Lecce, laboratorio cartapesta Lecce, laboratorio argilla e creta Villa Comunale, Natale in Villa laboratori',
  },
  yoga: {
    title: 'Yoga, Pilates e Benessere Villa Comunale Lecce – Cristiana Vergari & Yoga Bambini',
    description:
      'Ogni venerdì nella Villa Comunale Giuseppe Garibaldi di Lecce: Yoga, Pilates, Holistic Yoga Walking e Yoga Bambini Educational con Cristiana Vergari.',
    keywords:
      'yoga Villa Comunale Lecce, pilates Villa Comunale Lecce, Yoga Bambini Lecce, Cristiana Vergari Lecce, eventi Villa Comunale benessere',
  },
  famiglie: {
    title: 'Eventi per Famiglie e Bambini – Villa Comunale Giuseppe Garibaldi Lecce',
    description:
      'Eventi per famiglie e bambini nella Villa Comunale di Lecce: Villaggio di Babbo Natale, passeggiata con i pony ogni domenica, spettacolo con i falchi e Natale in Villa.',
    keywords:
      'eventi famiglie Villa Comunale Lecce, Villaggio di Babbo Natale Lecce, Natale in Villa bambini, Villa Comunale Giuseppe Garibaldi Lecce',
  },
  cultura: {
    title: 'Lecce Comic e Cultura – Villa Comunale Giuseppe Garibaldi Lecce',
    description:
      'Lecce Comic e appuntamenti culturali nella Villa Comunale Giuseppe Garibaldi di Lecce: fumetto, illustrazione, laboratori di disegno e cultura pop.',
    keywords:
      'Lecce Comic, eventi culturali Villa Comunale Lecce, laboratori disegno Villa Comunale, Giardini Giuseppe Garibaldi Lecce',
  },
};

const FEATURED_EVENTS = [
  'un-natale-in-villa',
  'cristiana-vergari-yoga-villa-comunale',
  'the-dytt',
  'nitecity',
  'metropolitan-trio-christmas',
  'le-circostanze',
  'villaggio-di-babbo-natale',
  'festa-immacolata-villa-comunale',
  'mercatini-di-natale-in-villa',
  'laboratorio-cartapesta-e-argilla',
  'passeggiata-con-i-pony',
  'spettacolo-con-i-falchi',
  'musica-live-e-jam-session',
  'lecce-comic',
];

function formatDay(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function eventWhen(article) {
  if (!article.event_start) return '';
  const start = formatDay(article.event_start);
  const end = formatDay(article.event_end);
  if (!end || end === start) return start;
  return `${start} – ${end}`;
}

function startOfToday() {
  const day = new Date();
  day.setHours(0, 0, 0, 0);
  return day;
}

function pickNextEvent(articles) {
  const today = startOfToday();
  return articles
    .filter((article) => article.event_start && new Date(article.event_start) >= today)
    .sort((a, b) => new Date(a.event_start) - new Date(b.event_start))[0];
}

export default function SectionPage() {
  const { type } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const isEvents = type === 'evento';
  const rawCategory = searchParams.get('categoria') || 'tutti';
  const selectedCategory = EVENT_CATEGORIES.some((c) => c.id === rawCategory)
    ? rawCategory
    : 'tutti';

  useEffect(() => {
    setLoading(true);
    apiGet(`/api/articles?type=${encodeURIComponent(type)}&limit=50`)
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [type]);

  function onSelectCategory(nextCategory) {
    if (!nextCategory || nextCategory === 'tutti') {
      setSearchParams({});
    } else {
      setSearchParams({ categoria: nextCategory });
    }
  }

  const featured = isEvents
    ? FEATURED_EVENTS.map((slug) => articles.find((article) => article.slug === slug)).filter(Boolean)
    : [];
  const listed = isEvents
    ? articles.filter((article) => !FEATURED_EVENTS.includes(article.slug))
    : articles;

  const visibleArticles = isEvents
    ? [...featured, ...listed].filter((a) => matchesEventCategory(a.slug, selectedCategory))
    : [...featured, ...listed];
  const nextEvent = isEvents ? pickNextEvent(visibleArticles) : null;

  const visibleCalendars = isEvents
    ? EVENT_CALENDARS.map((block) => ({
        ...block,
        entries: block.entries.filter((entry) => entryMatchesCategory(entry, selectedCategory)),
      })).filter((block) => block.entries.length > 0)
    : [];

  const seoConfig = isEvents
    ? CATEGORY_SEO[selectedCategory] || CATEGORY_SEO.tutti
    : type === 'notizia'
      ? {
          title: 'Cronaca e Notizie – Villa Comunale Giuseppe Garibaldi Lecce',
          description:
            'Notizie, cronaca e aggiornamenti sulla Villa Comunale di Lecce (Giardini pubblici Giuseppe Garibaldi) e sulla vita cittadina.',
          keywords: 'notizie Villa Comunale Lecce, cronaca Villa Comunale, Giuseppe Garibaldi Lecce',
        }
      : {
          title: `${SECTION_TITLES[type] || type} – Villa Comunale Giuseppe Garibaldi Lecce`,
          description: `Contenuti e aggiornamenti della sezione ${SECTION_TITLES[type] || type} de La Villa Comunale di Lecce.`,
        };

  const sectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: seoConfig.title,
    description: seoConfig.description,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: visibleArticles.slice(0, 15).map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.title,
        url: `${SITE_URL}/articolo/${item.slug}`,
      })),
    },
  };

  return (
    <Container className="sheet-wrap">
      <SeoHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonicalPath={
          isEvents && selectedCategory !== 'tutti'
            ? `/sezione/evento?categoria=${selectedCategory}`
            : `/sezione/${type}`
        }
        jsonLd={sectionJsonLd}
      />
      <Row className="g-0 sheet-columns">
        <Col lg={8} className="sheet-main">
          <h1 className="section-head">{SECTION_TITLES[type] || type}</h1>

          {isEvents && (
            <div className="events-toolbar">
              <div className="events-toolbar-field">
                <label htmlFor="event-category-select" className="events-toolbar-label">
                  Categoria / Programma
                </label>
                <select
                  id="event-category-select"
                  className="events-category-select"
                  value={selectedCategory}
                  onChange={(e) => onSelectCategory(e.target.value)}
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="events-toolbar-actions">
                {selectedCategory !== 'tutti' && (
                  <button
                    type="button"
                    className="events-reset-btn"
                    onClick={() => onSelectCategory('tutti')}
                  >
                    Mostra tutte
                  </button>
                )}
                <a href="#calendario" className="events-jump-link">
                  Vai ai calendari ↓
                </a>
                <a href="#elenco-eventi" className="events-jump-link">
                  Schede eventi ↓
                </a>
              </div>
            </div>
          )}

          {isEvents && visibleCalendars.length > 0 && (
            <section id="calendario" className="events-calendar-section" aria-label="Calendari degli eventi">
              <div className="events-calendar-intro">
                <div className="section-kicker mb-1">Il calendario ufficiale · Villa Comunale di Lecce</div>
                <h2 className="events-calendar-heading">
                  Gli appuntamenti in programma
                  {selectedCategory !== 'tutti' ? ` · ${categoryLabelOf(selectedCategory)}` : ' (Dicembre 2026 – Febbraio 2027)'}
                </h2>
              </div>

              <div className="events-calendar-blocks">
                {visibleCalendars.map((block) => (
                  <div key={block.id} className="calendar-period-card">
                    <div className="calendar-period-header">
                      <h3>{block.period}</h3>
                      {block.subtitle && <span>{block.subtitle}</span>}
                    </div>
                    <ul className="calendar-entry-list list-unstyled mb-0">
                      {block.entries.map((entry, idx) => (
                        <li key={`${block.id}-${idx}`} className="calendar-entry">
                          <div className="calendar-entry-date">{entry.dates}</div>
                          <div className="calendar-entry-body">
                            <div className="calendar-entry-top">
                              <button
                                type="button"
                                className="calendar-cat-pill"
                                onClick={() => onSelectCategory(entry.category)}
                              >
                                {categoryLabelOf(entry.category)}
                              </button>
                              {entry.slug ? (
                                <Link to={`/articolo/${entry.slug}`} className="calendar-entry-title">
                                  {entry.title}
                                </Link>
                              ) : (
                                <span className="calendar-entry-title">{entry.title}</span>
                              )}
                            </div>
                            {entry.detail && <p className="calendar-entry-detail mb-0">{entry.detail}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {isEvents && (
            <h2 id="elenco-eventi" className="section-head">
              {selectedCategory === 'tutti'
                ? 'Tutti gli eventi e approfondimenti'
                : `Eventi · ${categoryLabelOf(selectedCategory)}`}
            </h2>
          )}

          {loading ? (
            <Spinner animation="border" />
          ) : visibleArticles.length === 0 ? (
            <p className="text-muted">Nessun contenuto in questa categoria.</p>
          ) : (
            <ul className="list-unstyled mb-0">
              {visibleArticles.map((a) => {
                const cats = isEvents ? SLUG_CATEGORIES[a.slug] || [] : [];
                const isNext = nextEvent && a.id === nextEvent.id;
                return (
                  <li key={a.id} className={isNext ? 'news-item news-item-next' : 'news-item'}>
                    {a.cover_url && (
                      <Link className="news-thumb" to={`/articolo/${a.slug}`}>
                        <img src={a.cover_url} alt={`${a.title} – Villa Comunale Lecce`} />
                      </Link>
                    )}
                    <div>
                      {isNext && <span className="news-item-kicker">Prossimo evento</span>}
                      <div className="mb-1 d-flex flex-wrap align-items-center gap-1">
                        <Badge className="badge-type">{a.type}</Badge>
                        {cats.slice(0, 2).map((cid) => (
                          <button
                            key={cid}
                            type="button"
                            className="calendar-cat-pill"
                            onClick={() => onSelectCategory(cid)}
                          >
                            {categoryLabelOf(cid)}
                          </button>
                        ))}
                      </div>
                      <Link to={`/articolo/${a.slug}`} className="fw-semibold fs-5 d-block">
                        {a.title}
                      </Link>
                      {a.subtitle && <p className="text-muted mb-1 mt-1">{a.subtitle}</p>}
                      {(a.event_start || a.location) && (
                        <p className="text-muted small mb-0">
                          {[eventWhen(a), a.location].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {a.video_url && <FacebookVideo url={a.video_url} />}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Col>
        <Col lg={4} className="sheet-side">
          <PageAside activeTo={`/sezione/${type}`} skipType={type} />
        </Col>
      </Row>
    </Container>
  );
}
