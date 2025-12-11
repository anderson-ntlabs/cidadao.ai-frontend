'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  Settings,
  Type,
  Eye,
  Bell,
  Palette,
  Volume2,
  Save,
  Mic,
  Shield,
  Trash2,
  FileSearch,
  Download,
} from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { PageHeader, PageLoading, PageContainer } from '@/components/agora'
import { Button } from '@/components/ui/button'
import { useAgora } from '@/hooks/use-agora'
import { userProfileService, type UserPreferences } from '@/lib/services/user-profile.service'
import { toast } from '@/hooks/use-toast'
import { logger } from '@/lib/utils/logger'
import { DeleteAccountModal, LGPDTermsModal } from '@/components/privacy'

/**
 * Agora Settings Page
 *
 * Real auth only - no demo mode.
 *
 * Author: Anderson Henrique da Silva
 * Updated: 2025-12-11 - Standardized layout with PageHeader/PageContainer
 */

// Lazy load heavy panel components
const ActionPanel = dynamic(
  () => import('@/components/panels').then((mod) => ({ default: mod.ActionPanel })),
  {
    loading: () => (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    ),
    ssr: false,
  }
)

const ActionPanelSection = dynamic(
  () => import('@/components/panels').then((mod) => ({ default: mod.ActionPanelSection })),
  {
    loading: () => (
      <div className="mb-6">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-4" />
        <div className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
      </div>
    ),
    ssr: false,
  }
)

// Lazy load accessibility controls
const FontSizeControl = dynamic(
  () =>
    import('@/components/a11y/font-size-control').then((mod) => ({ default: mod.FontSizeControl })),
  {
    loading: () => <div className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />,
    ssr: false,
  }
)

const HighContrastToggle = dynamic(
  () =>
    import('@/components/a11y/high-contrast-toggle').then((mod) => ({
      default: mod.HighContrastToggle,
    })),
  {
    loading: () => (
      <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
    ),
    ssr: false,
  }
)

const VLibrasToggle = dynamic(
  () => import('@/components/a11y/vlibras-toggle').then((mod) => ({ default: mod.VLibrasToggle })),
  {
    loading: () => (
      <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
    ),
    ssr: false,
  }
)

// Lazy load voice settings
const VoiceSettings = dynamic(
  () =>
    import('@/components/settings/voice-settings').then((mod) => ({ default: mod.VoiceSettings })),
  {
    loading: () => (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    ),
    ssr: false,
  }
)

function LoadingFallback() {
  return <PageLoading text="Carregando configuracoes..." />
}

function ConfiguracoesContent() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAgora()

  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLGPDModal, setShowLGPDModal] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'pt',
    font_size: 'normal',
    high_contrast: false,
    vlibras_enabled: false,
    notifications_enabled: true,
    email_notifications: false,
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/pt/agora/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Load preferences when user is authenticated
  useEffect(() => {
    if (user && isAuthenticated) {
      loadPreferences()
    }
  }, [user, isAuthenticated])

  const loadPreferences = async () => {
    if (!user) return

    try {
      const prefs = await userProfileService.getPreferences(user.id)
      setPreferences(prefs)
    } catch (error) {
      logger.error('Failed to load preferences', { error })
    }
  }

  const handleSavePreferences = async () => {
    if (!user) return

    try {
      setIsSaving(true)
      await userProfileService.updatePreferences(user.id, preferences)
      toast.success('Preferências salvas', 'Suas configurações foram atualizadas com sucesso.')
    } catch (error) {
      logger.error('Failed to save preferences', { error })
      toast.error('Erro ao salvar', 'Não foi possível salvar suas preferências. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const togglePreference = (key: keyof UserPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  if (isLoading) {
    return <LoadingFallback />
  }

  if (!isAuthenticated || !user) {
    return <PageLoading text="Redirecionando para login..." />
  }

  return (
    <PageContainer background="operarios" maxWidth="5xl" padding="none">
      {/* Page Header */}
      <PageHeader
        backUrl="/pt/agora"
        title="Configuracoes"
        subtitle="Personalize sua experiencia na Agora"
        icon={Settings}
        actions={
          <Button
            variant="primary"
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSavePreferences}
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        }
      />

      <div className="py-6 px-4">
        <div className="space-y-6">
          {/* Accessibility Settings */}
          <ActionPanelSection
            title="Acessibilidade"
            description="Ajuste a interface para melhor atender suas necessidades"
            icon={Eye}
          >
            <GlassCard>
              <GlassCardContent className="p-6">
                <div className="space-y-6">
                  {/* Font Size */}
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Type className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          Tamanho da Fonte
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Ajuste o tamanho do texto. Atalhos:{' '}
                          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                            Alt + +
                          </kbd>{' '}
                          e{' '}
                          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                            Alt + -
                          </kbd>
                        </p>
                        <FontSizeControl locale="pt" />
                      </div>
                    </div>
                  </div>

                  {/* High Contrast & VLibras */}
                  <ActionPanel
                    items={[
                      {
                        title: 'Alto Contraste',
                        description:
                          'Aumenta o contraste para melhor visualização. Atalho: Alt + H',
                        icon: Eye,
                        action: <HighContrastToggle />,
                      },
                      {
                        title: 'VLibras (LIBRAS)',
                        description: 'Tradução automática para Língua Brasileira de Sinais',
                        icon: Volume2,
                        action: <VLibrasToggle locale="pt" variant="switch" />,
                      },
                    ]}
                    showDividers={true}
                  />
                </div>
              </GlassCardContent>
            </GlassCard>
          </ActionPanelSection>

          {/* Appearance */}
          <ActionPanelSection
            title="Aparência"
            description="Personalize o tema visual do sistema"
            icon={Palette}
          >
            <GlassCard>
              <GlassCardContent className="p-6">
                <ActionPanel
                  items={[
                    {
                      title: 'Tema',
                      description: 'Escolha entre claro, escuro ou automático',
                      icon: Palette,
                      badge:
                        preferences.theme === 'system'
                          ? 'Automático'
                          : preferences.theme === 'dark'
                            ? 'Escuro'
                            : 'Claro',
                      badgeColor: 'blue',
                      actionLabel: 'Alterar',
                      onAction: () => {
                        const themes: Array<'light' | 'dark' | 'system'> = [
                          'light',
                          'dark',
                          'system',
                        ]
                        const currentIndex = themes.indexOf(preferences.theme || 'system')
                        const nextTheme = themes[(currentIndex + 1) % themes.length]
                        setPreferences({ ...preferences, theme: nextTheme })
                        toast.info(
                          'Tema alterado',
                          `Tema alterado para ${nextTheme === 'system' ? 'automático' : nextTheme === 'dark' ? 'escuro' : 'claro'}`
                        )
                      },
                    },
                  ]}
                />
              </GlassCardContent>
            </GlassCard>
          </ActionPanelSection>

          {/* Voice Settings */}
          <ActionPanelSection
            title="Voz e Leitura"
            description="Configure a leitura de respostas dos mentores com Text-to-Speech"
            icon={Mic}
          >
            <VoiceSettings />
          </ActionPanelSection>

          {/* Notifications */}
          <ActionPanelSection
            title="Notificações"
            description="Gerencie como você recebe atualizações"
            icon={Bell}
          >
            <GlassCard>
              <GlassCardContent className="p-6">
                <ActionPanel
                  items={[
                    {
                      title: 'Notificações do Sistema',
                      description: 'Receba notificações sobre atividades importantes',
                      icon: Bell,
                      badge: preferences.notifications_enabled ? 'Ativado' : 'Desativado',
                      badgeColor: preferences.notifications_enabled ? 'green' : 'red',
                      actionLabel: preferences.notifications_enabled ? 'Desativar' : 'Ativar',
                      onAction: () => {
                        togglePreference('notifications_enabled')
                        const enabled = !preferences.notifications_enabled
                        toast.info(
                          enabled ? 'Notificações ativadas' : 'Notificações desativadas',
                          enabled
                            ? 'Você receberá notificações sobre atividades importantes'
                            : 'Você não receberá mais notificações do sistema'
                        )
                      },
                    },
                    {
                      title: 'Notificações por Email',
                      description: 'Receba resumos e alertas por email',
                      icon: Bell,
                      badge: preferences.email_notifications ? 'Ativado' : 'Desativado',
                      badgeColor: preferences.email_notifications ? 'green' : 'red',
                      actionLabel: preferences.email_notifications ? 'Desativar' : 'Ativar',
                      onAction: () => {
                        togglePreference('email_notifications')
                        const enabled = !preferences.email_notifications
                        toast.info(
                          enabled ? 'Emails ativados' : 'Emails desativados',
                          enabled
                            ? 'Você receberá resumos e alertas por email'
                            : 'Você não receberá mais emails'
                        )
                      },
                      disabled: !preferences.notifications_enabled,
                    },
                  ]}
                  showDividers={true}
                />
              </GlassCardContent>
            </GlassCard>
          </ActionPanelSection>

          {/* Privacy & Data - LGPD */}
          <ActionPanelSection
            title="Privacidade e Dados"
            description="Gerencie seus dados pessoais conforme a LGPD"
            icon={Shield}
          >
            <GlassCard>
              <GlassCardContent className="p-6">
                <ActionPanel
                  items={[
                    {
                      title: 'Entenda seus Dados',
                      description: 'Veja como a Ágora coleta, usa e protege suas informações',
                      icon: FileSearch,
                      actionLabel: 'Ver Termos',
                      onAction: () => setShowLGPDModal(true),
                    },
                    {
                      title: 'Exportar Dados',
                      description: 'Baixe uma cópia de todos os seus dados (LGPD Art. 18)',
                      icon: Download,
                      actionLabel: 'Exportar',
                      onAction: () => {
                        toast.info(
                          'Em breve',
                          'A exportação de dados será implementada em uma próxima atualização.'
                        )
                      },
                    },
                    {
                      title: 'Excluir Minha Conta',
                      description: 'Remova permanentemente seus dados do sistema (LGPD Art. 18)',
                      icon: Trash2,
                      badge: 'Irreversível',
                      badgeColor: 'red',
                      actionLabel: 'Excluir',
                      onAction: () => setShowDeleteModal(true),
                    },
                  ]}
                  showDividers={true}
                />
              </GlassCardContent>
            </GlassCard>
          </ActionPanelSection>

          {/* Save button (mobile) */}
          <div className="md:hidden">
            <Button
              variant="primary"
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSavePreferences}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>

      {/* LGPD Modals */}
      <LGPDTermsModal
        isOpen={showLGPDModal}
        onClose={() => setShowLGPDModal(false)}
        userName={user?.name?.split(' ')[0]}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        userName={user?.name?.split(' ')[0]}
      />
    </PageContainer>
  )
}

export default function AgoraConfiguracoesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfiguracoesContent />
    </Suspense>
  )
}
