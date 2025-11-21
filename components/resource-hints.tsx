/**
 * Resource Hints Component
 *
 * Optimizes resource loading with preconnect, dns-prefetch, and preload hints
 */

export function ResourceHints() {
  return (
    <>
      {/* DNS Prefetch for faster lookups */}
      <link rel="dns-prefetch" href="https://cidadao-api-production.up.railway.app" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      <link rel="dns-prefetch" href="https://vercel.com" />

      {/* Preconnect for early connection establishment */}
      <link
        rel="preconnect"
        href="https://cidadao-api-production.up.railway.app"
        crossOrigin="anonymous"
      />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Preload critical fonts */}
      <link
        rel="preload"
        href="/fonts/inter-var.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />

      {/* Prefetch critical routes */}
      <link rel="prefetch" href="/pt/app/dashboard" />
      <link rel="prefetch" href="/pt/app/chat" />
    </>
  )
}
