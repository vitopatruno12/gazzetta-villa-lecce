import { useEffect, useState } from 'react';
import { Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { apiGet } from '../api/client';
import AdSlot from '../components/AdSlot';

export default function SponsorsPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/companies')
      .then(setCompanies)
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container className="py-4">
      <h1 className="h2 mb-2" style={{ fontFamily: 'Libre Baskerville, Georgia, serif', fontWeight: 700 }}>
        Partner e attività locali
      </h1>
      <p className="text-muted mb-4">
        Spazi pubblicitari e collaborazioni con aziende del territorio.
      </p>
      <AdSlot code="feed-sponsored" className="mb-4" />
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Row className="g-3">
          {companies.map((c) => (
            <Col md={4} key={c.id}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <Card.Title>{c.name}</Card.Title>
                  {c.city && <Card.Subtitle className="mb-2 text-muted">{c.city}</Card.Subtitle>}
                  {c.website && (
                    <a href={c.website} target="_blank" rel="noopener noreferrer">
                      Sito web
                    </a>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
