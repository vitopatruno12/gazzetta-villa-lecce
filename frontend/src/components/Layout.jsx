import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, NavLink, Outlet } from 'react-router-dom';
import AdSlot from './AdSlot';

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
        <Container className="d-flex flex-wrap justify-content-between gap-2 align-items-center">
          <span>© {new Date().getFullYear()} Gazzetta della Villa di Lecce</span>
          <span>I contenuti sponsorizzati sono sempre etichettati.</span>
        </Container>
      </footer>
    </>
  );
}
