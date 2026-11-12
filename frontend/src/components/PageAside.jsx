import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../api/client';
import AdSlot from './AdSlot';
import FacebookVideo from './FacebookVideo';

const MENU = [
  { to: '/sezione/notizia', label: 'Cronaca' },
  { to: '/sezione/evento', label: 'Eventi' },
  { to: '/sezione/avviso', label: 'Avvisi' },
  { to: '/progetto', label: 'Il progetto' },
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
  const news = ordered.filter((article) => article.slug !== video?.slug).slice(0, 6);

  return (
    <aside className="page-aside">
      <nav className="aside-menu" aria-label="Sezioni">
        {MENU.map((item) => (
          <Link key={item.to} to={item.to} className={item.to === activeTo ? 'is-active' : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>

      <AdSlot code="sidebar-home" className="mb-4" />

      {video && (
        <section className="sidebar-block">
          <h2 className="section-head">Video</h2>
          <Link to={`/articolo/${video.slug}`} className="aside-title">
            {video.title}
          </Link>
          <FacebookVideo url={video.video_url} />
        </section>
      )}

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
        <h2 className="section-head">In diretta</h2>
        <ul className="list-unstyled mb-0 aside-live">
          <li>
            <a href="https://radiorama.online/" target="_blank" rel="noopener noreferrer">
              Radio Rama
            </a>
          </li>
          <li>
            <a href="https://trnews.it/" target="_blank" rel="noopener noreferrer">
              Tele Rama
            </a>
          </li>
        </ul>
      </section>
    </aside>
  );
}
