import { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { flushSync } from 'react-dom';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AdSlot from './AdSlot';
import SideMenu from './SideMenu';
import SocialIcon from './SocialIcon';
import WeatherBadge from './WeatherBadge';
import { useClientAuth } from '../auth/ClientAuth';
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

function SearchLens() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');

  useEffect(() => {
    setQ(params.get('q') || '');
  }, [params]);

  function onSubmit(event) {
    event.preventDefault();
    const query = q.trim();
    if (!query) return;
    navigate(`/cerca?q=${encodeURIComponent(query)}`);
  }

  return (
    <form className="top-search" onSubmit={onSubmit} role="search">
      <input
        value={q}
        onChange={(event) => setQ(event.target.value)}
        aria-label="Cerca nel giornale"
        placeholder="Cerca"
      />
      <button type="submit" aria-label="Cerca">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.25" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M15.2 15.2 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}

function usePageTurn() {
  const navigate = useNavigate();
  const location = useLocation();
  const firstKey = useRef(location.key);
  const turnedByView = useRef(false);

  useEffect(() => {
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target.closest('a[href]');
      if (!anchor || anchor.hasAttribute('download')) return;
      if (anchor.target && anchor.target !== '_self') return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (typeof document.startViewTransition !== 'function') return;

      event.preventDefault();
      event.stopPropagation();
      const next = `${url.pathname}${url.search}${url.hash}`;
      turnedByView.current = true;
      document.startViewTransition(() => {
        flushSync(() => {
          navigate(next);
        });
      }).finished.finally(() => {
        turnedByView.current = false;
      });
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [navigate]);

  return {
    location,
    cssTurn: location.key !== firstKey.current && !turnedByView.current,
  };
}

export default function Layout() {
  const { location, cssTurn } = usePageTurn();
  const { user } = useClientAuth();
  const client = user?.role === 'cliente' ? user : null;
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);
  return (
    <div
      className={cssTurn ? 'newspaper-sheet newspaper-sheet-fallback' : 'newspaper-sheet'}
      key={location.key}
    >
      <div className="top-bar">
        <Container>
          <div className="inner">
            <div className="top-place">
              <span>{todayLabel()}</span>
              <span className="top-place-pair">
                <span>Lecce</span>
                <span>Lecce e provincia</span>
              </span>
            </div>
            <div className="top-tools">
              <SearchLens />
              {client ? (
                <Link className="top-login" to="/profilo">
                  {client.first_name || 'Profilo'}
                </Link>
              ) : (
                <>
                  <Link className="top-login" to="/adesione">
                    Adesione
                  </Link>
                  <Link className="top-login" to="/accedi">
                    Accedi
                  </Link>
                </>
              )}
            </div>
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
              <span>
                della <span className="masthead-villa">Villa</span>
              </span>
              <span className="masthead-text-sub">di Lecce</span>
            </span>
            <span className="masthead-rule masthead-rule-left" aria-hidden="true" />
            <span className="masthead-rule masthead-rule-right" aria-hidden="true" />
          </Link>
          <p className="site-tagline">Notizie · Eventi · Vita cittadina</p>
          <WeatherBadge />
        </Container>
      </header>

      <Navbar className="site-nav sticky-top">
        <Container className="site-nav-inner">
          <button
            type="button"
            className={`nav-burger${menuOpen ? ' is-open' : ''}`}
            aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
            aria-expanded={menuOpen}
            aria-controls="side-menu"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>

          <Nav className="site-nav-links">
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
        </Container>
      </Navbar>

      <SideMenu open={menuOpen} onClose={closeMenu} />

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
            <p className="footer-brand">
              Gazzetta
              <span className="footer-brand-place">della Villa di Lecce</span>
            </p>
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
    </div>
  );
}
