#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`${colors.blue}🔍 Analyzing bundle size...${colors.reset}\n`);

try {
  // Build the project with bundle analyzer
  console.log(`${colors.yellow}Building project...${colors.reset}`);
  execSync('ANALYZE=true npm run build', { stdio: 'inherit' });
  
  // Check if .next directory exists
  const nextDir = path.join(process.cwd(), '.next');
  if (!fs.existsSync(nextDir)) {
    throw new Error('.next directory not found. Build may have failed.');
  }

  // Get build stats
  const buildManifest = path.join(nextDir, 'build-manifest.json');
  const appBuildManifest = path.join(nextDir, 'app-build-manifest.json');
  
  let totalSize = 0;
  const bundles = [];

  // Read build manifest
  if (fs.existsSync(buildManifest)) {
    const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
    
    // Analyze page bundles
    Object.entries(manifest.pages || {}).forEach(([page, assets]) => {
      let pageSize = 0;
      assets.forEach(asset => {
        const assetPath = path.join(nextDir, asset);
        if (fs.existsSync(assetPath)) {
          const stats = fs.statSync(assetPath);
          pageSize += stats.size;
        }
      });
      
      if (pageSize > 0) {
        bundles.push({
          name: page,
          size: pageSize,
          type: 'page'
        });
        totalSize += pageSize;
      }
    });
  }

  // Sort bundles by size
  bundles.sort((a, b) => b.size - a.size);

  // Display results
  console.log(`\n${colors.cyan}📊 Bundle Analysis Results${colors.reset}\n`);
  console.log(`Total Bundle Size: ${colors.yellow}${formatBytes(totalSize)}${colors.reset}\n`);

  // Show top 10 largest bundles
  console.log(`${colors.blue}Top 10 Largest Bundles:${colors.reset}`);
  bundles.slice(0, 10).forEach((bundle, index) => {
    const sizeStr = formatBytes(bundle.size).padEnd(10);
    const percentage = ((bundle.size / totalSize) * 100).toFixed(1) + '%';
    console.log(
      `${(index + 1).toString().padStart(2)}. ${sizeStr} ${percentage.padStart(6)} - ${bundle.name}`
    );
  });

  // Performance recommendations
  console.log(`\n${colors.green}💡 Recommendations:${colors.reset}`);
  
  if (totalSize > 5 * 1024 * 1024) {
    console.log(`${colors.red}⚠️  Total bundle size exceeds 5MB. Consider:${colors.reset}`);
    console.log('   - Implementing code splitting');
    console.log('   - Lazy loading heavy components');
    console.log('   - Optimizing dependencies');
  }

  // Find large dependencies
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  
  console.log(`\n${colors.blue}📦 Large Dependencies:${colors.reset}`);
  const largeDeps = [];
  
  dependencies.forEach(dep => {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      const size = getDirSize(depPath);
      if (size > 1024 * 1024) { // > 1MB
        largeDeps.push({ name: dep, size });
      }
    }
  });

  largeDeps.sort((a, b) => b.size - a.size);
  largeDeps.slice(0, 10).forEach((dep, index) => {
    console.log(
      `${(index + 1).toString().padStart(2)}. ${formatBytes(dep.size).padEnd(10)} - ${dep.name}`
    );
  });

  // Optimization tips
  console.log(`\n${colors.cyan}🚀 Optimization Tips:${colors.reset}`);
  console.log('1. Use dynamic imports for large components');
  console.log('2. Implement route-based code splitting');
  console.log('3. Optimize images with next/image');
  console.log('4. Remove unused dependencies');
  console.log('5. Use production builds for accurate measurements');

  // Check for common issues
  console.log(`\n${colors.yellow}⚠️  Common Issues to Check:${colors.reset}`);
  
  // Check for moment.js
  if (dependencies.includes('moment')) {
    console.log(`${colors.red}✗ moment.js detected - Consider using date-fns or native Intl${colors.reset}`);
  }

  // Check for lodash
  if (dependencies.includes('lodash')) {
    console.log(`${colors.yellow}! lodash detected - Use lodash-es or specific imports${colors.reset}`);
  }

  // Success message
  console.log(`\n${colors.green}✅ Bundle analysis complete!${colors.reset}`);
  console.log(`For detailed visualization, check the generated report.`);

} catch (error) {
  console.error(`${colors.red}❌ Error during bundle analysis:${colors.reset}`, error.message);
  process.exit(1);
}

// Helper functions
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getDirSize(dirPath) {
  let size = 0;
  
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stats.size;
      }
    }
  } catch (err) {
    // Ignore errors for inaccessible directories
  }
  
  return size;
}