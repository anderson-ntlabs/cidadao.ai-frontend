/**
 * Kids Theme Provider Component
 *
 * Wraps children in Kids theme context.
 * Applies .theme-kids class and provides theme utilities.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { useKids } from '@/hooks/use-kids'

interface KidsThemeContextValue {
  isKidsTheme: boolean
}

const KidsThemeContext = createContext<KidsThemeContextValue>({
  isKidsTheme: false,
})

export function useKidsTheme() {
  return useContext(KidsThemeContext)
}

interface KidsThemeProviderProps {
  children: ReactNode
  forceKidsTheme?: boolean
}

export function KidsThemeProvider({ children, forceKidsTheme = false }: KidsThemeProviderProps) {
  const { isKidsMode } = useKids()
  const [mounted, setMounted] = useState(false)

  // Determine if we should apply kids theme
  const isKidsTheme = forceKidsTheme || isKidsMode

  // Ensure hydration consistency
  useEffect(() => {
    setMounted(true)
  }, [])

  // Apply theme class to body when in kids mode
  useEffect(() => {
    if (!mounted) return

    if (isKidsTheme) {
      document.body.classList.add('theme-kids')
    } else {
      document.body.classList.remove('theme-kids')
    }

    return () => {
      document.body.classList.remove('theme-kids')
    }
  }, [isKidsTheme, mounted])

  // Don't render children until mounted to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <KidsThemeContext.Provider value={{ isKidsTheme }}>
      <div className={isKidsTheme ? 'theme-kids' : ''}>{children}</div>
    </KidsThemeContext.Provider>
  )
}

export default KidsThemeProvider
