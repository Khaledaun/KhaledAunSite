import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-brand-gold">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mt-4 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-brand-gold hover:bg-brand-navy text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
