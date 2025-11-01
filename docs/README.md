# Cidadão.AI Frontend Documentation

**Project**: Cidadão.AI - Brazilian Government Transparency Platform
**Repository**: cidadao.ai-frontend
**Tech Stack**: Next.js 15, TypeScript, Tailwind CSS, Supabase Auth

## 📚 Documentation Structure

> ⚠️ **Documentation Reorganization in Progress**
> We're restructuring our docs for better organization. See [DOCUMENTATION_RESTRUCTURE_PLAN.md](./DOCUMENTATION_RESTRUCTURE_PLAN.md)

### Quick Navigation

| Section                              | Description                              |
| ------------------------------------ | ---------------------------------------- |
| [Getting Started](#-getting-started) | Installation, setup, quick start         |
| [Architecture](#️-architecture)      | System design and technical architecture |
| [Features](#-features)               | Feature documentation and guides         |
| [API Reference](#-api-reference)     | API documentation and data structures    |
| [Development](#-development)         | Development guides and standards         |
| [Testing](#-testing)                 | Testing strategies and guides            |
| [Deployment](#-deployment)           | Deployment and DevOps documentation      |

---

## 🚀 Getting Started

Essential documentation to get you up and running:

- **[Quick Start Guide](./01-getting-started/quick-start.md)** - Get running in 5 minutes
- **[Installation](./01-getting-started/installation.md)** - Detailed installation steps
- **[Environment Setup](./01-getting-started/environment-setup.md)** - Configure your environment
- **[Development Workflow](./01-getting-started/development-workflow.md)** - Development best practices

## 🏗️ Architecture

Technical architecture and system design:

- **[Architecture Overview](./02-architecture/overview.md)** - High-level system architecture
- **[Frontend Architecture](./02-architecture/frontend-architecture.md)** - Next.js app structure
- **[Backend Integration](./02-architecture/backend-integration.md)** - API integration patterns
- **[State Management](./02-architecture/state-management.md)** - Zustand state management
- **[Chat System](./02-architecture/chat-system.md)** - Multi-adapter chat architecture
- **[Authentication](./02-architecture/authentication.md)** - Supabase auth implementation

## ✨ Features

Detailed feature documentation:

### Agents System

- **[Agent Overview](./03-features/agents/overview.md)** - Multi-agent AI system
- **[Agent List](./03-features/agents/agent-list.md)** - All 17 Brazilian agents

### Chat System

- **[Chat Adapters](./03-features/chat/adapters.md)** - Primary and fallback adapters
- **[Real-time Communication](./03-features/chat/real-time.md)** - SSE/WebSocket implementation

### Accessibility

- **[VLibras Integration](./03-features/accessibility/vlibras.md)** - Brazilian Sign Language
- **[Accessibility Panel](./03-features/accessibility/a11y-panel.md)** - A11y controls

### Analytics

- **[Telemetry System](./03-features/analytics/telemetry.md)** - Event tracking
- **[Metrics & Reporting](./03-features/analytics/metrics.md)** - Cost and performance metrics

## 🔌 API Reference

API documentation and data structures:

- **[REST API](./04-api/rest-api.md)** - Backend API endpoints
- **[WebSocket](./04-api/websocket.md)** - Real-time communication
- **[Data Structures](./04-api/data-structures.md)** - Type definitions
- **[Error Handling](./04-api/error-handling.md)** - Error codes and handling

## 👨‍💻 Development

Development guides and standards:

- **[Coding Standards](./06-development/coding-standards.md)** - Code style guide
- **[Git Workflow](./06-development/git-workflow.md)** - Branch and commit conventions
- **[Component Patterns](./06-development/component-patterns.md)** - React patterns
- **[Type Safety](./06-development/type-safety.md)** - TypeScript best practices
- **[Best Practices](./06-development/best-practices.md)** - General guidelines

## 🧪 Testing

Testing documentation:

- **[Unit Tests](./08-testing/unit-tests.md)** - Component and utility testing
- **[Integration Tests](./08-testing/integration-tests.md)** - Feature testing
- **[E2E Tests](./08-testing/e2e-tests.md)** - End-to-end testing with Playwright
- **[Manual Testing](./08-testing/manual-testing.md)** - Manual test scripts

## 🚢 Deployment

Deployment and infrastructure:

- **[Vercel Setup](./09-deployment/vercel-setup.md)** - Frontend deployment
- **[Railway Setup](./09-deployment/railway-setup.md)** - Backend deployment
- **[Environment Variables](./09-deployment/environment-variables.md)** - Configuration
- **[CI/CD Pipeline](./09-deployment/ci-cd.md)** - GitHub Actions setup
- **[Monitoring](./09-deployment/monitoring.md)** - Sentry and analytics

---

## 📋 Key Documents

### Current/Active

- [OAuth Authentication Fix](./oauth-authentication-fix.md) - Critical auth fix
- [VLibras Integration](./accessibility-vlibras.md) - Accessibility feature
- [Chat Migration](./CHAT_MIGRATION_COMPLETE.md) - Chat system refactor
- [Mobile UI Improvements](./mobile-ui-improvements-sprint-report.md) - Mobile UX

### Planning & Roadmap

- [Roadmap 2025](./ROADMAP-2025.md) - Project roadmap
- [Improvement Roadmap](./IMPROVEMENT_ROADMAP_2025-01.md) - Technical improvements
- [Critical Flows](./critical-flows-2025.md) - Key user journeys

### Reports & Analysis

- [Comprehensive UI Audit](./comprehensive-ui-audit-2025-01-29.md) - UI analysis
- [Backend Integration Analysis](./backend-real-data-analysis.md) - API integration
- [Consolidation Report](./CONSOLIDATION_FINAL_REPORT.md) - Code consolidation

---

## 🗂️ Legacy Documentation

Older documentation is being reorganized. Current locations:

- `changelog/` - Version history
- `design/` - Design system docs
- `planning/` - Sprint planning
- `reports/` - Technical reports
- `technical/` - Technical deep-dives

These will be migrated to the new structure progressively.

---

**Last Updated**: November 1, 2025
**Maintainer**: Anderson Henrique da Silva

## 📝 Documentation Guidelines

1. **File Naming**: Use uppercase for main documentation files, lowercase with hyphens for reports
2. **Dates**: Use ISO format (YYYY-MM-DD) for dated reports
3. **Language**: Technical documentation in English, reports can be in Portuguese
4. **Updates**: Keep documentation up-to-date with code changes
5. **Screenshots**: Store in appropriate subdirectories under `ux-analysis/`
