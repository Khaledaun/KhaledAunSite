'use client';

import { useState } from 'react';
import Script from 'next/script';

/**
 * FAQ Component with Schema.org Markup
 * Displays FAQ section with accordion UI and structured data for rich snippets
 *
 * @param {Object} props
 * @param {Array} props.items - Array of FAQ items
 *   Each item: { question: string, answer: string }
 * @param {string} props.title - Optional section title
 * @param {string} props.className - Optional CSS classes
 */
export default function FAQ({ items, title = 'Frequently Asked Questions', className = '' }) {
  const [openIndex, setOpenIndex] = useState(null);

  // Generate FAQPage schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* Schema Markup */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Visual FAQ */}
      <div className={className}>
        {title && (
          <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>
        )}

        <div className="space-y-4 max-w-3xl mx-auto">
          {items.map((item, index) => (
            <div
              key={index}
              className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
            >
              {/* Question Button */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                aria-expanded={openIndex === index}
              >
                <h3 className="text-lg font-semibold pr-8">
                  {item.question}
                </h3>
                <svg
                  className={`w-5 h-5 text-slate-500 transition-transform flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Answer Content */}
              {openIndex === index && (
                <div className="px-6 pb-6 bg-slate-50 dark:bg-slate-800">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
