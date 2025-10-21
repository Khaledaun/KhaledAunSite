import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@khaledaun/db';
import Link from 'next/link';

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic';

interface Props {
  params: {
    locale: string;
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const caseStudy = await prisma.caseStudy.findUnique({
    where: {
      slug: params.slug,
      published: true,
    },
  });

  if (!caseStudy) {
    return {
      title: 'Case Study Not Found',
    };
  }

  return {
    title: `${caseStudy.title} | Case Studies | Khaled Aun`,
    description: caseStudy.problem.substring(0, 160),
  };
}

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

export default async function CaseStudyPage({ params }: Props) {
  const caseStudy = await prisma.caseStudy.findUnique({
    where: {
      slug: params.slug,
      published: true,
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
      featuredImage: {
        select: {
          url: true,
          alt: true,
        },
      },
    },
  });

  if (!caseStudy) {
    notFound();
  }

  return (
    <section className="relative md:py-24 py-16">
      <div className="container">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/case-studies"
            className="text-sm text-slate-400 hover:text-brand-gold transition-colors"
          >
            ← Back to Case Studies
          </Link>
        </div>

        {/* Header */}
        <div className="max-w-4xl mx-auto">
          {/* Type Badge */}
          <div className="mb-4 flex items-center gap-2">
            <span className={`px-3 py-1 text-sm rounded-full font-semibold ${typeColors[caseStudy.type]}`}>
              {typeLabels[caseStudy.type]}
            </span>
            {caseStudy.confidential && (
              <span className="px-3 py-1 text-sm rounded-full font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                Confidential
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {caseStudy.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8">
            {caseStudy.practiceArea && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {caseStudy.practiceArea}
              </span>
            )}
            {caseStudy.year && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {caseStudy.year}
              </span>
            )}
            {caseStudy.jurisdiction && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {caseStudy.jurisdiction}
              </span>
            )}
          </div>

          {/* Featured Image */}
          {caseStudy.featuredImage && (
            <div className="mb-12 rounded-lg overflow-hidden shadow-lg">
              <img
                src={caseStudy.featuredImage.url}
                alt={caseStudy.featuredImage.alt || caseStudy.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Case Study Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {/* Problem */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold m-0">The Challenge</h2>
              </div>
              <div className="pl-15">
                <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                  {caseStudy.problem}
                </p>
              </div>
            </div>

            {/* Strategy */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold m-0">Our Approach</h2>
              </div>
              <div className="pl-15">
                <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                  {caseStudy.strategy}
                </p>
              </div>
            </div>

            {/* Outcome */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold m-0">The Result</h2>
              </div>
              <div className="pl-15">
                <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                  {caseStudy.outcome}
                </p>
              </div>
            </div>

            {/* Categories */}
            {caseStudy.categories.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-wrap gap-2">
                  {caseStudy.categories.map((category) => (
                    <span
                      key={category}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 bg-gradient-to-r from-brand-gold/10 to-brand-gold/5 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-3">Need Similar Results?</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Let's discuss how we can help you achieve your legal and business objectives.
            </p>
            <Link
              href="/#contact"
              className="inline-block px-6 py-3 bg-brand-gold hover:bg-brand-gold/90 text-white rounded-md font-semibold transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

