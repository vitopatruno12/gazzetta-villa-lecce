import { Fragment, useEffect, useState } from 'react';
import { Badge, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { apiGet } from '../api/client';
import AdSlot from '../components/AdSlot';
import FacebookVideo from '../components/FacebookVideo';
import PageAside from '../components/PageAside';
import SeoHead, { DEFAULT_KEYWORDS, SITE_URL } from '../components/SeoHead';
import { PROJECT_ARTICLE_SLUG, PROJECT_PATH } from '../data/project';

const BACK = {
  evento: { to: '/sezione/evento', label: 'Torna agli eventi e calendari' },
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

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

function renderBodyWithLinks(text) {
  if (!text) return null;
  const parts = String(text).split(URL_REGEX);
  return parts.map((part, idx) => {
    if (/^(https?:\/\/|www\.)/i.test(part)) {
      const clean = part.replace(/[.,;)]+$/, '');
      const trailing = part.slice(clean.length);
      const href = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
      return (
        <Fragment key={idx}>
          <a href={href} target="_blank" rel="noopener noreferrer" className="article-ext-link">
            {clean}
          </a>
          {trailing}
        </Fragment>
      );
    }
    return <Fragment key={idx}>{part}</Fragment>;
  });
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
  const gallery = galleryOf(article).filter((src) => src !== article.cover_url);

  const excerpt = String(article.body || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 155);
  const seoDescription = [article.subtitle, excerpt].filter(Boolean).join(' — ').slice(0, 165);

  const articleJsonLd =
    article.type === 'evento'
      ? {
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: article.title,
          description: seoDescription || article.title,
          startDate: article.event_start ? String(article.event_start).slice(0, 10) : '2026-12-05',
          ...(article.event_end ? { endDate: String(article.event_end).slice(0, 10) } : {}),
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          url: `${SITE_URL}/articolo/${article.slug}`,
          ...(article.cover_url
            ? {
                image: [`${SITE_URL}${article.cover_url}`],
              }
            : {}),
          location: {
            '@type': 'Place',
            name: article.location || 'Villa Comunale di Lecce – Giardini Pubblici Giuseppe Garibaldi',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Lecce',
              addressRegion: 'LE',
              postalCode: '73100',
              addressCountry: 'IT',
            },
          },
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: article.title,
          description: seoDescription || article.title,
          ...(article.published_at ? { datePublished: article.published_at } : {}),
          url: `${SITE_URL}/articolo/${article.slug}`,
          ...(article.cover_url
            ? {
                image: [`${SITE_URL}${article.cover_url}`],
              }
            : {}),
          publisher: {
            '@type': 'Organization',
            name: 'La Villa Comunale di Lecce',
          },
        };

  return (
    <Container className="sheet-wrap">
      <SeoHead
        title={`${article.title} – Villa Comunale Lecce`}
        description={seoDescription}
        keywords={`${article.title}, ${DEFAULT_KEYWORDS}`}
        canonicalPath={`/articolo/${article.slug}`}
        image={article.cover_url || '/assets/logo-villa-comunale.png'}
        type={article.type === 'evento' ? 'website' : 'article'}
        jsonLd={articleJsonLd}
      />
      <Row className="g-0 sheet-columns">
        <Col lg={8} className="sheet-main">
          <div className="article-sheet">
            <p className="mb-3">
              <Link className="back-link" to={back.to}>
                {back.label}
              </Link>
            </p>
            <div className="meta mb-2">
              <Badge className="badge-type me-2">{article.type}</Badge>
              {(article.is_sponsored || article.type === 'sponsorizzato') && (
                <Badge className="badge-sponsored me-2">Contenuto sponsorizzato</Badge>
              )}
              {article.published_at && article.type !== 'evento' && (
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
            ) : (
              article.cover_url && (
                <img
                  src={article.cover_url}
                  alt={`${article.title} – Villa Comunale Giuseppe Garibaldi Lecce`}
                  className="article-cover"
                />
              )
            )}
            <div className="article-body mb-4">{renderBodyWithLinks(article.body)}</div>
            {gallery.length === 1 ? (
              <div className="event-gallery-single mb-4">
                <img src={gallery[0]} alt={article.title} />
              </div>
            ) : gallery.length > 1 ? (
              <div className="event-gallery-grid mb-4">
                {gallery.map((src, index) => (
                  <a
                    key={src}
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`event-gallery-item${src.includes('logo-') ? ' is-logo' : ''}`}
                  >
                    <img src={src} alt={`${article.title}, immagine ${index + 1}`} loading="lazy" />
                  </a>
                ))}
              </div>
            ) : null}
            {article.slug === PROJECT_ARTICLE_SLUG && (
              <p className="project-callout">
                <Link to={PROJECT_PATH}>La presentazione del progetto</Link>
              </p>
            )}
            <AdSlot code="article-below" />
            <p className="mt-4 mb-0">
              <Link className="back-link" to={back.to}>
                {back.label}
              </Link>
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
