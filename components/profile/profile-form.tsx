'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Camera, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { profileService } from '@/lib/services/profile.service'
import type { UserProfile, UpdateProfileData } from '@/types/profile'
import { toast } from '@/hooks/use-toast'

interface ProfileFormProps {
  profile: UserProfile
  onUpdate?: (profile: UserProfile) => void
}

export function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState<UpdateProfileData>({
    username: profile.username || '',
    full_name: profile.full_name || '',
    bio: profile.bio || '',
  })
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo inválido', 'Por favor, selecione uma imagem')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande', 'A imagem deve ter no máximo 5MB')
      return
    }

    setIsUploadingAvatar(true)
    
    try {
      const url = await profileService.uploadAvatar(file)
      if (url) {
        setAvatarUrl(url)
        await profileService.updateProfile({ avatar_url: url })
        toast.success('Avatar atualizado!', 'Sua foto foi alterada com sucesso')
      } else {
        toast.error('Erro no upload', 'Não foi possível enviar a imagem')
      }
    } catch (error) {
      toast.error('Erro no upload', 'Ocorreu um erro ao enviar a imagem')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await profileService.updateProfile(formData)
      if (success) {
        toast.success('Perfil atualizado!', 'Suas informações foram salvas')
        if (onUpdate) {
          onUpdate({ ...profile, ...formData })
        }
      } else {
        toast.error('Erro ao salvar', 'Não foi possível atualizar seu perfil')
      }
    } catch (error) {
      toast.error('Erro ao salvar', 'Ocorreu um erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <Image
            src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.email)}&background=16a34a&color=fff`}
            alt="Avatar"
            width={96}
            height={96}
            className="rounded-full object-cover"
          />
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 p-1 bg-green-600 rounded-full cursor-pointer hover:bg-green-700 transition-colors"
          >
            {isUploadingAvatar ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-white" />
            )}
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            disabled={isUploadingAvatar}
          />
        </div>
        <div>
          <h3 className="text-lg font-medium">Foto do Perfil</h3>
          <p className="text-sm text-gray-500">JPG, PNG ou GIF. Máximo 5MB.</p>
        </div>
      </div>

      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nome de usuário
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600"
          placeholder="@seuusername"
        />
        <p className="mt-1 text-sm text-gray-500">Seu nome único no sistema</p>
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nome completo
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600"
          placeholder="Seu nome completo"
        />
      </div>

      {/* Email (readonly) */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={profile.email}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-600 cursor-not-allowed"
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600"
          placeholder="Conte um pouco sobre você..."
        />
        <p className="mt-1 text-sm text-gray-500">Máximo 200 caracteres</p>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
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
              Salvar alterações
            </>
          )}
        </Button>
      </div>
    </form>
  )
}