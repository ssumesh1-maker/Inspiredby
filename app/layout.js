import { existsSync } from 'node:fs';
import { join } from 'node:path';
import Link from 'next/link';
import { assetPath } from '../lib/asset-path';
import './styles.css';

export const metadata = {
  title: { default: 'Inspiredby™', template: '%s · Inspiredby™' },
  description: 'A curated gallery of visual inspiration.'
};

const wordmark = ['svg', 'png', 'webp', 'jpg', 'jpeg'].find((ext) =>
  existsSync(join(process.cwd(), 'public', 'brand', `wordmark.${ext}`))
);

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#content">Skip to content</a>
        <header className="site-header">
          <div className="shell header-inner">
            <Link className="home-link" href="/" aria-label="Inspiredby home">
              {wordmark ? <img src={assetPath(`/brand/wordmark.${wordmark}`)} alt="Inspiredby™" /> : 'Discover'}
            </Link>
            <span className="header-label">Visual reference library</span>
          </div>
        </header>
        {children}
        <footer className="shell site-footer">Inspiredby™</footer>
      </body>
    </html>
  );
}
