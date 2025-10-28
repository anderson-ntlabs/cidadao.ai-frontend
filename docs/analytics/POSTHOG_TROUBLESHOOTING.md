# PostHog Troubleshooting Guide

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-01-28 15:30:00 -0300
**Última Atualização**: 2025-01-28 15:30:00 -0300

---

## 🚨 Quick Diagnosis Checklist

Use this checklist to quickly diagnose why PostHog is not collecting metrics:

```bash
# 1. Check if PostHog is installed
npm list posthog-js
# ✅ Expected: posthog-js@1.280.1 or higher

# 2. Verify environment variables
cat .env.local | grep POSTHOG
# ✅ Expected:
# NEXT_PUBLIC_POSTHOG_KEY=phc_...
# NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# 3. Check browser console (dev server running)
npm run dev
# Visit: http://localhost:3000/pt
# Open browser DevTools → Console
# ✅ Expected: "[PostHog] ✅ Analytics ENABLED"
# ❌ Blocked: "[PostHog] ⚠️ Analytics DISABLED - No consent"

# 4. Check localStorage for consent
# In browser DevTools → Application → Local Storage
# ✅ Expected: cookie-consent: "accepted"

# 5. Verify AnalyticsProvider is mounted
# In browser DevTools → React DevTools → Components
# ✅ Expected: <AnalyticsProvider> in component tree

# 6. Check PostHog dashboard
# Visit: https://app.posthog.com/project/YOUR_PROJECT_ID/events
# Filter: Last 60 minutes
# ✅ Expected: Events appearing (1-2 min delay normal)
```

---

## 🔴 Common Issues & Solutions

### Issue 1: "PostHog Not Collecting Any Metrics"

**Symptoms:**
- No events in PostHog dashboard after 5+ minutes
- Console shows: `[PostHog] ⚠️ Analytics DISABLED`
- No errors in browser console

**Diagnosis:**
```bash
# Check environment variables
echo $NEXT_PUBLIC_POSTHOG_KEY
echo $NEXT_PUBLIC_POSTHOG_HOST

# Verify consent status (browser console)
localStorage.getItem('cookie-consent')
```

**Solution A: Missing Environment Variables**
```bash
# 1. Check .env.local exists
ls -la .env.local

# 2. If missing, copy from example
cp .env.example .env.local

# 3. Add PostHog keys
cat >> .env.local << EOF
NEXT_PUBLIC_POSTHOG_KEY=phc_Q2NjgVvg4HroMh0Gv7C041m4DC6tqd8OX7AKfWeQrLj
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
EOF

# 4. Restart dev server
npm run dev
```

**Solution B: User Rejected Consent**
```javascript
// In browser DevTools Console:
localStorage.setItem('cookie-consent', 'accepted')
window.location.reload()

// Expected: Green cookie banner disappears
// Console shows: [PostHog] ✅ Analytics ENABLED
```

**Solution C: AnalyticsProvider Not Mounted**

Check if your layout includes `<AnalyticsProvider>`:

```typescript
// ❌ WRONG - Missing wrapper
<Providers>
  {children}
  <CookieConsent />
</Providers>

// ✅ CORRECT - Wrapped with AnalyticsProvider
<Providers>
  <AnalyticsProvider>
    {children}
    <CookieConsent />
  </AnalyticsProvider>
</Providers>
```

Fixed in:
- `/app/pt/layout.tsx` ✅
- `/app/en/layout.tsx` ✅ (fixed 2025-01-28)

---

### Issue 2: "English Pages Not Tracking"

**Symptoms:**
- Portuguese pages (`/pt/*`) track correctly
- English pages (`/en/*`) show no events
- Console on `/en` shows no PostHog logs

**Diagnosis:**
```bash
# Check if English layout has AnalyticsProvider
grep -n "AnalyticsProvider" app/en/layout.tsx

# Expected output:
# 40:import { AnalyticsProvider } from '@/components/providers/analytics-provider'
# 68:      <AnalyticsProvider>
# 90:      </AnalyticsProvider>
```

**Solution:**
This was fixed on 2025-01-28. If you still see issues:

```bash
# 1. Pull latest changes
git pull origin main

# 2. Clear Next.js cache
rm -rf .next

# 3. Reinstall dependencies
npm install

# 4. Restart dev server
npm run dev
```

**Files Updated:**
- `app/en/layout.tsx` - Added AnalyticsProvider, WebVitalsProvider, SentryInit
- `app/en/layout.tsx` - Added PostHog preconnect link

---

### Issue 3: "Events Delayed by 5+ Minutes"

**Symptoms:**
- Console shows PostHog initialized
- Events appear in dashboard but with 5-10 minute delay
- No errors in console

**Diagnosis:**
This is actually **normal behavior** for PostHog Cloud:
- Event ingestion: 30 seconds - 2 minutes typical
- Dashboard refresh: Every 60 seconds
- Cold start: Up to 5 minutes on first page load

**Solution:**
Wait 2-3 minutes after action, then:

```bash
# 1. Force refresh PostHog dashboard
# Press Ctrl+Shift+R in browser

# 2. Check PostHog Activity tab
# Visit: https://app.posthog.com/project/YOUR_PROJECT_ID/activity

# 3. Filter by "Last 1 hour" instead of "Last 15 minutes"
```

**If delay exceeds 10 minutes:**
```bash
# Check PostHog status
curl https://status.posthog.com/api/v2/status.json

# Expected: "status": "ok"
```

---

### Issue 4: "Production Not Tracking (Vercel)"

**Symptoms:**
- Development works perfectly
- Production deployment shows no events
- No console logs in production

**Diagnosis:**
```bash
# Check Vercel environment variables
vercel env ls

# Expected output should include:
# NEXT_PUBLIC_POSTHOG_KEY  | production
# NEXT_PUBLIC_POSTHOG_HOST | production
```

**Solution:**
```bash
# Option A: Add via Vercel CLI
vercel env add NEXT_PUBLIC_POSTHOG_KEY production
# Paste: phc_Q2NjgVvg4HroMh0Gv7C041m4DC6tqd8OX7AKfWeQrLj

vercel env add NEXT_PUBLIC_POSTHOG_HOST production
# Paste: https://us.i.posthog.com

# Option B: Add via Vercel Dashboard
# 1. Visit: https://vercel.com/YOUR_TEAM/cidadao-ai-frontend/settings/environment-variables
# 2. Add both variables with scope "Production"
# 3. Trigger redeploy:
vercel --prod
```

**Important:** Vercel requires redeploy after adding env vars!

---

### Issue 5: "Session Recording Not Working"

**Symptoms:**
- Events tracked correctly
- Session recordings show "No recordings" in PostHog
- Console shows PostHog initialized

**Diagnosis:**
```javascript
// In browser DevTools Console:
window.posthog.get_config()

// Check these values:
// session_recording: {
//   maskAllInputs: true,
//   maskInputOptions: { password: true }
// }
```

**Solution A: Session Recording Disabled in Project**
1. Visit PostHog dashboard
2. Go to: **Settings** → **Project** → **Recordings**
3. Enable: **"Record user sessions"**
4. Set retention: 30 days (recommended)
5. Click **Save**

**Solution B: Ad Blocker Interfering**
```bash
# Test without ad blocker:
# 1. Open Incognito/Private window
# 2. Disable browser extensions
# 3. Visit: http://localhost:3000/pt
# 4. Accept consent
# 5. Interact with page
# 6. Check recordings after 2 minutes
```

**Solution C: Input Masking Too Aggressive**

Our config masks ALL inputs by default (LGPD compliance). To test if recordings work:

```typescript
// Temporarily in lib/analytics/posthog-config.ts:
session_recording: {
  maskAllInputs: false, // TESTING ONLY - revert after
  maskTextSelector: '*',
}

// After testing, REVERT to:
session_recording: {
  maskAllInputs: true,  // ✅ LGPD compliant
  maskInputOptions: {
    password: true,
  },
}
```

---

### Issue 6: "Supabase Events Not Storing"

**Symptoms:**
- PostHog events work
- Supabase `usability_events` table empty
- API route returns 200 OK

**Diagnosis:**
```bash
# 1. Check if migration was executed
# Visit Supabase SQL Editor
# Run: SELECT COUNT(*) FROM usability_events;

# ❌ Error: relation "usability_events" does not exist
# ✅ Success: Returns count (even if 0)

# 2. Check API route response
curl -X POST http://localhost:3000/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "page_view",
    "event_category": "navigation",
    "page_path": "/pt/chat",
    "session_id": "test_123",
    "has_research_consent": true
  }'

# Expected: {"success":true,"message":"Event tracked successfully"}
```

**Solution A: Migration Not Executed**

```sql
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy/paste migration file content:
--    File: supabase/migrations/20250124000000_create_usability_events.sql
-- 3. Click "Run"
-- 4. Verify:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'usability_events';

-- Expected: usability_events
```

**Solution B: Missing Research Consent**

```javascript
// Events only store if user gave research consent
// In browser DevTools Console:
localStorage.setItem('research-consent', 'true')

// Or accept via UI:
// Visit: /pt/configuracoes
// Toggle: "Permitir uso de dados para pesquisa acadêmica"
```

**Solution C: Supabase Environment Variables Missing**

```bash
# Check .env.local
cat .env.local | grep SUPABASE

# Expected:
# NEXT_PUBLIC_SUPABASE_URL=https://pbsiyuattnwgohvkkkks.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...

# If missing, add from Supabase Dashboard:
# Settings → API → Project URL & API Keys
```

---

### Issue 7: "Console Shows `posthog is not defined`"

**Symptoms:**
- Browser console error: `ReferenceError: posthog is not defined`
- Site works but analytics broken
- Happens on some pages but not others

**Diagnosis:**
```bash
# Check import statements in component
grep -r "window.posthog" app/

# Check if component is client-side
# Server Components cannot access window.posthog
```

**Solution:**
```typescript
// ❌ WRONG - Server Component
export default function MyPage() {
  window.posthog.capture('event') // Error: window is not defined
}

// ✅ CORRECT - Client Component
'use client'

import { trackEvent } from '@/lib/analytics/posthog-config'

export default function MyPage() {
  const handleClick = () => {
    trackEvent('button_clicked', { button: 'submit' })
  }
}
```

**Always use wrapper functions:**
- `trackEvent()` instead of `window.posthog.capture()`
- `trackPageView()` instead of `window.posthog.capture('$pageview')`
- `identifyUser()` instead of `window.posthog.identify()`

---

## 🧪 Testing PostHog Integration

### Test 1: Basic Initialization

```bash
# 1. Start dev server
npm run dev

# 2. Open browser: http://localhost:3000/pt
# 3. Open DevTools Console
# 4. Accept cookie consent
# 5. Check console output:

# ✅ Expected console logs:
# [PostHog] 🚀 Initializing analytics...
# [PostHog] 📊 Config loaded: {apiKey: "phc_...", apiHost: "..."}
# [PostHog] ✅ Analytics ENABLED
# [PostHog] 📍 Tracking pageview: /pt

# ❌ Problem indicators:
# [PostHog] ⚠️ Analytics DISABLED - No consent
# [PostHog] ❌ Configuration missing
# No PostHog logs at all
```

### Test 2: Manual Event Tracking

```javascript
// In browser DevTools Console:

// 1. Check if PostHog is initialized
window.posthog
// Expected: {capture: ƒ, identify: ƒ, ...}

// 2. Send test event
window.posthog.capture('test_event', {
  test: true,
  timestamp: new Date().toISOString()
})
// Expected: No error, event sent

// 3. Check PostHog dashboard
// Visit: https://app.posthog.com/project/YOUR_PROJECT_ID/events
// Filter: "test_event"
// Expected: Event appears within 2 minutes
```

### Test 3: Consent Flow

```javascript
// In browser DevTools Console:

// 1. Clear consent
localStorage.removeItem('cookie-consent')
window.location.reload()
// Expected: Green consent banner appears

// 2. Check PostHog status
console.log('[PostHog] Status:', window.posthog.__loaded)
// Expected: false

// 3. Accept consent (click "Aceitar Tudo")
// Expected: Banner disappears
// Console shows: [PostHog] ✅ Analytics ENABLED

// 4. Verify localStorage
console.log(localStorage.getItem('cookie-consent'))
// Expected: "accepted"
```

### Test 4: Page Navigation Tracking

```javascript
// Test automatic pageview tracking

// 1. Visit: http://localhost:3000/pt
// Console shows: [PostHog] 📍 Tracking pageview: /pt

// 2. Navigate to: /pt/chat
// Console shows: [PostHog] 📍 Tracking pageview: /pt/chat

// 3. Navigate to: /pt/dashboard
// Console shows: [PostHog] 📍 Tracking pageview: /pt/dashboard

// 4. Check PostHog dashboard
// Events → Filter: "$pageview"
// Expected: 3 pageview events with correct paths
```

### Test 5: Custom Event Tracking

```typescript
// In a component:
'use client'

import { trackUsability } from '@/lib/analytics/usability-tracker'

export default function TestComponent() {
  const handleTest = () => {
    // Test 1: Basic event
    trackUsability('test_click', {
      element_clicked: 'test_button',
      page_path: window.location.pathname,
    })

    // Test 2: Chat interaction
    trackChatInteraction({
      message: 'test message',
      agentUsed: 'zumbi',
      duration: 1234,
    })

    // Test 3: Investigation
    trackInvestigationStarted({
      investigationId: 'test_inv_123',
      initialPrompt: 'test investigation',
    })

    console.log('✅ Three test events sent')
  }

  return <button onClick={handleTest}>Send Test Events</button>
}
```

---

## 📊 Verifying Data in PostHog Dashboard

### Step 1: Access Dashboard
```
URL: https://app.posthog.com/project/YOUR_PROJECT_ID
```

### Step 2: Check Event Explorer
1. Click **Events** in left sidebar
2. Set date range: **Last 1 hour**
3. Expected events:
   - `$pageview` - Page views
   - `$pageleave` - Page exits
   - `$autocapture` - Button clicks, form interactions
   - Custom events: `chat_interaction`, `agent_selected`, etc.

### Step 3: Check Session Recordings
1. Click **Recordings** in left sidebar
2. Filter: **Last 1 hour**
3. Expected: List of sessions with replay buttons
4. Click session → Watch replay (masked inputs)

### Step 4: Check User Identification
1. Click **Persons** in left sidebar
2. Search for your hashed user ID
3. Expected: Person profile with event timeline

### Step 5: Create Test Dashboard
1. Click **Dashboards** → **New Dashboard**
2. Add widgets:
   - **Insight**: Page views over time
   - **Insight**: Top pages by views
   - **Insight**: Agent usage distribution
   - **Funnel**: Chat → Investigation → Completion

---

## 🔍 Advanced Debugging

### Enable PostHog Debug Mode

```typescript
// In lib/analytics/posthog-config.ts:

posthog.init(apiKey, {
  api_host: apiHost,
  debug: true, // ✅ ADD THIS LINE
  // ... rest of config
})

// Restart dev server
// Console will show detailed PostHog logs:
// [PostHog] Sending request to https://us.i.posthog.com/capture/...
// [PostHog] Response: 200 OK
```

### Check Network Requests

1. Open DevTools → **Network** tab
2. Filter: `posthog` or `capture`
3. Interact with page (click, navigate)
4. Expected requests:
   - `POST https://us.i.posthog.com/decide/` (config)
   - `POST https://us.i.posthog.com/e/` (events)
   - `POST https://us.i.posthog.com/s/` (session recording)

**Troubleshooting network issues:**
```bash
# Check if PostHog endpoint is reachable
curl -I https://us.i.posthog.com

# Expected: HTTP/2 200

# Test event capture directly
curl -X POST https://us.i.posthog.com/capture/ \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "YOUR_KEY_HERE",
    "event": "test_event",
    "properties": {
      "distinct_id": "test_user"
    }
  }'

# Expected: {"status": 1}
```

### Inspect PostHog State

```javascript
// In browser DevTools Console:

// Get full PostHog configuration
console.log('Config:', window.posthog.get_config())

// Get distinct ID (user identifier)
console.log('Distinct ID:', window.posthog.get_distinct_id())

// Get feature flags
console.log('Flags:', window.posthog.getAllFlags())

// Get session ID
console.log('Session ID:', window.posthog.get_session_id())

// Get session replay status
console.log('Recording?', window.posthog.sessionRecordingStarted())

// Get pending events (not yet sent)
console.log('Queue:', window.posthog._events_queue)
```

---

## 🚑 Emergency Fixes

### PostHog Completely Broken - Quick Reset

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Clear all caches
rm -rf .next
rm -rf node_modules/.cache

# 3. Reinstall PostHog
npm uninstall posthog-js
npm install posthog-js@latest

# 4. Verify environment variables
cat .env.local | grep POSTHOG

# 5. Clear browser data
# DevTools → Application → Clear storage → Clear site data

# 6. Restart dev server
npm run dev

# 7. Test in incognito window
# Visit: http://localhost:3000/pt
# Accept consent
# Check console
```

### Production Emergency Disable

If PostHog causes production issues, disable temporarily:

```typescript
// In lib/analytics/posthog-config.ts:

export function initPostHog() {
  // EMERGENCY DISABLE - Remove when fixed
  console.log('[PostHog] Temporarily disabled for maintenance')
  return

  // ... rest of init code (commented out)
}
```

Then redeploy:
```bash
git add lib/analytics/posthog-config.ts
git commit -m "fix(analytics): temporarily disable PostHog for maintenance"
git push origin main
```

**Important:** Remember to re-enable after fixing!

---

## 📚 Additional Resources

- **PostHog Official Docs**: https://posthog.com/docs
- **Next.js Integration Guide**: https://posthog.com/docs/libraries/next-js
- **Session Recording Docs**: https://posthog.com/docs/session-replay
- **Event Tracking Best Practices**: https://posthog.com/docs/product-analytics/events

**Project-Specific Docs:**
- `docs/analytics/README.md` - Analytics overview
- `docs/analytics/SETUP_GUIDE.md` - Initial setup instructions
- `docs/analytics/USABILITY_ANALYTICS_IMPLEMENTATION.md` - Technical details
- `docs/analytics/posthog-unified-consent-fix.md` - Consent system details

---

## 💡 Pro Tips

1. **Development Testing**: Use PostHog's test mode to avoid polluting production data
2. **Consent Testing**: Use `localStorage.setItem('cookie-consent', 'accepted')` to bypass banner
3. **Dashboard Setup**: Create separate dashboards for development vs production
4. **Alert Rules**: Set up alerts for zero events (indicates tracking broken)
5. **Regular Audits**: Weekly check that all critical events are being tracked
6. **Documentation**: Update this guide when you discover new issues!

---

## ✅ Success Criteria

PostHog is working correctly when:

- ✅ Console shows `[PostHog] ✅ Analytics ENABLED`
- ✅ Events appear in dashboard within 2 minutes
- ✅ Session recordings work (with masked inputs)
- ✅ Page navigation tracked automatically
- ✅ Custom events tracked via `trackUsability()`
- ✅ User identification works (hashed IDs)
- ✅ Both PT and EN locales tracked
- ✅ Production and development both functional

---

**Need Help?**

If this guide doesn't solve your issue:

1. Check PostHog status: https://status.posthog.com
2. Join PostHog Slack: https://posthog.com/slack
3. Open GitHub issue with:
   - Console logs (full output)
   - Network tab screenshots
   - Environment details
   - Steps to reproduce
