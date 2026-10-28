import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, NavLink, Outlet } from 'react-router-dom';
import AdSlot from './AdSlot';
import SocialIcon from './SocialIcon';
import { BROADCASTS, SOCIALS } from '../data/social';

const FOOTER_COLUMNS = [
  {
    title: 'Il giornale',
    links: [
      { to: '/', label: 'Home' },
      { to: '/sezione/notizia', label: 'Cronaca' },
      { to: '/sezione/evento', label: 'Eventi' },
      { to: '/sezione/avviso', label: 'Avvisi' },
      { to: '/fai-pubblicita', label: 'Fai pubblicità' },
      { to: '/lavora-con-noi', label: 'Lavora con noi' },
    ],
  },
  {
    title: 'La Villa',
    links: [
      { to: '/progetto', label: 'Il progetto' },
      { to: '/progetto/foto', label: 'Foto' },
      { to: '/sponsor', label: 'Partner' },
    ],
  },
  {
    title: 'Seguici',
    links: [
      { href: 'https://radiorama.online/', label: 'Radio Rama' },
      { href: 'https://trnews.it/', label: 'Tele Rama' },
      { to: '/social', label: 'Social' },
    ],
  },
];

function todayLabel() {
  return new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function Layout() {
  return (
    <>
      <div className="top-bar">
        <Container>
          <div className="inner">
            <span>{todayLabel()}</span>
            <span>Lecce e provincia</span>
          </div>
        </Container>
      </div>

      <header className="site-masthead">
        <Container>
          <Link to="/" className="masthead-brand">
            <span className="masthead-text masthead-text-left">Gazzetta</span>
            <img
              className="stemma-lecce"
              src="/assets/stemma-lecce.png"
              alt="Stemma della Città di Lecce"
              width="88"
              height="112"
            />
            <span className="masthead-text masthead-text-right">
              della Villa
              <span className="masthead-text-sub">di Lecce</span>
            </span>
          </Link>
          <p className="site-tagline">Notizie · Eventi · Vita cittadina</p>
        </Container>
      </header>

      <Navbar expand="md" className="site-nav sticky-top">
        <Container>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav>
              <Nav.Link as={NavLink} to="/" end>
                Home
              </Nav.Link>
              <Nav.Link as={NavLink} to="/progetto">
                Il progetto
              </Nav.Link>
              <Nav.Link as={NavLink} to="/progetto/foto">
                Foto
              </Nav.Link>
              <Nav.Link as={NavLink} to="/sezione/notizia">
                Cronaca
              </Nav.Link>
              <Nav.Link as={NavLink} to="/sezione/evento">
                Eventi
              </Nav.Link>
              <Nav.Link as={NavLink} to="/sezione/avviso">
                Avvisi
              </Nav.Link>
              <Nav.Link as={NavLink} to="/sponsor">
                Partner
              </Nav.Link>
              <Nav.Link as={NavLink} to="/social">
                Social
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-3">
        <AdSlot code="header-leaderboard" className="mb-3" />
      </Container>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <Container>
          <p className="footer-kicker">In diretta</p>
          <div className="footer-media">
            {BROADCASTS.map((item) => (
              <a
                key={item.id}
                className={`footer-media-item footer-media-${item.id}`}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="media-mark">
                  <span className="media-mark-kicker">{item.kicker}</span>
                  <span className="media-mark-name">{item.mark}</span>
                </span>
                <span className="footer-media-caption">{item.caption}</span>
              </a>
            ))}
          </div>

          <div className="footer-brand-row">
            <p className="footer-brand">Gazzetta della Villa di Lecce</p>
            <div className="footer-social">
              {SOCIALS.map((item) => (
                <a
                  key={item.id}
                  className={`social-${item.id}`}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                >
                  <SocialIcon id={item.id} />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-columns">
            {FOOTER_COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2>{column.title}</h2>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link to={link.to}>{link.label}</Link>
                      ) : (
                        <a href={link.href} target="_blank" rel="noopener noreferrer">
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <p className="footer-legal">
            © {new Date().getFullYear()} Gazzetta della Villa di Lecce. I contenuti sponsorizzati sono
            sempre etichettati.
          </p>
        </Container>
      </footer>
    </>
  );
}
