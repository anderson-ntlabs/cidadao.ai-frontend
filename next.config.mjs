import { withSentryConfig } from '@sentry/nextjs';
import withSerwistInit from '@serwist/next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  reloadOnOnline: true,
  cacheOnNavigation: true,
});

// Bundle analyzer - enabled with ANALYZE=true env variable
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint warnings.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Do not ignore TypeScript errors during build
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      'recharts',
      'framer-motion',
      'd3',
      'jspdf',
      'html2canvas',
    ],
  },
  // Optimize production builds
  compress: true,
  productionBrowserSourceMaps: false,
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
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
    ],
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  // Security headers moved to middleware.ts for better control
  // See: middleware.ts and lib/security/csp.config.ts
  webpack: (config, { isServer }) => {
    // Optimize chunking
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-sync-external-store)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                if (!match) return 'npm.libs';
                const packageName = match[1];
                return `npm.${packageName.replace('@', '')}`;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 20,
            },
            charts: {
              name: 'charts',
              test: /[\\/]node_modules[\\/](recharts|react-apexcharts|apexcharts|d3)[\\/]/,
              priority: 25,
              reuseExistingChunk: true,
            },
            animations: {
              name: 'animations',
              test: /[\\/]node_modules[\\/](framer-motion|react-spring)[\\/]/,
              priority: 25,
              reuseExistingChunk: true,
            },
            pdf: {
              name: 'pdf-export',
              test: /[\\/]node_modules[\\/](jspdf|html2canvas|jspdf-autotable)[\\/]/,
              priority: 25,
              reuseExistingChunk: true,
              enforce: true,
            },
            sentry: {
              name: 'sentry',
              test: /[\\/]node_modules[\\/](@sentry)[\\/]/,
              priority: 35,
              reuseExistingChunk: true,
              enforce: true,
            },
            icons: {
              name: 'icons',
              test: /[\\/]node_modules[\\/](lucide-react|@radix-ui[\\/]react-icons)[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config
  },
}

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Upload source maps only in production
  disableSourceMapUpload: process.env.NODE_ENV !== 'production',
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
};

// Compose plugins: Sentry -> bundleAnalyzer -> withSerwist -> nextConfig
const configWithPlugins = bundleAnalyzer(withSerwist(nextConfig));
export default withSentryConfig(configWithPlugins, sentryWebpackPluginOptions);