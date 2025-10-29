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
 *
 * ⚠️ Security Note on 'unsafe-eval' and 'unsafe-inline':
 *
 * These directives are required by Next.js core functionality and cannot be
 * removed without breaking the application:
 *
 * - 'unsafe-eval': Required for Next.js webpack runtime, dynamic imports,
 *   and code splitting. This is a known limitation of Next.js.
 *
 * - 'unsafe-inline': Required for Next.js inline scripts and styles injected
 *   during server-side rendering (SSR) and client-side hydration.
 *
 * Future improvement: Next.js 14+ may support nonce-based CSP which would
 * allow removing 'unsafe-inline'. Monitor: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
 *
 * The CSP still provides significant protection by:
 * - Restricting resource origins to specific trusted domains
 * - Blocking plugins via object-src 'none'
 * - Preventing clickjacking via frame-ancestors
 * - Enforcing HTTPS via upgrade-insecure-requests
 */
export const productionCSP: CSPDirectives = {
  'default-src': ["'self'"],

  // Scripts: Allow self, eval (Next.js), inline (Next.js), analytics, and VLibras
  'script-src': [
    "'self'",
    "'unsafe-eval'", // ⚠️ Required for Next.js - see note above
    "'unsafe-inline'", // ⚠️ Required for Next.js - see note above
    'blob:', // ⚠️ Required for VLibras Unity Web Workers
    'https://vercel.live',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://vlibras.gov.br', // VLibras CDN
    'https://*.vlibras.gov.br', // VLibras subdomains
    'https://cdn.jsdelivr.net', // VLibras plugin from jsdelivr CDN
    'https://us-assets.i.posthog.com', // PostHog assets
  ],

  // Styles: Allow self and inline styles (Next.js requirement)
  'style-src': ["'self'", "'unsafe-inline'"],

  // Images: Allow self, data URIs, Vercel, VLibras, and external CDNs
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://*.vercel.app',
    'https://*.vercel-insights.com',
    'https://www.google-analytics.com',
    'https://vlibras.gov.br', // VLibras avatars and images
    'https://*.vlibras.gov.br', // VLibras CDN
    'https://cdn.jsdelivr.net', // VLibras assets from jsdelivr CDN
  ],

  // Fonts: Allow self, data URIs, and VLibras CDN fonts
  'font-src': [
    "'self'",
    'data:',
    'https://cdn.jsdelivr.net', // VLibras fonts from jsdelivr CDN
    'https://vlibras.gov.br', // VLibras fonts
    'https://*.vlibras.gov.br', // VLibras subdomains
  ],

  // Connect: API endpoints, analytics, and VLibras
  'connect-src': [
    "'self'",
    'https://cidadao-api-production.up.railway.app',
    'https://cidadao-api-production.up.railway.app',
    'https://pbsiyuattnwgohvkkkks.supabase.co',
    'https://vercel.live',
    'https://*.vercel-insights.com',
    'https://www.google-analytics.com',
    'https://*.sentry.io',
    'https://vlibras.gov.br', // VLibras API
    'https://*.vlibras.gov.br', // VLibras subdomains
    'https://cdn.jsdelivr.net', // VLibras plugin from jsdelivr CDN
    'https://us.i.posthog.com', // PostHog events
    'https://us-assets.i.posthog.com', // PostHog assets
    'https://app.posthog.com', // PostHog app
  ],

  // Media: Allow self-hosted and VLibras media (videos, audio for LIBRAS)
  'media-src': [
    "'self'",
    'https://vlibras.gov.br', // VLibras media
    'https://*.vlibras.gov.br', // VLibras subdomains
    'https://cdn.jsdelivr.net', // VLibras media from jsdelivr CDN
  ],

  // Objects: Disallow plugins
  'object-src': ["'none'"],

  // Base URI: Restrict to self
  'base-uri': ["'self'"],

  // Forms: Allow self only
  'form-action': ["'self'"],

  // Frame sources: Allow Spotify embeds and VLibras
  'frame-src': [
    "'self'",
    'https://open.spotify.com',
    'https://vlibras.gov.br', // VLibras widget iframe
    'https://*.vlibras.gov.br', // VLibras subdomains
  ],

  // Frame ancestors: Prevent clickjacking
  'frame-ancestors': ["'none'"],

  // Worker sources: Allow Web Workers for VLibras
  'worker-src': [
    "'self'",
    'blob:', // Required for VLibras Web Workers
    'https://vlibras.gov.br',
    'https://*.vlibras.gov.br',
  ],

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
    'blob:', // For VLibras and other blob scripts
    'https://vercel.live',
  ],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': [
    "'self'",
    'https://cidadao-api-production.up.railway.app',
    'https://cidadao-api-production.up.railway.app',
    'https://pbsiyuattnwgohvkkkks.supabase.co',
    'http://localhost:*',
    'ws://localhost:*',
    'wss://localhost:*',
    'https://vercel.live',
  ],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-src': ["'self'", 'https://open.spotify.com'],
  'frame-ancestors': ["'none'"],
  'worker-src': ["'self'", 'blob:', 'https:'], // Permissive for development
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
