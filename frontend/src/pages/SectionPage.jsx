import { useEffect, useState } from 'react';
import { Badge, Container, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { apiGet } from '../api/client';
import FacebookVideo from '../components/FacebookVideo';

const SECTION_TITLES = {
  notizia: 'Cronaca',
  evento: 'Eventi',
  avviso: 'Avvisi',
  sponsorizzato: 'Sponsorizzati',
};

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

  return (
    <Container className="py-4">
      <h1 className="section-head">{SECTION_TITLES[type] || type}</h1>
      {loading ? (
        <Spinner animation="border" />
      ) : articles.length === 0 ? (
        <p className="text-muted">Nessun contenuto in questa sezione.</p>
      ) : (
        <ul className="list-unstyled">
          {articles.map((a) => (
            <li key={a.id} className="news-item">
              {a.cover_url && (
                <Link to={`/articolo/${a.slug}`}>
                  <img className="article-cover" src={a.cover_url} alt="" />
                </Link>
              )}
              <Badge className="badge-type me-2">{a.type}</Badge>
              <Link to={`/articolo/${a.slug}`} className="fw-semibold fs-5">
                {a.title}
              </Link>
              {a.subtitle && <p className="text-muted mb-1 mt-1">{a.subtitle}</p>}
              {(a.event_start || a.location) && (
                <p className="text-muted small mb-2">
                  {[eventWhen(a), a.location].filter(Boolean).join(' · ')}
                </p>
              )}
              {a.video_url && <FacebookVideo url={a.video_url} />}
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
