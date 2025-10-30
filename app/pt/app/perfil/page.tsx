'use client'

import { useState, useEffect, useRef } from 'react'
import { User, Mail, Calendar, Shield, Edit2, Camera, Save, X, TrendingUp, MessageSquare, FileSearch, Clock } from 'lucide-react'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-supabase-auth'
import { userProfileService, type UserProfile, type UserStats } from '@/lib/services/user-profile.service'
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
    bio: ''
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
          bio: profileData.bio || ''
        })
      } else {
        // Create initial profile from auth user
        setFormData({
          full_name: user.name || '',
          username: user.email?.split('@')[0] || '',
          bio: ''
        })
      }
    } catch (error) {
      logger.error('Failed to load profile', { error })
      toast({
        title: 'Erro ao carregar perfil',
        description: 'Não foi possível carregar seus dados. Tente novamente.',
        variant: 'destructive'
      })
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
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem.',
        variant: 'destructive'
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 5MB.',
        variant: 'destructive'
      })
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
        toast({
          title: 'Avatar atualizado',
          description: 'Sua foto de perfil foi atualizada com sucesso.'
        })
      }

      // Update profile
      const updated = await userProfileService.updateProfile(user.id, {
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        avatar_url: avatarUrl
      })

      setProfile(updated)
      setIsEditing(false)
      setAvatarFile(null)
      setAvatarPreview(null)

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.'
      })
    } catch (error) {
      logger.error('Failed to save profile', { error })
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar seu perfil. Tente novamente.',
        variant: 'destructive'
      })
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
        bio: profile.bio || ''
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
          opacity: 0.03
        }}
      />

      {/* Gradient Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20" />

      <div className="relative z-10 max-w-5xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Meu Perfil
          </h1>
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
                      {formData.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
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

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <GlassCard>
              <GlassCardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.total_messages}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mensagens</p>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.total_sessions}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Conversas</p>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <FileSearch className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.total_investigations}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Investigações</p>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats.last_active ? formatRelativeTime(stats.last_active) : 'Agora'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Última atividade</p>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Seu nome completo"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{formData.full_name || 'Não informado'}</p>
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
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                      placeholder="nome_usuario"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Conte um pouco sobre você..."
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{formData.bio || 'Nenhuma bio adicionada ainda'}</p>
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

          {/* Security Settings */}
          <GlassCard>
            <GlassCardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Segurança
              </h3>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Autenticação em Duas Etapas</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Adicione uma camada extra de segurança à sua conta
                  </p>
                </div>
                <Button variant="secondary" size="sm">
                  Configurar
                </Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Alterar Senha</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Mantenha sua conta segura com uma senha forte
                  </p>
                </div>
                <Button variant="secondary" size="sm">
                  Alterar
                </Button>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
