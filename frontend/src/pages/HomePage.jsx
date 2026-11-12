import { useEffect, useState } from 'react';
import { Badge, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { apiGet } from '../api/client';
import AdSlot from '../components/AdSlot';
import SponsorBanners from '../components/SponsorBanners';
import FacebookVideo from '../components/FacebookVideo';
import { PROJECT_ARTICLE_SLUG, PROJECT_PATH } from '../data/project';

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
    apiGet('/api/articles?limit=12')
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

  const [hero, ...rest] = articles;
  const side = articles.slice(0, 6);
  const groups = [
    { type: 'notizia', title: 'Cronaca', to: '/sezione/notizia' },
    { type: 'evento', title: 'Eventi', to: '/sezione/evento' },
    { type: 'avviso', title: 'Avvisi', to: '/sezione/avviso' },
  ]
    .map((group) => ({
      ...group,
      articles: rest.filter((article) => article.type === group.type),
    }))
    .filter((group) => group.articles.length);

  return (
    <Container className="home-wrap">
      <div className="home-frame">
        <div className="home-frame-banners">
          <SponsorBanners />
        </div>
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
                  <img className="article-cover" src={hero.cover_url} alt="" />
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
                          <img className="article-cover" src={a.cover_url} alt="" />
                        </Link>
                      )}
                      <h3>
                        <Link to={`/articolo/${a.slug}`}>{a.title}</Link>
                      </h3>
                      {a.subtitle && <p className="text-muted small mb-1">{a.subtitle}</p>}
                      <p className="text-muted small mb-0">{formatDate(a.published_at)}</p>
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
      </div>
    </Container>
  );
}
