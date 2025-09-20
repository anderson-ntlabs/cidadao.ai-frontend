'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthHeader } from './auth-header'
import { LoadingScreen } from './loading-screen'

interface AuthLayoutProps {
  children: React.ReactNode
  locale: 'pt' | 'en'
}

export function AuthLayout({ children, locale }: AuthLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
      const userData = localStorage.getItem('user')
      
      if (!isAuthenticated) {
        // Salva a URL que o usuário estava tentando acessar
        localStorage.setItem('redirectAfterLogin', pathname)
        router.push(`/${locale}/login`)
        return
      }
      
      if (userData) {
        setUser(JSON.parse(userData))
      }
      
      setIsLoading(false)
    }
    
    checkAuth()
  }, [router, locale, pathname])
  
  if (isLoading) {
    return <LoadingScreen />
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader locale={locale} user={user} />
      <main className="pt-16 flex-1">
        {children}
      </main>
    </div>
  )
}