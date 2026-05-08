# Quick Start Guide

Get the Cidadão.AI frontend running in 5 minutes!

## Prerequisites

- Node.js 20+
- npm or yarn
- Git

## 1. Clone the Repository

```bash
git clone https://github.com/anderson-ntlabs/cidadao.ai-frontend.git
cd cidadao.ai-frontend
```

## 2. Install Dependencies

```bash
npm install
# or
yarn install
```

## 3. Environment Setup

Create a `.env.local` file in the root:

```bash
# Required
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app

# Optional (for full features)
NEXT_PUBLIC_ENABLE_VLIBRAS=true
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

## 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 5. Verify Installation

You should see:

- ✅ Homepage with animated gradient background
- ✅ Navigation menu
- ✅ Login button (top right)
- ✅ VLibras widget (bottom right, if enabled)

## What's Next?

### Try These Features

1. **Chat with AI Agents**
   - Click "Login" and use demo credentials
   - Navigate to Chat page
   - Select an agent and start chatting

2. **Explore Accessibility**
   - Click the green gear icon (bottom right)
   - Try different font sizes and contrast modes
   - Enable VLibras for sign language

3. **Check Mobile View**
   - Open DevTools (F12)
   - Toggle device emulation (Ctrl+Shift+M)
   - Test responsive design

### Development Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Run production build locally
npm run start

# Run Storybook
npm run storybook

# Run tests
npm run test
```

## Common Issues

### Port Already in Use

If port 3000 is busy, run on a different port:

```bash
npm run dev -- -p 3001
```

### Backend Connection Issues

Verify the backend is running:

```bash
curl https://cidadao-api-production.up.railway.app/health
```

### Missing Environment Variables

Check `.env.local` has all required variables.

## Need Help?

- [Full Installation Guide](./installation.md)
- [Environment Setup](./environment-setup.md)
- [Troubleshooting](../05-guides/troubleshooting.md)
- [Contributing Guide](../CONTRIBUTING.md)

---

**Ready to build?** Check out the [Development Workflow](./development-workflow.md) guide!
