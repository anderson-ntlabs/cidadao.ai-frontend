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
  skipWaiting: true,
  clientsClaim: true,
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

// Add custom fetch event listener for analytics graceful degradation and API bypass
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url)

  // Bypass service worker for backend API requests (Railway)
  if (url.hostname === 'cidadao-api-production.up.railway.app') {
    // Let the request go directly to the network, don't cache
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

serwist.addEventListeners()
