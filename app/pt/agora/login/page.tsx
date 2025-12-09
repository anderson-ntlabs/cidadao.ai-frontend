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
import { Github, Mail, GraduationCap, Sparkles, Loader2, Baby } from 'lucide-react'

/**
 * Ágora Login Page
 *
 * OAuth login with GitHub and Google
 * No domain restrictions - open to all developers
 * Random background selection from available SVGs
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-07
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
  const supabase = createClient()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState<'github' | 'google' | null>(null)
  const [backgroundImage, setBackgroundImage] = useState<string>('')
  const [imageLoaded, setImageLoaded] = useState(false)

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
        router.replace('/pt/agora')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  // Select random background on mount (client-side only to avoid hydration mismatch)
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length)
    setBackgroundImage(BACKGROUND_IMAGES[randomIndex])
  }, [])

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/pt/agora')
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogin = async (provider: 'github' | 'google') => {
    setIsLoggingIn(provider)
    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=/pt/agora`
          : '/auth/callback?next=/pt/agora'

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

        {/* Kids Area Access */}
        <Link href="/pt/agora/kids">
          <GlassCard className="mb-6 cursor-pointer hover:shadow-lg transition-all group border-2 border-transparent hover:border-[#FF6B6B]/50">
            <GlassCardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#4ECDC4] flex items-center justify-center flex-shrink-0">
                  <Baby className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold academy-text group-hover:text-[#FF6B6B] transition-colors">
                    Área Kids
                  </h3>
                  <p className="text-xs academy-text-muted">
                    Aprendizado seguro e divertido para crianças de 6-12 anos
                  </p>
                </div>
                <span className="text-[#FF6B6B] text-xl group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </GlassCardContent>
          </GlassCard>
        </Link>

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
