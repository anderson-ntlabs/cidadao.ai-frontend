# VLibras Configuration on Vercel

**Author**: Anderson Henrique da Silva
**Location**: Minas Gerais, Brasil
**Date**: 2025-10-29

---

## Problem

VLibras (Brazilian Sign Language widget) not appearing in production despite working locally.

## Root Cause

The `NEXT_PUBLIC_ENABLE_VLIBRAS` environment variable is not set in Vercel.

## Solution

### 1. Access Vercel Dashboard

1. Go to https://vercel.com/
2. Select your project: `cidadao.ai-frontend`
3. Go to **Settings** → **Environment Variables**

### 2. Add VLibras Environment Variable

Add the following environment variable:

- **Key**: `NEXT_PUBLIC_ENABLE_VLIBRAS`
- **Value**: `true`
- **Environments**: Select all (Production, Preview, Development)

### 3. Redeploy

After adding the variable:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** button
4. Wait for build to complete (~2 minutes)

### 4. Verify

1. Access your production URL
2. Check if VLibras widget appears in bottom-right corner (blue accessibility icon)
3. Open DevTools Console - should see no CSP errors related to VLibras

## Technical Details

### How VLibras Loads

VLibras is loaded conditionally based on:

1. **Environment Variable**: `NEXT_PUBLIC_ENABLE_VLIBRAS=true`
2. **Locale**: Only on Portuguese (`/pt`) pages
3. **User Preference**: Stored in `localStorage` (default: enabled)

### Component Hierarchy

```
app/pt/layout.tsx
  └─ VLibrasLazy (lazy loaded component)
      └─ VLibrasWidget (actual VLibras integration)
          └─ @djpfs/react-vlibras
```

### CSP Configuration

VLibras requires these CSP directives (already configured):

```typescript
'script-src': [
  'https://vlibras.gov.br',
  'https://*.vlibras.gov.br',
  'https://cdn.jsdelivr.net',
],
'connect-src': [
  'https://vlibras.gov.br',
  'https://*.vlibras.gov.br',
  'https://cdn.jsdelivr.net',
],
'font-src': [
  'https://vlibras.gov.br',
  'https://*.vlibras.gov.br',
  'https://cdn.jsdelivr.net',
],
'media-src': [
  'https://vlibras.gov.br',
  'https://*.vlibras.gov.br',
  'https://cdn.jsdelivr.net',
],
```

## Testing VLibras

### Manual Test

```bash
# Check if variable is set in browser console
console.log(process.env.NEXT_PUBLIC_ENABLE_VLIBRAS)
// Should output: "true"

# Check if VLibras loaded
document.querySelector('[vw]')
// Should return: <div vw ...>
```

### Automated Test

```bash
node scripts/test-vlibras.js
```

## Troubleshooting

### VLibras Not Appearing

1. ✅ Check environment variable is set
2. ✅ Verify you're on a Portuguese page (`/pt/*`)
3. ✅ Check browser console for errors
4. ✅ Verify CSP allows VLibras domains
5. ✅ Clear browser cache and reload

### CSP Errors

If you see CSP violations for VLibras:

```
Refused to load ... from 'https://vlibras.gov.br' ...
```

Check `lib/security/csp.config.ts` has all VLibras domains listed.

## Related Files

- Configuration: `lib/security/csp.config.ts`
- Layout: `app/pt/layout.tsx`
- Widget: `components/a11y/vlibras-widget.tsx`
- Lazy Load: `components/a11y/vlibras-lazy.tsx`
- Test Script: `scripts/test-vlibras.js`
- Full Documentation: `docs/accessibility-vlibras.md`

## Environment Variables Summary

```bash
# Production (Vercel)
NEXT_PUBLIC_ENABLE_VLIBRAS=true

# Development (.env.local)
NEXT_PUBLIC_ENABLE_VLIBRAS=true
```

---

**Last Updated**: 2025-10-29
**Status**: ✅ Configuration documented, ready for Vercel setup
