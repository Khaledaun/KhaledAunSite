'use client';

import { useEffect } from 'react';

export default function LocaleError({ error, reset }) {
  useEffect(() => {
    console.error('Site rendering error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center text-slate-900">
      <h1 className="text-4xl font-semibold">Something went wrong</h1>
      <p className="max-w-xl text-base text-slate-600">
        We could not render this page. You can try again or head back to the homepage.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
        >
          Try again
        </button>
        <a
          href="/en"
          className="rounded border border-slate-300 px-4 py-2 text-slate-800 transition hover:border-slate-400"
        >
          Go to English homepage
        </a>
      </div>
    </div>
  );
}


