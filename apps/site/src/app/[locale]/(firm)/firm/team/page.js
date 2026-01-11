import { unstable_setRequestLocale } from 'next-intl/server';
import FirmNavbar from '@/components/firm/FirmNavbar';
import FirmFooter from '@/components/firm/FirmFooter';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params: { locale } }) {
  const titles = {
    en: 'Our Team | NAS & Co.',
    ar: 'فريقنا | ناشف، عون، شعبان وشركاه',
    he: 'הצוות שלנו | נאשף, עון, שאבאן ושות\'',
  };

  return {
    title: titles[locale] || titles.en,
    description: 'Meet the experienced legal team at NAS & Co.',
  };
}

export default function TeamPage({ params: { locale } }) {
  unstable_setRequestLocale(locale);

  // Partners data - will be fetched from database later
  const partners = [
    {
      slug: 'abdelrahim-nashef',
      name: { en: 'Abdelrahim Nashef', ar: 'عبد الرحيم ناشف', he: 'עבד אל-רחים נאשף' },
      title: { en: 'Managing Partner', ar: 'الشريك الإداري', he: 'שותף מנהל' },
      specialties: {
        en: 'Corporate | Commercial | Hi-Tech & Venture Capital',
        ar: 'تجاري | شركات | التكنولوجيا الفائقة ورأس المال المخاطر',
        he: 'תאגידי | מסחרי | היי-טק והון סיכון',
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
        he: 'ליטיגציה | ליטיגציה מסחרית',
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
        he: 'נדל"ן | תכנון ובנייה',
      },
      image: '/images/firm/team/shaban.jpg',
    },
  ];

  // Associates placeholder - will be populated later
  const associates = [];

  return (
    <>
      <FirmNavbar locale={locale} />
      <main className="pt-24">
        {/* Hero */}
        <section className="bg-brand-navy py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-16 h-1 bg-brand-gold mx-auto mb-6"></div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {locale === 'he' ? 'הצוות שלנו' : locale === 'ar' ? 'فريقنا' : 'OUR TEAM'}
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                {locale === 'he'
                  ? 'הכירו את עורכי הדין המנוסים שלנו המחויבים לספק ייעוץ משפטי יוצא מן הכלל'
                  : locale === 'ar'
                  ? 'تعرف على محامينا ذوي الخبرة الملتزمين بتقديم المشورة القانونية الاستثنائية'
                  : 'Meet our experienced attorneys committed to providing exceptional legal counsel'}
              </p>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-12 text-center">
              {locale === 'he' ? 'השותפים' : locale === 'ar' ? 'الشركاء' : 'Partners'}
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {partners.map((partner) => (
                <Link
                  key={partner.slug}
                  href={`/${locale}/firm/team/${partner.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                    {/* Photo */}
                    <div className="relative aspect-[4/5] bg-gray-200 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 to-transparent z-10"></div>
                      {/* Placeholder */}
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        <span className="text-6xl text-gray-500">👤</span>
                      </div>
                      {/* Info overlay */}
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
                    <div className="p-6 bg-brand-navy flex justify-between items-center">
                      <span className="text-white text-sm">
                        {partner.specialties[locale]?.split(' | ')[0] || partner.specialties.en.split(' | ')[0]}
                      </span>
                      <span className="bg-brand-gold text-white px-4 py-2 text-sm font-medium">
                        {locale === 'he' ? 'קרא עוד' : locale === 'ar' ? 'اقرأ المزيد' : 'Read More'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Associates Section - Placeholder */}
        {associates.length > 0 && (
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-brand-navy mb-12 text-center">
                {locale === 'he' ? 'עורכי דין' : locale === 'ar' ? 'المحامون' : 'Associates'}
              </h2>
              {/* Associate cards would go here */}
            </div>
          </section>
        )}

        {/* Join Us CTA */}
        <section className="py-16 bg-brand-navy">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              {locale === 'he'
                ? 'מעוניינים להצטרף לצוות שלנו?'
                : locale === 'ar'
                ? 'مهتم بالانضمام إلى فريقنا؟'
                : 'Interested in Joining Our Team?'}
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              {locale === 'he'
                ? 'אנחנו תמיד מחפשים עורכי דין מוכשרים להצטרף למשרדנו'
                : locale === 'ar'
                ? 'نحن نبحث دائمًا عن محامين موهوبين للانضمام إلى مكتبنا'
                : 'We are always looking for talented attorneys to join our firm'}
            </p>
            <Link
              href={`/${locale}/firm/contact`}
              className="inline-flex items-center px-8 py-4 bg-brand-gold text-white font-semibold rounded-md hover:bg-brand-gold/90 transition-all"
            >
              {locale === 'he' ? 'צור קשר' : locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}
            </Link>
          </div>
        </section>
      </main>
      <FirmFooter locale={locale} />
    </>
  );
}
