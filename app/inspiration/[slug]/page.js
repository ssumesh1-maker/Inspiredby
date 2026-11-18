import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getCatalog } from '../../../lib/catalog';
import { relatedEntries } from '../../../lib/discovery';
import { BackToDiscovery, StaticBackToDiscovery } from '../../static-discovery';
import { Gallery, Preview } from '../../gallery';

export async function generateStaticParams() {
  if (process.env.PAGES_PREVIEW !== '1') return [];
  return (await getCatalog()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = (await getCatalog()).find((item) => item.slug === slug);
  return entry ? { title: entry.title } : {};
}

export default async function Detail({ params, searchParams }) {
  const { slug } = await params;
  const staticPreview = process.env.PAGES_PREVIEW === '1';
  const from = staticPreview ? undefined : (await searchParams).from;
  const entries = await getCatalog();
  const entry = entries.find((item) => item.slug === slug);
  if (!entry) notFound();
  const related = relatedEntries(entries, entry);
  return (
    <main className="shell main" id="content">
      {staticPreview ? (
        <Suspense fallback={<BackToDiscovery slug={slug} />}>
          <StaticBackToDiscovery slug={slug} />
        </Suspense>
      ) : <BackToDiscovery slug={slug} from={from} />}
      <article>
        <header className="detail-heading">
          <div>
            <p className="eyebrow">{entry.category} · {entry.source}</p>
            <h1>{entry.title}</h1>
            {entry.creator && <p className="credit">{entry.creator}</p>}
          </div>
          {entry.original_url.startsWith('https://') &&
            <a className="original" href={entry.original_url} target="_blank" rel="noopener noreferrer">
              Visit Original <span aria-hidden="true" className="tile-arrow" /><span className="sr-only"> (opens in a new tab)</span>
            </a>}
        </header>
        <Preview key={entry.slug} entry={entry} eager detail />
        {entry.description && <p className="description">{entry.description}</p>}
      </article>
      {related.length > 0 && (
        <section className="related" aria-labelledby="related">
          <h2 id="related">Related inspiration</h2>
          <Gallery entries={related} related />
        </section>
      )}
    </main>
  );
}
