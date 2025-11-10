import { Metadata } from 'next';
import { prisma } from '@khaledaun/db';
import Link from 'next/link';

// Use ISR with 1 hour revalidation for better performance
export const revalidate = 3600; // Revalidate every 1 hour

export const metadata: Metadata = {
  title: 'Case Studies | Khaled Aun',
  description: 'Explore successful legal outcomes and strategic advisory work',
};

const typeLabels: Record<string, string> = {
  LITIGATION: 'Litigation',
  ARBITRATION: 'Arbitration',
  ADVISORY: 'Advisory',
  VENTURE: 'Venture',
};

const typeColors: Record<string, string> = {
  LITIGATION: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  ARBITRATION: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ADVISORY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  VENTURE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export default async function CaseStudiesPage() {
  const caseStudies = await prisma.caseStudy.findMany({
    where: {
      published: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    include: {
      featuredImage: {
        select: {
          url: true,
          alt: true,
        },
      },
    },
  });

  return (
    <section className="relative md:py-24 py-16">
      <div className="container">
        {/* Header */}
        <div className="grid grid-cols-1 pb-8 text-center">
          <h1 className="mb-6 md:text-4xl text-3xl md:leading-normal leading-normal font-semibold">
            Portfolio & Case Studies
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-[15px]">
            Explore successful legal outcomes, strategic advisory work, and venture investments that demonstrate our expertise and commitment to excellence.
          </p>
        </div>

        {/* Case Studies Grid */}
        {caseStudies.length > 0 ? (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 mt-8 gap-[30px]">
            {caseStudies.map((caseStudy) => (
              <div
                key={caseStudy.id}
                className="group relative rounded-md shadow-sm dark:shadow-gray-800 hover:shadow-md dark:hover:shadow-gray-700 transition-all duration-500 overflow-hidden bg-white dark:bg-slate-900"
              >
                {/* Featured Image */}
                {caseStudy.featuredImage && (
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={caseStudy.featuredImage.url}
                      alt={caseStudy.featuredImage.alt || caseStudy.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Type Badge */}
                  <div className="mb-3">
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${typeColors[caseStudy.type]}`}>
                      {typeLabels[caseStudy.type]}
                    </span>
                    {caseStudy.confidential && (
                      <span className="ml-2 px-3 py-1 text-xs rounded-full font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        Confidential
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-3 line-clamp-2">
                    <Link
                      href={`/case-studies/${caseStudy.slug}`}
                      className="hover:text-brand-gold transition-colors"
                    >
                      {caseStudy.title}
                    </Link>
                  </h3>

                  {/* Excerpt from Problem */}
                  <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                    {caseStudy.problem.substring(0, 150)}...
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    {caseStudy.year && (
                      <span>{caseStudy.year}</span>
                    )}
                    {caseStudy.jurisdiction && (
                      <span>{caseStudy.jurisdiction}</span>
                    )}
                  </div>

                  {/* Read More */}
                  <Link
                    href={`/case-studies/${caseStudy.slug}`}
                    className="mt-4 inline-flex items-center text-sm font-semibold text-brand-gold hover:text-brand-gold/80 transition-colors"
                  >
                    Read Case Study
                    <svg
                      className="w-4 h-4 ml-1"
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
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400">No case studies available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}

