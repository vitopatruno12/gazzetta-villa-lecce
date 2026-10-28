import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function AdvertisePage() {
  return (
    <Container className="py-4 info-page">
      <div className="section-kicker">Pubblicità</div>
      <h1 className="page-title">Fai pubblicità</h1>
      <p className="social-lead">
        Porta la tua attività sulla Gazzetta della Villa di Lecce.
      </p>
      <p>
        I banner con il logo compaiono in homepage. Nella pagina Partner restano le schede delle
        società sponsor: Gazza Ladra, Le Mani in Pasta e Le Mucche Volanti.
      </p>
      <p>
        <Link to="/sponsor" className="social-link">
          Vedi i partner
        </Link>
      </p>
    </Container>
  );
}
