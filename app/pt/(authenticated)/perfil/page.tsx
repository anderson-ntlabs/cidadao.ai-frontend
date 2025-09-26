'use client'

import { useState, useEffect } from 'react'
import { User, Settings, Shield } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { ProfileForm } from '@/components/profile/profile-form'
import { PreferencesForm } from '@/components/profile/preferences-form'
import { LoadingScreen } from '@/components/loading-screen'
import { profileService } from '@/lib/services/profile.service'
import { useAuth } from '@/hooks/use-supabase-auth'
import type { UserProfile, UserPreferences } from '@/types/profile'

export default function ProfilePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [profileData, preferencesData] = await Promise.all([
        profileService.getProfile(),
        profileService.getPreferences()
      ])

      setProfile(profileData)
      setPreferences(preferencesData)
    } catch (error) {
      console.error('Error loading profile data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!profile || !preferences) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Erro ao carregar dados do perfil
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Meu Perfil
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Preferências</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Informações Pessoais</h2>
            <ProfileForm 
              profile={profile} 
              onUpdate={(updatedProfile) => setProfile(updatedProfile)}
            />
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Preferências do Sistema</h2>
            <PreferencesForm 
              preferences={preferences}
              onUpdate={(updatedPreferences) => setPreferences(updatedPreferences)}
            />
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Segurança da Conta</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h3 className="font-medium mb-2">Autenticação</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Você está autenticado via {user?.app_metadata?.provider || 'email'}
                </p>
                <p className="text-xs text-gray-500">
                  Último login: {new Date(user?.last_sign_in_at || '').toLocaleString('pt-BR')}
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                  Autenticação de Dois Fatores
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Em breve você poderá ativar a autenticação de dois fatores para maior segurança.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}