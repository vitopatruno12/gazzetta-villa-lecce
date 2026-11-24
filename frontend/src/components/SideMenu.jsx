import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import SocialIcon from './SocialIcon';
import { EVENT_CATEGORIES } from '../data/eventsCalendar';
import { BROADCASTS, SOCIALS } from '../data/social';

const SECTIONS = [
  { to: '/', label: 'Home', end: true },
  { to: '/foto', label: 'Foto e Video' },
  { to: '/sezione/notizia', label: 'Cronaca' },
  { to: '/sezione/evento', label: 'Eventi' },
  { to: '/sezione/avviso', label: 'Avvisi' },
];

const VILLA = [
  { to: '/progetto', label: 'Il progetto' },
  { to: '/sponsor', label: 'Partner' },
];

export default function SideMenu({ open, onClose }) {
  const titleId = useId();
  const closeRef = useRef(null);
  const panelRef = useRef(null);
  const [eventsSubOpen, setEventsSubOpen] = useState(false);
  const [projectSubOpen, setProjectSubOpen] = useState(false);
  const [photosSubOpen, setPhotosSubOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !panelRef.current) return undefined;

    const focusables = panelRef.current.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    const onTab = (event) => {
      if (event.key !== 'Tab' || focusables.length === 0) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onTab);
    return () => document.removeEventListener('keydown', onTab);
  }, [open]);

  return (
    <div className={`side-menu${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <button
        type="button"
        className="side-menu-backdrop"
        tabIndex={open ? 0 : -1}
        aria-label="Chiudi menu"
        onClick={onClose}
      />

      <aside
        id="side-menu"
        ref={panelRef}
        className="side-menu-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!open || undefined}
      >
        <div className="side-menu-head">
          <p id={titleId} className="side-menu-title">
            Menu
          </p>
          <button
            ref={closeRef}
            type="button"
            className="side-menu-close"
            aria-label="Chiudi menu"
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <nav className="side-menu-nav" aria-label="Sezioni">
          <p className="side-menu-kicker">Sezioni</p>
          <ul>
            {SECTIONS.map((item) =>
              item.to === '/foto' ? (
                <li key={item.to} className="side-menu-has-sub">
                  <div className="side-menu-sub-row">
                    <NavLink to={item.to} end={item.end} onClick={onClose}>
                      {item.label}
                    </NavLink>
                    <button
                      type="button"
                      className={`side-menu-sub-toggle${photosSubOpen ? ' is-open' : ''}`}
                      aria-expanded={photosSubOpen}
                      aria-label="Mostra categorie foto e video"
                      onClick={() => setPhotosSubOpen((prev) => !prev)}
                    >
                      ▾
                    </button>
                  </div>
                  {photosSubOpen && (
                    <ul className="side-menu-sublist">
                      <li>
                        <Link to="/foto" onClick={onClose}>
                          Tutte le foto e i video
                        </Link>
                      </li>
                      <li>
                        <Link to="/foto?categoria=video" onClick={onClose}>
                          Video degli eventi
                        </Link>
                      </li>
                      {EVENT_CATEGORIES.filter((c) => c.id !== 'tutti').map((cat) => (
                        <li key={cat.id}>
                          <Link to={`/foto?categoria=${cat.id}`} onClick={onClose}>
                            {cat.shortLabel}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : item.to === '/sezione/evento' ? (
                <li key={item.to} className="side-menu-has-sub">
                  <div className="side-menu-sub-row">
                    <NavLink to={item.to} end={item.end} onClick={onClose}>
                      {item.label}
                    </NavLink>
                    <button
                      type="button"
                      className={`side-menu-sub-toggle${eventsSubOpen ? ' is-open' : ''}`}
                      aria-expanded={eventsSubOpen}
                      aria-label="Mostra categorie eventi"
                      onClick={() => setEventsSubOpen((prev) => !prev)}
                    >
                      ▾
                    </button>
                  </div>
                  {eventsSubOpen && (
                    <ul className="side-menu-sublist">
                      <li>
                        <Link to="/sezione/evento#calendario" onClick={onClose}>
                          Calendari (Dic 2026 – Feb 2027)
                        </Link>
                      </li>
                      {EVENT_CATEGORIES.filter((c) => c.id !== 'tutti').map((cat) => (
                        <li key={cat.id}>
                          <Link to={`/sezione/evento?categoria=${cat.id}`} onClick={onClose}>
                            {cat.shortLabel}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link to="/articolo/cristiana-vergari-yoga-villa-comunale" onClick={onClose}>
                          Yoga & Pilates · Cristiana Vergari
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} onClick={onClose}>
                    {item.label}
                  </NavLink>
                </li>
              )
            )}
          </ul>

          <p className="side-menu-kicker">La Villa</p>
          <ul>
            {VILLA.map((item) =>
              item.to === '/progetto' ? (
                <li key={item.to} className="side-menu-has-sub">
                  <div className="side-menu-sub-row">
                    <NavLink to={item.to} onClick={onClose}>
                      {item.label}
                    </NavLink>
                    <button
                      type="button"
                      className={`side-menu-sub-toggle${projectSubOpen ? ' is-open' : ''}`}
                      aria-expanded={projectSubOpen}
                      aria-label="Mostra voci del progetto"
                      onClick={() => setProjectSubOpen((prev) => !prev)}
                    >
                      ▾
                    </button>
                  </div>
                  {projectSubOpen && (
                    <ul className="side-menu-sublist">
                      <li>
                        <Link to="/progetto" onClick={onClose}>
                          Il progetto di riqualificazione
                        </Link>
                      </li>
                      <li>
                        <Link to="/progetto/foto" onClick={onClose}>
                          Foto del progetto
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} onClick={onClose}>
                    {item.label}
                  </NavLink>
                </li>
              )
            )}
          </ul>
        </nav>

        <div className="side-menu-broadcasts">
          <p className="side-menu-kicker">In diretta</p>
          <div className="side-menu-broadcast-list">
            {BROADCASTS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>

        <div className="side-menu-social">
          <p className="side-menu-kicker">Social</p>
          <div className="side-menu-social-list">
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
                  onClick={onClose}
                >
                  <SocialIcon id={item.id} />
                </a>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}
