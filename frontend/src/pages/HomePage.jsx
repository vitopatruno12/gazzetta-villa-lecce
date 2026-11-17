import { useEffect, useState } from 'react';
import { Badge, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { apiGet } from '../api/client';
import AdSlot from '../components/AdSlot';
import SeoHead, { SITE_URL } from '../components/SeoHead';
import SponsorBanners from '../components/SponsorBanners';
import FacebookVideo from '../components/FacebookVideo';
import { PROJECT_ARTICLE_SLUG, PROJECT_PATH } from '../data/project';

const NATALE_SLUG = 'un-natale-in-villa';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet('/api/articles?limit=24')
      .then(setArticles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <p className="text-danger">Impossibile caricare le notizie: {error}</p>
        <p className="text-muted">Avvia il backend (`npm run dev` in /backend).</p>
      </Container>
    );
  }

  const spotlight = articles.find((article) => article.slug === NATALE_SLUG);
  const news = articles.filter((article) => article.slug !== NATALE_SLUG);
  const hero = news.find((article) => article.type === 'notizia') || news[0];
  const rest = news.filter((article) => article.id !== hero?.id);
  const yogaSpotlight = articles.find(
    (article) => article.slug === 'cristiana-vergari-yoga-villa-comunale'
  );
  const side = [
    spotlight,
    yogaSpotlight,
    ...news.filter((a) => a.slug !== 'cristiana-vergari-yoga-villa-comunale'),
  ]
    .filter(Boolean)
    .slice(0, 6);
  const groups = [
    { type: 'notizia', title: 'Cronaca', to: '/sezione/notizia' },
    { type: 'evento', title: 'Eventi', to: '/sezione/evento' },
    { type: 'avviso', title: 'Avvisi', to: '/sezione/avviso' },
  ]
    .map((group) => ({
      ...group,
      articles: rest.filter((article) => article.type === group.type).slice(0, 6),
    }))
    .filter((group) => group.articles.length);

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EventSeries',
    url: `${SITE_URL}/`,
    name: 'Natale in Villa – Eventi Villa Comunale Giuseppe Garibaldi Lecce',
    description:
      'Calendario eventi della Villa Comunale Giuseppe Garibaldi di Lecce: Natale in Villa, mercatini di Natale, eventi musicali, concerti, laboratori creativi di cartapesta, argilla e creta, yoga e attività per famiglie.',
    startDate: '2026-12-05',
    endDate: '2027-02-28',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: 'Villa Comunale di Lecce – Giardini Pubblici Giuseppe Garibaldi',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lecce',
        addressRegion: 'LE',
        postalCode: '73100',
        addressCountry: 'IT',
      },
    },
  };

  return (
    <Container className="home-wrap">
      <SeoHead
        title=""
        description="La Villa Comunale di Lecce (Giardini pubblici Giuseppe Garibaldi): scopri Natale in Villa, eventi Villa Comunale, mercatini di Natale, eventi musicali, laboratori Villa Comunale, yoga e notizie."
        canonicalPath="/"
        jsonLd={homeJsonLd}
      />
        <div className="home-frame-banners">
          <SponsorBanners />
        </div>
        {spotlight && (
          <article className="home-highlight">
            <Link className="home-highlight-poster" to={`/articolo/${spotlight.slug}`}>
              <img src={spotlight.cover_url} alt="Locandina Natale in Villa 2026" />
            </Link>
            <div className="home-highlight-copy">
              <div className="section-kicker">In evidenza · Dicembre 2026 – Febbraio 2027</div>
              <h2>
                <Link to={`/articolo/${spotlight.slug}`}>{spotlight.title}</Link>
              </h2>
              <p>
                Da dicembre 2026 a febbraio 2027 la Villa Comunale di Lecce si anima con mercatini,
                musica, laboratori, yoga e iniziative per famiglie: dal Villaggio di Babbo Natale
                fino a Lecce Comic.
              </p>
              <ul className="home-highlight-points">
                <li>Mercatini di Natale e Villaggio di Babbo Natale</li>
                <li>Laboratori di cartapesta, argilla e creta</li>
                <li>Musica live, concerti e jam session</li>
                <li>Spettacolo con i falchi e Lecce Comic (Febbraio)</li>
                <li>Ogni venerdì: Yoga, Pilates & Yoga Bambini</li>
                <li>Ogni domenica: Passeggiata con i pony</li>
              </ul>
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <Link className="home-highlight-more" to={`/articolo/${spotlight.slug}`}>
                  Scopri il programma completo
                </Link>
                <Link className="home-highlight-more" to="/sezione/evento#calendario">
                  Vai ai calendari →
                </Link>
              </div>
            </div>
          </article>
        )}
        <Row className="home-columns g-0">
        <Col lg={8} className="home-main">
          {hero && (
            <article className="hero-article">
              <div className="section-kicker">{hero.type}</div>
              <div className="meta mb-2">
                {hero.is_sponsored && (
                  <Badge className="badge-sponsored me-2">Sponsorizzato</Badge>
                )}
                <span>{formatDate(hero.published_at)}</span>
              </div>
              <h2>
                <Link to={`/articolo/${hero.slug}`}>{hero.title}</Link>
              </h2>
              {hero.cover_url && (
                <Link to={`/articolo/${hero.slug}`}>
                  <img className="article-cover" src={hero.cover_url} alt={`${hero.title} – Villa Comunale Lecce`} />
                </Link>
              )}
              {hero.subtitle && <p className="deck">{hero.subtitle}</p>}
              {hero.video_url && <FacebookVideo url={hero.video_url} />}
              {hero.slug === PROJECT_ARTICLE_SLUG && (
                <p className="project-callout">
                  <Link to={PROJECT_PATH}>La presentazione del progetto</Link>
                </p>
              )}
            </article>
          )}

          <AdSlot code="feed-sponsored" className="mb-4" />

          {groups.map((group) => (
            <section key={group.type} className="home-section">
              <h2 className="section-head">
                <Link to={group.to}>{group.title}</Link>
              </h2>
              <Row className="home-section-grid g-0">
                {group.articles.map((a) => (
                  <Col md={6} key={a.id} className="home-section-cell">
                    <article className="article-card h-100">
                      <div className="meta mb-1">
                        <Badge className="badge-type me-2">{a.type}</Badge>
                        {a.is_sponsored && <Badge className="badge-sponsored">Sponsor</Badge>}
                      </div>
                      {a.cover_url && (
                        <Link to={`/articolo/${a.slug}`}>
                          <img className="article-cover" src={a.cover_url} alt={`${a.title} – Villa Comunale Giuseppe Garibaldi Lecce`} />
                        </Link>
                      )}
                      <h3>
                        <Link to={`/articolo/${a.slug}`}>{a.title}</Link>
                      </h3>
                      {a.subtitle && <p className="text-muted small mb-1">{a.subtitle}</p>}
                      <p className="text-muted small mb-0">
                        {a.type === 'evento'
                          ? formatDate(a.event_start) || a.location || ''
                          : formatDate(a.published_at)}
                      </p>
                    </article>
                  </Col>
                ))}
              </Row>
            </section>
          ))}
        </Col>

        <Col lg={4} className="home-side">
          <AdSlot code="sidebar-home" className="mb-4" />
          <section className="sidebar-block">
            <h2 className="section-head">In evidenza</h2>
            <ul className="list-unstyled mb-0">
              {side.map((a) => (
                <li key={a.id}>
                  <div className="section-kicker mb-1">{a.type}</div>
                  <Link to={`/articolo/${a.slug}`} className="fw-semibold">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </Col>
        </Row>
    </Container>
  );
}
