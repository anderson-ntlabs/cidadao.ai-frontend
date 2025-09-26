'use client'

import React, { useCallback, useMemo } from 'react'
import { sanitizer } from '@/lib/security/sanitizer'

export function useSanitizer() {
  // Memoize sanitizer methods to prevent recreating on each render
  const sanitizeHtml = useCallback((html: string) => {
    return sanitizer.sanitizeHtml(html)
  }, [])

  const sanitizeChatMessage = useCallback((message: string) => {
    return sanitizer.sanitizeChatMessage(message)
  }, [])

  const sanitizeInput = useCallback((input: string) => {
    return sanitizer.sanitizeInput(input)
  }, [])

  const sanitizeFilename = useCallback((filename: string) => {
    return sanitizer.sanitizeFilename(filename)
  }, [])

  const sanitizeUrl = useCallback((url: string) => {
    return sanitizer.sanitizeUrl(url)
  }, [])

  const escapeHtml = useCallback((html: string) => {
    return sanitizer.escapeHtml(html)
  }, [])

  const sanitizeJson = useCallback((json: string) => {
    return sanitizer.sanitizeJson(json)
  }, [])

  return useMemo(() => ({
    sanitizeHtml,
    sanitizeChatMessage,
    sanitizeInput,
    sanitizeFilename,
    sanitizeUrl,
    escapeHtml,
    sanitizeJson,
  }), [
    sanitizeHtml,
    sanitizeChatMessage,
    sanitizeInput,
    sanitizeFilename,
    sanitizeUrl,
    escapeHtml,
    sanitizeJson,
  ])
}

// HOC to automatically sanitize props
export function withSanitizedProps<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  propsToSanitize: (keyof P)[]
) {
  return function SanitizedComponent(props: P) {
    const { sanitizeInput } = useSanitizer()
    
    const sanitizedProps = useMemo(() => {
      const newProps = { ...props }
      
      propsToSanitize.forEach(key => {
        if (typeof newProps[key] === 'string') {
          newProps[key] = sanitizeInput(newProps[key]) as P[keyof P]
        }
      })
      
      return newProps
    }, [props, sanitizeInput])
    
    return <Component {...sanitizedProps} />
  }
}