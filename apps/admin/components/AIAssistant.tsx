'use client';

import { useState } from 'react';

interface AIAssistantProps {
  onInsertContent: (content: string) => void;
  currentContent?: string;
}

export function AIAssistant({ onInsertContent, currentContent }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'translate' | 'extract' | 'improve'>('generate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate content
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'technical' | 'friendly'>('professional');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  // Translate
  const [translateFrom, setTranslateFrom] = useState<'en' | 'ar'>('en');
  const [translateTo, setTranslateTo] = useState<'en' | 'ar'>('ar');

  // Extract URL
  const [url, setUrl] = useState('');

  // Improve
  const [instructions, setInstructions] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'content',
          topic,
          tone,
          length,
          language,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onInsertContent(data.output);
        setTopic('');
      } else {
        setError(data.error || 'Generation failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!currentContent) {
      setError('No content to translate');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentContent,
          from: translateFrom,
          to: translateTo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onInsertContent(data.translated);
      } else {
        setError(data.error || 'Translation failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractURL = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/ai/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.ok) {
        onInsertContent(data.extracted.content);
        setUrl('');
      } else {
        setError(data.error || 'Extraction failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!currentContent) {
      setError('No content to improve');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'improve',
          content: currentContent,
          instructions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onInsertContent(data.output);
        setInstructions('');
      } else {
        setError(data.error || 'Improvement failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-4">🤖 AI Assistant</h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b">
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-3 py-2 font-medium transition-colors ${
            activeTab === 'generate'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Generate
        </button>
        <button
          onClick={() => setActiveTab('translate')}
          className={`px-3 py-2 font-medium transition-colors ${
            activeTab === 'translate'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Translate
        </button>
        <button
          onClick={() => setActiveTab('extract')}
          className={`px-3 py-2 font-medium transition-colors ${
            activeTab === 'extract'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Import URL
        </button>
        <button
          onClick={() => setActiveTab('improve')}
          className={`px-3 py-2 font-medium transition-colors ${
            activeTab === 'improve'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Improve
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic to write about..."
              className="w-full px-3 py-2 border rounded"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full px-3 py-2 border rounded"
                disabled={loading}
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="technical">Technical</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Length</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as any)}
                className="w-full px-3 py-2 border rounded"
                disabled={loading}
              >
                <option value="short">Short (~500 words)</option>
                <option value="medium">Medium (~1000 words)</option>
                <option value="long">Long (~2000 words)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full px-3 py-2 border rounded"
              disabled={loading}
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : '✨ Generate Content'}
          </button>
        </div>
      )}

      {/* Translate Tab */}
      {activeTab === 'translate' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-3">
            Translate your current content between English and Arabic
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">From</label>
              <select
                value={translateFrom}
                onChange={(e) => setTranslateFrom(e.target.value as any)}
                className="w-full px-3 py-2 border rounded"
                disabled={loading}
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">To</label>
              <select
                value={translateTo}
                onChange={(e) => setTranslateTo(e.target.value as any)}
                className="w-full px-3 py-2 border rounded"
                disabled={loading}
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleTranslate}
            disabled={loading || !currentContent}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Translating...' : '🌐 Translate Content'}
          </button>
        </div>
      )}

      {/* Extract URL Tab */}
      {activeTab === 'extract' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-3">
            Import content from any blog post or article URL
          </p>

          <div>
            <label className="block text-sm font-medium mb-1">Article URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full px-3 py-2 border rounded"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleExtractURL}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Extracting...' : '📥 Import from URL'}
          </button>
        </div>
      )}

      {/* Improve Tab */}
      {activeTab === 'improve' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-3">
            Enhance your current content with AI
          </p>

          <div>
            <label className="block text-sm font-medium mb-1">
              Instructions (optional)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="E.g., 'Make it more engaging' or 'Add more technical details'"
              rows={3}
              className="w-full px-3 py-2 border rounded"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleImprove}
            disabled={loading || !currentContent}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Improving...' : '✨ Improve Content'}
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mt-4 text-center text-sm text-gray-500">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
          Processing with AI...
        </div>
      )}
    </div>
  );
}

export default AIAssistant;

