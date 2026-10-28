import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PROJECT_PATH, PROJECT_PHOTOS, PROJECT_SLIDES } from '../data/project';

export default function ProjectPhotosPage() {
  const [index, setIndex] = useState(0);
  const slide = PROJECT_SLIDES[index];
  const total = PROJECT_SLIDES.length;

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowRight') {
        setIndex((current) => Math.min(total - 1, current + 1));
      }
      if (event.key === 'ArrowLeft') {
        setIndex((current) => Math.max(0, current - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);

  return (
    <Container className="py-4 project-page">
      <div className="section-kicker">Il nuovo volto della Villa</div>
      <h1 className="page-title">Foto del progetto</h1>
      <p className="social-lead">
        Planimetrie e tavole dei Giardini pubblici Giuseppe Garibaldi.
      </p>
      <p className="project-callout">
        <Link to={PROJECT_PATH}>Guarda il video</Link>
      </p>

      {PROJECT_PHOTOS.map((photo) => (
        <figure className="project-photo" key={photo.src}>
          <img src={photo.src} alt={photo.caption} />
          <figcaption>{photo.caption}</figcaption>
        </figure>
      ))}

      <div className="project-deck">
        <div className="section-kicker">Tavole</div>
        <figure className="project-slide">
          <img src={slide.src} alt={slide.caption} />
          <figcaption>
            <span>{slide.caption}</span>
            <span>
              {index + 1} / {total}
            </span>
          </figcaption>
        </figure>
        <div className="project-controls">
          <button type="button" onClick={() => setIndex((n) => Math.max(0, n - 1))} disabled={index === 0}>
            Precedente
          </button>
          <button
            type="button"
            onClick={() => setIndex((n) => Math.min(total - 1, n + 1))}
            disabled={index === total - 1}
          >
            Successiva
          </button>
        </div>
        <div className="project-thumbs" role="list">
          {PROJECT_SLIDES.map((item, i) => (
            <button
              key={item.src}
              type="button"
              className={i === index ? 'is-active' : undefined}
              onClick={() => setIndex(i)}
              aria-label={`Tavola ${i + 1}: ${item.caption}`}
              aria-current={i === index ? 'true' : undefined}
            >
              <img src={item.thumb} alt="" />
            </button>
          ))}
        </div>
      </div>
    </Container>
  );
}
