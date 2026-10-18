import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client';

export default function AdSlot({ code, className = '' }) {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    let alive = true;
    apiGet(`/api/ads/serve/${code}`)
      .then((data) => {
        if (!alive) return;
        setAds(data);
        data.forEach((ad) => {
          apiPost('/api/ads/events', {
            creative_id: ad.id,
            event_type: 'impression',
          }).catch(() => {});
        });
      })
      .catch(() => setAds([]));
    return () => {
      alive = false;
    };
  }, [code]);

  if (!ads.length) return null;

  const ad = ads[0];

  const onClick = () => {
    apiPost('/api/ads/events', {
      creative_id: ad.id,
      event_type: 'click',
    }).catch(() => {});
  };

  return (
    <aside className={`ad-slot ${className}`} aria-label="Pubblicità">
      <div className="ad-label">Pubblicità · {ad.company_name}</div>
      {ad.kind === 'sponsored_post' ? (
        <div className="sponsored-feed mb-0">
          <strong>{ad.title}</strong>
          {ad.html_body && <p className="mb-1 mt-1 small">{ad.html_body}</p>}
          {ad.click_url && (
            <a href={ad.click_url} target="_blank" rel="noopener noreferrer sponsored" onClick={onClick}>
              Scopri di più
            </a>
          )}
        </div>
      ) : (
        <div>
          {ad.image_url ? (
            <a href={ad.click_url || '#'} target="_blank" rel="noopener noreferrer sponsored" onClick={onClick}>
              <img src={ad.image_url} alt={ad.title || 'Banner'} className="img-fluid" />
            </a>
          ) : (
            <a href={ad.click_url || '#'} target="_blank" rel="noopener noreferrer sponsored" onClick={onClick}>
              {ad.title || 'Scopri l’offerta'}
            </a>
          )}
        </div>
      )}
    </aside>
  );
}
