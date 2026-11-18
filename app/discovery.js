import Form from 'next/form';
import Link from 'next/link';
import { filterCatalog, queryString } from '../lib/discovery';
import { Gallery, RestoreGalleryAnchor } from './gallery';

const PAGE_SIZE = 24;

export default function Discovery({ catalog, query }) {
  const categories = [...new Set(catalog.map((item) => item.category))].sort();
  const sources = [...new Set(catalog.map((item) => item.source))].sort();
  const filtered = filterCatalog(catalog, query);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(query.page, pages);
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const active = Boolean(query.q || query.category || query.source || query.sort);
  const current = queryString({ ...query, page });

  return (
    <main id="content" className="shell main">
      <RestoreGalleryAnchor />
      <div className="intro">
        <h1>Design inspiration</h1>
        <p>Discover work across design, art, and visual culture.</p>
      </div>

      <section className="discovery" aria-label="Discovery controls">
        <nav className="categories" aria-label="Categories">
          {['', ...categories].map((category) => (
            <Link key={category} href={'/' + queryString({ ...query, category, page: 1 })}
              aria-current={query.category === category ? 'page' : undefined}>
              {category || 'All'}
            </Link>
          ))}
        </nav>
        <Form action="/" className="filters" key={current}>
          {query.category && <input type="hidden" name="category" value={query.category} />}
          <label className="search">
            <span className="sr-only">Search inspiration</span>
            <span aria-hidden="true" className="search-icon" />
            <input name="q" type="search" maxLength={120} defaultValue={query.q} placeholder="Search inspiration" />
          </label>
          <label>
            <span className="sr-only">Source</span>
            <select name="source" defaultValue={query.source}>
              <option value="">All sources</option>
              {sources.map((source) => <option key={source}>{source}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Sort order</span>
            <select name="sort" defaultValue={query.sort}>
              <option value="">Recent</option>
              <option value="oldest">Oldest</option>
            </select>
          </label>
          <button type="submit">Apply</button>
        </Form>
      </section>

      <div className="result-bar">
        <span>{filtered.length} {filtered.length === 1 ? 'reference' : 'references'}</span>
        {active && <Link href="/">Clear filters</Link>}
      </div>
      {shown.length ? <Gallery entries={shown} back={current || '?page=1'} eager /> :
        <p className="empty">{active ? 'No references match these filters.' : 'No inspiration has been published yet.'}</p>}
      {pages > 1 && (
        <nav className="pagination" aria-label="Gallery pages">
          {page > 1 && <Link href={'/' + queryString({ ...query, page: page - 1 })}>← Previous</Link>}
          <span>Page {page} of {pages}</span>
          {page < pages && <Link href={'/' + queryString({ ...query, page: page + 1 })}>Next →</Link>}
        </nav>
      )}
    </main>
  );
}
