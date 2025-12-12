'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
        }}>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem' }}>500</h1>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#334155', marginBottom: '1rem' }}>Something went wrong</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              We apologize for the inconvenience. Please try again.
            </p>
            <button
              onClick={() => reset()}
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#0f172a',
                color: 'white',
                fontWeight: '500',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
