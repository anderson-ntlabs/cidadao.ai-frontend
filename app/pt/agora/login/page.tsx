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
import { Github, Mail, GraduationCap, Sparkles, Loader2, ChevronDown } from 'lucide-react'

/**
 * Ágora Login Page
 *
 * OAuth login with GitHub and Google
 * Kids section as accordion that expands login options
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

export default function AgoraLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState<
    'github' | 'google' | 'github-kids' | 'google-kids' | null
  >(null)
  const [backgroundImage, setBackgroundImage] = useState<string>('')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [kidsExpanded, setKidsExpanded] = useState(false)
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
        // Check if logging in for Kids
        const storedMode = sessionStorage.getItem('login_mode')
        if (storedMode === 'kids') {
          sessionStorage.removeItem('login_mode')
          router.replace('/pt/agora/kids')
        } else {
          router.replace('/pt/agora')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  // Select random background on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length)
    setBackgroundImage(BACKGROUND_IMAGES[randomIndex])
  }, [])

  // Rotate kids images every 3 seconds when expanded
  useEffect(() => {
    if (!kidsExpanded) return
    const interval = setInterval(() => {
      setKidsImageIndex((prev) => (prev + 1) % KIDS_IMAGES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [kidsExpanded])

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const storedMode = sessionStorage.getItem('login_mode')
      if (storedMode === 'kids') {
        sessionStorage.removeItem('login_mode')
        router.replace('/pt/agora/kids')
      } else {
        router.replace('/pt/agora')
      }
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogin = async (provider: 'github' | 'google', isKids: boolean = false) => {
    const loginKey = isKids ? `${provider}-kids` : provider
    setIsLoggingIn(loginKey as typeof isLoggingIn)

    // Store mode preference before OAuth redirect
    if (isKids) {
      sessionStorage.setItem('login_mode', 'kids')
    } else {
      sessionStorage.removeItem('login_mode')
    }

    try {
      const nextPath = isKids ? '/pt/agora/kids' : '/pt/agora'
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

        {/* Kids Accordion */}
        <div className="mb-6">
          <button
            onClick={() => setKidsExpanded(!kidsExpanded)}
            className={cn(
              'w-full p-4 rounded-xl border-2 transition-all',
              'flex items-center gap-4',
              kidsExpanded
                ? 'border-[#FF6B6B] bg-[#FF6B6B]/10 rounded-b-none'
                : 'border-border hover:border-[#FF6B6B]/50 academy-card'
            )}
          >
            <div className="h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#FF6B6B] to-[#4ECDC4] p-0.5">
              <Image
                src={KIDS_IMAGES[kidsImageIndex]}
                alt="Área Kids"
                width={48}
                height={48}
                className="rounded-lg object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold academy-text">Área Kids</h3>
              <p className="text-xs academy-text-muted">Aprendizado para crianças de 6-12 anos</p>
            </div>
            <ChevronDown
              className={cn(
                'h-5 w-5 academy-text-muted transition-transform',
                kidsExpanded && 'rotate-180'
              )}
            />
          </button>

          {/* Accordion Content */}
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              kidsExpanded ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <div className="p-4 border-2 border-t-0 border-[#FF6B6B] rounded-b-xl bg-[#FF6B6B]/5 space-y-3">
              <p className="text-sm text-center academy-text-muted mb-4">
                Pais: façam login para configurar a Área Kids
              </p>

              {/* GitHub Kids */}
              <Button
                onClick={() => handleLogin('github', true)}
                disabled={isLoggingIn !== null}
                size="lg"
                className={cn(
                  'w-full justify-center gap-3 h-12 text-sm',
                  'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100',
                  'text-white dark:text-gray-900'
                )}
              >
                {isLoggingIn === 'github-kids' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Github className="w-4 h-4" />
                )}
                Entrar com GitHub
              </Button>

              {/* Google Kids */}
              <Button
                onClick={() => handleLogin('google', true)}
                disabled={isLoggingIn !== null}
                variant="secondary"
                size="lg"
                className="w-full justify-center gap-3 h-12 text-sm"
              >
                {isLoggingIn === 'google-kids' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                Entrar com Google
              </Button>

              <Link
                href="/pt/agora/kids/termos"
                className="block text-center text-xs text-[#FF6B6B] hover:underline mt-2"
              >
                Termos de Uso da Área Kids
              </Link>
            </div>
          </div>
        </div>

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
