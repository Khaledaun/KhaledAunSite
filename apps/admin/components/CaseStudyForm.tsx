'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CaseStudy {
  id?: string;
  type: string;
  confidential: boolean;
  title: string;
  slug: string;
  problem: string;
  strategy: string;
  outcome: string;
  categories: string[];
  practiceArea: string;
  year: number | null;
  jurisdiction: string;
  featuredImageId: string | null;
  published: boolean;
}

interface CaseStudyFormProps {
  caseStudy?: CaseStudy;
  mode: 'create' | 'edit';
}

const caseStudyTypes = [
  { value: 'LITIGATION', label: 'Litigation' },
  { value: 'ARBITRATION', label: 'Arbitration' },
  { value: 'ADVISORY', label: 'Advisory' },
  { value: 'VENTURE', label: 'Venture' },
];

export default function CaseStudyForm({ caseStudy, mode }: CaseStudyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<CaseStudy>({
    type: caseStudy?.type || 'LITIGATION',
    confidential: caseStudy?.confidential || false,
    title: caseStudy?.title || '',
    slug: caseStudy?.slug || '',
    problem: caseStudy?.problem || '',
    strategy: caseStudy?.strategy || '',
    outcome: caseStudy?.outcome || '',
    categories: caseStudy?.categories || [],
    practiceArea: caseStudy?.practiceArea || '',
    year: caseStudy?.year || null,
    jurisdiction: caseStudy?.jurisdiction || '',
    featuredImageId: caseStudy?.featuredImageId || null,
    published: caseStudy?.published || false,
  });

  const [categoryInput, setCategoryInput] = useState('');

  // Auto-generate slug from title
  useEffect(() => {
    if (mode === 'create' && formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, formData.slug, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'year') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addCategory = () => {
    if (categoryInput.trim() && !formData.categories.includes(categoryInput.trim())) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, categoryInput.trim()],
      }));
      setCategoryInput('');
    }
  };

  const removeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = mode === 'create' 
        ? '/api/admin/case-studies'
        : `/api/admin/case-studies/${caseStudy?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save case study');
      }

      const data = await response.json();
      
      // Redirect to case studies list
      router.push('/case-studies');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Case Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {caseStudyTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="confidential"
              name="confidential"
              checked={formData.confidential}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="confidential" className="ml-2 block text-sm text-gray-700">
              Confidential (Hide sensitive details)
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Multi-Million Dollar Arbitration Victory"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            URL Slug *
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="multi-million-dollar-arbitration-victory"
          />
          <p className="mt-1 text-xs text-gray-500">
            Will be used in URL: /case-studies/{formData.slug || 'your-slug'}
          </p>
        </div>
      </div>

      {/* Problem / Strategy / Outcome */}
      <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Case Details</h2>

        <div>
          <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-1">
            Problem *
          </label>
          <textarea
            id="problem"
            name="problem"
            value={formData.problem}
            onChange={handleChange}
            required
            rows={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the challenge or legal issue..."
          />
          <p className="mt-1 text-xs text-gray-500">
            What was the client's challenge or the legal issue at hand?
          </p>
        </div>

        <div>
          <label htmlFor="strategy" className="block text-sm font-medium text-gray-700 mb-1">
            Strategy *
          </label>
          <textarea
            id="strategy"
            name="strategy"
            value={formData.strategy}
            onChange={handleChange}
            required
            rows={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Explain your approach and legal strategy..."
          />
          <p className="mt-1 text-xs text-gray-500">
            What approach did you take to resolve the issue?
          </p>
        </div>

        <div>
          <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 mb-1">
            Outcome *
          </label>
          <textarea
            id="outcome"
            name="outcome"
            value={formData.outcome}
            onChange={handleChange}
            required
            rows={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the results and impact..."
          />
          <p className="mt-1 text-xs text-gray-500">
            What was the result? What impact did it have?
          </p>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Additional Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="practiceArea" className="block text-sm font-medium text-gray-700 mb-1">
              Practice Area
            </label>
            <input
              type="text"
              id="practiceArea"
              name="practiceArea"
              value={formData.practiceArea}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Commercial Law"
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year || ''}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear()}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="2024"
            />
          </div>

          <div>
            <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-700 mb-1">
              Jurisdiction
            </label>
            <input
              type="text"
              id="jurisdiction"
              name="jurisdiction"
              value={formData.jurisdiction}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., New York, NY"
            />
          </div>
        </div>

        <div>
          <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">
            Categories
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a category..."
            />
            <button
              type="button"
              onClick={addCategory}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Add
            </button>
          </div>
          {formData.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.categories.map(category => (
                <span
                  key={category}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {category}
                  <button
                    type="button"
                    onClick={() => removeCategory(category)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Case Study' : 'Update Case Study'}
        </button>
      </div>
    </form>
  );
}

