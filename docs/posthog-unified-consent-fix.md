# PostHog Unified Consent Implementation

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-10-25 17:30:00 -0300

---

## 🎯 Problem Statement

PostHog analytics was not collecting any data in production (Vercel) despite:
- ✅ Environment variables correctly configured
- ✅ PostHog integration code implemented
- ✅ Analytics provider properly wrapped in layout

### Root Cause

**Overly restrictive dual consent system** requiring users to accept TWO separate banners:

1. **Cookie Consent Banner** (sets `cookie-consent=accepted`)
2. **Research Consent Banner** (sets `research-consent=accepted`, appeared 2 seconds after)

The `hasUserConsent()` function required **BOTH** to be accepted:

```typescript
// OLD - PROBLEMATIC
export function hasUserConsent(): boolean {
  const cookieConsent = localStorage.getItem('cookie-consent')
  const researchConsent = localStorage.getItem('research-consent')

  // Both required!
  return cookieConsent === 'accepted' && researchConsent === 'accepted'
}
```

**Impact**:
- If user closed either banner (clicking X), value remained `null`
- PostHog would call `opt_out_capturing()` blocking ALL data collection
- Very low conversion rate (most users don't accept 2 banners)
- All tracking functions (`trackEvent`, `trackPageView`) silently failed

---

## ✅ Solution: Unified Consent Model

Consolidated all consent (cookies + analytics + research) into a **single, enhanced cookie consent banner**.

### Changes Made

#### 1. Enhanced Cookie Consent Banner

**File**: `components/cookie-consent.tsx`

**Changes**:
- Added detailed analytics information
- Mentions PostHog explicitly
- Shows LGPD compliance
- Beautiful gradient design with feature cards
- Links to privacy policy and research information
- Dispatches `consent-updated` event on accept/reject

**New Features Display**:
- 🍪 Cookies essenciais
- 📊 Analytics anônimos (PostHog)
- 🔬 Pesquisa acadêmica LGPD-compliant

#### 2. Simplified Consent Logic

**File**: `lib/analytics/posthog-config.ts`

**Before**:
```typescript
export function hasUserConsent(): boolean {
  const cookieConsent = localStorage.getItem('cookie-consent')
  const researchConsent = localStorage.getItem('research-consent')
  return cookieConsent === 'accepted' && researchConsent === 'accepted'
}
```

**After**:
```typescript
export function hasUserConsent(): boolean {
  if (typeof window === 'undefined') return false
  const cookieConsent = localStorage.getItem('cookie-consent')

  // Simplified: only cookie consent required
  // Analytics consent is bundled in the cookie consent banner
  return cookieConsent === 'accepted'
}
```

#### 3. Removed Research Consent Banner

**File**: `app/pt/layout.tsx`

- Removed `<ResearchConsentBanner />` component
- Removed import statement
- Component file kept for reference: `components/research-consent-banner.tsx`

#### 4. Enhanced PostHog Initialization

**File**: `lib/analytics/posthog-config.ts`

**Added**:
- Debug logging for development environment
- Automatic consent status update on initialization
- Better error handling and warnings
- Clear console messages for consent state

**New Debug Output**:
```
[PostHog] Initialized successfully
[PostHog] User consent: true
[PostHog] ✅ Analytics ENABLED - collecting data
```

Or if rejected:
```
[PostHog] Initialized successfully
[PostHog] User consent: false
[PostHog] ❌ Analytics DISABLED - not collecting data
```

---

## 🧪 Testing

### Local Development

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Clear browser data**:
   - F12 → Application → Local Storage → Clear All
   - Refresh page

3. **Test Accept Flow**:
   - New unified banner appears
   - Click "Aceitar Tudo"
   - Console shows: `[PostHog] ✅ Analytics ENABLED`
   - Navigate pages → events tracked

4. **Test Reject Flow**:
   - Clear localStorage
   - Click "Apenas Essenciais"
   - Console shows: `[PostHog] ❌ Analytics DISABLED`
   - Navigate pages → NO events tracked

### Production Testing (Vercel)

1. **Deploy** (automatic on git push)
2. **Visit**: https://cidadao-ai-frontend.vercel.app/pt
3. **Clear localStorage** in DevTools
4. **Accept cookies**
5. **Verify in PostHog**:
   - https://app.posthog.com/project/events
   - Events should appear within 1-2 minutes
   - Look for: `$pageview`, `$autocapture`, custom events

### Test Script

Run comprehensive test instructions:
```bash
node scripts/test-unified-consent.js
```

---

## 📊 Expected Outcomes

### ✅ With Consent (Accept All)

- PostHog initializes successfully
- `opt_in_capturing()` called
- Pageviews tracked automatically
- Autocapture enabled (clicks, form interactions)
- Session recording enabled (with input masking)
- Events appear in PostHog dashboard

### ❌ Without Consent (Essential Only)

- PostHog initializes but in opt-out mode
- `opt_out_capturing()` called
- NO pageviews tracked
- NO autocapture
- NO session recording
- Dashboard shows no activity for user

---

## 🔧 Technical Details

### Environment Variables

**Required** (already configured):
```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_Q2NjgVvg4HroMh0Gv7C041m4DC6tqd8OX7AKfWeQrLj
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### PostHog Configuration

```typescript
posthog.init(apiKey, {
  api_host: 'https://us.i.posthog.com',
  persistence: 'localStorage',
  opt_out_capturing_by_default: false,

  // Session recording (LGPD compliant)
  disable_session_recording: !hasUserConsent(),
  session_recording: {
    maskAllInputs: true,        // Mask ALL inputs
    maskTextSelector: '.sensitive',
    recordCrossOriginIframes: false,
  },

  // Analytics features
  autocapture: true,
  capture_pageview: true,
  capture_pageleave: true,
})
```

### Consent Flow

```
User visits site
     ↓
PostHog initializes (always)
     ↓
Check cookie-consent in localStorage
     ↓
   ┌─────────────────┬─────────────────┐
   ↓                 ↓                 ↓
accepted         rejected           null
   ↓                 ↓                 ↓
opt_in()         opt_out()     Show banner
Analytics ON     Analytics OFF       ↓
                                  User decides
                                      ↓
                               Event dispatched
                                      ↓
                            updateConsentStatus()
```

---

## 🎨 UI Changes

### Old Banner (Simple)
- Plain white/dark background
- Minimal text
- 2 buttons only
- No analytics information

### New Banner (Enhanced)
- Green gradient background
- Clear title: "Cookies & Privacidade"
- Detailed explanation
- Feature cards showing what's collected
- 3 helpful links (Privacy, Cookies, Research)
- 2 clear action buttons
- Icons for visual appeal
- Responsive design (mobile-friendly)

---

## 📝 LGPD Compliance

The unified consent system maintains LGPD compliance:

1. **Explicit Consent**: User must actively click "Accept All"
2. **Clear Information**: Banner explains what data is collected
3. **Easy to Reject**: "Essential Only" option prominent
4. **Anonymization**: User IDs hashed with SHA-256
5. **Data Masking**: All form inputs masked in recordings
6. **Opt-out Anytime**: User can revoke via settings (future)
7. **No Hidden Tracking**: PostHog explicitly mentioned

---

## 🚀 Deployment Checklist

- [x] Update cookie consent banner UI
- [x] Simplify hasUserConsent() logic
- [x] Remove research consent banner
- [x] Add debug logging to PostHog init
- [x] Test locally (both accept/reject flows)
- [x] Create test script
- [x] Document changes
- [ ] Commit and push to GitHub
- [ ] Verify Vercel auto-deployment
- [ ] Test on production URL
- [ ] Monitor PostHog dashboard for events
- [ ] Clear production users' localStorage (via announcement)

---

## 🔍 Troubleshooting

### PostHog Not Initializing

1. Check console for errors
2. Verify `NEXT_PUBLIC_POSTHOG_KEY` is set
3. Check Network tab for blocked requests
4. Try incognito mode (clean state)

### Events Not Appearing in Dashboard

1. Verify localStorage has `cookie-consent=accepted`
2. Check console for: `[PostHog] ✅ Analytics ENABLED`
3. Wait 1-2 minutes (PostHog batches events)
4. Check Network tab for POST to `us.i.posthog.com`
5. Verify correct PostHog project in dashboard

### Banner Not Showing

1. Clear localStorage completely
2. Hard refresh (Ctrl+Shift+R)
3. Check if `cookie-consent` key exists
4. Verify component is in layout.tsx

---

## 📚 Related Files

### Modified
- `components/cookie-consent.tsx` - Enhanced banner
- `lib/analytics/posthog-config.ts` - Simplified consent logic
- `app/pt/layout.tsx` - Removed research banner

### Created
- `scripts/test-unified-consent.js` - Test instructions
- `scripts/test-posthog-env.js` - Environment diagnostic
- `docs/posthog-unified-consent-fix.md` - This document

### Kept for Reference
- `components/research-consent-banner.tsx` - Old component (not used)

---

## 🎯 Success Metrics

**Before**: 0 events collected (dual consent barrier)
**After** (expected): 60-80% consent rate (industry standard)

**Monitor**:
1. PostHog event volume (should increase dramatically)
2. Consent acceptance rate via custom event
3. User engagement metrics
4. Research data quality

---

## 📖 Additional Resources

- [PostHog Docs - Consent Management](https://posthog.com/docs/privacy/consent)
- [LGPD Official Portal](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- [Cookie Consent Best Practices](https://gdpr.eu/cookies/)

---

**Status**: ✅ Implementation complete, ready for testing and deployment
