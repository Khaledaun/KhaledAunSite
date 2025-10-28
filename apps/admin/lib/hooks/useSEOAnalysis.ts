'use client';

import { useState, useEffect, useMemo } from 'react';
import { analyzeSEO, type SEOAnalysis } from '@khaledaun/utils/seo-analyzer';
import { debounce } from '../utils/debounce';

interface UseSEOAnalysisProps {
  title: string;
  description?: string;
  content: string;
  keywords: string[];
  slug: string;
  excerpt?: string;
}

export function useSEOAnalysis(props: UseSEOAnalysisProps) {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  // Debounced analysis function
  const analyzeContent = useMemo(
    () =>
      debounce(() => {
        setLoading(true);
        try {
          const result = analyzeSEO(props);
          setAnalysis(result);
        } catch (error) {
          console.error('SEO analysis error:', error);
        } finally {
          setLoading(false);
        }
      }, 500),
    []
  );

  // Run analysis whenever content changes
  useEffect(() => {
    analyzeContent();
  }, [props.title, props.description, props.content, props.keywords, props.slug, props.excerpt]);

  return {
    analysis,
    loading,
  };
}

