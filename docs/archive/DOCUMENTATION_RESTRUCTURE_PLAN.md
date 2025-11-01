# Documentation Restructure Plan

**Author**: Anderson Henrique da Silva
**Location**: Minas Gerais, Brasil
**Date**: 2025-11-01

## Current Issues

1. **55 files** scattered in `/docs` root
2. **Redundant folders**: `planning/sprints` vs `sprints/`
3. **Inconsistent naming**: CAPS_LOCK vs kebab-case
4. **Outdated content**: Multiple obsolete sprint reports
5. **No clear hierarchy**: Mixed technical, planning, and reports

## Proposed New Structure

```
docs/
├── README.md                    # Main documentation index
├── CONTRIBUTING.md              # Contribution guidelines
├── CHANGELOG.md                 # Project changelog
│
├── 01-getting-started/          # Setup and basics
│   ├── installation.md
│   ├── quick-start.md
│   ├── environment-setup.md
│   └── development-workflow.md
│
├── 02-architecture/             # Technical architecture
│   ├── overview.md
│   ├── frontend-architecture.md
│   ├── backend-integration.md
│   ├── state-management.md
│   ├── chat-system.md
│   └── authentication.md
│
├── 03-features/                 # Feature documentation
│   ├── agents/
│   │   ├── overview.md
│   │   └── agent-list.md
│   ├── chat/
│   │   ├── adapters.md
│   │   └── real-time.md
│   ├── accessibility/
│   │   ├── vlibras.md
│   │   └── a11y-panel.md
│   └── analytics/
│       ├── telemetry.md
│       └── metrics.md
│
├── 04-api/                      # API documentation
│   ├── rest-api.md
│   ├── websocket.md
│   ├── data-structures.md
│   └── error-handling.md
│
├── 05-guides/                   # How-to guides
│   ├── deployment.md
│   ├── testing.md
│   ├── performance.md
│   ├── security.md
│   └── troubleshooting.md
│
├── 06-development/              # Development docs
│   ├── coding-standards.md
│   ├── git-workflow.md
│   ├── component-patterns.md
│   ├── type-safety.md
│   └── best-practices.md
│
├── 07-design/                   # Design & UX
│   ├── design-system.md
│   ├── ui-components.md
│   ├── themes.md
│   └── responsive-design.md
│
├── 08-testing/                  # Testing documentation
│   ├── unit-tests.md
│   ├── integration-tests.md
│   ├── e2e-tests.md
│   └── manual-testing.md
│
├── 09-deployment/               # Deployment & DevOps
│   ├── vercel-setup.md
│   ├── railway-setup.md
│   ├── environment-variables.md
│   ├── ci-cd.md
│   └── monitoring.md
│
├── 10-reference/                # Reference materials
│   ├── glossary.md
│   ├── dependencies.md
│   ├── browser-support.md
│   └── migration-guides/
│       ├── pwa-migration.md
│       └── chat-migration.md
│
└── archive/                     # Archived/old docs
    ├── 2025-10/                 # By month
    ├── 2025-09/
    └── old-sprints/
```

## File Naming Convention

- **Use kebab-case**: `file-name.md`
- **No CAPS_LOCK** except for README, CHANGELOG, CONTRIBUTING
- **No dates in filenames** (use git history)
- **Clear, descriptive names**

## Migration Steps

### Phase 1: Create New Structure

1. Create new folder structure
2. Create README.md with navigation
3. Set up index files for each section

### Phase 2: Consolidate Content

1. Merge duplicate documentation
2. Update outdated content
3. Standardize formatting

### Phase 3: Reorganize Files

1. Move files to appropriate folders
2. Update all internal links
3. Archive old/obsolete docs

### Phase 4: Clean Up

1. Remove empty folders
2. Delete redundant files
3. Update root README

## Content to Archive

### Obsolete Sprint Reports

- All sprint reports from September 2025
- Old consolidation reports
- Completed roadmaps

### Redundant Files

- Multiple ROADMAP files (keep only current)
- Duplicate integration guides
- Old migration reports

## Content to Keep & Update

### Essential Documentation

- Current architecture guide
- API documentation
- OAuth fix documentation
- VLibras integration
- Testing guides
- Deployment guides

### To Be Created

- Quick start guide
- Component catalog
- Troubleshooting guide
- Performance guide

## Benefits

1. **Easier navigation**: Clear hierarchy
2. **Less duplication**: Consolidated content
3. **Better maintenance**: Organized structure
4. **Improved onboarding**: Clear starting point
5. **Version control**: Archive for history

## Next Steps

1. Review and approve this plan
2. Create new folder structure
3. Begin migration process
4. Update all references
5. Create navigation index
