import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="content" className="shell main">
      <h1>Reference unavailable</h1>
      <Link href="/">Back to discovery</Link>
    </main>
  );
}
