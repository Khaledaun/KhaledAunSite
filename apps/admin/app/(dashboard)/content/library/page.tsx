'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface ContentItem {
  id: string;
  topic_id: string;
  type: 'blog' | 'linkedin_post' | 'linkedin_article' | 'linkedin_carousel';
  format: string;
  title: string;
  content: string;
  summary: string;
  keywords: string[];
  seo_score: number;
  word_count: number;
  reading_time_minutes: number;
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived';
  published_at: string | null;
  published_to: string[];
  tags: string[];
  category: string;
  created_at: string;
  updated_at: string;
  topics?: { title: string };
}

export default function ContentLibraryPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadContent();
  }, [filterType, filterStatus, searchTerm]);

  const loadContent = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/content-library?${params.toString()}`);
      const data = await response.json();
      setContent(data.content || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
      const response = await fetch(`/api/content-library/${id}`, { method: 'DELETE' });
      
      if (response.ok) {
        loadContent();
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      blog: '📝',
      linkedin_post: '💼',
      linkedin_article: '📄',
      linkedin_carousel: '🎞️',
    };
    return icons[type] || '📄';
  };

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      draft: 'bg-gray-100 text-gray-800',
      review: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getPublishedBadges = (publishedTo: string[]) => {
    if (!publishedTo || publishedTo.length === 0) return null;
    
    return (
      <div className="flex gap-1">
        {publishedTo.map((platform) => (
          <span
            key={platform}
            className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800"
          >
            {platform === 'blog' ? '📝 Blog' : '💼 LinkedIn'}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
          <p className="mt-2 text-sm text-gray-600">
            {total} {total === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Link
          href="/content/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-brand-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Content
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or keywords..."
                className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
            >
              <option value="all">All Types</option>
              <option value="blog">Blog</option>
              <option value="linkedin_post">LinkedIn Post</option>
              <option value="linkedin_article">LinkedIn Article</option>
              <option value="linkedin_carousel">LinkedIn Carousel</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {content.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No content yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first piece of content.
          </p>
          <div className="mt-6">
            <Link
              href="/content/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-gold hover:bg-brand-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Content
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {content.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {item.title}
                      </div>
                      {item.topics && (
                        <div className="text-xs text-gray-500 mt-1">
                          Topic: {item.topics.title}
                        </div>
                      )}
                      {item.keywords && item.keywords.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {item.keywords.slice(0, 3).map((keyword) => (
                            <span
                              key={keyword}
                              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        {item.word_count} words • {item.reading_time_minutes} min read
                        {item.seo_score && ` • SEO: ${item.seo_score}/10`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm text-gray-900">
                        {getTypeIcon(item.type)} {item.type.replace('_', ' ')}
                      </div>
                      {getPublishedBadges(item.published_to)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col gap-1">
                      <div>
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                      {item.published_at && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(item.published_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/content/${item.id}`}
                        className="text-brand-gold hover:text-brand-gold/80"
                        title="View"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <Link
                        href={`/content/${item.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => deleteContent(item.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

