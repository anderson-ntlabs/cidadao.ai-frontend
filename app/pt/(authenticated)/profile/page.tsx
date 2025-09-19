'use client'

import { useState, useEffect } from 'react'
import { User, Camera, Mail, Calendar, Shield, Edit3 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import { LoadingScreen } from '@/components/loading-screen'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

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
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-32 h-32 rounded-full shadow-lg"
                  />
                  <button className="absolute bottom-2 right-2 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors shadow-lg">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                
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
                
                <Button className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Editar Perfil
                </Button>
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