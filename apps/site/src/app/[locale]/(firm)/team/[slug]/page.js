import { unstable_setRequestLocale } from 'next-intl/server';
import FirmNavbar from '@/components/firm/FirmNavbar';
import FirmFooter from '@/components/firm/FirmFooter';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Partner data - will be fetched from database later
const partnersData = {
  'abdelrahim-nashef': {
    name: { en: 'Abdelrahim Nashef', ar: 'عبد الرحيم ناشف', he: 'עבד אל-רחים נאשף' },
    title: { en: 'Managing Partner', ar: 'الشريك الإداري', he: 'שותף מנהל' },
    specialties: {
      en: 'Corporate | Commercial | Hi-Tech & Venture Capital',
      ar: 'تجاري | شركات | التكنولوجيا الفائقة ورأس المال المخاطر',
      he: 'תאגידי | מסחרי | היי-טק והון סיכון',
    },
    quote: {
      en: 'In the business world, only those who understand the managerial and business considerations of entrepreneurs and CEOs are able to navigate the legal side',
      ar: 'في عالم الأعمال، فقط أولئك الذين يفهمون الاعتبارات الإدارية والتجارية لرواد الأعمال والمديرين التنفيذيين قادرون على التنقل في الجانب القانوني',
      he: 'בעולם העסקים, רק מי שמבין את השיקולים הניהוליים והעסקיים של יזמים ומנכ"לים מסוגל לנווט בצד המשפטי',
    },
    bio: {
      en: `With nearly two decades of regional and international experience, Mr. Nashef brings a unique blend of legal expertise, strategic insight, and deep ecosystem engagement. His practice spans venture capital and private equity financing, fund formation, complex cross-border transactions, commercialization of technologies, and providing corporate and legal counsel to corporations, entrepreneurs, startups, investors and non-profit organizations.

Mr. Nashef has a long track record of handling pioneering venture capital and private equity deals. Since 2008, he has been at the forefront of the venture capital landscape, serving as a trusted advisor and strategic legal partner to hundreds of founders, investors, and startups. His work spans a broad range of high-growth sectors, including e-Commerce, AI, EdTech, Digital Health, FinTech, InsurTech, Life Sciences, Mobility, AdTech, SaaS & Enterprise Software, and other frontier technologies.

Mr. Nashef was previously a partner at the international law firm Pearl Cohen (hi tech team), and prior to that, a Senior Associate in the International & Venture Law Group of Gross & Co. (later merged into Goldfarb Gross Seligman, now the largest law firm in Israel). In 2013, he was as Senior Legal Advisor for the UNCTAD.

Mr. Nashef is active in several non-profit organizations in the areas of entrepreneurship and technology. Among others, he serves as the chairman of the board of Hasoub Angels, sits on the board of the Palestinian Internship Program (PIP) and Hasoub, and is a member of the Audit Committee of Co-Impact.`,
    },
    education: [
      { degree: 'LL.B (Hons)', institution: 'University of Essex', year: 2002 },
    ],
    email: 'nashef@nas-law.com',
    linkedin: 'https://www.linkedin.com/in/abdelrahim-nashef',
  },
  'khaled-aun': {
    name: { en: 'Khaled Aun', ar: 'خالد عون', he: 'חאלד עון' },
    title: { en: 'Partner', ar: 'شريك', he: 'שותף' },
    specialties: {
      en: 'Litigation | Commercial Litigation',
      ar: 'التقاضي | التقاضي التجاري',
      he: 'ליטיגציה | ליטיגציה מסחרית',
    },
    quote: {
      en: 'In court hearings, the power to convince is the name of the game. It is important to deliver messages in a clear, real, direct and simple way. This is how the right party behaves',
      ar: 'في جلسات المحكمة، قوة الإقناع هي اسم اللعبة. من المهم توصيل الرسائل بطريقة واضحة وحقيقية ومباشرة وبسيطة',
      he: 'בדיונים בבית המשפט, כוח השכנוע הוא שם המשחק. חשוב להעביר מסרים בצורה ברורה, אמיתית, ישירה ופשוטה',
    },
    bio: {
      en: `Adv. Aun represents official parties, commercial corporations and clients while providing an ongoing and comprehensive representation and making sure to maximize the rights of those he represents. His writings can often be found in legal databases.

Adv. Khaled Aun is a graduate of the Hebrew University in Jerusalem. He began his career at one of the leading law firms in the north, specializing in civil and land law. Since then, he has been constantly handling civil and commercial litigation, with emphasis on land disputes and complex monetary suits, and representing employers in employment disputes.

Throughout the years, adv. Aun has represented Israeli and foreign clients managing their legal affairs in Israel with a personal and direct link with stakeholders, while coordinating legal actions with a wide view and in a manner that projects to the client in their current residence.

Adv. Aun represents clients in various courts and proceedings in Israel and believes in coordinating and laying out his moves in a comprehensive manner with the client, experts (professionals, including evaluators, engineers, actuaries and more) for each specific case, and most of all with the office's team for all other fields of law.

Adv. Aun is a firm believer in transparency and honesty in his relationships with his clients while fighting without compromise for their interests and with a structured strategy.`,
    },
    education: [
      { degree: 'LL.B.', institution: 'The Hebrew University of Jerusalem' },
    ],
    email: 'aun@nas-law.com',
    linkedin: 'https://www.linkedin.com/in/khaledaun',
  },
  'hisham-shaban': {
    name: { en: 'Hisham Shaban', ar: 'هشام شعبان', he: 'הישאם שאבאן' },
    title: { en: 'Partner', ar: 'شريك', he: 'שותף' },
    specialties: {
      en: 'Real Estate | Planning & Construction',
      ar: 'العقارات | التخطيط والبناء',
      he: 'נדל"ן | תכנון ובנייה',
    },
    quote: {
      en: 'My approach is similar to that of a surgeon: every small detail is a whole world and controlling the entirety is the key to successfully locking in a deal',
      ar: 'نهجي مشابه لنهج الجراح: كل تفصيلة صغيرة هي عالم كامل والسيطرة على الكل هي مفتاح إتمام الصفقة بنجاح',
      he: 'הגישה שלי דומה לזו של מנתח: כל פרט קטן הוא עולם שלם והשליטה בשלם היא המפתח לסגירת עסקה בהצלחה',
    },
    bio: {
      en: `Adv. Hisham Shaban provides legal consultation and counseling for a wide variety of clients, among whom are private clients, entrepreneurs, public entities and local authorities.

Adv. Shaban provides counseling all around the world of real estate: comprehensive commercial thinking, drafting complex agreements, negotiating, sale agreements, rent agreements, asset management agreements, land partnership agreements, including representation in negotiations and representing parties to partnership disputes.

Adv. Shaban holds a Bachelor of Law degree from the University of Tel Aviv. He interned at Yigal Arnon & Co. law firm in one of the important and leading real estate departments in Israel. Adv. Shaban later served as in house counsel at one of the largest yield-bearing real estate companies in Israel. Between 2017 and 2020, Adv. Shaban was a partner in a private law firm he co-founded specializing in commercial real estate and planning and construction, and corporate representation in the field of infrastructure.

Adv. Shaban is a graduate of the Masters' program in City and Region Planning at the Technion (Israel Institute of Technology), which further emphasizes his expertise in the field of planning and construction. In such capacity, Adv. Shaban represents his clients in the various planning committees and promote plans, file objections, appeals and others.`,
    },
    education: [
      { degree: 'LL.B.', institution: 'University of Tel Aviv' },
      { degree: 'M.A. City and Region Planning', institution: 'Technion - Israel Institute of Technology' },
    ],
    email: 'shaban@nas-law.com',
    linkedin: 'https://www.linkedin.com/in/hisham-shaban',
  },
};

export async function generateMetadata({ params: { locale, slug } }) {
  const partner = partnersData[slug];
  if (!partner) return { title: 'Not Found' };

  return {
    title: `${partner.name[locale] || partner.name.en} | NAS & Co.`,
    description: partner.quote[locale] || partner.quote.en,
  };
}

export default function PartnerPage({ params: { locale, slug } }) {
  unstable_setRequestLocale(locale);

  const partner = partnersData[slug];
  if (!partner) {
    notFound();
  }

  return (
    <>
      <FirmNavbar locale={locale} />
      <main className="pt-24">
        {/* Partner Header */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Photo */}
              <div className="lg:col-span-1">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                  {/* Placeholder - will be replaced with actual image */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-8xl text-gray-500">👤</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <span className="text-brand-gold font-medium">
                    {partner.title[locale] || partner.title.en}
                  </span>
                  <h1 className="text-4xl md:text-5xl font-bold text-brand-navy mt-2">
                    {partner.name[locale] || partner.name.en}
                  </h1>
                </div>

                <div className="w-16 h-1 bg-brand-gold mb-6"></div>

                <p className="text-brand-navy font-medium mb-6">
                  {partner.specialties[locale] || partner.specialties.en}
                </p>

                {/* Quote */}
                <blockquote className="text-lg italic text-gray-600 border-l-4 border-brand-gold pl-6 mb-8">
                  "{partner.quote[locale] || partner.quote.en}"
                </blockquote>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4">
                  <a
                    href={`mailto:${partner.email}`}
                    className="inline-flex items-center px-6 py-3 bg-brand-gold text-white font-medium rounded-md hover:bg-brand-gold/90 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {locale === 'he' ? 'שלח אימייל' : locale === 'ar' ? 'أرسل بريدًا إلكترونيًا' : 'Send Email'}
                  </a>
                  {partner.linkedin && (
                    <a
                      href={partner.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 border-2 border-brand-navy text-brand-navy font-medium rounded-md hover:bg-brand-navy hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Biography */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-brand-navy mb-6">
                {locale === 'he' ? 'אודות' : locale === 'ar' ? 'نبذة' : 'Biography'}
              </h2>
              <div className="prose prose-lg max-w-none">
                {partner.bio[locale || 'en']?.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Education */}
        {partner.education && partner.education.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-brand-navy mb-6">
                  {locale === 'he' ? 'השכלה' : locale === 'ar' ? 'التعليم' : 'Education'}
                </h2>
                <div className="space-y-4">
                  {partner.education.map((edu, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-3 h-3 bg-brand-gold rounded-full mt-2 mr-4"></div>
                      <div>
                        <p className="font-semibold text-brand-navy">{edu.degree}</p>
                        <p className="text-gray-600">
                          {edu.institution}
                          {edu.year && ` (${edu.year})`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Back to Team */}
        <section className="py-8 bg-white border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href={`/${locale}/team`}
              className="inline-flex items-center text-brand-gold font-medium hover:text-brand-navy transition-colors"
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
          </div>
        </section>
      </main>
      <FirmFooter locale={locale} />
    </>
  );
}
