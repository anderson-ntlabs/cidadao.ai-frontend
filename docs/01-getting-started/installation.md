# Installation Guide

Comprehensive installation guide for Cidadão.AI frontend development.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Methods](#installation-methods)
3. [Step-by-Step Installation](#step-by-step-installation)
4. [Verify Installation](#verify-installation)
5. [Common Issues](#common-issues)

## System Requirements

### Minimum Requirements

- **OS**: Windows 10+, macOS 10.15+, Ubuntu 20.04+
- **RAM**: 4GB
- **Disk Space**: 2GB free
- **CPU**: Dual-core 2.0GHz+
- **Internet**: Required for package installation

### Recommended Requirements

- **RAM**: 8GB+
- **Disk Space**: 5GB free
- **CPU**: Quad-core 2.5GHz+
- **SSD**: For faster builds

## Installation Methods

### Method 1: Quick Install (Recommended)

```bash
# Clone and setup in one command
git clone https://github.com/anderson-ntlabs/cidadao.ai-frontend.git && \
cd cidadao.ai-frontend && \
npm install && \
cp .env.example .env.local && \
npm run dev
```

### Method 2: Manual Installation

Follow the step-by-step guide below.

### Method 3: Docker Installation

```bash
# Using Docker
docker run -p 3000:3000 cidadao-ai-frontend:latest
```

## Step-by-Step Installation

### Step 1: Install Node.js

#### Windows

1. Download from [nodejs.org](https://nodejs.org/)
2. Run installer (choose LTS version)
3. Verify installation:

```cmd
node --version
npm --version
```

#### macOS

Using Homebrew:

```bash
brew install node@20
```

Or download from [nodejs.org](https://nodejs.org/)

#### Linux (Ubuntu/Debian)

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Install Git

#### Windows

Download from [git-scm.com](https://git-scm.com/download/win)

#### macOS

```bash
# Using Homebrew
brew install git

# Or use Xcode Command Line Tools
xcode-select --install
```

#### Linux

```bash
sudo apt-get update
sudo apt-get install git
```

### Step 3: Clone the Repository

```bash
# HTTPS (recommended for most users)
git clone https://github.com/anderson-ntlabs/cidadao.ai-frontend.git

# SSH (if you have SSH keys configured)
git clone git@github.com:anderson-ntlabs/cidadao.ai-frontend.git

# Navigate to project
cd cidadao.ai-frontend
```

### Step 4: Install Dependencies

```bash
# Using npm (comes with Node.js)
npm install

# OR using Yarn
yarn install

# OR using pnpm (faster)
pnpm install
```

#### Troubleshooting Dependencies

If you encounter errors:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use legacy peer deps (if needed)
npm install --legacy-peer-deps
```

### Step 5: Configure Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Edit with your preferred editor
nano .env.local  # or vim, code, etc.
```

Add minimum required configuration:

```env
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app
```

### Step 6: Run Development Server

```bash
# Start development server
npm run dev

# Server will start on http://localhost:3000
```

## Verify Installation

### 1. Check Node & npm

```bash
node --version  # Should be >= 18.17.0
npm --version   # Should be >= 9.0.0
```

### 2. Check Project Dependencies

```bash
# List installed packages
npm list --depth=0

# Check for vulnerabilities
npm audit
```

### 3. Run Health Checks

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

### 4. Test Backend Connection

```bash
# Test API connection
curl https://cidadao-api-production.up.railway.app/health

# Should return: {"status":"healthy"}
```

## Platform-Specific Instructions

### Windows Subsystem for Linux (WSL)

```bash
# Install WSL
wsl --install

# Use Ubuntu terminal for installation
# Follow Linux instructions above
```

### macOS M1/M2 (Apple Silicon)

```bash
# Ensure Rosetta 2 is installed
softwareupdate --install-rosetta

# Use ARM64 version of Node.js
arch -arm64 brew install node@20
```

### Linux Permissions

```bash
# If encountering permission errors
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

## IDE Setup

### Visual Studio Code

1. Install VS Code from [code.visualstudio.com](https://code.visualstudio.com/)
2. Open project: `code .`
3. Install recommended extensions (prompt will appear)

### WebStorm

1. Install from [jetbrains.com](https://www.jetbrains.com/webstorm/)
2. Open project folder
3. Configure Node.js interpreter

### Neovim/Vim

```bash
# Install TypeScript language server
npm install -g typescript typescript-language-server

# Install CoC or nvim-lsp for LSP support
```

## Common Issues

### Issue: `EACCES` Permission Denied

**Solution**:

```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Issue: `ENOENT` File Not Found

**Solution**:

```bash
# Ensure you're in the correct directory
pwd  # Should show .../cidadao.ai-frontend

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue: Port 3000 Already in Use

**Solution**:

```bash
# Find process using port
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Kill process or use different port
npm run dev -- -p 3001
```

### Issue: Module Resolution Errors

**Solution**:

```bash
# Clear Next.js cache
rm -rf .next

# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Issue: Slow Installation

**Solution**:

```bash
# Use faster package manager
npm install -g pnpm
pnpm install

# Or use Yarn
npm install -g yarn
yarn install
```

## Post-Installation

### 1. Run Tests

```bash
# Run test suite
npm run test

# Run with coverage
npm run test:coverage
```

### 2. Build for Production

```bash
# Create production build
npm run build

# Test production build
npm run start
```

### 3. Setup Git Hooks

```bash
# Install Husky for Git hooks
npm run prepare
```

### 4. Explore Storybook

```bash
# Start Storybook
npm run storybook

# Opens at http://localhost:6006
```

## Updating the Project

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm update

# Or update to latest versions
npm upgrade
```

## Uninstallation

```bash
# Remove project folder
rm -rf cidadao.ai-frontend

# Optional: Remove global packages
npm uninstall -g typescript
```

## Getting Help

- [Quick Start Guide](./quick-start.md) - Get running fast
- [Environment Setup](./environment-setup.md) - Configure your environment
- [Troubleshooting](../05-guides/troubleshooting.md) - Common solutions
- [GitHub Issues](https://github.com/anderson-ntlabs/cidadao.ai-frontend/issues) - Report bugs

---

**Ready to develop?** Continue to [Development Workflow](./development-workflow.md)
