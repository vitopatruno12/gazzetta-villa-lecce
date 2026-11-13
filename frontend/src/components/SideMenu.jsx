import { useEffect, useId, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import SocialIcon from './SocialIcon';
import { BROADCASTS, SOCIALS } from '../data/social';

const SECTIONS = [
  { to: '/', label: 'Home', end: true },
  { to: '/sezione/notizia', label: 'Cronaca' },
  { to: '/sezione/evento', label: 'Eventi' },
  { to: '/sezione/avviso', label: 'Avvisi' },
];

const VILLA = [
  { to: '/progetto', label: 'Il progetto', end: true },
  { to: '/progetto/foto', label: 'Foto' },
  { to: '/sponsor', label: 'Partner' },
];

export default function SideMenu({ open, onClose }) {
  const titleId = useId();
  const closeRef = useRef(null);
  const panelRef = useRef(null);

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
            {SECTIONS.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} onClick={onClose}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <p className="side-menu-kicker">La Villa</p>
          <ul>
            {VILLA.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} onClick={onClose}>
                  {item.label}
                </NavLink>
              </li>
            ))}
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
            {SOCIALS.map((item) => (
              <a
                key={item.id}
                className={`social-${item.id}`}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.name}
                onClick={onClose}
              >
                <SocialIcon id={item.id} />
              </a>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
