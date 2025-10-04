# Sprint 5: Testing & Quality Assurance

**Duration**: 6-day cycle
**Story Points**: 12
**Focus**: Automated testing infrastructure and comprehensive test coverage

## Sprint Goals

1. Establish robust testing infrastructure
2. Achieve 60%+ test coverage on critical paths
3. Implement E2E testing for main user flows
4. Enable CI/CD integration for automated testing

## Product Backlog Items (PBIs)

### PBI #14: Testing Infrastructure Setup (3 SP)

**Objective**: Configure complete testing infrastructure for the project

**User Story**:
As a developer, I want a complete testing setup so that I can write and run tests efficiently.

**Acceptance Criteria**:
- [x] ~~Jest configured with Next.js~~ (Skipped - using Vitest instead)
- [x] React Testing Library integrated
- [x] Vitest configured for unit tests
- [x] Playwright for E2E tests (installed, browser setup deferred to PBI #16)
- [x] Test coverage reporting (v8 provider)
- [x] VSCode test integration (via Vitest extension)
- [x] npm scripts for all test types
- [x] Documentation in README and test files

**Technical Tasks**:
1. Install and configure Jest + React Testing Library
2. Setup Vitest for fast unit testing
3. Configure Playwright for E2E tests
4. Setup test coverage tools
5. Create test utilities and helpers
6. Configure CI/CD for automated testing
7. Document testing guidelines

**Success Metrics**:
- All test commands work (unit, integration, e2e)
- Coverage report generates successfully
- Tests run in CI/CD pipeline
- Developer documentation complete

---

### PBI #15: Component Testing (4 SP)

**Objective**: Test critical UI components with comprehensive coverage

**User Story**:
As a developer, I want tested components so that UI changes don't break functionality.

**Acceptance Criteria**:
- [x] Core UI components in `/components/ui` tested
- [x] Button component: all variants, states, interactions (19 tests)
- [x] Input component: all variants, sizes, states (41 tests)
- [x] Card/Badge components: rendering, variants (49 + 29 tests)
- [x] Toast component: all variants, dismiss, provider (23 tests)
- [x] Accessibility tests (ARIA, keyboard navigation)
- [x] 60%+ coverage on tested components (Badge: 100%, Card: 100%, Input: 100%, Button: 72.7%, Toast: 83.5%)
- [ ] Snapshot tests for visual regression (deferred)

**Critical Components to Test**:
1. **Button** (`components/ui/button.tsx`)
   - All variants (default, destructive, outline, etc)
   - Click handlers
   - Disabled state
   - Loading state
   - Accessibility (aria-label, keyboard)

2. **Input/Textarea** (`components/ui/input.tsx`)
   - Value changes
   - Validation states
   - Error messages
   - Accessibility

3. **Card** (`components/ui/card.tsx`)
   - Rendering children
   - Glass morphism variants
   - Responsive layout

4. **Badge** (`components/ui/badge.tsx`)
   - All variants
   - Size variations
   - Icon integration

5. **Toast/Notification** (`components/ui/toast.tsx`)
   - Display/hide
   - Auto-dismiss
   - Different severity levels

**Success Metrics**:
- ✅ 60%+ component test coverage achieved (100% on Badge, Card, Input)
- ✅ All critical user interactions tested (click, type, focus, blur, keyboard nav)
- ✅ Zero accessibility violations in tests (aria-*, role, keyboard support)
- ❌ Visual regression tests passing (deferred to future sprint)

**Actual Results**:
- 161 component tests passing
- 5 core UI components fully tested
- 100% pass rate
- Average component coverage: 91.25%

---

### PBI #16: Integration Testing (5 SP)

**Objective**: Test critical user flows and integration points

**User Story**:
As a product owner, I want tested user flows so that core functionality always works.

**Acceptance Criteria**:
- [ ] Authentication flow tested (login/logout)
- [ ] Chat interaction tested (send message, receive response)
- [ ] Dashboard navigation tested
- [ ] Data export tested (PDF, JSON, CSV)
- [ ] API integration tested (mocked responses)
- [ ] Error scenarios tested (network failures, timeouts)
- [ ] E2E tests for main user journeys
- [ ] Performance tests (loading times, responsiveness)

**Critical Flows to Test**:

1. **Authentication Flow**
   ```
   User Journey:
   1. Visit landing page → See login button
   2. Click login → Redirect to auth
   3. Login successful → Redirect to dashboard
   4. Click logout → Clear session → Redirect to landing
   ```

2. **Chat Interaction**
   ```
   User Journey:
   1. Navigate to chat → See input
   2. Type message → Send
   3. See loading state → Receive response
   4. View response → Continue conversation
   ```

3. **Investigation Creation**
   ```
   User Journey:
   1. Dashboard → New investigation
   2. Fill form → Select agent
   3. Submit → See loading
   4. Investigation created → View details
   ```

4. **Data Export**
   ```
   User Journey:
   1. View investigation → Click export
   2. Select format (PDF/JSON/CSV)
   3. Download starts → File received
   4. Verify file content
   ```

**API Integration Tests**:
- Mock backend responses
- Test error handling (400, 401, 403, 500)
- Test timeout scenarios
- Test retry logic
- Test rate limiting

**E2E Test Scenarios**:
1. Complete user registration flow
2. Create and export investigation
3. Navigate between pages
4. Mobile responsive behavior
5. Offline functionality (PWA)

**Success Metrics**:
- All critical paths have E2E tests
- API integration 80%+ covered
- Error scenarios tested
- Performance benchmarks established

---

## Testing Strategy

### Test Pyramid

```
        E2E (10%)
       /         \
      /           \
     / Integration \
    /     (30%)     \
   /                 \
  /   Unit (60%)      \
 /_____________________\
```

### Test Types

1. **Unit Tests** (60% of tests)
   - Pure functions
   - Component logic
   - Utilities and helpers
   - Individual hooks

2. **Integration Tests** (30% of tests)
   - Component + hooks
   - API + services
   - State management + components
   - Multi-component interactions

3. **E2E Tests** (10% of tests)
   - Critical user journeys
   - Authentication flows
   - Data manipulation
   - Cross-page navigation

### Coverage Goals

| Area | Target Coverage | Priority |
|------|----------------|----------|
| Components | 60% | High |
| Hooks | 70% | High |
| Utilities | 80% | Medium |
| API Adapters | 70% | High |
| Pages | 50% | Medium |
| Overall | 60% | Required |

---

## Technical Implementation

### Testing Tools Stack

```json
{
  "unit": "Vitest + React Testing Library",
  "integration": "Jest + MSW (Mock Service Worker)",
  "e2e": "Playwright",
  "coverage": "c8/Istanbul",
  "a11y": "@axe-core/react",
  "visual": "Playwright snapshots"
}
```

### Test File Structure

```
__tests__/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── integration/
│   ├── auth/
│   ├── chat/
│   └── api/
└── e2e/
    ├── auth.spec.ts
    ├── chat.spec.ts
    └── investigations.spec.ts
```

### CI/CD Integration

**GitHub Actions Workflow**:
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Install deps
      - Run unit tests
      - Run integration tests
      - Run E2E tests
      - Upload coverage
      - Comment PR with results
```

---

## Sprint Timeline (6 Days)

### Day 1-2: PBI #14 - Infrastructure
- Install and configure all testing tools
- Setup test utilities
- Configure CI/CD
- Write testing documentation

### Day 3-4: PBI #15 - Component Tests
- Test UI components
- Test form components
- Test layout components
- Achieve 60% component coverage

### Day 5-6: PBI #16 - Integration Tests
- Test authentication flow
- Test chat interactions
- Test data export
- E2E critical paths

---

## Quality Gates

### Definition of Done (DoD)
- [ ] All tests pass in CI/CD
- [ ] 60%+ code coverage achieved
- [ ] No critical bugs in tested code
- [ ] Accessibility tests pass
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Code reviewed and approved

### Exit Criteria
- Minimum 60% test coverage
- All critical paths have tests
- E2E tests for main user journeys
- CI/CD automated testing works
- Zero test failures in main branch

---

## Risk Management

### Potential Risks

1. **Time Constraints**
   - Mitigation: Prioritize critical paths first
   - Fallback: Reduce coverage target to 50%

2. **Complex E2E Scenarios**
   - Mitigation: Start with simple flows
   - Fallback: Mock complex backend interactions

3. **Flaky Tests**
   - Mitigation: Use proper wait strategies
   - Fallback: Retry mechanisms

4. **CI/CD Performance**
   - Mitigation: Parallelize tests
   - Fallback: Run E2E only on main branch

---

## Dependencies

### Required
- Node.js 18+
- npm/yarn
- Backend API for integration tests

### Optional
- Docker for containerized tests
- Headless browsers for E2E
- Coverage reporting service (Codecov)

---

## Success Criteria

✅ **Sprint is successful when**:
1. All 3 PBIs completed (12 SP)
2. 60%+ test coverage achieved
3. CI/CD testing automated
4. Zero test failures in main
5. Documentation complete

📊 **Metrics to Track**:
- Test coverage percentage
- Number of tests (unit/integration/e2e)
- Test execution time
- CI/CD pass rate
- Bug detection rate

---

## References

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
