import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client';

const DEFAULT_ROTATE_MS = 8000;

export default function AdSlot({
  code,
  className = '',
  variant = 'default',
  rotateMs = DEFAULT_ROTATE_MS,
}) {
  const [ads, setAds] = useState([]);
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    let alive = true;
    apiGet(`/api/ads/serve/${code}`)
      .then((data) => {
        if (!alive) return;
        setAds(data);
        setIndex(0);
        setBroken(false);
      })
      .catch(() => {
        if (alive) setAds([]);
      });
    return () => {
      alive = false;
    };
  }, [code]);

  useEffect(() => {
    if (ads.length < 2 || !rotateMs) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % ads.length);
      setBroken(false);
    }, rotateMs);
    return () => window.clearInterval(timer);
  }, [ads, rotateMs]);

  useEffect(() => {
    const ad = ads[index];
    if (!ad) return;
    apiPost('/api/ads/events', {
      creative_id: ad.id,
      event_type: 'impression',
    }).catch(() => {});
  }, [ads, index]);

  if (!ads.length) return null;

  const ad = ads[index];
  const image = broken ? ad.company_logo : ad.image_url || ad.company_logo;
  const href = ad.click_url || '/sponsor';
  const external = /^https?:\/\//i.test(href);

  const onClick = () => {
    apiPost('/api/ads/events', {
      creative_id: ad.id,
      event_type: 'click',
    }).catch(() => {});
  };

  return (
    <aside
      className={`ad-slot ad-slot-${variant} ${className}`.trim()}
      aria-label={`Pubblicità · ${ad.company_name}`}
    >
      <div className="ad-label">Pubblicità · {ad.company_name}</div>
      {ad.kind === 'sponsored_post' ? (
        <div className="sponsored-feed mb-0">
          <strong>{ad.title}</strong>
          {ad.html_body && <p className="mb-1 mt-1 small">{ad.html_body}</p>}
          {ad.click_url && (
            <a
              href={ad.click_url}
              target={/^https?:\/\//i.test(ad.click_url) ? '_blank' : undefined}
              rel={/^https?:\/\//i.test(ad.click_url) ? 'noopener noreferrer sponsored' : undefined}
              onClick={onClick}
            >
              Scopri di più
            </a>
          )}
        </div>
      ) : (
        <a
          className="ad-slot-link"
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer sponsored' : undefined}
          onClick={onClick}
        >
          <span className="ad-slot-frame" key={ad.id}>
            {image ? (
              <img
                src={image}
                alt={ad.title || ad.company_name || 'Banner'}
                onError={() => {
                  if (!broken && ad.company_logo && ad.company_logo !== image) {
                    setBroken(true);
                  }
                }}
              />
            ) : (
              <span className="ad-slot-fallback">{ad.title || 'Scopri l’offerta'}</span>
            )}
          </span>
        </a>
      )}
      {ads.length > 1 && (
        <div className="ad-slot-dots" role="tablist" aria-label="Scorri banner pubblicitari">
          {ads.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              className={dotIndex === index ? 'is-active' : ''}
              aria-label={`Mostra ${item.company_name || item.title || `banner ${dotIndex + 1}`}`}
              onClick={() => {
                setIndex(dotIndex);
                setBroken(false);
              }}
            />
          ))}
        </div>
      )}
    </aside>
  );
}
