# Environment Setup Guide

Complete guide for setting up your development environment for Cidadão.AI frontend.

## Prerequisites

### Required Software

| Software | Minimum Version | Recommended Version | Check Command    |
| -------- | --------------- | ------------------- | ---------------- |
| Node.js  | 18.17.0         | 20.x LTS            | `node --version` |
| npm      | 9.0.0           | 10.x                | `npm --version`  |
| Git      | 2.0.0           | Latest              | `git --version`  |

### Optional Tools

- **VS Code**: Recommended IDE with extensions
- **Docker**: For containerized development
- **Chrome/Brave**: For development and debugging

## Environment Variables

### 1. Create `.env.local` file

```bash
cp .env.example .env.local
```

### 2. Required Variables

```env
# Backend API (Required)
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app

# OR for local backend development:
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Optional Features

```env
# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=phc_Q2NjgVvg4HroMh0Gv7C041m4DC6tqd8OX7AKfWeQrLj
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Google Analytics
NEXT_PUBLIC_GA_ID=G-YOUR-MEASUREMENT-ID

# Accessibility
NEXT_PUBLIC_ENABLE_VLIBRAS=true

# Feature Flags
NEXT_PUBLIC_FEATURE_WEBSOCKET=false
NEXT_PUBLIC_FEATURE_EXPORT=true

# Development
DISABLE_PWA=true  # Disable PWA in development for faster builds
```

### 4. Supabase Configuration (If using auth)

```env
# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## VS Code Setup

### 1. Install Recommended Extensions

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "prisma.prisma",
    "yoavbls.pretty-ts-errors"
  ]
}
```

### 2. VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## Git Configuration

### 1. Configure Git Hooks

```bash
# Install Husky
npm run prepare

# This sets up:
# - Pre-commit: Lint staged files
# - Commit-msg: Validate commit message format
```

### 2. Commit Message Format

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

## Development Workflow

### 1. Start Development Server

```bash
# Standard development
npm run dev

# With specific port
npm run dev -- -p 3001

# With turbo (faster builds)
npm run dev -- --turbo
```

### 2. Run Type Checking

```bash
# Check TypeScript types
npm run type-check

# Watch mode
npx tsc --watch --noEmit
```

### 3. Run Linting

```bash
# Check for linting issues
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### 4. Run Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Browser Setup

### Chrome DevTools Configuration

1. **Enable Network Throttling** for testing slow connections
2. **Enable Device Emulation** for mobile testing
3. **Install Extensions**:
   - React Developer Tools
   - Redux DevTools (for Zustand)
   - Lighthouse

### Performance Profiling

```bash
# Build with bundle analyzer
npm run analyze

# Lighthouse CI
npm run lighthouse
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 [PID]
```

#### 2. Module Resolution Errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm cache clean --force
npm install
```

#### 3. TypeScript Errors

```bash
# Restart TS server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

#### 4. Environment Variables Not Loading

- Ensure `.env.local` exists (not `.env`)
- Restart dev server after changes
- Check for typos in variable names

### Performance Optimization

#### Development Build Speed

```bash
# Use Turbopack (experimental)
npm run dev -- --turbo

# Disable PWA in development
DISABLE_PWA=true npm run dev
```

#### Memory Issues

```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

## Production Environment

### 1. Production Build

```bash
# Create optimized production build
npm run build

# Test production build locally
npm run start
```

### 2. Environment Variables for Production

```env
# Production API
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app

# Enable all features
NEXT_PUBLIC_FEATURE_WEBSOCKET=true
NEXT_PUBLIC_FEATURE_EXPORT=true
NEXT_PUBLIC_ENABLE_VLIBRAS=true

# Analytics (production keys)
NEXT_PUBLIC_POSTHOG_KEY=production-key
NEXT_PUBLIC_GA_ID=production-id
```

### 3. Deployment Checklist

- [ ] All environment variables configured
- [ ] Production API URL set
- [ ] Analytics configured
- [ ] PWA enabled
- [ ] Build successful
- [ ] Type checking passes
- [ ] Tests pass
- [ ] Lighthouse score > 90

## Docker Setup (Optional)

### 1. Create Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 2. Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - '3000:3000'
    env_file:
      - .env.local
```

### 3. Run with Docker

```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d
```

## Next Steps

- [Installation Guide](./installation.md) - Detailed installation steps
- [Development Workflow](./development-workflow.md) - Best practices
- [Deployment Guide](../09-deployment/vercel-setup.md) - Deploy to production

---

**Need help?** Check the [Troubleshooting Guide](../05-guides/troubleshooting.md) or open an issue on GitHub.
