# Remediation Roadmap - Technical Debt Sprint

**Start Date**: December 9, 2025
**End Date**: January 10, 2026 (5 weeks)
**Team**: Auditors & Engineering
**Goal**: Raise project score from 6.7/10 to 8.5/10

---

## Sprint Overview

```
Week 1 (Dec 9-13)   : CRITICAL - Security & Architecture Blockers
Week 2 (Dec 16-20)  : HIGH - Testing Foundation & Auth Security
Week 3 (Dec 23-27)  : MEDIUM - Code Quality & Refactoring
Week 4 (Dec 30-Jan 3): MEDIUM - Testing Expansion & Documentation
Week 5 (Jan 6-10)   : POLISH - Final fixes & Verification Audit
```

---

## Week 1: CRITICAL - Security & Architecture Blockers

**Goal**: Eliminate all critical and high-severity security vulnerabilities

### Day 1 (Monday, Dec 9)

| Task                                       | Owner | Effort | File(s)                                         | Status |
| ------------------------------------------ | ----- | ------ | ----------------------------------------------- | ------ |
| Move Maritaca API key to server-side       | -     | 2h     | `lib/chat/adapters/fallback.adapter.ts`, `.env` | [ ]    |
| Create `/api/chat/maritaca` proxy endpoint | -     | 1h     | `app/api/chat/maritaca/route.ts` (new)          | [ ]    |
| Update FallbackAdapter to use proxy        | -     | 1h     | `lib/chat/adapters/fallback.adapter.ts`         | [ ]    |

**Deliverable**: API key no longer exposed in browser bundle

### Day 2 (Tuesday, Dec 10)

| Task                                | Owner | Effort | File(s)                         | Status |
| ----------------------------------- | ----- | ------ | ------------------------------- | ------ |
| Fix auth bypass vulnerability       | -     | 30m    | `lib/supabase/middleware.ts:10` | [ ]    |
| Add OAuth redirect validation       | -     | 1h     | `app/auth/callback/route.ts`    | [ ]    |
| Set oauth_session_ready to httpOnly | -     | 30m    | `app/auth/callback/route.ts:95` | [ ]    |
| Add allowed redirect paths constant | -     | 30m    | `lib/constants/auth.ts` (new)   | [ ]    |

**Deliverable**: OAuth flow secure, no auth bypass possible

### Day 3 (Wednesday, Dec 11)

| Task                                  | Owner | Effort | File(s)                                     | Status |
| ------------------------------------- | ----- | ------ | ------------------------------------------- | ------ |
| Replace Map with Record in chat-store | -     | 2h     | `store/chat-store.ts:48,124`                | [ ]    |
| Remove WebSocket from Zustand state   | -     | 1h     | `store/chat-store.ts:66,136`                | [ ]    |
| Create WebSocket singleton if needed  | -     | 1h     | `lib/websocket/chat-websocket-singleton.ts` | [ ]    |

**Deliverable**: Zustand DevTools functional, state serializable

### Day 4 (Thursday, Dec 12)

| Task                                      | Owner | Effort | File(s)                       | Status |
| ----------------------------------------- | ----- | ------ | ----------------------------- | ------ |
| Delete WebSocket dead code                | -     | 1h     | `store/chat-store.ts:709-758` | [ ]    |
| Remove broken investigation subscriptions | -     | 30m    | `store/chat-store.ts:793-802` | [ ]    |
| Clean up unused imports                   | -     | 30m    | Multiple                      | [ ]    |
| Run type-check, fix errors                | -     | 1h     | -                             | [ ]    |

**Deliverable**: No dead code in chat-store

### Day 5 (Friday, Dec 13)

| Task                          | Owner | Effort | File(s)                     | Status |
| ----------------------------- | ----- | ------ | --------------------------- | ------ |
| Audit legacy chat adapters    | -     | 2h     | `lib/api/chat-adapter-*.ts` | [ ]    |
| Delete confirmed legacy files | -     | 1h     | TBD based on audit          | [ ]    |
| Update imports if needed      | -     | 1h     | Multiple                    | [ ]    |
| Week 1 verification testing   | -     | 2h     | -                           | [ ]    |

**Deliverable**: Chat adapter architecture clean, documented

### Week 1 Success Criteria

- [ ] `npm run build` succeeds
- [ ] `npm run type-check` succeeds
- [ ] No API keys in browser bundle (verify with DevTools)
- [ ] Auth bypass header doesn't work in production mode
- [ ] Zustand DevTools shows state correctly
- [ ] Security vulnerabilities: Critical 0, High reduced to 2

---

## Week 2: HIGH - Testing Foundation & Auth Security

**Goal**: Establish testing foundation for critical paths, complete auth security

### Day 6 (Monday, Dec 16)

| Task                              | Owner | Effort | File(s)                                       | Status |
| --------------------------------- | ----- | ------ | --------------------------------------------- | ------ |
| Create Supabase test mock factory | -     | 2h     | `__tests__/fixtures/supabase-mock.ts`         | [ ]    |
| Write auth-helpers.ts tests       | -     | 2h     | `lib/supabase/__tests__/auth-helpers.test.ts` | [ ]    |
| Write middleware.ts tests         | -     | 2h     | `lib/supabase/__tests__/middleware.test.ts`   | [ ]    |

### Day 7 (Tuesday, Dec 17)

| Task                          | Owner | Effort | File(s)                                  | Status |
| ----------------------------- | ----- | ------ | ---------------------------------------- | ------ |
| Write use-agora.tsx tests     | -     | 3h     | `hooks/__tests__/use-agora.test.tsx`     | [ ]    |
| Write use-agora-auth.ts tests | -     | 2h     | `hooks/__tests__/use-agora-auth.test.ts` | [ ]    |
| Write use-agora-demo.ts tests | -     | 2h     | `hooks/__tests__/use-agora-demo.test.ts` | [ ]    |

### Day 8 (Wednesday, Dec 18)

| Task                                    | Owner | Effort | File(s)                      | Status |
| --------------------------------------- | ----- | ------ | ---------------------------- | ------ |
| Migrate auth tokens to httpOnly cookies | -     | 3h     | `middleware.ts`, stores      | [ ]    |
| Update cookie handling in auth callback | -     | 2h     | `app/auth/callback/route.ts` | [ ]    |
| Test auth flow end-to-end               | -     | 2h     | Manual + E2E                 | [ ]    |

### Day 9 (Thursday, Dec 19)

| Task                                   | Owner | Effort | File(s)                                      | Status |
| -------------------------------------- | ----- | ------ | -------------------------------------------- | ------ |
| Optimize Zustand subscriptions in chat | -     | 2h     | `app/pt/app/chat/page.tsx`                   | [ ]    |
| Create useChatSelectors hook           | -     | 1h     | `hooks/use-chat-selectors.ts` (new)          | [ ]    |
| Write tests for new hook               | -     | 1h     | `hooks/__tests__/use-chat-selectors.test.ts` | [ ]    |
| Performance benchmark before/after     | -     | 1h     | -                                            | [ ]    |

### Day 10 (Friday, Dec 20)

| Task                                | Owner | Effort | File(s)                                | Status |
| ----------------------------------- | ----- | ------ | -------------------------------------- | ------ |
| Write accessibility component tests | -     | 3h     | `components/a11y/__tests__/*.test.tsx` | [ ]    |
| Add WCAG assertions                 | -     | 1h     | Test utilities                         | [ ]    |
| Run coverage report                 | -     | 1h     | -                                      | [ ]    |
| Week 2 verification                 | -     | 2h     | -                                      | [ ]    |

### Week 2 Success Criteria

- [ ] Coverage increased from 23.61% to 40%+
- [ ] All auth paths have test coverage
- [ ] Agora hooks fully tested
- [ ] Auth tokens no longer in localStorage
- [ ] Chat page re-renders reduced by 50%+

---

## Week 3: MEDIUM - Code Quality & Refactoring

**Goal**: Reduce technical debt, improve type safety

### Day 11 (Monday, Dec 23)

| Task                              | Owner | Effort | File(s)                 | Status |
| --------------------------------- | ----- | ------ | ----------------------- | ------ |
| Fix `any` types in export-service | -     | 2h     | `lib/export-service.ts` | [ ]    |
| Fix `any` types in chat-store     | -     | 1h     | `store/chat-store.ts`   | [ ]    |
| Fix `any` types in use-chat.ts    | -     | 1h     | `hooks/use-chat.ts`     | [ ]    |
| Fix `any` types in api/client.ts  | -     | 1h     | `lib/api/client.ts`     | [ ]    |

### Day 12 (Tuesday, Dec 24)

| Task                              | Owner | Effort | File(s)                  | Status |
| --------------------------------- | ----- | ------ | ------------------------ | ------ |
| Consolidate export-service files  | -     | 3h     | `lib/export-service*.ts` | [ ]    |
| Keep only `lib/export-service.ts` | -     | 1h     | Delete others            | [ ]    |
| Update all imports                | -     | 1h     | Multiple                 | [ ]    |

### Day 13 (Thursday, Dec 26)

| Task                       | Owner | Effort | File(s)                                    | Status |
| -------------------------- | ----- | ------ | ------------------------------------------ | ------ |
| Split use-agora.tsx Part 1 | -     | 2h     | Create `hooks/agora/use-agora-xp.ts`       | [ ]    |
| Split use-agora.tsx Part 2 | -     | 2h     | Create `hooks/agora/use-agora-badges.ts`   | [ ]    |
| Split use-agora.tsx Part 3 | -     | 2h     | Create `hooks/agora/use-agora-sessions.ts` | [ ]    |

### Day 14 (Friday, Dec 27)

| Task                        | Owner | Effort | File(s)                       | Status |
| --------------------------- | ----- | ------ | ----------------------------- | ------ |
| Complete use-agora refactor | -     | 2h     | `hooks/agora/index.ts` barrel | [ ]    |
| Update all imports          | -     | 1h     | Multiple                      | [ ]    |
| Write tests for new hooks   | -     | 3h     | `hooks/agora/__tests__/`      | [ ]    |
| Week 3 verification         | -     | 1h     | -                             | [ ]    |

### Week 3 Success Criteria

- [ ] `any` usage reduced from 143 to <50
- [ ] Export service consolidated to 1 file
- [ ] use-agora.tsx split into 4 smaller hooks
- [ ] No duplicate functionality in chat adapters

---

## Week 4: MEDIUM - Testing Expansion & Documentation

**Goal**: Expand test coverage, document patterns

### Day 15 (Monday, Dec 30)

| Task                             | Owner | Effort | File(s)                                        | Status |
| -------------------------------- | ----- | ------ | ---------------------------------------------- | ------ |
| Write badge-store.ts tests       | -     | 2h     | `store/__tests__/badge-store.test.ts`          | [ ]    |
| Write survey-store.ts tests      | -     | 2h     | `store/__tests__/survey-store.test.ts`         | [ ]    |
| Write voice-settings-store tests | -     | 1h     | `store/__tests__/voice-settings-store.test.ts` | [ ]    |

### Day 16 (Tuesday, Dec 31)

| Task                            | Owner | Effort | File(s)         | Status |
| ------------------------------- | ----- | ------ | --------------- | ------ |
| Enable TypeScript strict checks | -     | 30m    | `tsconfig.json` | [ ]    |
| Fix noUnusedLocals warnings     | -     | 2h     | Multiple        | [ ]    |
| Fix noUnusedParameters warnings | -     | 2h     | Multiple        | [ ]    |

### Day 17 (Thursday, Jan 2)

| Task                          | Owner | Effort | File(s)        | Status |
| ----------------------------- | ----- | ------ | -------------- | ------ |
| Migrate console.log to logger | -     | 3h     | 63 files       | [ ]    |
| Remove unused dependencies    | -     | 30m    | `package.json` | [ ]    |
| Run `npm audit fix`           | -     | 30m    | -              | [ ]    |

### Day 18 (Friday, Jan 3)

| Task                               | Owner | Effort | File(s)                                  | Status |
| ---------------------------------- | ----- | ------ | ---------------------------------------- | ------ |
| Document barrel file patterns      | -     | 1h     | `docs/06-development/import-patterns.md` | [ ]    |
| Document chat adapter architecture | -     | 1h     | `docs/02-architecture/chat-system.md`    | [ ]    |
| Update CLAUDE.md with new patterns | -     | 1h     | `CLAUDE.md`                              | [ ]    |
| Week 4 verification                | -     | 1h     | -                                        | [ ]    |

### Week 4 Success Criteria

- [ ] Coverage increased to 55%+
- [ ] TypeScript strict mode enabled
- [ ] No console.log in production code
- [ ] Documentation updated

---

## Week 5: POLISH - Final Fixes & Verification Audit

**Goal**: Final polish, verification audit, prepare for production

### Day 19 (Monday, Jan 6)

| Task                            | Owner | Effort | File(s)                      | Status |
| ------------------------------- | ----- | ------ | ---------------------------- | ------ |
| Add SRI to external CDN scripts | -     | 2h     | `lib/security/csp.config.ts` | [ ]    |
| Implement CSP report-only mode  | -     | 1h     | `middleware.ts`              | [ ]    |
| Add missing security headers    | -     | 1h     | `middleware.ts`              | [ ]    |

### Day 20 (Tuesday, Jan 7)

| Task                                     | Owner | Effort | File(s)                                     | Status |
| ---------------------------------------- | ----- | ------ | ------------------------------------------- | ------ |
| Write E2E test: Login → Dashboard → Chat | -     | 3h     | `__tests__/e2e/critical-flow.spec.ts`       | [ ]    |
| Write E2E test: Agora onboarding         | -     | 2h     | `__tests__/e2e/agora/complete-flow.spec.ts` | [ ]    |
| Fix skipped auth E2E tests               | -     | 2h     | `__tests__/e2e/auth.spec.ts`                | [ ]    |

### Day 21 (Wednesday, Jan 8)

| Task                          | Owner | Effort | File(s)            | Status |
| ----------------------------- | ----- | ------ | ------------------ | ------ |
| Final coverage push to 60%+   | -     | 4h     | Various test files | [ ]    |
| Fix any remaining type errors | -     | 2h     | Multiple           | [ ]    |
| Performance testing           | -     | 2h     | Lighthouse CI      | [ ]    |

### Day 22 (Thursday, Jan 9)

| Task                     | Owner | Effort | File(s)                  | Status |
| ------------------------ | ----- | ------ | ------------------------ | ------ |
| Full regression testing  | -     | 4h     | All tests                | [ ]    |
| Security scan            | -     | 2h     | npm audit, manual review | [ ]    |
| Bundle size verification | -     | 1h     | ANALYZE=true build       | [ ]    |

### Day 23 (Friday, Jan 10)

| Task                         | Owner | Effort | File(s)                                        | Status |
| ---------------------------- | ----- | ------ | ---------------------------------------------- | ------ |
| Generate final audit report  | -     | 2h     | `docs/10-reference/2026-01-10-audit-report.md` | [ ]    |
| Team retrospective           | -     | 1h     | -                                              | [ ]    |
| Create maintenance checklist | -     | 1h     | `docs/10-reference/maintenance-checklist.md`   | [ ]    |
| Celebrate!                   | ALL   | -      | -                                              | [ ]    |

### Week 5 Success Criteria

- [ ] Coverage at 60%+ (threshold met)
- [ ] All critical E2E flows tested
- [ ] Security score: A- or better
- [ ] Bundle size < 400KB
- [ ] Lighthouse score > 90
- [ ] Final audit score: 8.5/10+

---

## Success Metrics

### Before (Dec 8, 2025)

| Metric                              | Value  |
| ----------------------------------- | ------ |
| Test Coverage                       | 23.61% |
| `any` Type Usage                    | 143    |
| Security Vulnerabilities (Critical) | 1      |
| Security Vulnerabilities (High)     | 5      |
| Dead Code Lines                     | 49+    |
| Duplicate Files                     | 7      |
| Overall Score                       | 6.7/10 |

### Target (Jan 10, 2026)

| Metric                              | Target |
| ----------------------------------- | ------ |
| Test Coverage                       | 60%+   |
| `any` Type Usage                    | <30    |
| Security Vulnerabilities (Critical) | 0      |
| Security Vulnerabilities (High)     | 0      |
| Dead Code Lines                     | 0      |
| Duplicate Files                     | 0      |
| Overall Score                       | 8.5/10 |

---

## Risk Mitigation

### Risk: Breaking Changes During Refactoring

**Mitigation**:

1. Always run `npm run type-check` after changes
2. Run test suite after each file modification
3. Use feature flags for auth changes
4. Have rollback plan ready

### Risk: Holiday Schedule Disruption

**Mitigation**:

1. Front-load critical work in Weeks 1-2
2. Week 3-4 can flex if needed
3. Document handoff points

### Risk: Hidden Dependencies on Dead Code

**Mitigation**:

1. Search for all imports before deleting
2. Use `git grep` to find string references
3. Keep deleted code in branch until verified

---

## Daily Standups

**Time**: 9:00 AM BRT (UTC-3)
**Format**: 15 minutes max

1. What did you complete yesterday?
2. What are you working on today?
3. Any blockers?

---

## Definition of Done

For each task to be marked complete:

- [ ] Code changes committed with conventional commit message
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] Related tests pass
- [ ] PR reviewed (if applicable)
- [ ] No new `any` types introduced
- [ ] No new console.log statements

---

## Communication

- **Daily Updates**: Slack #cidadao-engineering
- **Blockers**: Immediate Slack message to team lead
- **Code Reviews**: Within 4 hours of PR submission
- **Documentation**: Update as you go, not at the end

---

## Resources

- [Audit Report](./2025-12-08-technical-audit-report.md)
- [CLAUDE.md](../../CLAUDE.md) - Project conventions
- [Testing Guide](../08-testing/) - Testing patterns
- [Architecture Docs](../02-architecture/) - System design

---

**Let's ship a secure, tested, maintainable codebase!**

---

_Roadmap created: December 8, 2025_
_Last updated: December 8, 2025_
