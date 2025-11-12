export default function LocaleNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center text-slate-900">
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="max-w-xl text-base text-slate-600">
        The page you are looking for does not exist in this locale. Please check the URL or return to the homepage.
      </p>
      <a
        href="/en"
        className="rounded bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
      >
        Go to English homepage
      </a>
    </div>
  );
}


