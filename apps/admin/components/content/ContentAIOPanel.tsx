'use client';

import { useState, useEffect, useMemo } from 'react';
import { analyzeAIO, type AIOAnalysis } from '@khaledaun/utils/aio-optimizer';
import { debounce } from '@/lib/utils/debounce';

interface ContentAIOPanelProps {
  title: string;
  content: string;
  excerpt?: string;
  schema?: any;
  keywords?: string[];
}

export function ContentAIOPanel(props: ContentAIOPanelProps) {
  const [analysis, setAnalysis] = useState<AIOAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  // Debounced analysis
  const analyzeContent = useMemo(
    () =>
      debounce(() => {
        setLoading(true);
        try {
          const result = analyzeAIO(props);
          setAnalysis(result);
        } catch (error) {
          console.error('AIO analysis error:', error);
        } finally {
          setLoading(false);
        }
      }, 500),
    []
  );

  useEffect(() => {
    analyzeContent();
  }, [props.title, props.content, props.excerpt, props.schema, props.keywords]);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/4 rounded bg-gray-200" />
          <div className="h-20 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Enter content to see AI optimization analysis</p>
      </div>
    );
  }

  const scoreColor = 
    analysis.score >= 80 ? 'text-green-600' :
    analysis.score >= 60 ? 'text-yellow-600' :
    'text-red-600';

  const scoreBgColor =
    analysis.score >= 80 ? 'bg-green-100' :
    analysis.score >= 60 ? 'bg-yellow-100' :
    'bg-red-100';

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">AI Optimization Score</h3>
        <div className="mt-4 flex items-center gap-4">
          <div className={`flex h-24 w-24 items-center justify-center rounded-full ${scoreBgColor}`}>
            <span className={`text-3xl font-bold ${scoreColor}`}>{analysis.score}</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">
              {analysis.score >= 80 && 'Excellent! Your content is optimized for AI search engines.'}
              {analysis.score >= 60 && analysis.score < 80 && 'Good, but can be improved for better AI discoverability.'}
              {analysis.score < 60 && 'Needs work. Follow the recommendations below.'}
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full ${analysis.score >= 80 ? 'bg-green-600' : analysis.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                style={{ width: `${analysis.score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ChatGPT Optimization */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">ChatGPT Optimization</h4>
          <span className="text-sm text-gray-500">35% weight</span>
        </div>
        
        <div className="mt-4 space-y-3">
          {/* Citation Quality */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Citation Quality</span>
              <span className={analysis.chatGPTOptimization.citationQuality >= 70 ? 'text-green-600' : 'text-yellow-600'}>
                {analysis.chatGPTOptimization.citationQuality}/100
              </span>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${analysis.chatGPTOptimization.citationQuality}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Include numbers, statistics, and source attributions
            </p>
          </div>

          {/* Fact Density */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Fact Density</span>
              <span className={analysis.chatGPTOptimization.factDensity >= 70 ? 'text-green-600' : 'text-yellow-600'}>
                {analysis.chatGPTOptimization.factDensity}/100
              </span>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: `${analysis.chatGPTOptimization.factDensity}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Include more factual statements and data points
            </p>
          </div>

          {/* Other Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
            <div>
              <span className="text-gray-500">Quotable Snippets:</span>
              <span className="ml-2 font-medium">{analysis.chatGPTOptimization.quotableSnippets}</span>
            </div>
            <div>
              <span className="text-gray-500">Source Attribution:</span>
              <span className="ml-2 font-medium">
                {analysis.chatGPTOptimization.sourceAttribution ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Perplexity Optimization */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Perplexity Optimization</h4>
          <span className="text-sm text-gray-500">30% weight</span>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Q&A Format</span>
            {analysis.perplexityOptimization.questionAnswerFormat ? (
              <span className="text-green-600">✓ Yes</span>
            ) : (
              <span className="text-yellow-600">✗ No</span>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Clear Sections</span>
            {analysis.perplexityOptimization.clearSections ? (
              <span className="text-green-600">✓ Yes</span>
            ) : (
              <span className="text-yellow-600">✗ No</span>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Fact Boxes</span>
            <span className={analysis.perplexityOptimization.factBoxes >= 2 ? 'text-green-600' : 'text-yellow-600'}>
              {analysis.perplexityOptimization.factBoxes}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Sources</span>
            <span className={analysis.perplexityOptimization.sources >= 3 ? 'text-green-600' : 'text-yellow-600'}>
              {analysis.perplexityOptimization.sources}
            </span>
          </div>
        </div>

        {!analysis.perplexityOptimization.questionAnswerFormat && (
          <div className="mt-3 rounded-md bg-blue-50 p-3 text-xs text-blue-800">
            💡 Tip: Structure your content with questions as headings followed by answers
          </div>
        )}
      </div>

      {/* Google SGE Optimization */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Google SGE Optimization</h4>
          <span className="text-sm text-gray-500">25% weight</span>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Key Takeaways Section</span>
            {analysis.googleSGEOptimization.keyTakeaways ? (
              <span className="text-green-600">✓ Yes</span>
            ) : (
              <span className="text-yellow-600">✗ No</span>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Bullet Summaries</span>
            {analysis.googleSGEOptimization.bulletSummaries ? (
              <span className="text-green-600">✓ Yes</span>
            ) : (
              <span className="text-yellow-600">✗ No</span>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Expert Quotes</span>
            <span className={analysis.googleSGEOptimization.expertQuotes >= 2 ? 'text-green-600' : 'text-yellow-600'}>
              {analysis.googleSGEOptimization.expertQuotes}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Visual Elements</span>
            <span className={analysis.googleSGEOptimization.visualElements >= 1 ? 'text-green-600' : 'text-yellow-600'}>
              {analysis.googleSGEOptimization.visualElements}
            </span>
          </div>
        </div>

        {!analysis.googleSGEOptimization.keyTakeaways && (
          <div className="mt-3 rounded-md bg-blue-50 p-3 text-xs text-blue-800">
            💡 Tip: Add a "Key Takeaways" or "TL;DR" section at the beginning
          </div>
        )}
      </div>

      {/* Structured Data */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Structured Data (Schema.org)</h4>
          <span className="text-sm text-gray-500">10% weight</span>
        </div>
        
        <div className="mt-4">
          {analysis.structuredData.hasSchema ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Schema Type</span>
                <span className="font-medium text-green-600">{analysis.structuredData.schemaType}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Completeness</span>
                <span className={analysis.structuredData.completeness >= 80 ? 'text-green-600' : 'text-yellow-600'}>
                  {analysis.structuredData.completeness}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${analysis.structuredData.completeness}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
              ⚠ No structured data found. Add Schema.org markup to improve AI understanding.
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h4 className="font-medium text-gray-900">Recommendations</h4>
          <ul className="mt-3 space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-600">💡</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Engine Info */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h5 className="text-xs font-semibold uppercase text-gray-500">What This Means</h5>
        <div className="mt-2 space-y-2 text-xs text-gray-600">
          <p>
            <strong>ChatGPT:</strong> Prioritizes factual, well-cited content with clear sources
          </p>
          <p>
            <strong>Perplexity:</strong> Favors Q&A format with fact boxes and multiple sources
          </p>
          <p>
            <strong>Google SGE:</strong> Prefers summaries, takeaways, and expert perspectives
          </p>
          <p>
            <strong>Schema.org:</strong> Structured data helps AI understand context and relationships
          </p>
        </div>
      </div>
    </div>
  );
}

