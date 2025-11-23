/**
 * Script to seed 3 articles and publish them
 * Run with: npx tsx scripts/seed-articles.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const articles = [
  {
    slug: 'cross-border-arbitration-strategies',
    translations: {
      en: {
        title: 'Cross-Border Arbitration: Strategies for International Business Disputes',
        slug: 'cross-border-arbitration-strategies',
        excerpt: 'Navigate the complexities of international arbitration with proven strategies for resolving cross-border commercial disputes effectively.',
        content: `<h2>Understanding Cross-Border Arbitration</h2>
<p>In today's interconnected global economy, businesses frequently engage in cross-border transactions that span multiple jurisdictions. When disputes arise, traditional litigation can be costly, time-consuming, and complicated by jurisdictional issues. This is where international arbitration emerges as a powerful alternative.</p>

<h3>Why Choose Arbitration?</h3>
<p>International arbitration offers several compelling advantages for resolving cross-border disputes:</p>
<ul>
  <li><strong>Neutrality:</strong> Parties can select a neutral forum, avoiding potential home-court advantages</li>
  <li><strong>Enforceability:</strong> The New York Convention ensures awards are enforceable in over 170 countries</li>
  <li><strong>Flexibility:</strong> Parties can customize procedures, choose arbitrators, and select applicable law</li>
  <li><strong>Confidentiality:</strong> Unlike court proceedings, arbitration can remain private</li>
</ul>

<h3>Key Strategies for Success</h3>
<p>Effective arbitration requires careful planning from contract drafting through award enforcement:</p>

<h4>1. Draft a Robust Arbitration Clause</h4>
<p>The arbitration clause is your foundation. Specify the arbitral institution (ICC, LCIA, DIAC), seat of arbitration, number of arbitrators, language, and governing law. Ambiguity here can lead to costly preliminary disputes.</p>

<h4>2. Select the Right Arbitrators</h4>
<p>Choose arbitrators with relevant industry expertise and experience with the legal systems involved. Consider linguistic abilities and cultural understanding for disputes involving Middle Eastern parties.</p>

<h4>3. Manage the Process Strategically</h4>
<p>Engage early with document production requests, witness preparation, and expert selection. In international arbitration, procedural decisions can significantly impact outcomes.</p>

<h3>Regional Considerations</h3>
<p>For businesses operating in the Middle East, understanding regional arbitration centers is crucial. The Dubai International Arbitration Centre (DIAC) and the Abu Dhabi Global Market (ADGM) Courts offer sophisticated venues for regional disputes.</p>

<h3>Conclusion</h3>
<p>Cross-border arbitration remains the gold standard for international dispute resolution. With proper planning and strategic execution, businesses can protect their interests while maintaining valuable commercial relationships across borders.</p>`
      },
      ar: {
        title: 'التحكيم العابر للحدود: استراتيجيات حل النزاعات التجارية الدولية',
        slug: 'استراتيجيات-التحكيم-الدولي',
        excerpt: 'تعرف على تعقيدات التحكيم الدولي مع استراتيجيات مثبتة لحل النزاعات التجارية العابرة للحدود بفعالية.',
        content: `<h2>فهم التحكيم العابر للحدود</h2>
<p>في الاقتصاد العالمي المترابط اليوم، تشارك الشركات بشكل متكرر في معاملات عابرة للحدود تمتد عبر ولايات قضائية متعددة. عندما تنشأ النزاعات، يمكن أن يكون التقاضي التقليدي مكلفًا ويستغرق وقتًا طويلاً ومعقدًا بسبب المسائل القضائية. هنا يظهر التحكيم الدولي كبديل قوي.</p>

<h3>لماذا تختار التحكيم؟</h3>
<p>يوفر التحكيم الدولي العديد من المزايا المقنعة لحل النزاعات العابرة للحدود:</p>
<ul>
  <li><strong>الحياد:</strong> يمكن للأطراف اختيار منتدى محايد</li>
  <li><strong>قابلية التنفيذ:</strong> تضمن اتفاقية نيويورك تنفيذ الأحكام في أكثر من 170 دولة</li>
  <li><strong>المرونة:</strong> يمكن للأطراف تخصيص الإجراءات واختيار المحكمين</li>
  <li><strong>السرية:</strong> على عكس إجراءات المحكمة، يمكن أن يظل التحكيم خاصًا</li>
</ul>

<h3>الخلاصة</h3>
<p>يظل التحكيم العابر للحدود المعيار الذهبي لحل النزاعات الدولية. مع التخطيط السليم والتنفيذ الاستراتيجي، يمكن للشركات حماية مصالحها مع الحفاظ على العلاقات التجارية القيمة عبر الحدود.</p>`
      }
    }
  },
  {
    slug: 'corporate-governance-middle-east',
    translations: {
      en: {
        title: 'Corporate Governance Excellence: Building Sustainable Businesses in the Middle East',
        slug: 'corporate-governance-middle-east',
        excerpt: 'Discover how effective corporate governance practices can drive sustainable growth and attract investment in the Middle Eastern market.',
        content: `<h2>The Foundation of Business Excellence</h2>
<p>Corporate governance is more than a regulatory checkbox—it's the cornerstone of sustainable business success. In the rapidly evolving Middle Eastern business landscape, companies that prioritize governance excellence are better positioned to attract investment, manage risks, and achieve long-term growth.</p>

<h3>Key Pillars of Effective Governance</h3>
<p>Building a robust governance framework requires attention to several critical areas:</p>

<h4>Board Composition and Independence</h4>
<p>A well-structured board brings diverse perspectives and independent oversight. For Middle Eastern companies, this often means balancing family interests with independent directors who bring specialized expertise.</p>

<h4>Transparency and Disclosure</h4>
<p>Clear, timely disclosure builds stakeholder trust. Companies should go beyond minimum regulatory requirements to provide meaningful insights into strategy, risks, and performance.</p>

<h4>Risk Management</h4>
<p>Effective governance includes comprehensive risk identification, assessment, and mitigation strategies. This encompasses financial, operational, compliance, and reputational risks.</p>

<h3>Regional Best Practices</h3>
<p>The UAE and Saudi Arabia have made significant strides in corporate governance reform. The UAE Corporate Governance Code and Saudi Companies Law set high standards that align with international best practices while respecting regional business culture.</p>

<h3>The Investment Connection</h3>
<p>Institutional investors increasingly evaluate governance quality when making investment decisions. Companies with strong governance typically enjoy:</p>
<ul>
  <li>Lower cost of capital</li>
  <li>Higher valuations</li>
  <li>Greater investor confidence</li>
  <li>Enhanced reputation</li>
</ul>

<h3>Conclusion</h3>
<p>Corporate governance excellence is not optional—it's essential for businesses seeking sustainable success in the Middle East. By investing in governance infrastructure today, companies position themselves for growth and resilience tomorrow.</p>`
      },
      ar: {
        title: 'التميز في حوكمة الشركات: بناء أعمال مستدامة في الشرق الأوسط',
        slug: 'حوكمة-الشركات-الشرق-الاوسط',
        excerpt: 'اكتشف كيف يمكن لممارسات حوكمة الشركات الفعالة أن تدفع النمو المستدام وتجذب الاستثمار في سوق الشرق الأوسط.',
        content: `<h2>أساس التميز في الأعمال</h2>
<p>حوكمة الشركات هي أكثر من مجرد متطلب تنظيمي - إنها حجر الزاوية للنجاح المستدام في الأعمال. في مشهد الأعمال سريع التطور في الشرق الأوسط، الشركات التي تعطي الأولوية للتميز في الحوكمة هي الأفضل وضعًا لجذب الاستثمار وإدارة المخاطر وتحقيق النمو طويل الأجل.</p>

<h3>الركائز الرئيسية للحوكمة الفعالة</h3>
<p>يتطلب بناء إطار حوكمة قوي الاهتمام بعدة مجالات حاسمة:</p>

<h4>تكوين مجلس الإدارة والاستقلالية</h4>
<p>يجلب مجلس الإدارة المنظم جيدًا وجهات نظر متنوعة ورقابة مستقلة.</p>

<h4>الشفافية والإفصاح</h4>
<p>يبني الإفصاح الواضح وفي الوقت المناسب ثقة أصحاب المصلحة.</p>

<h3>الخلاصة</h3>
<p>التميز في حوكمة الشركات ليس اختياريًا - إنه ضروري للشركات التي تسعى للنجاح المستدام في الشرق الأوسط.</p>`
      }
    }
  },
  {
    slug: 'legal-tech-transformation',
    translations: {
      en: {
        title: 'Legal Technology Transformation: Embracing Innovation in Legal Practice',
        slug: 'legal-tech-transformation',
        excerpt: 'Explore how technology is reshaping legal services and what forward-thinking law firms need to know about digital transformation.',
        content: `<h2>The Digital Revolution in Legal Services</h2>
<p>The legal industry stands at a pivotal crossroads. Technology is fundamentally reshaping how legal services are delivered, creating both challenges and opportunities for practitioners and clients alike. Firms that embrace this transformation will thrive; those that resist may struggle to remain competitive.</p>

<h3>Key Technologies Reshaping Legal Practice</h3>

<h4>Artificial Intelligence and Machine Learning</h4>
<p>AI-powered tools are revolutionizing document review, contract analysis, and legal research. These technologies can process thousands of documents in hours rather than weeks, identifying patterns and extracting insights that would be impossible to discover manually.</p>

<h4>Contract Lifecycle Management</h4>
<p>Modern CLM platforms streamline contract creation, negotiation, and management. Automated workflows reduce turnaround times while improving accuracy and compliance.</p>

<h4>Legal Project Management</h4>
<p>Sophisticated project management tools enable better resource allocation, timeline tracking, and budget management. Clients increasingly expect predictable costs and transparent progress reporting.</p>

<h3>The Client Perspective</h3>
<p>Today's clients demand more than just legal expertise. They expect:</p>
<ul>
  <li>Real-time visibility into matter progress</li>
  <li>Predictable pricing and alternative fee arrangements</li>
  <li>Proactive risk identification and management</li>
  <li>Seamless collaboration and communication</li>
</ul>

<h3>Implementation Strategies</h3>
<p>Successful technology adoption requires a strategic approach:</p>
<ol>
  <li><strong>Assess Current State:</strong> Evaluate existing processes and identify pain points</li>
  <li><strong>Define Objectives:</strong> Set clear goals for efficiency, cost reduction, and client service</li>
  <li><strong>Select Solutions:</strong> Choose technologies that align with firm culture and client needs</li>
  <li><strong>Change Management:</strong> Invest in training and support for successful adoption</li>
</ol>

<h3>Conclusion</h3>
<p>Legal technology transformation is not about replacing lawyers—it's about empowering them to deliver more value. By embracing innovation, legal professionals can focus on high-value strategic work while technology handles routine tasks.</p>`
      },
      ar: {
        title: 'التحول التكنولوجي القانوني: تبني الابتكار في الممارسة القانونية',
        slug: 'التحول-التكنولوجي-القانوني',
        excerpt: 'استكشف كيف تعيد التكنولوجيا تشكيل الخدمات القانونية وما يحتاج مكاتب المحاماة المتطلعة للمستقبل معرفته عن التحول الرقمي.',
        content: `<h2>الثورة الرقمية في الخدمات القانونية</h2>
<p>تقف الصناعة القانونية عند مفترق طرق محوري. تعيد التكنولوجيا تشكيل كيفية تقديم الخدمات القانونية بشكل جذري، مما يخلق تحديات وفرصًا للممارسين والعملاء على حد سواء.</p>

<h3>التقنيات الرئيسية التي تعيد تشكيل الممارسة القانونية</h3>

<h4>الذكاء الاصطناعي والتعلم الآلي</h4>
<p>تُحدث الأدوات المدعومة بالذكاء الاصطناعي ثورة في مراجعة المستندات وتحليل العقود والبحث القانوني.</p>

<h4>إدارة دورة حياة العقود</h4>
<p>تعمل منصات إدارة دورة حياة العقود الحديثة على تبسيط إنشاء العقود والتفاوض عليها وإدارتها.</p>

<h3>الخلاصة</h3>
<p>التحول التكنولوجي القانوني لا يتعلق باستبدال المحامين - بل يتعلق بتمكينهم من تقديم قيمة أكبر. من خلال تبني الابتكار، يمكن للمحترفين القانونيين التركيز على العمل الاستراتيجي عالي القيمة.</p>`
      }
    }
  }
];

async function main() {
  console.log('🚀 Starting article seeding...\n');

  // First, find or create a user to be the author
  let author = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!author) {
    console.log('Creating admin user...');
    author = await prisma.user.create({
      data: {
        id: '563b7802-a134-4ef0-b7cd-b363245f6426', // Khaled's user ID
        email: 'khaled@nas-law.com',
        name: 'Khaled Aun',
        role: 'ADMIN'
      }
    });
  }

  console.log(`📝 Using author: ${author.email}\n`);

  for (const article of articles) {
    console.log(`Creating article: ${article.translations.en.title}`);

    try {
      // Check if post already exists
      const existingPost = await prisma.post.findFirst({
        where: {
          translations: {
            some: {
              slug: article.slug,
              locale: 'en'
            }
          }
        }
      });

      if (existingPost) {
        console.log(`  ⏭️  Article already exists, skipping...\n`);
        continue;
      }

      // Create the post with translations
      const post = await prisma.post.create({
        data: {
          title: article.translations.en.title,
          slug: article.slug,
          excerpt: article.translations.en.excerpt,
          content: article.translations.en.content,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          authorId: author.id,
          translations: {
            create: [
              {
                locale: 'en',
                title: article.translations.en.title,
                slug: article.translations.en.slug,
                excerpt: article.translations.en.excerpt,
                content: article.translations.en.content
              },
              {
                locale: 'ar',
                title: article.translations.ar.title,
                slug: article.translations.ar.slug,
                excerpt: article.translations.ar.excerpt,
                content: article.translations.ar.content
              }
            ]
          }
        },
        include: {
          translations: true
        }
      });

      console.log(`  ✅ Created and published: ${post.id}`);
      console.log(`     EN: /en/blog/${article.translations.en.slug}`);
      console.log(`     AR: /ar/blog/${article.translations.ar.slug}\n`);

    } catch (error) {
      console.error(`  ❌ Error creating article:`, error);
    }
  }

  // Summary
  const postCount = await prisma.post.count({ where: { status: 'PUBLISHED' } });
  console.log(`\n✨ Done! Total published posts: ${postCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
