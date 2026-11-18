'use client';

import Link from 'next/link';
import { assetPath } from '../lib/asset-path';
import { useEffect, useState } from 'react';

export function Preview({ entry, eager = false, detail = false }) {
  const [failed, setFailed] = useState(false);
  const src = entry.image_url;
  const allowed = src?.startsWith('/previews/') || src?.startsWith('https://');
  return (
    <div className={`preview${detail ? ' preview-detail' : ''}`}>
      {failed || !allowed ? <span className="image-fallback">Preview unavailable</span> :
        <img src={assetPath(src)} alt={entry.image_alt || entry.title}
          loading={eager ? 'eager' : 'lazy'} decoding="async"
          onError={() => setFailed(true)} />}
    </div>
  );
}

export function Gallery({ entries, back = '', eager = false, related = false }) {
  const Title = related ? 'h3' : 'h2';
  return (
    <ul className="gallery">
      {entries.map((entry, index) => (
        <li key={entry.slug}>
          <Link id={entry.slug} className="tile"
            href={`/inspiration/${encodeURIComponent(entry.slug)}${back ? '?from=' + encodeURIComponent(back) : ''}`}>
            <Preview entry={entry} eager={eager && index < 3} />
            <div className="tile-meta">
              <div>
                <Title>{entry.title}</Title>
                <p>{entry.creator || entry.source}</p>
              </div>
              <span aria-hidden="true" className="tile-arrow" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function RestoreGalleryAnchor() {
  useEffect(() => {
    const anchor = window.location.hash.slice(1);
    const tile = anchor && document.getElementById(anchor);
    if (tile) {
      tile.focus({ preventScroll: true });
      tile.scrollIntoView({ block: 'center' });
    }
  }, []);
  return null;
}
