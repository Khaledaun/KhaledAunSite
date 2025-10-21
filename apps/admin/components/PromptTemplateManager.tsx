'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  prompt: string;
  useCase: string;
  tone?: string;
  language?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

const useCaseOptions = [
  { value: 'CONTENT_GENERATION', label: 'Content Generation' },
  { value: 'TRANSLATION', label: 'Translation' },
  { value: 'EMAIL_MARKETING', label: 'Email Marketing' },
  { value: 'SEO_OPTIMIZATION', label: 'SEO Optimization' },
  { value: 'CONTENT_IMPROVEMENT', label: 'Content Improvement' },
  { value: 'URL_EXTRACTION', label: 'URL Extraction' },
];

const defaultTemplates = [
  {
    name: 'Arbitration Watch Blog Post',
    category: 'Blog Posts',
    useCase: 'CONTENT_GENERATION',
    tone: 'professional',
    language: 'en',
    description: 'Generate a blog post for Arbitration Watch series',
    prompt: `You are a legal expert writing for "Arbitration Watch," a blog series analyzing recent arbitration cases.

Write a comprehensive blog post about: {topic}

Structure:
1. Compelling headline
2. Brief introduction (2-3 sentences)
3. Background & Context
4. Key Legal Issues
5. Analysis & Implications
6. Practical Takeaways
7. Conclusion

Tone: Professional, analytical, accessible to legal professionals
Length: 800-1200 words
Include relevant citations and legal precedents where applicable.`,
  },
  {
    name: 'Conflict Prevention Digest',
    category: 'Newsletter',
    useCase: 'CONTENT_GENERATION',
    tone: 'professional',
    language: 'en',
    description: 'Generate a newsletter article for Conflict Prevention Digest',
    prompt: `You are writing for "Conflict Prevention Digest," a newsletter focused on proactive conflict management strategies.

Topic: {topic}

Structure:
1. Attention-grabbing headline
2. Problem Statement (what conflict risk exists)
3. Prevention Strategies (3-5 actionable steps)
4. Real-world Application
5. Key Takeaway

Tone: Practical, actionable, forward-thinking
Length: 500-700 words
Focus on prevention rather than resolution.`,
  },
  {
    name: 'LinkedIn Professional Summary',
    category: 'Social Media',
    useCase: 'CONTENT_GENERATION',
    tone: 'professional',
    language: 'en',
    description: 'Create LinkedIn post from blog content',
    prompt: `Convert the following content into an engaging LinkedIn post:

{content}

Requirements:
- Start with a hook (question, statistic, or bold statement)
- 3-5 short paragraphs
- Professional but conversational tone
- Include 3-5 relevant hashtags
- End with a call-to-action (comment, share, connect)
- Maximum 1300 characters`,
  },
  {
    name: 'Case Study Generator',
    category: 'Case Studies',
    useCase: 'CONTENT_GENERATION',
    tone: 'professional',
    language: 'en',
    description: 'Generate a case study using Problem→Strategy→Outcome framework',
    prompt: `Generate a professional case study based on the following information:

{details}

Use the Problem → Strategy → Outcome framework:

**The Challenge:**
Describe the client's problem or legal issue in detail. What was at stake? What were the complications?

**Our Approach:**
Explain the strategy and methodology used. What made this approach effective? What expertise was applied?

**The Result:**
Detail the outcome and impact. What was achieved? What value was delivered to the client?

Tone: Professional, confident, results-focused
Length: 600-900 words total
Maintain confidentiality - use general descriptions if needed.`,
  },
  {
    name: 'English to Arabic Translation',
    category: 'Translation',
    useCase: 'TRANSLATION',
    language: 'ar',
    description: 'Translate English legal content to Arabic',
    prompt: `Translate the following English text to Arabic:

{text}

Requirements:
- Maintain legal terminology accuracy
- Preserve formatting (headings, lists, paragraphs)
- Keep a professional, formal tone appropriate for legal content
- Ensure cultural appropriateness for Middle Eastern audience`,
  },
  {
    name: 'Arabic to English Translation',
    category: 'Translation',
    useCase: 'TRANSLATION',
    language: 'en',
    description: 'Translate Arabic legal content to English',
    prompt: `Translate the following Arabic text to English:

{text}

Requirements:
- Maintain legal terminology accuracy
- Preserve formatting (headings, lists, paragraphs)
- Keep a professional, formal tone appropriate for legal content
- Use clear, accessible English`,
  },
  {
    name: 'SEO Meta Description',
    category: 'SEO',
    useCase: 'SEO_OPTIMIZATION',
    tone: 'professional',
    language: 'en',
    description: 'Generate SEO-optimized meta description',
    prompt: `Based on the following content, create an SEO-optimized meta description:

{content}

Requirements:
- Exactly 150-160 characters
- Include primary keyword naturally
- Compelling and click-worthy
- Accurate summary of content
- Include a call-to-action if possible`,
  },
  {
    name: 'Content Improvement',
    category: 'Editing',
    useCase: 'CONTENT_IMPROVEMENT',
    tone: 'professional',
    language: 'en',
    description: 'Improve existing content for clarity and impact',
    prompt: `Review and improve the following content:

{content}

Focus on:
1. Clarity and readability
2. Professional tone
3. Stronger opening and closing
4. Better transitions between ideas
5. More compelling language
6. Remove redundancy
7. Improve structure if needed

Maintain the core message and key points. Return the improved version.`,
  },
];

export default function PromptTemplateManager() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState({ category: '', useCase: '', search: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    prompt: '',
    useCase: 'CONTENT_GENERATION',
    tone: '',
    language: '',
  });

  useEffect(() => {
    fetchTemplates();
  }, [filter]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.useCase) params.append('useCase', filter.useCase);
      if (filter.search) params.append('search', filter.search);

      const response = await fetch(`/api/admin/ai-templates?${params}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const data = await response.json();
      setTemplates(data.templates);
      setCategories(data.categories);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingId
        ? `/api/admin/ai-templates/${editingId}`
        : '/api/admin/ai-templates';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save template');
      }

      resetForm();
      fetchTemplates();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (template: PromptTemplate) => {
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      prompt: template.prompt,
      useCase: template.useCase,
      tone: template.tone || '',
      language: template.language || '',
    });
    setEditingId(template.id);
    setShowForm(true);
  };

  const handleDuplicate = (template: PromptTemplate) => {
    setFormData({
      name: `${template.name} (Copy)`,
      description: template.description || '',
      category: template.category,
      prompt: template.prompt,
      useCase: template.useCase,
      tone: template.tone || '',
      language: template.language || '',
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/ai-templates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete template');

      fetchTemplates();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadDefaultTemplates = async () => {
    if (!confirm('This will add pre-built templates to your collection. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      const promises = defaultTemplates.map(template =>
        fetch('/api/admin/ai-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(template),
        })
      );

      await Promise.all(promises);
      fetchTemplates();
    } catch (err: any) {
      setError('Failed to load default templates');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      prompt: '',
      useCase: 'CONTENT_GENERATION',
      tone: '',
      language: '',
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Prompt Templates</h1>
          <p className="mt-2 text-gray-600">
            Create and manage reusable prompt templates for content generation
          </p>
        </div>
        <div className="flex gap-2">
          {templates.length === 0 && !showForm && (
            <button
              onClick={loadDefaultTemplates}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Load Default Templates
            </button>
          )}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5" />
              New Template
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-8 bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">
            {editingId ? 'Edit Template' : 'New Template'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Blog Post Template"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  list="categories"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Blog Posts, Social Media"
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of this template"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Use Case *
                </label>
                <select
                  value={formData.useCase}
                  onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {useCaseOptions.map(uc => (
                    <option key={uc.value} value={uc.value}>
                      {uc.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tone
                </label>
                <input
                  type="text"
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., professional, casual"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., en, ar"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt Template *
              </label>
              <textarea
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                required
                rows={12}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Enter your prompt template. Use {variable} for dynamic content."
              />
              <p className="mt-1 text-xs text-gray-500">
                Use {'{curly braces}'} for variables like {'{topic}'}, {'{content}'}, {'{details}'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingId ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      {!showForm && templates.length > 0 && (
        <div className="mb-6 flex gap-4">
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filter.useCase}
            onChange={(e) => setFilter({ ...filter, useCase: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Use Cases</option>
            {useCaseOptions.map(uc => (
              <option key={uc.value} value={uc.value}>{uc.label}</option>
            ))}
          </select>

          <input
            type="text"
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search templates..."
          />
        </div>
      )}

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {template.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                      {template.category}
                    </span>
                    {template.usageCount > 0 && (
                      <span className="flex items-center gap-1">
                        <ChartBarIcon className="h-4 w-4" />
                        {template.usageCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {template.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {template.description}
                </p>
              )}

              <div className="text-xs text-gray-500 mb-4 font-mono bg-gray-50 p-2 rounded line-clamp-3">
                {template.prompt.substring(0, 150)}...
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDuplicate(template)}
                  className="flex-1 text-sm text-gray-600 hover:text-gray-900"
                  title="Duplicate"
                >
                  <DocumentDuplicateIcon className="h-4 w-4 inline mr-1" />
                  Duplicate
                </button>
                <button
                  onClick={() => handleEdit(template)}
                  className="text-blue-600 hover:text-blue-900"
                  title="Edit"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(template.id, template.name)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first prompt template or load pre-built templates to get started
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={loadDefaultTemplates}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Load Default Templates
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5" />
                Create Template
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

