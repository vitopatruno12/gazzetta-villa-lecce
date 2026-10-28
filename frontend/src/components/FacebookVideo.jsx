function embedSrc(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host !== 'facebook.com' && host !== 'fb.watch') return null;
    const href = encodeURIComponent(url);
    return `https://www.facebook.com/plugins/video.php?href=${href}&show_text=false&width=560`;
  } catch {
    return null;
  }
}

export default function FacebookVideo({ url }) {
  const src = embedSrc(url);
  if (!src) return null;

  return (
    <div className="fb-video">
      <iframe
        src={src}
        title="Video Facebook"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
