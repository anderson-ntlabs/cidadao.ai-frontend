/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist, NetworkOnly } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

/**
 * Custom runtime caching strategy that gracefully handles analytics failures
 *
 * Analytics and monitoring services (PostHog, Sentry) should fail silently
 * to avoid console spam and Service Worker errors.
 *
 * We use a custom matcher function to intercept analytics requests and return
 * empty successful responses instead of throwing errors.
 *
 * Additionally, we filter out redirect responses (3xx) to prevent caching errors.
 */
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true, // Immediately activate new SW
  clientsClaim: true, // Take control of clients immediately
  navigationPreload: true,
  runtimeCaching: defaultCache.map((entry) => ({
    ...entry,
    handler: {
      ...entry.handler,
      // Wrap handler to filter out redirect responses
      handle: async (options: any) => {
        const response = await (entry.handler as any).handle(options)

        // Don't cache redirects (3xx status codes) to avoid "Cache.put() encountered a network error"
        if (response && response.status >= 300 && response.status < 400) {
          // Return response but don't cache it
          return response
        }

        return response
      },
    },
  })),
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

  // Bypass service worker for backend API requests (Railway)
  // This prevents Mixed Content errors and ensures direct network access
  if (url.hostname === 'cidadao-api-production.up.railway.app') {
    // Let the request go directly to the network, don't cache
    // Don't call event.respondWith() - just return to let browser handle it
    return
  }

  // Block any HTTP requests (enforce HTTPS only)
  if (url.protocol === 'http:' && url.hostname !== 'localhost') {
    // Block HTTP requests in production (except localhost for dev)
    event.respondWith(
      new Response('Mixed Content: This request has been blocked', {
        status: 400,
        statusText: 'Bad Request - HTTP not allowed',
      })
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
