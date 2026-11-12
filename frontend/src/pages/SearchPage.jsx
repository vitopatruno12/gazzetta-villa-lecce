import { useEffect, useState } from 'react';
import { Badge, Container, Spinner } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { apiGet } from '../api/client';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').trim();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(Boolean(q));

  useEffect(() => {
    if (!q) {
      setArticles([]);
      return;
    }
    setLoading(true);
    apiGet(`/api/articles?q=${encodeURIComponent(q)}&limit=30`)
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <Container className="py-4">
      <h1 className="section-head">Cerca</h1>
      {q && <p className="social-lead">Risultati per «{q}»</p>}
      {!q ? (
        <p className="text-muted">Scrivi una parola nella lente in alto e avvia la ricerca.</p>
      ) : loading ? (
        <Spinner animation="border" />
      ) : articles.length === 0 ? (
        <p className="text-muted">Nessun articolo trovato.</p>
      ) : (
        <ul className="list-unstyled">
          {articles.map((article) => (
            <li key={article.id} className="news-item">
              <Badge className="badge-type me-2">{article.type}</Badge>
              <Link to={`/articolo/${article.slug}`} className="fw-semibold fs-5">
                {article.title}
              </Link>
              {article.subtitle && <p className="text-muted mb-1 mt-1">{article.subtitle}</p>}
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
