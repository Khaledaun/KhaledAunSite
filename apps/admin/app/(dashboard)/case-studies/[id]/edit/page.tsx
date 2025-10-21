'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CaseStudyForm from '@/components/CaseStudyForm';

export default function EditCaseStudyPage() {
  const params = useParams();
  const [caseStudy, setCaseStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCaseStudy();
  }, [params.id]);

  const fetchCaseStudy = async () => {
    try {
      const response = await fetch(`/api/admin/case-studies/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch case study');
      }
      
      const data = await response.json();
      setCaseStudy(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading case study...</p>
        </div>
      </div>
    );
  }

  if (error || !caseStudy) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || 'Case study not found'}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Case Study</h1>
        <p className="mt-2 text-gray-600">
          Update your case study details
        </p>
      </div>

      <CaseStudyForm mode="edit" caseStudy={caseStudy} />
    </div>
  );
}

