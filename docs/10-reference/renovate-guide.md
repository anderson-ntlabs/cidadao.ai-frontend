# Renovate - Automated Dependency Management

**Author**: Anderson Henrique da Silva
**Date**: 2025-11-11
**Status**: Active

---

## Overview

Cidadão.AI Frontend uses [Renovate](https://github.com/apps/renovate) for automated dependency management. Renovate monitors our 80+ dependencies and creates Pull Requests automatically when updates are available.

---

## How It Works

### Automatic Updates

Renovate runs on a schedule and:

1. **Scans** `package.json` for outdated dependencies
2. **Creates PR** with updated `package.json` and `package-lock.json`
3. **Runs CI/CD** (tests, lint, type-check) automatically
4. **Automerges** safe updates (patches, devDependencies)
5. **Notifies** you for major updates requiring review

### Update Schedule

| Type                      | Schedule         | Automerge        | Example                  |
| ------------------------- | ---------------- | ---------------- | ------------------------ |
| **Security patches**      | Immediately      | ✅ Yes           | CVE fix in `next@15.0.1` |
| **Patch updates**         | Mon/Thu 5am      | ✅ Yes           | `15.0.0` → `15.0.1`      |
| **Minor updates**         | Mon/Thu 5am      | ⚠️ DevDeps only  | `15.0.0` → `15.1.0`      |
| **Major updates**         | Sunday 5am       | ❌ Manual review | `14.0.0` → `15.0.0`      |
| **Lock file maintenance** | 1st day of month | ✅ Yes           | Optimize lock file       |

---

## Configuration Details

### Package Grouping

Updates are grouped intelligently to reduce PR noise:

**Next.js Ecosystem** (Manual review):

- `next`, `react`, `react-dom`
- Always reviewed together for compatibility

**Supabase** (Manual review):

- All `@supabase/*` packages
- Authentication-critical updates

**Testing Tools** (Sunday, Manual):

- `vitest`, `@playwright/test`, `@testing-library/*`
- Non-urgent, bundled weekly

**Linting/Formatting** (Automerge):

- `eslint`, `prettier`, `@typescript-eslint/*`
- Safe code style updates

**TypeScript** (Manual review):

- `typescript`, `@types/*`
- Type system changes need testing

### Automerge Rules

Renovate will automatically merge if:

✅ Update is **patch** (e.g., `1.2.3` → `1.2.4`)
✅ Update is **devDependency** minor (e.g., `eslint@8.0.0` → `8.1.0`)
✅ All CI checks pass (tests, lint, type-check)
✅ No merge conflicts exist
✅ Branch is up-to-date with `main`

Renovate will **NOT** automerge:

❌ Major version updates (e.g., `14.x` → `15.x`)
❌ Production dependencies minor updates
❌ Next.js, React, Supabase updates (grouped, manual)
❌ Any update with failing tests

---

## Renovate Dashboard

Renovate creates a **Dependency Dashboard** issue in your repository:

- 📊 Overview of all pending updates
- 🔒 Security vulnerabilities detected
- ⏸️ Paused/rate-limited updates
- ❌ Failed update attempts with errors
- ✅ Recently merged updates

**Access**: Check GitHub Issues for "🤖 Renovate Dependency Dashboard"

---

## Working with Renovate PRs

### Reviewing a Renovate PR

When Renovate creates a PR, you'll see:

```markdown
## Release Notes

[Changelog link from package maintainer]

## Configuration

📅 Schedule: Monday/Thursday 5am BRT
🚀 Automerge: Enabled (patch updates)
♻️ Rebase: Auto-rebase when behind main

## This PR contains:

- ✅ Updated package.json
- ✅ Updated package-lock.json
- ✅ CI/CD tests passed
```

**Review Checklist**:

1. ✅ Check changelog for breaking changes
2. ✅ Verify CI/CD passed (tests, lint, type-check)
3. ✅ Test locally if critical dependency:
   ```bash
   gh pr checkout <PR-number>
   npm install
   npm run dev
   npm run test
   ```
4. ✅ Merge or request changes

### Manual Intervention

**Pause updates for a dependency**:

```json
// Add to renovate.json
"ignoreDeps": ["package-name"]
```

**Change update strategy**:

```json
"packageRules": [
  {
    "matchPackageNames": ["critical-package"],
    "schedule": ["at any time"],  // More frequent
    "automerge": false            // Always manual
  }
]
```

**Force immediate update**:

- Comment on Renovate Dashboard issue: `@renovate retry`
- Or checkbox the package in the Dashboard

---

## Common Scenarios

### Scenario 1: Security Vulnerability Detected

Renovate creates **immediate PR** with label `security`:

```
🚨 chore(deps): update next to 15.0.2 (security)
CVE-2024-XXXXX: Fix XSS vulnerability in next/image
```

**Action**:

1. Review CVE details
2. Merge immediately if critical
3. Deploy to production ASAP

### Scenario 2: Major Update (e.g., Next.js 14 → 15)

Renovate creates PR on Sunday, labeled `major-update`:

```
chore(deps): update Next.js ecosystem to v15
- next: 14.2.0 → 15.0.0
- react: 18.2.0 → 18.3.0
- react-dom: 18.2.0 → 18.3.0
```

**Action**:

1. ❌ Do NOT automerge
2. Read migration guide
3. Test thoroughly in local environment
4. Check for breaking changes in your code
5. Update code if needed
6. Merge when confident

### Scenario 3: Failed CI/CD

Renovate PR shows ❌ CI/CD failed:

```
❌ Type check failed
❌ Tests failed: 3 failing

Error: Property 'foo' does not exist on type 'Bar'
```

**Action**:

1. Renovate will NOT automerge
2. Investigate breaking changes in changelog
3. Options:
   - Fix code to work with new version
   - Wait for maintainer fix
   - Close PR and pin old version temporarily

### Scenario 4: Too Many PRs

Renovate created 15 PRs at once:

**Solution**:

```json
// Adjust renovate.json
"prConcurrentLimit": 3,  // Max 3 open PRs
"prHourlyLimit": 1       // Max 1 new PR per hour
```

Or pause updates:

- Comment on Dashboard: `@renovate pause all`
- Resume later: `@renovate unpause all`

---

## Best Practices

### 1. Review Dashboard Weekly

Check Dependency Dashboard every Monday:

- Security updates pending?
- Failed PRs need attention?
- Major updates to schedule?

### 2. Keep CI/CD Healthy

Renovate relies on CI/CD to validate updates:

- ✅ Maintain >60% test coverage
- ✅ Keep tests fast (<5 minutes)
- ✅ Fix flaky tests immediately

### 3. Merge Small Updates Quickly

Don't let patch PRs accumulate:

- Merge patches daily (automerge handles this)
- Review minors weekly
- Schedule majors monthly

### 4. Monitor Dependency Health

Use Dependency Dashboard to:

- Identify outdated dependencies
- Track security vulnerabilities
- Plan migration work

### 5. Customize for Your Workflow

Adjust `renovate.json` as needed:

- Change schedules for your timezone
- Add more automerge rules if confident
- Group related packages together

---

## Troubleshooting

### Renovate Not Creating PRs

**Possible causes**:

1. **Rate limit reached**: Check Dashboard for "Rate limited" message
2. **Configuration error**: Validate `renovate.json` syntax
3. **GitHub App not installed**: Check GitHub Settings > Integrations
4. **Branch protection**: Ensure Renovate can create PRs

**Fix**: Comment on Dashboard: `@renovate check`

### Automerge Not Working

**Possible causes**:

1. **CI/CD failing**: Check PR for test errors
2. **Branch protection rules**: Require admin approval disabled?
3. **Merge conflicts**: Renovate waits for conflict resolution
4. **platformAutomerge disabled**: Check `renovate.json`

**Fix**: Ensure `platformAutomerge: true` in config

### Too Many Updates

**Solution**:

```json
// More conservative schedule
"schedule": ["before 5am on sunday"],
"prConcurrentLimit": 2,
"automerge": false  // Review everything
```

### Wrong Version Updated

Renovate follows `package.json` ranges:

```json
// Will update to latest 15.x.x
"next": "^15.0.0"

// Will update to latest minor (15.x.x), not 16.x.x
"next": "~15.0.0"

// Will never update
"next": "15.0.0"
```

**Fix**: Adjust version ranges in `package.json`

---

## Renovate Commands

Comment on PRs or Dashboard to control Renovate:

| Command               | Effect                              |
| --------------------- | ----------------------------------- |
| `@renovate rebase`    | Force rebase PR with latest main    |
| `@renovate retry`     | Retry failed update                 |
| `@renovate recreate`  | Delete and recreate PR              |
| `@renovate pause`     | Pause updates for this PR           |
| `@renovate pause all` | Pause all updates                   |
| `@renovate unpause`   | Resume updates                      |
| `@renovate check`     | Force Renovate to check for updates |

---

## Configuration Reference

Full `renovate.json` is located at project root.

### Key Settings

```json
{
  "schedule": ["before 5am on monday and thursday"], // Update timing
  "prConcurrentLimit": 5, // Max open PRs
  "automerge": true, // Enable automerge
  "automergeType": "pr", // Merge PR (not branch)
  "automergeStrategy": "squash", // Squash commits
  "platformAutomerge": true, // Use GitHub automerge
  "dependencyDashboard": true, // Enable dashboard
  "semanticCommits": "enabled", // Use conventional commits
  "rangeStrategy": "bump", // Update to exact version
  "postUpdateOptions": ["npmDedupe"] // Dedupe after update
}
```

### Modifying Configuration

1. Edit `renovate.json` in project root
2. Commit changes
3. Renovate picks up config automatically
4. Comment `@renovate check` to apply immediately

---

## Monitoring & Metrics

### GitHub Insights

Track Renovate effectiveness:

- **Insights > Dependency graph**: Security alerts
- **Pull Requests**: Filter by `dependencies` label
- **Issues**: Check Dependency Dashboard

### Weekly Review

Every Monday:

1. ✅ Check Dashboard for pending updates
2. ✅ Review/merge patch PRs (should be automerged)
3. ✅ Schedule major updates for weekend
4. ✅ Investigate failed PRs

### Monthly Review

First Monday of month:

1. ✅ Review automerge effectiveness
2. ✅ Adjust `renovate.json` if needed
3. ✅ Plan major version migrations
4. ✅ Update dependency strategy

---

## Security Considerations

### Vulnerability Scanning

Renovate scans dependencies against:

- **GitHub Security Advisories**
- **npm audit database**
- **CVE databases**

Security PRs are labeled `security` and prioritized.

### Supply Chain Security

Renovate helps prevent supply chain attacks:

- ✅ Automatic updates reduce exposure window
- ✅ Changelogs included in PRs for review
- ✅ GitHub Actions pinned to SHA (not tags)
- ✅ Lock file maintained automatically

### Trust Model

Renovate is trusted because:

- ✅ Open source (github.com/renovatebot/renovate)
- ✅ Maintained by Mend (security company)
- ✅ Used by 100,000+ repositories
- ✅ Only creates PRs (never merges without approval unless configured)
- ✅ Runs in GitHub environment (no external servers)

---

## Migration from Manual Updates

### Before Renovate

```bash
npm outdated                              # Check manually
npm update package-name                   # Update one by one
npm audit fix                             # Fix vulnerabilities
git commit -m "chore: update deps"        # Manual commit
```

### With Renovate

```bash
# Renovate handles everything automatically
# You only:
# 1. Review PR
# 2. Click "Merge" (or let automerge handle it)
```

**Time savings**: ~2 hours/week → ~20 minutes/week

---

## Support & Resources

### Official Documentation

- **Renovate Docs**: https://docs.renovatebot.com
- **Configuration Reference**: https://docs.renovatebot.com/configuration-options
- **GitHub App**: https://github.com/apps/renovate

### Project-Specific Help

- **Configuration**: `/renovate.json` (project root)
- **This Guide**: `/docs/10-reference/renovate-guide.md`
- **Issues**: Create GitHub issue with `dependencies` label

### Community

- **Discussions**: https://github.com/renovatebot/renovate/discussions
- **Discord**: https://discord.gg/renovate (unofficial)

---

## Changelog

### 2025-11-11 - Initial Setup

- Created balanced Renovate configuration
- Enabled automerge for patches and devDependencies
- Configured package grouping (Next.js, Supabase, Testing)
- Set schedule: Mon/Thu 5am + Sunday for majors
- Enabled Dependency Dashboard
- Documented setup and workflows
