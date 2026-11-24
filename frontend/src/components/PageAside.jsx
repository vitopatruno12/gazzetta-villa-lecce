import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../api/client';
import AdSlot from './AdSlot';
import FacebookVideo from './FacebookVideo';

const MENU = [
  { to: '/foto', label: 'Foto' },
  { to: '/sezione/notizia', label: 'Cronaca' },
  { to: '/sezione/evento', label: 'Eventi' },
  { to: '/sezione/avviso', label: 'Avvisi' },
  { to: '/progetto', label: 'Il progetto' },
];

const QUICK_CALENDAR = [
  { when: 'Tutti i venerdì', label: 'Yoga, Pilates & Yoga Bambini', to: '/articolo/cristiana-vergari-yoga-villa-comunale' },
  { when: 'Tutte le domeniche', label: 'Passeggiata con i Pony', to: '/articolo/passeggiata-con-i-pony' },
  { when: 'Dal 5 dicembre', label: 'Mercatini dell’Artigianato Salentino', to: '/articolo/mercatini-di-natale-in-villa' },
  { when: '11 e 24 dic · 1 gen', label: 'Rapaci in Villa · Yuna Lucky Owl', to: '/articolo/spettacolo-con-i-falchi' },
  { when: '23 – 27 dicembre', label: 'Il Villaggio di Babbo Natale', to: '/articolo/villaggio-di-babbo-natale' },
  { when: 'Dicembre – Gennaio', label: 'Villa Lab · Cartapesta e Terracotta', to: '/articolo/laboratorio-cartapesta-e-argilla' },
  { when: 'Febbraio 2027', label: 'Lecce Comic · Fumetto e Cultura Pop', to: '/articolo/lecce-comic' },
];

const TYPE_LABEL = {
  notizia: 'Cronaca',
  evento: 'Evento',
  avviso: 'Avviso',
  sponsorizzato: 'Sponsor',
};

export default function PageAside({ excludeSlug = '', activeTo = '', skipType = '' }) {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    apiGet('/api/articles?limit=30')
      .then(setArticles)
      .catch(() => setArticles([]));
  }, []);

  const others = articles.filter((article) => article.slug !== excludeSlug);
  const preferred = skipType ? others.filter((article) => article.type !== skipType) : others;
  const filler = others.filter((article) => !preferred.some((item) => item.slug === article.slug));
  const ordered = [...preferred, ...filler];
  const video = ordered.find((article) => article.video_url);
  const news = ordered.filter((article) => article.slug !== video?.slug).slice(0, 14);

  return (
    <aside className="page-aside">
      <nav className="aside-menu" aria-label="Sezioni">
        {MENU.map((item) => (
          <Link key={item.to} to={item.to} className={item.to === activeTo ? 'is-active' : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>

      <AdSlot code="sidebar-home" variant="panel" className="mb-4" />

      <section className="sidebar-block aside-editorial-box">
        <div className="section-kicker mb-1">Giardini Giuseppe Garibaldi</div>
        <h3 className="aside-box-title">La Villa Comunale vive tutto l’anno</h3>
        <p className="aside-box-text">
          Polmone verde storico nel cuore di Lecce, i Giardini pubblici Giuseppe Garibaldi sono da
          oltre un secolo il luogo d’incontro privilegiato della città: tra viali alberati
          monumentali, sculture storiche e l’iconico tempietto armonico, il parco accoglie
          famiglie, bambini, giovani e visitatori con un calendario continuo di mercatini
          dell’artigianato salentino, laboratori creativi di cartapesta e creta, concerti dal vivo,
          educazione ambientale e attività dedicate al benessere psicofisico all’aria aperta.
        </p>
        <Link to="/progetto" className="aside-box-link">
          Scopri il progetto di riqualificazione →
        </Link>
      </section>

      {video && (
        <section className="sidebar-block">
          <h2 className="section-head">Video</h2>
          <Link to={`/articolo/${video.slug}`} className="aside-title">
            {video.title}
          </Link>
          <FacebookVideo url={video.video_url} />
        </section>
      )}

      <section className="sidebar-block">
        <h2 className="section-head">Appuntamenti chiave</h2>
        <ul className="list-unstyled mb-0">
          {QUICK_CALENDAR.filter((item) => !item.to.endsWith(`/${excludeSlug}`)).map((item) => (
            <li key={item.to}>
              <div className="section-kicker mb-1">{item.when}</div>
              <Link to={item.to} className="aside-title">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {news.length > 0 && (
        <section className="sidebar-block">
          <h2 className="section-head">Altre notizie</h2>
          <ul className="list-unstyled mb-0">
            {news.map((article) => (
              <li key={article.id}>
                <div className="section-kicker mb-1">{TYPE_LABEL[article.type] || article.type}</div>
                <Link to={`/articolo/${article.slug}`} className="aside-title">
                  {article.title}
                </Link>
                {article.subtitle && <p className="aside-deck">{article.subtitle}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="sidebar-block">
        <h2 className="section-head">In diretta & Contatti</h2>
        <ul className="list-unstyled mb-0 aside-live">
          <li>
            <a href="https://radiorama.online/" target="_blank" rel="noopener noreferrer">
              Radio Rama · Diretta radio
            </a>
          </li>
          <li>
            <a href="https://trnews.it/" target="_blank" rel="noopener noreferrer">
              Tele Rama · Diretta TV
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/lavillacomunale_lecce/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram · @lavillacomunale_lecce
            </a>
          </li>
        </ul>
      </section>
    </aside>
  );
}
