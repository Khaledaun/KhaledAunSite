import { unstable_setRequestLocale } from 'next-intl/server';
import { prisma } from '@khaledaun/db';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import Link from 'next/link';
import Script from 'next/script';
import { generateSchemaMarkup } from '@khaledaun/utils/aio-optimizer';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params: { slug, locale } }) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      select: {
        title: true,
        excerpt: true,
        publishedAt: true,
        updatedAt: true,
        status: true,
        author: {
          select: { name: true }
        }
      }
    });

    if (!post) {
      return {
        title: 'Post Not Found'
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://khaledaun.com';
    const canonicalUrl = `${baseUrl}/${locale}/blog/${slug}`;
    const description = post.excerpt?.substring(0, 160) || `Read ${post.title} on Khaled Aun's blog`;

    return {
      title: `${post.title} | Khaled Aun Blog`,
      description,

      // Canonical URL and language alternates
      alternates: {
        canonical: canonicalUrl,
        languages: {
          'en': `${baseUrl}/en/blog/${slug}`,
          'ar': `${baseUrl}/ar/blog/${slug}`,
        },
      },

      // Open Graph
      openGraph: {
        title: post.title,
        description,
        type: 'article',
        url: canonicalUrl,
        publishedTime: post.publishedAt?.toISOString(),
        modifiedTime: post.updatedAt?.toISOString(),
        authors: post.author?.name ? [post.author.name] : ['Khaled Aun'],
        images: [
          {
            url: `${baseUrl}/images/og-blog-default.jpg`,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        locale: locale === 'ar' ? 'ar_SA' : 'en_US',
        siteName: 'Khaled Aun',
      },

      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
        images: [`${baseUrl}/images/og-blog-default.jpg`],
        creator: '@khaledaun',
      },

      // Robots meta tags
      robots: {
        index: post.status === 'PUBLISHED',
        follow: true,
        googleBot: {
          index: post.status === 'PUBLISHED',
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.warn('Unable to generate metadata (database not available):', error.message);
    return {
      title: 'Blog Post',
      description: 'Read the latest article on Khaled Aun\'s blog'
    };
  }
}

async function getPost(slug, showDrafts = false) {
  try {
    const where = { slug };
    
    const post = await prisma.post.findUnique({
      where,
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    });
    
    // If draft mode is off and post is draft, return null
    if (post && post.status === 'DRAFT' && !showDrafts) {
      return null;
    }
    
    return post;
  } catch (error) {
    console.warn('Unable to fetch post (database not available):', error.message);
    return null;
  }
}

export default async function BlogPostPage({ params: { slug, locale }, searchParams }) {
  unstable_setRequestLocale(locale);
  const { isEnabled: isDraftMode } = draftMode();
  const isPreview = searchParams?.preview === '1';

  const post = await getPost(slug, isDraftMode || isPreview);

  if (!post) {
    notFound();
  }

  // Generate Article schema markup
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://khaledaun.com';
  const articleSchema = generateSchemaMarkup('BlogPosting', {
    title: post.title,
    description: post.excerpt || '',
    author: post.author?.name || 'Khaled Aun',
    datePublished: post.publishedAt?.toISOString() || post.createdAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString() || post.createdAt?.toISOString(),
    image: `${baseUrl}/images/og-blog-default.jpg`,
    url: `${baseUrl}/${locale}/blog/${slug}`,
  });

  return (
    <>
      {/* Article Schema Markup */}
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <main className="min-h-screen bg-brand-ink text-brand-sand">
        {/* Preview Banner */}
        {(isDraftMode || isPreview) && post.status === 'DRAFT' && (
          <div className="bg-yellow-500 text-black py-3 px-6 text-center">
            <strong>Preview Mode:</strong> You are viewing a draft post. This post is not publicly visible.
          </div>
        )}

      {/* Article Header */}
      <article className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: 'Home', href: `/${locale}` },
              { label: 'Blog', href: `/${locale}/blog` },
              { label: post.title, href: null },
            ]}
            className="mb-8"
          />

          {/* Title */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-brand-sand/80 mb-8">
              {post.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-brand-sand/60 pb-8 mb-8 border-b border-brand-gold/20">
            <span>By {post.author.name || post.author.email}</span>
            <span>•</span>
            <span>
              {post.publishedAt 
                ? new Date(post.publishedAt).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Draft'
              }
            </span>
            {post.status === 'DRAFT' && (
              <>
                <span>•</span>
                <span className="px-2 py-1 bg-yellow-500 text-black rounded text-xs">
                  DRAFT
                </span>
              </>
            )}
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed">
              {post.content}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-brand-gold/20">
            <Link 
              href={`/${locale}/blog`}
              className="inline-block px-6 py-3 border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-ink transition-colors rounded"
            >
              ← Back to All Posts
            </Link>
          </div>
        </div>
      </article>
    </main>
    </>
  );
}

