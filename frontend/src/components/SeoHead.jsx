import { useEffect } from 'react';

export const SITE_NAME = 'La Villa Comunale di Lecce';
export const SITE_URL = 'https://www.villacomunalelecce.it';
export const DEFAULT_KEYWORDS = [
  'Villa Comunale Lecce',
  'Villa Comunale',
  'Giuseppe Garibaldi Lecce',
  'Giardini pubblici Giuseppe Garibaldi Lecce',
  'Natale in Villa',
  'Natale in Villa Lecce',
  'eventi Villa Comunale',
  'eventi Villa Comunale Lecce',
  'mercatini di Natale',
  'mercatini di Natale Lecce',
  'mercatini di Natale Villa Comunale',
  'eventi musicali Villa Comunale',
  'concerti Villa Comunale Lecce',
  'laboratori Villa Comunale',
  'laboratori creativi Lecce',
  'yoga Villa Comunale Lecce',
].join(', ');

function upsertMeta(attrName, attrValue, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function toAbsoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return `${SITE_URL}/`;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const prefix = pathOrUrl.startsWith('/') ? '' : '/';
  return `${SITE_URL}${prefix}${pathOrUrl}`;
}

export default function SeoHead({
  title,
  description,
  keywords = DEFAULT_KEYWORDS,
  canonicalPath,
  image = '/assets/logo-villa-comunale.png',
  type = 'website',
  noindex = false,
  jsonLd = null,
}) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | ${SITE_NAME}`
      : `${SITE_NAME} – Giardini Pubblici Giuseppe Garibaldi | Eventi, Natale in Villa e Mercatini`;

    const desc =
      description ||
      'La Villa Comunale di Lecce (Giardini pubblici Giuseppe Garibaldi): calendario eventi Villa Comunale, Natale in Villa, mercatini di Natale, eventi musicali, laboratori creativi, yoga e notizie.';

    const canonicalUrl = canonicalPath
      ? toAbsoluteUrl(canonicalPath)
      : toAbsoluteUrl(`${window.location.pathname}${window.location.search}`);

    const imageUrl = toAbsoluteUrl(image);

    document.title = fullTitle;
    upsertMeta('name', 'description', desc);
    upsertMeta('name', 'keywords', keywords);
    upsertMeta(
      'name',
      'robots',
      noindex
        ? 'noindex, follow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );
    upsertLink('canonical', canonicalUrl);

    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', 'it_IT');
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', imageUrl);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', imageUrl);

    let ldScript = document.getElementById('dynamic-seo-jsonld');
    if (jsonLd) {
      if (!ldScript) {
        ldScript = document.createElement('script');
        ldScript.id = 'dynamic-seo-jsonld';
        ldScript.type = 'application/ld+json';
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(jsonLd);
    } else if (ldScript) {
      ldScript.remove();
    }
  }, [title, description, keywords, canonicalPath, image, type, noindex, jsonLd]);

  return null;
}
