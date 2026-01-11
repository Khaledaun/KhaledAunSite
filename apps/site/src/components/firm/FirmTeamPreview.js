'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

const FirmTeamPreview = ({ locale }) => {
  const t = useTranslations('Team');
  const tFirm = useTranslations('Firm');

  // Partners data - will be fetched from database later
  const partners = [
    {
      slug: 'abdelrahim-nashef',
      name: { en: 'Abdelrahim Nashef', ar: 'عبد الرحيم ناشف', he: 'עבד אל-רחים נאשף' },
      title: { en: 'Managing Partner', ar: 'الشريك الإداري', he: 'שותף מנהל' },
      specialties: {
        en: 'Corporate | Commercial | Hi-Tech & Venture Capital',
        ar: 'تجاري | شركات | التكنولوجيا الفائقة ورأس المال المخاطر',
        he: 'תאגידי | מסחרי | היי-טק והון סיכון'
      },
      image: '/images/firm/team/nashef.jpg',
    },
    {
      slug: 'khaled-aun',
      name: { en: 'Khaled Aun', ar: 'خالد عون', he: 'חאלד עון' },
      title: { en: 'Partner', ar: 'شريك', he: 'שותף' },
      specialties: {
        en: 'Litigation | Commercial Litigation',
        ar: 'التقاضي | التقاضي التجاري',
        he: 'ליטיגציה | ליטיגציה מסחרית'
      },
      image: '/images/firm/team/aun.jpg',
    },
    {
      slug: 'hisham-shaban',
      name: { en: 'Hisham Shaban', ar: 'هشام شعبان', he: 'הישאם שאבאן' },
      title: { en: 'Partner', ar: 'شريك', he: 'שותף' },
      specialties: {
        en: 'Real Estate | Planning & Construction',
        ar: 'العقارات | التخطيط والبناء',
        he: 'נדל"ן | תכנון ובנייה'
      },
      image: '/images/firm/team/shaban.jpg',
    },
  ];

  return (
    <section className="py-20 bg-gray-50" id="team">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="w-16 h-1 bg-brand-gold mx-auto mb-4"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
            {tFirm('teamTitle')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {locale === 'he' ? 'הכירו את הצוות המשפטי המנוסה שלנו' :
             locale === 'ar' ? 'تعرف على فريقنا القانوني ذو الخبرة' :
             'Meet our experienced legal team'}
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {partners.map((partner) => (
            <div
              key={partner.slug}
              className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              {/* Photo */}
              <div className="relative aspect-[4/5] bg-gray-200 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 to-transparent z-10"></div>
                {/* Placeholder - will be replaced with actual images */}
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <span className="text-6xl text-gray-500">👤</span>
                </div>
                {/* Partner info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {partner.name[locale] || partner.name.en}
                  </h3>
                  <p className="text-brand-gold text-sm">
                    {partner.title[locale] || partner.title.en}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <p className="text-sm text-brand-navy mb-4">
                  {partner.specialties[locale] || partner.specialties.en}
                </p>
                <Link
                  href={`/${locale}/team/${partner.slug}`}
                  className="inline-flex items-center text-brand-gold font-medium hover:text-brand-navy transition-colors"
                >
                  {t('readMore')}
                  <svg
                    className={`w-4 h-4 ${locale === 'he' || locale === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href={`/${locale}/team`}
            className="inline-flex items-center px-8 py-4 border-2 border-brand-navy text-brand-navy font-semibold rounded-md hover:bg-brand-navy hover:text-white transition-all duration-200"
          >
            {locale === 'he' ? 'צפה בכל הצוות' :
             locale === 'ar' ? 'عرض جميع الفريق' :
             'View Full Team'}
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

export default FirmTeamPreview;
