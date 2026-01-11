import { PrismaClient, EntityType, CaseStudyType } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// NAS & CO. LAW FIRM SEED DATA
// ============================================================

// Practice Areas (12 areas from the firm website)
const practiceAreas = [
  {
    name: 'Commercial & Corporate Law',
    nameAr: 'القانون التجاري والشركات',
    nameHe: 'משפט מסחרי ותאגידי',
    slug: 'commercial-corporate-law',
    description: 'Comprehensive legal services for businesses including company formation, corporate governance, mergers and acquisitions, joint ventures, and commercial transactions.',
    icon: 'briefcase',
    order: 1,
  },
  {
    name: 'Startups, Hi-Tech & Venture Capital',
    nameAr: 'الشركات الناشئة والتكنولوجيا الفائقة ورأس المال المخاطر',
    nameHe: 'סטארטאפים, היי-טק והון סיכון',
    slug: 'startups-hitech-venture-capital',
    description: 'Legal support for startups from inception through funding rounds, including venture capital transactions, term sheets, shareholder agreements, and technology commercialization.',
    icon: 'rocket',
    order: 2,
  },
  {
    name: 'Tax Law',
    nameAr: 'قانون الضرائب',
    nameHe: 'דיני מיסים',
    slug: 'tax-law',
    description: 'Strategic tax planning and advisory services for individuals and businesses, including corporate tax, international taxation, and tax-efficient structuring.',
    icon: 'calculator',
    order: 3,
  },
  {
    name: 'Construction & Zoning Law',
    nameAr: 'قانون البناء والتنظيم',
    nameHe: 'בנייה ותכנון',
    slug: 'construction-zoning-law',
    description: 'Legal representation in construction projects, planning and zoning matters, building permits, and development agreements.',
    icon: 'building',
    order: 4,
  },
  {
    name: 'Employment & Labor Law',
    nameAr: 'قانون العمل والعمال',
    nameHe: 'דיני עבודה',
    slug: 'employment-labor-law',
    description: 'Comprehensive employment law services including employment agreements, workplace policies, termination procedures, and labor dispute resolution.',
    icon: 'users',
    order: 5,
  },
  {
    name: 'Private & Commercial Real Estate',
    nameAr: 'العقارات الخاصة والتجارية',
    nameHe: 'נדל"ן פרטי ומסחרי',
    slug: 'private-commercial-real-estate',
    description: 'Full-service real estate practice covering transactions, development, leasing, financing, and property management for residential and commercial properties.',
    icon: 'home',
    order: 6,
  },
  {
    name: 'Commercial Litigation',
    nameAr: 'التقاضي التجاري',
    nameHe: 'ליטיגציה מסחרית',
    slug: 'commercial-litigation',
    description: 'Representation in complex commercial disputes, contract litigation, partnership disputes, shareholder conflicts, and business torts.',
    icon: 'gavel',
    order: 7,
  },
  {
    name: 'Infrastructures & Municipal Corporations',
    nameAr: 'البنية التحتية والشركات البلدية',
    nameHe: 'תשתיות ותאגידים עירוניים',
    slug: 'infrastructures-municipal-corporations',
    description: 'Legal services for infrastructure projects, public-private partnerships, municipal corporations, and government contracts.',
    icon: 'city',
    order: 8,
  },
  {
    name: 'Intellectual Property',
    nameAr: 'الملكية الفكرية',
    nameHe: 'קניין רוחני',
    slug: 'intellectual-property',
    description: 'Protection and enforcement of intellectual property rights including patents, trademarks, copyrights, trade secrets, and licensing agreements.',
    icon: 'lightbulb',
    order: 9,
  },
  {
    name: 'Dissolution of Real Estate Partnerships',
    nameAr: 'حل شراكات العقارات',
    nameHe: 'פירוק שותפויות נדל"ן',
    slug: 'dissolution-real-estate-partnerships',
    description: 'Specialized legal services for the dissolution and restructuring of real estate partnerships, including asset division and dispute resolution.',
    icon: 'split',
    order: 10,
  },
  {
    name: 'Municipal Property Tax',
    nameAr: 'ضريبة الأملاك البلدية',
    nameHe: 'מיסוי מוניציפלי',
    slug: 'municipal-property-tax',
    description: 'Advisory and representation in municipal property tax matters, including assessments, appeals, and exemption applications.',
    icon: 'receipt',
    order: 11,
  },
  {
    name: 'Non-Profit Organizations',
    nameAr: 'المنظمات غير الربحية',
    nameHe: 'ארגונים ללא מטרות רווח',
    slug: 'non-profit-organizations',
    description: 'Legal services for non-profit organizations including formation, governance, tax exemption, compliance, and charitable activities.',
    icon: 'heart',
    order: 12,
  },
];

// Firm Entity
const firmEntity = {
  type: EntityType.FIRM,
  name: 'NAS & Co.',
  nameAr: 'ناشف، عون، شعبان وشركاه',
  nameHe: 'נאשף, עון, שאבאן ושות\'',
  slug: 'nas-law',
  title: 'Law Firm',
  titleAr: 'مكتب محاماة',
  titleHe: 'משרד עורכי דין',
  bio: `NASHEF, AUN, SHABAN & CO. (NAS) is a boutique law firm and a legal partner for companies, corporations, investors and entrepreneurs, offering a highly specialized counseling with an in-depth understanding of the legal and regulatory environment and the changing reality of the business world. At NAS, we believe in a long-term strategic view and in the power of visionaries to realize their goals.`,
  bioAr: `ناشف، عون، شعبان وشركاه (NAS) هو مكتب محاماة بوتيك وشريك قانوني للشركات والمستثمرين ورجال الأعمال، يقدم استشارات متخصصة للغاية مع فهم عميق للبيئة القانونية والتنظيمية والواقع المتغير لعالم الأعمال. في NAS، نؤمن بالرؤية الاستراتيجية طويلة المدى وبقوة أصحاب الرؤى لتحقيق أهدافهم.`,
  bioHe: `נאשף, עון, שאבאן ושות' (NAS) הוא משרד עורכי דין בוטיק ושותף משפטי לחברות, תאגידים, משקיעים ויזמים, המציע ייעוץ מתמחה ביותר עם הבנה מעמיקה של הסביבה המשפטית והרגולטורית והמציאות המשתנה של עולם העסקים. ב-NAS, אנו מאמינים בראייה אסטרטגית ארוכת טווח ובכוחם של בעלי חזון להגשים את מטרותיהם.`,
  email: 'info@nas-law.com',
  linkedinUrl: 'https://www.linkedin.com/company/nas-law',
  order: 0,
  isActive: true,
  showOnTeamPage: false,
};

// Partner Entities
const partners = [
  {
    type: EntityType.PARTNER,
    name: 'Abdelrahim Nashef',
    nameAr: 'عبد الرحيم ناشف',
    nameHe: 'עבד אל-רחים נאשף',
    slug: 'abdelrahim-nashef',
    title: 'Managing Partner',
    titleAr: 'الشريك الإداري',
    titleHe: 'שותף מנהל',
    quote: 'In the business world, only those who understand the managerial and business considerations of entrepreneurs and CEOs are able to navigate the legal side',
    quoteAr: 'في عالم الأعمال، فقط أولئك الذين يفهمون الاعتبارات الإدارية والتجارية لرواد الأعمال والمديرين التنفيذيين قادرون على التنقل في الجانب القانوني',
    quoteHe: 'בעולם העסקים, רק מי שמבין את השיקולים הניהוליים והעסקיים של יזמים ומנכ"לים מסוגל לנווט בצד המשפטי',
    bio: `With nearly two decades of regional and international experience, Mr. Nashef brings a unique blend of legal expertise, strategic insight, and deep ecosystem engagement. His practice spans venture capital and private equity financing, fund formation, complex cross-border transactions, commercialization of technologies, and providing corporate and legal counsel to corporations, entrepreneurs, startups, investors and non-profit organizations.

Mr. Nashef has a long track record of handling pioneering venture capital and private equity deals. Since 2008, he has been at the forefront of the venture capital landscape, serving as a trusted advisor and strategic legal partner to hundreds of founders, investors, and startups. His work spans a broad range of high-growth sectors, including e-Commerce, AI, EdTech, Digital Health, FinTech, InsurTech, Life Sciences, Mobility, AdTech, SaaS & Enterprise Software, and other frontier technologies. He has led, structured, and negotiated hundreds of venture capital and private equity transactions across all stages of company growth, from early-stage financings to complex, multi-jurisdictional investment rounds, and has been involved in high-profile M&A deals across various sectors. He is also experienced in negotiating complex commercial agreements, including, technology transfer, licensing, partnerships, distribution and franchise agreements.

Mr. Nashef was previously a partner at the international law firm Pearl Cohen (hi tech team), and prior to that, a Senior Associate in the International & Venture Law Group of Gross & Co. (later merged into Goldfarb Gross Seligman, now the largest law firm in Israel). In 2013, he was as Senior Legal Advisor for the UNCTAD, and earlier, an in-house counsel at a multi-disciplinary investment company which operates in countries across the MENA region. He holds an LL.B (Hons) from the University of Essex (2002).

Mr. Nashef is active in several non-profit organizations in the areas of entrepreneurship and technology. Among others, he serves as the chairman of the board of Hasoub Angels, sits on the board of the Palestinian Internship Program (PIP) and Hasoub, and is a member of the Audit Committee of Co-Impact. He regularly lectures before various audiences on entrepreneurship, venture capital financing and the legal aspects of tech ventures.`,
    email: 'nashef@nas-law.com',
    linkedinUrl: 'https://www.linkedin.com/in/abdelrahim-nashef',
    order: 1,
    isActive: true,
    showOnTeamPage: true,
    practiceAreaSlugs: ['startups-hitech-venture-capital', 'commercial-corporate-law', 'non-profit-organizations'],
    education: [
      {
        institution: 'University of Essex',
        institutionHe: 'אוניברסיטת אסקס',
        degree: 'LL.B (Hons)',
        degreeHe: 'LL.B (בהצטיינות)',
        year: 2002,
        order: 1,
      },
    ],
    experience: [
      {
        company: 'NAS & Co.',
        role: 'Managing Partner',
        roleHe: 'שותף מנהל',
        startYear: 2020,
        order: 1,
      },
      {
        company: 'Pearl Cohen',
        role: 'Partner (Hi-Tech Team)',
        roleHe: 'שותף (צוות היי-טק)',
        startYear: 2015,
        endYear: 2020,
        order: 2,
      },
      {
        company: 'UNCTAD',
        role: 'Senior Legal Advisor',
        roleHe: 'יועץ משפטי בכיר',
        startYear: 2013,
        endYear: 2015,
        order: 3,
      },
      {
        company: 'Gross & Co. (now Goldfarb Gross Seligman)',
        role: 'Senior Associate, International & Venture Law Group',
        roleHe: 'עורך דין בכיר, קבוצת משפט בינלאומי והשקעות',
        startYear: 2008,
        endYear: 2013,
        order: 4,
      },
    ],
  },
  {
    type: EntityType.PARTNER,
    name: 'Khaled Aun',
    nameAr: 'خالد عون',
    nameHe: 'חאלד עון',
    slug: 'khaled-aun',
    title: 'Partner',
    titleAr: 'شريك',
    titleHe: 'שותף',
    quote: 'In court hearings, the power to convince is the name of the game. It is important to deliver messages in a clear, real, direct and simple way. This is how the right party behaves',
    quoteAr: 'في جلسات المحكمة، قوة الإقناع هي اسم اللعبة. من المهم توصيل الرسائل بطريقة واضحة وحقيقية ومباشرة وبسيطة. هكذا يتصرف الطرف الصحيح',
    quoteHe: 'בדיונים בבית המשפט, כוח השכנוע הוא שם המשחק. חשוב להעביר מסרים בצורה ברורה, אמיתית, ישירה ופשוטה. כך מתנהג הצד הנכון',
    bio: `Adv. Aun represents official parties, commercial corporations and clients while providing an ongoing and comprehensive representation and making sure to maximize the rights of those he represents. His writings can often be found in legal databases.

Adv. Khaled Aun is a graduate of the Hebrew University in Jerusalem. He began his career at one of the leading law firms in the north, specializing in civil and land law. Since then, he has been constantly handling civil and commercial litigation, with emphasis on land disputes and complex monetary suits, and representing employers in employment disputes.

Throughout the years, adv. Aun has represented Israeli and foreign clients managing their legal affairs in Israel with a personal and direct link with stakeholders, while coordinating legal actions with a wide view and in a manner that projects to the client in their current residence.

Adv. Aun represents clients in various courts and proceedings in Israel and believes in coordinating and laying out his moves in a comprehensive manner with the client, experts (professionals, including evaluators, engineers, actuaries and more) for each specific case, and most of all with the office's team for all other fields of law. This is to support the legal arguments with all office departments to have the most normative and comprehensive legal ensemble for the circumstances of each case.

Adv. Aun is a firm believer in transparency and honesty in his relationships with his clients while fighting without compromise for their interests and with a structured strategy.`,
    email: 'aun@nas-law.com',
    linkedinUrl: 'https://www.linkedin.com/in/khaledaun',
    order: 2,
    isActive: true,
    showOnTeamPage: true,
    practiceAreaSlugs: ['commercial-litigation', 'private-commercial-real-estate', 'employment-labor-law'],
    education: [
      {
        institution: 'The Hebrew University of Jerusalem',
        institutionHe: 'האוניברסיטה העברית בירושלים',
        degree: 'LL.B.',
        degreeHe: 'LL.B.',
        order: 1,
      },
    ],
    experience: [
      {
        company: 'NAS & Co.',
        role: 'Partner',
        roleHe: 'שותף',
        startYear: 2020,
        order: 1,
      },
    ],
  },
  {
    type: EntityType.PARTNER,
    name: 'Hisham Shaban',
    nameAr: 'هشام شعبان',
    nameHe: 'הישאם שאבאן',
    slug: 'hisham-shaban',
    title: 'Partner',
    titleAr: 'شريك',
    titleHe: 'שותף',
    quote: 'My approach is similar to that of a surgeon: every small detail is a whole world and controlling the entirety is the key to successfully locking in a deal',
    quoteAr: 'نهجي مشابه لنهج الجراح: كل تفصيلة صغيرة هي عالم كامل والسيطرة على الكل هي مفتاح إتمام الصفقة بنجاح',
    quoteHe: 'הגישה שלי דומה לזו של מנתח: כל פרט קטן הוא עולם שלם והשליטה בשלם היא המפתח לסגירת עסקה בהצלחה',
    bio: `Adv. Hisham Shaban provides legal consultation and counseling for a wide variety of clients, among whom are private clients, entrepreneurs, public entities and local authorities.

Adv. Shaban provides counseling all around the world of real estate: comprehensive commercial thinking, drafting complex agreements, negotiating, sale agreements, rent agreements, asset management agreements, land partnership agreements, including representation in negotiations and representing parties to partnership disputes.

Adv. Shaban holds a Bachelor of Law degree from the University of Tel Aviv. He interned at Yigal Arnon & Co. law firm in one of the important and leading real estate departments in Israel. Adv. Shaban later served as in house counsel at one of the largest yield-bearing real estate companies in Israel. Between 2017 and 2020, Adv. Shaban was a partner in a private law firm he co-founded specializing in commercial real estate and planning and construction, and corporate representation in the field of infrastructure.

Adv. Shaban is a graduate of the Masters' program in City and Region Planning at the Technion (Israel Institute of Technology), which further emphasizes his expertise in the field of planning and construction. In such capacity, Adv. Shaban represents his clients in the various planning committees and promote plans, file objections, appeals and others.`,
    email: 'shaban@nas-law.com',
    linkedinUrl: 'https://www.linkedin.com/in/hisham-shaban',
    order: 3,
    isActive: true,
    showOnTeamPage: true,
    practiceAreaSlugs: ['private-commercial-real-estate', 'construction-zoning-law', 'infrastructures-municipal-corporations'],
    education: [
      {
        institution: 'University of Tel Aviv',
        institutionHe: 'אוניברסיטת תל אביב',
        degree: 'LL.B.',
        degreeHe: 'LL.B.',
        order: 1,
      },
      {
        institution: 'Technion - Israel Institute of Technology',
        institutionHe: 'הטכניון - מכון טכנולוגי לישראל',
        degree: 'M.A. City and Region Planning',
        degreeHe: 'M.A. תכנון ערים ואזורים',
        order: 2,
      },
    ],
    experience: [
      {
        company: 'NAS & Co.',
        role: 'Partner',
        roleHe: 'שותף',
        startYear: 2020,
        order: 1,
      },
      {
        company: 'Private Law Firm (Co-Founder)',
        role: 'Partner',
        roleHe: 'שותף',
        startYear: 2017,
        endYear: 2020,
        order: 2,
      },
      {
        company: 'Major Real Estate Company',
        role: 'In-House Counsel',
        roleHe: 'יועץ משפטי פנימי',
        order: 3,
      },
      {
        company: 'Yigal Arnon & Co.',
        role: 'Intern (Real Estate Department)',
        roleHe: 'מתמחה (מחלקת נדל"ן)',
        order: 4,
      },
    ],
  },
];

// Firm Hero Titles (rotating taglines)
const firmHeroTitles = [
  {
    titleEn: 'A consultation that delivers.',
    titleAr: 'استشارة تحقق النتائج.',
    titleHe: 'ייעוץ שמספק.',
    order: 1,
    enabled: true,
  },
  {
    titleEn: 'Building relationships. Focusing on results.',
    titleAr: 'بناء العلاقات. التركيز على النتائج.',
    titleHe: 'בניית קשרים. התמקדות בתוצאות.',
    order: 2,
    enabled: true,
  },
];

// Site Configuration
const siteConfigs = [
  {
    key: 'SITE_MODE',
    value: 'personal', // 'personal' or 'firm'
    description: 'Current site mode - personal (Khaled Aun) or firm (NAS & Co.)',
  },
  {
    key: 'FIRM_NAME',
    value: 'NAS & Co.',
    description: 'Full firm name',
  },
  {
    key: 'FIRM_LEGAL_NAME',
    value: 'Nashef, Aun, Shaban & Co.',
    description: 'Legal firm name',
  },
  {
    key: 'FIRM_DOMAIN',
    value: 'nas-law.com',
    description: 'Firm website domain',
  },
];

async function main() {
  console.log('🌱 Seeding NAS & Co. Law Firm data...');

  // Create Practice Areas
  console.log('📚 Creating practice areas...');
  for (const area of practiceAreas) {
    await prisma.practiceArea.upsert({
      where: { slug: area.slug },
      update: area,
      create: area,
    });
  }
  console.log(`✅ Created ${practiceAreas.length} practice areas`);

  // Create Firm Entity
  console.log('🏢 Creating firm entity...');
  await prisma.entity.upsert({
    where: { slug: firmEntity.slug },
    update: firmEntity,
    create: firmEntity,
  });
  console.log('✅ Created firm entity');

  // Create Partner Entities
  console.log('👥 Creating partner entities...');
  for (const partner of partners) {
    const { practiceAreaSlugs, education, experience, ...partnerData } = partner;

    // Create or update partner
    const createdPartner = await prisma.entity.upsert({
      where: { slug: partner.slug },
      update: partnerData,
      create: partnerData,
    });

    // Link practice areas
    if (practiceAreaSlugs && practiceAreaSlugs.length > 0) {
      for (let i = 0; i < practiceAreaSlugs.length; i++) {
        const practiceArea = await prisma.practiceArea.findUnique({
          where: { slug: practiceAreaSlugs[i] },
        });
        if (practiceArea) {
          await prisma.entityPracticeArea.upsert({
            where: {
              entityId_practiceAreaId: {
                entityId: createdPartner.id,
                practiceAreaId: practiceArea.id,
              },
            },
            update: { isPrimary: i === 0 },
            create: {
              entityId: createdPartner.id,
              practiceAreaId: practiceArea.id,
              isPrimary: i === 0,
            },
          });
        }
      }
    }

    // Create education entries
    if (education && education.length > 0) {
      for (const edu of education) {
        await prisma.education.create({
          data: {
            entityId: createdPartner.id,
            ...edu,
          },
        });
      }
    }

    // Create experience entries
    if (experience && experience.length > 0) {
      for (const exp of experience) {
        await prisma.entityExperience.create({
          data: {
            entityId: createdPartner.id,
            ...exp,
          },
        });
      }
    }

    console.log(`✅ Created partner: ${partner.name}`);
  }

  // Create Firm Hero Titles
  console.log('🎯 Creating firm hero titles...');
  for (const title of firmHeroTitles) {
    await prisma.firmHeroTitle.create({
      data: title,
    });
  }
  console.log(`✅ Created ${firmHeroTitles.length} firm hero titles`);

  // Create Site Configurations
  console.log('⚙️ Creating site configurations...');
  for (const config of siteConfigs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: config,
      create: config,
    });
  }
  console.log(`✅ Created ${siteConfigs.length} site configurations`);

  console.log('🎉 NAS & Co. seed data complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
