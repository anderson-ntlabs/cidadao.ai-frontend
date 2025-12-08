/**
 * Next.js Instrumentation
 *
 * This file is used to initialize instrumentation for the application.
 * It runs during the Next.js initialization phase.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-08
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side Sentry initialization
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime Sentry initialization
    await import('./sentry.edge.config')
  }
}

export const onRequestError = async (
  err: { digest: string } & Error,
  request: {
    path: string
    method: string
    headers: { [key: string]: string }
  },
  context: {
    routerKind: 'Pages Router' | 'App Router'
    routePath: string
    routeType: 'render' | 'route' | 'action' | 'middleware'
    renderSource: 'react-server-components' | 'react-server-components-payload' | 'server-rendering'
    revalidateReason: 'on-demand' | 'stale' | undefined
    renderType: 'dynamic' | 'dynamic-resume'
  }
) => {
  // Import Sentry dynamically to avoid issues during build
  const Sentry = await import('@sentry/nextjs')

  Sentry.captureException(err, {
    mechanism: {
      type: 'instrument',
      handled: false,
    },
  })

  // Add context as breadcrumb instead of extra (type-safe)
  Sentry.addBreadcrumb({
    category: 'request',
    message: `${context.routerKind} ${context.routeType}: ${context.routePath}`,
    level: 'error',
    data: {
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
    },
  })
}
