import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const KNOWN_POSTERS = {
  '/eventi/natale-in-villa/video-natale-in-villa.mp4':
    '/eventi/natale-in-villa/video-natale-in-villa-poster.jpg',
  '/eventi/villa-lab/video-villa-lab.mp4':
    '/eventi/villa-lab/video-villa-lab-poster.jpg',
};

function isDirectVideoFile(url) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(String(url));
}

function parseYouTubeEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url, 'https://www.villacomunalelecce.it');
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = u.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

function embedFacebookSrc(url, width) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host !== 'facebook.com' && host !== 'fb.watch') return null;
    const href = encodeURIComponent(url);
    const safeWidth = Math.max(260, Math.round(width || 840));
    return `https://www.facebook.com/plugins/video.php?href=${href}&show_text=false&width=${safeWidth}`;
  } catch {
    return null;
  }
}

export default function FacebookVideo({ url, poster, title }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(0);

  const directFile = isDirectVideoFile(url);
  const youtubeEmbed = !directFile ? parseYouTubeEmbed(url) : null;
  const isFacebook = !directFile && !youtubeEmbed && Boolean(embedFacebookSrc(url, 840));

  useLayoutEffect(() => {
    if (!isFacebook) return;
    if (wrapRef.current) {
      setWidth(wrapRef.current.clientWidth || 840);
    }
  }, [isFacebook, url]);

  useEffect(() => {
    if (!isFacebook) return undefined;
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver !== 'function') return undefined;
    let timer = null;
    const observer = new ResizeObserver((entries) => {
      const next = Math.round(entries[0]?.contentRect?.width || el.clientWidth || 0);
      if (!next) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        setWidth((prev) => (Math.abs(prev - next) > 8 ? next : prev));
      }, 150);
    });
    observer.observe(el);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [isFacebook, url]);

  if (!url) return null;

  if (directFile) {
    const resolvedPoster = poster || KNOWN_POSTERS[url] || undefined;
    return (
      <div className="native-video-stage">
        <video
          className="native-video-player"
          controls
          playsInline
          preload="metadata"
          poster={resolvedPoster}
          aria-label={title || 'Video La Villa Comunale di Lecce'}
        >
          <source src={url} type="video/mp4" />
          Il tuo browser non supporta la riproduzione video HTML5.
        </video>
      </div>
    );
  }

  if (youtubeEmbed) {
    return (
      <div className="fb-video">
        <iframe
          src={youtubeEmbed}
          title={title || 'Video YouTube'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (!isFacebook) return null;
  const src = width > 0 ? embedFacebookSrc(url, width) : null;

  return (
    <div ref={wrapRef} className="fb-video">
      {src && (
        <iframe
          src={src}
          title={title || 'Video Facebook'}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
}
