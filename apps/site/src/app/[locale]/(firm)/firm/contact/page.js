import { unstable_setRequestLocale } from 'next-intl/server';
import FirmNavbar from '@/components/firm/FirmNavbar';
import FirmFooter from '@/components/firm/FirmFooter';
import FirmContact from '@/components/firm/FirmContact';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params: { locale } }) {
  const titles = {
    en: 'Contact Us | NAS & Co.',
    ar: 'اتصل بنا | ناشف، عون، شعبان وشركاه',
    he: 'צור קשר | נאשף, עון, שאבאן ושות\'',
  };

  return {
    title: titles[locale] || titles.en,
    description: 'Contact NAS & Co. for professional legal consultation.',
  };
}

export default function ContactPage({ params: { locale } }) {
  unstable_setRequestLocale(locale);

  return (
    <>
      <FirmNavbar locale={locale} />
      <main className="pt-24">
        {/* Hero */}
        <section className="bg-brand-navy py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-16 h-1 bg-brand-gold mx-auto mb-6"></div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {locale === 'he' ? 'צור קשר' : locale === 'ar' ? 'اتصل بنا' : 'CONTACT US'}
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                {locale === 'he'
                  ? 'נשמח לשמוע ממך. צוות המומחים שלנו מוכן לסייע בכל שאלה משפטית'
                  : locale === 'ar'
                  ? 'يسعدنا أن نسمع منك. فريق خبرائنا جاهز للمساعدة في أي سؤال قانوني'
                  : 'We would love to hear from you. Our team of experts is ready to assist with any legal question'}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <FirmContact locale={locale} />

        {/* Office Locations */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                {locale === 'he' ? 'המשרדים שלנו' : locale === 'ar' ? 'مكاتبنا' : 'Our Offices'}
              </h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Office Info */}
                  <div>
                    <h3 className="text-xl font-bold text-brand-navy mb-4">
                      NAS & Co.
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <svg className="w-6 h-6 text-brand-gold mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <p className="font-medium text-brand-navy">
                            {locale === 'he' ? 'כתובת' : locale === 'ar' ? 'العنوان' : 'Address'}
                          </p>
                          <p className="text-gray-600">
                            {locale === 'he' ? 'ישראל' : locale === 'ar' ? 'إسرائيل' : 'Israel'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <svg className="w-6 h-6 text-brand-gold mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="font-medium text-brand-navy">
                            {locale === 'he' ? 'אימייל' : locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                          </p>
                          <a href="mailto:info@nas-law.com" className="text-brand-gold hover:text-brand-navy transition-colors">
                            info@nas-law.com
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <svg className="w-6 h-6 text-brand-gold mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-medium text-brand-navy">
                            {locale === 'he' ? 'שעות פעילות' : locale === 'ar' ? 'ساعات العمل' : 'Working Hours'}
                          </p>
                          <p className="text-gray-600">
                            {locale === 'he' ? 'ראשון - חמישי: 9:00 - 18:00' :
                             locale === 'ar' ? 'الأحد - الخميس: 9:00 - 18:00' :
                             'Sunday - Thursday: 9:00 AM - 6:00 PM'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Map Placeholder */}
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <p className="text-gray-500 text-sm">
                        {locale === 'he' ? 'מפה תתווסף בקרוב' : locale === 'ar' ? 'ستتم إضافة الخريطة قريبا' : 'Map coming soon'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FirmFooter locale={locale} />
    </>
  );
}
