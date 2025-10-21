'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';

interface AIConfig {
  id: string;
  provider: string;
  name: string;
  apiKey: string;
  model: string;
  useCases: string[];
  systemPrompt?: string;
  active: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

const providerOptions = [
  { value: 'OPENAI', label: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { value: 'ANTHROPIC', label: 'Anthropic (Claude)', models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'] },
  { value: 'COHERE', label: 'Cohere', models: ['command', 'command-light'] },
  { value: 'CUSTOM', label: 'Custom API', models: [] },
];

const useCaseOptions = [
  { value: 'CONTENT_GENERATION', label: 'Content Generation' },
  { value: 'TRANSLATION', label: 'Translation' },
  { value: 'EMAIL_MARKETING', label: 'Email Marketing' },
  { value: 'SEO_OPTIMIZATION', label: 'SEO Optimization' },
  { value: 'CONTENT_IMPROVEMENT', label: 'Content Improvement' },
  { value: 'URL_EXTRACTION', label: 'URL Extraction' },
];

export default function AIConfigManager() {
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    provider: 'OPENAI',
    name: '',
    apiKey: '',
    model: '',
    useCases: [] as string[],
    systemPrompt: '',
    active: true,
    isDefault: false,
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ai-config');
      if (!response.ok) throw new Error('Failed to fetch configs');
      const data = await response.json();
      setConfigs(data.configs);
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
        ? `/api/admin/ai-config/${editingId}`
        : '/api/admin/ai-config';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save config');
      }

      // Reset form and refresh list
      resetForm();
      fetchConfigs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (config: AIConfig) => {
    setFormData({
      provider: config.provider,
      name: config.name,
      apiKey: config.apiKey,
      model: config.model,
      useCases: config.useCases,
      systemPrompt: config.systemPrompt || '',
      active: config.active,
      isDefault: config.isDefault,
    });
    setEditingId(config.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/ai-config/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete config');

      fetchConfigs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    setTestResult(null);

    try {
      const response = await fetch(`/api/admin/ai-config/${id}/test`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTestResult({ success: true, message: `✓ Test successful! Response: "${data.response}"` });
      } else {
        setTestResult({ success: false, message: `✗ Test failed: ${data.details || data.error}` });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `✗ Test failed: ${err.message}` });
    } finally {
      setTestingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      provider: 'OPENAI',
      name: '',
      apiKey: '',
      model: '',
      useCases: [],
      systemPrompt: '',
      active: true,
      isDefault: false,
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const toggleUseCase = (useCase: string) => {
    setFormData(prev => ({
      ...prev,
      useCases: prev.useCases.includes(useCase)
        ? prev.useCases.filter(uc => uc !== useCase)
        : [...prev.useCases, useCase],
    }));
  };

  const getProviderModels = () => {
    const provider = providerOptions.find(p => p.value === formData.provider);
    return provider?.models || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading AI configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Configuration</h1>
          <p className="mt-2 text-gray-600">
            Manage AI providers, API keys, and model configurations
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5" />
            Add Configuration
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Test Result */}
      {testResult && (
        <div className={`mb-6 px-4 py-3 rounded ${
          testResult.success 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {testResult.message}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-8 bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">
            {editingId ? 'Edit Configuration' : 'New Configuration'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider *
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value, model: '' })}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {providerOptions.map(provider => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Configuration Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Production OpenAI GPT-4"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key *
              </label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="sk-..."
              />
              <p className="mt-1 text-xs text-gray-500">
                API key will be encrypted before storage
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model *
              </label>
              {getProviderModels().length > 0 ? (
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a model</option>
                  {getProviderModels().map(model => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter model name"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Use Cases
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {useCaseOptions.map(useCase => (
                  <label key={useCase.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.useCases.includes(useCase.value)}
                      onChange={() => toggleUseCase(useCase.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{useCase.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Prompt (Optional)
              </label>
              <textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Default system prompt for this configuration..."
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Set as default for this provider</span>
              </label>
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
                {editingId ? 'Update Configuration' : 'Add Configuration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Configurations List */}
      {configs.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name / Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Use Cases
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {configs.map((config) => (
                <tr key={config.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {config.name}
                        {config.isDefault && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full font-semibold bg-blue-100 text-blue-800">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {providerOptions.find(p => p.value === config.provider)?.label}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                    {config.model}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {config.useCases.length > 0 ? (
                        config.useCases.slice(0, 2).map(uc => (
                          <span key={uc} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                            {useCaseOptions.find(u => u.value === uc)?.label || uc}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                      {config.useCases.length > 2 && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                          +{config.useCases.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {config.active ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircleIcon className="h-4 w-4" />
                        <span className="text-sm">Active</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400">
                        <XCircleIcon className="h-4 w-4" />
                        <span className="text-sm">Inactive</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTest(config.id)}
                        disabled={testingId === config.id}
                        className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                        title="Test Configuration"
                      >
                        {testingId === config.id ? (
                          <div className="animate-spin h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full" />
                        ) : (
                          <BeakerIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(config)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(config.id, config.name)}
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
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No AI configurations yet</h3>
          <p className="text-gray-500 mb-4">
            Add your first AI provider configuration to start using AI features
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5" />
            Add Configuration
          </button>
        </div>
      )}
    </div>
  );
}

