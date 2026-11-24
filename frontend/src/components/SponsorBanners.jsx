import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../api/client';

const SPONSOR_LINKS = {
  'quarta-caffe': '/articolo/stefania-quarta-casa-quarta',
  'cristiana-vergari-academy': '/articolo/cristiana-vergari-yoga-villa-comunale',
};

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
      <h2 className="section-head">Pubblicità</h2>
      <div className="sponsor-banner-row">
        {companies.map((company) => {
          const internalTo = SPONSOR_LINKS[company.slug];
          const externalHref =
            !internalTo && company.website && !company.website.includes('example.com')
              ? company.website
              : null;
          if (externalHref) {
            return (
              <a
                className="sponsor-banner"
                href={externalHref}
                target="_blank"
                rel="noopener noreferrer"
                key={company.id}
              >
                <img src={company.logo_url} alt={company.name} />
              </a>
            );
          }
          return (
            <Link
              className="sponsor-banner"
              to={internalTo || '/sponsor'}
              key={company.id}
            >
              <img src={company.logo_url} alt={company.name} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
