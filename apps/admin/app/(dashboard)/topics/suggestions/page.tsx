'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lightbulb, Newspaper, Sparkles, Loader2 } from 'lucide-react';

interface TopicSuggestion {
  title: string;
  description?: string;
  source?: string;
  url?: string;
}

export default function TopicSuggestionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<TopicSuggestion[]>([]);
  const [newsSuggestions, setNewsSuggestions] = useState<TopicSuggestion[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());

  // AI Suggestion Form State
  const [category, setCategory] = useState('');
  const [keywords, setKeywords] = useState('');
  const [count, setCount] = useState(10);

  // News Scraping Form State
  const [practiceAreas, setPracticeAreas] = useState('litigation, arbitration, business law');
  const [useAIFiltering, setUseAIFiltering] = useState(true);
  const [newsLimit, setNewsLimit] = useState(15);

  const handleGenerateAISuggestions = async () => {
    if (!category && !keywords) {
      alert('Please enter either a category or keywords');
      return;
    }

    setLoading(true);
    setAiSuggestions([]);

    try {
      const response = await fetch('/api/topics/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
          count,
          saveAsDrafts: false, // Just show suggestions first
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate suggestions');
      }

      const data = await response.json();
      setAiSuggestions(data.suggestions.map((s: string) => ({ title: s })));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeNews = async () => {
    setLoading(true);
    setNewsSuggestions([]);

    try {
      const response = await fetch('/api/topics/scrape-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practiceAreas: practiceAreas.split(',').map((p) => p.trim()).filter(Boolean),
          useAIFiltering,
          saveAsTopics: false, // Just show suggestions first
          limit: newsLimit,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape news');
      }

      const data = await response.json();
      setNewsSuggestions(data.articles.map((a: any) => ({
        title: a.title,
        description: a.description,
        source: a.source,
        url: a.url,
      })));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to scrape news');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelection = (title: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(title)) {
      newSelected.delete(title);
    } else {
      newSelected.add(title);
    }
    setSelectedTopics(newSelected);
  };

  const handleSaveSelected = async () => {
    if (selectedTopics.size === 0) {
      alert('Please select at least one topic');
      return;
    }

    setLoading(true);

    try {
      const allSuggestions = [...aiSuggestions, ...newsSuggestions];
      const selectedItems = allSuggestions.filter((s) => selectedTopics.has(s.title));

      // Create topics for selected suggestions
      for (const suggestion of selectedItems) {
        await fetch('/api/topics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: suggestion.title,
            description: suggestion.description || '',
            sourceUrl: suggestion.url,
            sourceType: suggestion.source ? 'rss_manual' : 'ai_manual',
            keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
            priority: 5,
          }),
        });
      }

      alert(`Successfully created ${selectedItems.length} topics!`);
      router.push('/topics');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save topics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Topic Suggestions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate topic ideas using AI or scrape legal news sources
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* AI Suggestions */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Topic Generator</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., compliance best practices"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., arbitration, international trade"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Suggestions
              </label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                min={1}
                max={20}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleGenerateAISuggestions}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="h-4 w-4" />
              )}
              Generate AI Suggestions
            </button>
          </div>
        </div>

        {/* News Scraper */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Legal News Scraper</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Practice Areas (comma-separated)
              </label>
              <input
                type="text"
                value={practiceAreas}
                onChange={(e) => setPracticeAreas(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useAI"
                checked={useAIFiltering}
                onChange={(e) => setUseAIFiltering(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="useAI" className="text-sm text-gray-700">
                Use AI to filter relevant articles
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Articles
              </label>
              <input
                type="number"
                value={newsLimit}
                onChange={(e) => setNewsLimit(parseInt(e.target.value))}
                min={5}
                max={50}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleScrapeNews}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Newspaper className="h-4 w-4" />
              )}
              Scrape Legal News
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {(aiSuggestions.length > 0 || newsSuggestions.length > 0) && (
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Suggestions ({aiSuggestions.length + newsSuggestions.length})
            </h2>
            <button
              onClick={handleSaveSelected}
              disabled={selectedTopics.size === 0 || loading}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Save Selected ({selectedTopics.size})
            </button>
          </div>

          <div className="space-y-2">
            {aiSuggestions.map((suggestion, idx) => (
              <div
                key={`ai-${idx}`}
                className="flex items-start gap-3 rounded-lg border p-3 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedTopics.has(suggestion.title)}
                  onChange={() => handleToggleSelection(suggestion.title)}
                  className="mt-1 rounded border-gray-300 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-900">{suggestion.title}</span>
                  </div>
                </div>
              </div>
            ))}

            {newsSuggestions.map((suggestion, idx) => (
              <div
                key={`news-${idx}`}
                className="flex items-start gap-3 rounded-lg border p-3 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedTopics.has(suggestion.title)}
                  onChange={() => handleToggleSelection(suggestion.title)}
                  className="mt-1 rounded border-gray-300 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">{suggestion.title}</span>
                  </div>
                  {suggestion.description && (
                    <p className="mt-1 text-xs text-gray-600">{suggestion.description}</p>
                  )}
                  {suggestion.source && (
                    <span className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {suggestion.source}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
