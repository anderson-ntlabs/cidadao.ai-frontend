'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, Bell, Moon, Sun, Globe, Shield, 
  Database, Paintbrush, Smartphone, Volume2, Download, Upload,
  Zap, Eye, EyeOff, Sliders, RefreshCw, Save, AlertTriangle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { LoadingScreen } from '@/components/loading-screen'
import { Breadcrumbs } from '@/components/breadcrumbs'
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
            <Breadcrumbs items={[
              { label: 'Configurações' }
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
                        checked={preferences.investigations}
                        onChange={(e) => updatePreferences({ investigations: e.target.checked })}
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
                        checked={preferences.anomalies}
                        onChange={(e) => updatePreferences({ anomalies: e.target.checked })}
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
                        checked={preferences.reports}
                        onChange={(e) => updatePreferences({ reports: e.target.checked })}
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
                        checked={preferences.system}
                        onChange={(e) => updatePreferences({ system: e.target.checked })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Som das Notificações</h4>
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-gray-400" />
                      <input 
                        type="checkbox" 
                        checked={preferences.sound}
                        onChange={(e) => updatePreferences({ sound: e.target.checked })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <label className="text-sm">Reproduzir som ao receber notificações</label>
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
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Perfil Público</h4>
                      <p className="text-sm text-gray-500">Permitir que outros usuários vejam seu perfil</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Histórico de Atividades</h4>
                      <p className="text-sm text-gray-500">Salvar histórico de conversas e investigações</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded" />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                      Limpar Todos os Dados
                    </Button>
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
                    <Button variant="outline" className="w-full">
                      Verificar Atualizações
                    </Button>
                    <Button variant="outline" className="w-full">
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