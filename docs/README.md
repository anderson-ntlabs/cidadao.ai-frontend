# Documentation Structure

This directory contains all documentation for the cidadao.ai-frontend project, organized into the following categories:

## 📁 Directory Structure

### changelog/
Version history and release notes
- `CHANGELOG.md` - Complete project changelog

### design/
Design system and UI/UX documentation
- `DARK-MODE-PRESERVATION.md` - Dark mode implementation guide
- `UI-UX-IMPROVEMENTS.md` - UI/UX improvement proposals
- `design-system-v2.md` - Design system documentation v2
- `ux-analysis/` - UX analysis reports and screenshots
  - `ux-analysis-report.json` - Public pages UX analysis
  - `ux-internal-analysis-report.json` - Internal pages UX analysis
  - `ux-analysis-screenshots/` - Public pages screenshots
  - `ux-internal-screenshots/` - Internal pages screenshots

### planning/
Project planning and sprint documentation
- `project/`
  - `PROJECT-ANALYSIS-REPORT.md` - Overall project analysis
- `sprints/`
  - `SPRINT-PLAN.md` - Sprint planning overview
  - `SPRINT-1-*.md` - Sprint 1 documentation
  - `SPRINT-3-SUMMARY.md` - Sprint 3 summary
  - `SPRINT-4-SUMMARY.md` - Sprint 4 summary

### reports/
Technical reports and session summaries
- `2025-09-20-*.md` - Various technical reports from January 20, 2025
- `README.md` - Reports overview

### technical/
Technical documentation and analysis
- `dead-code-analysis.md` - Dead code analysis report
- `test-breadcrumb-fix.md` - Breadcrumb testing documentation
- `breadcrumb-improvements.md` - Breadcrumb improvement guide
- `integration/` - Integration documentation
  - `FRONTEND_CHAT_INTEGRATION.md` - Frontend chat integration guide
  - `MARITACA_INTEGRATION.md` - Maritaca AI integration guide
- `REFERENCE/` - Reference documentation
  - `API_DATA_STRUCTURES.md` - API data structures
  - `CHAT_INTEGRATION_ISSUE_REPORT.md` - Chat integration issues
  - `MANUAL_INTEGRACAO_FRONTEND.md` - Frontend integration manual
  - `RELATORIO_CODEBASE.md` - Codebase analysis report

## 📝 Documentation Guidelines

1. **File Naming**: Use uppercase for main documentation files, lowercase with hyphens for reports
2. **Dates**: Use ISO format (YYYY-MM-DD) for dated reports
3. **Language**: Technical documentation in English, reports can be in Portuguese
4. **Updates**: Keep documentation up-to-date with code changes
5. **Screenshots**: Store in appropriate subdirectories under `ux-analysis/`