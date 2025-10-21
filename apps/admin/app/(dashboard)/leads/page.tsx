'use client';

import { useState, useEffect } from 'react';
import LeadsTable from '@/components/LeadsTable';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [filters, setFilters] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, [page, filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });

      const response = await fetch(`/api/admin/leads?${params}`);
      if (!response.ok) throw new Error('Failed to fetch leads');

      const data = await response.json();
      setLeads(data.leads);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Error fetching leads:', error);
      alert('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev: any) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusChange = async (leadId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update lead');

      // Refresh leads
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Failed to update lead status');
    }
  };

  const handleExport = async () => {
    try {
      // Build query params (same filters as current view)
      const params = new URLSearchParams(filters);

      const response = await fetch(`/api/admin/leads/export?${params}`);
      if (!response.ok) throw new Error('Failed to export leads');

      // Download the CSV file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting leads:', error);
      alert('Failed to export leads');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leads & Collaborations</h1>
        <p className="mt-2 text-gray-600">
          Manage incoming collaboration requests, speaking invitations, and general inquiries
        </p>
      </div>

      {loading && leads.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading leads...</p>
          </div>
        </div>
      ) : (
        <LeadsTable
          leads={leads}
          total={total}
          page={page}
          limit={limit}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onStatusChange={handleStatusChange}
          onExport={handleExport}
        />
      )}
    </div>
  );
}

