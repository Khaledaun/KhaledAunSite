import Script from 'next/script';
import Link from 'next/link';

/**
 * Breadcrumbs Component with Schema.org Markup
 * Displays navigation breadcrumbs and adds structured data for SEO
 *
 * @param {Object} props
 * @param {Array} props.items - Array of breadcrumb items
 *   Each item: { label: string, href?: string }
 * @param {string} props.className - Optional CSS classes
 */
export default function Breadcrumbs({ items, className = '' }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://khaledaun.com';

  // Generate BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${baseUrl}${item.href}` : undefined,
    })),
  };

  return (
    <>
      {/* Schema Markup */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Visual Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className={`text-sm ${className}`}
      >
        <ol className="flex items-center space-x-2 rtl:space-x-reverse">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-slate-500 hover:text-brand-gold transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {item.label}
                </span>
              )}
              {index < items.length - 1 && (
                <svg
                  className="w-4 h-4 mx-2 text-slate-400 rtl:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
