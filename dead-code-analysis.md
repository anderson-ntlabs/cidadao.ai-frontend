# Dead Code Analysis - Cidadão.AI Frontend

## Summary
This analysis identifies potentially unused files, dead code, and obsolete components in the cidadao.ai-frontend repository.

## 1. Versioned Components (V1/V2/V3 Pattern)

### Currently Active (NEXT_PUBLIC_USE_NEW_DESIGN=true)
- `components/ui/button-v2.tsx` ✅ (Active)
- `components/ui/card-v2.tsx` ✅ (Active)

### Obsolete V1 Components
- `components/ui/button-v1.tsx` ❌ (Replaced by V2)
- `components/ui/card-v1.tsx` ❌ (Replaced by V2)
- `components/breadcrumbs-v1.tsx` ❌ (Replaced by V2)
- `components/auth-layout-v1.tsx` ❌ (Replaced by V2)

### Demo Components (Can be removed after V2 stabilization)
- `components/ui/button-v2-demo.tsx` ⚠️
- `components/ui/card-v2-demo.tsx` ⚠️
- `components/breadcrumbs-v2-demo.tsx` ⚠️
- `components/navigation-v2-demo.tsx` ⚠️

## 2. Old Page Versions

### Chat Page Versions
- `app/pt/(authenticated)/chat/page-v1.tsx` ❌
- `app/pt/(authenticated)/chat/page-v2.tsx` ❌
- `app/pt/(authenticated)/chat/page-v3.tsx` ❌
- `app/pt/(authenticated)/chat/page-v4.tsx` ❌

### Dashboard Page Versions
- `app/pt/(authenticated)/dashboard/page-v1.tsx` ❌
- `app/pt/(authenticated)/dashboard/page-v2.tsx` ❌
- `app/pt/(authenticated)/dashboard/page-v3.tsx` ❌

### Home Page Versions
- `app/pt/(authenticated)/home/page-v1.tsx` ❌
- `app/pt/(authenticated)/home/page-v2.tsx` ❌
- `app/pt/(authenticated)/home/page-v3.tsx` ❌

### Investigations Page Versions
- `app/pt/(authenticated)/investigacoes/page-v1.tsx` ❌
- `app/pt/(authenticated)/investigacoes/page-v2.tsx` ❌
- `app/pt/(authenticated)/investigacoes/page-v3.tsx` ❌

### Profile Page Versions
- `app/pt/(authenticated)/perfil/page-v1.tsx` ❌
- `app/pt/(authenticated)/perfil/page-v3.tsx` ❌ (No V2?)

### Login Page Versions
- `app/pt/login/page-v1.tsx` ❌
- `app/pt/login/page-v2.tsx` ❌

## 3. Test/Debug Pages (Not linked anywhere)

- `app/pt/test-auth/page.tsx` ⚠️
- `app/pt/test-breadcrumbs/page.tsx` ⚠️
- `app/pt/test-buttons/page.tsx` ⚠️
- `app/pt/test-cards/page.tsx` ⚠️
- `app/pt/test-layout/page.tsx` ⚠️
- `app/pt/test-navigation/page.tsx` ⚠️
- `app/api/test-backend/route.ts` ⚠️

## 4. Unused Authentication Systems

### Supabase Integration (Not actively used)
- `app/pt/login/page-supabase.tsx` ❌
- `hooks/use-supabase-auth.tsx` ❌ (Referenced but not used in current auth flow)
- `lib/supabase/client.ts` ⚠️
- `lib/supabase/middleware.ts` ⚠️
- `lib/supabase/server.ts` ⚠️
- `supabase/schema.sql` ⚠️
- `supabase/schema-simplified.sql` ⚠️
- `types/supabase.ts` ⚠️

## 5. Unused Chat Adapters

### Potentially Obsolete Adapters
- `lib/api/chat-adapter.ts` ❌ (Original v1, replaced)
- `lib/api/chat-adapter-v2.ts` ❌ (Replaced by v3 and newer)
- `lib/api/chat-adapter-v3.ts` ⚠️ (Still imported but may be superseded)
- `lib/api/chat-direct.ts` ⚠️ (Check if used)
- `lib/api/chat-stream-backend.ts` ⚠️ (Check if used)

### Actively Used Adapters
- `lib/api/chat-adapter-backend.ts` ✅
- `lib/api/chat-adapter-emergency.ts` ✅
- `lib/api/chat-adapter-optimized-maritaca.ts` ✅
- `lib/api/chat-adapter-simple.ts` ✅
- `lib/api/chat-adapter-stable.ts` ✅

## 6. Test Scripts (Keep for development)

### Integration Test Scripts
- All files in `scripts/test-*.js` ✅ (Keep for testing)
- All files in `scripts/test-*.ts` ✅ (Keep for testing)
- All files in `scripts/monitor-*.js` ✅ (Keep for monitoring)

### Utility Scripts
- `scripts/fix-drummond-backend.py` ⚠️ (One-time fix?)
- `scripts/migrate-console-logs.js` ⚠️ (Migration completed?)

## 7. Documentation

### Technical Reports (Historical value)
- `docs/RELATORIOS-TECNICOS/*` ✅ (Keep for reference)

### Potentially Outdated
- `docs/SPRINT-3-SUMMARY.md` ⚠️ (Old sprint)
- `docs/SPRINT-4-SUMMARY.md` ⚠️ (Old sprint)

## 8. Miscellaneous

### Patches
- `PATCHES/fix-drummond-initialization.patch` ⚠️ (Applied already?)

### API Test Files
- `lib/api/test-backend.ts` ⚠️ (Duplicate of scripts?)

### Unused Services
- `lib/api/auth-integration.service.ts` ⚠️ (Check usage)
- `lib/api/natural-language-parser.ts` ⚠️ (Check usage)
- `lib/api/query-parser.ts` ⚠️ (Check usage)

## Recommendations

1. **Immediate Removal** (High confidence - unused):
   - All V1 page versions (page-v1.tsx, page-v2.tsx, page-v3.tsx files)
   - V1 components (button-v1, card-v1, etc.)
   - Supabase login page
   - Original chat adapters (v1, v2)

2. **Review Before Removal** (Medium confidence):
   - Test pages under /pt/test-*
   - Demo components after V2 is stable
   - Supabase integration files (if not planning to use)
   - Old sprint documentation

3. **Keep for Now** (Low confidence or actively used):
   - All test scripts in /scripts
   - Technical reports for historical reference
   - Current chat adapters
   - WebSocket infrastructure (future use)

## Estimated Cleanup Impact
- **Files to Remove**: ~60-70 files
- **Code Reduction**: ~15-20% of application code
- **Benefits**: Cleaner codebase, faster builds, easier maintenance

## Next Steps
1. Verify the analysis by checking imports
2. Create a backup branch before deletion
3. Remove files in batches, testing after each batch
4. Update any remaining references
5. Run full test suite after cleanup