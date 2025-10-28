'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Types for our data
interface DashboardStats {
  totalTopics: number;
  pendingTopics: number;
  totalContent: number;
  draftContent: number;
  publishedContent: number;
  totalMedia: number;
  avgSeoScore: number;
  avgAioScore: number;
  openSeoIssues: number;
}

interface RecentContent {
  id: string;
  title: string;
  seoScore?: number;
  aioScore?: number;
  status: string;
  createdAt: string;
}

interface SEOIssue {
  id: string;
  contentId: string;
  issueType: string;
  severity: string;
  message: string;
}

export default function CommandCenter() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentContent, setRecentContent] = useState<RecentContent[]>([]);
  const [seoIssues, setSeoIssues] = useState<SEOIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load dashboard stats
        const statsResponse = await fetch('/api/dashboard/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        // Load recent content
        const contentResponse = await fetch('/api/content-library?limit=5');
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          setRecentContent(contentData.content || []);
        }

        // Load SEO issues
        const issuesResponse = await fetch('/api/seo-issues?resolved=false&limit=5');
        if (issuesResponse.ok) {
          const issuesData = await issuesResponse.json();
          setSeoIssues(issuesData.issues || []);
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Command Center</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your AI-powered content management dashboard
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/topics/new"
          className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
        >
          <div className="rounded-lg bg-blue-100 p-3 text-2xl">💡</div>
          <div>
            <div className="font-medium text-gray-900">New Topic</div>
            <div className="text-sm text-gray-500">Add content idea</div>
          </div>
        </Link>
        <Link
          href="/content/new"
          className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-green-500 hover:shadow-md"
        >
          <div className="rounded-lg bg-green-100 p-3 text-2xl">✍️</div>
          <div>
            <div className="font-medium text-gray-900">Create Content</div>
            <div className="text-sm text-gray-500">Write new article</div>
          </div>
        </Link>
        <Link
          href="/media"
          className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-purple-500 hover:shadow-md"
        >
          <div className="rounded-lg bg-purple-100 p-3 text-2xl">📁</div>
          <div>
            <div className="font-medium text-gray-900">Upload Media</div>
            <div className="text-sm text-gray-500">Add images/videos</div>
          </div>
        </Link>
        <Link
          href="/content/library"
          className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-yellow-500 hover:shadow-md"
        >
          <div className="rounded-lg bg-yellow-100 p-3 text-2xl">📚</div>
          <div>
            <div className="font-medium text-gray-900">Content Library</div>
            <div className="text-sm text-gray-500">Browse all content</div>
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Topics */}
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Topics</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {stats.totalTopics}
            </dd>
            <dd className="mt-1 text-sm text-yellow-600">
              {stats.pendingTopics} pending
            </dd>
          </div>

          {/* Content */}
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Content</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {stats.totalContent}
            </dd>
            <dd className="mt-1 text-sm text-gray-600">
              {stats.draftContent} drafts, {stats.publishedContent} published
            </dd>
          </div>

          {/* Media */}
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Media Files</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              {stats.totalMedia}
            </dd>
          </div>

          {/* SEO Issues */}
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">SEO Issues</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-red-600">
              {stats.openSeoIssues}
            </dd>
            <dd className="mt-1 text-sm text-gray-600">Open issues</dd>
          </div>
        </div>
      )}

      {/* SEO/AIO Health */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* SEO Health */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">SEO Health</h3>
            <div className="mt-4 flex items-center gap-4">
              <div className={`flex h-20 w-20 items-center justify-center rounded-full ${
                stats.avgSeoScore >= 80 ? 'bg-green-100' :
                stats.avgSeoScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <span className={`text-2xl font-bold ${
                  stats.avgSeoScore >= 80 ? 'text-green-600' :
                  stats.avgSeoScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {stats.avgSeoScore || 0}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">
                  Average SEO Score
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-2 rounded-full ${
                      stats.avgSeoScore >= 80 ? 'bg-green-600' :
                      stats.avgSeoScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${stats.avgSeoScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AIO Health */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">AI Optimization</h3>
            <div className="mt-4 flex items-center gap-4">
              <div className={`flex h-20 w-20 items-center justify-center rounded-full ${
                stats.avgAioScore >= 80 ? 'bg-green-100' :
                stats.avgAioScore >= 60 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <span className={`text-2xl font-bold ${
                  stats.avgAioScore >= 80 ? 'text-green-600' :
                  stats.avgAioScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {stats.avgAioScore || 0}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">
                  Average AIO Score
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-2 rounded-full ${
                      stats.avgAioScore >= 80 ? 'bg-green-600' :
                      stats.avgAioScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${stats.avgAioScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Content & SEO Issues */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Content */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Content</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentContent.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No content yet. <Link href="/content/new" className="text-blue-600 hover:text-blue-700">Create your first piece</Link>
              </div>
            ) : (
              recentContent.map((content) => (
                <Link
                  key={content.id}
                  href={`/content/library/${content.id}`}
                  className="block p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{content.title}</div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          content.status === 'published' ? 'bg-green-100 text-green-800' :
                          content.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {content.status}
                        </span>
                        {content.seoScore !== undefined && (
                          <span>SEO: {content.seoScore}/100</span>
                        )}
                        {content.aioScore !== undefined && (
                          <span>AIO: {content.aioScore}/100</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* SEO Issues */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Open SEO Issues</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {seoIssues.length === 0 ? (
              <div className="p-6 text-center text-sm text-green-600">
                🎉 No SEO issues! Your content is well optimized.
              </div>
            ) : (
              seoIssues.map((issue) => (
                <div key={issue.id} className="p-4">
                  <div className="flex items-start gap-2">
                    <span className={
                      issue.severity === 'high' ? 'text-red-600' :
                      issue.severity === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }>
                      {issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🔵'}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{issue.issueType}</div>
                      <div className="mt-1 text-sm text-gray-700">{issue.message}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}