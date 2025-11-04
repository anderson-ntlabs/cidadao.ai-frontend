'use client'

import { useState, useEffect, useRef } from 'react'
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit2,
  Camera,
  Save,
  X,
  TrendingUp,
  MessageSquare,
  FileSearch,
  Clock,
} from 'lucide-react'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { StatCard, StatsGrid } from '@/components/stats'
import { ActionPanel, type ActionPanelItem } from '@/components/panels'
import { useAuth } from '@/hooks/use-supabase-auth'
import {
  userProfileService,
  type UserProfile,
  type UserStats,
} from '@/lib/services/user-profile.service'
import { toast } from '@/hooks/use-toast'
import Image from 'next/image'
import { logger } from '@/lib/utils/logger'

export default function ProfilePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
  })

  // Load profile and stats
  useEffect(() => {
    if (user) {
      loadProfile()
      loadStats()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const profileData = await userProfileService.getProfile(user.id)

      if (profileData) {
        setProfile(profileData)
        setFormData({
          full_name: profileData.full_name || user.name || '',
          username: profileData.username || user.email?.split('@')[0] || '',
          bio: profileData.bio || '',
        })
      } else {
        // Create initial profile from auth user
        setFormData({
          full_name: user.name || '',
          username: user.email?.split('@')[0] || '',
          bio: '',
        })
      }
    } catch (error) {
      logger.error('Failed to load profile', { error })
      toast.error(
        'Erro ao carregar perfil',
        'Não foi possível carregar seus dados. Tente novamente.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    if (!user) return

    try {
      const statsData = await userProfileService.getStats(user.id)
      setStats(statsData)
    } catch (error) {
      logger.error('Failed to load stats', { error })
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo inválido', 'Por favor, selecione uma imagem.')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande', 'A imagem deve ter no máximo 5MB.')
      return
    }

    setAvatarFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setIsSaving(true)

      // Upload avatar if changed
      let avatarUrl = profile?.avatar_url
      if (avatarFile) {
        avatarUrl = await userProfileService.uploadAvatar(user.id, avatarFile)
        toast.success('Avatar atualizado', 'Sua foto de perfil foi atualizada com sucesso.')
      }

      // Update profile
      const updated = await userProfileService.updateProfile(user.id, {
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        avatar_url: avatarUrl,
      })

      setProfile(updated)
      setIsEditing(false)
      setAvatarFile(null)
      setAvatarPreview(null)

      toast.success('Perfil atualizado', 'Suas informações foram salvas com sucesso.')
    } catch (error) {
      logger.error('Failed to save profile', { error })
      toast.error('Erro ao salvar', 'Não foi possível atualizar seu perfil. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setAvatarFile(null)
    setAvatarPreview(null)

    // Reset form to current profile data
    if (profile) {
      setFormData({
        full_name: profile.full_name || user?.name || '',
        username: profile.username || user?.email?.split('@')[0] || '',
        bio: profile.bio || '',
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Hoje'
    if (diffInDays === 1) return 'Ontem'
    if (diffInDays < 7) return `Há ${diffInDays} dias`
    if (diffInDays < 30) return `Há ${Math.floor(diffInDays / 7)} semanas`
    if (diffInDays < 365) return `Há ${Math.floor(diffInDays / 30)} meses`
    return `Há ${Math.floor(diffInDays / 365)} anos`
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  const currentAvatar = avatarPreview || profile?.avatar_url || user.avatar

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
          opacity: 0.03,
        }}
      />

      {/* Gradient Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20" />

      <div className="relative z-10 max-w-5xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Meu Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas informações pessoais e veja suas estatísticas
          </p>
        </div>

        {/* Profile Header Card */}
        <GlassCard className="mb-6">
          <GlassCardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                {currentAvatar ? (
                  <Image
                    src={currentAvatar}
                    alt={formData.full_name || 'Avatar'}
                    width={120}
                    height={120}
                    className="rounded-full object-cover ring-4 ring-white/50 dark:ring-gray-800/50"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center ring-4 ring-white/50 dark:ring-gray-800/50">
                    <span className="text-4xl text-white font-bold">
                      {formData.full_name?.charAt(0)?.toUpperCase() ||
                        user.email?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}

                {isEditing && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-3 min-h-[44px] min-w-[44px] bg-white dark:bg-gray-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      aria-label="Alterar foto de perfil"
                    >
                      <Camera className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {formData.full_name || user.name || 'Usuário'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-2">@{formData.username}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                    Cidadão Ativo
                  </span>
                  {stats && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                      Membro desde {formatRelativeTime(stats.member_since)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {!isEditing ? (
                  <Button
                    variant="secondary"
                    leftIcon={<Edit2 className="w-4 h-4" />}
                    onClick={() => setIsEditing(true)}
                  >
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      leftIcon={<X className="w-4 h-4" />}
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      leftIcon={<Save className="w-4 h-4" />}
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Statistics Cards - Using reusable StatCard component */}
        {stats && (
          <StatsGrid columns={4} className="mb-6">
            <StatCard
              icon={MessageSquare}
              value={stats.total_messages}
              label="Mensagens"
              color="blue"
            />
            <StatCard
              icon={TrendingUp}
              value={stats.total_sessions}
              label="Conversas"
              color="green"
            />
            <StatCard
              icon={FileSearch}
              value={stats.total_investigations}
              label="Investigações"
              color="purple"
            />
            <StatCard
              icon={Clock}
              value={stats.last_active ? formatRelativeTime(stats.last_active) : 'Agora'}
              label="Última atividade"
              color="orange"
            />
          </StatsGrid>
        )}

        {/* Profile Information */}
        <div className="space-y-6">
          <GlassCard>
            <GlassCardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </h3>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome Completo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full min-h-[44px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white touch-manipulation"
                    placeholder="Seu nome completo"
                    autoComplete="name"
                    inputMode="text"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">
                    {formData.full_name || 'Não informado'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <p className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  O email não pode ser alterado
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome de Usuário
                </label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">@</span>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                        })
                      }
                      className="flex-1 min-h-[44px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white touch-manipulation"
                      placeholder="nome_usuario"
                      autoComplete="username"
                      inputMode="text"
                    />
                  </div>
                ) : (
                  <p className="text-gray-900 dark:text-white">@{formData.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    inputMode="text"
                    className="w-full min-h-[44px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white touch-manipulation"
                    placeholder="Conte um pouco sobre você..."
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {formData.bio || 'Nenhuma bio adicionada ainda'}
                  </p>
                )}
              </div>

              {profile?.created_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Membro desde
                  </label>
                  <p className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(profile.created_at)}
                  </p>
                </div>
              )}
            </GlassCardContent>
          </GlassCard>

          {/* Security Settings - Using ActionPanel component */}
          <GlassCard>
            <GlassCardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Segurança
              </h3>
            </GlassCardHeader>
            <GlassCardContent>
              <ActionPanel
                items={[
                  {
                    title: 'Autenticação em Duas Etapas',
                    description: 'Adicione uma camada extra de segurança à sua conta',
                    actionLabel: 'Configurar',
                    onAction: () =>
                      toast.info(
                        'Em breve',
                        'A autenticação em duas etapas estará disponível em breve.'
                      ),
                    badge: 'Recomendado',
                    badgeColor: 'green',
                  },
                  {
                    title: 'Alterar Senha',
                    description: 'Mantenha sua conta segura com uma senha forte',
                    actionLabel: 'Alterar',
                    onAction: () =>
                      toast.info('Em breve', 'A alteração de senha estará disponível em breve.'),
                  },
                  {
                    title: 'Sessões Ativas',
                    description: 'Gerencie os dispositivos conectados à sua conta',
                    actionLabel: 'Ver Sessões',
                    onAction: () =>
                      toast.info(
                        'Em breve',
                        'O gerenciamento de sessões estará disponível em breve.'
                      ),
                    showChevron: true,
                  },
                ]}
                showDividers={true}
              />
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
