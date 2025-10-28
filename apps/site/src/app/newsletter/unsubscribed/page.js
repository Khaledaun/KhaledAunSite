import Link from 'next/link';

export default function UnsubscribedPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          You've Been Unsubscribed
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We're sorry to see you go. You've been successfully removed from our mailing list and won't receive any more emails from us.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Changed your mind? You can always subscribe again from our homepage.
          </p>
        </div>

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

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            We'd love to hear your feedback
          </p>
          <a
            href="mailto:feedback@khaledaun.com?subject=Newsletter Feedback"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Tell us why you unsubscribed
          </a>
        </div>
      </div>
    </div>
  );
}

