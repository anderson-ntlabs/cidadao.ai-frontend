'use client'

import { useMemo } from 'react'
import { createLogger, Logger } from '@/lib/logger'

export function useLogger(context: string): Logger {
  return useMemo(() => createLogger(context), [context])
}

// Hook for component lifecycle logging
export function useComponentLogger(componentName: string) {
  const logger = useLogger(componentName)

  // Log component mount/unmount
  useMemo(() => {
    logger.debug('Component mounted')
    
    return () => {
      logger.debug('Component unmounted')
    }
  }, [logger])

  return logger
}