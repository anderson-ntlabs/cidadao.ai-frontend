/**
 * Agora Mode Selection Page
 *
 * Post-login page where users choose between Ágora Aprendiz (adult learning)
 * and Ágora Kids (children 6-12 years) modes.
 *
 * Features:
 * - Random animated background (same as login)
 * - Light/dark mode support
 * - Glass card design
 * - Mode stored in sessionStorage (clears on tab close)
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { useAgoraMode } from '@/hooks/use-agora-mode'
import { cn } from '@/lib/utils'
import {
  GraduationCap,
  Sparkles,
  Loader2,
  LogOut,
  BookOpen,
  Shield,
  ArrowRight,
  FileSearch,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { LGPDTermsModal } from '@/components/privacy'

// Available background images for random selection (same as login)
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

// Kids mascot images
const KIDS_IMAGES = [
  '/kids/monica.jpg',
  '/kids/cocorico.jpg',
  '/kids/jorel.webp',
  '/kids/luluzinha.webp',
  '/kids/ze_carioca.png',
]

export default function AgoraSelecaoPage() {
  const router = useRouter()
  const supabase = createClient()
  const { setMode } = useAgoraMode()

  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isNavigating, setIsNavigating] = useState<'aprendiz' | 'kids' | null>(null)
  const [backgroundImage, setBackgroundImage] = useState<string>('')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [kidsImageIndex, setKidsImageIndex] = useState(0)
  const [hasKidsProfile, setHasKidsProfile] = useState(false)
  const [showLGPDModal, setShowLGPDModal] = useState(false)

  // Check auth and load user data
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.replace('/pt/agora/login')
        return
      }

      setUser({
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
      })

      // Check if user has an active kids profile
      const { data: kidsProfile } = await supabase
        .from('agora_kids_profiles')
        .select('id')
        .eq('parent_user_id', authUser.id)
        .eq('is_active', true)
        .maybeSingle()

      setHasKidsProfile(!!kidsProfile)
      setIsLoading(false)
    }

    checkAuth()
  }, [supabase, router])

  // Select random background on mount
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

  const handleSelectMode = async (mode: 'aprendiz' | 'kids') => {
    setIsNavigating(mode)
    setMode(mode)

    // Small delay for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (mode === 'aprendiz') {
      router.push('/pt/agora')
    } else {
      // If has active kids profile, go directly to dashboard
      // Otherwise, go to kids setup page
      if (hasKidsProfile) {
        router.push('/pt/agora/kids/dashboard')
      } else {
        router.push('/pt/agora/kids')
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/pt/agora/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center academy-bg">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl academy-gradient flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="academy-text-muted">Carregando...</p>
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

      {/* Top bar with theme toggle and logout */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-20">
        <div className="backdrop-blur-sm bg-background/50 rounded-full">
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="rounded-full backdrop-blur-sm bg-background/50 gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl academy-gradient flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold academy-text mb-2">Bem-vindo à Ágora!</h1>
          {user?.name && (
            <p className="text-lg academy-text-muted mb-1">
              Olá,{' '}
              <span className="font-semibold text-tarsila-verde">{user.name.split(' ')[0]}</span>
            </p>
          )}
          <p className="academy-text-muted">Escolha como deseja continuar</p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Aprendiz Card */}
          <GlassCard
            className={cn(
              'group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl',
              'border-2 hover:border-tarsila-verde',
              isNavigating === 'aprendiz' && 'scale-[1.02] border-tarsila-verde'
            )}
            onClick={() => !isNavigating && handleSelectMode('aprendiz')}
          >
            <div className="p-6">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl academy-gradient flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h2 className="text-xl font-bold academy-text mb-2 flex items-center gap-2">
                Ágora Aprendiz
                {isNavigating === 'aprendiz' && <Loader2 className="w-4 h-4 animate-spin" />}
              </h2>
              <p className="text-sm academy-text-muted mb-4">
                Plataforma completa de aprendizado em IA, transparência pública e desenvolvimento de
                software.
              </p>

              {/* Features */}
              <div className="space-y-2 mb-4">
                {[
                  { icon: '🎓', text: 'Certificados reconhecidos' },
                  { icon: '🏆', text: 'Sistema de XP e badges' },
                  { icon: '🤖', text: 'Mentores IA especializados' },
                  { icon: '📚', text: 'Trilhas de aprendizado' },
                ].map((feature) => (
                  <div key={feature.text} className="flex items-center gap-2 text-sm">
                    <span>{feature.icon}</span>
                    <span className="academy-text-muted">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between">
                <span className="text-xs academy-text-muted">Para adultos e jovens</span>
                <div className="flex items-center gap-1 text-tarsila-verde font-medium text-sm group-hover:gap-2 transition-all">
                  Acessar
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Kids Card */}
          <GlassCard
            className={cn(
              'group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl',
              'border-2 hover:border-[#FF6B6B]',
              isNavigating === 'kids' && 'scale-[1.02] border-[#FF6B6B]'
            )}
            onClick={() => !isNavigating && handleSelectMode('kids')}
          >
            <div className="p-6">
              {/* Icon with rotating mascot */}
              <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 shadow-lg group-hover:scale-110 transition-transform bg-gradient-to-br from-[#FF6B6B] to-[#4ECDC4] p-0.5">
                <Image
                  src={KIDS_IMAGES[kidsImageIndex]}
                  alt="Ágora Kids"
                  width={64}
                  height={64}
                  className="rounded-xl object-cover w-full h-full"
                />
              </div>

              {/* Content */}
              <h2 className="text-xl font-bold academy-text mb-2 flex items-center gap-2">
                Ágora Kids
                {isNavigating === 'kids' && <Loader2 className="w-4 h-4 animate-spin" />}
                {hasKidsProfile && (
                  <span className="text-xs bg-[#4ECDC4]/20 text-[#4ECDC4] px-2 py-0.5 rounded-full">
                    Ativo
                  </span>
                )}
              </h2>
              <p className="text-sm academy-text-muted mb-4">
                Ambiente seguro e divertido para crianças aprenderem sobre cidadania e tecnologia.
              </p>

              {/* Features */}
              <div className="space-y-2 mb-4">
                {[
                  { icon: '🎮', text: 'Aprendizado gamificado' },
                  { icon: '🎬', text: 'Vídeos educativos' },
                  { icon: '🗣️', text: 'Personagens amigáveis' },
                  { icon: '👨‍👩‍👧', text: 'Dashboard para pais' },
                ].map((feature) => (
                  <div key={feature.text} className="flex items-center gap-2 text-sm">
                    <span>{feature.icon}</span>
                    <span className="academy-text-muted">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between">
                <span className="text-xs academy-text-muted flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Para crianças de 6-12 anos
                </span>
                <div className="flex items-center gap-1 text-[#FF6B6B] font-medium text-sm group-hover:gap-2 transition-all">
                  {hasKidsProfile ? 'Continuar' : 'Configurar'}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Info Banners */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm bg-background/50 border border-border">
            <Sparkles className="w-4 h-4 text-tarsila-amarelo" />
            <span className="text-sm academy-text-muted">
              Você pode trocar de modo a qualquer momento
            </span>
          </div>

          <button
            onClick={() => setShowLGPDModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm bg-tarsila-verde/10 border border-tarsila-verde/30 hover:bg-tarsila-verde/20 transition-colors cursor-pointer"
          >
            <FileSearch className="w-4 h-4 text-tarsila-verde" />
            <span className="text-sm text-tarsila-verde font-medium">Entenda seus dados</span>
          </button>
        </div>
      </div>

      {/* LGPD Terms Modal */}
      <LGPDTermsModal
        isOpen={showLGPDModal}
        onClose={() => setShowLGPDModal(false)}
        userName={user?.name?.split(' ')[0]}
      />
    </div>
  )
}
