import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { preloadRouteModules } from '@/lib/utils/code-splitting';

/**
 * Hook to preload modules based on current route
 */
export function useRoutePreload() {
  const pathname = usePathname();
  const preloadedRoutes = useRef(new Set<string>());

  useEffect(() => {
    // Determine which modules to preload based on current route
    const preloadMap: Record<string, () => void> = {
      '/pt/chat': () => preloadRouteModules('chat'),
      '/pt/dashboard': () => preloadRouteModules('dashboard'),
      '/pt/investigacoes': () => preloadRouteModules('investigations'),
      '/pt/perfil': () => preloadRouteModules('profile'),
      '/en/chat': () => preloadRouteModules('chat'),
      '/en/dashboard': () => preloadRouteModules('dashboard'),
      '/en/investigations': () => preloadRouteModules('investigations'),
      '/en/profile': () => preloadRouteModules('profile'),
    };

    // Preload modules for current route
    const currentRoute = pathname;
    if (preloadMap[currentRoute] && !preloadedRoutes.current.has(currentRoute)) {
      preloadedRoutes.current.add(currentRoute);
      preloadMap[currentRoute]();
    }

    // Preload adjacent routes (prefetch strategy)
    const adjacentRoutes = getAdjacentRoutes(pathname);
    adjacentRoutes.forEach(route => {
      if (preloadMap[route] && !preloadedRoutes.current.has(route)) {
        // Delay prefetch to avoid blocking current page
        setTimeout(() => {
          if (!preloadedRoutes.current.has(route)) {
            preloadedRoutes.current.add(route);
            preloadMap[route]();
          }
        }, 2000);
      }
    });
  }, [pathname]);
}

/**
 * Get adjacent routes that user is likely to navigate to
 */
function getAdjacentRoutes(currentPath: string): string[] {
  const routeGraph: Record<string, string[]> = {
    '/pt/home': ['/pt/chat', '/pt/dashboard'],
    '/pt/chat': ['/pt/investigacoes', '/pt/dashboard'],
    '/pt/dashboard': ['/pt/investigacoes', '/pt/chat'],
    '/pt/investigacoes': ['/pt/chat', '/pt/dashboard'],
    '/pt/perfil': ['/pt/configuracoes'],
    '/en/home': ['/en/chat', '/en/dashboard'],
    '/en/chat': ['/en/investigations', '/en/dashboard'],
    '/en/dashboard': ['/en/investigations', '/en/chat'],
    '/en/investigations': ['/en/chat', '/en/dashboard'],
    '/en/profile': ['/en/settings'],
  };

  return routeGraph[currentPath] || [];
}

/**
 * Hook to preload on hover
 */
export function useHoverPreload(route: string) {
  const preloaded = useRef(false);

  const handleMouseEnter = () => {
    if (!preloaded.current) {
      preloaded.current = true;
      
      // Extract route type from path
      const routeType = route.includes('chat') ? 'chat' :
                       route.includes('dashboard') ? 'dashboard' :
                       route.includes('investigac') ? 'investigations' :
                       route.includes('profile') || route.includes('perfil') ? 'profile' :
                       null;
      
      if (routeType) {
        preloadRouteModules(routeType as any);
      }
    }
  };

  return { onMouseEnter: handleMouseEnter };
}