# VLibras Diagnostic Tool

## Quick Usage

### In Browser Console (Production)

1. Open production site: https://your-site.vercel.app/pt
2. Open DevTools: `F12` or `Ctrl+Shift+I`
3. Go to **Console** tab
4. Copy and paste the entire content of `scripts/diagnose-vlibras.js`
5. Press Enter
6. Read the diagnostic output

## What It Checks

✅ Environment variables
✅ DOM elements presence
✅ LocalStorage preferences
✅ Page locale (PT/EN)
✅ Script loading
✅ CSP violations
✅ Network requests
✅ VLibras object initialization

## Common Issues & Solutions

### Issue 1: VLibras Not Rendering

**Symptoms:**
- No widget in bottom-right corner
- DOM elements not found

**Solutions:**
```javascript
// Force enable in localStorage
localStorage.setItem('vlibras-enabled', 'true')

// Reload page
location.reload()
```

### Issue 2: CSP Blocking

**Symptoms:**
- Console shows CSP violations
- Scripts fail to load

**Solutions:**
- Check `lib/security/csp.config.ts` includes:
  - `https://vlibras.gov.br`
  - `https://*.vlibras.gov.br`
  - `https://cdn.jsdelivr.net`

### Issue 3: Wrong Locale

**Symptoms:**
- On `/en` page

**Solutions:**
- VLibras only loads on `/pt` pages
- Navigate to `/pt` to see VLibras

### Issue 4: Ad Blocker

**Symptoms:**
- Scripts blocked by browser extension

**Solutions:**
- Disable ad blocker temporarily
- Whitelist `vlibras.gov.br`

### Issue 5: Cache Issues

**Symptoms:**
- Old build still loading

**Solutions:**
```bash
# Clear browser cache
Ctrl+Shift+Del

# Or force reload
Ctrl+Shift+R
```

## Manual Verification

### Check if VLibras Loaded

```javascript
// Should return true
!!document.querySelector('[vw]')

// Should return object
window.VLibras
```

### Enable VLibras Programmatically

```javascript
// Enable VLibras
localStorage.setItem('vlibras-enabled', 'true')

// Dispatch custom event to notify components
window.dispatchEvent(new CustomEvent('vlibras-toggle', {
  detail: { enabled: true }
}))

// Reload page
location.reload()
```

### Test VLibras Widget

```javascript
// Click VLibras button programmatically
const vwButton = document.querySelector('[vw] .access-button')
if (vwButton) {
  vwButton.click()
  console.log('✅ VLibras widget clicked!')
} else {
  console.log('❌ VLibras widget not found')
}
```

## Production Checklist

- [ ] `NEXT_PUBLIC_ENABLE_VLIBRAS=true` in Vercel
- [ ] CSP allows VLibras domains
- [ ] On Portuguese (`/pt`) page
- [ ] No ad blockers active
- [ ] Browser cache cleared
- [ ] No console errors
- [ ] Network requests successful

## Related Documentation

- Full VLibras Guide: `docs/accessibility-vlibras.md`
- Vercel Setup: `docs/VERCEL_VLIBRAS_CONFIG.md`
- Component: `components/a11y/vlibras-widget.tsx`
- CSP Config: `lib/security/csp.config.ts`
