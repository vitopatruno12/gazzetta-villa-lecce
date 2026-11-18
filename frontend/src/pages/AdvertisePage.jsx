import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';

export default function AdvertisePage() {
  return (
    <Container className="py-4">
      <SeoHead
        title="Fai Pubblicità – Partner Villa Comunale di Lecce"
        description="Porta la tua attività su La Villa Comunale di Lecce: spazi pubblicitari e partnership per gli eventi della Villa Comunale Giuseppe Garibaldi."
        canonicalPath="/fai-pubblicita"
      />
      <div className="info-page">
        <div className="section-kicker">Pubblicità</div>
        <h1 className="page-title">Fai pubblicità</h1>
        <p className="social-lead">
          Porta la tua attività su La Villa Comunale di Lecce.
        </p>
        <p>
          I banner con il logo compaiono in homepage. Nella pagina Partner restano le schede delle
          società sponsor: Gazza Ladra, Le Mani in Pasta, Le Mucche Volanti e Quarta Stefania – Casa Quarta.
        </p>
        <p>
          Per info e richieste scrivi a{' '}
          <a className="social-link" href="mailto:andiamo.lavilla@gmail.com">
            andiamo.lavilla@gmail.com
          </a>
          .
        </p>
        <p>
          <Link to="/sponsor" className="social-link">
            Vedi i partner
          </Link>
        </p>
      </div>
    </Container>
  );
}
