import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../api/client';

export default function SponsorBanners() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    apiGet('/api/companies')
      .then((rows) => setCompanies(rows.filter((company) => company.logo_url)))
      .catch(() => setCompanies([]));
  }, []);

  if (!companies.length) return null;

  return (
    <section className="sponsor-banners" aria-label="Banner delle società sponsor">
      <div className="ad-label">Pubblicità</div>
      <div className="sponsor-banner-row">
        {companies.map((company) => (
          <Link className="sponsor-banner" to="/sponsor" key={company.id}>
            <img src={company.logo_url} alt={company.name} />
          </Link>
        ))}
      </div>
    </section>
  );
}
