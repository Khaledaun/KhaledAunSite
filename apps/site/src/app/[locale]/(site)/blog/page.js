import { prisma } from '@khaledaun/db';
import Link from 'next/link';
import { draftMode } from 'next/headers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Blog',
  description: 'Latest articles and insights',
};

async function getPosts(showDrafts = false) {
  try {
    const where = showDrafts ? {} : { status: 'PUBLISHED' };
    
    return await prisma.post.findMany({
      where,
      include: {
        author: {
          select: { name: true, email: true }
        }
      },
      orderBy: { publishedAt: 'desc' }
    });
  } catch (error) {
    console.warn('Unable to fetch posts (database not available):', error.message);
    // Return empty array if database is not available
    return [];
  }
}

export default async function BlogPage({ params: { locale } }) {
  const { isEnabled: isDraftMode } = draftMode();
  
  const posts = await getPosts(isDraftMode);

  return (
    <main className="min-h-screen bg-brand-ink text-brand-sand">
      {/* Header */}
      <section className="py-20 border-b border-brand-gold/20">
        <div className="container mx-auto px-6">
          <h1 className="font-heading text-5xl md:text-6xl mb-4">
            Blog
          </h1>
          <p className="text-xl text-brand-sand/80 max-w-2xl">
            Insights, articles, and updates from Khaled Aun
          </p>
          {isDraftMode && (
            <div className="mt-4 inline-block px-4 py-2 bg-yellow-500 text-black rounded">
              Draft Mode Enabled - Showing unpublished posts
            </div>
          )}
        </div>
      </section>

      {/* Posts List */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-brand-sand/60">No posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article 
                  key={post.id}
                  className="bg-brand-navy border border-brand-gold/20 rounded-lg overflow-hidden hover:border-brand-gold/40 transition-colors"
                >
                  <div className="p-6">
                    {post.status === 'DRAFT' && (
                      <span className="inline-block px-2 py-1 text-xs bg-yellow-500 text-black rounded mb-3">
                        DRAFT
                      </span>
                    )}
                    <h2 className="font-heading text-2xl mb-3 text-brand-gold">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-brand-sand/80 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-brand-sand/60 mb-4">
                      <span>{post.author.name || post.author.email}</span>
                      <span>
                        {post.publishedAt 
                          ? new Date(post.publishedAt).toLocaleDateString(locale)
                          : 'Draft'
                        }
                      </span>
                    </div>
                    <Link
                      href={`/${locale}/blog/${post.slug}`}
                      className="inline-block px-4 py-2 border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-ink transition-colors rounded"
                    >
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

