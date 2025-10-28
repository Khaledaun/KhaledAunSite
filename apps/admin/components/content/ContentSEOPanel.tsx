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

      {/* Meta Title */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Meta Title</h4>
          {analysis.metaTitle.optimal ? (
            <span className="text-green-600">✓</span>
          ) : (
            <span className="text-yellow-600">⚠</span>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-700">{props.title}</p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className={analysis.metaTitle.optimal ? 'text-green-600' : 'text-yellow-600'}>
            {analysis.metaTitle.length} characters
          </span>
          <span className="text-gray-500">Optimal: 30-60</span>
        </div>
        {!analysis.metaTitle.optimal && (
          <p className="mt-2 text-xs text-gray-500">{analysis.metaTitle.suggestion}</p>
        )}
      </div>

      {/* Meta Description */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Meta Description</h4>
          {analysis.metaDescription.optimal ? (
            <span className="text-green-600">✓</span>
          ) : (
            <span className="text-yellow-600">⚠</span>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-700">{props.description || 'No description set'}</p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className={analysis.metaDescription.optimal ? 'text-green-600' : 'text-yellow-600'}>
            {analysis.metaDescription.length} characters
          </span>
          <span className="text-gray-500">Optimal: 120-160</span>
        </div>
        {!analysis.metaDescription.optimal && (
          <p className="mt-2 text-xs text-gray-500">{analysis.metaDescription.suggestion}</p>
        )}
      </div>

      {/* Content Length */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Content Length</h4>
          {analysis.contentLength.optimal ? (
            <span className="text-green-600">✓</span>
          ) : (
            <span className="text-yellow-600">⚠</span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className={analysis.contentLength.optimal ? 'text-green-600' : 'text-yellow-600'}>
            {analysis.wordCount} words
          </span>
          <span className="text-gray-500">Optimal: 800+</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Estimated reading time: {analysis.readingTime} min
        </p>
        {!analysis.contentLength.optimal && (
          <p className="mt-2 text-xs text-gray-500">{analysis.contentLength.suggestion}</p>
        )}
      </div>

      {/* Heading Structure */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Heading Structure</h4>
          {analysis.headingStructure.optimal ? (
            <span className="text-green-600">✓</span>
          ) : (
            <span className="text-yellow-600">⚠</span>
          )}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
          <div>
            <span className="text-gray-500">H1:</span> {analysis.headingStructure.h1Count}
          </div>
          <div>
            <span className="text-gray-500">H2:</span> {analysis.headingStructure.h2Count}
          </div>
          <div>
            <span className="text-gray-500">H3:</span> {analysis.headingStructure.h3Count}
          </div>
        </div>
        {!analysis.headingStructure.optimal && (
          <p className="mt-2 text-xs text-gray-500">{analysis.headingStructure.suggestion}</p>
        )}
      </div>

      {/* Keyword Density */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h4 className="font-medium text-gray-900">Keyword Density</h4>
        {props.keywords.length > 0 ? (
          <div className="mt-2 space-y-2">
            {props.keywords.map((keyword) => {
              const density = analysis.keywordDensity[keyword] || 0;
              const optimal = density >= 0.5 && density <= 2.5;
              return (
                <div key={keyword} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{keyword}</span>
                  <div className="flex items-center gap-2">
                    <span className={optimal ? 'text-green-600' : 'text-yellow-600'}>
                      {density.toFixed(2)}%
                    </span>
                    {optimal ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-yellow-600">⚠</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">Add keywords to analyze density</p>
        )}
        <p className="mt-2 text-xs text-gray-500">Optimal range: 0.5% - 2.5%</p>
      </div>

      {/* Readability */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h4 className="font-medium text-gray-900">Readability</h4>
        <div className="mt-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Flesch-Kincaid Grade</span>
            <span className={analysis.readabilityScore <= 10 ? 'text-green-600' : 'text-yellow-600'}>
              {analysis.readabilityScore.toFixed(1)}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {analysis.readabilityScore <= 6 && 'Easy to read (6th grade)'}
            {analysis.readabilityScore > 6 && analysis.readabilityScore <= 10 && 'Fairly easy (7th-10th grade)'}
            {analysis.readabilityScore > 10 && analysis.readabilityScore <= 14 && 'Moderate (11th-14th grade)'}
            {analysis.readabilityScore > 14 && 'Difficult (College level)'}
          </p>
        </div>
      </div>

      {/* Image Alt Text */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Image Alt Text</h4>
          {analysis.imageAltText.optimal ? (
            <span className="text-green-600">✓</span>
          ) : (
            <span className="text-yellow-600">⚠</span>
          )}
        </div>
        <div className="mt-2 text-sm">
          <p className="text-gray-700">
            {analysis.imageAltText.totalImages} image(s), {analysis.imageAltText.imagesMissingAlt} missing alt text
          </p>
          {!analysis.imageAltText.optimal && (
            <p className="mt-2 text-xs text-gray-500">{analysis.imageAltText.suggestion}</p>
          )}
        </div>
      </div>

      {/* Internal Links */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Internal Links</h4>
          {analysis.internalLinks.optimal ? (
            <span className="text-green-600">✓</span>
          ) : (
            <span className="text-yellow-600">⚠</span>
          )}
        </div>
        <div className="mt-2 space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Internal links</span>
            <span>{analysis.internalLinks.internalLinkCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">External links</span>
            <span>{analysis.internalLinks.externalLinkCount}</span>
          </div>
          {!analysis.internalLinks.optimal && (
            <p className="mt-2 text-xs text-gray-500">{analysis.internalLinks.suggestion}</p>
          )}
        </div>
      </div>

      {/* URL Slug */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">URL Slug</h4>
          {analysis.urlSlug.optimal ? (
            <span className="text-green-600">✓</span>
          ) : (
            <span className="text-yellow-600">⚠</span>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-700">{props.slug || 'No slug set'}</p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className={analysis.urlSlug.optimal ? 'text-green-600' : 'text-yellow-600'}>
            {analysis.urlSlug.length} characters
          </span>
          <span className="text-gray-500">Optimal: 3-5 words</span>
        </div>
        {!analysis.urlSlug.optimal && (
          <p className="mt-2 text-xs text-gray-500">{analysis.urlSlug.suggestion}</p>
        )}
      </div>

      {/* Issues */}
      {analysis.issues.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <h4 className="font-medium text-gray-900">Issues to Fix</h4>
          <ul className="mt-2 space-y-2">
            {analysis.issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={
                  issue.severity === 'high' ? 'text-red-600' :
                  issue.severity === 'medium' ? 'text-yellow-600' :
                  'text-blue-600'
                }>
                  {issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🔵'}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{issue.type}</p>
                  <p className="text-gray-700">{issue.message}</p>
                  <p className="mt-1 text-gray-600">{issue.suggestion}</p>
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
          <ul className="mt-2 space-y-1">
            {analysis.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-600">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

