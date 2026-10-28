import { Col, Container, Row } from 'react-bootstrap';
import SocialIcon from '../components/SocialIcon';
import { SOCIALS } from '../data/social';

export default function SocialPage() {
  return (
    <Container className="py-4 social-page">
      <div className="section-kicker">Seguici</div>
      <h1 className="page-title">Social</h1>
      <p className="social-lead">
        Facebook, X, Instagram, Spotify, LinkedIn, TikTok, Telegram e Google.
      </p>
      <Row className="g-4">
        {SOCIALS.map((item) => (
          <Col md={6} lg={3} key={item.id}>
            <article className={`social-card social-card-${item.id}`} id={item.id}>
              <span className={`social-page-badge social-${item.id}`}>
                <SocialIcon id={item.id} />
              </span>
              <h2>{item.name}</h2>
              <p>{item.description}</p>
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="social-link">
                Apri {item.name}
              </a>
            </article>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
