'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Calendar, Shield, Edit2, Camera } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { GlassCard, GlassCardHeader, GlassCardContent } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-supabase-auth'
import Image from 'next/image'

export default function ProfilePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    bio: '',
    username: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.name || '',
        email: user.email || '',
        bio: '',
        username: user.email?.split('@')[0] || ''
      })
      setIsLoading(false)
    }
  }, [user])

  // Auth loading is handled by AuthLayout
  if (!user) {
    return null
  }

  const handleSave = () => {
    // Save logic here
    setIsEditing(false)
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Meu Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas informações pessoais
          </p>
        </div>

        {/* Profile Header Card */}
        <GlassCard className="mb-8">
          <GlassCardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || 'Avatar'}
                    width={120}
                    height={120}
                    className="rounded-full object-cover ring-4 ring-white/50 dark:ring-gray-800/50"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center ring-4 ring-white/50 dark:ring-gray-800/50">
                    <span className="text-4xl text-white font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
                <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {user.name || 'Usuário'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{user.email}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                    Cidadão Ativo
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    Usuário desde {new Date().getFullYear()}
                  </span>
                </div>
              </div>
              
              <Button
                variant="secondary"
                leftIcon={<Edit2 className="w-4 h-4" />}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancelar' : 'Editar Perfil'}
              </Button>
            </div>
          </GlassCardContent>
        </GlassCard>

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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{formData.full_name || 'Não informado'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <p className="text-gray-900 dark:text-white">{formData.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome de Usuário
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800"
                    placeholder="Conte um pouco sobre você..."
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{formData.bio || 'Nenhuma bio adicionada ainda'}</p>
                )}
              </div>
              
              {isEditing && (
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                  >
                    Salvar Alterações
                  </Button>
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
              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium">Autenticação em Duas Etapas</h4>
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
                  <h4 className="font-medium">Alterar Senha</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Última alteração há 30 dias
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