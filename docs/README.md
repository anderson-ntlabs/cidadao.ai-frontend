# Cidadão.AI Frontend Documentation

[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-91%25-brightgreen)](https://github.com/anderson-ufrj/cidadao.ai-frontend)
[![Bundle Size](https://img.shields.io/badge/bundle-254kB-success)](./11-performance/bundle-analysis-2025-11-22.md)
[![Lighthouse](https://img.shields.io/badge/lighthouse-97.8-success)](./11-performance/bundle-analysis-2025-11-22.md)
[![License](https://img.shields.io/badge/license-MIT-blue)](../LICENSE)

**Project**: Cidadão.AI - Brazilian Government Transparency Platform
**Repository**: cidadao.ai-frontend
**Tech Stack**: Next.js 15, TypeScript, Tailwind CSS, Supabase Auth
**Last Updated**: November 22, 2025

---

## 📚 Documentation Structure

Our documentation is organized into numbered sections for easy navigation:

| Section                                      | Description                                     |
| -------------------------------------------- | ----------------------------------------------- |
| [01 - Getting Started](#-01-getting-started) | Installation, setup, quick start                |
| [02 - Architecture](#️-02-architecture)      | System design and technical architecture        |
| [03 - Features](#-03-features)               | Feature documentation and implementation guides |
| [04 - API Reference](#-04-api-reference)     | API documentation and data structures           |
| [05 - Guides](#-05-guides)                   | Development guides and best practices           |
| [06 - Development](#-06-development)         | Coding standards and patterns                   |
| [07 - Design](#-07-design)                   | Design system and UI/UX documentation           |
| [08 - Testing](#-08-testing)                 | Testing strategies and guides                   |
| [09 - Deployment](#-09-deployment)           | Deployment and DevOps documentation             |
| [10 - Reference](#-10-reference)             | Reference materials and migration guides        |
| [11 - Performance](#-11-performance)         | Performance optimization and analysis           |
| [12 - Landing Page](#-12-landing-page)       | Landing page design and implementation          |
| [Archive](#️-archive)                        | Historical documentation and reports            |

---

## 🚀 01 - Getting Started

Essential documentation to get you up and running:

- **[Quick Start Guide](./01-getting-started/quick-start.md)** - Get running in 5 minutes
- **[Installation](./01-getting-started/installation.md)** - Detailed installation steps
- **[Environment Setup](./01-getting-started/environment-setup.md)** - Configure your environment variables

---

## 🏗️ 02 - Architecture

Technical architecture and system design (26 documents):

### Core Architecture

- **[API Integration Guide](./02-architecture/api-integration-guide.md)** - Backend API integration patterns
- **[State Management](./02-architecture/state-management-architecture.md)** - Zustand state management
- **[Data Fetching Strategies](./02-architecture/data-fetching-strategies.md)** - Server/client data fetching
- **[Routes Structure](./02-architecture/ROUTES.md)** - Application routing architecture

### Chat System

- **[Chat Architecture Deep Dive](./02-architecture/chat-architecture-deep-dive.md)** - Multi-adapter chat system
- **[Chat Architecture](./02-architecture/chat-architecture.md)** - Chat implementation overview
- **[SSE Streaming](./02-architecture/sse-streaming.md)** - Server-Sent Events streaming
- **[Chat Migration Complete](./02-architecture/CHAT_MIGRATION_COMPLETE.md)** - Chat refactor documentation

### Backend Integration

- **[Frontend-Backend Integration Analysis](./02-architecture/frontend-backend-integration-analysis.md)** - Integration assessment
- **[Frontend-Backend Integration Status](./02-architecture/FRONTEND-BACKEND-INTEGRATION-STATUS.md)** - Current status
- **[Backend Real Data Analysis](./02-architecture/backend-real-data-analysis.md)** - Real data integration
- **[Maritaca Integration](./02-architecture/MARITACA_INTEGRATION.md)** - Maritaca AI integration

### Security & Best Practices

- **[Security Checklist](./02-architecture/SECURITY-CHECKLIST.md)** - Security best practices
- **[Branch Protection Guide](./02-architecture/branch-protection-guide.md)** - Git workflow security
- **[Dead Code Analysis](./02-architecture/dead-code-analysis.md)** - Code cleanup analysis

---

## ✨ 03 - Features

Detailed feature documentation organized by category:

### Accessibility

- **[Accessibility Overview](./03-features/accessibility.md)** - WCAG AAA compliance
- **[VLibras Integration](./03-features/accessibility/vlibras.md)** - Brazilian Sign Language (LIBRAS)
- **[VLibras UX Roadmap](./03-features/accessibility/VLIBRAS_UX_ROADMAP.md)** - VLibras improvements
- **[Vercel VLibras Config](./03-features/accessibility/VERCEL_VLIBRAS_CONFIG.md)** - Production deployment

### Analytics

- **[PostHog Integration](./03-features/analytics/posthog-integration.md)** - User analytics
- **[Telemetry System](./03-features/analytics/telemetry.md)** - Event tracking
- **[Usability Analytics](./03-features/analytics/USABILITY_ANALYTICS_IMPLEMENTATION.md)** - User behavior analysis
- **[Setup Guide](./03-features/analytics/SETUP_GUIDE.md)** - Analytics configuration
- **[Troubleshooting](./03-features/analytics/POSTHOG_TROUBLESHOOTING.md)** - Common issues

### Mobile Optimization

- **[Mobile Optimization README](./03-features/mobile-optimization/README.md)** - Mobile strategy overview
- **[Technical Analysis 2025-11-04](./03-features/mobile-optimization/2025-11-04-TECHNICAL-ANALYSIS.md)** - Mobile architecture
- **[Roadmap 2025-11-04](./03-features/mobile-optimization/2025-11-04-ROADMAP.md)** - Mobile improvements plan
- **[Device Testing Matrix](./03-features/mobile-optimization/device-testing-matrix.md)** - Tested devices
- **[Performance Analysis](./03-features/mobile-optimization/performance-analysis-2025-11-04.md)** - Mobile performance
- **[Sprint 4 Summary](./03-features/mobile-optimization/sprint-4-summary.md)** - Mobile sprint results
- **[Sprint 5 Plan](./03-features/mobile-optimization/sprint-5-plan.md)** - Current sprint objectives

### Other Features

- **[SSE Streaming](./03-features/sse-streaming.md)** - Real-time communication
- **[Voice Integration](./03-features/voice-integration.md)** - Voice interface (planned)
- **[Transparency Map](./03-features/transparency-map-integration-complete.md)** - Data visualization

---

## 🔌 04 - API Reference

API documentation and data structures:

- **[API Data Structures](./04-api/API_DATA_STRUCTURES.md)** - TypeScript types and interfaces
- **[Chat Integration Report](./04-api/CHAT_INTEGRATION_ISSUE_REPORT.md)** - Chat API documentation
- **[Frontend Integration Manual](./04-api/MANUAL_INTEGRACAO_FRONTEND.md)** - Integration guide (PT)
- **[Codebase Report](./04-api/RELATORIO_CODEBASE.md)** - Technical report (PT)

---

## 📖 05 - Guides

Development guides and best practices:

- **[Architecture Guide](./05-guides/ARCHITECTURE.md)** - Architectural patterns
- **[Component Development](./05-guides/COMPONENT-DEVELOPMENT.md)** - Component guidelines
- **[Contributing Guide](./05-guides/CONTRIBUTING.md)** - How to contribute
- **[Testing Guide](./05-guides/TESTING.md)** - Testing strategies
- **[Testing Strategy](./05-guides/TESTING-STRATEGY.md)** - Comprehensive test approach
- **[OAuth Authentication Fix](./05-guides/oauth-authentication-fix.md)** - Auth troubleshooting
- **[OAuth Google Fix](./05-guides/oauth-google-fix-guide.md)** - Google OAuth setup
- **[Optimization Report](./05-guides/OPTIMIZATION-REPORT.md)** - Performance optimization

---

## 👨‍💻 06 - Development

Development standards and patterns:

- **[Component Documentation](./06-development/COMPONENT_DOCS.md)** - Component API reference
- **[Type Generation](./06-development/TYPE_GENERATION.md)** - TypeScript type generation
- **[Patches](./06-development/patches/)** - Code patches and fixes

---

## 🎨 07 - Design

Design system and UI/UX documentation (7.7MB including screenshots):

### Design Documentation

- **[Design System v2](./07-design/design-system-v2.md)** - Component library
- **[Agent Thinking Indicator](./07-design/agent-thinking-indicator.md)** - Loading states
- **[Dark Mode Preservation](./07-design/DARK-MODE-PRESERVATION.md)** - Theme system

### UI/UX Audits

- **[Comprehensive UI Audit 2025-01-29](./07-design/comprehensive-ui-audit-2025-01-29.md)** - Full UI analysis
- **[Mobile UI Audit 2025-01-29](./07-design/mobile-ui-audit-2025-01-29.md)** - Mobile-specific audit
- **[UI/UX Audit 2025-01](./07-design/UI_UX_AUDIT_2025-01.md)** - General UX audit

### Mobile & User Experience

- **[Mobile Optimization Plan](./07-design/MOBILE_OPTIMIZATION_PLAN.md)** - Mobile strategy
- **[Mobile UI Improvements Sprint](./07-design/mobile-ui-improvements-sprint-report.md)** - Sprint results
- **[User Experience Visual](./07-design/USER-EXPERIENCE-VISUAL.md)** - Visual guidelines
- **[User Journey Complete](./07-design/USER-JOURNEY-COMPLETE.md)** - User flow documentation
- **[UI Improvements Action Plan](./07-design/ui-improvements-action-plan.md)** - Improvement roadmap

### UX Analysis (Screenshots)

- `ux-analysis/ux-analysis-screenshots/` (5.3MB) - External UX analysis screenshots
- `ux-analysis/ux-internal-screenshots/` (2.3MB) - Internal UX screenshots
- `ux-analysis/ux-internal-analysis-report.json` (24KB) - Automated UX analysis

---

## 🧪 08 - Testing

Testing documentation and strategies:

- **[Testing Architecture](./08-testing/testing-architecture.md)** - Test infrastructure
- **[Testing Guide](./08-testing/testing-guide.md)** - How to write tests
- **[Manual Testing Scripts](./08-testing/manual-testing-scripts.md)** - Integration test scripts
- **[Manual Test Scripts](./08-testing/MANUAL_TEST_SCRIPTS.md)** - Test procedures
- **[PostHog Testing Guide](./08-testing/posthog-testing-guide.md)** - Analytics testing
- **[Test Session 2025-10-06](./08-testing/TEST_SESSION_2025-10-06.md)** - Test report

---

## 🚢 09 - Deployment

Deployment and infrastructure documentation:

- **[Production Deploy Checklist](./09-deployment/PRODUCTION_DEPLOY_CHECKLIST.md)** - Pre-deployment checks
- **[Production Deployment](./09-deployment/PRODUCTION_DEPLOYMENT.md)** - Deployment guide
- **[Lighthouse CI Guide](./09-deployment/lighthouse-ci-guide.md)** - Performance CI
- **[Monitoring Setup](./09-deployment/MONITORING_SETUP.md)** - Sentry configuration
- **[Sentry Integration](./09-deployment/sentry-integration.md)** - Comprehensive Sentry guide (NEW)
- **[Sentry Setup Complete](./09-deployment/SENTRY_SETUP_COMPLETE.md)** - Error monitoring
- **[Security Hardening](./09-deployment/SECURITY_HARDENING.md)** - Security best practices
- **[Security Hardening Guide](./09-deployment/security-hardening-guide.md)** - Detailed security
- **[Vercel KV Setup](./09-deployment/VERCEL_KV_SETUP.md)** - Cache configuration
- **[Vercel KV Setup Complete](./09-deployment/VERCEL_KV_SETUP_COMPLETE.md)** - KV implementation

---

## 📚 10 - Reference

Reference materials and migration guides:

- **[Migration Guides](./10-reference/migration-guides/)** - Version migration documentation
  - [Chat Migration](./10-reference/migration-guides/chat-migration.md) - Chat system refactor
  - [General Migration Guide 2025-11-08](./10-reference/migration-guides/MIGRATION-GUIDE-2025-11-08.md) - Migration procedures (NEW)
- **[Renovate Guide](./10-reference/renovate-guide.md)** - Automated dependency updates
- **[Renovate Setup](./10-reference/RENOVATE_SETUP.md)** - Renovate configuration guide (NEW)

---

## ⚡ 11 - Performance

Performance optimization and analysis documentation:

### Current Reports (2025)

- **[Bundle Analysis 2025-11-22](./11-performance/bundle-analysis-2025-11-22.md)** - Latest bundle analysis (NEW)
- **[Performance Roadmap Nov 2025](./11-performance/performance-roadmap-nov-2025.md)** - Performance strategy
- **[Optimization Roadmap 2025](./11-performance/optimization-roadmap-2025.md)** - Comprehensive roadmap (NEW)

### Implementation Reports

- **[Performance Optimization Report](./11-performance/performance-optimization-report.md)** - General optimizations (NEW)
- **[Quick Wins Implementation](./11-performance/quick-wins-implementation.md)** - Fast improvements (NEW)

### Phase Reports

- **[Phase 2 Optimization Report](./11-performance/phase-2-optimization-report.md)** - Phase 2 results (NEW)
- **[Phase 3 Optimization Report](./11-performance/phase-3-optimization-report.md)** - Phase 3 results (NEW)
- **[Phase 1B: CLS Analysis](./11-performance/phase1b-cls-analysis.md)** - Cumulative Layout Shift fixes
- **[Phase 1B: Implementation Summary](./11-performance/phase1b-implementation-summary.md)** - Results
- **[Phase 2: Bundle Analysis](./11-performance/phase2-bundle-analysis.md)** - Bundle deep-dive
- **[Phase 2: Completion Analysis](./11-performance/phase2-completion-analysis.md)** - Phase 2 results
- **[Phase 3: LCP Optimization Summary](./11-performance/phase3-lcp-optimization-summary.md)** - Largest Contentful Paint

### Tools & Guides

- **[Bundle Optimization Opportunities](./11-performance/bundle-optimization-opportunities.md)** - Bundle size reduction

---

## 🏠 12 - Landing Page

Landing page design and implementation:

- **[Landing Page Modal Redesign Roadmap](./12-landing-page/landing-page-modal-redesign-roadmap.md)** - Design plan
- **[Landing Page Modal Implementation Report](./12-landing-page/landing-page-modal-implementation-report.md)** - Implementation details

---

## 🗄️ Archive

Historical documentation and reports organized by date:

### 2025-11 (November 2025)

- **[Session Summary 2025-11-07](./archive/2025-11/session-2025-11-07-summary.md)** - Development session
- **[Daily Performance Log 2025-11-07](./archive/2025-11/daily-performance-log-2025-11-07.md)** - Performance tracking
- **[Codebase Exploration 2025-11-03](./archive/2025-11/CODEBASE_EXPLORATION_2025-11-03.md)** - Code analysis
- **[Comprehensive Project Analysis 2025-11-03](./archive/2025-11/COMPREHENSIVE_PROJECT_ANALYSIS_2025-11-03.md)** - Full project review

### 2025-10 (October 2025)

- [Backend Error Report](./archive/2025-10/BACKEND_ERROR_REPORT_2025-10-29.md)
- [Baseline Metrics](./archive/2025-10/baseline-metrics-2025.md)
- [Code Analysis Report](./archive/2025-10/CODE_ANALYSIS_REPORT.md)
- And more...

### 2025-09 (September 2025)

- [Chat Integration Report](./archive/2025-09/2025-09-20-chat-integration-report.md)
- [Maritaca Integration Success](./archive/2025-09/2025-09-20-maritaca-integration-success.md)
- [Sprint 1 Completion](./archive/2025-09/2025-09-20-sprint1-completion.md)
- And more...

### General Archive

- [Comprehensive Repository Audit](./archive/COMPREHENSIVE_REPOSITORY_AUDIT_2025-01-30.md)
- [Old Sprints Documentation](./archive/old-sprints/) - Historical sprint documentation
- And 50+ other historical documents...

---

## 📝 Documentation Guidelines

### File Naming Conventions

1. **Main docs**: Use lowercase with hyphens (e.g., `quick-start.md`)
2. **Reports**: Include ISO date format (e.g., `session-2025-11-07-summary.md`)
3. **Status docs**: Use UPPERCASE (e.g., `README.md`, `CONTRIBUTING.md`)

### Organization

1. **Current work**: Keep in appropriate numbered section (01-12)
2. **Completed work**: Move to `archive/YYYY-MM/` after 30 days
3. **Screenshots**: Store in section subdirectories (e.g., `07-design/ux-analysis/`)

### Language

- **Technical docs**: English (preferred for code-related documentation)
- **Reports**: Portuguese or English (team preference)
- **Comments**: Match the document language

### Updates

1. Keep documentation synchronized with code changes
2. Update "Last Updated" dates in main docs
3. Archive outdated documentation promptly
4. Cross-reference related documents

---

## 🔍 Quick Reference

**Common Tasks:**

- 🚀 **Getting started?** → [Quick Start Guide](./01-getting-started/quick-start.md)
- 🏗️ **Understanding architecture?** → [Chat Architecture](./02-architecture/chat-architecture-deep-dive.md)
- 🧪 **Writing tests?** → [Testing Guide](./05-guides/TESTING.md)
- 🚢 **Deploying to production?** → [Production Checklist](./09-deployment/PRODUCTION_DEPLOY_CHECKLIST.md)
- ⚡ **Performance issues?** → [Performance Roadmap](./11-performance/performance-roadmap-nov-2025.md)
- ♿ **Accessibility?** → [VLibras Integration](./03-features/accessibility/vlibras.md)

**Project Info:**

- **Main README**: [../README.md](../README.md) - Project overview
- **Contributing**: [../CONTRIBUTING.md](../CONTRIBUTING.md) - How to contribute
- **Changelog**: [../CHANGELOG.md](../CHANGELOG.md) - Version history
- **Roadmap**: [../ROADMAP.md](../ROADMAP.md) - Project roadmap

---

**Maintainer**: Anderson Henrique da Silva
**Last Updated**: November 22, 2025
**Status**: ✅ Documentation Fully Organized & Updated
