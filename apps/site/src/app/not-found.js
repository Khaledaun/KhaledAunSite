import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '1rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#334155', marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0f172a',
            color: 'white',
            fontWeight: '500',
            borderRadius: '0.5rem',
            textDecoration: 'none',
          }}
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
