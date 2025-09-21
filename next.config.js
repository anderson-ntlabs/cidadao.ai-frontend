const withPWAInit = require('@ducanh2912/next-pwa');

const withPWA = withPWAInit.default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
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
  webpack: (config, { isServer }) => {
    // Fix para o erro do webpack no Vercel
    if (!isServer && process.env.VERCEL) {
      config.optimization.minimize = false
    }
    return config
  },
}

module.exports = withPWA(nextConfig)