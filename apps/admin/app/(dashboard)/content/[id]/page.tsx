'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ContentSEOPanel } from '@/components/content/ContentSEOPanel';
import { ContentAIOPanel } from '@/components/content/ContentAIOPanel';
import { generateSlug } from '@/lib/utils/slug-generator';

function ContentEditForm({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'seo' | 'aio'>('seo');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    keywords: [] as string[],
    type: 'blog' as 'blog' | 'linkedin_post' | 'linkedin_article' | 'linkedin_carousel',
    status: 'draft' as 'draft' | 'review' | 'published' | 'archived',
    seoTitle: '',
    seoDescription: '',
    slug: '',
  });

  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    loadContent();
  }, [params.id]);

  async function loadContent() {
    try {
      const response = await fetch(`/api/content-library/${params.id}`);
      if (!response.ok) throw new Error('Failed to load content');
      
      const { content } = await response.json();
      
      setFormData({
        title: content.title || '',
        content: content.content || '',
        excerpt: content.excerpt || '',
        keywords: content.keywords || [],
        type: content.type || 'blog',
        status: content.status || 'draft',
        seoTitle: content.seoTitle || '',
        seoDescription: content.seoDescription || '',
        slug: content.slug || '',
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      // Update slug only if it hasn't been manually edited
      slug: formData.slug ? formData.slug : generateSlug(title),
      seoTitle: title,
    });
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()],
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/content-library/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update content');
      }

      alert('Content updated successfully!');
      router.push('/content/library');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/content-library/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete content');
      
      alert('Content deleted successfully!');
      router.push('/content/library');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
        <Link href="/content/library" className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700">
          ← Back to Content Library
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/content/library" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to Content Library
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Content</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your SEO and AI-optimized content
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Editor */}
        <div className="space-y-6 lg:col-span-2">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Main Content Card */}
          <div className="rounded-lg bg-white p-6 shadow">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-lg font-medium shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Content Type & Status */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Content Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="blog">Blog Post</option>
                  <option value="linkedin_post">LinkedIn Post</option>
                  <option value="linkedin_article">LinkedIn Article</option>
                  <option value="linkedin_carousel">LinkedIn Carousel</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="review">In Review</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Excerpt */}
            <div className="mt-4">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                Excerpt / Summary
              </label>
              <textarea
                id="excerpt"
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Content Editor */}
            <div className="mt-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                required
                rows={20}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* SEO Settings Card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">SEO Settings</h3>
            
            <div className="mt-4">
              <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700">
                SEO Title
              </label>
              <input
                type="text"
                id="seoTitle"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                maxLength={60}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.seoTitle.length}/60 characters
              </p>
            </div>

            <div className="mt-4">
              <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">
                SEO Description
              </label>
              <textarea
                id="seoDescription"
                rows={3}
                value={formData.seoDescription}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                maxLength={160}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.seoDescription.length}/160 characters
              </p>
            </div>

            <div className="mt-4">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                URL Slug
              </label>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                Keywords
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  id="keywords"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  className="block flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Add
                </button>
              </div>
              {formData.keywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-sm text-blue-800"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete
            </button>
            <Link
              href="/content/library"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Right Column - SEO/AIO Analysis */}
        <div className="space-y-6">
          <div className="rounded-lg bg-white shadow">
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActivePanel('seo')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activePanel === 'seo'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                SEO Analysis
              </button>
              <button
                type="button"
                onClick={() => setActivePanel('aio')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activePanel === 'aio'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                AI Optimization
              </button>
            </div>

            <div className="p-4">
              {activePanel === 'seo' ? (
                <ContentSEOPanel
                  title={formData.seoTitle || formData.title}
                  description={formData.seoDescription || formData.excerpt}
                  content={formData.content}
                  keywords={formData.keywords}
                  slug={formData.slug}
                  excerpt={formData.excerpt}
                />
              ) : (
                <ContentAIOPanel
                  title={formData.title}
                  content={formData.content}
                  excerpt={formData.excerpt}
                  keywords={formData.keywords}
                />
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function ContentEditPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    }>
      <ContentEditForm params={params} />
    </Suspense>
  );
}

