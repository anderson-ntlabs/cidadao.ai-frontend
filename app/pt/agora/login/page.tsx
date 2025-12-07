'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAgoraAuth } from '@/hooks/use-agora-auth'
import { Button } from '@/components/ui/button'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'
import { Github, Mail, GraduationCap, Sparkles, ArrowRight, Loader2 } from 'lucide-react'

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
  const { isAuthenticated, isLoading, loginWithProvider } = useAgoraAuth()
  const [isLoggingIn, setIsLoggingIn] = useState<'github' | 'google' | null>(null)
  const [backgroundImage, setBackgroundImage] = useState<string>('')
  const [imageLoaded, setImageLoaded] = useState(false)

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
      await loginWithProvider(provider)
    } catch {
      setIsLoggingIn(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Redirecionando para o dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
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
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 via-green-600 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Ágora Cidadão.AI
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
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

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/80 dark:bg-gray-800/80 text-gray-500">
                  ou continue como visitante
                </span>
              </div>
            </div>

            {/* Demo Mode */}
            <Link
              href="/pt/agora?demo=true"
              className={cn(
                'flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl',
                'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
                'text-gray-700 dark:text-gray-300 font-medium transition-colors'
              )}
            >
              <Sparkles className="w-4 h-4" />
              Explorar em modo demo
              <ArrowRight className="w-4 h-4" />
            </Link>
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
              className="flex flex-col items-center p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
            >
              <span className="text-2xl mb-1">{feature.icon}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ao entrar, você concorda com nossos{' '}
            <Link href="/pt/termos" className="text-green-600 dark:text-green-400 hover:underline">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link
              href="/pt/privacidade"
              className="text-green-600 dark:text-green-400 hover:underline"
            >
              Política de Privacidade
            </Link>
          </p>

          <Link
            href="/pt"
            className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
