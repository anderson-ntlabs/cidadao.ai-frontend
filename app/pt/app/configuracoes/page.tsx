'use client'

import { useState, useEffect } from 'react'
import { Settings, Type, Eye, Languages, Bell, Shield, Palette, Globe, Volume2, Save } from 'lucide-react'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { ActionPanel, ActionPanelSection, type ActionPanelItem } from '@/components/panels'
import { FontSizeControl } from '@/components/a11y/font-size-control'
import { HighContrastToggle } from '@/components/a11y/high-contrast-toggle'
import { VLibrasToggle } from '@/components/a11y/vlibras-toggle'
import { useAuth } from '@/hooks/use-supabase-auth'
import { userProfileService, type UserPreferences } from '@/lib/services/user-profile.service'
import { toast } from '@/hooks/use-toast'
import { logger } from '@/lib/utils/logger'

/**
 * Página de Configurações
 *
 * Gerencia todas as preferências do usuário:
 * - Acessibilidade (fonte, contraste, VLibras)
 * - Notificações
 * - Idioma
 * - Tema
 * - Privacidade
 */

export default function ConfiguracoesPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'pt',
    font_size: 'normal',
    high_contrast: false,
    vlibras_enabled: false,
    notifications_enabled: true,
    email_notifications: false
  })

  useEffect(() => {
    if (user) {
      loadPreferences()
    }
  }, [user])

  const loadPreferences = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const prefs = await userProfileService.getPreferences(user.id)
      setPreferences(prefs)
    } catch (error) {
      logger.error('Failed to load preferences', { error })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    if (!user) return

    try {
      setIsSaving(true)
      await userProfileService.updatePreferences(user.id, preferences)
      toast({
        title: 'Preferências salvas',
        description: 'Suas configurações foram atualizadas com sucesso.'
      })
    } catch (error) {
      logger.error('Failed to save preferences', { error })
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar suas preferências. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const togglePreference = (key: keyof UserPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('/operarios.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.03
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20" />

      <div className="relative z-10 max-w-5xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Settings className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Configurações
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Personalize sua experiência no Cidadão.AI
              </p>
            </div>
            <Button
              variant="primary"
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSavePreferences}
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>

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
                          Ajuste o tamanho do texto. Atalhos: <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Alt + +</kbd> e{' '}
                          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Alt + -</kbd>
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
                        description: 'Aumenta o contraste para melhor visualização. Atalho: Alt + H',
                        icon: Eye,
                        action: <HighContrastToggle />
                      },
                      {
                        title: 'VLibras (LIBRAS)',
                        description: 'Tradução automática para Língua Brasileira de Sinais',
                        icon: Volume2,
                        action: <VLibrasToggle locale="pt" variant="switch" />
                      }
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
                      badge: preferences.theme === 'system' ? 'Automático' : preferences.theme === 'dark' ? 'Escuro' : 'Claro',
                      badgeColor: 'blue',
                      actionLabel: 'Alterar',
                      onAction: () => {
                        const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
                        const currentIndex = themes.indexOf(preferences.theme || 'system')
                        const nextTheme = themes[(currentIndex + 1) % themes.length]
                        setPreferences({ ...preferences, theme: nextTheme })
                        toast({
                          title: 'Tema alterado',
                          description: `Tema alterado para ${nextTheme === 'system' ? 'automático' : nextTheme === 'dark' ? 'escuro' : 'claro'}`
                        })
                      }
                    }
                  ]}
                />
              </GlassCardContent>
            </GlassCard>
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
                        toast({
                          title: preferences.notifications_enabled ? 'Notificações desativadas' : 'Notificações ativadas',
                          description: preferences.notifications_enabled
                            ? 'Você não receberá mais notificações do sistema'
                            : 'Você receberá notificações sobre atividades importantes'
                        })
                      }
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
                        toast({
                          title: preferences.email_notifications ? 'Emails desativados' : 'Emails ativados',
                          description: preferences.email_notifications
                            ? 'Você não receberá mais emails'
                            : 'Você receberá resumos e alertas por email'
                        })
                      },
                      disabled: !preferences.notifications_enabled
                    }
                  ]}
                  showDividers={true}
                />
              </GlassCardContent>
            </GlassCard>
          </ActionPanelSection>

          {/* Language */}
          <ActionPanelSection
            title="Idioma"
            description="Escolha o idioma da interface"
            icon={Globe}
          >
            <GlassCard>
              <GlassCardContent className="p-6">
                <ActionPanel
                  items={[
                    {
                      title: 'Idioma do Sistema',
                      description: 'Português (Brasil) - Sistema autenticado é PT-only',
                      icon: Languages,
                      badge: 'Português (BR)',
                      badgeColor: 'green'
                    }
                  ]}
                />
              </GlassCardContent>
            </GlassCard>
          </ActionPanelSection>

          {/* Privacy */}
          <ActionPanelSection
            title: "Privacidade e Segurança"
            description="Gerencie suas configurações de privacidade"
            icon={Shield}
          >
            <GlassCard>
              <GlassCardContent className="p-6">
                <ActionPanel
                  items={[
                    {
                      title: 'Dados de Uso',
                      description: 'Ajude-nos a melhorar o sistema compartilhando dados de uso anônimos',
                      icon: Shield,
                      badge: 'Ativado',
                      badgeColor: 'blue',
                      actionLabel: 'Gerenciar',
                      showChevron: true,
                      onAction: () => toast({
                        title: 'Em breve',
                        description: 'As configurações de privacidade estarão disponíveis em breve.'
                      })
                    },
                    {
                      title: 'Histórico de Atividades',
                      description: 'Visualize e gerencie seu histórico de conversas e investigações',
                      icon: Shield,
                      actionLabel: 'Ver Histórico',
                      showChevron: true,
                      onAction: () => toast({
                        title: 'Em breve',
                        description: 'O histórico de atividades estará disponível em breve.'
                      })
                    }
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
    </div>
  )
}
