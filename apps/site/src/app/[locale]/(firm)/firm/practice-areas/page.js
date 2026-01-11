import { unstable_setRequestLocale } from 'next-intl/server';
import FirmNavbar from '@/components/firm/FirmNavbar';
import FirmFooter from '@/components/firm/FirmFooter';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Practice areas data - matches FirmPracticeAreas component
const practiceAreas = [
  {
    key: 'commercialCorporate',
    slug: 'commercial-corporate-law',
    icon: '📋',
    name: { en: 'Commercial & Corporate Law', ar: 'القانون التجاري والشركات', he: 'משפט מסחרי ותאגידי' },
    description: {
      en: 'Comprehensive legal services for businesses, including company formation, corporate governance, mergers and acquisitions, and commercial contracts.',
      ar: 'خدمات قانونية شاملة للشركات، بما في ذلك تأسيس الشركات، وحوكمة الشركات، والاندماج والاستحواذ، والعقود التجارية.',
      he: 'שירותים משפטיים מקיפים לעסקים, כולל הקמת חברות, ממשל תאגידי, מיזוגים ורכישות וחוזים מסחריים.',
    },
  },
  {
    key: 'startupsVC',
    slug: 'startups-hitech-venture-capital',
    icon: '🚀',
    name: { en: 'Startups, Hi-Tech & Venture Capital', ar: 'الشركات الناشئة والتكنولوجيا الفائقة ورأس المال المخاطر', he: 'סטארטאפים, היי-טק והון סיכון' },
    description: {
      en: 'Legal guidance for startups from incorporation through exit, including funding rounds, investor relations, and intellectual property protection.',
      ar: 'إرشاد قانوني للشركات الناشئة من التأسيس حتى الخروج، بما في ذلك جولات التمويل وعلاقات المستثمرين وحماية الملكية الفكرية.',
      he: 'ליווי משפטי לסטארטאפים מההקמה ועד האקזיט, כולל סבבי מימון, יחסי משקיעים והגנה על קניין רוחני.',
    },
  },
  {
    key: 'taxLaw',
    slug: 'tax-law',
    icon: '📊',
    name: { en: 'Tax Law', ar: 'قانون الضرائب', he: 'דיני מיסים' },
    description: {
      en: 'Strategic tax planning and compliance for individuals and businesses, including cross-border transactions and international tax structures.',
      ar: 'التخطيط الضريبي الاستراتيجي والامتثال للأفراد والشركات، بما في ذلك المعاملات عبر الحدود والهياكل الضريبية الدولية.',
      he: 'תכנון מס אסטרטגי וציות עבור יחידים ועסקים, כולל עסקאות חוצות גבולות ומבני מס בינלאומיים.',
    },
  },
  {
    key: 'constructionZoning',
    slug: 'construction-zoning-law',
    icon: '🏗️',
    name: { en: 'Construction & Zoning Law', ar: 'قانون البناء والتنظيم', he: 'דיני בנייה ותכנון' },
    description: {
      en: 'Expert legal counsel for construction projects, zoning disputes, permits, and regulatory compliance in real estate development.',
      ar: 'استشارات قانونية خبيرة لمشاريع البناء، ونزاعات التنظيم، والتصاريح، والامتثال التنظيمي في التطوير العقاري.',
      he: 'ייעוץ משפטי מומחה לפרויקטי בנייה, סכסוכי תכנון, היתרים וציות רגולטורי בפיתוח נדל"ן.',
    },
  },
  {
    key: 'employmentLabor',
    slug: 'employment-labor-law',
    icon: '👥',
    name: { en: 'Employment & Labor Law', ar: 'قانون العمل', he: 'דיני עבודה' },
    description: {
      en: 'Representing employers in all aspects of employment law, including contracts, disputes, terminations, and regulatory compliance.',
      ar: 'تمثيل أصحاب العمل في جميع جوانب قانون العمل، بما في ذلك العقود والنزاعات وإنهاء الخدمة والامتثال التنظيمي.',
      he: 'ייצוג מעסיקים בכל היבטי דיני העבודה, כולל חוזים, סכסוכים, פיטורים וציות רגולטורי.',
    },
  },
  {
    key: 'realEstate',
    slug: 'private-commercial-real-estate',
    icon: '🏢',
    name: { en: 'Private & Commercial Real Estate', ar: 'العقارات الخاصة والتجارية', he: 'נדל"ן פרטי ומסחרי' },
    description: {
      en: 'Full-service real estate legal support including transactions, leasing, property management, and investment structures.',
      ar: 'دعم قانوني شامل للعقارات بما في ذلك المعاملات والتأجير وإدارة الممتلكات وهياكل الاستثمار.',
      he: 'תמיכה משפטית מלאה בנדל"ן כולל עסקאות, השכרה, ניהול נכסים ומבני השקעה.',
    },
  },
  {
    key: 'commercialLitigation',
    slug: 'commercial-litigation',
    icon: '⚖️',
    name: { en: 'Commercial Litigation', ar: 'التقاضي التجاري', he: 'ליטיגציה מסחרית' },
    description: {
      en: 'Aggressive representation in commercial disputes, contract litigation, and business torts, with a focus on achieving optimal outcomes.',
      ar: 'تمثيل قوي في النزاعات التجارية والتقاضي التعاقدي والأضرار التجارية، مع التركيز على تحقيق أفضل النتائج.',
      he: 'ייצוג אגרסיבי בסכסוכים מסחריים, ליטיגציית חוזים ועוולות עסקיות, עם דגש על השגת תוצאות מיטביות.',
    },
  },
  {
    key: 'infrastructure',
    slug: 'infrastructures-municipal-corporations',
    icon: '🏛️',
    name: { en: 'Infrastructure & Municipal Corporations', ar: 'البنية التحتية والشركات البلدية', he: 'תשתיות ותאגידים עירוניים' },
    description: {
      en: 'Legal services for infrastructure projects and municipal corporations, including public-private partnerships and regulatory matters.',
      ar: 'خدمات قانونية لمشاريع البنية التحتية والشركات البلدية، بما في ذلك الشراكات بين القطاعين العام والخاص والمسائل التنظيمية.',
      he: 'שירותים משפטיים לפרויקטי תשתית ותאגידים עירוניים, כולל שותפויות ציבוריות-פרטיות וענייני רגולציה.',
    },
  },
  {
    key: 'intellectualProperty',
    slug: 'intellectual-property',
    icon: '💡',
    name: { en: 'Intellectual Property', ar: 'الملكية الفكرية', he: 'קניין רוחני' },
    description: {
      en: 'Protection and enforcement of intellectual property rights, including patents, trademarks, copyrights, and trade secrets.',
      ar: 'حماية وإنفاذ حقوق الملكية الفكرية، بما في ذلك براءات الاختراع والعلامات التجارية وحقوق النشر والأسرار التجارية.',
      he: 'הגנה ואכיפה של זכויות קניין רוחני, כולל פטנטים, סימני מסחר, זכויות יוצרים וסודות מסחריים.',
    },
  },
  {
    key: 'partnershipDissolution',
    slug: 'dissolution-real-estate-partnerships',
    icon: '📑',
    name: { en: 'Dissolution of Real Estate Partnerships', ar: 'حل الشراكات العقارية', he: 'פירוק שותפויות מקרקעין' },
    description: {
      en: 'Expert guidance in dissolving real estate partnerships, property division, and resolving partner disputes.',
      ar: 'إرشاد خبير في حل الشراكات العقارية وتقسيم الممتلكات وحل نزاعات الشركاء.',
      he: 'הנחיה מומחית בפירוק שותפויות מקרקעין, חלוקת רכוש ופתרון סכסוכי שותפים.',
    },
  },
  {
    key: 'municipalTax',
    slug: 'municipal-property-tax',
    icon: '🏠',
    name: { en: 'Municipal Property Tax', ar: 'ضريبة الأملاك البلدية', he: 'ארנונה ומיסוי מוניציפלי' },
    description: {
      en: 'Representation in municipal property tax matters, including assessments, appeals, and optimization strategies.',
      ar: 'التمثيل في مسائل ضريبة الأملاك البلدية، بما في ذلك التقييمات والطعون واستراتيجيات التحسين.',
      he: 'ייצוג בענייני ארנונה ומיסוי עירוני, כולל שומות, ערעורים ואסטרטגיות ייעול.',
    },
  },
  {
    key: 'nonProfit',
    slug: 'non-profit-organizations',
    icon: '❤️',
    name: { en: 'Non-Profit Organizations', ar: 'المنظمات غير الربحية', he: 'ארגונים ללא מטרות רווח' },
    description: {
      en: 'Comprehensive legal services for non-profit organizations, including formation, governance, compliance, and tax-exempt status.',
      ar: 'خدمات قانونية شاملة للمنظمات غير الربحية، بما في ذلك التأسيس والحوكمة والامتثال والإعفاء الضريبي.',
      he: 'שירותים משפטיים מקיפים לארגונים ללא מטרות רווח, כולל הקמה, ממשל, ציות ומעמד פטור ממס.',
    },
  },
];

export async function generateMetadata({ params: { locale } }) {
  const titles = {
    en: 'Practice Areas | NAS & Co.',
    ar: 'مجالات الممارسة | ناشف، عون، شعبان وشركاه',
    he: 'תחומי עיסוק | נאשף, עון, שאבאן ושות\'',
  };

  return {
    title: titles[locale] || titles.en,
    description: 'Explore our comprehensive legal practice areas at NAS & Co.',
  };
}

export default function PracticeAreasPage({ params: { locale } }) {
  unstable_setRequestLocale(locale);

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
                {locale === 'he' ? 'תחומי עיסוק' : locale === 'ar' ? 'مجالات الممارسة' : 'PRACTICE AREAS'}
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                {locale === 'he'
                  ? 'אנו מציעים שירותים משפטיים מקיפים במגוון רחב של תחומים, תוך שמירה על מצוינות וייעוץ אישי'
                  : locale === 'ar'
                  ? 'نقدم خدمات قانونية شاملة في مجموعة واسعة من المجالات، مع الحفاظ على التميز والاستشارة الشخصية'
                  : 'We offer comprehensive legal services across a wide range of practice areas, maintaining excellence and personalized counsel'}
              </p>
            </div>
          </div>
        </section>

        {/* Practice Areas Grid */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {practiceAreas.map((area) => (
                <Link
                  key={area.slug}
                  href={`/${locale}/firm/practice-areas/${area.slug}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-8">
                    <div className="flex items-center mb-4">
                      <span className="text-4xl mr-4 group-hover:scale-110 transition-transform">
                        {area.icon}
                      </span>
                      <h2 className="text-xl font-bold text-brand-navy group-hover:text-brand-gold transition-colors">
                        {area.name[locale] || area.name.en}
                      </h2>
                    </div>
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {area.description[locale] || area.description.en}
                    </p>
                    <div className="flex items-center text-brand-gold font-medium">
                      <span>{locale === 'he' ? 'קרא עוד' : locale === 'ar' ? 'اقرأ المزيد' : 'Learn More'}</span>
                      <svg
                        className={`w-5 h-5 ${locale === 'he' || locale === 'ar' ? 'mr-2 rotate-180' : 'ml-2'} group-hover:translate-x-1 transition-transform`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-brand-navy">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              {locale === 'he'
                ? 'צריכים ייעוץ משפטי?'
                : locale === 'ar'
                ? 'تحتاج استشارة قانونية؟'
                : 'Need Legal Consultation?'}
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              {locale === 'he'
                ? 'צוות המומחים שלנו מוכן לסייע לכם בכל סוגיה משפטית'
                : locale === 'ar'
                ? 'فريق خبرائنا جاهز لمساعدتك في أي مسألة قانونية'
                : 'Our team of experts is ready to assist you with any legal matter'}
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
