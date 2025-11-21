/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist, NetworkOnly, CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

/**
 * Enhanced Service Worker with aggressive caching strategies
 * for optimal performance and offline capabilities
 */

// Cache names
const CACHE_NAME = 'cidadao-ai-v3'
const IMAGE_CACHE = 'images-v3'
const FONT_CACHE = 'fonts-v3'
const API_CACHE = 'api-v3'

// Enhanced runtime caching strategies
const enhancedRuntimeCaching = [
  // Images: Cache First (1 week)
  {
    matcher: ({ request }: { request: Request }) =>
      request.destination === 'image' ||
      request.url.includes('/agents/') ||
      request.url.includes('.png') ||
      request.url.includes('.jpg') ||
      request.url.includes('.webp') ||
      request.url.includes('.avif'),
    handler: new CacheFirst({
      cacheName: IMAGE_CACHE,
    }),
  },
  // Fonts: Cache First
  {
    matcher: ({ request }: { request: Request }) =>
      request.destination === 'font' ||
      request.url.includes('.woff') ||
      request.url.includes('.woff2'),
    handler: new CacheFirst({
      cacheName: FONT_CACHE,
    }),
  },
  // API calls: Network First with fallback
  {
    matcher: ({ url }: { url: URL }) =>
      url.origin === 'https://cidadao-api-production.up.railway.app',
    handler: new NetworkFirst({
      cacheName: API_CACHE,
      networkTimeoutSeconds: 3,
    }),
  },
  // CSS/JS: Stale While Revalidate
  {
    matcher: ({ request }: { request: Request }) =>
      request.destination === 'style' || request.destination === 'script',
    handler: new StaleWhileRevalidate({
      cacheName: CACHE_NAME,
    }),
  },
  // HTML pages: Network First
  {
    matcher: ({ request }: { request: Request }) => request.mode === 'navigate',
    handler: new NetworkFirst({
      cacheName: CACHE_NAME,
      networkTimeoutSeconds: 3,
    }),
  },
  ...defaultCache,
]

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: enhancedRuntimeCaching.map((entry) => ({
    ...entry,
    handler: {
      ...entry.handler,
      handle: async (options: any) => {
        try {
          const response = await (entry.handler as any).handle(options)

          // Don't cache redirects
          if (response && response.status >= 300 && response.status < 400) {
            return response
          }

          return response
        } catch (error) {
          // Fallback to cache if available
          const cache = await caches.open(CACHE_NAME)
          const cachedResponse = await cache.match(options.request)
          if (cachedResponse) {
            return cachedResponse
          }
          throw error
        }
      },
    },
  })),
})

// Preload critical resources
self.addEventListener('install', (event) => {
  const criticalResources = [
    '/pt',
    '/pt/app/dashboard',
    '/pt/app/chat',
    '/agents/optimized/manifest.json',
    '/fonts/inter-var.woff2',
  ]

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(criticalResources).catch((error) => {
        console.warn('Failed to preload some resources:', error)
      })
    })
  )
})

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name !== CACHE_NAME &&
              name !== IMAGE_CACHE &&
              name !== FONT_CACHE &&
              name !== API_CACHE
            )
          })
          .map((name) => caches.delete(name))
      )
    })
  )
})

// Handle offline pages
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html').then((response) => {
          return (
            response ||
            new Response('Offline - Sem conexão com a internet', {
              status: 503,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            })
          )
        })
      })
    )
  }
})

serwist.addEventListeners()
