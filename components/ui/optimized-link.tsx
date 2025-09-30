'use client'

import Link from 'next/link';
import { useHoverPreload } from '@/hooks/use-route-preload';
import { ComponentProps } from 'react';

interface OptimizedLinkProps extends ComponentProps<typeof Link> {
  prefetch?: boolean;
  preloadOnHover?: boolean;
}

/**
 * Optimized Link component with intelligent preloading
 */
export function OptimizedLink({ 
  href, 
  prefetch = true,
  preloadOnHover = true,
  ...props 
}: OptimizedLinkProps) {
  const hoverProps = useHoverPreload(href.toString());
  
  return (
    <Link
      href={href}
      prefetch={prefetch}
      {...(preloadOnHover ? hoverProps : {})}
      {...props}
    />
  );
}