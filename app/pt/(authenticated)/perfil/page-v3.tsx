'use client'

import '@/styles/design-system/tokens/index.css'
import { useState, useEffect } from 'react'
import { User, Settings, Shield, Mail, Calendar, Globe, Edit2, Camera } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { ProfileForm } from '@/components/profile/profile-form'
import { PreferencesForm } from '@/components/profile/preferences-form'
import { LoadingScreen } from '@/components/loading-screen'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { ButtonV2 } from '@/components/ui/button-v2'
import { profileService } from '@/lib/services/profile.service'
import { useAuth } from '@/hooks/use-supabase-auth'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import type { UserProfile, UserPreferences } from '@/types/profile'
import { BreadcrumbsV2 } from '@/components/breadcrumbs-v2'
import { toast } from '@/hooks/use-toast'

export default function ProfilePageV3() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [profileData, preferencesData] = await Promise.all([
        profileService.getProfile(),
        profileService.getPreferences()
      ])

      // If profile doesn't exist or missing Google data, use auth user data
      if (profileData && user) {
        profileData.full_name = profileData.full_name || user.name
        profileData.avatar_url = profileData.avatar_url || user.avatar
        profileData.email = user.email
      } else if (!profileData && user) {
        // Create a profile object from auth user data
        setProfile({
          id: user.id,
          email: user.email,
          full_name: user.name,
          avatar_url: user.avatar,
          username: user.email.split('@')[0],
          bio: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        setPreferences(preferencesData)
        setIsLoading(false)
        return
      }

      setProfile(profileData)
      setPreferences(preferencesData)
    } catch (error) {
      console.error('Error loading profile data:', error)
      toast.error('Erro ao carregar perfil', 'Verifique sua conexão e tente novamente')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!profile || !preferences) {
    return (
      <div className="min-h-screen relative">
        <div className="relative z-10 max-w-4xl mx-auto py-8 px-4">
          <GlassCard>
            <GlassCardContent className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Erro ao carregar dados do perfil
              </p>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    )
  }

  const tabIcons = {
    profile: User,
    preferences: Settings,
    security: Shield
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
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
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20" />
      
      <div className="relative z-10 max-w-4xl mx-auto py-8 px-4">
        {/* Breadcrumbs */}
        <BreadcrumbsV2
          items={[
            { label: 'Home', href: '/pt/home' },
            { label: 'Perfil', current: true }
          ]}
          className="mb-6"
        />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Meu Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>

        {/* Profile Header Card */}
        <GlassCard className="mb-8" variant="lighter">
          <GlassCardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Avatar'}
                    width={120}
                    height={120}
                    className="rounded-full object-cover ring-4 ring-white/50 dark:ring-gray-800/50"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center ring-4 ring-white/50 dark:ring-gray-800/50">
                    <span className="text-4xl text-white font-bold">
                      {profile.full_name?.charAt(0).toUpperCase() || user?.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button className="absolute bottom-0 right-0 p-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors opacity-0 group-hover:opacity-100">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {profile.full_name || user?.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  @{profile.username || user?.email.split('@')[0]}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })}
                  </div>
                </div>
              </div>
              
              <ButtonV2 
                variant="secondary" 
                leftIcon={<Edit2 className="w-4 h-4" />}
                onClick={() => setActiveTab('profile')}
              >
                Editar Perfil
              </ButtonV2>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6">
          {['profile', 'preferences', 'security'].map((tab) => {
            const Icon = tabIcons[tab as keyof typeof tabIcons]
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all",
                  activeTab === tab
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {tab === 'profile' && 'Perfil'}
                  {tab === 'preferences' && 'Preferências'}
                  {tab === 'security' && 'Segurança'}
                </span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <GlassCard>
            <GlassCardHeader>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Informações Pessoais
              </h3>
            </GlassCardHeader>
            <GlassCardContent className="p-6">
              <ProfileForm 
                profile={profile} 
                onUpdate={(updatedProfile) => setProfile(updatedProfile)}
              />
            </GlassCardContent>
          </GlassCard>
        )}

        {activeTab === 'preferences' && (
          <GlassCard>
            <GlassCardHeader>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Preferências do Sistema
              </h3>
            </GlassCardHeader>
            <GlassCardContent className="p-6">
              <PreferencesForm 
                preferences={preferences}
                onUpdate={(updatedPreferences) => setPreferences(updatedPreferences)}
              />
            </GlassCardContent>
          </GlassCard>
        )}

        {activeTab === 'security' && (
          <GlassCard>
            <GlassCardHeader>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Segurança da Conta
              </h3>
            </GlassCardHeader>
            <GlassCardContent className="p-6">
              <div className="space-y-4">
                {/* Authentication Method */}
                <GlassCard variant="lighter">
                  <GlassCardContent className="p-4">
                    <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                      Método de Autenticação
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Você está autenticado via {user?.email ? 'email' : 'OAuth'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail className="w-4 h-4" />
                      {user?.email}
                    </div>
                  </GlassCardContent>
                </GlassCard>

                {/* Two-Factor Auth */}
                <GlassCard variant="lighter" className="border-blue-200 dark:border-blue-800">
                  <GlassCardContent className="p-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                      Autenticação de Dois Fatores
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                      Em breve você poderá ativar a autenticação de dois fatores para maior segurança.
                    </p>
                    <ButtonV2 variant="secondary" disabled size="sm">
                      Em Breve
                    </ButtonV2>
                  </GlassCardContent>
                </GlassCard>

                {/* Login Activity */}
                <GlassCard variant="lighter">
                  <GlassCardContent className="p-4">
                    <h4 className="font-medium mb-4 text-gray-900 dark:text-white">
                      Atividade de Login
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Sessão Atual
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Globe className="w-3 h-3" />
                            Chrome no Linux
                          </p>
                        </div>
                        <span className="text-green-600 text-xs font-medium">
                          Ativa
                        </span>
                      </div>
                    </div>
                  </GlassCardContent>
                </GlassCard>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  )
}