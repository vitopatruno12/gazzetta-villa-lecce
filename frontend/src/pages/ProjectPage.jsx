import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import {
  PROJECT_AREAS,
  PROJECT_PDF,
  PROJECT_PHOTOS_PATH,
  PROJECT_VIDEO,
} from '../data/project';

export default function ProjectPage() {
  return (
    <Container className="py-4 project-page">
      <SeoHead
        title="Il Progetto – Giardini Pubblici Giuseppe Garibaldi | Villa Comunale Lecce"
        description="Il progetto di riqualificazione della Villa Comunale di Lecce (Giardini pubblici Giuseppe Garibaldi): recupero edifici storici, bar, ristorante, ludoteca, aree gioco e spazi per eventi, mercatini e laboratori."
        keywords="Giardini pubblici Giuseppe Garibaldi Lecce, Giuseppe Garibaldi Lecce, progetto Villa Comunale Lecce, riqualificazione Villa Comunale Lecce, eventi Villa Comunale"
        canonicalPath="/progetto"
      />
      <div className="section-kicker">Città di Lecce</div>
      <h1 className="page-title">Il nuovo volto della Villa</h1>
      <p className="social-lead">
        Giardini pubblici Giuseppe Garibaldi. Il video del progetto.
      </p>
      <p className="project-intro">
        Il recupero dei giardini e degli edifici storici: bar, ristorante,
        ludoteca, aree gioco e spazi per eventi e mostre. Le tavole sono di
        Progettazione Giliberti S.r.l., società di ingegneria.
      </p>

      <video className="project-video" controls playsInline preload="metadata">
        <source src={PROJECT_VIDEO} type="video/mp4" />
      </video>
      <p className="project-callout">
        <Link to={PROJECT_PHOTOS_PATH}>Foto del progetto</Link>
        <a href={PROJECT_PDF} download>
          Scarica il PDF
        </a>
      </p>

      <Row className="g-4 project-areas">
        {PROJECT_AREAS.map((area) => (
          <Col md={6} lg={4} key={area.title}>
            <article className="social-card">
              <h2>{area.title}</h2>
              <p>{area.text}</p>
            </article>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
