/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, NetworkOnly } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Custom runtime caching strategy that gracefully handles analytics failures
 *
 * Analytics and monitoring services (PostHog, Sentry) should fail silently
 * to avoid console spam and Service Worker errors.
 *
 * We use a custom matcher function to intercept analytics requests and return
 * empty successful responses instead of throwing errors.
 */
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

// Add custom fetch event listener for analytics graceful degradation
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);

  // Intercept analytics and monitoring requests
  if (
    url.hostname === 'us.i.posthog.com' ||
    url.hostname === 'us-assets.i.posthog.com' ||
    url.hostname.includes('sentry.io')
  ) {
    // Return empty successful response for analytics failures
    event.respondWith(
      fetch(event.request).catch(() => new Response(null, { status: 200 }))
    );
    return;
  }
});

serwist.addEventListeners();
