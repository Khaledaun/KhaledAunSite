import { unstable_setRequestLocale } from 'next-intl/server';
import FirmNavbar from '@/components/firm/FirmNavbar';
import FirmFooter from '@/components/firm/FirmFooter';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params: { locale } }) {
  const titles = {
    en: 'Associates & Advisors | NAS & Co.',
    ar: 'المحامون والمستشارون | ناشف، عون، شعبان وشركاه',
    he: 'עורכי דין ויועצים | נאשף, עון, שאבאן ושות\'',
  };

  return {
    title: titles[locale] || titles.en,
    description: 'Meet the talented associates and advisors at NAS & Co.',
  };
}

// Associates data - will be fetched from database later
const associates = [
  // Example structure - currently empty, will be populated as the firm grows
  // {
  //   slug: 'associate-name',
  //   name: { en: 'Associate Name', ar: 'اسم المحامي', he: 'שם עורך הדין' },
  //   title: { en: 'Associate', ar: 'محامي', he: 'עורך דין' },
  //   specialties: { en: 'Corporate Law', ar: 'قانون الشركات', he: 'דיני חברות' },
  //   image: '/images/firm/team/associate.jpg',
  //   education: 'University Name',
  //   joinYear: 2022,
  // },
];

// Advisors data - external consultants and of-counsel
const advisors = [
  // Example structure - currently empty, will be populated as needed
  // {
  //   slug: 'advisor-name',
  //   name: { en: 'Advisor Name', ar: 'اسم المستشار', he: 'שם היועץ' },
  //   title: { en: 'Of Counsel', ar: 'مستشار', he: 'יועץ' },
  //   specialty: { en: 'Tax Advisory', ar: 'الاستشارات الضريبية', he: 'ייעוץ מס' },
  //   bio: { en: 'Brief bio...', ar: '...', he: '...' },
  // },
];

export default function AssociatesAdvisorsPage({ params: { locale } }) {
  unstable_setRequestLocale(locale);

  const hasAssociates = associates.length > 0;
  const hasAdvisors = advisors.length > 0;

  return (
    <>
      <FirmNavbar locale={locale} />
      <main className="pt-24">
        {/* Hero */}
        <section className="bg-brand-navy py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Link
                href={`/${locale}/firm/team`}
                className="inline-flex items-center text-brand-gold mb-6 hover:text-white transition-colors"
              >
                <svg
                  className={`w-5 h-5 ${locale === 'he' || locale === 'ar' ? 'ml-2' : 'mr-2 rotate-180'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                {locale === 'he' ? 'חזרה לצוות' : locale === 'ar' ? 'العودة إلى الفريق' : 'Back to Team'}
              </Link>
              <div className="w-16 h-1 bg-brand-gold mx-auto mb-6"></div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {locale === 'he' ? 'עורכי דין ויועצים' : locale === 'ar' ? 'المحامون والمستشارون' : 'ASSOCIATES & ADVISORS'}
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                {locale === 'he'
                  ? 'הכירו את הצוות המוכשר שלנו המספק שירותים משפטיים יוצאי דופן'
                  : locale === 'ar'
                  ? 'تعرف على فريقنا الموهوب الذي يقدم خدمات قانونية استثنائية'
                  : 'Meet our talented team providing exceptional legal services'}
              </p>
            </div>
          </div>
        </section>

        {/* Associates Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-12 text-center">
              {locale === 'he' ? 'עורכי דין' : locale === 'ar' ? 'المحامون' : 'Associates'}
            </h2>

            {hasAssociates ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {associates.map((associate) => (
                  <div
                    key={associate.slug}
                    className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    {/* Photo */}
                    <div className="relative aspect-[4/5] bg-gray-200 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 to-transparent z-10"></div>
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        <span className="text-6xl text-gray-500">👤</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {associate.name[locale] || associate.name.en}
                        </h3>
                        <p className="text-brand-gold text-sm">
                          {associate.title[locale] || associate.title.en}
                        </p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-2">
                        {associate.specialties[locale] || associate.specialties.en}
                      </p>
                      <p className="text-xs text-gray-500">
                        {associate.education}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-brand-navy mb-2">
                  {locale === 'he' ? 'הצוות שלנו גדל' : locale === 'ar' ? 'فريقنا ينمو' : 'Our Team is Growing'}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  {locale === 'he'
                    ? 'אנחנו תמיד מחפשים עורכי דין מוכשרים להצטרף לצוות שלנו. אם אתם מחפשים הזדמנות, צרו קשר!'
                    : locale === 'ar'
                    ? 'نحن دائمًا نبحث عن محامين موهوبين للانضمام إلى فريقنا. إذا كنت تبحث عن فرصة، تواصل معنا!'
                    : 'We are always looking for talented attorneys to join our team. If you are looking for an opportunity, get in touch!'}
                </p>
                <Link
                  href={`/${locale}/firm/contact`}
                  className="inline-flex items-center px-6 py-3 bg-brand-gold text-white font-medium rounded-md hover:bg-brand-gold/90 transition-all"
                >
                  {locale === 'he' ? 'הגש מועמדות' : locale === 'ar' ? 'قدم طلبك' : 'Apply Now'}
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Advisors Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-brand-navy mb-12 text-center">
              {locale === 'he' ? 'יועצים' : locale === 'ar' ? 'المستشارون' : 'Advisors & Of Counsel'}
            </h2>

            {hasAdvisors ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {advisors.map((advisor) => (
                  <div
                    key={advisor.slug}
                    className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl text-gray-500">👤</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-brand-navy">
                          {advisor.name[locale] || advisor.name.en}
                        </h3>
                        <p className="text-brand-gold text-sm">
                          {advisor.title[locale] || advisor.title.en}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {advisor.bio[locale] || advisor.bio.en}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="text-xs text-brand-navy font-medium uppercase tracking-wide">
                        {advisor.specialty[locale] || advisor.specialty.en}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-brand-navy mb-2">
                  {locale === 'he' ? 'רשת יועצים' : locale === 'ar' ? 'شبكة المستشارين' : 'Advisory Network'}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {locale === 'he'
                    ? 'אנו משתפים פעולה עם רשת של מומחים ויועצים מובילים כדי לספק את הפתרון הטוב ביותר לכל לקוח'
                    : locale === 'ar'
                    ? 'نتعاون مع شبكة من الخبراء والمستشارين الرائدين لتقديم أفضل الحلول لكل عميل'
                    : 'We collaborate with a network of leading experts and advisors to provide the best solution for every client'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Partners Link */}
        <section className="py-16 bg-brand-navy">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              {locale === 'he' ? 'הכירו את השותפים שלנו' : locale === 'ar' ? 'تعرف على شركائنا' : 'Meet Our Partners'}
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              {locale === 'he'
                ? 'הכירו את השותפים המנוסים שמובילים את המשרד שלנו'
                : locale === 'ar'
                ? 'تعرف على الشركاء ذوي الخبرة الذين يقودون مكتبنا'
                : 'Get to know the experienced partners leading our firm'}
            </p>
            <Link
              href={`/${locale}/firm/team`}
              className="inline-flex items-center px-8 py-4 bg-brand-gold text-white font-semibold rounded-md hover:bg-brand-gold/90 transition-all"
            >
              {locale === 'he' ? 'צפה בשותפים' : locale === 'ar' ? 'عرض الشركاء' : 'View Partners'}
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
        </section>
      </main>
      <FirmFooter locale={locale} />
    </>
  );
}
