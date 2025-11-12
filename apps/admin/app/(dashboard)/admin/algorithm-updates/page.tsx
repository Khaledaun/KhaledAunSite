'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

interface AlgorithmUpdate {
  id: string;
  source: 'SEO' | 'AIO' | 'LINKEDIN';
  title: string;
  description: string | null;
  url: string;
  publishedAt: string;
  category: string[];
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  platform: string | null;
  analyzed: boolean;
  insights: any;
  promptUpdates: string | null;
  applied: boolean;
  appliedAt: string | null;
  appliedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AlgorithmUpdatesPage() {
  const [updates, setUpdates] = useState<AlgorithmUpdate[]>([]);
  const [filteredUpdates, setFilteredUpdates] = useState<AlgorithmUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<AlgorithmUpdate | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  // Filters
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUpdates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [updates, sourceFilter, impactFilter, statusFilter, searchQuery]);

  async function fetchUpdates() {
    try {
      setError(null);
      const response = await fetch('/api/admin/algorithm-updates');
      if (!response.ok) throw new Error('Failed to fetch updates');
      const data = await response.json();
      setUpdates(data.updates || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchNewUpdates() {
    try {
      setFetching(true);
      setError(null);
      const response = await fetch('/api/admin/algorithm-updates/fetch', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to fetch new updates');
      const data = await response.json();

      // Refresh the list
      await fetchUpdates();

      alert(`Successfully fetched ${data.total || 0} new updates!`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setFetching(false);
    }
  }

  async function analyzeUpdate(id: string, batch: boolean = false) {
    try {
      setAnalyzing(id);
      setError(null);
      const response = await fetch('/api/admin/algorithm-updates/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateId: id, batch }),
      });
      if (!response.ok) throw new Error('Failed to analyze update');

      // Refresh the list
      await fetchUpdates();

      alert('Analysis complete!');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAnalyzing(null);
    }
  }

  async function applyUpdate(id: string) {
    try {
      setApplying(id);
      setError(null);
      const response = await fetch('/api/admin/algorithm-updates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateId: id, mode: 'preview' }),
      });
      if (!response.ok) throw new Error('Failed to apply update');
      const data = await response.json();

      // Refresh the list
      await fetchUpdates();

      alert(`Applied update! ${data.templatesUpdated || 0} templates updated.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setApplying(null);
    }
  }

  function applyFilters() {
    let filtered = [...updates];

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(u => u.source === sourceFilter);
    }

    // Impact filter
    if (impactFilter !== 'all') {
      filtered = filtered.filter(u => u.impact === impactFilter);
    }

    // Status filter
    if (statusFilter === 'analyzed') {
      filtered = filtered.filter(u => u.analyzed);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(u => !u.analyzed);
    } else if (statusFilter === 'applied') {
      filtered = filtered.filter(u => u.applied);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.title.toLowerCase().includes(query) ||
        (u.description && u.description.toLowerCase().includes(query)) ||
        (u.platform && u.platform.toLowerCase().includes(query))
      );
    }

    setFilteredUpdates(filtered);
  }

  function viewInsights(update: AlgorithmUpdate) {
    setSelectedUpdate(update);
    setShowInsights(true);
  }

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'SEO': return 'bg-blue-100 text-blue-800';
      case 'AIO': return 'bg-purple-100 text-purple-800';
      case 'LINKEDIN': return 'bg-sky-100 text-sky-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactBadgeColor = (impact: string) => {
    switch (impact) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading algorithm updates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Algorithm Updates</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track and apply SEO, AI Search, and LinkedIn algorithm updates to keep your content optimized.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={fetchNewUpdates}
            disabled={fetching}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 ${fetching ? 'animate-spin' : ''}`} />
            {fetching ? 'Fetching...' : 'Fetch Updates'}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <XMarkIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-medium text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search updates..."
              />
            </div>
          </div>

          {/* Source Filter */}
          <div>
            <label htmlFor="source" className="sr-only">Source</label>
            <select
              id="source"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Sources</option>
              <option value="SEO">SEO (Google)</option>
              <option value="AIO">AIO (AI Search)</option>
              <option value="LINKEDIN">LinkedIn</option>
            </select>
          </div>

          {/* Impact Filter */}
          <div>
            <label htmlFor="impact" className="sr-only">Impact</label>
            <select
              id="impact"
              value={impactFilter}
              onChange={(e) => setImpactFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Impact Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="sr-only">Status</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Analysis</option>
              <option value="analyzed">Analyzed</option>
              <option value="applied">Applied</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600">Total Updates</p>
          <p className="text-2xl font-bold text-gray-900">{updates.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600">Pending Analysis</p>
          <p className="text-2xl font-bold text-orange-600">
            {updates.filter(u => !u.analyzed).length}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600">Analyzed</p>
          <p className="text-2xl font-bold text-green-600">
            {updates.filter(u => u.analyzed).length}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600">Applied</p>
          <p className="text-2xl font-bold text-blue-600">
            {updates.filter(u => u.applied).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Update
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUpdates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <SparklesIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm">No algorithm updates found.</p>
                      <p className="text-xs mt-1">Click "Fetch Updates" to get the latest updates.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUpdates.map((update) => (
                  <tr key={update.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <a
                          href={update.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                        >
                          {update.title}
                        </a>
                        {update.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {update.description}
                          </p>
                        )}
                        {update.platform && (
                          <span className="text-xs text-gray-400 mt-1">
                            Platform: {update.platform}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceBadgeColor(update.source)}`}>
                        {update.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getImpactBadgeColor(update.impact)}`}>
                        {update.impact}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(update.publishedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {update.applied ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Applied
                          </span>
                        ) : update.analyzed ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            <SparklesIcon className="w-3 h-3 mr-1" />
                            Analyzed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {!update.analyzed && (
                        <button
                          onClick={() => analyzeUpdate(update.id)}
                          disabled={analyzing === update.id}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {analyzing === update.id ? (
                            <>
                              <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <SparklesIcon className="w-3 h-3 mr-1" />
                              Analyze
                            </>
                          )}
                        </button>
                      )}
                      {update.analyzed && (
                        <>
                          <button
                            onClick={() => viewInsights(update)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            View Insights
                          </button>
                          {!update.applied && (
                            <button
                              onClick={() => applyUpdate(update.id)}
                              disabled={applying === update.id}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              {applying === update.id ? (
                                <>
                                  <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
                                  Applying...
                                </>
                              ) : (
                                <>
                                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                                  Apply
                                </>
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Modal */}
      <Transition appear show={showInsights} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowInsights(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Algorithm Update Insights
                  </Dialog.Title>

                  {selectedUpdate && (
                    <div className="space-y-4">
                      {/* Header Info */}
                      <div className="border-b pb-4">
                        <h4 className="font-semibold text-gray-900">{selectedUpdate.title}</h4>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceBadgeColor(selectedUpdate.source)}`}>
                            {selectedUpdate.source}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getImpactBadgeColor(selectedUpdate.impact)}`}>
                            {selectedUpdate.impact}
                          </span>
                          {selectedUpdate.platform && (
                            <span className="text-xs text-gray-500">
                              Platform: {selectedUpdate.platform}
                            </span>
                          )}
                        </div>
                        <a
                          href={selectedUpdate.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-900 mt-2 inline-block"
                        >
                          View Source →
                        </a>
                      </div>

                      {/* Description */}
                      {selectedUpdate.description && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
                          <p className="text-sm text-gray-600">{selectedUpdate.description}</p>
                        </div>
                      )}

                      {/* AI Insights */}
                      {selectedUpdate.insights && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">AI Analysis</h5>
                          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                            <pre className="whitespace-pre-wrap font-sans">
                              {JSON.stringify(selectedUpdate.insights, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Prompt Updates */}
                      {selectedUpdate.promptUpdates && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Recommended Prompt Changes</h5>
                          <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
                            <pre className="whitespace-pre-wrap font-sans">
                              {selectedUpdate.promptUpdates}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Categories */}
                      {selectedUpdate.category.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Categories</h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedUpdate.category.map((cat, idx) => (
                              <span
                                key={idx}
                                className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Applied Info */}
                      {selectedUpdate.applied && (
                        <div className="border-t pt-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Application Details</h5>
                          <div className="text-sm text-gray-600">
                            <p>Applied on: {new Date(selectedUpdate.appliedAt!).toLocaleString()}</p>
                            {selectedUpdate.appliedBy && <p>Applied by: {selectedUpdate.appliedBy}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-900 hover:bg-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      onClick={() => setShowInsights(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
