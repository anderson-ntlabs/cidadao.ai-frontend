/// <reference lib="webworker" />
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist, CacheFirst, StaleWhileRevalidate, NetworkFirst, ExpirationPlugin } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

/**
 * Optimized Runtime Caching Configuration
 *
 * Performance-focused caching strategies:
 * - CacheFirst for static assets (fonts, images, JS, CSS)
 * - StaleWhileRevalidate for HTML pages
 * - NetworkFirst for dynamic content
 */
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true, // Immediately activate new SW
  clientsClaim: true, // Take control of clients immediately
  navigationPreload: true,
  runtimeCaching: [
    // Static assets - CacheFirst with long expiration
    {
      matcher: /\.(?:js|css)$/i,
      handler: new CacheFirst({
        cacheName: 'static-js-css',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    // Images - CacheFirst with longer expiration
    {
      matcher: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
      handler: new CacheFirst({
        cacheName: 'static-images',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 128,
            maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
          }),
        ],
      }),
    },
    // Fonts - CacheFirst with very long expiration
    {
      matcher: /\.(?:woff|woff2|ttf|otf|eot)$/i,
      handler: new CacheFirst({
        cacheName: 'static-fonts',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 16,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          }),
        ],
      }),
    },
    // Agent avatars - CacheFirst with long expiration
    {
      matcher: /\/agents\/.*\.(?:png|jpg|jpeg|webp)$/i,
      handler: new CacheFirst({
        cacheName: 'agent-avatars',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    // Google Fonts stylesheets - StaleWhileRevalidate
    {
      matcher: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: new StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
      }),
    },
    // Google Fonts webfonts - CacheFirst
    {
      matcher: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: new CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 16,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          }),
        ],
      }),
    },
    // Next.js _next/static - CacheFirst (versioned assets)
    {
      matcher: /\/_next\/static\/.*/i,
      handler: new CacheFirst({
        cacheName: 'next-static',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 256,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    // Next.js _next/image - StaleWhileRevalidate
    {
      matcher: /\/_next\/image\?.*/i,
      handler: new StaleWhileRevalidate({
        cacheName: 'next-images',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          }),
        ],
      }),
    },
    // HTML pages - NetworkFirst (fresh content, fallback to cache)
    {
      matcher: ({ request }) => request.destination === 'document',
      handler: new NetworkFirst({
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          }),
        ],
      }),
    },
  ],
})

// Force update check on install (aggressive update strategy)
self.addEventListener('install', (event: ExtendableEvent) => {
  // Skip waiting immediately to activate new SW
  event.waitUntil(self.skipWaiting())
})

// Take control of all clients immediately on activation
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    Promise.all([
      // Clear old caches to force fresh content
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('serwist-'))
            .map((cacheName) => caches.delete(cacheName))
        )
      }),
      // Take control of all clients immediately
      self.clients.claim(),
    ])
  )
})

// Add custom fetch event listener for analytics graceful degradation and API bypass
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url)

  // Bypass service worker completely for backend API requests (Railway)
  // Let the browser handle these requests directly without SW interception
  // This prevents body consumption issues and ensures reliable SSE streaming
  if (url.hostname === 'cidadao-api-production.up.railway.app') {
    // Don't call event.respondWith() - this lets the request pass through normally
    // The browser will handle the request directly, preserving the request body
    return
  }

  // Bypass service worker for Next.js RSC (React Server Components) requests
  // RSC requests have _rsc query parameter and need direct network access
  // Service Worker caching can cause "no-response" errors for these dynamic requests
  if (url.searchParams.has('_rsc')) {
    // Let browser handle RSC requests directly
    return
  }

  // Block any HTTP requests (enforce HTTPS only)
  if (url.protocol === 'http:' && url.hostname !== 'localhost') {
    // Upgrade HTTP to HTTPS automatically
    url.protocol = 'https:'
    const httpsRequest = new Request(url.toString(), {
      method: event.request.method,
      headers: event.request.headers,
      body:
        event.request.method !== 'GET' && event.request.method !== 'HEAD'
          ? event.request.body
          : undefined,
      mode: event.request.mode,
      credentials: event.request.credentials,
    })
    event.respondWith(
      fetch(httpsRequest).catch(() => new Response('Failed to upgrade to HTTPS', { status: 400 }))
    )
    return
  }

  // Intercept analytics and monitoring requests
  if (
    url.hostname === 'us.i.posthog.com' ||
    url.hostname === 'us-assets.i.posthog.com' ||
    url.hostname.includes('sentry.io')
  ) {
    // Return empty successful response for analytics failures
    event.respondWith(fetch(event.request).catch(() => new Response(null, { status: 200 })))
    return
  }
})

// Listen for SKIP_WAITING message from update notification
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

serwist.addEventListeners()
