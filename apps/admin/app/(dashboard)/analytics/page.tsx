'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  EyeIcon, 
  UserGroupIcon, 
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

interface AnalyticsStats {
  totalPosts: number;
  publishedPosts: number;
  totalCaseStudies: number;
  totalLeads: number;
  aiGenerationsThisMonth: number;
  urlExtractionsThisMonth: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/analytics/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Posts',
      value: stats?.totalPosts || 0,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Published Posts',
      value: stats?.publishedPosts || 0,
      icon: EyeIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Case Studies',
      value: stats?.totalCaseStudies || 0,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Leads',
      value: stats?.totalLeads || 0,
      icon: UserGroupIcon,
      color: 'bg-yellow-500',
    },
    {
      title: 'AI Generations (This Month)',
      value: stats?.aiGenerationsThisMonth || 0,
      icon: ArrowTrendingUpIcon,
      color: 'bg-indigo-500',
    },
    {
      title: 'URL Extractions (This Month)',
      value: stats?.urlExtractionsThisMonth || 0,
      icon: GlobeAltIcon,
      color: 'bg-teal-500',
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Performance & Reach
        </h1>
        <p className="text-gray-600">
          Track your content performance, engagement, and AI usage statistics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 flex items-center space-x-4"
          >
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for future charts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Content Performance Over Time
        </h2>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center text-gray-500">
            <ChartBarIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p>Charts and detailed analytics coming soon</p>
            <p className="text-sm mt-2">
              We'll integrate with Vercel Analytics and Google Analytics here
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            External Analytics
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="https://vercel.com/khaledaun/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
                Vercel Analytics Dashboard
              </a>
            </li>
            <li>
              <a
                href="https://analytics.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Google Analytics (Setup Required)
              </a>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <p className="text-sm text-gray-600">
            Detailed activity logs and audit trail coming in Phase 9.
          </p>
        </div>
      </div>
    </div>
  );
}

