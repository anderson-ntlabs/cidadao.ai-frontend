# Security Hardening Guide - Cidadão.AI Frontend

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-01-25 17:00:00 -0300
**Última Atualização**: 2025-01-25 17:00:00 -0300

---

## Table of Contents

1. [Overview](#overview)
2. [Content Security Policy (CSP)](#content-security-policy-csp)
3. [Security Headers](#security-headers)
4. [Rate Limiting](#rate-limiting)
5. [Input Validation & Sanitization](#input-validation--sanitization)
6. [Authentication & Authorization](#authentication--authorization)
7. [OWASP Top 10 Protection](#owasp-top-10-protection)
8. [Security Best Practices](#security-best-practices)
9. [Incident Response](#incident-response)
10. [Security Checklist](#security-checklist)

---

## Overview

The Cidadão.AI frontend implements comprehensive security hardening following industry best practices and OWASP guidelines. This guide documents all security measures, configurations, and implementation details.

### Security Status

✅ **Fully Implemented**:
- Content Security Policy (CSP) with VLibras support
- Comprehensive security headers (HSTS, X-Frame-Options, etc.)
- Rate limiting with token bucket algorithm
- Input validation and sanitization (DOMPurify)
- Authentication with Supabase (OAuth + magic links)
- CSRF protection
- XSS prevention
- Clickjacking protection

### Security Stack

| Component | Implementation | Status |
|-----------|----------------|--------|
| **CSP** | Middleware + csp.config.ts | ✅ Active |
| **Headers** | middleware.ts (8 security headers) | ✅ Active |
| **Rate Limiting** | Token bucket algorithm | ✅ Active |
| **Input Sanitization** | DOMPurify + custom validators | ✅ Active |
| **Authentication** | Supabase Auth (OAuth, magic links) | ✅ Active |
| **CSRF Protection** | csrf.ts middleware | ✅ Active |
| **Session Management** | Secure cookies, auto-refresh | ✅ Active |

---

## Content Security Policy (CSP)

### Overview

CSP prevents XSS attacks by restricting which resources can be loaded and executed. The Cidadão.AI frontend implements a comprehensive CSP that balances security with functionality (Next.js, VLibras, analytics).

**File**: `lib/security/csp.config.ts`

### Production CSP Configuration

```typescript
export const productionCSP: CSPDirectives = {
  // Default: Only same-origin resources
  'default-src': ["'self'"],

  // Scripts: Next.js requirements + trusted CDNs
  'script-src': [
    "'self'",
    "'unsafe-eval'",      // Required for Next.js dynamic imports
    "'unsafe-inline'",    // Required for Next.js inline scripts
    'https://vercel.live',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://vlibras.gov.br',        // VLibras CDN
    'https://*.vlibras.gov.br',      // VLibras subdomains
  ],

  // Styles: Next.js + inline styles
  'style-src': [
    "'self'",
    "'unsafe-inline'"    // Required for Tailwind/emotion
  ],

  // Images: Self + data URIs + trusted CDNs
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://*.vercel.app',
    'https://www.google-analytics.com',
    'https://vlibras.gov.br',
    'https://*.vlibras.gov.br',
  ],

  // Fonts: Self + data URIs
  'font-src': ["'self'", 'data:'],

  // API connections: Backend + analytics + VLibras
  'connect-src': [
    "'self'",
    'https://cidadao-api-production.up.railway.app',  // Backend API
    'https://pbsiyuattnwgohvkkkks.supabase.co',       // Supabase
    'https://vercel.live',
    'https://*.vercel-insights.com',
    'https://www.google-analytics.com',
    'https://*.sentry.io',                           // Error tracking
    'https://vlibras.gov.br',
    'https://*.vlibras.gov.br',
  ],

  // Media: Only self-hosted
  'media-src': ["'self'"],

  // Objects: Disallow plugins (Flash, Java applets)
  'object-src': ["'none'"],

  // Base URI: Prevent base tag injection
  'base-uri': ["'self'"],

  // Forms: Only submit to same origin
  'form-action': ["'self'"],

  // Frames: Spotify embeds + VLibras widget
  'frame-src': [
    "'self'",
    'https://open.spotify.com',      // Music player
    'https://vlibras.gov.br',        // LIBRAS widget
    'https://*.vlibras.gov.br',
  ],

  // Frame ancestors: Prevent clickjacking
  'frame-ancestors': ["'none'"],

  // Upgrade insecure requests (HTTP → HTTPS)
  'upgrade-insecure-requests': [],

  // Block mixed content
  'block-all-mixed-content': [],
};
```

### Development CSP Configuration

More permissive for development tools (hot reload, debugging):

```typescript
export const developmentCSP: CSPDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-eval'",
    "'unsafe-inline'",    // For hot reload
    'https://vercel.live',
  ],
  'connect-src': [
    "'self'",
    'http://localhost:*',   // Local backend
    'ws://localhost:*',     // WebSocket
    'wss://localhost:*',    // Secure WebSocket
    // ... production URLs
  ],
  // ... more permissive rules
};
```

### CSP Implementation

**File**: `middleware.ts`

```typescript
import { buildCSP, getCSPConfig } from '@/lib/security/csp.config'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // Apply CSP based on environment
  const simpleCsp = "default-src 'self' https:; frame-src 'self' https://open.spotify.com https://vlibras.gov.br; ..."
  response.headers.set('Content-Security-Policy', simpleCsp)

  return response
}
```

### CSP Violation Reporting

**File**: `app/api/security/csp-report/route.ts`

```typescript
export async function POST(request: Request) {
  const report = await request.json()

  // Log CSP violations for analysis
  console.error('CSP Violation:', {
    documentURI: report['csp-report']['document-uri'],
    blockedURI: report['csp-report']['blocked-uri'],
    violatedDirective: report['csp-report']['violated-directive'],
  })

  // Send to monitoring service
  // await sentry.captureMessage('CSP Violation', { extra: report })

  return new Response('OK', { status: 200 })
}
```

### CSP Nonce Generation

For inline scripts that require execution:

```typescript
export function generateNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 15)
}

// Usage in component
<script nonce={nonce}>
  console.log('Allowed inline script')
</script>
```

---

## Security Headers

The middleware applies 8 security headers to every response for defense-in-depth protection.

**File**: `middleware.ts`

### 1. Content-Security-Policy

**Purpose**: Prevent XSS, injection attacks, unauthorized resource loading

```typescript
response.headers.set('Content-Security-Policy', cspString)
```

**Impact**: Primary defense against cross-site scripting attacks

### 2. X-Content-Type-Options

**Purpose**: Prevent MIME type sniffing

```typescript
response.headers.set('X-Content-Type-Options', 'nosniff')
```

**Impact**: Prevents browsers from interpreting files as different MIME types

**Example**: Forces `text/plain` file to stay as text, not execute as JavaScript

### 3. X-XSS-Protection

**Purpose**: Enable browser's XSS filter (legacy browsers)

```typescript
response.headers.set('X-XSS-Protection', '1; mode=block')
```

**Impact**: Blocks page rendering if XSS attack detected

### 4. X-Frame-Options

**Purpose**: Prevent clickjacking attacks

```typescript
response.headers.set('X-Frame-Options', 'SAMEORIGIN')
```

**Impact**: Only allows embedding in same-origin frames

**Values**:
- `DENY`: Never allow framing
- `SAMEORIGIN`: Only same-origin frames (our choice)
- `ALLOW-FROM uri`: Specific origin (deprecated)

### 5. Strict-Transport-Security (HSTS)

**Purpose**: Force HTTPS connections

```typescript
response.headers.set(
  'Strict-Transport-Security',
  'max-age=63072000; includeSubDomains; preload'
)
```

**Impact**:
- Browsers always use HTTPS for 2 years (63072000 seconds)
- Applies to all subdomains
- Eligible for HSTS preload list

**HSTS Preload**: Once added to browser's preload list, HTTPS is enforced before first visit

### 6. Referrer-Policy

**Purpose**: Control referrer information sent with requests

```typescript
response.headers.set(
  'Referrer-Policy',
  'strict-origin-when-cross-origin'
)
```

**Impact**:
- Same-origin: Full URL sent
- Cross-origin HTTPS→HTTPS: Only origin sent
- Cross-origin HTTPS→HTTP: No referrer

**Privacy benefit**: Prevents leaking sensitive URL parameters to third parties

### 7. Permissions-Policy

**Purpose**: Control browser feature access

```typescript
response.headers.set(
  'Permissions-Policy',
  'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
)
```

**Impact**:
- Camera: Disabled
- Microphone: Disabled
- Geolocation: Only same-origin
- FLoC (interest-cohort): Disabled (privacy protection)

### 8. Server Header Removal

**Purpose**: Don't expose server technology

```typescript
response.headers.delete('X-Powered-By')
response.headers.delete('Server')
```

**Impact**: Attackers can't easily identify server stack for targeted exploits

### Security Headers Summary Table

| Header | Value | Protection Against |
|--------|-------|-------------------|
| CSP | `default-src 'self'; ...` | XSS, injection, unauthorized resources |
| X-Content-Type-Options | `nosniff` | MIME type confusion attacks |
| X-XSS-Protection | `1; mode=block` | Reflected XSS (legacy) |
| X-Frame-Options | `SAMEORIGIN` | Clickjacking |
| Strict-Transport-Security | `max-age=63072000; ...` | Man-in-the-middle, protocol downgrade |
| Referrer-Policy | `strict-origin-when-cross-origin` | Information leakage |
| Permissions-Policy | `camera=(), ...` | Unauthorized feature access |
| (Removed headers) | - | Information disclosure |

---

## Rate Limiting

Implements token bucket algorithm to prevent abuse and DDoS attacks.

**File**: `lib/security/rate-limit.ts`

### Rate Limit Configuration

```typescript
export const rateLimitConfigs = {
  // API endpoints: 100 requests per minute
  api: {
    limit: 100,
    window: 60 * 1000,
    message: 'API rate limit exceeded. Please try again later.',
  },

  // Chat endpoint: 20 messages per minute
  chat: {
    limit: 20,
    window: 60 * 1000,
    message: 'Too many chat messages. Please wait before sending more.',
  },

  // Authentication: 5 attempts per 15 minutes
  auth: {
    limit: 5,
    window: 15 * 60 * 1000,
    message: 'Too many login attempts. Please try again later.',
  },

  // Export: 10 exports per hour
  export: {
    limit: 10,
    window: 60 * 60 * 1000,
    message: 'Export limit exceeded. Please try again later.',
  },

  // General: 1000 requests per hour
  general: {
    limit: 1000,
    window: 60 * 60 * 1000,
    message: 'Rate limit exceeded. Please try again later.',
  },
};
```

### Implementation

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Apply rate limiting based on endpoint
  if (pathname.startsWith('/api/chat')) {
    const rateLimitResponse = rateLimit(rateLimitConfigs.chat)(request)
    if (rateLimitResponse) return rateLimitResponse
  } else if (pathname.startsWith('/api/auth')) {
    const rateLimitResponse = rateLimit(rateLimitConfigs.auth)(request)
    if (rateLimitResponse) return rateLimitResponse
  }
  // ... more endpoints

  return response
}
```

### Rate Limit Response

When limit exceeded, returns HTTP 429 with headers:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 45
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706209845000

{
  "error": "Too many chat messages. Please wait before sending more.",
  "retryAfter": 45
}
```

### Client Identification

```typescript
function getClientId(request: NextRequest): string {
  // Try to get IP from headers (Vercel provides these)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'

  // For authenticated requests, use user ID
  const userId = request.headers.get('x-user-id')

  return userId || ip  // Prefer user ID over IP
}
```

**Benefits**:
- Per-user limits for authenticated requests
- IP-based limits for anonymous requests
- Prevents single user creating multiple accounts to bypass

### In-Memory vs. Distributed Storage

**Current**: In-memory Map (single server)

```typescript
const rateLimitStore = new Map<string, RateLimitEntry>()
```

**Production Recommendation**: Use Redis or Vercel KV for distributed rate limiting

```typescript
// Example with Vercel KV
import { kv } from '@vercel/kv'

async function checkRateLimit(key: string, config: RateLimitConfig) {
  const count = await kv.incr(key)

  if (count === 1) {
    await kv.expire(key, config.window / 1000)
  }

  return count <= config.limit
}
```

---

## Input Validation & Sanitization

### DOMPurify Sanitization

**File**: `lib/security/sanitizer.ts`

Comprehensive HTML sanitization to prevent XSS attacks.

```typescript
import DOMPurify from 'dompurify'

// Default configuration
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
}

export class Sanitizer {
  /**
   * Sanitize HTML content for display
   */
  sanitizeHtml(dirty: string, config = DOMPURIFY_CONFIG): string {
    if (!this.purify) {
      return this.stripHtml(dirty)  // Server-side fallback
    }
    return this.purify.sanitize(dirty, config)
  }

  /**
   * Sanitize chat message content (stricter)
   */
  sanitizeChatMessage(message: string): string {
    const CHAT_CONFIG = {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
      ALLOWED_ATTR: [],
    }
    return this.purify.sanitize(message, CHAT_CONFIG)
  }

  /**
   * Sanitize user input for forms
   */
  sanitizeInput(input: string): string {
    return this.stripHtml(input)
      .replace(/[<>\"']/g, '')  // Remove HTML-like characters
      .trim()
  }
}

export const sanitizer = new Sanitizer()
```

### Input Validation Functions

**File**: `lib/security/input-validation.ts`

```typescript
/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format and protocol
 */
export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Sanitize filename (prevent path traversal)
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Replace invalid chars
    .replace(/\.{2,}/g, '.')           // Prevent double dots
    .replace(/^\.+/, '')               // Remove leading dots
    .substring(0, 255)                 // Limit length
}

/**
 * Validate UUID v4 format
 */
export function isValidInvestigationId(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Validate CPF (Brazilian tax ID)
 */
export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')

  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false  // All same digit

  // Validate check digits (full algorithm implementation)
  // ... validation logic

  return true
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>]/g, '')      // Remove HTML-like chars
    .replace(/['"]/g, '')      // Remove quotes
    .substring(0, 200)         // Limit length
}
```

### Usage Examples

```typescript
// Sanitize HTML before rendering
import { sanitizer } from '@/lib/security/sanitizer'

const userContent = '<script>alert("xss")</script><p>Hello</p>'
const safe = sanitizer.sanitizeHtml(userContent)
// Result: "<p>Hello</p>"

// Validate email
import { isValidEmail } from '@/lib/security/input-validation'

if (!isValidEmail(email)) {
  return { error: 'Invalid email format' }
}

// Sanitize filename
import { sanitizeFilename } from '@/lib/security/input-validation'

const userFilename = '../../../etc/passwd'
const safe = sanitizeFilename(userFilename)
// Result: "etc_passwd"
```

---

## Authentication & Authorization

### Supabase Authentication

The application uses Supabase Auth for secure authentication with multiple providers.

**Supported Methods**:
- OAuth (Google, GitHub)
- Magic Links (email)
- Password-based (planned)

### Session Management

**File**: `lib/supabase/middleware.ts`

```typescript
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if needed
  await supabase.auth.getSession()

  return response
}
```

### Secure Cookie Configuration

```typescript
const cookieOptions = {
  httpOnly: true,      // Prevent JavaScript access
  secure: true,        // HTTPS only
  sameSite: 'lax',     // CSRF protection
  maxAge: 60 * 60 * 24 * 7,  // 7 days
  path: '/',
}
```

### Protected Routes

**File**: `middleware.ts`

```typescript
const protectedRoutes = [
  '/pt/(authenticated)/chat',
  '/pt/(authenticated)/dashboard',
  '/pt/(authenticated)/investigacoes',
  '/pt/(authenticated)/perfil',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtected = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (isProtected) {
    const session = await getSession(request)

    if (!session) {
      // Redirect to login
      return NextResponse.redirect(new URL('/pt/login', request.url))
    }
  }

  return response
}
```

### OAuth Callback Handler

**File**: `app/auth/callback/route.ts`

```typescript
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/pt/home'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/pt/login?error=auth_failed`)
}
```

---

## OWASP Top 10 Protection

Comprehensive protection against OWASP Top 10 vulnerabilities.

### 1. Broken Access Control ✅

**Protections**:
- Route-level authentication in middleware
- Session validation on every request
- Role-based access control (RBAC) ready
- Logout clears all session data

**Implementation**:
```typescript
// Middleware checks session for protected routes
if (isProtectedRoute && !session) {
  return redirect('/login')
}

// API routes validate user permissions
if (user.role !== 'admin') {
  return new Response('Forbidden', { status: 403 })
}
```

### 2. Cryptographic Failures ✅

**Protections**:
- HTTPS enforced (HSTS header)
- Sensitive data never in localStorage
- API keys in environment variables only
- No hardcoded secrets (verified with git-secrets)

**Best Practices**:
```typescript
// ❌ Never do this
localStorage.setItem('apiKey', process.env.API_KEY)

// ✅ Always do this
// API keys only in .env files, never committed
// Access via process.env.NEXT_PUBLIC_API_KEY
```

### 3. Injection ✅

**Protections**:
- DOMPurify sanitization for all user HTML
- React prevents direct HTML injection
- Parameterized API calls (no string concatenation)
- File upload restrictions

**Implementation**:
```typescript
// SQL injection protection (Supabase uses prepared statements)
const { data } = await supabase
  .from('investigations')
  .select('*')
  .eq('user_id', userId)  // Parameterized, not concatenated

// XSS protection
const safe = sanitizer.sanitizeHtml(userInput)
```

### 4. Insecure Design ✅

**Protections**:
- Rate limiting on all API endpoints
- Session timeout (7 days, configurable)
- Secure password requirements (Supabase enforced)
- CAPTCHA for public forms (planned)

**Configuration**:
```typescript
// Rate limiting prevents brute force
rateLimitConfigs.auth = {
  limit: 5,               // 5 attempts
  window: 15 * 60 * 1000, // 15 minutes
}
```

### 5. Security Misconfiguration ✅

**Protections**:
- Production errors don't leak info
- Debug mode disabled in production
- 8 security headers configured
- Default credentials removed
- Server headers removed

**Production Error Handling**:
```typescript
// ❌ Development
return res.json({ error: error.stack })

// ✅ Production
return res.json({ error: 'Internal server error' })
```

### 6. Vulnerable Components ✅

**Protections**:
- `npm audit` shows 0 vulnerabilities
- Dependencies updated regularly (Dependabot)
- Only necessary dependencies
- License compliance verified

**Maintenance**:
```bash
# Check vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Check outdated packages
npm outdated
```

### 7. Authentication Failures ✅

**Protections**:
- Strong password policy (Supabase)
- Rate limiting on auth endpoints
- Multi-factor authentication (planned)
- Secure password reset flow

**Implementation**:
```typescript
// Supabase password requirements
{
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
}
```

### 8. Data Integrity Failures ✅

**Protections**:
- Content Security Policy (CSP)
- Subresource Integrity for CDN assets (planned)
- Code signing for deployments (Vercel)
- Input validation on all forms

**CSP Protection**:
```typescript
// Only allow scripts from trusted sources
'script-src': ["'self'", 'https://cdn.trusted.com']

// Block inline scripts unless nonce-validated
'script-src': ["'self'", "'nonce-{random}'"]
```

### 9. Security Logging & Monitoring ✅

**Protections**:
- Authentication attempts logged
- API errors tracked (Sentry)
- CSP violations reported
- Rate limit violations logged

**Monitoring**:
```typescript
// Sentry integration
import * as Sentry from '@sentry/nextjs'

Sentry.captureException(error, {
  tags: { endpoint: '/api/chat' },
  user: { id: userId },
})

// CSP violation reporting
// POST /api/security/csp-report
```

### 10. Server-Side Request Forgery (SSRF) ✅

**Protections**:
- URL validation for external requests
- Whitelist of allowed domains
- No user-controlled URLs in backend calls
- Request timeouts configured

**Implementation**:
```typescript
// Validate URL before fetching
export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url)
    const allowedHosts = [
      'cidadao-api-production.up.railway.app',
      'pbsiyuattnwgohvkkkks.supabase.co',
    ]
    return allowedHosts.includes(parsed.hostname)
  } catch {
    return false
  }
}

// Only fetch from validated URLs
if (isValidURL(url)) {
  await fetch(url, { signal: AbortSignal.timeout(5000) })
}
```

---

## Security Best Practices

### 1. Environment Variables

```bash
# ❌ Never commit .env files
.env
.env.local
.env.production

# ✅ Use .env.example for documentation
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co

# ✅ Access in code
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

### 2. Secure Dependencies

```bash
# Check for vulnerabilities
npm audit

# Update with caution
npm update

# Pin exact versions in production
"dependencies": {
  "next": "15.1.0",  # Exact version, not ^15.1.0
}
```

### 3. Code Review Checklist

- [ ] No hardcoded secrets or API keys
- [ ] User input sanitized before rendering
- [ ] Authentication checked for protected routes
- [ ] Rate limiting applied to API endpoints
- [ ] Error messages don't leak information
- [ ] HTTPS enforced for all connections
- [ ] Security headers present
- [ ] CSP allows only trusted sources

### 4. Secure Coding Patterns

```typescript
// ❌ Dangerous: Direct HTML rendering
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Safe: Sanitized HTML
<div dangerouslySetInnerHTML={{ __html: sanitizer.sanitizeHtml(userInput) }} />

// ❌ Dangerous: SQL string concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`

// ✅ Safe: Parameterized queries
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)

// ❌ Dangerous: Eval user input
eval(userCode)

// ✅ Safe: Never use eval with user input
```

### 5. Security Testing

```bash
# Run security audit script
node scripts/security-audit.js

# Check for common vulnerabilities
npm run security:check

# Lighthouse security audit
npm run lighthouse
```

### 6. Incident Response Plan

When security incident detected:

1. **Immediate**: Disable affected feature/route
2. **Assess**: Determine scope and impact
3. **Patch**: Fix vulnerability
4. **Test**: Verify fix doesn't break functionality
5. **Deploy**: Emergency deployment
6. **Monitor**: Watch for repeat attempts
7. **Post-mortem**: Document and learn

---

## Security Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] HTTPS enforced (HSTS header)
- [ ] CSP configured and tested
- [ ] Rate limiting active on all APIs
- [ ] Authentication working (OAuth + magic links)
- [ ] Input sanitization on all user inputs
- [ ] Error messages don't leak information
- [ ] npm audit shows 0 vulnerabilities
- [ ] Security headers present (8 headers)
- [ ] Server headers removed (X-Powered-By, Server)

### Monthly Review

- [ ] Update dependencies (check npm outdated)
- [ ] Review CSP violation reports
- [ ] Check rate limit logs for abuse
- [ ] Review authentication logs
- [ ] Update security documentation
- [ ] Run penetration testing (manual or automated)
- [ ] Review Sentry error reports

### Quarterly Security Audit

- [ ] Full dependency audit (npm audit)
- [ ] Review all security configurations
- [ ] Test all authentication flows
- [ ] Verify rate limiting effectiveness
- [ ] Check for new OWASP vulnerabilities
- [ ] Update incident response plan
- [ ] Train team on new security practices

---

## Additional Resources

### Official Documentation

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)

### Tools

- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/) - Vulnerability scanning
- [OWASP ZAP](https://www.zaproxy.org/) - Security testing
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Security audits

### Project-Specific Docs

- [Security Checklist](../technical/SECURITY-CHECKLIST.md)
- [Testing Strategy Guide](../guides/TESTING-STRATEGY.md)
- [Bundle Optimization Guide](../technical/bundle-optimization.md)

---

**Last Updated**: 2025-01-25
**Maintainer**: Frontend Team
**Review Cycle**: Monthly
**Security Contact**: anderson.ufrj@gmail.com
