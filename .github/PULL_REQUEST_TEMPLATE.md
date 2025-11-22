# Pull Request

## 📋 Description

<!-- Provide a brief description of what this PR does -->

## 🎯 Type of Change

<!-- Mark with an 'x' all that apply -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 UI/UX improvement
- [ ] ⚡ Performance improvement
- [ ] ♻️ Code refactoring
- [ ] 🧪 Test addition/improvement
- [ ] 🔧 Configuration change
- [ ] 🔒 Security fix

## 🔗 Related Issue

<!-- Link to related issue(s) -->

Closes #(issue number)
Relates to #(issue number)

## 🧪 Testing

### Test Coverage

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (Playwright)
- [ ] Manual testing performed

### Test Results

```bash
# Paste test results here
npm run test
npm run test:playwright
```

**Coverage**: X% (before) → Y% (after)

## 📸 Screenshots/Videos

<!-- If applicable, add screenshots or videos demonstrating the changes -->

### Before

<!-- Screenshot or description of current state -->

### After

<!-- Screenshot or description of new state -->

## ✅ Pre-merge Checklist

### Code Quality

- [ ] Code follows the project's style guidelines
- [ ] Self-review of code performed
- [ ] Code has been commented, particularly in hard-to-understand areas
- [ ] No console.log or debugging code left in
- [ ] ESLint passes (`npm run lint`)
- [ ] TypeScript compiles without errors (`npm run type-check`)

### Testing

- [ ] All tests pass locally (`npm run test`)
- [ ] E2E tests pass (`npm run test:playwright`)
- [ ] Test coverage maintained or improved
- [ ] New tests added for new functionality

### Documentation

- [ ] Documentation updated (if needed)
- [ ] Comments added for complex logic
- [ ] README updated (if needed)
- [ ] CHANGELOG updated (if needed)

### Performance

- [ ] No performance regressions introduced
- [ ] Bundle size impact checked (`npm run analyze`)
- [ ] Lighthouse score maintained (>90)

### Security

- [ ] No new security vulnerabilities introduced
- [ ] Sensitive data properly handled
- [ ] Authentication/authorization properly implemented (if applicable)
- [ ] Input validation added (if applicable)

### Accessibility

- [ ] WCAG AA compliance maintained
- [ ] Keyboard navigation works
- [ ] Screen reader tested (if UI changes)
- [ ] Color contrast meets standards

### Deployment

- [ ] Changes work in production environment
- [ ] Environment variables documented (if new ones added)
- [ ] Database migrations included (if applicable)
- [ ] Backwards compatible (or migration plan included)

## 📝 Additional Notes

<!-- Any additional information that reviewers should know -->

## 🔍 Reviewer Checklist

**For Reviewers** - Please verify:

- [ ] Code follows project conventions
- [ ] Tests are comprehensive
- [ ] Documentation is clear
- [ ] No obvious bugs or issues
- [ ] Performance impact is acceptable
- [ ] Security implications considered

## 🚀 Deployment Notes

<!-- Any special instructions for deployment -->

- [ ] No special deployment steps needed
- [ ] Requires database migration
- [ ] Requires environment variable changes
- [ ] Requires cache clear
- [ ] Other (specify below)

---

**By submitting this PR, I confirm that:**

- I have read and followed the [Contributing Guidelines](../CONTRIBUTING.md)
- I have tested my changes thoroughly
- I am ready for code review
