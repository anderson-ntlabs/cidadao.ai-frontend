#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing Next.js bundle...\n');

// Create a custom next.config.js for bundle analysis
const analyzeConfig = `
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: true,
  openAnalyzer: false,
});

const withPWAInit = require('@ducanh2912/next-pwa');

const withPWA = withPWAInit.default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,
  disable: true,
  buildExcludes: [/middleware-manifest\\.json$/],
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
};

module.exports = withBundleAnalyzer(withPWA(nextConfig));
`;

// Backup existing config
const configPath = path.join(process.cwd(), 'next.config.js');
const backupPath = path.join(process.cwd(), 'next.config.js.backup');

console.log('📦 Installing bundle analyzer...');
exec('npm install --save-dev @next/bundle-analyzer', (error) => {
  if (error) {
    console.error('❌ Failed to install bundle analyzer:', error);
    return;
  }

  console.log('✅ Bundle analyzer installed');
  console.log('📝 Creating analyze config...');

  // Backup and replace config
  fs.copyFileSync(configPath, backupPath);
  fs.writeFileSync(configPath, analyzeConfig);

  console.log('🏗️  Building with analysis...');
  
  const buildProcess = exec('ANALYZE=true npm run build', (buildError) => {
    // Restore original config
    fs.copyFileSync(backupPath, configPath);
    fs.unlinkSync(backupPath);

    if (buildError) {
      console.error('❌ Build failed:', buildError);
      return;
    }

    console.log('\n✅ Bundle analysis complete!');
    console.log('📊 Check the following files:');
    console.log('   - .next/analyze/client.html');
    console.log('   - .next/analyze/nodejs.html');
    console.log('\n💡 Tip: Open these files in your browser to see the bundle visualization');
  });

  buildProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  buildProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
});