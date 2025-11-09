import { prisma } from '@khaledaun/db';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://khaledaun.com';
  const locales = ['en', 'ar'];
  const pages = ['', '/about', '/ventures', '/contact'];

  const urls = [];

  // Static pages
  locales.forEach(locale => {
    pages.forEach(page => {
      urls.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: page === '' ? 1 : 0.8,
        alternates: {
          languages: {
            en: `${baseUrl}/en${page}`,
            ar: `${baseUrl}/ar${page}`,
          }
        }
      });
    });
  });

  // Dynamic blog posts
  try {
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true
      },
      orderBy: { publishedAt: 'desc' },
    });

    posts.forEach(post => {
      locales.forEach(locale => {
        urls.push({
          url: `${baseUrl}/${locale}/blog/${post.slug}`,
          lastModified: post.updatedAt || post.publishedAt || new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: {
            languages: {
              en: `${baseUrl}/en/blog/${post.slug}`,
              ar: `${baseUrl}/ar/blog/${post.slug}`,
            }
          }
        });
      });
    });
  } catch (error) {
    console.error('Failed to fetch blog posts for sitemap:', error);
  }

  // Dynamic case studies
  try {
    const caseStudies = await prisma.caseStudy.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
    });

    caseStudies.forEach(caseStudy => {
      locales.forEach(locale => {
        urls.push({
          url: `${baseUrl}/${locale}/case-studies/${caseStudy.slug}`,
          lastModified: caseStudy.updatedAt || caseStudy.createdAt || new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: {
            languages: {
              en: `${baseUrl}/en/case-studies/${caseStudy.slug}`,
              ar: `${baseUrl}/ar/case-studies/${caseStudy.slug}`,
            }
          }
        });
      });
    });
  } catch (error) {
    console.error('Failed to fetch case studies for sitemap:', error);
  }

  return urls;
}
