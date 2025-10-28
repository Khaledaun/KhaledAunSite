'use client';

import { useSEOAnalysis } from '@/lib/hooks/useSEOAnalysis';

interface ContentSEOPanelProps {
  title: string;
  description: string;
  content: string;
  keywords: string[];
  slug: string;
  excerpt?: string;
}

export function ContentSEOPanel(props: ContentSEOPanelProps) {
  const { analysis, loading } = useSEOAnalysis(props);

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
        <p className="text-sm text-gray-500">Enter content to see SEO analysis</p>
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
        <h3 className="text-lg font-semibold text-gray-900">SEO Score</h3>
        <div className="mt-4 flex items-center gap-4">
          <div className={`flex h-24 w-24 items-center justify-center rounded-full ${scoreBgColor}`}>
            <span className={`text-3xl font-bold ${scoreColor}`}>{analysis.score}</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">
              {analysis.score >= 80 && 'Excellent! Your content is well optimized.'}
              {analysis.score >= 60 && analysis.score < 80 && 'Good, but there\'s room for improvement.'}
              {analysis.score < 60 && 'Needs improvement. Follow the suggestions below.'}
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

      {/* Meta Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h4 className="font-medium text-gray-900">Meta Tags</h4>
        <div className="mt-4 space-y-3">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Title Length</span>
              <span className={analysis.meta.titleOptimal ? 'text-green-600' : 'text-yellow-600'}>
                {analysis.meta.titleLength} characters {analysis.meta.titleOptimal ? '✓' : '⚠'}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Optimal: 30-60 characters</p>
          </div>
          
          {/* Description */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">Description Length</span>
              <span className={analysis.meta.descriptionOptimal ? 'text-green-600' : 'text-yellow-600'}>
                {analysis.meta.descriptionLength} characters {analysis.meta.descriptionOptimal ? '✓' : '⚠'}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Optimal: 120-160 characters</p>
          </div>
        </div>
      </div>

      {/* Readability */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h4 className="font-medium text-gray-900">Readability</h4>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Flesch-Kincaid Grade</span>
            <span className="font-medium">{analysis.readability.fleschKincaid.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Grade Level</span>
            <span className="font-medium">{analysis.readability.grade}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Word Count</span>
            <span className="font-medium">{analysis.readability.wordCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Reading Time</span>
            <span className="font-medium">{analysis.readability.readingTime} min</span>
          </div>
        </div>
      </div>

      {/* Headings */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h4 className="font-medium text-gray-900">Heading Structure</h4>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div>
            <span className="text-gray-500">H1:</span> <span className="font-medium">{analysis.headings.h1Count}</span>
          </div>
          <div>
            <span className="text-gray-500">H2:</span> <span className="font-medium">{analysis.headings.h2Count}</span>
          </div>
          <div>
            <span className="text-gray-500">H3:</span> <span className="font-medium">{analysis.headings.h3Count}</span>
          </div>
          <div>
            <span className="text-gray-500">H4:</span> <span className="font-medium">{analysis.headings.h4Count}</span>
          </div>
        </div>
        <div className="mt-2">
          <span className={`text-sm font-medium ${
            analysis.headings.structure === 'excellent' ? 'text-green-600' :
            analysis.headings.structure === 'good' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            Structure: {analysis.headings.structure}
          </span>
        </div>
      </div>

      {/* Keywords */}
      {analysis.keywords.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h4 className="font-medium text-gray-900">Keyword Analysis</h4>
          <div className="mt-4 space-y-2">
            {analysis.keywords.map((kw, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{kw.keyword}</span>
                <div className="flex items-center gap-2">
                  <span className={kw.optimal ? 'text-green-600' : 'text-yellow-600'}>
                    {kw.density.toFixed(2)}% ({kw.count}x)
                  </span>
                  {kw.optimal ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-yellow-600">⚠</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">Optimal density: 0.5% - 2.5%</p>
        </div>
      )}

      {/* Issues */}
      {analysis.issues.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h4 className="font-medium text-gray-900">Issues to Fix</h4>
          <ul className="mt-4 space-y-3">
            {analysis.issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={
                  issue.severity === 'error' ? 'text-red-600' :
                  issue.severity === 'warning' ? 'text-yellow-600' :
                  'text-blue-600'
                }>
                  {issue.severity === 'error' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵'}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{issue.type}</p>
                  <p className="text-gray-700">{issue.message}</p>
                  {issue.fix && <p className="mt-1 text-gray-600">{issue.fix}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <h4 className="font-medium text-gray-900">Strengths</h4>
          <ul className="mt-4 space-y-2">
            {analysis.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-600">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h4 className="font-medium text-gray-900">Recommendations</h4>
          <ul className="mt-4 space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-600">💡</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
