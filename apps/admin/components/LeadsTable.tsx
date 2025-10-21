'use client';

import { useState } from 'react';
import { 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';

interface Lead {
  id: string;
  name: string;
  email: string;
  organization: string | null;
  country: string | null;
  interest: string;
  message: string;
  source: string;
  status: string;
  tags: string[];
  nextActionAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LeadsTableProps {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  onFilterChange: (filters: any) => void;
  onPageChange: (page: number) => void;
  onStatusChange: (leadId: string, status: string) => void;
  onExport: () => void;
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  REPLIED: 'bg-green-100 text-green-800',
  SCHEDULED: 'bg-yellow-100 text-yellow-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
};

const interestLabels: Record<string, string> = {
  COLLABORATION: 'Collaboration',
  SPEAKING: 'Speaking',
  REFERRAL: 'Referral',
  PRESS: 'Press',
  GENERAL: 'General Inquiry',
};

export default function LeadsTable({
  leads,
  total,
  page,
  limit,
  onFilterChange,
  onPageChange,
  onStatusChange,
  onExport,
}: LeadsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [interestFilter, setInterestFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setSearch(value);
    onFilterChange({ search: value });
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    onFilterChange({ status: value || undefined });
  };

  const handleSourceFilter = (value: string) => {
    setSourceFilter(value);
    onFilterChange({ source: value || undefined });
  };

  const handleInterestFilter = (value: string) => {
    setInterestFilter(value);
    onFilterChange({ interest: value || undefined });
  };

  const openMailto = (email: string, name: string) => {
    window.location.href = `mailto:${email}?subject=Re: Your inquiry&body=Hi ${name},%0D%0A%0D%0A`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Search and Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
          </button>

          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="NEW">New</option>
                <option value="REPLIED">Replied</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => handleSourceFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Sources</option>
                <option value="CONTACT_FORM">Contact Form</option>
                <option value="LINKEDIN_EMBED">LinkedIn</option>
                <option value="NEWSLETTER">Newsletter</option>
                <option value="MANUAL">Manual Entry</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest
              </label>
              <select
                value={interestFilter}
                onChange={(e) => handleInterestFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Interests</option>
                <option value="COLLABORATION">Collaboration</option>
                <option value="SPEAKING">Speaking</option>
                <option value="REFERRAL">Referral</option>
                <option value="PRESS">Press</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Leads Count */}
      <div className="text-sm text-gray-600">
        Showing {leads.length} of {total} leads
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
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
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-500">{lead.email}</div>
                    {lead.organization && (
                      <div className="text-sm text-gray-500">{lead.organization}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {interestLabels[lead.interest] || lead.interest}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.source.replace('_', ' ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={lead.status}
                    onChange={(e) => onStatusChange(lead.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full font-semibold border-0 ${statusColors[lead.status]}`}
                  >
                    <option value="NEW">New</option>
                    <option value="REPLIED">Replied</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(lead.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openMailto(lead.email, lead.name)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Reply via email"
                    >
                      <EnvelopeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onStatusChange(lead.id, 'ARCHIVED')}
                      className="text-gray-600 hover:text-gray-900"
                      title="Archive"
                    >
                      <ArchiveBoxIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {leads.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-500">
            {search || statusFilter || sourceFilter || interestFilter
              ? 'Try adjusting your filters'
              : 'Leads will appear here when people contact you'}
          </p>
        </div>
      )}
    </div>
  );
}

