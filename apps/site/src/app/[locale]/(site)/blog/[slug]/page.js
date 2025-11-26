import { unstable_setRequestLocale } from 'next-intl/server';
import { prisma } from '@khaledaun/db';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import Link from 'next/link';
import Navbar from '@/components/site/Navbar';
import FooterDennis from '@/components/site/FooterDennis';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params: { slug } }) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { title: true, excerpt: true }
    });

    if (!post) {
      return {
        title: 'Post Not Found'
      };
    }

    return {
      title: post.title,
      description: post.excerpt || `Read ${post.title} on Khaled Aun's blog`,
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-ink text-brand-sand pt-16">
        {/* Preview Banner */}
        {(isDraftMode || isPreview) && post.status === 'DRAFT' && (
          <div className="bg-yellow-500 text-black py-3 px-6 text-center">
            <strong>Preview Mode:</strong> You are viewing a draft post. This post is not publicly visible.
          </div>
        )}

        {/* Article Header */}
        <article className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Back Link */}
          <Link 
            href={`/${locale}/blog`}
            className="inline-block mb-8 text-brand-gold hover:text-brand-gold/80 transition-colors"
          >
            ← Back to Blog
          </Link>

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
    <FooterDennis />
    </>
  );
}

