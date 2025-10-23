'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function BlogPreview({ locale }) {
  const t = useTranslations('blog');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch latest 3 published posts
    fetch(`/api/posts/latest?locale=${locale}&limit=3`)
      .then(res => res.json())
      .then(data => {
        if (data.posts) {
          setPosts(data.posts);
        }
      })
      .catch(err => console.error('Failed to fetch posts:', err))
      .finally(() => setLoading(false));
  }, [locale]);

  // Don't render if no posts
  if (!loading && posts.length === 0) {
    return null;
  }

  return (
    <section className="section-padding bg-brand-sand">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-brand-navy">
            {t('latestInsights') || 'Latest Insights'}
          </h2>
          <p className="text-xl text-brand-ink/70 max-w-3xl mx-auto">
            {t('latestInsightsDesc') || 'Explore my latest articles on law, business, and conflict prevention'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-brand-ink/60">Loading articles...</p>
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                >
                  {post.featuredImage?.url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt || post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-heading font-semibold mb-3 text-brand-navy group-hover:text-brand-gold transition-colors duration-200">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-brand-ink/70 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-brand-ink/60 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{post.author?.name || 'Khaled Aun'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString(locale, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/${locale}/blog/${post.slug}`}
                      className="inline-flex items-center space-x-2 text-brand-gold hover:text-brand-navy transition-colors duration-200 font-medium"
                    >
                      <span>{t('readMore') || 'Read More'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* View All Link */}
            <div className="text-center">
              <Link
                href={`/${locale}/blog`}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>{t('viewAllArticles') || 'View All Articles'}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

