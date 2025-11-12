'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NewsletterConfirmedPage() {
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setAlreadySubscribed(urlParams.get('already') === 'true');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {alreadySubscribed ? 'Already Subscribed!' : "You're All Set!"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {alreadySubscribed 
            ? 'You are already subscribed to our newsletter.'
            : 'Your subscription has been confirmed! Welcome aboard.'}
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Go to Homepage
          </Link>
          <Link
            href="/blog"
            className="block w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-md transition-colors"
          >
            Browse Articles
          </Link>
        </div>
      </div>
    </div>
  );
}




