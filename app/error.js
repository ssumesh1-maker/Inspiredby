'use client';

export default function ErrorView({ reset }) {
  return (
    <main id="content" className="shell main">
      <h1>Gallery unavailable</h1>
      <p>There was a problem loading the catalog.</p>
      <button type="button" onClick={reset}>Try again</button>
    </main>
  );
}
