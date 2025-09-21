/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [],
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  experimental: {
    forceSwcTransforms: true,
  },
}

// Only use PWA in production when not on Vercel
const isVercel = process.env.VERCEL === '1'
const shouldUsePWA = !isVercel && process.env.NODE_ENV === 'production'

if (shouldUsePWA || (process.env.NODE_ENV === 'development' && process.env.DISABLE_PWA !== 'true')) {
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    reloadOnOnline: true,
    disable: process.env.NODE_ENV === 'development' || process.env.DISABLE_PWA === 'true',
    buildExcludes: [/middleware-manifest\.json$/],
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offlineCache',
          expiration: {
            maxEntries: 200,
          },
        },
      },
    ],
  })
  module.exports = withPWA(nextConfig)
} else {
  module.exports = nextConfig
}