'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  MessageSquare, LayoutDashboard, Settings, User, 
  Bell, TrendingUp, Shield, Zap, ChevronRight,
  Activity, FileSearch, Brain, Users, AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/ui'
import { LoadingScreen } from '@/components/loading-screen'
import { useNotificationStore } from '@/store/notification-store'
import { toast } from '@/hooks/use-toast'

interface QuickStat {
  label: string
  value: string | number
  change?: number
  icon: React.ReactNode
}

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { getUnreadCount, getStats } = useNotificationStore()
  
  const notificationStats = getStats()
  const unreadCount = getUnreadCount()
  
  // Get user data
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setIsLoading(false)
  }, [])
  
  // Welcome message
  useEffect(() => {
    if (user && !isLoading) {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
      if (!hasSeenWelcome) {
        toast({
          title: `Bem-vindo ao Cidadão.AI, ${user.name}!`,
          description: 'Explore as ferramentas de transparência pública.',
        })
        localStorage.setItem('hasSeenWelcome', 'true')
      }
    }
  }, [user, isLoading])
  
  if (isLoading) {
    return <LoadingScreen />
  }
  
  const navigationCards = [
    {
      title: 'Chat com IAs',
      description: 'Converse com nossos agentes especializados em transparência pública',
      icon: MessageSquare,
      href: '/pt/chat',
      color: 'from-blue-500 to-purple-600',
      stats: '17 agentes disponíveis',
      badge: null
    },
    {
      title: 'Dashboard',
      description: 'Acompanhe investigações e análises em tempo real',
      icon: LayoutDashboard,
      href: '/pt/dashboard',
      color: 'from-green-500 to-emerald-600',
      stats: '5 investigações ativas',
      badge: 'Novo'
    },
    {
      title: 'Notificações',
      description: 'Central de alertas e atualizações do sistema',
      icon: Bell,
      href: '/pt/notifications',
      color: 'from-orange-500 to-red-600',
      stats: `${notificationStats.total} notificações`,
      badge: unreadCount > 0 ? unreadCount : null
    },
    {
      title: 'Meu Perfil',
      description: 'Gerencie suas informações pessoais e preferências',
      icon: User,
      href: '/pt/profile',
      color: 'from-purple-500 to-pink-600',
      stats: 'Perfil completo',
      badge: null
    },
    {
      title: 'Configurações',
      description: 'Personalize sua experiência e preferências do sistema',
      icon: Settings,
      href: '/pt/settings',
      color: 'from-gray-600 to-gray-800',
      stats: 'Tema, notificações e mais',
      badge: null
    }
  ]
  
  const quickStats: QuickStat[] = [
    {
      label: 'Investigações Hoje',
      value: 12,
      change: 20,
      icon: <FileSearch className="w-5 h-5" />
    },
    {
      label: 'Anomalias Detectadas',
      value: 3,
      change: -25,
      icon: <AlertTriangle className="w-5 h-5" />
    },
    {
      label: 'Agentes Ativos',
      value: 17,
      icon: <Brain className="w-5 h-5" />
    },
    {
      label: 'Taxa de Precisão',
      value: '94%',
      change: 5,
      icon: <TrendingUp className="w-5 h-5" />
    }
  ]
  
  return (
    <>
      <LoadingScreen />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Olá, {user?.name || 'Cidadão'}! 👋
                </h1>
                <p className="text-green-50 text-lg">
                  Bem-vindo ao seu painel de transparência pública
                </p>
              </div>
              
              <div className="mt-6 md:mt-0 flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-green-100">Último acesso</p>
                  <p className="font-medium">Hoje às 14:32</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      {stat.change && (
                        <p className={`text-xs mt-1 flex items-center ${
                          stat.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change > 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                        </p>
                      )}
                    </div>
                    <div className="text-muted-foreground">{stat.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Navigation Cards */}
          <h2 className="text-xl font-semibold mb-6">O que você deseja fazer?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {navigationCards.map((card) => (
              <Link key={card.href} href={card.href}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}>
                        <card.icon className="w-6 h-6" />
                      </div>
                      {card.badge && (
                        <Badge variant={typeof card.badge === 'number' ? 'destructive' : 'default'}>
                          {card.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="mt-4 flex items-center justify-between">
                      {card.title}
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      {card.stats}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Atividade Recente
                <Link href="/pt/dashboard" className="text-sm font-normal text-blue-600 hover:text-blue-700">
                  Ver tudo →
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <FileSearch className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nova investigação iniciada</p>
                    <p className="text-xs text-muted-foreground">Zumbi dos Palmares analisando contrato #2024-789</p>
                    <p className="text-xs text-muted-foreground mt-1">Há 2 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Anomalia detectada</p>
                    <p className="text-xs text-muted-foreground">Score 0.89 em licitação de infraestrutura</p>
                    <p className="text-xs text-muted-foreground mt-1">Há 5 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Análise concluída</p>
                    <p className="text-xs text-muted-foreground">Relatório mensal de transparência disponível</p>
                    <p className="text-xs text-muted-foreground mt-1">Ontem</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Tips */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Dica do dia
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Você sabia que pode conversar com múltiplos agentes de IA simultaneamente? 
                  Experimente perguntar ao Zumbi dos Palmares sobre anomalias enquanto a 
                  Anita Garibaldi analisa padrões históricos!
                </p>
                <Link href="/pt/chat" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 mt-2 hover:underline">
                  Experimentar agora <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}