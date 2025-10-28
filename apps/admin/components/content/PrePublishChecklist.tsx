'use client';

import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
}

interface PrePublishChecklistProps {
  content: {
    title: string;
    content: string;
    excerpt?: string;
    seoTitle?: string;
    seoDescription?: string;
    slug: string;
    keywords: string[];
    featuredImageId?: string;
  };
  seoScore?: number;
  aioScore?: number;
  onPublish: () => void;
  onCancel: () => void;
  onFixIssues: () => void;
  publishing?: boolean;
}

export function PrePublishChecklist({
  content,
  seoScore = 0,
  aioScore = 0,
  onPublish,
  onCancel,
  onFixIssues,
  publishing = false,
}: PrePublishChecklistProps) {
  // Calculate checklist items
  const checklist: ChecklistItem[] = [];

  // 1. SEO Score Check
  if (seoScore >= 80) {
    checklist.push({
      id: 'seo-score',
      label: 'SEO Score ≥ 80',
      status: 'pass',
      message: `Score: ${seoScore}`,
    });
  } else if (seoScore >= 60) {
    checklist.push({
      id: 'seo-score',
      label: 'SEO Score ≥ 80',
      status: 'warn',
      message: `Score: ${seoScore} - Consider improving`,
    });
  } else {
    checklist.push({
      id: 'seo-score',
      label: 'SEO Score ≥ 80',
      status: 'fail',
      message: `Score: ${seoScore} - Needs improvement`,
    });
  }

  // 2. AIO Score Check
  if (aioScore >= 80) {
    checklist.push({
      id: 'aio-score',
      label: 'AI Optimization Score ≥ 80',
      status: 'pass',
      message: `Score: ${aioScore}`,
    });
  } else if (aioScore >= 60) {
    checklist.push({
      id: 'aio-score',
      label: 'AI Optimization Score ≥ 80',
      status: 'warn',
      message: `Score: ${aioScore} - Consider improving`,
    });
  } else {
    checklist.push({
      id: 'aio-score',
      label: 'AI Optimization Score ≥ 80',
      status: 'fail',
      message: `Score: ${aioScore} - Needs improvement`,
    });
  }

  // 3. Meta Description Length Check
  const metaDescLength = (content.seoDescription || content.excerpt || '').length;
  if (metaDescLength >= 120 && metaDescLength <= 160) {
    checklist.push({
      id: 'meta-desc',
      label: 'Meta Description (120-160 chars)',
      status: 'pass',
      message: `${metaDescLength} characters`,
    });
  } else if (metaDescLength > 0) {
    checklist.push({
      id: 'meta-desc',
      label: 'Meta Description (120-160 chars)',
      status: 'warn',
      message: `${metaDescLength} characters - ${metaDescLength < 120 ? 'Too short' : 'Too long'}`,
    });
  } else {
    checklist.push({
      id: 'meta-desc',
      label: 'Meta Description (120-160 chars)',
      status: 'fail',
      message: 'Missing meta description',
    });
  }

  // 4. Featured Image Check
  if (content.featuredImageId) {
    checklist.push({
      id: 'featured-image',
      label: 'Featured Image Set',
      status: 'pass',
    });
  } else {
    checklist.push({
      id: 'featured-image',
      label: 'Featured Image Set',
      status: 'warn',
      message: 'Recommended for better engagement',
    });
  }

  // 5. Keywords Check
  if (content.keywords && content.keywords.length >= 3) {
    checklist.push({
      id: 'keywords',
      label: 'Keywords (3+ recommended)',
      status: 'pass',
      message: `${content.keywords.length} keywords`,
    });
  } else if (content.keywords && content.keywords.length > 0) {
    checklist.push({
      id: 'keywords',
      label: 'Keywords (3+ recommended)',
      status: 'warn',
      message: `Only ${content.keywords.length} keyword(s) - add more`,
    });
  } else {
    checklist.push({
      id: 'keywords',
      label: 'Keywords (3+ recommended)',
      status: 'fail',
      message: 'No keywords added',
    });
  }

  // 6. Content Length Check
  const wordCount = content.content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 300) {
    checklist.push({
      id: 'content-length',
      label: 'Content Length (300+ words)',
      status: 'pass',
      message: `${wordCount} words`,
    });
  } else if (wordCount >= 150) {
    checklist.push({
      id: 'content-length',
      label: 'Content Length (300+ words)',
      status: 'warn',
      message: `${wordCount} words - consider adding more`,
    });
  } else {
    checklist.push({
      id: 'content-length',
      label: 'Content Length (300+ words)',
      status: 'fail',
      message: `${wordCount} words - too short`,
    });
  }

  // 7. Slug Check
  if (content.slug && content.slug.length >= 3 && content.slug.length <= 60) {
    checklist.push({
      id: 'slug',
      label: 'URL Slug (3-60 chars)',
      status: 'pass',
      message: content.slug,
    });
  } else if (content.slug) {
    checklist.push({
      id: 'slug',
      label: 'URL Slug (3-60 chars)',
      status: 'warn',
      message: `${content.slug.length} chars - ${content.slug.length < 3 ? 'Too short' : 'Too long'}`,
    });
  } else {
    checklist.push({
      id: 'slug',
      label: 'URL Slug (3-60 chars)',
      status: 'fail',
      message: 'Missing URL slug',
    });
  }

  // Calculate totals
  const passCount = checklist.filter(item => item.status === 'pass').length;
  const failCount = checklist.filter(item => item.status === 'fail').length;
  const warnCount = checklist.filter(item => item.status === 'warn').length;
  const totalCount = checklist.length;

  const canPublish = failCount === 0;

  return (
    <div className="rounded-lg border border-gray-300 bg-white shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">Pre-Publish Checklist</h3>
        <p className="mt-1 text-sm text-gray-500">
          Review these items before publishing your content
        </p>
      </div>

      {/* Checklist */}
      <div className="px-6 py-4">
        <div className="space-y-3">
          {checklist.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {item.status === 'pass' && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {item.status === 'fail' && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                {item.status === 'warn' && (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="font-medium text-gray-900">{item.label}</div>
                {item.message && (
                  <div
                    className={`text-sm ${
                      item.status === 'pass'
                        ? 'text-green-600'
                        : item.status === 'fail'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {item.message}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">
              {passCount}/{totalCount} checks passed
            </div>
            <div className="flex items-center gap-3 text-sm">
              {failCount > 0 && (
                <span className="text-red-600">{failCount} failed</span>
              )}
              {warnCount > 0 && (
                <span className="text-yellow-600">{warnCount} warnings</span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-green-600 transition-all duration-300"
              style={{ width: `${(passCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Messages */}
        {!canPublish && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">
              <strong>Critical issues detected:</strong> Please fix the failed checks before publishing.
            </p>
          </div>
        )}

        {canPublish && warnCount > 0 && (
          <div className="mt-4 rounded-md bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Warnings detected:</strong> Your content can be published, but addressing these warnings will improve quality.
            </p>
          </div>
        )}

        {canPublish && warnCount === 0 && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-800">
              <strong>All checks passed!</strong> Your content is ready to publish.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={publishing}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          {!canPublish && (
            <button
              type="button"
              onClick={onFixIssues}
              disabled={publishing}
              className="flex-1 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Fix Issues
            </button>
          )}

          <button
            type="button"
            onClick={onPublish}
            disabled={publishing || !canPublish}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${
              canPublish
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {publishing ? 'Publishing...' : canPublish ? 'Publish Now' : 'Cannot Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}

