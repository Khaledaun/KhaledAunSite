import { unstable_setRequestLocale } from 'next-intl/server';
import FirmNavbar from '@/components/firm/FirmNavbar';
import FirmFooter from '@/components/firm/FirmFooter';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Practice areas data with full details
const practiceAreasData = {
  'commercial-corporate-law': {
    icon: '📋',
    name: { en: 'Commercial & Corporate Law', ar: 'القانون التجاري والشركات', he: 'משפט מסחרי ותאגידי' },
    description: {
      en: 'Comprehensive legal services for businesses, including company formation, corporate governance, mergers and acquisitions, and commercial contracts.',
      ar: 'خدمات قانونية شاملة للشركات، بما في ذلك تأسيس الشركات، وحوكمة الشركات، والاندماج والاستحواذ، والعقود التجارية.',
      he: 'שירותים משפטיים מקיפים לעסקים, כולל הקמת חברות, ממשל תאגידי, מיזוגים ורכישות וחוזים מסחריים.',
    },
    services: {
      en: ['Company formation and registration', 'Corporate governance and compliance', 'Mergers and acquisitions', 'Commercial contract drafting and negotiation', 'Shareholder agreements', 'Joint ventures and partnerships', 'Corporate restructuring'],
      ar: ['تأسيس وتسجيل الشركات', 'حوكمة الشركات والامتثال', 'الاندماج والاستحواذ', 'صياغة العقود التجارية والتفاوض', 'اتفاقيات المساهمين', 'المشاريع المشتركة والشراكات', 'إعادة هيكلة الشركات'],
      he: ['הקמה ורישום חברות', 'ממשל תאגידי וציות', 'מיזוגים ורכישות', 'ניסוח ומשא ומתן על חוזים מסחריים', 'הסכמי בעלי מניות', 'מיזמים משותפים ושותפויות', 'ארגון מחדש תאגידי'],
    },
    partners: ['abdelrahim-nashef'],
  },
  'startups-hitech-venture-capital': {
    icon: '🚀',
    name: { en: 'Startups, Hi-Tech & Venture Capital', ar: 'الشركات الناشئة والتكنولوجيا الفائقة ورأس المال المخاطر', he: 'סטארטאפים, היי-טק והון סיכון' },
    description: {
      en: 'Legal guidance for startups from incorporation through exit, including funding rounds, investor relations, and intellectual property protection.',
      ar: 'إرشاد قانوني للشركات الناشئة من التأسيس حتى الخروج، بما في ذلك جولات التمويل وعلاقات المستثمرين وحماية الملكية الفكرية.',
      he: 'ליווי משפטי לסטארטאפים מההקמה ועד האקזיט, כולל סבבי מימון, יחסי משקיעים והגנה על קניין רוחני.',
    },
    services: {
      en: ['Seed, Series A, B, C funding rounds', 'SAFE and convertible note agreements', 'Term sheet negotiations', 'Due diligence support', 'Employee stock option plans (ESOP)', 'Exit strategies and M&A', 'Fund formation for VCs'],
      ar: ['جولات التمويل الأولية والسلسلة A و B و C', 'اتفاقيات SAFE والسندات القابلة للتحويل', 'مفاوضات أوراق الشروط', 'دعم العناية الواجبة', 'خطط خيارات أسهم الموظفين', 'استراتيجيات الخروج والاستحواذ', 'تشكيل صناديق رأس المال المخاطر'],
      he: ['סבבי מימון Seed, Series A, B, C', 'הסכמי SAFE ואג"ח להמרה', 'משא ומתן על term sheets', 'תמיכה בבדיקת נאותות', 'תוכניות אופציות לעובדים (ESOP)', 'אסטרטגיות יציאה ו-M&A', 'הקמת קרנות הון סיכון'],
    },
    partners: ['abdelrahim-nashef'],
  },
  'tax-law': {
    icon: '📊',
    name: { en: 'Tax Law', ar: 'قانون الضرائب', he: 'דיני מיסים' },
    description: {
      en: 'Strategic tax planning and compliance for individuals and businesses, including cross-border transactions and international tax structures.',
      ar: 'التخطيط الضريبي الاستراتيجي والامتثال للأفراد والشركات، بما في ذلك المعاملات عبر الحدود والهياكل الضريبية الدولية.',
      he: 'תכנון מס אסטרטגי וציות עבור יחידים ועסקים, כולל עסקאות חוצות גבולות ומבני מס בינלאומיים.',
    },
    services: {
      en: ['Tax planning and optimization', 'Cross-border tax structures', 'Tax dispute resolution', 'Transfer pricing', 'VAT consulting', 'Tax due diligence', 'International tax planning'],
      ar: ['التخطيط الضريبي والتحسين', 'الهياكل الضريبية عبر الحدود', 'حل النزاعات الضريبية', 'التسعير التحويلي', 'استشارات ضريبة القيمة المضافة', 'العناية الواجبة الضريبية', 'التخطيط الضريبي الدولي'],
      he: ['תכנון מס ואופטימיזציה', 'מבני מס חוצי גבולות', 'יישוב סכסוכי מס', 'תמחור העברה', 'ייעוץ מע"מ', 'בדיקת נאותות מיסויית', 'תכנון מס בינלאומי'],
    },
    partners: ['abdelrahim-nashef'],
  },
  'construction-zoning-law': {
    icon: '🏗️',
    name: { en: 'Construction & Zoning Law', ar: 'قانون البناء والتنظيم', he: 'דיני בנייה ותכנון' },
    description: {
      en: 'Expert legal counsel for construction projects, zoning disputes, permits, and regulatory compliance in real estate development.',
      ar: 'استشارات قانونية خبيرة لمشاريع البناء، ونزاعات التنظيم، والتصاريح، والامتثال التنظيمي في التطوير العقاري.',
      he: 'ייעוץ משפטי מומחה לפרויקטי בנייה, סכסוכי תכנון, היתרים וציות רגולטורי בפיתוח נדל"ן.',
    },
    services: {
      en: ['Building permits and approvals', 'Zoning variance applications', 'Planning committee representation', 'Construction contract disputes', 'Regulatory compliance', 'Urban renewal projects', 'Environmental permits'],
      ar: ['تصاريح البناء والموافقات', 'طلبات الاستثناء من التنظيم', 'التمثيل في لجان التخطيط', 'نزاعات عقود البناء', 'الامتثال التنظيمي', 'مشاريع التجديد الحضري', 'التصاريح البيئية'],
      he: ['היתרי בנייה ואישורים', 'בקשות להקלות תכנוניות', 'ייצוג בוועדות תכנון', 'סכסוכי חוזי בנייה', 'ציות רגולטורי', 'פרויקטי התחדשות עירונית', 'היתרים סביבתיים'],
    },
    partners: ['hisham-shaban'],
  },
  'employment-labor-law': {
    icon: '👥',
    name: { en: 'Employment & Labor Law', ar: 'قانون العمل', he: 'דיני עבודה' },
    description: {
      en: 'Representing employers in all aspects of employment law, including contracts, disputes, terminations, and regulatory compliance.',
      ar: 'تمثيل أصحاب العمل في جميع جوانب قانون العمل، بما في ذلك العقود والنزاعات وإنهاء الخدمة والامتثال التنظيمي.',
      he: 'ייצוג מעסיקים בכל היבטי דיני העבודה, כולל חוזים, סכסוכים, פיטורים וציות רגולטורי.',
    },
    services: {
      en: ['Employment contract drafting', 'Termination and severance', 'Labor dispute resolution', 'Collective bargaining', 'Employment litigation', 'Workplace policies', 'Executive compensation'],
      ar: ['صياغة عقود العمل', 'إنهاء الخدمة والتعويضات', 'حل نزاعات العمل', 'المفاوضة الجماعية', 'التقاضي في قضايا العمل', 'سياسات مكان العمل', 'تعويضات المديرين التنفيذيين'],
      he: ['ניסוח חוזי עבודה', 'פיטורים ופיצויים', 'יישוב סכסוכי עבודה', 'משא ומתן קיבוצי', 'ליטיגציה בתחום העבודה', 'מדיניות מקום עבודה', 'תגמול בכירים'],
    },
    partners: ['khaled-aun'],
  },
  'private-commercial-real-estate': {
    icon: '🏢',
    name: { en: 'Private & Commercial Real Estate', ar: 'العقارات الخاصة والتجارية', he: 'נדל"ן פרטי ומסחרי' },
    description: {
      en: 'Full-service real estate legal support including transactions, leasing, property management, and investment structures.',
      ar: 'دعم قانوني شامل للعقارات بما في ذلك المعاملات والتأجير وإدارة الممتلكات وهياكل الاستثمار.',
      he: 'תמיכה משפטית מלאה בנדל"ן כולל עסקאות, השכרה, ניהול נכסים ומבני השקעה.',
    },
    services: {
      en: ['Property acquisitions and sales', 'Commercial lease agreements', 'Property management contracts', 'Real estate investment structures', 'Title examination', 'Land registration', 'Property development'],
      ar: ['الاستحواذ على العقارات والمبيعات', 'اتفاقيات الإيجار التجاري', 'عقود إدارة الممتلكات', 'هياكل الاستثمار العقاري', 'فحص الملكية', 'تسجيل الأراضي', 'التطوير العقاري'],
      he: ['רכישת ומכירת נכסים', 'הסכמי שכירות מסחריים', 'חוזי ניהול נכסים', 'מבני השקעה בנדל"ן', 'בדיקת זכויות', 'רישום מקרקעין', 'פיתוח נכסים'],
    },
    partners: ['hisham-shaban'],
  },
  'commercial-litigation': {
    icon: '⚖️',
    name: { en: 'Commercial Litigation', ar: 'التقاضي التجاري', he: 'ליטיגציה מסחרית' },
    description: {
      en: 'Aggressive representation in commercial disputes, contract litigation, and business torts, with a focus on achieving optimal outcomes.',
      ar: 'تمثيل قوي في النزاعات التجارية والتقاضي التعاقدي والأضرار التجارية، مع التركيز على تحقيق أفضل النتائج.',
      he: 'ייצוג אגרסיבי בסכסוכים מסחריים, ליטיגציית חוזים ועוולות עסקיות, עם דגש על השגת תוצאות מיטביות.',
    },
    services: {
      en: ['Contract disputes', 'Shareholder disputes', 'Business torts', 'Collection actions', 'Injunctions and emergency relief', 'Class action defense', 'International arbitration'],
      ar: ['نزاعات العقود', 'نزاعات المساهمين', 'الأضرار التجارية', 'إجراءات التحصيل', 'الأوامر الزجرية والإغاثة الطارئة', 'الدفاع في الدعاوى الجماعية', 'التحكيم الدولي'],
      he: ['סכסוכי חוזים', 'סכסוכי בעלי מניות', 'עוולות עסקיות', 'הליכי גבייה', 'צווי מניעה וסעדים דחופים', 'הגנה בתביעות ייצוגיות', 'בוררות בינלאומית'],
    },
    partners: ['khaled-aun'],
  },
  'infrastructures-municipal-corporations': {
    icon: '🏛️',
    name: { en: 'Infrastructure & Municipal Corporations', ar: 'البنية التحتية والشركات البلدية', he: 'תשתיות ותאגידים עירוניים' },
    description: {
      en: 'Legal services for infrastructure projects and municipal corporations, including public-private partnerships and regulatory matters.',
      ar: 'خدمات قانونية لمشاريع البنية التحتية والشركات البلدية، بما في ذلك الشراكات بين القطاعين العام والخاص والمسائل التنظيمية.',
      he: 'שירותים משפטיים לפרויקטי תשתית ותאגידים עירוניים, כולל שותפויות ציבוריות-פרטיות וענייני רגולציה.',
    },
    services: {
      en: ['Public-private partnerships', 'Municipal law consulting', 'Infrastructure project agreements', 'Government contracts', 'Regulatory compliance', 'Public procurement', 'Water and utilities corporations'],
      ar: ['الشراكات بين القطاعين العام والخاص', 'استشارات القانون البلدي', 'اتفاقيات مشاريع البنية التحتية', 'العقود الحكومية', 'الامتثال التنظيمي', 'المشتريات العامة', 'شركات المياه والمرافق'],
      he: ['שותפויות ציבוריות-פרטיות', 'ייעוץ בדיני מוניציפליות', 'הסכמי פרויקטי תשתית', 'חוזים ממשלתיים', 'ציות רגולטורי', 'מכרזים ציבוריים', 'תאגידי מים ושירותים'],
    },
    partners: ['hisham-shaban'],
  },
  'intellectual-property': {
    icon: '💡',
    name: { en: 'Intellectual Property', ar: 'الملكية الفكرية', he: 'קניין רוחני' },
    description: {
      en: 'Protection and enforcement of intellectual property rights, including patents, trademarks, copyrights, and trade secrets.',
      ar: 'حماية وإنفاذ حقوق الملكية الفكرية، بما في ذلك براءات الاختراع والعلامات التجارية وحقوق النشر والأسرار التجارية.',
      he: 'הגנה ואכיפה של זכויות קניין רוחני, כולל פטנטים, סימני מסחר, זכויות יוצרים וסודות מסחריים.',
    },
    services: {
      en: ['Patent prosecution and licensing', 'Trademark registration', 'Copyright protection', 'Trade secret agreements', 'IP due diligence', 'Licensing agreements', 'IP litigation'],
      ar: ['تسجيل وترخيص براءات الاختراع', 'تسجيل العلامات التجارية', 'حماية حقوق النشر', 'اتفاقيات الأسرار التجارية', 'العناية الواجبة للملكية الفكرية', 'اتفاقيات الترخيص', 'التقاضي في الملكية الفكرية'],
      he: ['רישום ורישוי פטנטים', 'רישום סימני מסחר', 'הגנה על זכויות יוצרים', 'הסכמי סודות מסחריים', 'בדיקת נאותות קניין רוחני', 'הסכמי רישוי', 'ליטיגציה בקניין רוחני'],
    },
    partners: ['abdelrahim-nashef'],
  },
  'dissolution-real-estate-partnerships': {
    icon: '📑',
    name: { en: 'Dissolution of Real Estate Partnerships', ar: 'حل الشراكات العقارية', he: 'פירוק שותפויות מקרקעין' },
    description: {
      en: 'Expert guidance in dissolving real estate partnerships, property division, and resolving partner disputes.',
      ar: 'إرشاد خبير في حل الشراكات العقارية وتقسيم الممتلكات وحل نزاعات الشركاء.',
      he: 'הנחיה מומחית בפירוק שותפויות מקרקעין, חלוקת רכוש ופתרון סכסוכי שותפים.',
    },
    services: {
      en: ['Partnership dissolution', 'Property division agreements', 'Partition actions', 'Buyout negotiations', 'Valuation disputes', 'Court representation', 'Settlement agreements'],
      ar: ['حل الشراكات', 'اتفاقيات تقسيم الممتلكات', 'دعاوى التقسيم', 'مفاوضات الشراء', 'نزاعات التقييم', 'التمثيل أمام المحاكم', 'اتفاقيات التسوية'],
      he: ['פירוק שותפויות', 'הסכמי חלוקת רכוש', 'תביעות פירוק', 'משא ומתן לרכישה', 'סכסוכי שמאות', 'ייצוג בבית משפט', 'הסכמי פשרה'],
    },
    partners: ['hisham-shaban', 'khaled-aun'],
  },
  'municipal-property-tax': {
    icon: '🏠',
    name: { en: 'Municipal Property Tax', ar: 'ضريبة الأملاك البلدية', he: 'ארנונה ומיסוי מוניציפלי' },
    description: {
      en: 'Representation in municipal property tax matters, including assessments, appeals, and optimization strategies.',
      ar: 'التمثيل في مسائل ضريبة الأملاك البلدية، بما في ذلك التقييمات والطعون واستراتيجيات التحسين.',
      he: 'ייצוג בענייני ארנונה ומיסוי עירוני, כולל שומות, ערעורים ואסטרטגיות ייעול.',
    },
    services: {
      en: ['Property tax assessments', 'Tax appeal representation', 'Classification disputes', 'Exemption applications', 'Tax optimization strategies', 'Municipal negotiations', 'Administrative proceedings'],
      ar: ['تقييم ضريبة الأملاك', 'تمثيل الطعون الضريبية', 'نزاعات التصنيف', 'طلبات الإعفاء', 'استراتيجيات التحسين الضريبي', 'المفاوضات البلدية', 'الإجراءات الإدارية'],
      he: ['שומות ארנונה', 'ייצוג בערעורי מס', 'סכסוכי סיווג', 'בקשות לפטור', 'אסטרטגיות ייעול מס', 'משא ומתן עם הרשות', 'הליכים מנהליים'],
    },
    partners: ['hisham-shaban'],
  },
  'non-profit-organizations': {
    icon: '❤️',
    name: { en: 'Non-Profit Organizations', ar: 'المنظمات غير الربحية', he: 'ארגונים ללא מטרות רווח' },
    description: {
      en: 'Comprehensive legal services for non-profit organizations, including formation, governance, compliance, and tax-exempt status.',
      ar: 'خدمات قانونية شاملة للمنظمات غير الربحية، بما في ذلك التأسيس والحوكمة والامتثال والإعفاء الضريبي.',
      he: 'שירותים משפטיים מקיפים לארגונים ללא מטרות רווח, כולל הקמה, ממשל, ציות ומעמד פטור ממס.',
    },
    services: {
      en: ['Non-profit formation', 'Tax-exempt status applications', 'Board governance', 'Compliance and reporting', 'Grant agreements', 'Employment matters', 'Mergers and affiliations'],
      ar: ['تأسيس المنظمات غير الربحية', 'طلبات الإعفاء الضريبي', 'حوكمة مجلس الإدارة', 'الامتثال والتقارير', 'اتفاقيات المنح', 'شؤون التوظيف', 'الاندماج والانتماء'],
      he: ['הקמת עמותות', 'בקשות לפטור ממס', 'ממשל דירקטוריון', 'ציות ודיווח', 'הסכמי מענקים', 'ענייני תעסוקה', 'מיזוגים והתאגדויות'],
    },
    partners: ['abdelrahim-nashef'],
  },
};

// Partner info for display
const partnersInfo = {
  'abdelrahim-nashef': {
    name: { en: 'Abdelrahim Nashef', ar: 'عبد الرحيم ناشف', he: 'עבד אל-רחים נאשף' },
    title: { en: 'Managing Partner', ar: 'الشريك الإداري', he: 'שותף מנהל' },
  },
  'khaled-aun': {
    name: { en: 'Khaled Aun', ar: 'خالد عون', he: 'חאלד עון' },
    title: { en: 'Partner', ar: 'شريك', he: 'שותף' },
  },
  'hisham-shaban': {
    name: { en: 'Hisham Shaban', ar: 'هشام شعبان', he: 'הישאם שאבאן' },
    title: { en: 'Partner', ar: 'شريك', he: 'שותף' },
  },
};

export async function generateMetadata({ params: { locale, slug } }) {
  const area = practiceAreasData[slug];
  if (!area) return { title: 'Not Found' };

  return {
    title: `${area.name[locale] || area.name.en} | NAS & Co.`,
    description: area.description[locale] || area.description.en,
  };
}

export default function PracticeAreaPage({ params: { locale, slug } }) {
  unstable_setRequestLocale(locale);

  const area = practiceAreasData[slug];
  if (!area) {
    notFound();
  }

  return (
    <>
      <FirmNavbar locale={locale} />
      <main className="pt-24">
        {/* Hero */}
        <section className="bg-brand-navy py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <Link
                href={`/${locale}/firm/practice-areas`}
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
                {locale === 'he' ? 'חזרה לתחומי עיסוק' : locale === 'ar' ? 'العودة إلى مجالات الممارسة' : 'Back to Practice Areas'}
              </Link>
              <div className="flex items-center mb-6">
                <span className="text-5xl mr-4">{area.icon}</span>
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  {area.name[locale] || area.name.en}
                </h1>
              </div>
              <div className="w-24 h-1 bg-brand-gold mb-8"></div>
              <p className="text-xl text-gray-300 leading-relaxed">
                {area.description[locale] || area.description.en}
              </p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-brand-navy mb-8">
                {locale === 'he' ? 'השירותים שלנו' : locale === 'ar' ? 'خدماتنا' : 'Our Services'}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {(area.services[locale] || area.services.en).map((service, index) => (
                  <div key={index} className="flex items-start bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex-shrink-0 w-6 h-6 bg-brand-gold/10 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-4 h-4 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Practice Area Partners */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-brand-navy mb-8">
                {locale === 'he' ? 'עורכי הדין שלנו בתחום זה' : locale === 'ar' ? 'محامونا في هذا المجال' : 'Our Attorneys in This Area'}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {area.partners.map((partnerSlug) => {
                  const partner = partnersInfo[partnerSlug];
                  return (
                    <Link
                      key={partnerSlug}
                      href={`/${locale}/firm/team/${partnerSlug}`}
                      className="group flex items-center p-6 bg-gray-50 rounded-lg hover:bg-brand-navy transition-colors duration-300"
                    >
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-2xl text-gray-500">👤</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-brand-navy group-hover:text-white transition-colors">
                          {partner.name[locale] || partner.name.en}
                        </h3>
                        <p className="text-brand-gold text-sm">
                          {partner.title[locale] || partner.title.en}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-brand-navy">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              {locale === 'he'
                ? 'צריכים סיוע בתחום זה?'
                : locale === 'ar'
                ? 'تحتاج مساعدة في هذا المجال؟'
                : 'Need Assistance in This Area?'}
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              {locale === 'he'
                ? 'צרו קשר עם צוות המומחים שלנו לקבלת ייעוץ משפטי מקצועי'
                : locale === 'ar'
                ? 'تواصل مع فريق خبرائنا للحصول على استشارة قانونية مهنية'
                : 'Contact our team of experts for professional legal consultation'}
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
