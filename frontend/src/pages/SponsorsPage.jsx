import { useEffect, useState } from 'react';
import { Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { apiGet } from '../api/client';
import SeoHead from '../components/SeoHead';

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
      <SeoHead
        title="Partner e Attività Locali – Villa Comunale di Lecce"
        description="Partner e attività del territorio che sostengono gli eventi della Villa Comunale Giuseppe Garibaldi di Lecce."
        canonicalPath="/sponsor"
      />
      <h1 className="h2 mb-2" style={{ fontWeight: 700 }}>
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
              <Col md={6} lg={3} key={c.id}>
                <Card className="h-100 border-0 shadow-sm partner-card">
                  <Card.Body className="text-center d-flex flex-column">
                    {c.slug === 'quarta-caffe' ? (
                      <Link to="/articolo/stefania-quarta-casa-quarta" className="text-decoration-none">
                        <img className="partner-logo" src={c.logo_url} alt={`Logo ${c.name}`} />
                        <Card.Title>{c.name}</Card.Title>
                      </Link>
                    ) : (
                      <>
                        <img className="partner-logo" src={c.logo_url} alt={`Logo ${c.name}`} />
                        <Card.Title>{c.name}</Card.Title>
                      </>
                    )}
                    {c.city && <Card.Subtitle className="text-muted mt-auto">{c.city}</Card.Subtitle>}
                  </Card.Body>
                </Card>
              </Col>
            ))}
        </Row>
      )}
    </Container>
  );
}
