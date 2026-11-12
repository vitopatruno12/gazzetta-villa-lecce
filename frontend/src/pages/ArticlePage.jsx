import { useEffect, useState } from 'react';
import { Badge, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { apiGet } from '../api/client';
import AdSlot from '../components/AdSlot';
import FacebookVideo from '../components/FacebookVideo';
import PageAside from '../components/PageAside';
import { PROJECT_ARTICLE_SLUG, PROJECT_PATH } from '../data/project';

const BACK = {
  evento: { to: '/sezione/evento', label: 'Torna agli eventi' },
  notizia: { to: '/sezione/notizia', label: 'Torna alla cronaca' },
  avviso: { to: '/sezione/avviso', label: 'Torna agli avvisi' },
  sponsorizzato: { to: '/sponsor', label: 'Torna ai partner' },
};

function galleryOf(article) {
  if (!article?.gallery_urls) return [];
  try {
    const parsed = JSON.parse(article.gallery_urls);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGet(`/api/articles/slug/${slug}`)
      .then(setArticle)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container className="py-5">
        <p>{error || 'Articolo non trovato'}</p>
        <Link to="/">Torna alla home</Link>
      </Container>
    );
  }

  const back = BACK[article.type] || { to: '/', label: 'Torna alla home' };

  return (
    <Container className="sheet-wrap">
      <Row className="g-0 sheet-columns">
      <Col lg={8} className="sheet-main">
      <div className="article-sheet">
      <p className="mb-3">
        <Link className="back-link" to={back.to}>{back.label}</Link>
      </p>
      <div className="meta mb-2">
        <Badge className="badge-type me-2">{article.type}</Badge>
        {(article.is_sponsored || article.type === 'sponsorizzato') && (
          <Badge className="badge-sponsored me-2">Contenuto sponsorizzato</Badge>
        )}
        {article.published_at && !article.event_start && (
          <span>
            {new Date(article.published_at).toLocaleDateString('it-IT', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        )}
      </div>
      <h1 className="hero-article mb-2" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.4rem)', fontWeight: 700 }}>
        {article.title}
      </h1>
      {article.subtitle && <p className="lead text-muted">{article.subtitle}</p>}
      {(article.event_start || article.location) && (
        <p className="text-muted">
          {article.event_start && (
            <span>
              {new Date(article.event_start).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              {article.event_end &&
                String(article.event_end).slice(0, 10) !== String(article.event_start).slice(0, 10) &&
                ` – ${new Date(article.event_end).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}`}
            </span>
          )}
          {article.location && (
            <span>
              {article.event_start ? ' · ' : ''}
              {article.location}
            </span>
          )}
        </p>
      )}
      {article.company_name && (
        <p className="small text-muted">In collaborazione con {article.company_name}</p>
      )}
      {article.video_url ? (
        <FacebookVideo url={article.video_url} />
      ) : galleryOf(article).length > 0 ? (
        <div className="event-gallery">
          {galleryOf(article).map((src, index) => (
            <img key={src} src={src} alt={`${article.title}, foto ${index + 1}`} />
          ))}
        </div>
      ) : (
        article.cover_url && <img src={article.cover_url} alt="" className="article-cover" />
      )}
      <div className="article-body mb-4">{article.body}</div>
      {article.slug === PROJECT_ARTICLE_SLUG && (
        <p className="project-callout">
          <Link to={PROJECT_PATH}>La presentazione del progetto</Link>
        </p>
      )}
      <AdSlot code="article-below" />
      <p className="mt-4 mb-0">
        <Link className="back-link" to={back.to}>{back.label}</Link>
      </p>
      </div>
      </Col>
      <Col lg={4} className="sheet-side">
        <PageAside excludeSlug={article.slug} activeTo={back.to} />
      </Col>
      </Row>
    </Container>
  );
}
