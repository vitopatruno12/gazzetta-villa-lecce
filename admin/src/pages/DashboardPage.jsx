import { useEffect, useState } from 'react';
import { Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function DashboardPage() {
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/api/articles/admin/all'), api.get('/api/ads/stats')])
      .then(([a, s]) => {
        setArticles(a);
        setStats(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner animation="border" />;

  const published = articles.filter((a) => a.status === 'published').length;

  return (
    <>
      <h1 className="h3 mb-4">Dashboard</h1>
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card body>
            <div className="text-muted small">Articoli</div>
            <div className="fs-3 fw-semibold">{articles.length}</div>
          </Card>
        </Col>
        <Col md={4}>
          <Card body>
            <div className="text-muted small">Pubblicati</div>
            <div className="fs-3 fw-semibold">{published}</div>
          </Card>
        </Col>
        <Col md={4}>
          <Card body>
            <div className="text-muted small">Creatività ads</div>
            <div className="fs-3 fw-semibold">{stats.length}</div>
          </Card>
        </Col>
      </Row>

      <div className="d-flex gap-2 mb-4">
        <Link className="btn btn-primary" to="/articoli/nuovo">
          Nuovo articolo
        </Link>
        <Link className="btn btn-outline-secondary" to="/pubblicita">
          Gestisci pubblicità
        </Link>
      </div>

      <h2 className="h5">Performance banner</h2>
      <Table responsive striped hover size="sm" className="bg-white">
        <thead>
          <tr>
            <th>Creatività</th>
            <th>Slot</th>
            <th>Impressioni</th>
            <th>Click</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.id}>
              <td>{s.title || s.id}</td>
              <td>{s.slot_code}</td>
              <td>{s.impressions}</td>
              <td>{s.clicks}</td>
            </tr>
          ))}
          {!stats.length && (
            <tr>
              <td colSpan={4} className="text-muted">
                Nessun evento registrato ancora.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}
