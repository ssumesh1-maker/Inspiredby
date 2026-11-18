import seed from './seed.json';

export async function getCatalog() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (process.env.PAGES_PREVIEW === '1' || (!url && !key)) return seed;
  if (!url || !key) throw new Error('Supabase URL and publishable key must both be configured.');

  const endpoint = new URL('/rest/v1/inspirations', url);
  endpoint.search = new URLSearchParams({ select: '*', published: 'eq.true', order: 'published_at.desc,slug.asc' });
  const entries = [];
  const batchSize = 500;
  while (true) {
    endpoint.searchParams.set('offset', entries.length);
    endpoint.searchParams.set('limit', batchSize);
    const response = await fetch(endpoint, {
      headers: { apikey: key, Prefer: 'count=exact' },
      next: { revalidate: 300 }
    });
    if (!response.ok) throw new Error(`Supabase catalog request failed (${response.status}).`);
    const batch = await response.json();
    entries.push(...batch);
    const count = Number(response.headers.get('content-range')?.split('/')[1]);
    if (!batch.length || entries.length >= count || (!Number.isFinite(count) && batch.length < batchSize)) return entries;
  }
}
