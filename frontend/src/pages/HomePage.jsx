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

  return (
    <Container className="home-wrap">
      <SponsorBanners />
      <Row className="g-4">
        <Col lg={8}>
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

          <div className="section-kicker mb-3">Ultime notizie</div>
          <Row className="g-4">
            {rest.map((a) => (
              <Col md={6} key={a.id}>
                <article className="article-card h-100">
                  <div className="meta mb-1">
                    <Badge className="badge-type me-2">{a.type}</Badge>
                    {a.is_sponsored && <Badge className="badge-sponsored">Sponsor</Badge>}
                  </div>
                  <h3>
                    <Link to={`/articolo/${a.slug}`}>{a.title}</Link>
                  </h3>
                  {a.subtitle && <p className="text-muted small mb-1">{a.subtitle}</p>}
                  <p className="text-muted small mb-0">{formatDate(a.published_at)}</p>
                </article>
              </Col>
            ))}
          </Row>
        </Col>

        <Col lg={4}>
          <AdSlot code="sidebar-home" className="mb-4" />
          <section className="sidebar-block">
            <h2>In evidenza</h2>
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
