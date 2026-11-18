import { Suspense } from 'react';
import { getCatalog } from '../lib/catalog';
import { catalogQuery } from '../lib/discovery';
import Discovery from './discovery';
import StaticDiscovery from './static-discovery';

export default async function Home({ searchParams }) {
  const catalog = await getCatalog();
  if (process.env.PAGES_PREVIEW === '1') {
    return (
      <Suspense fallback={<Discovery catalog={catalog} query={catalogQuery()} />}>
        <StaticDiscovery catalog={catalog} />
      </Suspense>
    );
  }
  return <Discovery catalog={catalog} query={catalogQuery(await searchParams)} />;
}
