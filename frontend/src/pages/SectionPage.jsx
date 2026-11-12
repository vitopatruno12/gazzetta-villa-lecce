import { useEffect, useState } from 'react';
import { Badge, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { apiGet } from '../api/client';
import FacebookVideo from '../components/FacebookVideo';
import PageAside from '../components/PageAside';

const SECTION_TITLES = {
  notizia: 'Cronaca',
  evento: 'Eventi',
  avviso: 'Avvisi',
  sponsorizzato: 'Sponsorizzati',
};

const FEATURED_EVENTS = [
  'un-natale-in-villa',
  'the-dytt',
  'metropolitan-trio-christmas',
  'nitecity',
  'le-circostanze',
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

export default function SectionPage() {
  const { type } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGet(`/api/articles?type=${encodeURIComponent(type)}&limit=30`)
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [type]);

  const featured =
    type === 'evento'
      ? FEATURED_EVENTS.map((slug) => articles.find((article) => article.slug === slug)).filter(Boolean)
      : [];
  const listed =
    type === 'evento' ? articles.filter((article) => !FEATURED_EVENTS.includes(article.slug)) : articles;

  return (
    <Container className="sheet-wrap">
      <Row className="g-0 sheet-columns">
        <Col lg={8} className="sheet-main">
          <h1 className="section-head">{SECTION_TITLES[type] || type}</h1>
          {loading ? (
            <Spinner animation="border" />
          ) : articles.length === 0 ? (
            <p className="text-muted">Nessun contenuto in questa sezione.</p>
          ) : (
            <ul className="list-unstyled mb-0">
              {[...featured, ...listed].map((a) => (
                <li key={a.id} className="news-item">
                  {a.cover_url && (
                    <Link className="news-thumb" to={`/articolo/${a.slug}`}>
                      <img src={a.cover_url} alt="" />
                    </Link>
                  )}
                  <div>
                    <Badge className="badge-type me-2">{a.type}</Badge>
                    <Link to={`/articolo/${a.slug}`} className="fw-semibold fs-5">
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
              ))}
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
