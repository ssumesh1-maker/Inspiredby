import { createHash } from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: false });
const tracking = /^(utm_.*|fbclid|gclid|mc_cid|mc_eid)$/i;
const list = (value) => value == null ? [] : [value].flat();
const plain = (value) => (typeof value === 'string' ? value : value?.['#text'] || '')
  .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

function httpsUrl(value, base) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value, base);
    return url.protocol === 'https:' && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
}

function canonicalUrl(value, base) {
  const url = httpsUrl(value, base);
  if (!url) return null;
  for (const name of [...url.searchParams.keys()]) {
    if (tracking.test(name)) url.searchParams.delete(name);
  }
  url.searchParams.sort();
  return url.href;
}

function imageFor(item, base) {
  for (const media of [
    ...list(item['media:content']), ...list(item['media:group']?.['media:content']),
    ...list(item['media:thumbnail']), ...list(item.enclosure), ...list(item.link)
  ]) {
    const type = media['@_type'];
    const medium = media['@_medium'];
    const image = httpsUrl(media['@_url'] ?? media['@_href'], base);
    if (image && (type?.startsWith('image/') || medium === 'image'
      || ((!type && !medium) && /\.(png|jpe?g|webp|avif|gif)$/i.test(image.pathname)))) return image.href;
  }
  return null;
}

function entryFor(item, source, base) {
  const links = list(item.link);
  const link = links.find((value) => typeof value === 'string'
    || (value['@_href'] && (!value['@_rel'] || value['@_rel'] === 'alternate')));
  const original = canonicalUrl(typeof link === 'string' ? link : link?.['@_href'], base);
  const image = imageFor(item, base);
  const title = plain(item.title).slice(0, 200);
  if (!original || !image || !title || original === canonicalUrl(base)) return null;

  const slug = title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70).replace(/-$/, '');
  const id = createHash('sha256').update(original).digest('hex').slice(0, 16);
  const date = Date.parse(plain(item.published || item.pubDate || item.updated));
  return {
    slug: `${slug || 'reference'}-${id}`,
    title,
    creator: plain(item['dc:creator'] || item.author?.name || item.author).slice(0, 150),
    category: source.category,
    source: source.name,
    tags: [...new Set(list(item.category).map((tag) => plain(tag?.['@_term'] || tag)).filter(Boolean))]
      .slice(0, 12).map((tag) => tag.slice(0, 80)),
    description: plain(item.description || item.summary).slice(0, 600),
    original_url: original,
    image_url: image,
    image_alt: plain(item['media:description']).slice(0, 240) || title,
    published_at: new Date(Number.isFinite(date) ? date : Date.now()).toISOString(),
    published: source.publish === true
  };
}

async function fetchFeed(source) {
  const url = httpsUrl(source?.url);
  if (!url || typeof source.name !== 'string' || !source.name.trim()
    || typeof source.category !== 'string' || !source.category.trim()) {
    throw new Error('Each feed needs an HTTPS url, name, and category.');
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`Feed request returned HTTP ${response.status}.`);
  const xml = await response.text();
  if (/<!DOCTYPE/i.test(xml)) throw new Error('Feeds must omit document type declarations.');
  const feed = parser.parse(xml);
  if (!feed.rss?.channel && !feed.feed) throw new Error('Expected an RSS or Atom feed.');
  const items = list(feed.rss?.channel?.item ?? feed.feed?.entry);
  const entries = items.slice(0, 100).map((item) => entryFor(item, source, response.url)).filter(Boolean);
  return [...new Map(entries.map((entry) => [entry.original_url, entry])).values()];
}

async function ingest() {
  const feeds = JSON.parse(process.env.INSPIRED_BY_FEEDS || '[]');
  if (!Array.isArray(feeds)) throw new Error('INSPIRED_BY_FEEDS must be a JSON array.');
  if (!feeds.length) {
    console.log('No feeds configured.');
    return;
  }

  const db = httpsUrl(process.env.SUPABASE_URL);
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!db || !key) throw new Error('Supabase ingestion credentials are missing.');
  const endpoint = new URL('/rest/v1/inspirations?on_conflict=original_url', db);
  const headers = {
    apikey: key,
    'Content-Type': 'application/json',
    Prefer: 'resolution=ignore-duplicates,return=minimal'
  };
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;

  for (const source of feeds) {
    try {
      const entries = await fetchFeed(source);
      if (entries.length) {
        const response = await fetch(endpoint, {
          method: 'POST', headers, body: JSON.stringify(entries), signal: AbortSignal.timeout(20_000)
        });
        if (!response.ok) throw new Error(`Supabase returned HTTP ${response.status}.`);
      }
      console.log(`[${source.name}] Processed ${entries.length} eligible entries.`);
    } catch (error) {
      console.error(`[${source?.name ?? 'feed'}] ${error.message}`);
      process.exitCode = 1;
    }
  }
}

ingest().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
