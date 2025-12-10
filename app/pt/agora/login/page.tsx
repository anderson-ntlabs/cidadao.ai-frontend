'use client'

// Force dynamic rendering to avoid SSR issues with auth context
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { Github, GraduationCap, Sparkles, Loader2 } from 'lucide-react'

// Google icon SVG component (official colors)
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

/**
 * Ágora Login Page
 *
 * OAuth login with GitHub and Google.
 * After login, users are redirected to /pt/agora/selecao to choose
 * between Ágora Aprendiz (adult) or Ágora Kids (children) modes.
 *
 * Note: Middleware handles redirecting authenticated users,
 * but we keep client-side check for auth state changes during login.
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-10
 */

// Available background images for random selection
const BACKGROUND_IMAGES = [
  '/agora/tarsila-modernismo.png',
  '/agora/cidadao-democratizando.png',
  '/agora/cidadao-slide-01.png',
  '/agora/cidadao-slide-02.png',
  '/agora/cidadao-slide-03.png',
  '/agora/cidadao-slide-04.png',
  '/agora/cidadao-slide-05.png',
  '/agora/cidadao-slide-06.png',
]

export default function AgoraLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState<'github' | 'google' | null>(null)
  const [backgroundImage, setBackgroundImage] = useState<string>('')
  const [imageLoaded, setImageLoaded] = useState(false)

  // Get redirect URL from query params (set by middleware)
  const redirectUrl = searchParams.get('redirect')

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      setIsLoading(false)
    }
    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user)
      if (event === 'SIGNED_IN' && session?.user) {
        // Always redirect to selection page first
        // User will choose Aprendiz or Kids mode there
        router.replace('/pt/agora/selecao')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router, redirectUrl])

  // Select random background on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length)
    setBackgroundImage(BACKGROUND_IMAGES[randomIndex])
  }, [])

  // Redirect authenticated users to selection page
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/pt/agora/selecao')
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogin = async (provider: 'github' | 'google') => {
    setIsLoggingIn(provider)

    try {
      // Always redirect to selection page after OAuth
      // User will choose Aprendiz or Kids mode there
      const nextPath = '/pt/agora/selecao'

      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
          : `/auth/callback?next=${encodeURIComponent(nextPath)}`

      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      })
    } catch {
      setIsLoggingIn(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center academy-bg">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl academy-gradient flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="academy-text-muted">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center academy-bg">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl academy-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="academy-text-muted">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 academy-bg relative overflow-hidden">
      {/* Background image */}
      {backgroundImage && (
        <div className="fixed inset-0 -z-10">
          <Image
            src={backgroundImage}
            alt=""
            fill
            className={cn(
              'object-cover transition-opacity duration-1000',
              imageLoaded ? 'opacity-20 dark:opacity-25' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            priority
            unoptimized
          />
        </div>
      )}

      {/* Top bar with theme toggle */}
      <div className="fixed top-4 right-4 z-20">
        <div className="backdrop-blur-sm bg-background/50 rounded-full">
          <ThemeToggle />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl academy-gradient flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold academy-text mb-2">Ágora Cidadão.AI</h1>
          <p className="academy-text-muted">
            Plataforma aberta de aprendizado em IA e desenvolvimento
          </p>
        </div>

        {/* Login Card */}
        <GlassCard className="mb-6">
          <GlassCardContent className="p-6 space-y-4">
            {/* GitHub Login */}
            <Button
              onClick={() => handleLogin('github')}
              disabled={isLoggingIn !== null}
              size="lg"
              className={cn(
                'w-full justify-center gap-3 h-14 text-base',
                'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100',
                'text-white dark:text-gray-900'
              )}
              aria-label="Entrar com GitHub"
            >
              {isLoggingIn === 'github' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Github className="w-5 h-5" />
              )}
              Entrar com GitHub
            </Button>

            {/* Google Login */}
            <Button
              onClick={() => handleLogin('google')}
              disabled={isLoggingIn !== null}
              variant="secondary"
              size="lg"
              className="w-full justify-center gap-3 h-14 text-base"
              aria-label="Entrar com Google"
            >
              {isLoggingIn === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <GoogleIcon className="w-5 h-5" />
              )}
              Entrar com Google
            </Button>
          </GlassCardContent>
        </GlassCard>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: '🎓', label: 'Certificado' },
            { icon: '🏆', label: 'Gamificação' },
            { icon: '🤖', label: 'Mentoria IA' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex flex-col items-center p-3 rounded-xl academy-card backdrop-blur-sm"
            >
              <span className="text-2xl mb-1">{feature.icon}</span>
              <span className="text-xs academy-text-muted">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center space-y-3">
          <p className="text-xs academy-text-muted">
            Ao entrar, você concorda com nossos{' '}
            <Link href="/pt/termos" className="text-tarsila-verde hover:underline">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link href="/pt/privacidade" className="text-tarsila-verde hover:underline">
              Política de Privacidade
            </Link>
          </p>

          <Link
            href="/pt"
            className="inline-flex items-center gap-1 text-sm academy-text-muted hover:text-tarsila-amarelo transition-colors"
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
