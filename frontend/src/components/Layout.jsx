import { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { flushSync } from 'react-dom';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import SideMenu from './SideMenu';
import SocialIcon from './SocialIcon';
import WeatherBadge from './WeatherBadge';
import { useClientAuth } from '../auth/ClientAuth';
import { EVENT_CATEGORIES, FEATURED_DROPDOWN_EVENTS } from '../data/eventsCalendar';
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
      { to: '/progetto', label: 'Giardini Giuseppe Garibaldi' },
      { to: '/progetto/foto', label: 'Foto del progetto' },
      { to: '/articolo/un-natale-in-villa', label: 'Natale in Villa' },
      { to: '/sezione/evento?categoria=mercatini', label: 'Mercatini di Natale' },
      { to: '/sezione/evento?categoria=musica', label: 'Eventi musicali Villa Comunale' },
      { to: '/sezione/evento?categoria=laboratori', label: 'Laboratori Villa Comunale' },
      { to: '/sezione/evento?categoria=yoga', label: 'Yoga e Benessere in Villa' },
      { to: '/sponsor', label: 'Partner' },
    ],
  },
  {
    title: 'Seguici',
    links: [
      { href: 'https://www.instagram.com/villacomunalelecce/', label: 'Instagram' },
      { href: 'mailto:andiamo.lavilla@gmail.com', label: 'andiamo.lavilla@gmail.com' },
      { href: 'https://radiorama.online/', label: 'Radio Rama' },
      { href: 'https://trnews.it/', label: 'Tele Rama' },
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
          window.scrollTo(0, 0);
        });
      }).finished.finally(() => {
        turnedByView.current = false;
        window.scrollTo(0, 0);
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
  const [eventsHoverOpen, setEventsHoverOpen] = useState(false);
  const [eventsPinnedOpen, setEventsPinnedOpen] = useState(false);
  const eventsDropdownOpen = eventsHoverOpen || eventsPinnedOpen;
  const eventsDropdownRef = useRef(null);
  const closeEventsDropdown = useCallback(() => {
    setEventsHoverOpen(false);
    setEventsPinnedOpen(false);
  }, []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
    closeEventsDropdown();
  }, [location.pathname, location.search, location.hash, closeMenu, closeEventsDropdown]);

  useEffect(() => {
    if (!eventsDropdownOpen) return undefined;
    const onOutside = (event) => {
      if (eventsDropdownRef.current && !eventsDropdownRef.current.contains(event.target)) {
        closeEventsDropdown();
      }
    };
    const onEscape = (event) => {
      if (event.key === 'Escape') closeEventsDropdown();
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [eventsDropdownOpen, closeEventsDropdown]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search, location.key]);

  return (
    <div
      className={cssTurn ? 'newspaper-sheet newspaper-sheet-fallback' : 'newspaper-sheet'}
      key={location.key}
    >
      <div className="top-bar">
        <Container>
          <div className="inner">
            <div className="top-lead">
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
            <div className="top-place">
              <span>{todayLabel()}</span>
              <span className="top-place-pair">
                <span>Lecce</span>
                <span>Lecce e provincia</span>
              </span>
            </div>
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
                    Registrazione
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
            <span className="masthead-text masthead-text-left">LA VILLA</span>
            <img
              className="stemma-lecce"
              src="/assets/logo-villa-comunale.png"
              alt="La Villa Comunale di Lecce"
              width="124"
              height="124"
            />
            <span className="masthead-text masthead-text-right">
              <span className="masthead-villa">COMUNALE</span>
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
          <Nav className="site-nav-links">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/progetto" end>
              Il progetto
            </Nav.Link>
            <Nav.Link as={NavLink} to="/progetto/foto">
              Foto
            </Nav.Link>
            <Nav.Link as={NavLink} to="/sezione/notizia">
              Cronaca
            </Nav.Link>
            <div
              ref={eventsDropdownRef}
              className={`nav-events-dropdown${eventsDropdownOpen ? ' is-open' : ''}`}
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') setEventsHoverOpen(true);
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === 'mouse') setEventsHoverOpen(false);
              }}
            >
              <div className="nav-events-trigger">
                <Nav.Link as={NavLink} to="/sezione/evento">
                  Eventi
                </Nav.Link>
                <button
                  type="button"
                  className="nav-events-caret"
                  aria-label="Apri categorie e calendari eventi"
                  aria-expanded={eventsDropdownOpen}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (eventsPinnedOpen) {
                      closeEventsDropdown();
                    } else {
                      setEventsPinnedOpen(true);
                    }
                  }}
                >
                  <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
                    <path d="M2.2 4.2 6 8l3.8-3.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <div className="nav-events-menu" role="menu" aria-label="Categorie e calendari eventi">
                <div className="nav-events-col">
                  <div className="nav-events-heading">Calendari & Categorie</div>
                  <Link
                    to="/sezione/evento#calendario"
                    className="nav-events-link nav-events-link-strong"
                    onClick={closeEventsDropdown}
                  >
                    Calendari degli eventi (Dic 2026 – Feb 2027)
                  </Link>
                  {EVENT_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      to={cat.id === 'tutti' ? '/sezione/evento' : `/sezione/evento?categoria=${cat.id}`}
                      className="nav-events-link"
                      onClick={closeEventsDropdown}
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
                <div className="nav-events-col nav-events-col-featured">
                  <div className="nav-events-heading">In programma</div>
                  {FEATURED_DROPDOWN_EVENTS.map((item) => (
                    <Link
                      key={item.slug}
                      to={`/articolo/${item.toSlug || item.slug}`}
                      className="nav-events-feature"
                      onClick={closeEventsDropdown}
                    >
                      <span className="nav-events-when">{item.when}</span>
                      <span className="nav-events-title">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Nav.Link as={NavLink} to="/sezione/avviso">
              Avvisi
            </Nav.Link>
            <Nav.Link as={NavLink} to="/sponsor">
              Partner
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <SideMenu open={menuOpen} onClose={closeMenu} />

      <main className="page-shell">
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
              La Villa Comunale
              <span className="footer-brand-place">di Lecce</span>
            </p>
            <div className="footer-social">
              {SOCIALS.map((item) => {
                const external = /^https?:\/\//i.test(item.href);
                return (
                  <a
                    key={item.id}
                    className={`social-${item.id}`}
                    href={item.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    aria-label={item.name}
                  >
                    <SocialIcon id={item.id} />
                  </a>
                );
              })}
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
                        <a
                          href={link.href}
                          target={/^https?:\/\//i.test(link.href) ? '_blank' : undefined}
                          rel={/^https?:\/\//i.test(link.href) ? 'noopener noreferrer' : undefined}
                        >
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
            © {new Date().getFullYear()} La Villa Comunale di Lecce. I contenuti sponsorizzati sono
            sempre etichettati.
          </p>
        </Container>
      </footer>
    </div>
  );
}
