import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

interface DynamicOptions {
  loading?: () => JSX.Element | null
  ssr?: boolean
}

/**
 * Helper function to create dynamic imports with consistent loading states
 */
export function createDynamicComponent<P = Record<string, never>>(
  importFn: () => Promise<{ default: ComponentType<P> } | ComponentType<P>>,
  options?: DynamicOptions
) {
  return dynamic(importFn, {
    loading: options?.loading,
    ssr: options?.ssr ?? true,
  })
}

/**
 * Prefetch a dynamic component
 */
export async function prefetchComponent(importFn: () => Promise<any>): Promise<void> {
  try {
    await importFn()
  } catch (error) {
    console.error('Failed to prefetch component:', error)
  }
}

/**
 * Load multiple components in parallel
 */
export async function loadComponents(importFns: Array<() => Promise<any>>): Promise<void> {
  await Promise.all(importFns.map((fn) => prefetchComponent(fn)))
}

/**
 * Route-based code splitting configurations
 */
export const routeModules = {
  dashboard: {
    charts: () => import('@/components/charts/lazy'),
    stats: () => import('@/components/stats'),
  },
  chat: {
    tour: () => import('@/components/tour/lazy'),
    history: () => import('@/components/chat/chat-history-sidebar'),
  },
  investigations: {
    export: () => import('@/lib/export-service'),
  },
  profile: {
    avatar: () => import('@/components/ui/avatar-upload'),
    forms: () => import('@/components/profile/profile-form'),
  },
}

/**
 * Preload modules for a specific route
 */
export async function preloadRouteModules(route: keyof typeof routeModules) {
  const modules = routeModules[route]
  if (modules) {
    await loadComponents(Object.values(modules))
  }
}

/**
 * Create a lazy component with route-based preloading
 */
export function createRouteComponent<P = Record<string, never>>(
  route: keyof typeof routeModules,
  componentName: string,
  options?: DynamicOptions
) {
  const moduleLoader =
    routeModules[route]?.[componentName as keyof (typeof routeModules)[typeof route]]

  if (!moduleLoader) {
    throw new Error(`Component ${componentName} not found in route ${route}`)
  }

  return createDynamicComponent<P>(moduleLoader, options)
}
