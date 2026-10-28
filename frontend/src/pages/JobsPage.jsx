import { Container } from 'react-bootstrap';

export default function JobsPage() {
  return (
    <Container className="py-4 info-page">
      <div className="section-kicker">Redazione</div>
      <h1 className="page-title">Lavora con noi</h1>
      <p className="social-lead">
        La Gazzetta della Villa di Lecce racconta cronaca, eventi e la vita del parco.
      </p>
      <p>
        Cerchiamo persone che conoscano la Villa Comunale e vogliano collaborare: notizie dal
        territorio, appuntamenti, foto e il racconto quotidiano dei Giardini Giuseppe Garibaldi.
      </p>
      <p>
        Le proposte si valutano in redazione per le sezioni Cronaca, Eventi e Avvisi.
      </p>
    </Container>
  );
}
