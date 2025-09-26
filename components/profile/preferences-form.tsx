'use client'

import { useState } from 'react'
import { Save, Loader2, Moon, Sun, Monitor, Globe, Bell, Mail } from 'lucide-react'
import { Button } from '@/components/ui'
import { profileService } from '@/lib/services/profile.service'
import type { UserPreferences, UpdatePreferencesData } from '@/types/profile'
import { toast } from '@/hooks/use-toast'

interface PreferencesFormProps {
  preferences: UserPreferences
  onUpdate?: (preferences: UserPreferences) => void
}

export function PreferencesForm({ preferences, onUpdate }: PreferencesFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<UpdatePreferencesData>(preferences)

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    setFormData(prev => ({ ...prev, theme }))
  }

  const handleLanguageChange = (language: 'pt' | 'en') => {
    setFormData(prev => ({ ...prev, language }))
  }

  const handleToggle = (field: 'notifications_enabled' | 'email_notifications') => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await profileService.updatePreferences(formData)
      if (success) {
        toast.success('Preferências salvas!', 'Suas configurações foram atualizadas')
        if (onUpdate) {
          onUpdate({ ...preferences, ...formData } as UserPreferences)
        }
      } else {
        toast.error('Erro ao salvar', 'Não foi possível atualizar suas preferências')
      }
    } catch (error) {
      toast.error('Erro ao salvar', 'Ocorreu um erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Theme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <Sun className="w-4 h-4 inline mr-2" />
          Tema da Interface
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`p-3 rounded-md border-2 flex flex-col items-center gap-2 transition-colors ${
              formData.theme === 'light'
                ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span className="text-sm">Claro</span>
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`p-3 rounded-md border-2 flex flex-col items-center gap-2 transition-colors ${
              formData.theme === 'dark'
                ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-sm">Escuro</span>
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('auto')}
            className={`p-3 rounded-md border-2 flex flex-col items-center gap-2 transition-colors ${
              formData.theme === 'auto'
                ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <Monitor className="w-5 h-5" />
            <span className="text-sm">Auto</span>
          </button>
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <Globe className="w-4 h-4 inline mr-2" />
          Idioma
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleLanguageChange('pt')}
            className={`p-3 rounded-md border-2 flex items-center justify-center gap-2 transition-colors ${
              formData.language === 'pt'
                ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <span className="text-lg">🇧🇷</span>
            <span className="text-sm">Português</span>
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`p-3 rounded-md border-2 flex items-center justify-center gap-2 transition-colors ${
              formData.language === 'en'
                ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <span className="text-lg">🇺🇸</span>
            <span className="text-sm">English</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          <Bell className="w-4 h-4 inline mr-2" />
          Notificações
        </h3>
        
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Notificações no navegador
          </span>
          <button
            type="button"
            onClick={() => handleToggle('notifications_enabled')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.notifications_enabled ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.notifications_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            <Mail className="w-4 h-4 inline mr-2" />
            Notificações por email
          </span>
          <button
            type="button"
            onClick={() => handleToggle('email_notifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.email_notifications ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.email_notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar preferências
            </>
          )}
        </Button>
      </div>
    </form>
  )
}