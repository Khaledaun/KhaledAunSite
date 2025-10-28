'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Topic {
  id: string;
  title: string;
  description: string;
  sourceUrl: string;
  sourceType: string;
  keywords: string[];
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  locked: boolean;
  lockedBy: string | null;
  lockedAt: string | null;
  userNotes: string;
  createdAt: string;
  updatedAt: string;
}

export default function TopicDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Topic>>({});

  useEffect(() => {
    fetchTopic();
  }, [params.id]);

  async function fetchTopic() {
    try {
      const response = await fetch(`/api/topics/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch topic');
      const data = await response.json();
      setTopic(data.topic);
      setFormData(data.topic);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    try {
      const response = await fetch(`/api/topics/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update topic');
      
      const data = await response.json();
      setTopic(data.topic);
      setEditing(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this topic?')) return;

    try {
      const response = await fetch(`/api/topics/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete topic');
      router.push('/topics');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleLockToggle() {
    try {
      const endpoint = topic?.locked ? 'unlock' : 'lock';
      const response = await fetch(`/api/topics/${params.id}/${endpoint}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error(`Failed to ${endpoint} topic`);
      
      const data = await response.json();
      setTopic(data.topic);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function convertToContent() {
    if (!topic) return;
    
    // Create new content from topic
    router.push(`/content/new?topicId=${topic.id}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">{error || 'Topic not found'}</p>
        <Link href="/topics" className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700">
          ← Back to Topics
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/topics" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to Topics
        </Link>
      </div>

      {/* Title Section */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {editing ? (
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-2xl font-bold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{topic.title}</h1>
          )}
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={topic.status} />
            <span className="text-sm text-gray-500">
              Priority: <span className="font-medium">{topic.priority}</span>
            </span>
            {topic.locked && (
              <span className="text-sm text-red-600">🔒 Locked</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={handleUpdate}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(topic);
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={handleLockToggle}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {topic.locked ? 'Unlock' : 'Lock'}
              </button>
              <button
                onClick={convertToContent}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Create Content
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">Description</h2>
            {editing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-2 text-gray-700">{topic.description || 'No description'}</p>
            )}
          </div>

          {/* User Notes */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
            {editing ? (
              <textarea
                value={formData.userNotes}
                onChange={(e) => setFormData({ ...formData, userNotes: e.target.value })}
                rows={4}
                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <p className="mt-2 text-gray-700">{topic.userNotes || 'No notes'}</p>
            )}
          </div>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Keywords */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-semibold text-gray-900">Keywords</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {topic.keywords.length > 0 ? (
                topic.keywords.map((keyword, i) => (
                  <span key={i} className="inline-flex rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800">
                    {keyword}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No keywords</span>
              )}
            </div>
          </div>

          {/* Source */}
          {topic.sourceUrl && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-sm font-semibold text-gray-900">Source</h3>
              <a
                href={topic.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block truncate text-sm text-blue-600 hover:text-blue-700"
              >
                {topic.sourceUrl}
              </a>
              <p className="mt-1 text-xs text-gray-500">Type: {topic.sourceType}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-semibold text-gray-900">Timestamps</h3>
            <dl className="mt-2 space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-900">{new Date(topic.createdAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Updated</dt>
                <dd className="text-gray-900">{new Date(topic.updatedAt).toLocaleString()}</dd>
              </div>
              {topic.lockedAt && (
                <div>
                  <dt className="text-gray-500">Locked</dt>
                  <dd className="text-gray-900">{new Date(topic.lockedAt).toLocaleString()}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  );
}

