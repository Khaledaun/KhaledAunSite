'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-brand-gold">500</h1>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mt-4 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-block bg-brand-gold hover:bg-brand-navy text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-block bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
