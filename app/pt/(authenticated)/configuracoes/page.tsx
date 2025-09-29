'use client'

import { useState, useEffect } from 'react'
import { Settings, Bell, Moon, Sun, Globe, Shield, Database, Paintbrush } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { LoadingScreen } from '@/components/loading-screen'
import { ButtonV2 } from '@/components/ui/button'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Configurações
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paintbrush className="w-5 h-5" />
              Aparência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Tema</h4>
                  <p className="text-sm text-gray-500">Escolha entre claro, escuro ou automático</p>
                </div>
                <div className="flex gap-2">
                  <ButtonV2 variant="secondary" size="sm" leftIcon={<Sun className="w-4 h-4" />}>
                    Claro
                  </ButtonV2>
                  <ButtonV2 variant="secondary" size="sm" leftIcon={<Moon className="w-4 h-4" />}>
                    Escuro
                  </ButtonV2>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notificações por Email</h4>
                  <p className="text-sm text-gray-500">Receba atualizações importantes por email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Compartilhar Dados de Uso</h4>
                  <p className="text-sm text-gray-500">Ajudar a melhorar o sistema compartilhando dados anônimos</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Notice */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Página em Desenvolvimento
            </h3>
            <p className="text-blue-600 dark:text-blue-300">
              Esta página será expandida em breve com configurações avançadas, 
              integração com APIs externas e customizações de interface.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}