'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

const FirmPracticeAreas = ({ locale }) => {
  const t = useTranslations('PracticeAreas');

  // Practice areas data with icons
  const practiceAreas = [
    { key: 'commercialCorporate', slug: 'commercial-corporate-law', icon: '📋' },
    { key: 'startupsVC', slug: 'startups-hitech-venture-capital', icon: '🚀' },
    { key: 'taxLaw', slug: 'tax-law', icon: '📊' },
    { key: 'constructionZoning', slug: 'construction-zoning-law', icon: '🏗️' },
    { key: 'employmentLabor', slug: 'employment-labor-law', icon: '👥' },
    { key: 'realEstate', slug: 'private-commercial-real-estate', icon: '🏢' },
    { key: 'commercialLitigation', slug: 'commercial-litigation', icon: '⚖️' },
    { key: 'infrastructure', slug: 'infrastructures-municipal-corporations', icon: '🏛️' },
    { key: 'intellectualProperty', slug: 'intellectual-property', icon: '💡' },
    { key: 'partnershipDissolution', slug: 'dissolution-real-estate-partnerships', icon: '📑' },
    { key: 'municipalTax', slug: 'municipal-property-tax', icon: '🏠' },
    { key: 'nonProfit', slug: 'non-profit-organizations', icon: '❤️' },
  ];

  return (
    <section className="py-20 bg-white" id="practice-areas">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="w-16 h-1 bg-brand-gold mx-auto mb-4"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
            {locale === 'he' ? 'תחומי עיסוק' :
             locale === 'ar' ? 'مجالات الممارسة' :
             'PRACTICE AREAS'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {locale === 'he' ? 'אנו מציעים שירותים משפטיים מקיפים במגוון תחומים' :
             locale === 'ar' ? 'نقدم خدمات قانونية شاملة في مجموعة متنوعة من المجالات' :
             'We offer comprehensive legal services across a wide range of practice areas'}
          </p>
        </div>

        {/* Practice Areas Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {practiceAreas.map((area) => (
            <Link
              key={area.slug}
              href={`/${locale}/practice-areas/${area.slug}`}
              className="group p-6 bg-gray-50 rounded-lg hover:bg-brand-navy transition-all duration-300"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">
                  {area.icon}
                </span>
                <span className="text-brand-navy group-hover:text-white font-medium transition-colors">
                  {t(area.key)}
                </span>
              </div>
              <svg
                className={`w-5 h-5 mt-4 text-brand-gold opacity-0 group-hover:opacity-100 transition-opacity ${
                  locale === 'he' || locale === 'ar' ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href={`/${locale}/practice-areas`}
            className="inline-flex items-center px-8 py-4 bg-brand-gold text-white font-semibold rounded-md hover:bg-brand-gold/90 transition-all duration-200"
          >
            {locale === 'he' ? 'צפה בכל תחומי העיסוק' :
             locale === 'ar' ? 'عرض جميع مجالات الممارسة' :
             'View All Practice Areas'}
            <svg
              className={`w-5 h-5 ${locale === 'he' || locale === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FirmPracticeAreas;
