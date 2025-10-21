'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface CaseStudy {
  id: string;
  type: string;
  confidential: boolean;
  title: string;
  slug: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
  };
}

const typeLabels: Record<string, string> = {
  LITIGATION: 'Litigation',
  ARBITRATION: 'Arbitration',
  ADVISORY: 'Advisory',
  VENTURE: 'Venture',
};

const typeColors: Record<string, string> = {
  LITIGATION: 'bg-red-100 text-red-800',
  ARBITRATION: 'bg-blue-100 text-blue-800',
  ADVISORY: 'bg-green-100 text-green-800',
  VENTURE: 'bg-purple-100 text-purple-800',
};

export default function CaseStudiesPage() {
  const router = useRouter();
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ type?: string; published?: string }>({});

  useEffect(() => {
    fetchCaseStudies();
  }, [filter]);

  const fetchCaseStudies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filter as any);
      const response = await fetch(`/api/admin/case-studies?${params}`);
      
      if (!response.ok) throw new Error('Failed to fetch case studies');
      
      const data = await response.json();
      setCaseStudies(data.caseStudies);
    } catch (error) {
      console.error('Error fetching case studies:', error);
      alert('Failed to load case studies');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'unpublish' : 'publish'} this case study?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/case-studies/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update publication status');

      fetchCaseStudies();
    } catch (error) {
      console.error('Error toggling publication:', error);
      alert('Failed to update publication status');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/case-studies/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete case study');

      fetchCaseStudies();
    } catch (error) {
      console.error('Error deleting case study:', error);
      alert('Failed to delete case study');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio & Case Studies</h1>
          <p className="mt-2 text-gray-600">
            Showcase your legal expertise and successful outcomes
          </p>
        </div>
        <Link
          href="/case-studies/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          New Case Study
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={filter.type || ''}
          onChange={(e) => setFilter({ ...filter, type: e.target.value || undefined })}
          className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Types</option>
          <option value="LITIGATION">Litigation</option>
          <option value="ARBITRATION">Arbitration</option>
          <option value="ADVISORY">Advisory</option>
          <option value="VENTURE">Venture</option>
        </select>

        <select
          value={filter.published || ''}
          onChange={(e) => setFilter({ ...filter, published: e.target.value || undefined })}
          className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && caseStudies.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading case studies...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Case Studies Table */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {caseStudies.map((caseStudy) => (
                  <tr key={caseStudy.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {caseStudy.title}
                          {caseStudy.confidential && (
                            <span className="ml-2 text-xs text-gray-500">(Confidential)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">/{caseStudy.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${typeColors[caseStudy.type]}`}>
                        {typeLabels[caseStudy.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {caseStudy.published ? (
                        <span className="px-2 py-1 text-xs rounded-full font-semibold bg-green-100 text-green-800">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full font-semibold bg-gray-100 text-gray-800">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseStudy.publishedAt ? formatDate(caseStudy.publishedAt) : formatDate(caseStudy.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePublishToggle(caseStudy.id, caseStudy.published)}
                          className="text-green-600 hover:text-green-900"
                          title={caseStudy.published ? 'Unpublish' : 'Publish'}
                        >
                          {caseStudy.published ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                        <Link
                          href={`/case-studies/${caseStudy.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(caseStudy.id, caseStudy.title)}
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

          {/* Empty State */}
          {caseStudies.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No case studies yet</h3>
              <p className="text-gray-500 mb-4">
                Start building your portfolio by creating your first case study
              </p>
              <Link
                href="/case-studies/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5" />
                Create Case Study
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

