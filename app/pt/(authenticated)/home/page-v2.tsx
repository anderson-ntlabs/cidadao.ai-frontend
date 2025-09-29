'use client'

import '@/styles/design-system/tokens/index.css'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  MessageSquare, LayoutDashboard, Settings, User, 
  Bell, TrendingUp, Shield, Zap, ChevronRight,
  Activity, FileSearch, Brain, Users, AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { 
  CardV2, 
  CardV2Header, 
  CardV2Title, 
  CardV2Description, 
  CardV2Content,
  CardV2Footer,
  CardV2Badge,
  CardV2Stat
} from '@/components/ui/card'
import { ButtonV2 } from '@/components/ui/button'
import { LoadingScreen } from '@/components/loading-screen'
import { useNotificationStore } from '@/store/notification-store'
import { toast } from '@/hooks/use-toast'

interface QuickStat {
  label: string
  value: string | number
  change?: number
  icon: React.ReactNode
  trend?: { value: number; isPositive: boolean }
}

export default function HomePageV2() {
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
        toast.success(
          `Bem-vindo ao Cidadão.AI, ${user.name}!`,
          'Explore as ferramentas de transparência pública.'
        )
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
      iconBg: 'from-brand-blue-500 to-brand-purple-600',
      stats: '17 agentes disponíveis',
      badge: null
    },
    {
      title: 'Dashboard',
      description: 'Acompanhe investigações e análises em tempo real',
      icon: LayoutDashboard,
      href: '/pt/dashboard',
      iconBg: 'from-brand-green-500 to-brand-green-600',
      stats: '5 investigações ativas',
      badge: 'Novo'
    },
    {
      title: 'Notificações',
      description: 'Central de alertas e atualizações do sistema',
      icon: Bell,
      href: '/pt/notifications',
      iconBg: 'from-orange-500 to-brand-red-600',
      stats: `${notificationStats.total} notificações`,
      badge: unreadCount > 0 ? unreadCount : null
    },
    {
      title: 'Meu Perfil',
      description: 'Gerencie suas informações pessoais e preferências',
      icon: User,
      href: '/pt/profile',
      iconBg: 'from-brand-purple-600 to-pink-600',
      stats: 'Perfil completo',
      badge: null
    },
    {
      title: 'Configurações',
      description: 'Personalize sua experiência e preferências do sistema',
      icon: Settings,
      href: '/pt/settings',
      iconBg: 'from-gray-600 to-gray-800',
      stats: 'Tema, notificações e mais',
      badge: null
    }
  ]
  
  return (
    <>
      <LoadingScreen />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section - Redesigned with brand colors */}
        <div className="bg-gradient-to-r from-brand-green-600 to-brand-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-space-4 sm:px-space-6 py-space-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-space-6">
              <div>
                <h1 className="text-3xl font-bold mb-space-2">
                  Olá, {user?.name || 'Cidadão'}! 👋
                </h1>
                <p className="text-green-50 text-lg">
                  Bem-vindo ao seu painel de transparência pública
                </p>
              </div>
              
              <div className="flex items-center gap-space-4">
                <div className="text-right">
                  <p className="text-sm text-green-100">Último acesso</p>
                  <p className="font-medium">Hoje às 14:32</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-space-4 sm:px-space-6 py-space-8">
          {/* Quick Stats - Using CardV2Stat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-4 mb-space-8">
            <CardV2Stat
              title="Investigações Hoje"
              value="12"
              description="Total de investigações"
              trend={{ value: 20, isPositive: true }}
              icon={<FileSearch className="h-5 w-5 text-brand-green-600" />}
            />
            
            <CardV2Stat
              title="Anomalias Detectadas"
              value="3"
              description="Casos suspeitos"
              trend={{ value: 25, isPositive: false }}
              icon={<AlertTriangle className="h-5 w-5 text-brand-yellow-600" />}
            />
            
            <CardV2Stat
              title="Agentes Ativos"
              value="17"
              description="IAs trabalhando"
              icon={<Brain className="h-5 w-5 text-brand-blue-600" />}
            />
            
            <CardV2Stat
              title="Taxa de Precisão"
              value="94%"
              description="Acurácia do sistema"
              trend={{ value: 5, isPositive: true }}
              icon={<TrendingUp className="h-5 w-5 text-brand-green-600" />}
            />
          </div>
          
          {/* Navigation Cards - Using CardV2 */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-space-6">
            O que você deseja fazer?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-6 mb-space-8">
            {navigationCards.map((card) => (
              <Link key={card.href} href={card.href}>
                <CardV2 
                  variant="elevated" 
                  interactive
                  className="h-full"
                >
                  <CardV2Header>
                    <div className="flex items-start justify-between mb-space-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.iconBg} flex items-center justify-center text-white shadow-md`}>
                        <card.icon className="w-6 h-6" />
                      </div>
                      {card.badge && (
                        <CardV2Badge 
                          variant={typeof card.badge === 'number' ? 'danger' : 'info'}
                        >
                          {card.badge}
                        </CardV2Badge>
                      )}
                    </div>
                    <CardV2Title className="flex items-center justify-between group">
                      {card.title}
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-green-600 group-hover:translate-x-1 transition-all" />
                    </CardV2Title>
                    <CardV2Description>{card.description}</CardV2Description>
                  </CardV2Header>
                  <CardV2Content>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-space-2">
                      <Activity className="w-4 h-4" />
                      {card.stats}
                    </p>
                  </CardV2Content>
                </CardV2>
              </Link>
            ))}
          </div>
          
          {/* Recent Activity - Using CardV2 */}
          <CardV2>
            <CardV2Header>
              <CardV2Title className="flex items-center justify-between">
                Atividade Recente
                <Link 
                  href="/pt/dashboard" 
                  className="text-sm font-normal text-brand-blue-600 hover:text-brand-blue-700 transition-colors"
                >
                  Ver tudo →
                </Link>
              </CardV2Title>
            </CardV2Header>
            <CardV2Content>
              <div className="space-y-space-4">
                <div className="flex items-start gap-space-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <FileSearch className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nova investigação iniciada</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Zumbi dos Palmares analisando contrato #2024-789
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-space-1">Há 2 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-space-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Anomalia detectada</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Score 0.89 em licitação de infraestrutura
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-space-1">Há 5 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-space-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Análise concluída</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Relatório mensal de transparência disponível
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-space-1">Ontem</p>
                  </div>
                </div>
              </div>
            </CardV2Content>
          </CardV2>
          
          {/* Quick Tips - Using CardV2 with custom styling */}
          <CardV2 
            variant="filled" 
            className="mt-space-8 border-brand-blue-200 dark:border-brand-blue-800"
          >
            <CardV2Content className="p-space-6">
              <div className="flex items-start gap-space-4">
                <div className="w-10 h-10 rounded-full bg-brand-blue-100 dark:bg-brand-blue-800 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-brand-blue-600 dark:text-brand-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-space-1">
                    Dica do dia
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Você sabia que pode conversar com múltiplos agentes de IA simultaneamente? 
                    Experimente perguntar ao Zumbi dos Palmares sobre anomalias enquanto a 
                    Anita Garibaldi analisa padrões históricos!
                  </p>
                  <ButtonV2 
                    variant="primary"
                    size="sm"
                    className="mt-3"
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    onClick={() => router.push('/pt/chat')}
                  >
                    Experimentar agora
                  </ButtonV2>
                </div>
              </div>
            </CardV2Content>
          </CardV2>
        </div>
      </div>
    </>
  )
}