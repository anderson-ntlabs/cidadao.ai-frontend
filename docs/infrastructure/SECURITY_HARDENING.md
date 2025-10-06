# Security Hardening Guide

---

**Documento**: Guia de Segurança e Hardening
**Projeto**: Cidadão.AI - Frontend
**Autor**: Anderson Henrique da Silva
**Data**: 2025-10-04 13:22:40 -03 (Horário de Brasília)
**Localização**: Minas Gerais, Brasil
**Categoria**: Infrastructure Guide / Security
**Última Atualização**: 2025-10-04

---

Complete guide for security hardening of Cidadão.AI Frontend.

## Overview

This guide covers comprehensive security measures implemented to protect against common web vulnerabilities:
- **XSS** (Cross-Site Scripting)
- **CSRF** (Cross-Site Request Forgery)
- **Injection Attacks**
- **Clickjacking**
- **Data Exposure**
- **Rate Limiting & DDoS**

## Security Headers

### Content Security Policy (CSP)

Implemented in `middleware.ts` and configured in `lib/security/csp.config.ts`.

#### Production CSP Directives

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-eval' https://vercel.live https://*.google-analytics.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.vercel.app;
  connect-src 'self' https://neural-thinker-cidadao-ai-backend.hf.space;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
  block-all-mixed-content;
```

#### CSP Violation Reporting

Violations are reported to `/api/security/csp-report` and logged to Sentry in production.

**Test CSP:**
```bash
# Check CSP headers
curl -I https://your-domain.vercel.app

# Verify CSP-Report-Only mode (for testing)
curl -I https://your-domain.vercel.app | grep Content-Security-Policy
```

### Security Headers Implementation

All headers are set in `middleware.ts`:

```typescript
// XSS Protection
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block

// Clickjacking Protection
X-Frame-Options: SAMEORIGIN

// HTTPS Enforcement
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload

// Referrer Policy
Referrer-Policy: strict-origin-when-cross-origin

// Permissions Policy
Permissions-Policy: camera=(), microphone=(), geolocation=(self), interest-cohort=()
```

**Verify headers:**
```bash
curl -I https://your-domain.vercel.app | grep -E "X-|Strict-Transport|Referrer|Permissions"
```

## Rate Limiting

### Implementation

Rate limiting is implemented in `lib/security/rate-limit.ts` using token bucket algorithm.

### Rate Limit Configurations

| Endpoint Type | Limit | Window | Message |
|--------------|-------|--------|---------|
| Chat API | 20 requests | 1 minute | Too many chat messages |
| Authentication | 5 attempts | 15 minutes | Too many login attempts |
| Export | 10 exports | 1 hour | Export limit exceeded |
| General API | 100 requests | 1 minute | API rate limit exceeded |
| General | 1000 requests | 1 hour | Rate limit exceeded |

### Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200000
```

### Testing Rate Limits

```bash
# Test chat endpoint rate limit (20/min)
for i in {1..25}; do
  curl -X POST https://your-domain.vercel.app/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "test"}' &
done

# Should see 429 errors after 20 requests
```

### Production Considerations

**Important:** The current implementation uses in-memory storage. For production with multiple edge instances:

1. **Migrate to Vercel KV**:
```typescript
import { kv } from '@vercel/kv';

async function checkRateLimit(clientId: string, config: RateLimitConfig) {
  const key = `ratelimit:${clientId}:${pathname}`;
  const count = await kv.incr(key);

  if (count === 1) {
    await kv.expire(key, config.window / 1000);
  }

  return count <= config.limit;
}
```

2. **Or use Upstash Rate Limit**:
```bash
npm install @upstash/ratelimit
```

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

## Input Validation & Sanitization

### Validation Functions

All input validation is in `lib/security/input-validation.ts`.

#### Available Validators

```typescript
import {
  sanitizeHTML,
  isValidEmail,
  isValidURL,
  sanitizeFilename,
  isValidCPF,
  isValidCNPJ,
  isValidAmount,
  isValidDate,
  isValidAgentId,
  InputValidator,
} from '@/lib/security/input-validation';
```

#### Usage Examples

**1. Sanitize User Input:**
```typescript
import { sanitizeHTML, sanitizeSearchQuery } from '@/lib/security/input-validation';

// Sanitize HTML to prevent XSS
const safeHTML = sanitizeHTML(userInput);

// Sanitize search query
const safeQuery = sanitizeSearchQuery(searchTerm);
```

**2. Validate Forms:**
```typescript
import { InputValidator } from '@/lib/security/input-validation';

const validator = new InputValidator();

validator
  .required('email', email)
  .email('email', email)
  .required('cpf', cpf)
  .custom('cpf', () => isValidCPF(cpf), 'Invalid CPF format')
  .length('message', message, 1, 1000);

if (!validator.isValid()) {
  const errors = validator.getErrors();
  // { email: 'email is required', cpf: 'Invalid CPF format' }
}
```

**3. Validate API Parameters:**
```typescript
import { validatePagination, validateSort } from '@/lib/security/input-validation';

// Validate pagination (max 100 per page)
const { page, limit } = validatePagination({
  page: request.query.page,
  limit: request.query.limit,
});

// Validate sort parameters
const { field, order } = validateSort(
  request.query.sort || 'createdAt:desc',
  ['createdAt', 'updatedAt', 'name']
);
```

**4. Validate Brazilian Documents:**
```typescript
import { isValidCPF, isValidCNPJ } from '@/lib/security/input-validation';

if (!isValidCPF(cpf)) {
  throw new Error('Invalid CPF');
}

if (!isValidCNPJ(cnpj)) {
  throw new Error('Invalid CNPJ');
}
```

### API Route Validation Pattern

**Standard pattern for API routes:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { InputValidator, sanitizeSearchQuery } from '@/lib/security/input-validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validator = new InputValidator();
    validator
      .required('message', body.message)
      .length('message', body.message, 1, 5000)
      .required('agentId', body.agentId)
      .custom(
        'agentId',
        () => isValidAgentId(body.agentId),
        'Invalid agent ID'
      );

    if (!validator.isValid()) {
      return NextResponse.json(
        { errors: validator.getErrors() },
        { status: 400 }
      );
    }

    // Sanitize input
    const safeMessage = sanitizeHTML(body.message);

    // Process request
    // ...

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
```

## CSRF Protection

### Implementation

CSRF protection is implemented in `lib/security/csrf.ts` using double-submit cookie pattern.

### How It Works

1. **Server generates CSRF token** on first request
2. **Token stored in HTTP-only cookie** (`csrf_token`)
3. **Client includes token in header** (`x-csrf-token`) for state-changing requests
4. **Server verifies** cookie token matches header token

### Integration

**Add to middleware.ts:**
```typescript
import { csrfProtection, initializeCSRFToken } from '@/lib/security/csrf';

export async function middleware(request: NextRequest) {
  // CSRF protection for state-changing methods
  const csrfResponse = csrfProtection(request);
  if (csrfResponse) return csrfResponse;

  // ... rest of middleware

  // Initialize CSRF token for new sessions
  return initializeCSRFToken(request, response);
}
```

### Client-Side Usage

**Fetch CSRF token:**
```typescript
// Token is automatically available in cookie
// Frontend must send it in header

async function makeRequest() {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf_token='))
    ?.split('=')[1];

  const response = await fetch('/api/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken || '',
    },
    body: JSON.stringify({ data: 'value' }),
  });
}
```

**Better: Use custom hook:**
```typescript
// hooks/use-csrf.ts
export function useCSRF() {
  const getToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('csrf_token='))
      ?.split('=')[1];
  };

  const fetchWithCSRF = async (url: string, options: RequestInit = {}) => {
    const token = getToken();

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'x-csrf-token': token || '',
      },
    });
  };

  return { getToken, fetchWithCSRF };
}

// Usage in component
const { fetchWithCSRF } = useCSRF();

await fetchWithCSRF('/api/data', {
  method: 'POST',
  body: JSON.stringify({ data }),
});
```

## Environment Variable Security

### Secure Variable Management

**Never commit sensitive values:**
```bash
# .env.local (gitignored)
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET_KEY=your-secret-key
SENTRY_AUTH_TOKEN=your-sentry-token
```

**Use Vercel environment variables:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add variables for Production, Preview, Development
3. Mark sensitive variables as "Sensitive" (encrypted, not visible in logs)

### Environment Variable Prefixes

- `NEXT_PUBLIC_*`: Exposed to browser (use for non-sensitive config)
- No prefix: Server-only (secure secrets, API keys)

**Example:**
```bash
# Browser-accessible
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_GA_ID=GA-XXXXXX

# Server-only (secure)
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=xxx
GROQ_API_KEY=xxx
```

## Dependency Security

### Automated Scanning

**GitHub Dependabot:**
1. Enabled by default in GitHub
2. Automatically creates PRs for dependency updates
3. Includes security vulnerability fixes

**Manual audit:**
```bash
# Run npm audit
npm audit

# Fix automatically fixable issues
npm audit fix

# Force fix (may have breaking changes)
npm audit fix --force

# View detailed report
npm audit --json > audit-report.json
```

### Production Dependencies Only

**Before deployment:**
```bash
# Install production dependencies only
npm ci --production

# Or in Vercel
# Automatically installs production deps only
```

### Lock File Integrity

**Always commit package-lock.json:**
- Ensures reproducible builds
- Locks dependency versions
- Prevents supply chain attacks

```bash
# Verify integrity
npm ci

# Update lock file
npm install
git add package-lock.json
git commit -m "chore: update dependency lock file"
```

## Security Best Practices

### 1. Authentication & Authorization

**Use Supabase Auth:**
```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Check auth status
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  redirect('/login');
}

// Verify roles
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile?.role !== 'admin') {
  throw new Error('Unauthorized');
}
```

### 2. Data Sanitization

**Always sanitize before rendering:**
```typescript
import { sanitizeHTML } from '@/lib/security/input-validation';

// Bad - vulnerable to XSS
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// Good - sanitized
<div dangerouslySetInnerHTML={{ __html: sanitizeHTML(userInput) }} />

// Better - avoid dangerouslySetInnerHTML entirely
<div>{userInput}</div>
```

### 3. Secure API Routes

**Pattern for secure API routes:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, rateLimitConfigs } from '@/lib/security/rate-limit';
import { InputValidator } from '@/lib/security/input-validation';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  // 1. Rate limiting
  const rateLimitResponse = rateLimit(rateLimitConfigs.api)(request);
  if (rateLimitResponse) return rateLimitResponse;

  // 2. Authentication
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Input validation
  const body = await request.json();
  const validator = new InputValidator();

  validator
    .required('data', body.data)
    .length('data', body.data, 1, 1000);

  if (!validator.isValid()) {
    return NextResponse.json(
      { errors: validator.getErrors() },
      { status: 400 }
    );
  }

  // 4. Authorization
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 5. Process request
  try {
    // ...
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 4. Secure Cookies

**Cookie security settings:**
```typescript
response.cookies.set('session', token, {
  httpOnly: true,        // Prevent JavaScript access
  secure: true,          // HTTPS only
  sameSite: 'strict',    // CSRF protection
  path: '/',
  maxAge: 60 * 60 * 24,  // 24 hours
});
```

### 5. Error Handling

**Never expose internal errors:**
```typescript
// Bad - exposes internal details
catch (error) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}

// Good - generic error + logging
catch (error) {
  console.error('Internal error:', error);
  captureException(error as Error);

  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}
```

## Security Testing

### Manual Security Tests

**1. XSS Testing:**
```bash
# Test input sanitization
curl -X POST https://your-domain.vercel.app/api/data \
  -H "Content-Type: application/json" \
  -d '{"message": "<script>alert(1)</script>"}'

# Verify output is sanitized
```

**2. CSRF Testing:**
```bash
# Try request without CSRF token
curl -X POST https://your-domain.vercel.app/api/data \
  -H "Content-Type: application/json" \
  -d '{"data": "test"}'

# Should return 403 Forbidden
```

**3. Rate Limit Testing:**
```bash
# Spam endpoint
for i in {1..150}; do
  curl https://your-domain.vercel.app/api/test &
done

# Should see 429 errors after limit
```

**4. CSP Testing:**
```bash
# Check CSP headers
curl -I https://your-domain.vercel.app

# Verify Content-Security-Policy header
```

### Automated Security Scanning

**1. OWASP ZAP (Zed Attack Proxy):**
```bash
# Run automated scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://your-domain.vercel.app

# Generate report
docker run -v $(pwd):/zap/wrk:rw -t owasp/zap2docker-stable \
  zap-full-scan.py -t https://your-domain.vercel.app \
  -r security-report.html
```

**2. npm audit:**
```bash
# Check for known vulnerabilities
npm audit

# Generate JSON report
npm audit --json > security-audit.json
```

**3. Snyk:**
```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Test for vulnerabilities
snyk test

# Monitor project
snyk monitor
```

## Security Incident Response

### Detection

**Monitor for:**
- Multiple failed authentication attempts
- Rate limit violations
- CSP violations
- Unusual traffic patterns
- Database query errors

**Sentry alerts configured for:**
- Error rate > 1%
- Multiple 403/429 responses
- CSP violation reports

### Response Procedure

**1. Identify:**
- Check Sentry for error details
- Review server logs
- Analyze affected endpoints

**2. Contain:**
- Block malicious IPs via Vercel firewall
- Disable compromised endpoints if needed
- Rotate compromised secrets immediately

**3. Eradicate:**
- Patch vulnerabilities
- Deploy security fixes
- Update dependencies

**4. Recover:**
- Verify fix in staging
- Deploy to production
- Monitor for recurrence

**5. Document:**
- Create incident report
- Update security measures
- Conduct post-mortem

## Security Checklist

### Pre-Deployment

- [ ] All dependencies audited (`npm audit`)
- [ ] Environment variables secured (Vercel dashboard)
- [ ] HTTPS enforced (HSTS header)
- [ ] CSP configured and tested
- [ ] Rate limiting enabled
- [ ] Input validation on all API routes
- [ ] CSRF protection enabled
- [ ] Authentication implemented
- [ ] Error messages sanitized
- [ ] Security headers verified

### Post-Deployment

- [ ] Security headers verified in production
- [ ] CSP violations monitored (Sentry)
- [ ] Rate limits tested
- [ ] Authentication flow tested
- [ ] CSRF protection verified
- [ ] Dependency scanning enabled (Dependabot)
- [ ] Monitoring alerts configured
- [ ] Incident response plan documented

### Quarterly

- [ ] Security audit performed
- [ ] Penetration testing (if required)
- [ ] Dependency updates reviewed
- [ ] Access controls reviewed
- [ ] Incident response plan tested
- [ ] Security training completed

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Vercel Security](https://vercel.com/docs/security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/security)
- [Content Security Policy Reference](https://content-security-policy.com/)

## Support

For security issues:
- **Critical vulnerabilities**: Email security@cidadao.ai (if configured)
- **General security questions**: GitHub Issues
- **Sentry monitoring**: Dashboard at sentry.io
