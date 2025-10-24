# Documentation Index - Cidadão.AI Frontend

**Last Updated**: 2025-01-25 13:00:00 -0300
**Total Files**: 94 documents
**Maintainer**: Frontend Team

---

## 🚀 Quick Navigation

### ⭐ START HERE

**New to the project?**
1. [Project Overview (CLAUDE.md)](../CLAUDE.md) - Complete project reference
2. [Architecture Guide](./guides/ARCHITECTURE.md) - System design and patterns
3. [Component Development](./guides/COMPONENT-DEVELOPMENT.md) - How to build components
4. [Routing Conventions](./ROUTES.md) - App Router structure

**Need to...**
- 🔧 **Fix a bug?** → [Troubleshooting](#troubleshooting)
- 🎨 **Build a component?** → [Component Development](#component-development)
- 🧪 **Write tests?** → [Testing](#testing)
- 🚀 **Deploy to production?** → [Deployment](#deployment)
- ♿ **Add accessibility?** → [Accessibility](#accessibility-a11y)

---

## 📚 Documentation by Category

### Core Architecture

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [System Architecture](./guides/ARCHITECTURE.md) | Complete system design, tech stack, patterns | 2025-01-25 |
| [Routing Conventions](./ROUTES.md) | App Router structure, PT/EN routes | 2025-01-21 |
| [State Management](./technical/state-management-architecture.md) | Zustand stores, actions, persistence | 2025-01-25 |
| [Data Fetching](#) 🚧 | RSC, SSR, CSR strategies | Coming soon |

### Features

#### Chat System

| Document | Description | Status |
|----------|-------------|--------|
| [Chat Integration](./technical/integration/FRONTEND_CHAT_INTEGRATION.md) | Frontend chat implementation | ✅ Complete |
| [Chat Architecture Deep Dive](./technical/chat-architecture-deep-dive.md) | Complete chat system architecture | ✅ Complete |
| [SSE Streaming](./sse-streaming.md) | Server-Sent Events streaming | ✅ Complete |
| [WebSocket](#) 🚧 | WebSocket (future implementation) | Coming soon |

#### Authentication

| Document | Description | Status |
|----------|-------------|--------|
| [OAuth Fix](./oauth-authentication-fix.md) | OAuth callback fix (Jan 2025) | ✅ Complete |
| [Session Management](#) 🚧 | Supabase sessions | Coming soon |

#### Accessibility (A11y)

| Document | Description | Status |
|----------|-------------|--------|
| [VLibras Integration](./accessibility-vlibras.md) | LIBRAS (Brazilian Sign Language) | ✅ Complete |
| [VLibras UX Roadmap](./VLIBRAS_UX_ROADMAP.md) | Future VLibras enhancements | ✅ Complete |
| [Accessibility Panel](#) 🚧 | Unified a11y controls | Coming soon |
| [Keyboard Navigation](#) 🚧 | Keyboard shortcuts reference | Coming soon |

#### Transparency Map

| Document | Description | Status |
|----------|-------------|--------|
| [Integration Complete](./transparency-map-integration-complete.md) | Railway backend integration | ✅ Complete |
| [Fallback Handling](./transparency-map-fallback.md) | Offline/error fallback UI | ✅ Complete |

#### Other Features

| Document | Description | Status |
|----------|-------------|--------|
| [Agent Thinking Indicator](./agent-thinking-indicator.md) | Chat loading states | ✅ Complete |
| [Tour System](#) 🚧 | User onboarding tours | Coming soon |
| [Telemetry](#) 🚧 | Event tracking and analytics | Coming soon |

### Component Development

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [Development Guide](./guides/COMPONENT-DEVELOPMENT.md) | Patterns, best practices | 2025-10-04 |
| [Component API Reference](./technical/component-api-reference.md) | Complete component documentation | ✅ 2025-01-25 |
| [Design System v2](./design/design-system-v2.md) | Colors, typography, spacing | Latest |
| [Dark Mode](./design/DARK-MODE-PRESERVATION.md) | Dark mode implementation | Latest |
| [Component Template](./templates/COMPONENT_DOCS.md) | Documentation template | Latest |

**Component Categories** (✅ Fully documented):
- `a11y/` - Accessibility components (AccessibilityPanel, VLibras, FontSize, etc.)
- `charts/` - Chart components (LineChart, BarChart, PieChart, AreaChart)
- `dev/` - Development tools (TelemetryPanel, WebVitalsMonitor)
- `hints/` - Adaptive hints system (AdaptiveHintsProvider)
- `markdown/` - Secure markdown rendering (MarkdownRenderer)
- `tour/` - Interactive tours (InteractiveTour, TourControls)
- `onboarding/` - User onboarding (OnboardingFlow)
- `ui/` - Reusable UI primitives (shadcn/ui based)

### Testing

| Document | Description | Status |
|----------|-------------|--------|
| [Testing Strategy Guide](./guides/TESTING-STRATEGY.md) | Complete testing strategy: Vitest, Playwright, integration, accessibility | ✅ Complete |
| [Testing Guide (Original)](./guides/TESTING.md) | Basic testing patterns and examples | ✅ Complete |
| [Manual Test Scripts](#) 🚧 | scripts/ documentation | Coming soon |

**Test Sessions** (Historical):
- [Test Session 2025-10-06](./testing/TEST_SESSION_2025-10-06.md)

### Deployment

| Document | Description | Status |
|----------|-------------|--------|
| [Production Checklist](./deployment/PRODUCTION_DEPLOY_CHECKLIST.md) | Pre-deployment checklist | ✅ Complete |
| [Vercel KV Setup](./infrastructure/VERCEL_KV_SETUP_COMPLETE.md) | Vercel KV configuration | ✅ Complete |
| [Sentry Setup](./infrastructure/SENTRY_SETUP_COMPLETE.md) | Error tracking setup | ✅ Complete |
| [Monitoring](./infrastructure/MONITORING_SETUP.md) | Grafana + Prometheus | ✅ Complete |
| [Security Hardening Guide](./infrastructure/security-hardening-guide.md) | Complete guide: CSP, headers, rate limiting, auth, OWASP Top 10 | ✅ Complete |
| [Security Checklist](./technical/SECURITY-CHECKLIST.md) | Security audit checklist | ✅ Complete |

### Performance

| Document | Description | Status |
|----------|-------------|--------|
| [Bundle Optimization Guide](./technical/bundle-optimization.md) | Complete guide: webpack, code splitting, dynamic imports, image optimization | ✅ Complete |
| [Lighthouse CI Guide](./infrastructure/lighthouse-ci-guide.md) | Complete setup: budgets, CI/CD, report analysis, troubleshooting | ✅ Complete |
| [Optimization Report](./optimization/OPTIMIZATION-REPORT.md) | Performance optimizations | ✅ Complete |
| [Web Vitals](#) 🚧 | Core Web Vitals tracking implementation | Coming soon |

### API Integration

| Document | Description | Status |
|----------|-------------|--------|
| [API Data Structures](./technical/REFERENCE/API_DATA_STRUCTURES.md) | Backend API types | ✅ Complete |
| [Backend Integration Status](./FRONTEND-BACKEND-INTEGRATION-STATUS.md) | Integration status | ✅ Complete |
| [Backend Integration Analysis](./frontend-backend-integration-analysis.md) | Integration analysis | ✅ Complete |

### Planning & Project Management

#### Active Planning

| Document | Description | Status |
|----------|-------------|--------|
| [Sprint Plan](./sprints/sprint-plan-deadline-nov30.md) | Active sprint plan | ✅ Current |
| [Action Plan 2025 Q4](./sprints/action-plan-2025-q4.md) | Quarterly roadmap | ✅ Current |

#### Historical Planning

📁 [Planning Directory](./planning/) - Historical sprint plans and analyses
📁 [Sprints Directory](./sprints/) - Sprint execution records

### Reports & Analysis

#### Recent Reports

| Document | Description | Date |
|----------|-------------|------|
| [Documentation Gap Analysis](./technical/DOCUMENTATION_GAP_ANALYSIS_2025-01.md) | Doc drift analysis | 2025-01-25 |
| [Code Analysis Report](./CODE_ANALYSIS_REPORT.md) | Codebase analysis | Latest |
| [Dead Code Analysis](./technical/dead-code-analysis.md) | Unused code detection | Latest |

📁 [Reports Directory](./reports/) - All technical reports (24 files)

### Design & UX

| Document | Description | Status |
|----------|-------------|--------|
| [Design System v2](./design/design-system-v2.md) | Complete design system | ✅ Complete |
| [UI/UX Improvements](./design/UI-UX-IMPROVEMENTS.md) | Improvement proposals | ✅ Complete |
| [User Experience Visual](./USER-EXPERIENCE-VISUAL.md) | Visual UX guide | ✅ Complete |
| [User Journey Complete](./USER-JOURNEY-COMPLETE.md) | User journey maps | ✅ Complete |

📁 [UX Analysis](./design/ux-analysis/) - Screenshots and analysis reports

### Contributing

| Document | Description | Status |
|----------|-------------|--------|
| [Contributing Guide](./guides/CONTRIBUTING.md) | How to contribute | ✅ Complete |
| [Branch Protection](./technical/branch-protection-guide.md) | Git workflow | ✅ Complete |

### Reference Materials

| Document | Description | Status |
|----------|-------------|--------|
| [Changelog](./changelog/CHANGELOG.md) | Version history | ✅ Maintained |
| [Codebase Report](./technical/REFERENCE/RELATORIO_CODEBASE.md) | Complete codebase analysis | ✅ Complete |
| [Integration Manual](./technical/REFERENCE/MANUAL_INTEGRACAO_FRONTEND.md) | Integration manual (PT) | ✅ Complete |

---

## 🔍 Find Documentation By...

### By Topic

**Authentication**
- [OAuth Fix](./oauth-authentication-fix.md)

**Chat**
- [Chat Integration](./technical/integration/FRONTEND_CHAT_INTEGRATION.md)
- [Maritaca Integration](./technical/integration/MARITACA_INTEGRATION.md) (Historical)

**Accessibility**
- [VLibras Integration](./accessibility-vlibras.md)
- [VLibras Roadmap](./VLIBRAS_UX_ROADMAP.md)

**Performance**
- [Optimization Report](./optimization/OPTIMIZATION-REPORT.md)

**Security**
- [Security Hardening](./infrastructure/SECURITY_HARDENING.md)
- [Security Checklist](./technical/SECURITY-CHECKLIST.md)

### By File Type

**Guides** → [guides/](./guides/)
**Technical Docs** → [technical/](./technical/)
**Reports** → [reports/](./reports/)
**Infrastructure** → [infrastructure/](./infrastructure/)
**Design** → [design/](./design/)

---

## 📋 Documentation Status

### Coverage by Category

| Category | Files | Coverage | Status |
|----------|-------|----------|--------|
| Architecture | 4 | 70% | 🟡 Good |
| Features | 12 | 40% | 🔴 Needs work |
| Components | 5 | 30% | 🔴 Needs work |
| Testing | 3 | 60% | 🟡 Good |
| Deployment | 6 | 80% | 🟢 Excellent |
| API Integration | 3 | 50% | 🟡 Good |

**Overall Coverage**: ~60% of codebase documented

### Staleness Report

| Age | Count | Action Needed |
|-----|-------|---------------|
| < 1 month | 8 | ✅ Fresh |
| 1-3 months | 24 | 🟡 Review |
| 3-6 months | 35 | 🟠 Update soon |
| > 6 months | 27 | 🔴 Urgent update |

---

## 🆕 Recent Updates

**2025-01-25**
- ✅ Created comprehensive Documentation Gap Analysis
- ✅ Fixed Chat Adapter documentation (removed fictional adapters)
- ✅ Added complete VLibras (LIBRAS) integration guide
- ✅ Documented PWA migration (next-pwa → Serwist)
- ✅ Created this INDEX.md

**2025-01-21**
- Updated ROUTES.md with Phase 1 simplification

**2025-10-22**
- Fixed OAuth authentication callback issue

---

## 🚧 Coming Soon

### Priority 1 (This Sprint)

1. **Chat Architecture Deep Dive** - Complete chat system documentation
2. **SSE Streaming Guide** - Server-Sent Events implementation
3. **Component API Reference** - Document all component categories
4. **Manual Test Scripts** - Document scripts/ testing tools

### Priority 2 (Next Sprint)

5. **State Management Guide** - Zustand stores deep dive
6. **Testing Strategy Expansion** - Complete testing documentation
7. **Bundle Optimization** - Webpack configuration guide
8. **Security Documentation** - CSP, rate limiting, headers

### Priority 3 (Long-term)

9. **Documentation Reorganization** - Implement numbered structure (01-10)
10. **Automated Doc Generation** - Component reference from Storybook
11. **OpenAPI Type Generation** - Auto-sync with backend

See [Improvement Roadmap](./IMPROVEMENT_ROADMAP_2025-01.md) for complete plan.

---

## 🛠️ Maintenance

### How to Update This Index

**Manual Update**:
1. Edit this file when adding/removing docs
2. Update "Last Updated" timestamp
3. Keep coverage statistics current

**Automated Update** (Future):
```bash
# Generate index from directory structure
npm run docs:generate-index
```

### Documentation Guidelines

1. **File Naming**: Use lowercase with hyphens for reports (e.g., `oauth-fix.md`)
2. **Headers**: All docs should have metadata header (author, date, location)
3. **Language**: Technical docs in English, reports can be in Portuguese
4. **Links**: Use relative links within docs (e.g., `./guides/ARCHITECTURE.md`)
5. **Status**: Mark as 🚧 (coming soon), ✅ (complete), 🔴 (needs update)

---

## 📞 Support

**Questions about documentation?**
- Check this INDEX first
- Search docs with Ctrl+F
- Ask in team Slack channel
- Create issue on GitHub

**Found a broken link?**
- Report in team channel
- Fix and submit PR
- Update this INDEX

**Want to contribute docs?**
- See [Contributing Guide](./guides/CONTRIBUTING.md)
- Use [Component Template](./templates/COMPONENT_DOCS.md)
- Follow documentation guidelines above

---

## 🎯 Documentation Goals

**Short-term (1 month)**:
- 🎯 80% documentation coverage
- 🎯 Zero broken internal links
- 🎯 <30 second doc discovery time

**Long-term (3 months)**:
- 🎯 Automated doc generation
- 🎯 OpenAPI type sync
- 🎯 Reorganized structure (01-10)
- 🎯 CI link checker

---

**Maintained by**: Frontend Team
**Last Full Audit**: 2025-01-25
**Next Audit**: 2025-04-25 (Quarterly)

---

## 📖 External Resources

- **Next.js 15 Docs**: https://nextjs.org/docs
- **Serwist PWA**: https://serwist.pages.dev/
- **Zustand**: https://zustand.docs.pmnd.rs/
- **VLibras**: https://www.gov.br/governodigital/pt-br/vlibras
- **Railway (Backend)**: https://railway.app/
- **Vercel**: https://vercel.com/docs
