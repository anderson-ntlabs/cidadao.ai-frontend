'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Calendar, Shield, Edit3, Activity, Clock, FileText, Brain } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import { LoadingScreen } from '@/components/loading-screen'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleAvatarChange = (newAvatarUrl: string) => {
    setUser((prev: any) => ({
      ...prev,
      avatar: newAvatarUrl
    }))
  }

  const mockActivityHistory = [
    {
      id: '1',
      type: 'chat',
      title: 'Conversa com Zumbi dos Palmares',
      description: 'Investigação sobre contratos emergenciais da saúde',
      timestamp: '2025-09-19T14:30:00Z',
      icon: Brain,
      color: 'purple'
    },
    {
      id: '2', 
      type: 'investigation',
      title: 'Nova investigação iniciada',
      description: 'Análise de anomalias em licitações de infraestrutura',
      timestamp: '2025-09-19T12:15:00Z',
      icon: FileText,
      color: 'blue'
    },
    {
      id: '3',
      type: 'report',
      title: 'Relatório baixado',
      description: 'Relatório mensal de transparência - Agosto 2025',
      timestamp: '2025-09-19T10:45:00Z',
      icon: Activity,
      color: 'green'
    },
    {
      id: '4',
      type: 'login',
      title: 'Login realizado',
      description: 'Acesso via Google OAuth',
      timestamp: '2025-09-19T09:30:00Z',
      icon: Clock,
      color: 'gray'
    }
  ]

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
              { label: 'Meu Perfil' }
            ]} />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-2">
              Meu Perfil
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <AvatarUpload
                  currentAvatar={user.avatar}
                  userName={user.name}
                  onAvatarChange={handleAvatarChange}
                />
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    {user.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                    {user.email}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Badge variant="secondary" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Usuário Verificado
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "secondary" : "default"}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditing ? 'Cancelar' : 'Editar Perfil'}
                  </Button>
                  {isEditing && (
                    <Button className="flex items-center gap-2">
                      Salvar Alterações
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nome Completo</label>
                  <p className="text-gray-800 dark:text-gray-200 mt-1">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                  <p className="text-gray-800 dark:text-gray-200 mt-1">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Provedor de Login</label>
                  <p className="text-gray-800 dark:text-gray-200 mt-1 capitalize">{user.provider}</p>
                </div>
              </CardContent>
            </Card>

            {/* Activity Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Atividade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Conversas Iniciadas</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Investigações Acompanhadas</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Relatórios Gerados</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tempo Total de Uso</span>
                  <span className="font-semibold">24h 35min</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity History */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Histórico de Atividades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivityHistory.map((activity) => {
                  const IconComponent = activity.icon
                  const getColorClasses = (color: string) => {
                    switch (color) {
                      case 'purple': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                      case 'blue': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      case 'green': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      case 'gray': return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                    }
                  }

                  return (
                    <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getColorClasses(activity.color)}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {new Date(activity.timestamp).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-6 text-center">
                <Button variant="secondary" className="flex items-center gap-2 mx-auto">
                  <Clock className="w-4 h-4" />
                  Ver Histórico Completo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon Notice */}
          <Card className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                🚧 Página em Desenvolvimento
              </h3>
              <p className="text-blue-600 dark:text-blue-300">
                Esta página será expandida no Sprint 3 com funcionalidades completas de edição de perfil, 
                histórico detalhado e preferências avançadas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}