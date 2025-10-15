import { unstable_setRequestLocale } from 'next-intl/server';
import { prisma } from '@khaledaun/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic'; // Always fetch fresh data for preview

export async function generateMetadata({ params: { id } }) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { title: true, excerpt: true }
    });

    if (!post) {
      return {
        title: 'Post Not Found'
      };
    }

    return {
      title: `Preview: ${post.title}`,
      description: post.excerpt || `Preview of ${post.title}`,
      robots: 'noindex, nofollow', // Don't index preview pages
    };
  } catch (error) {
    console.warn('Unable to generate preview metadata (database not available):', error.message);
    return {
      title: 'Preview',
      description: 'Preview post',
      robots: 'noindex, nofollow'
    };
  }
}

async function getPostById(id) {
  try {
    return await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    });
  } catch (error) {
    console.warn('Unable to fetch post (database not available):', error.message);
    return null;
  }
}

export default async function PreviewPostPage({ params: { id, locale } }) {
  unstable_setRequestLocale(locale);
  
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-brand-ink text-brand-sand">
      {/* Preview Banner */}
      <div className="bg-yellow-500 text-black py-3 px-6 text-center sticky top-0 z-50">
        <strong>Preview Mode:</strong> You are viewing a {post.status.toLowerCase()} post. 
        {post.status === 'DRAFT' && ' This post is not publicly visible.'}
      </div>

      {/* Article */}
      <article className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Back Link */}
          <Link 
            href={`/${locale}/blog`}
            className="inline-block mb-8 text-brand-gold hover:text-brand-gold/80 transition-colors"
          >
            ← Exit Preview
          </Link>

          {/* Status Badge */}
          <div className="mb-6">
            <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
              post.status === 'PUBLISHED' 
                ? 'bg-green-500 text-white' 
                : 'bg-yellow-500 text-black'
            }`}>
              {post.status}
            </span>
          </div>

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
                : 'Not published'
              }
            </span>
            <span>•</span>
            <span>Last updated: {new Date(post.updatedAt).toLocaleDateString(locale)}</span>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed">
              {post.content}
            </div>
          </div>

          {/* Preview Actions */}
          <div className="mt-16 pt-8 border-t border-brand-gold/20 flex gap-4">
            <Link 
              href={`/${locale}/blog`}
              className="inline-block px-6 py-3 border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-ink transition-colors rounded"
            >
              ← Exit Preview
            </Link>
            {post.status === 'PUBLISHED' && (
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="inline-block px-6 py-3 bg-brand-gold text-brand-ink hover:bg-brand-gold/90 transition-colors rounded"
              >
                View Published Post →
              </Link>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}

