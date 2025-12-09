'use client'

// Force dynamic rendering to avoid SSR issues with auth context
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'
import { Github, Mail, GraduationCap, Sparkles, Loader2, Baby, CheckCircle } from 'lucide-react'

/**
 * Ágora Login Page
 *
 * OAuth login with GitHub and Google
 * Mode selector: Ágora (adult) or Kids (children)
 * OAuth redirect changes based on selected mode
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-09
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

// Kids mascot images for rotation
const KIDS_IMAGES = [
  '/kids/monica.jpg',
  '/kids/cocorico.jpg',
  '/kids/jorel.webp',
  '/kids/luluzinha.webp',
  '/kids/ze_carioca.png',
]

type LoginMode = 'agora' | 'kids'

export default function AgoraLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState<'github' | 'google' | null>(null)
  const [backgroundImage, setBackgroundImage] = useState<string>('')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [loginMode, setLoginMode] = useState<LoginMode>('agora')
  const [kidsImageIndex, setKidsImageIndex] = useState(0)

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
        // Redirect based on stored mode preference
        const storedMode = sessionStorage.getItem('login_mode')
        if (storedMode === 'kids') {
          router.replace('/pt/agora/kids')
        } else {
          router.replace('/pt/agora')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  // Select random background on mount (client-side only to avoid hydration mismatch)
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length)
    setBackgroundImage(BACKGROUND_IMAGES[randomIndex])
  }, [])

  // Rotate kids images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setKidsImageIndex((prev) => (prev + 1) % KIDS_IMAGES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const storedMode = sessionStorage.getItem('login_mode')
      if (storedMode === 'kids') {
        router.replace('/pt/agora/kids')
      } else {
        router.replace('/pt/agora')
      }
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogin = async (provider: 'github' | 'google') => {
    setIsLoggingIn(provider)

    // Store mode preference before OAuth redirect
    sessionStorage.setItem('login_mode', loginMode)

    try {
      const nextPath = loginMode === 'kids' ? '/pt/agora/kids' : '/pt/agora'
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=${nextPath}`
          : `/auth/callback?next=${nextPath}`

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
          <p className="academy-text-muted">Redirecionando para o dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 academy-bg relative overflow-hidden">
      {/* Background image using Next/Image for better loading */}
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

      <div className="w-full max-w-md relative z-10">
        {/* Header - changes based on mode */}
        <div className="text-center mb-8">
          <div
            className={cn(
              'w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transition-all duration-500',
              loginMode === 'kids'
                ? 'bg-gradient-to-br from-[#FF6B6B] to-[#4ECDC4]'
                : 'academy-gradient'
            )}
          >
            {loginMode === 'kids' ? (
              <Baby className="w-10 h-10 text-white" />
            ) : (
              <GraduationCap className="w-10 h-10 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold academy-text mb-2">
            {loginMode === 'kids' ? 'Área Kids' : 'Ágora Cidadão.AI'}
          </h1>
          <p className="academy-text-muted">
            {loginMode === 'kids'
              ? 'Aprendizado seguro e divertido para crianças de 6-12 anos'
              : 'Plataforma aberta de aprendizado em IA e desenvolvimento'}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Ágora Mode */}
          <button
            onClick={() => setLoginMode('agora')}
            className={cn(
              'relative p-4 rounded-xl border-2 transition-all text-left',
              loginMode === 'agora'
                ? 'border-tarsila-verde bg-tarsila-verde/10 shadow-lg'
                : 'border-border hover:border-tarsila-verde/50 academy-card'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center',
                  loginMode === 'agora' ? 'academy-gradient' : 'bg-muted'
                )}
              >
                <GraduationCap
                  className={cn(
                    'h-5 w-5',
                    loginMode === 'agora' ? 'text-white' : 'academy-text-muted'
                  )}
                />
              </div>
              <div>
                <span className="font-bold academy-text block">Ágora</span>
                <span className="text-xs academy-text-muted">Adultos</span>
              </div>
            </div>
            {loginMode === 'agora' && (
              <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-tarsila-verde" />
            )}
          </button>

          {/* Kids Mode */}
          <button
            onClick={() => setLoginMode('kids')}
            className={cn(
              'relative p-4 rounded-xl border-2 transition-all text-left',
              loginMode === 'kids'
                ? 'border-[#FF6B6B] bg-[#FF6B6B]/10 shadow-lg'
                : 'border-border hover:border-[#FF6B6B]/50 academy-card'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center overflow-hidden',
                  loginMode === 'kids'
                    ? 'bg-gradient-to-br from-[#FF6B6B] to-[#4ECDC4] p-0.5'
                    : 'bg-muted'
                )}
              >
                {loginMode === 'kids' ? (
                  <Image
                    src={KIDS_IMAGES[kidsImageIndex]}
                    alt="Kids"
                    width={40}
                    height={40}
                    className="rounded-md object-cover w-full h-full"
                  />
                ) : (
                  <Baby className="h-5 w-5 academy-text-muted" />
                )}
              </div>
              <div>
                <span className="font-bold academy-text block">Kids</span>
                <span className="text-xs academy-text-muted">6-12 anos</span>
              </div>
            </div>
            {loginMode === 'kids' && (
              <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-[#FF6B6B]" />
            )}
          </button>
        </div>

        {/* Login Card */}
        <GlassCard className="mb-6">
          <GlassCardContent className="p-6 space-y-4">
            {/* Mode indicator */}
            <div
              className={cn(
                'text-center text-sm font-medium py-2 px-4 rounded-lg mb-2',
                loginMode === 'kids'
                  ? 'bg-[#FF6B6B]/20 text-[#FF6B6B]'
                  : 'bg-tarsila-verde/20 text-tarsila-verde'
              )}
            >
              {loginMode === 'kids'
                ? '👶 Entrando como Pai/Responsável para configurar Área Kids'
                : '🎓 Entrando no Ágora Academy'}
            </div>

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
            >
              {isLoggingIn === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
              Entrar com Google
            </Button>
          </GlassCardContent>
        </GlassCard>

        {/* Features - changes based on mode */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {(loginMode === 'kids'
            ? [
                { icon: '🎮', label: 'Jogos' },
                { icon: '📹', label: 'Vídeos' },
                { icon: '🤖', label: 'Mentores' },
              ]
            : [
                { icon: '🎓', label: 'Certificado' },
                { icon: '🏆', label: 'Gamificação' },
                { icon: '🤖', label: 'Mentoria IA' },
              ]
          ).map((feature) => (
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
            <Link
              href={loginMode === 'kids' ? '/pt/agora/kids/termos' : '/pt/termos'}
              className={cn(
                'hover:underline',
                loginMode === 'kids' ? 'text-[#FF6B6B]' : 'text-tarsila-verde'
              )}
            >
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
