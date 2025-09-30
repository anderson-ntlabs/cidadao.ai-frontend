import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: any[];
}

// Thresholds based on Google's recommendations
const thresholds = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  INP: { good: 200, poor: 500 },   // Interaction to Next Paint
};

/**
 * Get rating for a metric value
 */
function getRating(name: WebVitalsMetric['name'], value: number): WebVitalsMetric['rating'] {
  const threshold = thresholds[name];
  if (!threshold) return 'poor';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Format metric value for display
 */
export function formatMetricValue(name: WebVitalsMetric['name'], value: number): string {
  switch (name) {
    case 'CLS':
      return value.toFixed(3);
    case 'LCP':
    case 'FCP':
    case 'TTFB':
    case 'FID':
    case 'INP':
      return `${Math.round(value)}ms`;
    default:
      return value.toString();
  }
}

/**
 * Send analytics data
 */
function sendToAnalytics(metric: WebVitalsMetric) {
  const body = {
    dsn: process.env.NEXT_PUBLIC_WEB_VITALS_DSN,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: 'navigate',
    url: window.location.href,
    timestamp: Date.now(),
  };

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/web-vitals', JSON.stringify(body));
  } else {
    fetch('/api/web-vitals', {
      body: JSON.stringify(body),
      method: 'POST',
      keepalive: true,
    });
  }

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric.name, formatMetricValue(metric.name, metric.value), metric.rating);
  }
}

/**
 * Initialize web vitals reporting
 */
export function reportWebVitals() {
  const handleMetric = (metric: Metric) => {
    const webVitalMetric: WebVitalsMetric = {
      name: metric.name as WebVitalsMetric['name'],
      value: metric.value,
      rating: getRating(metric.name as WebVitalsMetric['name'], metric.value),
      delta: metric.delta,
      entries: metric.entries,
    };
    
    sendToAnalytics(webVitalMetric);
    
    // Store in session storage for debugging
    if (typeof window !== 'undefined') {
      const vitals = JSON.parse(sessionStorage.getItem('webVitals') || '{}');
      vitals[metric.name] = webVitalMetric;
      sessionStorage.setItem('webVitals', JSON.stringify(vitals));
    }
  };

  onCLS(handleMetric);
  onFID(handleMetric);
  onFCP(handleMetric);
  onLCP(handleMetric);
  onTTFB(handleMetric);
  onINP(handleMetric);
}

/**
 * Get current web vitals from session storage
 */
export function getCurrentWebVitals(): Record<string, WebVitalsMetric> {
  if (typeof window === 'undefined') return {};
  
  try {
    return JSON.parse(sessionStorage.getItem('webVitals') || '{}');
  } catch {
    return {};
  }
}

/**
 * Web Vitals Monitor Component
 */
export function useWebVitalsMonitor() {
  const vitals = getCurrentWebVitals();
  
  const summary = {
    score: calculateScore(vitals),
    metrics: vitals,
    recommendations: getRecommendations(vitals),
  };
  
  return summary;
}

/**
 * Calculate overall performance score
 */
function calculateScore(vitals: Record<string, WebVitalsMetric>): number {
  const weights = {
    LCP: 0.25,
    FID: 0.25,
    CLS: 0.25,
    FCP: 0.15,
    TTFB: 0.1,
  };
  
  let totalScore = 0;
  let totalWeight = 0;
  
  Object.entries(weights).forEach(([metric, weight]) => {
    const vital = vitals[metric];
    if (vital) {
      const score = vital.rating === 'good' ? 100 : vital.rating === 'needs-improvement' ? 50 : 0;
      totalScore += score * weight;
      totalWeight += weight;
    }
  });
  
  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}

/**
 * Get performance recommendations
 */
function getRecommendations(vitals: Record<string, WebVitalsMetric>): string[] {
  const recommendations: string[] = [];
  
  if (vitals.LCP?.rating !== 'good') {
    recommendations.push('Optimize largest content paint by lazy loading images and improving server response times');
  }
  
  if (vitals.CLS?.rating !== 'good') {
    recommendations.push('Reduce layout shifts by setting explicit dimensions for images and dynamic content');
  }
  
  if (vitals.FID?.rating !== 'good' || vitals.INP?.rating !== 'good') {
    recommendations.push('Improve interactivity by reducing JavaScript execution time and using web workers');
  }
  
  if (vitals.TTFB?.rating !== 'good') {
    recommendations.push('Improve server response time with caching and CDN optimization');
  }
  
  return recommendations;
}