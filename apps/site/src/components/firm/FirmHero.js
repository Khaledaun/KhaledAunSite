'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const FirmHero = ({ locale }) => {
  const t = useTranslations('Firm');
  const [currentTagline, setCurrentTagline] = useState(0);

  const taglines = [
    { en: 'A consultation that delivers.', ar: 'استشارة تحقق النتائج.', he: 'ייעוץ שמספק.' },
    { en: 'Building relationships. Focusing on results.', ar: 'بناء العلاقات. التركيز على النتائج.', he: 'בניית קשרים. התמקדות בתוצאות.' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative min-h-[85vh] flex items-center bg-brand-navy overflow-hidden"
      aria-label="Hero section"
    >
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/firm/hero-office.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-brand-navy/85"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        <div className="max-w-3xl">
          {/* Animated Tagline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {taglines[currentTagline][locale] || taglines[currentTagline].en}
            <span className="text-brand-gold">.</span>
          </h1>

          {/* Decorative Line */}
          <div className="w-24 h-1 bg-brand-gold mb-8"></div>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed max-w-2xl">
            {t('description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <a
              href={`/${locale}/firm/contact`}
              className="inline-flex items-center px-8 py-4 bg-brand-gold text-white font-semibold rounded-md hover:bg-brand-gold/90 transition-all duration-200"
            >
              {locale === 'he' ? 'צור קשר' : locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}
              <svg
                className={`w-5 h-5 ${locale === 'he' || locale === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
            <a
              href={`/${locale}/firm/practice-areas`}
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-md hover:bg-white hover:text-brand-navy transition-all duration-200"
            >
              {locale === 'he' ? 'תחומי עיסוק' : locale === 'ar' ? 'مجالات الممارسة' : 'Practice Areas'}
            </a>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
};

export default FirmHero;
