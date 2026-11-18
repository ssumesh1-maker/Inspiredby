export function catalogQuery(params = {}) {
  const read = (key) => typeof params[key] === 'string' ? params[key].trim() : '';
  return {
    q: read('q').slice(0, 120),
    category: read('category'),
    source: read('source'),
    sort: read('sort') === 'oldest' ? 'oldest' : '',
    page: Math.max(1, Math.min(500, Number.parseInt(read('page'), 10) || 1))
  };
}

export function queryString(query) {
  const params = new URLSearchParams();
  for (const key of ['q', 'category', 'source', 'sort', 'page']) {
    if (query[key] && !(key === 'page' && query[key] === 1)) params.set(key, query[key]);
  }
  return params.size ? `?${params}` : '';
}

export function filterCatalog(entries, query) {
  const terms = query.q.toLowerCase().split(/\s+/).filter(Boolean);
  return entries.filter((entry) => {
    const searchable = [entry.title, entry.creator, entry.description, entry.category, entry.source, ...entry.tags].join(' ').toLowerCase();
    return (!query.category || entry.category === query.category)
      && (!query.source || entry.source === query.source)
      && terms.every((term) => searchable.includes(term));
  }).sort((a, b) => {
    const result = a.published_at.localeCompare(b.published_at);
    return (query.sort ? result : -result) || a.slug.localeCompare(b.slug);
  });
}

export function relatedEntries(entries, current) {
  return entries.filter((entry) => entry.slug !== current.slug).map((entry) => ({
    entry,
    score: Number(entry.category === current.category) + 2 * entry.tags.filter((tag) => current.tags.includes(tag)).length
  })).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score)
    .slice(0, 4).map(({ entry }) => entry);
}
