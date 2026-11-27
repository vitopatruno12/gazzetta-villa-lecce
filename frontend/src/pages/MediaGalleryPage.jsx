import { useEffect, useMemo, useState } from 'react';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { apiGet } from '../api/client';
import FacebookVideo from '../components/FacebookVideo';
import PageAside from '../components/PageAside';
import SeoHead, { SITE_URL } from '../components/SeoHead';
import {
  EVENT_CATEGORIES,
  SLUG_CATEGORIES,
  categoryLabelOf,
} from '../data/eventsCalendar';
import { PROJECT_PATH, PROJECT_PHOTOS_PATH, PROJECT_VIDEO } from '../data/project';

export const MEDIA_FILTERS = [
  { id: 'tutti', label: 'Tutte le foto e i video', shortLabel: 'Tutto' },
  { id: 'video', label: 'Video degli eventi e della Villa', shortLabel: 'Video' },
  ...EVENT_CATEGORIES.filter((cat) => cat.id !== 'tutti'),
];

const EVENT_PRIORITY = [
  'un-natale-in-villa',
  'cristiana-vergari-yoga-villa-comunale',
  'spettacolo-con-i-falchi',
  'laboratorio-cartapesta-e-argilla',
  'mercatini-di-natale-in-villa',
  'stefania-quarta-casa-quarta',
  'trh-this',
  'nitecity',
  'metropolitan-trio-christmas',
  'le-circostanze',
  'the-dytt',
  'villaggio-di-babbo-natale',
  'festa-immacolata-villa-comunale',
  'passeggiata-con-i-pony',
  'musica-live-e-jam-session',
  'lecce-comic',
];

function parseGallery(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function VideoPlayer({ url, title }) {
  if (!url) return null;
  return <FacebookVideo url={url} title={title} />;
}

export default function MediaGalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawCategory = searchParams.get('categoria') || 'tutti';
  const activeFilter = MEDIA_FILTERS.some((f) => f.id === rawCategory) ? rawCategory : 'tutti';

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    setLoading(true);
    apiGet('/api/articles?limit=60')
      .then((rows) => setArticles(Array.isArray(rows) ? rows : []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  const orderedEvents = useMemo(() => {
    const events = articles.filter((a) => a.type === 'evento');
    return [...events].sort((a, b) => {
      const ia = EVENT_PRIORITY.indexOf(a.slug);
      const ib = EVENT_PRIORITY.indexOf(b.slug);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return 0;
    });
  }, [articles]);

  const allVideos = useMemo(() => {
    const list = [];
    const seenUrls = new Set();
    const VIDEO_ORDER = ['un-natale-in-villa', 'laboratorio-cartapesta-e-argilla'];
    const sortedForVideo = [...articles].sort((a, b) => {
      const ia = VIDEO_ORDER.indexOf(a.slug);
      const ib = VIDEO_ORDER.indexOf(b.slug);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return 0;
    });

    for (const art of sortedForVideo) {
      if (!art.video_url || seenUrls.has(art.video_url)) continue;
      seenUrls.add(art.video_url);
      const cats = SLUG_CATEGORIES[art.slug] || (art.type === 'evento' ? ['musica'] : []);
      const isNatale = art.slug === 'un-natale-in-villa';
      const hasCoverAndVideo = Boolean(art.cover_url && art.video_url);
      list.push({
        id: `art-video-${art.id}`,
        title: isNatale ? `${art.title} · Un mese pieno di spettacoli` : art.title,
        subtitle: isNatale
          ? 'Dal 5 dicembre al 6 gennaio in Villa Comunale: musica dal vivo, mercatini, spettacoli e attività per famiglie.'
          : art.subtitle || 'Servizio video e approfondimento dalla Villa Comunale di Lecce',
        videoUrl: art.video_url,
        to: hasCoverAndVideo ? `/articolo/${art.slug}#video` : `/articolo/${art.slug}`,
        linkLabel: art.type === 'evento' ? 'Vai all’evento →' : 'Leggi l’articolo →',
        kicker: isNatale
          ? 'Video Promo · Natale in Villa'
          : art.type === 'evento'
            ? 'Video Evento · La Villa'
            : 'Servizio Video · TeleRama',
        categories: cats,
      });
    }

    if (!seenUrls.has(PROJECT_VIDEO)) {
      list.push({
        id: 'project-video-garibaldi',
        title: 'Giardini pubblici Giuseppe Garibaldi · Il nuovo volto della Villa',
        subtitle:
          'Video ufficiale di presentazione degli spazi per eventi, mercatini, laboratori, ludoteca, bar e aree verdi.',
        videoUrl: PROJECT_VIDEO,
        to: PROJECT_PATH,
        linkLabel: 'Scopri il progetto →',
        kicker: 'Video Ufficiale · La Villa',
        categories: [],
      });
    }

    return list;
  }, [articles]);

  const allPhotos = useMemo(() => {
    const items = [];
    const globalSeen = new Set();

    for (const ev of orderedEvents) {
      const rawUrls = [ev.cover_url, ...parseGallery(ev.gallery_urls)].filter(Boolean);
      const uniqueForEvent = [...new Set(rawUrls)];
      const cats = SLUG_CATEGORIES[ev.slug] || ['musica'];
      const primaryCat = cats[0] || 'musica';

      uniqueForEvent.forEach((src, idx) => {
        const dedupKey = `${ev.slug}::${src}`;
        if (globalSeen.has(dedupKey)) return;
        globalSeen.add(dedupKey);
        items.push({
          id: `${ev.id}-${idx}`,
          src,
          eventSlug: ev.slug,
          eventTitle: ev.title,
          eventSubtitle: ev.subtitle || '',
          location: ev.location || 'Villa Comunale di Lecce',
          categories: cats,
          primaryCategory: primaryCat,
          primaryCategoryLabel: categoryLabelOf(primaryCat),
          indexInEvent: idx + 1,
          totalInEvent: uniqueForEvent.length,
        });
      });
    }

    return items;
  }, [orderedEvents]);

  const filteredVideos = useMemo(() => {
    if (activeFilter === 'tutti' || activeFilter === 'video') return allVideos;
    return allVideos.filter((v) => v.categories.includes(activeFilter));
  }, [allVideos, activeFilter]);

  const filteredPhotos = useMemo(() => {
    if (activeFilter === 'video') return [];
    if (activeFilter === 'tutti') return allPhotos;
    return allPhotos.filter((p) => p.categories.includes(activeFilter));
  }, [allPhotos, activeFilter]);

  const groupedPhotoSections = useMemo(() => {
    if (activeFilter !== 'tutti') return [];
    const cats = EVENT_CATEGORIES.filter((c) => c.id !== 'tutti');
    return cats
      .map((cat) => {
        const photos = allPhotos.filter((p) => p.primaryCategory === cat.id);
        return {
          ...cat,
          photos,
        };
      })
      .filter((sec) => sec.photos.length > 0);
  }, [allPhotos, activeFilter]);

  const lightboxList = useMemo(() => {
    if (activeFilter === 'tutti') {
      return groupedPhotoSections.flatMap((sec) => sec.photos);
    }
    return filteredPhotos;
  }, [activeFilter, groupedPhotoSections, filteredPhotos]);

  useEffect(() => {
    setLightboxIndex(-1);
  }, [activeFilter]);

  useEffect(() => {
    if (lightboxIndex < 0) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxIndex(-1);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((i) => (i + 1) % lightboxList.length);
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((i) => (i - 1 + lightboxList.length) % lightboxList.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, lightboxList.length]);

  function selectFilter(id) {
    if (!id || id === 'tutti') {
      setSearchParams({});
    } else {
      setSearchParams({ categoria: id });
    }
  }

  function openPhotoInLightbox(photoId) {
    const idx = lightboxList.findIndex((item) => item.id === photoId);
    if (idx !== -1) setLightboxIndex(idx);
  }

  const activeFilterObj = MEDIA_FILTERS.find((f) => f.id === activeFilter) || MEDIA_FILTERS[0];
  const canonicalPath =
    activeFilter === 'tutti' ? '/foto' : `/foto?categoria=${encodeURIComponent(activeFilter)}`;

  const activeLightboxItem = lightboxIndex >= 0 ? lightboxList[lightboxIndex] : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${activeFilterObj.label} – Villa Comunale di Lecce`,
    description:
      'Galleria fotografica e video degli eventi della Villa Comunale Giuseppe Garibaldi di Lecce: Natale in Villa, mercatini, laboratori, concerti, yoga e attività per famiglie.',
    url: `${SITE_URL}${canonicalPath}`,
  };

  return (
    <Container className="py-4 sheet-section media-gallery-page">
      <SeoHead
        title={`${activeFilterObj.label} – Galleria Eventi | Villa Comunale di Lecce`}
        description="Tutte le foto e i video degli eventi alla Villa Comunale Giuseppe Garibaldi di Lecce: concerti live, yoga e pilates, mercatini dell’artigianato, laboratori Villa Lab, rapaci e Natale in Villa."
        keywords="foto eventi Villa Comunale Lecce, video Villa Comunale Lecce, galleria Natale in Villa, foto concerti Villa Comunale, foto mercatini Lecce"
        canonicalPath={canonicalPath}
        jsonLd={jsonLd}
      />

      <Row className="g-4 sheet-frame">
        <Col lg={8} className="sheet-main">
          <header className="section-banner">
            <div className="section-kicker">Archivio Multimediale · Giardini Giuseppe Garibaldi</div>
            <h1 className="page-title">
              {activeFilter === 'tutti'
                ? 'Foto e Video degli Eventi'
                : activeFilterObj.label}
            </h1>
            <p className="media-gallery-lead">
              Raccolta fotografica e video di tutti gli appuntamenti, i concerti dal vivo, i
              mercatini artigianali, i laboratori creativi e le attività settimanali che animano la
              Villa Comunale di Lecce.
            </p>
            <p className="media-project-hint">
              Cerchi le planimetrie e le tavole architettoniche di riqualificazione?{' '}
              <Link to={PROJECT_PHOTOS_PATH}>Vai a Foto del progetto →</Link>
            </p>
          </header>

          <div className="media-filter-bar" role="navigation" aria-label="Filtra foto e video per categoria">
            <div className="media-filter-pills">
              {MEDIA_FILTERS.map((filter) => {
                const isActive = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    className={`media-filter-pill${isActive ? ' is-active' : ''}`}
                    onClick={() => selectFilter(filter.id)}
                  >
                    {filter.id === 'video' ? `▶ ${filter.shortLabel}` : filter.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="py-5 text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              {filteredVideos.length > 0 && (
                <section className="media-section" aria-label="Video degli eventi e della Villa">
                  <div className="media-section-head">
                    <h2 className="section-head mb-0">
                      {activeFilter === 'video'
                        ? `Tutti i Video (${filteredVideos.length})`
                        : 'Video in evidenza'}
                    </h2>
                    {activeFilter !== 'video' && (
                      <button
                        type="button"
                        className="media-see-all-btn"
                        onClick={() => selectFilter('video')}
                      >
                        Solo video →
                      </button>
                    )}
                  </div>

                  <div className="media-video-list">
                    {filteredVideos.map((video) => (
                      <article className="media-video-card" key={video.id}>
                        <div className="section-kicker mb-1">{video.kicker}</div>
                        <h3 className="media-video-title">
                          <Link to={video.to}>{video.title}</Link>
                        </h3>
                        {video.subtitle && <p className="media-video-sub">{video.subtitle}</p>}
                        <VideoPlayer url={video.videoUrl} title={video.title} />
                        <div className="media-video-foot">
                          <Link to={video.to} className="media-event-link">
                            {video.linkLabel}
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {activeFilter === 'video' ? null : activeFilter === 'tutti' ? (
                groupedPhotoSections.map((sec) => (
                  <section className="media-section" key={sec.id}>
                    <div className="media-section-head">
                      <h2 className="section-head mb-0">{sec.label}</h2>
                      <div className="media-section-actions">
                        <button
                          type="button"
                          className="media-see-all-btn"
                          onClick={() => selectFilter(sec.id)}
                        >
                          Filtra ({sec.photos.length})
                        </button>
                        <Link
                          to={`/sezione/evento?categoria=${sec.id}`}
                          className="media-event-link"
                        >
                          Eventi della categoria →
                        </Link>
                      </div>
                    </div>

                    <div className="media-photo-grid">
                      {sec.photos.map((photo) => (
                        <MediaPhotoCard
                          key={photo.id}
                          photo={photo}
                          onOpen={() => openPhotoInLightbox(photo.id)}
                        />
                      ))}
                    </div>
                  </section>
                ))
              ) : filteredPhotos.length > 0 ? (
                <section className="media-section">
                  <div className="media-section-head">
                    <h2 className="section-head mb-0">
                      {activeFilterObj.label} ({filteredPhotos.length} foto)
                    </h2>
                    <Link
                      to={`/sezione/evento?categoria=${activeFilter}`}
                      className="media-event-link"
                    >
                      Vai agli eventi di questa categoria →
                    </Link>
                  </div>

                  <div className="media-photo-grid">
                    {filteredPhotos.map((photo) => (
                      <MediaPhotoCard
                        key={photo.id}
                        photo={photo}
                        onOpen={() => openPhotoInLightbox(photo.id)}
                      />
                    ))}
                  </div>
                </section>
              ) : (
                <p className="text-muted py-4">
                  Nessun contenuto multimediale presente in questa categoria al momento.
                </p>
              )}
            </>
          )}
        </Col>

        <Col lg={4} className="sheet-side">
          <PageAside activeTo="/foto" />
        </Col>
      </Row>

      {activeLightboxItem && (
        <div
          className="media-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={activeLightboxItem.eventTitle}
          onClick={() => setLightboxIndex(-1)}
        >
          <div className="media-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="media-lightbox-top">
              <div>
                <span className="section-kicker">{activeLightboxItem.primaryCategoryLabel}</span>
                <h3 className="media-lightbox-title">{activeLightboxItem.eventTitle}</h3>
              </div>
              <button
                type="button"
                className="media-lightbox-close"
                aria-label="Chiudi ingrandimento"
                onClick={() => setLightboxIndex(-1)}
              >
                ×
              </button>
            </div>

            <div className="media-lightbox-stage">
              {lightboxList.length > 1 && (
                <button
                  type="button"
                  className="media-lightbox-nav media-lightbox-prev"
                  aria-label="Foto precedente"
                  onClick={() =>
                    setLightboxIndex((i) => (i - 1 + lightboxList.length) % lightboxList.length)
                  }
                >
                  ‹
                </button>
              )}
              <img
                src={activeLightboxItem.src}
                alt={activeLightboxItem.eventTitle}
                className="media-lightbox-img"
              />
              {lightboxList.length > 1 && (
                <button
                  type="button"
                  className="media-lightbox-nav media-lightbox-next"
                  aria-label="Foto successiva"
                  onClick={() => setLightboxIndex((i) => (i + 1) % lightboxList.length)}
                >
                  ›
                </button>
              )}
            </div>

            <div className="media-lightbox-foot">
              <span className="media-lightbox-count">
                Foto {lightboxIndex + 1} di {lightboxList.length}
              </span>
              <Link
                to={`/articolo/${activeLightboxItem.eventSlug}`}
                className="media-event-link"
                onClick={() => setLightboxIndex(-1)}
              >
                Vai alla scheda dell’evento →
              </Link>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

function MediaPhotoCard({ photo, onOpen }) {
  return (
    <figure className="media-photo-card">
      <button
        type="button"
        className="media-photo-thumb"
        onClick={onOpen}
        aria-label={`Ingrandisci foto di ${photo.eventTitle}`}
      >
        <img src={photo.src} alt={photo.eventTitle} loading="lazy" />
        {photo.totalInEvent > 1 && (
          <span className="media-photo-badge">
            {photo.indexInEvent}/{photo.totalInEvent}
          </span>
        )}
      </button>
      <figcaption className="media-photo-caption">
        <span className="media-photo-cat">{photo.primaryCategoryLabel}</span>
        <Link to={`/articolo/${photo.eventSlug}`} className="media-photo-title">
          {photo.eventTitle}
        </Link>
      </figcaption>
    </figure>
  );
}
