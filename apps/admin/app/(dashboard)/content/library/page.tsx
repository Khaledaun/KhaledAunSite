'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DataTable } from '@/components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

interface Content {
  id: string;
  title: string;
  type: 'blog' | 'linkedin_post' | 'linkedin_article' | 'linkedin_carousel';
  status: 'draft' | 'review' | 'published' | 'archived';
  seoScore?: number;
  aioScore?: number;
  wordCount?: number;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export default function ContentLibraryPage() {
  const router = useRouter();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchContent();
  }, [typeFilter, statusFilter]);

  async function fetchContent() {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/content-library?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch content');
      
      const data = await response.json();
      setContent(data.content || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
      const response = await fetch(`/api/content-library/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete content');
      
      setContent(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to delete content');
      console.error(err);
    }
  }

  async function handleDuplicate(item: Content) {
    const newTitle = `${item.title} (Copy)`;
    // Navigate to create page with pre-filled data
    const queryParams = new URLSearchParams({
      duplicate: 'true',
      sourceId: item.id,
    });
    router.push(`/content/new?${queryParams.toString()}`);
  }

  const columns: ColumnDef<Content, any>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="max-w-md">
          <Link 
            href={`/content/library/${row.original.id}`}
            className="font-medium text-gray-900 hover:text-blue-600"
            data-testid="content-title-link"
          >
            {row.original.title}
          </Link>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <span className="rounded bg-gray-100 px-2 py-0.5">{row.original.type}</span>
            {row.original.wordCount && <span>{row.original.wordCount} words</span>}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'seoScore',
      header: 'SEO',
      cell: ({ row }) => {
        const score = row.original.seoScore;
        if (!score) return <span className="text-gray-400">—</span>;
        const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
        return <span className={`font-semibold ${color}`}>{score}</span>;
      },
    },
    {
      accessorKey: 'aioScore',
      header: 'AIO',
      cell: ({ row }) => {
        const score = row.original.aioScore;
        if (!score) return <span className="text-gray-400">—</span>;
        const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
        return <span className={`font-semibold ${color}`}>{score}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const colors = {
          draft: 'bg-gray-100 text-gray-800',
          review: 'bg-blue-100 text-blue-800',
          published: 'bg-green-100 text-green-800',
          archived: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${colors[status]}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'keywords',
      header: 'Keywords',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.keywords.slice(0, 2).map((keyword, i) => (
            <span key={i} className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
              {keyword}
            </span>
          ))}
          {row.original.keywords.length > 2 && (
            <span className="text-xs text-gray-500">+{row.original.keywords.length - 2}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {format(new Date(row.original.updatedAt), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/content/${row.original.id}`);
            }}
            className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicate(row.original);
            }}
            className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Duplicate
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.original.id);
            }}
            className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // Filter content by search query
  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all your AI-optimized content
          </p>
        </div>
        <Link
          href="/content/new"
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          + New Content
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total Content</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {content.length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Drafts</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-yellow-600">
            {content.filter(c => c.status === 'draft').length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Published</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-600">
            {content.filter(c => c.status === 'published').length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Avg SEO Score</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-blue-600">
            {content.length > 0
              ? Math.round(content.reduce((sum, c) => sum + (c.seoScore || 0), 0) / content.length)
              : 0}
          </dd>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg bg-white p-4 shadow">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by title or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="blog">Blog Post</option>
          <option value="linkedin_post">LinkedIn Post</option>
          <option value="linkedin_article">LinkedIn Article</option>
          <option value="linkedin_carousel">LinkedIn Carousel</option>
        </select>
        <select
          name="status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="review">In Review</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <button
          onClick={fetchContent}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {/* Content Table */}
      <div className="rounded-lg bg-white p-6 shadow">
        <DataTable
          columns={columns}
          data={filteredContent}
          loading={loading}
          error={error}
          onRowClick={(item) => router.push(`/content/${item.id}`)}
          pageSize={20}
        />
      </div>
    </div>
  );
}
