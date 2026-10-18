import { useEffect, useState } from 'react';
import { Badge, Container, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { apiGet } from '../api/client';

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
      <h1 className="h2 mb-4 text-capitalize" style={{ fontFamily: 'Libre Baskerville, Georgia, serif', fontWeight: 700 }}>
        {type === 'notizia' ? 'Cronaca' : type}
      </h1>
      {loading ? (
        <Spinner animation="border" />
      ) : articles.length === 0 ? (
        <p className="text-muted">Nessun contenuto in questa sezione.</p>
      ) : (
        <ul className="list-unstyled">
          {articles.map((a) => (
            <li key={a.id} className="mb-3 pb-3 border-bottom">
              <Badge className="badge-type me-2">{a.type}</Badge>
              <Link to={`/articolo/${a.slug}`} className="fw-semibold fs-5">
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
