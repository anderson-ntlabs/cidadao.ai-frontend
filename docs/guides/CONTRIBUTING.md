# Contributing Guide

## Welcome Contributors!

Thank you for your interest in contributing to Cidadão.AI Frontend. This guide will help you get started with contributing to our project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please read and follow our code of conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher
- Git
- VS Code (recommended) or your preferred editor

### Initial Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/cidadao.ai-frontend.git
   cd cidadao.ai-frontend
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/cidadao-ai/cidadao.ai-frontend.git
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

6. Run development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for fixes
git checkout -b fix/issue-description
```

### 2. Make Your Changes

Follow our coding standards and ensure your changes:
- Are focused and atomic
- Include tests when applicable
- Update documentation if needed
- Follow the existing code style

### 3. Test Your Changes

```bash
# Run tests
npm test

# Run linter
npm run lint

# Run type check
npm run type-check

# Test build
npm run build
```

### 4. Commit Your Changes

We follow conventional commits. See [Commit Guidelines](#commit-guidelines).

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Provide proper types, avoid `any`
- Export component prop types
- Use interfaces over type aliases when possible

```tsx
// ✅ Good
export interface ButtonProps {
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', onClick, children }) => {
  // ...
}

// ❌ Bad
export const Button = ({ variant, onClick, children }: any) => {
  // ...
}
```

### React Components

- Use functional components with hooks
- Follow component structure guidelines
- Include JSDoc documentation
- Implement proper error boundaries

```tsx
/**
 * Card component for displaying content
 * 
 * @component
 * @example
 * ```tsx
 * <Card title="Example">Content</Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  )
}
```

### Styling

- Use Tailwind CSS classes
- Support dark mode
- Ensure responsive design
- Follow mobile-first approach

```tsx
// ✅ Good
<div className="p-4 md:p-6 bg-white dark:bg-gray-900">

// ❌ Bad
<div style={{ padding: '16px', backgroundColor: 'white' }}>
```

### File Organization

```
components/
├── ui/
│   ├── button/
│   │   ├── button.tsx         # Component
│   │   ├── button.test.tsx    # Tests
│   │   ├── button.stories.tsx # Storybook
│   │   └── index.ts           # Exports
```

## Commit Guidelines

We use Conventional Commits for clear and consistent commit history.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Feature
feat(chat): add message retry functionality

# Bug fix
fix(auth): resolve token refresh issue

# Documentation
docs(readme): update installation instructions

# Refactoring
refactor(api): simplify error handling logic

# Tests
test(button): add accessibility tests
```

### Commit Rules

1. Use present tense ("add feature" not "added feature")
2. Use imperative mood ("move cursor" not "moves cursor")
3. Keep subject line under 60 characters
4. Reference issues and PRs in the body

### Multi-line Commits

```bash
git commit -m "feat(chat): implement real-time message updates

- Add WebSocket connection for live updates
- Implement message queue for offline support
- Add connection status indicator

Closes #123"
```

## Pull Request Process

### Before Creating a PR

1. **Ensure all tests pass**
   ```bash
   npm test
   ```

2. **Check code quality**
   ```bash
   npm run lint
   npm run type-check
   ```

3. **Update documentation**
   - Add/update JSDoc comments
   - Update README if needed
   - Add Storybook stories for new components

4. **Test manually**
   - Test in different browsers
   - Test responsive design
   - Test dark mode
   - Test accessibility

### PR Title Format

Follow the same convention as commits:
```
feat(scope): brief description
```

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass (if applicable)
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

1. At least one maintainer review required
2. All CI checks must pass
3. Resolve all review comments
4. Keep PR focused and small when possible

## Testing Requirements

### Test Coverage

- Maintain minimum 80% coverage
- Write tests for all new features
- Update tests when modifying existing code

### Types of Tests Required

1. **Unit Tests** - For utilities and hooks
2. **Component Tests** - For all UI components
3. **Integration Tests** - For API interactions
4. **E2E Tests** - For critical user paths

### Writing Tests

```tsx
// Follow AAA pattern
it('should handle click events', async () => {
  // Arrange
  const handleClick = vi.fn()
  render(<Button onClick={handleClick}>Click me</Button>)
  
  // Act
  await userEvent.click(screen.getByText('Click me'))
  
  // Assert
  expect(handleClick).toHaveBeenCalledOnce()
})
```

## Development Tips

### VS Code Extensions

Recommended extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Error Lens
- GitLens

### Debugging

1. Use React Developer Tools
2. Enable source maps in development
3. Use `console.log` sparingly
4. Leverage VS Code debugger

### Performance

1. Use React Profiler for performance issues
2. Implement lazy loading for heavy components
3. Optimize images with Next.js Image
4. Monitor bundle size

## Getting Help

### Resources

- [Project Documentation](../README.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Testing Guide](./TESTING.md)
- [Component Development Guide](./COMPONENT-DEVELOPMENT.md)

### Communication

- GitHub Issues for bugs and features
- GitHub Discussions for questions
- Pull Request comments for code review

## Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Eligible for special contributor badge

Thank you for contributing to Cidadão.AI! 🇧🇷