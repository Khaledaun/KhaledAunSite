'use client';

import Link from 'next/link';

export default function NewsletterUnsubscribedPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Successfully Unsubscribed
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You have been successfully removed from our newsletter mailing list.
          We're sorry to see you go!
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Go to Homepage
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
            If you changed your mind, you can subscribe again from our homepage.
          </p>
        </div>
      </div>
    </div>
  );
}
