/**
 * Content Security Policy Configuration
 *
 * Comprehensive CSP to prevent XSS, injection attacks, and unauthorized resource loading
 */

export interface CSPDirectives {
  [key: string]: string[];
}

/**
 * Generate CSP nonce for inline scripts
 */
export function generateNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Build CSP header string from directives
 */
export function buildCSP(
  directives: CSPDirectives,
  nonce?: string
): string {
  const policies: string[] = [];

  for (const [directive, sources] of Object.entries(directives)) {
    let sourceList = sources;

    // Add nonce to script-src and style-src if provided
    if (nonce && (directive === 'script-src' || directive === 'style-src')) {
      sourceList = [...sources, `'nonce-${nonce}'`];
    }

    policies.push(`${directive} ${sourceList.join(' ')}`);
  }

  return policies.join('; ');
}

/**
 * Production CSP Configuration
 *
 * Balanced policy for security and Next.js compatibility
 */
export const productionCSP: CSPDirectives = {
  'default-src': ["'self'"],

  // Scripts: Allow self, eval (Next.js), inline (Next.js), and analytics
  'script-src': [
    "'self'",
    "'unsafe-eval'", // Required for Next.js
    "'unsafe-inline'", // Required for Next.js inline scripts
    'https://vercel.live',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
  ],

  // Styles: Allow self and inline styles (Next.js requirement)
  'style-src': ["'self'", "'unsafe-inline'"],

  // Images: Allow self, data URIs, Vercel, and external CDNs
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://*.vercel.app',
    'https://*.vercel-insights.com',
    'https://www.google-analytics.com',
  ],

  // Fonts: Allow self and data URIs
  'font-src': ["'self'", 'data:'],

  // Connect: API endpoints and analytics
  'connect-src': [
    "'self'",
    'https://neural-thinker-cidadao-ai-backend.hf.space',
    'https://vercel.live',
    'https://*.vercel-insights.com',
    'https://www.google-analytics.com',
    'https://*.sentry.io',
  ],

  // Media: Only self-hosted
  'media-src': ["'self'"],

  // Objects: Disallow plugins
  'object-src': ["'none'"],

  // Base URI: Restrict to self
  'base-uri': ["'self'"],

  // Forms: Allow self only
  'form-action': ["'self'"],

  // Frame ancestors: Prevent clickjacking
  'frame-ancestors': ["'none'"],

  // Upgrade insecure requests
  'upgrade-insecure-requests': [],

  // Block all mixed content
  'block-all-mixed-content': [],
};

/**
 * Development CSP Configuration
 *
 * More permissive for development tools
 */
export const developmentCSP: CSPDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-eval'",
    "'unsafe-inline'", // For hot reload
    'https://vercel.live',
  ],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': [
    "'self'",
    'https://neural-thinker-cidadao-ai-backend.hf.space',
    'http://localhost:*',
    'ws://localhost:*',
    'wss://localhost:*',
    'https://vercel.live',
  ],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
};

/**
 * Get CSP configuration based on environment
 */
export function getCSPConfig(): CSPDirectives {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? productionCSP : developmentCSP;
}

/**
 * Report-Only CSP for testing
 */
export const reportOnlyCSP: CSPDirectives = {
  ...productionCSP,
  'report-uri': ['/api/security/csp-report'],
};
