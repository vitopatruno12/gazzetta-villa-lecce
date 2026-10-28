import { useEffect, useState } from 'react';
import { Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { apiGet } from '../api/client';

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
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Row className="g-3">
          {companies
            .filter((c) => c.logo_url)
            .map((c) => (
              <Col md={4} key={c.id}>
                <Card className="h-100 border-0 shadow-sm partner-card">
                  <Card.Body className="text-center">
                    <img className="partner-logo" src={c.logo_url} alt={`Logo ${c.name}`} />
                    <Card.Title>{c.name}</Card.Title>
                    {c.city && <Card.Subtitle className="text-muted">{c.city}</Card.Subtitle>}
                  </Card.Body>
                </Card>
              </Col>
            ))}
        </Row>
      )}
    </Container>
  );
}
