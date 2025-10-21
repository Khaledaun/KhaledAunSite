'use client';

export default function CredentialsPage() {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Credentials</h1>
      <p className="text-gray-600 mb-4">
        Credential management is included in the Hero & Bio page.
      </p>
      <a
        href="/profile/hero"
        className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Go to Hero & Bio →
      </a>
    </div>
  );
}

