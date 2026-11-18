'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { catalogQuery, queryString } from '../lib/discovery';
import Discovery from './discovery';

export default function StaticDiscovery({ catalog }) {
  const params = useSearchParams();
  return <Discovery catalog={catalog} query={catalogQuery(Object.fromEntries(params))} />;
}

export function BackToDiscovery({ slug, from }) {
  const query = typeof from === 'string'
    ? queryString(catalogQuery(Object.fromEntries(new URLSearchParams(from))))
    : '';
  return <Link className="back" href={`/${query}${from ? '#' + encodeURIComponent(slug) : ''}`}>← Back to discovery</Link>;
}

export function StaticBackToDiscovery({ slug }) {
  const params = useSearchParams();
  return <BackToDiscovery slug={slug} from={params.get('from')} />;
}
