'use client';
// Sprint 1: Topic Queue Management
import { useEffect, useState } from 'react';
import { 
  PlusIcon, 
  LockClosedIcon, 
  LockOpenIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface Topic {
  id: string;
  title: string;
  description: string;
  source_url: string;
  source_type: 'ai_search' | 'web_crawl' | 'manual' | 'rss';
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  locked: boolean;
  locked_at: string | null;
  priority: number;
  keywords: string[];
  relevance_score: number;
  created_at: string;
  user_notes: string;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocked, setFilterLocked] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTopics();
  }, [filterStatus, filterLocked]);

  const loadTopics = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterLocked !== 'all') params.append('locked', filterLocked);

      const response = await fetch(`/api/topics?${params.toString()}`);
      const data = await response.json();
      setTopics(data.topics || []);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLock = async (topicId: string, currentLockState: boolean) => {
    try {
      const method = currentLockState ? 'DELETE' : 'POST';
      const response = await fetch(`/api/topics/${topicId}/lock`, { method });
      
      if (response.ok) {
        loadTopics();
      }
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  const updateStatus = async (topicId: string, status: string) => {
    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        loadTopics();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    
    try {
      const response = await fetch(`/api/topics/${topicId}`, { method: 'DELETE' });
      
      if (response.ok) {
        loadTopics();
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const getSourceIcon = (sourceType: string) => {
    const icons: { [key: string]: string } = {
      ai_search: '🤖',
      web_crawl: '🌐',
      manual: '✍️',
      rss: '📡',
    };
    return icons[sourceType] || '📄';
  };

  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.replace('_', ' ')}
      </span>
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
          <h1 className="text-3xl font-bold text-gray-900">Topic Queue</h1>
          <p className="mt-2 text-sm text-gray-600">
            {topics.length} topics • Daily refresh at 08:00 Jerusalem time
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-brand-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Topic
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lock Status
            </label>
            <select
              value={filterLocked}
              onChange={(e) => setFilterLocked(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
            >
              <option value="all">All</option>
              <option value="true">Locked</option>
              <option value="false">Unlocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {topics.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No topics yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add your first topic manually or wait for daily AI-generated suggestions.
            </p>
          </div>
        ) : (
          topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Title and Lock */}
                  <div className="flex items-center gap-2">
                    {topic.locked && (
                      <LockClosedIcon className="h-5 w-5 text-yellow-600" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {topic.title}
                    </h3>
                  </div>

                  {/* Description */}
                  {topic.description && (
                    <p className="mt-2 text-sm text-gray-600">
                      {topic.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      {getSourceIcon(topic.source_type)} {topic.source_type.replace('_', ' ')}
                    </span>
                    {topic.relevance_score && (
                      <span>Score: {topic.relevance_score.toFixed(1)}</span>
                    )}
                    <span>
                      {new Date(topic.created_at).toLocaleDateString()}
                    </span>
                    {topic.keywords && topic.keywords.length > 0 && (
                      <span>
                        🏷️ {topic.keywords.join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="mt-2">
                    {getStatusBadge(topic.status)}
                  </div>

                  {/* User Notes */}
                  {topic.user_notes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-900">
                        <strong>Notes:</strong> {topic.user_notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => toggleLock(topic.id, topic.locked)}
                    className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-md"
                    title={topic.locked ? 'Unlock' : 'Lock'}
                  >
                    {topic.locked ? (
                      <LockOpenIcon className="h-5 w-5" />
                    ) : (
                      <LockClosedIcon className="h-5 w-5" />
                    )}
                  </button>
                  
                  {topic.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(topic.id, 'approved')}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md"
                        title="Approve"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => updateStatus(topic.id, 'rejected')}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                        title="Reject"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {topic.status === 'approved' && (
                    <button
                      onClick={() => window.location.href = `/content/new?topicId=${topic.id}`}
                      className="px-3 py-2 text-xs font-medium text-white bg-brand-gold hover:bg-brand-gold/90 rounded-md"
                    >
                      Generate
                    </button>
                  )}

                  <button
                    onClick={() => deleteTopic(topic.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Topic Modal */}
      {showCreateModal && (
        <CreateTopicModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadTopics();
          }}
        />
      )}
    </div>
  );
}

// Create Topic Modal Component
function CreateTopicModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sourceUrl: '',
    keywords: '',
    userNotes: '',
    priority: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
          sourceType: 'manual',
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert('Failed to create topic');
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Error creating topic');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Topic</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Source URL
            </label>
            <input
              type="url"
              value={formData.sourceUrl}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="legal tech, AI, compliance"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={formData.userNotes}
              onChange={(e) => setFormData({ ...formData, userNotes: e.target.value })}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <input
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-gold hover:bg-brand-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Topic'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

