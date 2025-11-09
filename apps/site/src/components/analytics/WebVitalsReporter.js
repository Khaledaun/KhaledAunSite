'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * Web Vitals Reporter
 * Monitors Core Web Vitals and reports to analytics
 *
 * Metrics tracked:
 * - CLS: Cumulative Layout Shift
 * - FID: First Input Delay
 * - FCP: First Contentful Paint
 * - LCP: Largest Contentful Paint
 * - TTFB: Time to First Byte
 * - INP: Interaction to Next Paint
 */
export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: Math.round(metric.value),
        rating: metric.rating,
        delta: Math.round(metric.delta),
        id: metric.id,
      });
    }

    // Send to Google Analytics (if available)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        metric_rating: metric.rating,
        non_interaction: true,
      });
    }

    // Send to Vercel Analytics (if available)
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', 'Web Vitals', {
        name: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
      });
    }

    // Log warnings for poor metrics
    if (metric.rating === 'poor') {
      console.warn(`[Web Vitals] ⚠️ Poor ${metric.name}: ${Math.round(metric.value)}`);

      // Provide actionable feedback
      const suggestions = {
        CLS: 'Consider adding width/height to images and reserving space for dynamic content',
        FID: 'Reduce JavaScript execution time and break up long tasks',
        LCP: 'Optimize images, reduce server response time, and eliminate render-blocking resources',
        TTFB: 'Optimize server response time, use CDN, and implement caching',
        INP: 'Optimize event handlers and reduce main thread work',
      };

      if (suggestions[metric.name]) {
        console.info(`[Web Vitals] 💡 Suggestion: ${suggestions[metric.name]}`);
      }
    }
  });

  return null; // This component doesn't render anything
}
