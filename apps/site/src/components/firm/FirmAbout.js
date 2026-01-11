'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

const FirmAbout = ({ locale }) => {
  const t = useTranslations('Firm');

  const stats = [
    { value: '20+', label: { en: 'Years Experience', ar: 'سنوات الخبرة', he: 'שנות ניסיון' } },
    { value: '500+', label: { en: 'Clients Served', ar: 'عملاء خدمناهم', he: 'לקוחות שירתנו' } },
    { value: '3', label: { en: 'Languages', ar: 'لغات', he: 'שפות' } },
    { value: '12', label: { en: 'Practice Areas', ar: 'مجالات الممارسة', he: 'תחומי עיסוק' } },
  ];

  return (
    <section className="py-20 bg-gray-50" id="about">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            {/* Section Header */}
            <div className="mb-8">
              <div className="w-16 h-1 bg-brand-gold mb-4"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
                {t('aboutTitle')}
              </h2>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {t('description')}
            </p>

            {/* Key Points */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-brand-gold/10 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-4 h-4 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">
                  {locale === 'he' ? 'ייעוץ משפטי מתמחה לחברות, תאגידים ויזמים' :
                   locale === 'ar' ? 'استشارات قانونية متخصصة للشركات والمستثمرين ورجال الأعمال' :
                   'Specialized legal counseling for companies, corporations, and entrepreneurs'}
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-brand-gold/10 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-4 h-4 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">
                  {locale === 'he' ? 'הבנה מעמיקה של הסביבה המשפטית והרגולטורית' :
                   locale === 'ar' ? 'فهم عميق للبيئة القانونية والتنظيمية' :
                   'In-depth understanding of the legal and regulatory environment'}
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-brand-gold/10 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-4 h-4 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700">
                  {locale === 'he' ? 'ראייה אסטרטגית ארוכת טווח לעסקים' :
                   locale === 'ar' ? 'رؤية استراتيجية طويلة المدى للأعمال' :
                   'Long-term strategic view for businesses'}
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/${locale}/about`}
              className="inline-flex items-center text-brand-gold font-semibold hover:text-brand-navy transition-colors"
            >
              {locale === 'he' ? 'קרא עוד אודותינו' :
               locale === 'ar' ? 'اقرأ المزيد عنا' :
               'Learn more about us'}
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

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl font-bold text-brand-gold mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label[locale] || stat.label.en}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FirmAbout;
