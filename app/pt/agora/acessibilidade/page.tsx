/**
 * Accessibility Settings Page
 *
 * Comprehensive accessibility controls for the Agora platform:
 * - Font size adjustment
 * - High contrast mode
 * - VLibras (LIBRAS) toggle
 * - Keyboard shortcuts reference
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-07
 */

'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { FontSizeControl } from '@/components/a11y/font-size-control'
import { HighContrastToggle } from '@/components/a11y/high-contrast-toggle'
import { VLibrasToggle } from '@/components/a11y/vlibras-toggle'
import { AgoraHeader } from '@/components/agora'
import { useAgora } from '@/hooks/use-agora'
import {
  ArrowLeft,
  Accessibility,
  Type,
  Eye,
  Languages,
  Keyboard,
  Info,
  GraduationCap,
} from 'lucide-react'

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
      </div>
    </div>
  )
}

// Content component
function AccessibilityContent() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAgora()

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.replace('/pt/agora/login')
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push('/pt/agora/login')
  }

  // Build URL helper
  const buildUrl = (path: string) => path

  if (!user) {
    return <LoadingFallback />
  }

  return (
    <div className="min-h-screen">
      <AgoraHeader
        user={{
          name: user.name,
          avatar: user.avatar,
          totalXp: user.totalXp,
          currentLevel: user.currentLevel,
          currentRank: user.currentRank,
        }}
        onLogout={handleLogout}
        isDemoMode={false}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={buildUrl('/pt/agora')}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Accessibility className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Acessibilidade
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Personalize sua experiencia
              </p>
            </div>
          </div>
        </div>

        {/* Intro Card */}
        <GlassCard className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-700/30">
          <GlassCardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  A Agora foi desenvolvida seguindo as diretrizes WCAG 2.1 para garantir que todos
                  possam aprender e participar. Ajuste as configuracoes abaixo de acordo com suas
                  necessidades.
                </p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Settings Cards */}
        <div className="space-y-6">
          {/* Font Size */}
          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Type className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Tamanho da Fonte
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ajuste o tamanho do texto para melhor leitura
                  </p>
                </div>
              </div>
            </GlassCardHeader>
            <GlassCardContent className="pt-0">
              <FontSizeControl locale="pt" />
            </GlassCardContent>
          </GlassCard>

          {/* High Contrast */}
          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Alto Contraste
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Aumenta o contraste para melhor visualizacao
                    </p>
                  </div>
                </div>
                <HighContrastToggle />
              </div>
            </GlassCardHeader>
          </GlassCard>

          {/* VLibras */}
          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Languages className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      VLibras (LIBRAS)
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Traducao para Lingua Brasileira de Sinais
                    </p>
                  </div>
                </div>
                <VLibrasToggle locale="pt" variant="switch" />
              </div>
            </GlassCardHeader>
            <GlassCardContent className="pt-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Quando ativado, um widget aparecera no canto da tela para traduzir o conteudo para
                LIBRAS. O VLibras e um projeto do Governo Federal.
              </p>
            </GlassCardContent>
          </GlassCard>

          {/* Keyboard Shortcuts */}
          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Keyboard className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Atalhos de Teclado
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Navegue rapidamente usando o teclado
                  </p>
                </div>
              </div>
            </GlassCardHeader>
            <GlassCardContent className="pt-0">
              <div className="space-y-3">
                <ShortcutRow shortcut="Alt + H" description="Alternar alto contraste" />
                <ShortcutRow shortcut="Alt + +" description="Aumentar tamanho da fonte" />
                <ShortcutRow shortcut="Alt + -" description="Diminuir tamanho da fonte" />
                <ShortcutRow shortcut="Tab" description="Navegar entre elementos" />
                <ShortcutRow shortcut="Enter" description="Ativar elemento focado" />
                <ShortcutRow shortcut="Esc" description="Fechar modais e menus" />
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Duvidas sobre acessibilidade?{' '}
            <Link
              href={buildUrl('/pt/agora/ajuda')}
              className="text-green-600 dark:text-green-400 hover:underline"
            >
              Acesse a Central de Ajuda
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

// Shortcut row component
function ShortcutRow({ shortcut, description }: { shortcut: string; description: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{description}</span>
      <kbd className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-xs text-gray-700 dark:text-gray-300">
        {shortcut}
      </kbd>
    </div>
  )
}

// Main export with Suspense boundary
export default function AccessibilityPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AccessibilityContent />
    </Suspense>
  )
}
