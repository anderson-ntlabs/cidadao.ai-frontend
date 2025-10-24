# Manual Test Scripts Guide

**Author**: Anderson Henrique da Silva
**Location**: Minas Gerais, Brasil
**Created**: 2025-01-25 20:00:00 -0300
**Last Updated**: 2025-01-25 20:00:00 -0300

---

## Overview

The `/scripts` directory contains **41 Node.js test scripts** for manually testing various aspects of the Cidadão.AI frontend without requiring a full test framework like Jest or Vitest. These scripts provide quick, targeted testing for specific features, integrations, and system health checks.

## Purpose

Unlike automated test suites, these scripts:
- ✅ Test **real backend integration** against live Railway/HuggingFace endpoints
- ✅ Provide **immediate feedback** without complex test setup
- ✅ Enable **rapid debugging** during development
- ✅ Verify **production deployment** health
- ✅ Monitor **performance metrics** over time
- ✅ Test **accessibility features** (VLibras, WCAG contrast)

---

## Quick Reference

### Most Used Scripts

```bash
# Backend Health
node scripts/test-backend.js          # Quick backend connectivity check
node scripts/check-backend-status.js  # Detailed backend status
node scripts/verify-backend.js        # Backend API verification

# Chat Integration
node scripts/test-chat-live.js        # Live chat integration test
node scripts/test-complete-integration.js  # Full integration test

# Feature Testing
node scripts/test-transparency-map.js  # Transparency map integration
node scripts/test-vlibras.js          # VLibras (LIBRAS) integration

# Performance & Security
node scripts/security-audit.js        # Security audit (CSP, headers, XSS)
node scripts/analyze-bundle.js        # Bundle size analysis
```

---

## Script Categories

### 1. Backend Integration Testing (11 scripts)

#### `test-backend.js` 🌟
**Purpose**: Quick backend connectivity check
**Usage**:
```bash
node scripts/test-backend.js
```

**What it tests**:
- ✅ Backend URL reachability
- ✅ Health endpoint status
- ✅ Response time

**Example output**:
```
✅ Backend is reachable at https://cidadao-api-production.up.railway.app
⏱️  Response time: 245ms
```

---

#### `check-backend-status.js`
**Purpose**: Detailed backend health and endpoint status
**Usage**:
```bash
node scripts/check-backend-status.js
```

**What it tests**:
- ✅ All API endpoints availability
- ✅ Version information
- ✅ Service status (database, cache, agents)

**Example output**:
```
📡 Backend Status Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: healthy
Uptime: 48 hours
Version: 1.2.0
Agents: 8/17 operational
Database: ✅ Connected
Cache: ✅ Redis available
```

---

#### `test-chat-live.js` 🌟
**Purpose**: Live chat integration with real backend
**Usage**:
```bash
node scripts/test-chat-live.js
```

**What it tests**:
- ✅ POST `/api/v1/chat/message` endpoint
- ✅ Message processing and response
- ✅ Agent selection logic
- ✅ Multiple message types (greeting, questions, investigations)

**Example output**:
```
🧪 Testing Chat Integration After Fix

📤 Sending message: Olá, como você pode me ajudar?
⏱️  Response time: 1243ms
📊 Status: 200 OK

✅ Success! Backend Response:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agent: Carlos Drummond de Andrade (drummond)
Message: Olá! Sou o Drummond, agente educador do Cidadão.AI...
Confidence: 0.85
Session ID: test_1737842567123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### `test-complete-integration.js` 🌟
**Purpose**: Comprehensive end-to-end integration test
**Usage**:
```bash
node scripts/test-complete-integration.js
```

**What it tests**:
- ✅ Backend health
- ✅ Chat endpoints
- ✅ Agent routing
- ✅ Session persistence
- ✅ Error handling

**When to use**: Before production deployment or after major backend changes

---

#### Other Backend Scripts

| Script | Purpose | Key Feature |
|--------|---------|-------------|
| `verify-backend.js` | Backend API verification | Tests all critical endpoints |
| `debug-backend.js` | Backend debugging | Detailed error logging |
| `debug-backend-response.js` | Response debugging | Inspects response structure |
| `monitor-new-endpoints.js` | Endpoint monitoring | Track new API additions |
| `discover-hf-url.js` | HuggingFace URL discovery | Find correct HF Spaces URL |
| `test-backend-integration-old.js` | Legacy integration test | Deprecated - use `test-complete-integration.js` |
| `check-restart.js` | Backend restart detection | Monitors backend availability |

---

### 2. Chat System Testing (12 scripts)

#### `test-chat-api.js`
**Purpose**: Test basic chat API functionality
**Usage**:
```bash
node scripts/test-chat-api.js
```

**What it tests**:
- ✅ Chat API endpoints
- ✅ Message format validation
- ✅ Response structure

---

#### `test-chat-persistence.js`
**Purpose**: Test chat session persistence
**Usage**:
```bash
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app node scripts/test-chat-persistence.js
```

**What it tests**:
- ✅ Session ID generation
- ✅ Message history storage
- ✅ Session recovery

**Environment variables**:
- `NEXT_PUBLIC_API_URL`: Backend URL (required)

---

#### Maritaca AI Integration Scripts

| Script | Purpose | Status |
|--------|---------|--------|
| `test-maritaca-endpoints.js` | Maritaca endpoint testing | ✅ Active |
| `test-maritaca-integration.js` | Maritaca integration | ✅ Active |
| `test-simple-endpoint.js` | Simple endpoint test | ✅ Active |

---

#### Drummond Agent Scripts

The "Drummond" agent is the primary educational agent. These scripts test its specific functionality:

| Script | Purpose | Use Case |
|--------|---------|----------|
| `test-drummond-final.js` | Final Drummond tests | Pre-deployment |
| `test-drummond-live.js` | Live Drummond testing | Production monitoring |
| `test-drummond-stress.js` | Drummond stress testing | Performance validation |
| `monitor-drummond.js` | Drummond monitoring | Continuous health check |

---

#### Other Chat Scripts

| Script | Purpose |
|--------|---------|
| `test-chat-detailed.js` | Detailed chat response inspection |
| `test-simple-messages.js` | Simple message exchange test |
| `test-optimized-endpoints.js` | Optimized endpoint performance |

---

### 3. Feature-Specific Testing (5 scripts)

#### `test-transparency-map.js` 🌟
**Purpose**: Test transparency map backend integration
**Usage**:
```bash
node scripts/test-transparency-map.js
```

**What it tests**:
- ✅ GET `/api/v1/transparency/coverage/map` endpoint
- ✅ State coverage data structure
- ✅ API availability by state
- ✅ Cache information
- ✅ Response time

**Example output**:
```
🧪 Testing Transparency Map Integration

📡 Backend URL: https://cidadao-api-production.up.railway.app
🔗 Endpoint: /api/v1/transparency/coverage/map

⏳ Fetching data from backend...
⏱️  Response time: 324ms

✅ Response received successfully!

📊 Summary Statistics:
   - Total States: 27
   - States with APIs: 12
   - States Working: 6
   - Total APIs: 18
   - Total Endpoints: 245
   - Coverage: 22.2%

🗺️  States with Data:
   SP: São Paulo
      Status: partial
      APIs: 3
         - Portal da Transparência SP (working): 45 endpoints
           URL: https://www.portaldatransparencia.sp.gov.br/api
```

---

#### `test-vlibras.js` 🌟
**Purpose**: Test VLibras (Brazilian Sign Language) integration
**Usage**:
```bash
# Make sure dev server is running on port 3001
npm run dev

# In another terminal
NEXT_PUBLIC_ENABLE_VLIBRAS=true node scripts/test-vlibras.js
```

**What it tests**:
- ✅ Environment variable configuration
- ✅ VLibras CDN accessibility
- ✅ Local development server
- ✅ Package installation
- ✅ Component file existence

**Example output**:
```
🧪 VLibras Integration Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Testing URL: http://localhost:3001/pt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1: Environment Variable Configuration
✅ NEXT_PUBLIC_ENABLE_VLIBRAS is set to true

Test 2: VLibras CDN Accessibility
✅ VLibras CDN is accessible (Status: 200)

Test 3: Local Development Server
✅ Local server is running (Status: 200)

Test 4: VLibras Package Installation
✅ @djpfs/react-vlibras package is installed

Test 5: VLibras Component File
✅ VLibrasWidget component exists

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Test Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Tests:  5
Passed:       5 ✅
Failed:       0 ❌
Success Rate: 100%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 All tests passed! VLibras integration is ready.

📝 Next Steps:
   1. Open http://localhost:3001/pt in your browser
   2. Look for the VLibras widget in the bottom-right corner
   3. Click the widget to activate LIBRAS translation
   4. Select an avatar (Guga, Ícaro, or Hozana)
   5. Hover over text to see sign language translation
```

---

#### `test-tour.js`
**Purpose**: Test interactive tour system
**Usage**:
```bash
node scripts/test-tour.js
```

**What it tests**:
- ✅ Tour step definitions
- ✅ Tour navigation
- ✅ Tour completion tracking

---

#### `test-breadcrumbs.js`
**Purpose**: Test breadcrumb navigation component
**Usage**:
```bash
node scripts/test-breadcrumbs.js
```

**What it tests**:
- ✅ Breadcrumb generation logic
- ✅ Route parsing
- ✅ Localization

---

#### `test-feature-flag.js`
**Purpose**: Test feature flag system
**Usage**:
```bash
node scripts/test-feature-flag.js
```

**What it tests**:
- ✅ Feature flag reading
- ✅ Environment-based flags
- ✅ Runtime feature toggling

---

### 4. Performance & Optimization (2 scripts)

#### `analyze-bundle.js` 🌟
**Purpose**: Analyze webpack bundle size
**Usage**:
```bash
npm run build  # Build first
node scripts/analyze-bundle.js
```

**What it tests**:
- ✅ Total bundle size
- ✅ Code splitting effectiveness
- ✅ Largest modules
- ✅ Duplicate dependencies

**Example output**:
```
📦 Bundle Analysis Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Size: 1.2 MB
Gzipped: 320 KB

Largest Bundles:
  1. _app.js - 245 KB (22%)
  2. chat.js - 180 KB (16%)
  3. vendors.js - 650 KB (58%)

Recommendations:
  ⚠️  Vendor bundle is large - consider code splitting
  ✅ Page chunks are well optimized
```

---

#### `test-cache-idb.js`
**Purpose**: Test IndexedDB caching layer
**Usage**:
```bash
node scripts/test-cache-idb.js
```

**What it tests**:
- ✅ IndexedDB initialization
- ✅ Cache write operations
- ✅ Cache read operations
- ✅ TTL expiration
- ✅ Cache eviction

---

### 5. Security & Accessibility (3 scripts)

#### `security-audit.js` 🌟
**Purpose**: Comprehensive security audit
**Usage**:
```bash
npm run build  # Build first
node scripts/security-audit.js
```

**What it tests**:
- ✅ Content Security Policy (CSP) headers
- ✅ Security headers (HSTS, X-Frame-Options, etc.)
- ✅ XSS vulnerability scanning
- ✅ Dependency vulnerabilities
- ✅ HTTPS enforcement

**Example output**:
```
🔒 Security Audit Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Security Headers:
  ✅ Strict-Transport-Security: max-age=63072000
  ✅ X-Content-Type-Options: nosniff
  ✅ X-Frame-Options: SAMEORIGIN
  ⚠️  Content-Security-Policy: Using unsafe-inline

XSS Protection:
  ✅ All user inputs are sanitized
  ✅ DOMPurify configured correctly

Dependency Scan:
  ⚠️  2 moderate vulnerabilities found
  📋 Run 'npm audit fix' to resolve

Overall Score: 85/100
```

**When to use**: Before production deployment, after dependency updates

---

#### `check-wcag-contrast.js`
**Purpose**: WCAG color contrast compliance check
**Usage**:
```bash
node scripts/check-wcag-contrast.js
```

**What it tests**:
- ✅ Color contrast ratios (WCAG AA/AAA)
- ✅ Text readability
- ✅ Link color accessibility

**Example output**:
```
♿ WCAG Contrast Checker
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Text Colors:
  ✅ Primary text: 8.2:1 (AAA)
  ✅ Secondary text: 4.8:1 (AA)
  ❌ Link color: 3.1:1 (Fails AA - requires 4.5:1)

Recommendations:
  - Darken link color by 15% for AA compliance
  - Consider using underlines for links
```

---

#### `test-header-fix.js`
**Purpose**: Test security header fixes
**Usage**:
```bash
npm run dev  # Dev server
node scripts/test-header-fix.js
```

**What it tests**:
- ✅ Response headers configuration
- ✅ Vercel header overrides
- ✅ CSP directives

---

### 6. Code Quality & Analysis (3 scripts)

#### `analyze-ux-design.js`
**Purpose**: Analyze UX design patterns and consistency
**Usage**:
```bash
node scripts/analyze-ux-design.js
```

**What it analyzes**:
- ✅ Component usage patterns
- ✅ Design system consistency
- ✅ Color palette usage
- ✅ Typography patterns

---

#### `analyze-internal-ux.js`
**Purpose**: Internal UX audit (detailed)
**Usage**:
```bash
node scripts/analyze-internal-ux.js
```

**What it analyzes**:
- ✅ Navigation patterns
- ✅ Error message consistency
- ✅ Loading state patterns
- ✅ Form validation UX

---

#### `migrate-console-logs.js`
**Purpose**: Migrate console.log to structured logging
**Usage**:
```bash
node scripts/migrate-console-logs.js
```

**What it does**:
- ✅ Find all console.log statements
- ✅ Suggest logger replacements
- ✅ Generate migration report

---

### 7. Development Tools (5 scripts)

#### `generate-component.js` 🌟
**Purpose**: Scaffold new React components
**Usage**:
```bash
node scripts/generate-component.js ComponentName
```

**What it generates**:
- ✅ Component file with TypeScript
- ✅ Storybook story
- ✅ Test file skeleton
- ✅ Barrel export update

**Example**:
```bash
node scripts/generate-component.js UserCard

✅ Created components/UserCard/UserCard.tsx
✅ Created components/UserCard/UserCard.stories.tsx
✅ Created components/UserCard/index.ts
```

---

#### `generate-icons.js`
**Purpose**: Generate optimized icon components from SVG
**Usage**:
```bash
node scripts/generate-icons.js
```

**What it does**:
- ✅ Scan SVG files in `/public/icons`
- ✅ Generate React icon components
- ✅ Optimize SVG code
- ✅ Create TypeScript types

---

#### `generate-splash.js`
**Purpose**: Generate PWA splash screens
**Usage**:
```bash
node scripts/generate-splash.js
```

**What it generates**:
- ✅ iOS splash screens (all sizes)
- ✅ Android splash screens
- ✅ Manifest updates

---

#### `test-sentry.js`
**Purpose**: Test Sentry error tracking integration
**Usage**:
```bash
NEXT_PUBLIC_SENTRY_DSN=your-dsn node scripts/test-sentry.js
```

**What it tests**:
- ✅ Sentry SDK initialization
- ✅ Error capture
- ✅ Breadcrumb tracking
- ✅ User context

---

#### `test-telemetry.js`
**Purpose**: Test custom telemetry event tracking
**Usage**:
```bash
node scripts/test-telemetry.js
```

**What it tests**:
- ✅ Event tracking
- ✅ Analytics batching
- ✅ Custom dimensions

---

## Testing Workflows

### Pre-Deployment Checklist

```bash
# 1. Backend connectivity
node scripts/test-backend.js

# 2. Complete integration
node scripts/test-complete-integration.js

# 3. Security audit
npm run build
node scripts/security-audit.js

# 4. Bundle size
node scripts/analyze-bundle.js

# 5. Accessibility
node scripts/test-vlibras.js
node scripts/check-wcag-contrast.js
```

---

### Daily Development Testing

```bash
# Morning health check
node scripts/check-backend-status.js

# After backend changes
node scripts/test-chat-live.js

# After frontend changes
node scripts/test-complete-integration.js
```

---

### Feature Development Workflow

```bash
# 1. Generate component
node scripts/generate-component.js MyFeature

# 2. Develop feature
# ...

# 3. Test feature integration
node scripts/test-chat-live.js  # If chat-related
node scripts/test-transparency-map.js  # If transparency-related

# 4. Check accessibility
node scripts/check-wcag-contrast.js
```

---

## Troubleshooting

### Backend Connection Errors

**Problem**: `ECONNREFUSED` or timeout errors

**Solutions**:
```bash
# 1. Check backend URL
echo $NEXT_PUBLIC_API_URL

# 2. Try discovery script
node scripts/discover-hf-url.js

# 3. Verify backend status manually
curl https://cidadao-api-production.up.railway.app/health
```

---

### VLibras Test Failures

**Problem**: VLibras CDN not accessible

**Solutions**:
```bash
# 1. Check environment variable
NEXT_PUBLIC_ENABLE_VLIBRAS=true node scripts/test-vlibras.js

# 2. Verify dev server port
# Change port in script if using different port (default: 3001)

# 3. Test CDN directly
curl -I https://vlibras.gov.br/app/vlibras-plugin.js
```

---

### Chat Test Failures

**Problem**: Chat tests failing with 500 errors

**Solutions**:
```bash
# 1. Check backend logs
node scripts/debug-backend.js

# 2. Test specific endpoints
node scripts/test-simple-messages.js

# 3. Monitor backend health
node scripts/monitor-new-endpoints.js
```

---

## Adding New Test Scripts

### Template Structure

```javascript
/**
 * Test Script Name
 *
 * Autor: Anderson Henrique da Silva
 * Data: YYYY-MM-DD
 *
 * Description of what this script tests
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'default-url';

async function runTests() {
  console.log('🧪 Test Name\n');
  console.log('━'.repeat(50));

  try {
    // Test logic here
    console.log('✅ Test passed');
    return 0;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return 1;
  }
}

runTests()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('❌ Script error:', error);
    process.exit(1);
  });
```

---

## Environment Variables

### Required for Testing

```bash
# Backend URL
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app

# Accessibility
NEXT_PUBLIC_ENABLE_VLIBRAS=true

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### Optional

```bash
# Custom test URLs
TEST_URL=http://localhost:3000/pt

# Timeouts
TIMEOUT=10000  # 10 seconds

# Debug mode
DEBUG=true
```

---

## Best Practices

### 1. Always Test Before Committing

```bash
# Minimum tests before commit
node scripts/test-backend.js
node scripts/test-chat-live.js
```

### 2. Use Scripts for Quick Debugging

Instead of manual testing, use scripts:
```bash
# Instead of opening browser to test chat
node scripts/test-chat-live.js

# Instead of checking network tab
node scripts/monitor-new-endpoints.js
```

### 3. Monitor Production

```bash
# Set up cron job for production monitoring
*/15 * * * * cd /path/to/project && node scripts/check-backend-status.js >> logs/health.log
```

### 4. Document Custom Scripts

When creating new scripts, add them to this documentation with:
- Purpose
- Usage example
- What it tests
- Example output

---

## Related Documentation

- [Testing Strategy Guide](../guides/TESTING-STRATEGY.md) - Overall testing approach
- [Testing Guide](../guides/TESTING.md) - Vitest and Playwright setup
- [Deployment Guide](../technical/deployment-guide.md) - CI/CD pipelines

---

## Summary

**Total Scripts**: 41
**Categories**: 7
**Most Critical**: 10 (marked with 🌟)

**Key Takeaways**:
1. Manual scripts complement automated testing
2. Focus on real backend integration
3. Quick feedback for rapid development
4. Production monitoring capabilities
5. Accessibility and security validation

For questions or issues with test scripts, check the [Troubleshooting](#troubleshooting) section or open a GitHub issue.
