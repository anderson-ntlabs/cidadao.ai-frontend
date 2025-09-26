'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, Bell, Moon, Sun, Globe, Shield, 
  Database, Paintbrush, Smartphone, Volume2, Download, Upload,
  Zap, Eye, EyeOff, Sliders, RefreshCw, Save, AlertTriangle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { LoadingScreen } from '@/components/loading-screen'
import { BreadcrumbsV2 } from '@/components/breadcrumbs-v2'
import { useNotificationStore } from '@/store/notification-store'
import { useSettingsStore } from '@/hooks/use-settings-store'
import { toast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [importJson, setImportJson] = useState('')
  const [showImport, setShowImport] = useState(false)
  
  const { preferences, updatePreferences } = useNotificationStore()
  const { settings, updateSettings, resetSettings, exportSettings, importSettings } = useSettingsStore()
  
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme: newTheme })
    
    // Apply theme immediately
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(newTheme)
    }
  }

  const handleExportSettings = () => {
    const settingsJson = exportSettings()
    const blob = new Blob([settingsJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cidadao-ai-settings.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Configurações exportadas!', 'Arquivo baixado com sucesso.')
  }

  const handleImportSettings = () => {
    if (importSettings(importJson)) {
      setImportJson('')
      setShowImport(false)
      toast.success('Configurações importadas!', 'Suas preferências foram atualizadas.')
    } else {
      toast.error('Erro na importação', 'Arquivo de configurações inválido.')
    }
  }

  const handleResetSettings = () => {
    if (confirm('Tem certeza que deseja restaurar todas as configurações padrão?')) {
      resetSettings()
      toast.success('Configurações restauradas!', 'Todas as preferências foram redefinidas.')
    }
  }

  if (!user) {
    return <LoadingScreen />
  }

  return (
    <>
      <LoadingScreen />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <BreadcrumbsV2 items={[
              { label: 'Home', href: '/pt/home' },
              { label: 'Configurações', current: true }
            ]} />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-2">
              Configurações
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <Tabs defaultValue="appearance" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Paintbrush className="w-4 h-4" />
                Aparência
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Privacidade
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Avançado
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Sistema
              </TabsTrigger>
            </TabsList>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Paintbrush className="w-5 h-5" />
                    Tema da Interface
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`p-4 border rounded-lg transition-all ${
                        settings.theme === 'light' 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                      <p className="font-medium">Claro</p>
                      <p className="text-sm text-gray-500">Tema claro</p>
                    </button>
                    
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`p-4 border rounded-lg transition-all ${
                        settings.theme === 'dark' 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Moon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <p className="font-medium">Escuro</p>
                      <p className="text-sm text-gray-500">Tema escuro</p>
                    </button>
                    
                    <button
                      onClick={() => handleThemeChange('system')}
                      className={`p-4 border rounded-lg transition-all ${
                        settings.theme === 'system' 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Smartphone className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                      <p className="font-medium">Sistema</p>
                      <p className="text-sm text-gray-500">Segue o sistema</p>
                    </button>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Tamanho da Fonte</h4>
                        <p className="text-sm text-gray-500">Ajuste o tamanho do texto da interface</p>
                      </div>
                      <select 
                        value={settings.fontSize} 
                        onChange={(e) => updateSettings({ fontSize: e.target.value as any })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      >
                        <option value="small">Pequeno</option>
                        <option value="medium">Médio</option>
                        <option value="large">Grande</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Movimento Reduzido</h4>
                        <p className="text-sm text-gray-500">Diminui animações para melhor acessibilidade</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.reducedMotion}
                        onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Modo Compacto</h4>
                        <p className="text-sm text-gray-500">Interface mais densa com menos espaçamento</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.compactMode}
                        onChange={(e) => updateSettings({ compactMode: e.target.checked })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Preferências de Notificação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Investigações</h4>
                        <p className="text-sm text-gray-500">Receber notificações sobre novas investigações</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.investigations}
                        onChange={(e) => updateSettings({ 
                          notifications: { ...settings.notifications, investigations: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Anomalias</h4>
                        <p className="text-sm text-gray-500">Alertas sobre anomalias detectadas</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.anomalies}
                        onChange={(e) => updateSettings({ 
                          notifications: { ...settings.notifications, anomalies: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Relatórios</h4>
                        <p className="text-sm text-gray-500">Notificações de relatórios concluídos</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.reports}
                        onChange={(e) => updateSettings({ 
                          notifications: { ...settings.notifications, reports: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Sistema</h4>
                        <p className="text-sm text-gray-500">Atualizações e manutenções do sistema</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.system}
                        onChange={(e) => updateSettings({ 
                          notifications: { ...settings.notifications, system: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-4">
                    <h4 className="font-medium">Configurações Avançadas</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Som das Notificações</h4>
                        <p className="text-sm text-gray-500">Reproduzir som ao receber notificações</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.sound}
                        onChange={(e) => updateSettings({ 
                          notifications: { ...settings.notifications, sound: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Notificações Desktop</h4>
                        <p className="text-sm text-gray-500">Mostrar notificações do navegador</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.desktop}
                        onChange={(e) => updateSettings({ 
                          notifications: { ...settings.notifications, desktop: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email</h4>
                        <p className="text-sm text-gray-500">Receber notificações por email</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.email}
                        onChange={(e) => updateSettings({ 
                          notifications: { ...settings.notifications, email: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Frequência</h4>
                        <p className="text-sm text-gray-500">Com que frequência receber notificações</p>
                      </div>
                      <select 
                        value={settings.notifications.frequency} 
                        onChange={(e) => updateSettings({ 
                          notifications: { ...settings.notifications, frequency: e.target.value as any }
                        })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      >
                        <option value="immediate">Imediato</option>
                        <option value="hourly">A cada hora</option>
                        <option value="daily">Diário</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacidade e Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Perfil Público</h4>
                        <p className="text-sm text-gray-500">Permitir que outros usuários vejam seu perfil</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.privacy.publicProfile}
                        onChange={(e) => updateSettings({ 
                          privacy: { ...settings.privacy, publicProfile: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded" 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Histórico de Atividades</h4>
                        <p className="text-sm text-gray-500">Salvar histórico de conversas e investigações</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.privacy.activityHistory}
                        onChange={(e) => updateSettings({ 
                          privacy: { ...settings.privacy, activityHistory: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded" 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Opt-out de Analytics</h4>
                        <p className="text-sm text-gray-500">Desativar coleta de dados de uso</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.privacy.analyticsOptOut}
                        onChange={(e) => updateSettings({ 
                          privacy: { ...settings.privacy, analyticsOptOut: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded" 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Compartilhar Dados de Uso</h4>
                        <p className="text-sm text-gray-500">Ajudar a melhorar o sistema compartilhando dados anônimos</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.privacy.shareUsageData}
                        onChange={(e) => updateSettings({ 
                          privacy: { ...settings.privacy, shareUsageData: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded" 
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-4">Gestão de Dados</h4>
                    <div className="space-y-3">
                      <Button variant="secondary" className="w-full text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Meus Dados
                      </Button>
                      <Button variant="secondary" className="w-full text-yellow-600 border-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20">
                        <EyeOff className="w-4 h-4 mr-2" />
                        Tornar Perfil Privado
                      </Button>
                      <Button variant="secondary" className="w-full text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Excluir Conta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Settings */}
            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Configurações de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Animações da Interface</h4>
                        <p className="text-sm text-gray-500">Habilita transições e animações visuais</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.performance.enableAnimations}
                        onChange={(e) => updateSettings({ 
                          performance: { ...settings.performance, enableAnimations: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Efeitos Sonoros</h4>
                        <p className="text-sm text-gray-500">Sons de feedback para ações da interface</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.performance.enableSounds}
                        onChange={(e) => updateSettings({ 
                          performance: { ...settings.performance, enableSounds: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Salvamento Automático</h4>
                        <p className="text-sm text-gray-500">Salva automaticamente configurações e rascunhos</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.performance.autoSave}
                        onChange={(e) => updateSettings({ 
                          performance: { ...settings.performance, autoSave: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Tamanho do Cache</h4>
                        <p className="text-sm text-gray-500">Quantidade de dados armazenados localmente</p>
                      </div>
                      <select 
                        value={settings.performance.cacheSize} 
                        onChange={(e) => updateSettings({ 
                          performance: { ...settings.performance, cacheSize: e.target.value as any }
                        })}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      >
                        <option value="small">Pequeno (50MB)</option>
                        <option value="medium">Médio (200MB)</option>
                        <option value="large">Grande (500MB)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-4">Estatísticas de Performance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="font-medium text-gray-600 dark:text-gray-400">Cache Usado</div>
                        <div className="text-lg font-bold">127 MB</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="font-medium text-gray-600 dark:text-gray-400">Tempo de Carregamento</div>
                        <div className="text-lg font-bold">0.8s</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="font-medium text-gray-600 dark:text-gray-400">Dados Salvos</div>
                        <div className="text-lg font-bold">2.4 MB</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <Button variant="secondary" className="w-full">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Limpar Cache
                      </Button>
                      <Button variant="secondary" className="w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Otimizar Performance
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sliders className="w-5 h-5" />
                    Configurações Avançadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                          Configurações Experimentais
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Estas opções podem afetar a estabilidade do sistema. Use com cuidado.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Recursos Beta</h4>
                        <p className="text-sm text-gray-500">Acesso antecipado a novos recursos</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.advanced.betaFeatures}
                        onChange={(e) => updateSettings({ 
                          advanced: { ...settings.advanced, betaFeatures: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Modo Desenvolvedor</h4>
                        <p className="text-sm text-gray-500">Mostra informações técnicas avançadas</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.advanced.developerMode}
                        onChange={(e) => updateSettings({ 
                          advanced: { ...settings.advanced, developerMode: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Debug Mode</h4>
                        <p className="text-sm text-gray-500">Logs detalhados no console do navegador</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.advanced.debugMode}
                        onChange={(e) => updateSettings({ 
                          advanced: { ...settings.advanced, debugMode: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Interface Experimental</h4>
                        <p className="text-sm text-gray-500">Testa novos designs e layouts</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.advanced.experimentalUI}
                        onChange={(e) => updateSettings({ 
                          advanced: { ...settings.advanced, experimentalUI: e.target.checked }
                        })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-4">Gerenciamento de Dados</h4>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          variant="secondary" 
                          onClick={handleExportSettings}
                          className="flex-1"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Exportar Configurações
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => setShowImport(!showImport)}
                          className="flex-1"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Importar Configurações
                        </Button>
                      </div>
                      
                      {showImport && (
                        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <textarea
                            value={importJson}
                            onChange={(e) => setImportJson(e.target.value)}
                            placeholder="Cole aqui o JSON das configurações..."
                            className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700"
                          />
                          <div className="flex gap-2">
                            <Button onClick={handleImportSettings} size="sm">
                              Importar
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => {
                                setShowImport(false)
                                setImportJson('')
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        variant="secondary" 
                        onClick={handleResetSettings}
                        className="w-full text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Restaurar Configurações Padrão
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Configurações do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Versão do Sistema:</strong> v1.0.0
                    </div>
                    <div>
                      <strong>Última Atualização:</strong> 19/09/2025
                    </div>
                    <div>
                      <strong>Agentes Ativos:</strong> 17
                    </div>
                    <div>
                      <strong>Status:</strong> <Badge variant="success">Online</Badge>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-3">
                    <Button variant="secondary" className="w-full">
                      Verificar Atualizações
                    </Button>
                    <Button variant="secondary" className="w-full">
                      Relatório de Sistema
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Coming Soon Notice */}
          <Card className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                🚧 Página em Desenvolvimento
              </h3>
              <p className="text-blue-600 dark:text-blue-300">
                Esta página será expandida no Sprint 3 com configurações avançadas, 
                integração com APIs externas e customizações de interface.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}