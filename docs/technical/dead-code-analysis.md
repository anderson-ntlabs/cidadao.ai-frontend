# Dead Code Analysis - Sprint 1 Cleanup

## Summary
- **Total files to delete**: 56 files
- **Total lines of code to remove**: ~11,148 lines
- **Categories**: Versioned files, test pages, unused chat adapters

## 1. Files with Version Suffixes (36 files, ~10,349 lines)

### Page Components (17 files)
```
./app/pt/(authenticated)/chat/page-v1.tsx
./app/pt/(authenticated)/chat/page-v2.tsx
./app/pt/(authenticated)/chat/page-v3.tsx
./app/pt/(authenticated)/chat/page-v4.tsx
./app/pt/(authenticated)/dashboard/page-v1.tsx
./app/pt/(authenticated)/dashboard/page-v2.tsx
./app/pt/(authenticated)/dashboard/page-v3.tsx
./app/pt/(authenticated)/home/page-v1.tsx
./app/pt/(authenticated)/home/page-v2.tsx
./app/pt/(authenticated)/home/page-v3.tsx
./app/pt/(authenticated)/investigacoes/page-v1.tsx
./app/pt/(authenticated)/investigacoes/page-v2.tsx
./app/pt/(authenticated)/investigacoes/page-v3.tsx
./app/pt/(authenticated)/perfil/page-v1.tsx
./app/pt/(authenticated)/perfil/page-v3.tsx
./app/pt/login/page-v1.tsx
./app/pt/login/page-v2.tsx
```

### UI Components (13 files)
```
./components/auth-layout-v1.tsx
./components/auth-layout-v2.tsx
./components/breadcrumbs-v1.tsx
./components/breadcrumbs-v2-demo.tsx
./components/breadcrumbs-v2.tsx
./components/header-v2.tsx
./components/layouts/auth-layout-v2.tsx
./components/mobile-nav-v2.tsx
./components/navigation-v2-demo.tsx
./components/navigation-v2.tsx
./components/ui/button-v1.tsx
./components/ui/button-v2-demo.tsx
./components/ui/button-v2.tsx
./components/ui/card-v1.tsx
./components/ui/card-v2-demo.tsx
./components/ui/card-v2.tsx
```

### API Adapters (2 files)
```
./lib/api/chat-adapter-v2.ts
./lib/api/chat-adapter-v3.ts
```

### Test Files (4 files)
```
./tests/e2e/design-system/button-v2.spec.ts
./tests/e2e/design-system/card-v2.spec.ts
```

## 2. Test Pages in Production Routes (6 files, ~373 lines)

```
./app/pt/test-auth/page.tsx
./app/pt/test-breadcrumbs/page.tsx
./app/pt/test-buttons/page.tsx
./app/pt/test-cards/page.tsx
./app/pt/test-layout/page.tsx
./app/pt/test-navigation/page.tsx
```

## 3. Unused Chat Adapters (4 files, ~426 lines)

```
./lib/api/chat-adapter-simple.ts
./lib/api/chat-adapter-stable.ts
./lib/api/chat-adapter-optimized.ts
./lib/api/chat-adapter-optimized-maritaca.ts
```

## Import Dependencies Still Active

### Critical Dependencies to Update Before Deletion:

1. **chat-adapter-v2.ts** and **chat-adapter-v3.ts** are imported by:
   - `./scripts/test-chat-integration.ts`
   - `./lib/api/chat.service.ts`
   - `./lib/services/smart-chat.service.ts`

2. **chat-adapter-optimized-maritaca.ts** is imported by:
   - `./lib/services/smart-chat.service.ts`

3. **UI Components (-v2 versions)** are heavily used:
   - `button-v2.tsx` - imported in 30+ files
   - `card-v2.tsx` - imported in 15+ files
   - `breadcrumbs-v2.tsx` - imported in 20+ files
   - `navigation-v2.tsx` - imported in multiple layout files
   - `auth-layout-v2.tsx` - used as the main authenticated layout

4. **Test pages** are referenced by:
   - `./tests/e2e/design-system/button-v2.spec.ts` (references `/pt/test-buttons`)
   - `./tests/e2e/design-system/card-v2.spec.ts` (references `/pt/test-cards`)

## Recommended Deletion Strategy

### Phase 1: Safe to Delete Immediately
1. Old version pages (`page-v1.tsx`, `page-v2.tsx`, `page-v3.tsx`)
2. Test pages in production routes
3. Demo components (`*-demo.tsx` files)
4. Unused chat adapters (after updating smart-chat.service.ts)

### Phase 2: Requires Code Updates
1. Update imports to use non-versioned components
2. Rename `-v2` components to be the main versions
3. Update all import statements
4. Delete old versioned components

### Phase 3: Clean Up Tests
1. Update or remove e2e tests that reference test pages
2. Remove obsolete test files

## Action Items

1. **Update smart-chat.service.ts** to remove references to:
   - `chat-adapter-optimized-maritaca.ts`

2. **Update chat.service.ts and test scripts** to remove references to:
   - `chat-adapter-v2.ts`
   - `chat-adapter-v3.ts`

3. **Decide on UI component strategy**:
   - Option A: Keep `-v2` components and update all imports
   - Option B: Rename `-v2` components to main versions (recommended)

4. **Update or remove e2e tests** that reference test pages

5. **Remove test pages** from production routes

## Total Impact
- **56 files** to be deleted
- **~11,148 lines** of code to be removed
- **Significant cleanup** of technical debt
- **Improved maintainability** with single component versions