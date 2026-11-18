import { useEffect, useLayoutEffect, useRef, useState } from 'react';

function embedSrc(url, width) {
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

export default function FacebookVideo({ url }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (wrapRef.current) {
      setWidth(wrapRef.current.clientWidth || 840);
    }
  }, []);

  useEffect(() => {
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
  }, []);

  const src = width > 0 ? embedSrc(url, width) : null;
  if (!embedSrc(url, 840)) return null;

  return (
    <div ref={wrapRef} className="fb-video">
      {src && (
        <iframe
          src={src}
          title="Video Facebook"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
}
