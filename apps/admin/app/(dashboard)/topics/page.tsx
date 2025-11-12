'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DataTable } from '@/components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface Topic {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED';
  priority: number;
  keywords: string[];
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  async function fetchTopics() {
    try {
      const response = await fetch('/api/topics');
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data.topics || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  const columns: ColumnDef<Topic, any>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900">{row.original.title}</div>
          {row.original.description && (
            <div className="mt-1 text-sm text-gray-500 truncate">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const colors = {
          PENDING: 'bg-yellow-100 text-yellow-800',
          APPROVED: 'bg-green-100 text-green-800',
          REJECTED: 'bg-red-100 text-red-800',
          IN_PROGRESS: 'bg-blue-100 text-blue-800',
          COMPLETED: 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${colors[status as keyof typeof colors]}`}>
            {status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const priority = row.original.priority;
        return (
          <span className={`font-medium ${priority >= 7 ? 'text-red-600' : priority >= 4 ? 'text-yellow-600' : 'text-gray-600'}`}>
            {priority}
          </span>
        );
      },
    },
    {
      accessorKey: 'keywords',
      header: 'Keywords',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.keywords.slice(0, 3).map((keyword, i) => (
            <span key={i} className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
              {keyword}
            </span>
          ))}
          {row.original.keywords.length > 3 && (
            <span className="text-xs text-gray-500">+{row.original.keywords.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'locked',
      header: 'Lock',
      cell: ({ row }) => (
        row.original.locked ? (
          <span className="text-red-600">🔒</span>
        ) : (
          <span className="text-gray-400">🔓</span>
        )
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Topic Queue</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage content ideas and topics for your AI-powered content creation
          </p>
        </div>
        <Link
          href="/topics/new"
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          + New Topic
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Total Topics</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {topics.length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Pending</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-yellow-600">
            {topics.filter(t => t.status === 'PENDING').length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">In Progress</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-blue-600">
            {topics.filter(t => t.status === 'IN_PROGRESS').length}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Completed</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-green-600">
            {topics.filter(t => t.status === 'COMPLETED').length}
          </dd>
        </div>
      </div>

      {/* Topics Table */}
      <div className="rounded-lg bg-white p-6 shadow">
        <DataTable
          columns={columns}
          data={topics}
          loading={loading}
          error={error}
          onRowClick={(topic) => router.push(`/topics/${topic.id}`)}
          pageSize={15}
        />
      </div>
    </div>
  );
}
