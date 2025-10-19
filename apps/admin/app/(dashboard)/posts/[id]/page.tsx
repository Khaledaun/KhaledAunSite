'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PostForm, { PostFormData } from '@/components/PostForm';

type Locale = 'en' | 'ar';

interface PostTranslation {
  id?: string;
  locale: Locale;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
}

interface Post {
  id: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  author: {
    name: string | null;
    email: string;
  };
  translations: PostTranslation[];
}

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState<Locale>('en');
  const [saving, setSaving] = useState(false);

  // Form state for each locale
  const [translations, setTranslations] = useState<Record<Locale, PostTranslation>>({
    en: { locale: 'en', title: '', slug: '', excerpt: '', content: '' },
    ar: { locale: 'ar', title: '', slug: '', excerpt: '', content: '' },
  });

  useEffect(() => {
    fetchPost();
  }, [params.id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/posts/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      const data = await response.json();
      setPost(data.post);

      // Populate translations
      const newTranslations: Record<Locale, PostTranslation> = {
        en: data.post.translations.find((t: PostTranslation) => t.locale === 'en') || {
          locale: 'en',
          title: '',
          slug: '',
          excerpt: '',
          content: '',
        },
        ar: data.post.translations.find((t: PostTranslation) => t.locale === 'ar') || {
          locale: 'ar',
          title: '',
          slug: '',
          excerpt: '',
          content: '',
        },
      };

      setTranslations(newTranslations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof PostTranslation, value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [activeLocale]: {
        ...prev[activeLocale],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await fetch(`/api/admin/posts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          translations: {
            en: translations.en,
            ar: translations.ar,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save post');
      }

      await fetchPost();
      alert('Post saved successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/posts');
  };

  const handlePublish = async () => {
    // Check if AR is required
    const requireAR = process.env.NEXT_PUBLIC_REQUIRE_AR_FOR_PUBLISH === 'true';
    const hasAR = translations.ar.title && translations.ar.content;

    if (requireAR && !hasAR) {
      alert('Arabic translation is required before publishing. Please complete the AR translation.');
      return;
    }

    if (!confirm('Are you sure you want to publish this post?')) return;

    try {
      const response = await fetch(`/api/admin/posts/${params.id}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to publish post');
      }

      await fetchPost();
      alert('Post published successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to publish post');
    }
  };

  const handlePreview = async (locale: Locale) => {
    try {
      // Get signed preview URL from API
      const response = await fetch(`/api/admin/posts/${params.id}/preview-url?locale=${locale}`);

      if (!response.ok) throw new Error('Failed to generate preview URL');

      const data = await response.json();

      // Open in new window
      window.open(data.previewUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate preview');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">Error: {error || 'Post not found'}</p>
          <button
            onClick={() => router.push('/posts')}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  const requireAR = process.env.NEXT_PUBLIC_REQUIRE_AR_FOR_PUBLISH === 'true';
  const hasEN = translations.en.title && translations.en.content;
  const hasAR = translations.ar.title && translations.ar.content;
  const canPublish = hasEN && (!requireAR || hasAR);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Post</h1>
            <p className="text-gray-600 mt-1">
              Status:{' '}
              <span
                className={`font-semibold ${
                  post.status === 'PUBLISHED' ? 'text-green-600' : 'text-yellow-600'
                }`}
              >
                {post.status}
              </span>
            </p>
          </div>
          <div className="space-x-2 flex items-center">
            {post.status === 'DRAFT' && (
              <>
                <button
                  onClick={() => handlePreview('en')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  disabled={!hasEN}
                  title={!hasEN ? 'Add English content first' : 'Preview English version'}
                >
                  Preview EN
                </button>
                <button
                  onClick={() => handlePreview('ar')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  disabled={!hasAR}
                  title={!hasAR ? 'Add Arabic content first' : 'Preview Arabic version'}
                >
                  Preview AR
                </button>
                <button
                  onClick={handlePublish}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  disabled={!canPublish}
                  title={
                    !canPublish
                      ? requireAR
                        ? 'English and Arabic translations required'
                        : 'English translation required'
                      : 'Publish post'
                  }
                >
                  Publish
                </button>
              </>
            )}
            {post.status === 'PUBLISHED' && (
              <a
                href={`${process.env.NEXT_PUBLIC_SITE_URL}/en/blog/${translations.en.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Published
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Translation Status Bar */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Translation Status:</h3>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <span className={`text-lg mr-2 ${hasEN ? 'text-green-600' : 'text-red-600'}`}>
                {hasEN ? '✅' : '🔴'}
              </span>
              <span>English (EN)</span>
            </div>
            <div className="flex items-center">
              <span className={`text-lg mr-2 ${hasAR ? 'text-green-600' : 'text-gray-400'}`}>
                {hasAR ? '✅' : '🔴'}
              </span>
              <span>Arabic (AR)</span>
              {requireAR && <span className="ml-2 text-xs text-red-600">(Required)</span>}
            </div>
          </div>
        </div>

        {/* Locale Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveLocale('en')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeLocale === 'en'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              English (EN) {hasEN && '✅'}
            </button>
            <button
              onClick={() => setActiveLocale('ar')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeLocale === 'ar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              العربية (AR) {hasAR && '✅'}
              {requireAR && <span className="ml-1 text-red-600">*</span>}
            </button>
          </nav>
        </div>

        {/* Form Fields for Active Locale */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title ({activeLocale.toUpperCase()}) *
            </label>
            <input
              type="text"
              value={translations[activeLocale].title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Enter ${activeLocale === 'en' ? 'English' : 'Arabic'} title`}
              dir={activeLocale === 'ar' ? 'rtl' : 'ltr'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug ({activeLocale.toUpperCase()}) *
            </label>
            <input
              type="text"
              value={translations[activeLocale].slug}
              onChange={(e) => handleFieldChange('slug', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`${activeLocale}-slug-example`}
              pattern="[a-z0-9-]+"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Lowercase letters, numbers, and hyphens only. Must be unique per language.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt ({activeLocale.toUpperCase()})
            </label>
            <textarea
              value={translations[activeLocale].excerpt || ''}
              onChange={(e) => handleFieldChange('excerpt', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Brief ${activeLocale === 'en' ? 'English' : 'Arabic'} summary`}
              dir={activeLocale === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content ({activeLocale.toUpperCase()}) *
            </label>
            <textarea
              value={translations[activeLocale].content}
              onChange={(e) => handleFieldChange('content', e.target.value)}
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder={`Full ${activeLocale === 'en' ? 'English' : 'Arabic'} content (markdown supported)`}
              dir={activeLocale === 'ar' ? 'rtl' : 'ltr'}
              required
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </div>
    </div>
  );
}
