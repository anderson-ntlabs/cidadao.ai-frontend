'use client'

import '@/styles/design-system/tokens/index.css'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  MessageSquare, LayoutDashboard, Settings, User, 
  Bell, TrendingUp, Shield, Zap, ChevronRight,
  Activity, FileSearch, Brain, Users, AlertTriangle,
  CheckCircle, Search, BarChart, Lock
} from 'lucide-react'
import { GlassCard, GlassCardHeader, GlassCardContent, GlassCardFooter } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNotificationStore } from '@/store/notification-store'
import { useAuth } from '@/hooks/use-supabase-auth'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface QuickStat {
  label: string
  value: string | number
  change?: number
  icon: React.ReactNode
  trend?: { value: number; isPositive: boolean }
}

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const { getUnreadCount, getStats } = useNotificationStore()
  
  const notificationStats = getStats()
  const unreadCount = getUnreadCount()
  
  // Welcome message
  useEffect(() => {
    if (user && !isLoading) {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
      if (!hasSeenWelcome) {
        toast.success(
          `Bem-vindo ao Cidadão.AI, ${user.name?.split(' ')[0]}!`,
          'Explore as ferramentas de transparência pública.'
        )
        localStorage.setItem('hasSeenWelcome', 'true')
      }
    }
    setIsLoading(false)
  }, [user, isLoading])

  // Auth loading is handled by AuthLayout

  // Phase 1: Only Home and Chat are active
  const navigationCards = [
    {
      title: 'Chat com IAs',
      description: 'Converse com nossos agentes especializados em transparência pública',
      icon: MessageSquare,
      href: '/pt/app/chat',
      gradient: 'from-blue-500 to-purple-600',
      stats: '17 agentes disponíveis',
      badge: null,
      active: true
    },
    {
      title: 'Dashboard',
      description: 'Acompanhe investigações e análises em tempo real',
      icon: LayoutDashboard,
      href: '/pt/app/dashboard',
      gradient: 'from-green-500 to-emerald-600',
      stats: 'Em desenvolvimento',
      badge: 'Em Breve',
      active: false
    },
    {
      title: 'Notificações',
      description: 'Central de alertas e atualizações do sistema',
      icon: Bell,
      href: '/pt/app/notificacoes',
      gradient: 'from-orange-500 to-red-600',
      stats: 'Em desenvolvimento',
      badge: 'Em Breve',
      active: false
    },
    {
      title: 'Investigações',
      description: 'Detalhes completos das análises realizadas',
      icon: FileSearch,
      href: '/pt/app/investigacoes',
      gradient: 'from-purple-500 to-pink-600',
      stats: 'Em desenvolvimento',
      badge: 'Em Breve',
      active: false
    }
  ]
  
  const quickStats: QuickStat[] = [
    {
      label: 'Contratos Analisados',
      value: '2,847',
      icon: <FileSearch className="w-5 h-5" />,
      trend: { value: 12, isPositive: true }
    },
    {
      label: 'Anomalias Detectadas',
      value: '23',
      icon: <AlertTriangle className="w-5 h-5" />,
      trend: { value: 5, isPositive: false }
    },
    {
      label: 'Economia Identificada',
      value: 'R$ 1.2M',
      icon: <TrendingUp className="w-5 h-5" />,
      trend: { value: 18, isPositive: true }
    },
    {
      label: 'Agentes Ativos',
      value: '8/17',
      icon: <Brain className="w-5 h-5" />,
      trend: { value: 2, isPositive: true }
    }
  ]

  return (
    <div className="min-h-screen relative">
      {/* Background Image - Operários */}
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
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Olá, {user?.name?.split(' ')[0] || 'Cidadão'} 👋
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Bem-vindo ao centro de comando da transparência pública brasileira
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <GlassCard key={index} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-gradient-to-br from-green-500/20 to-blue-600/20 rounded-lg">
                  {stat.icon}
                </div>
                {stat.trend && (
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    stat.trend.isPositive 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    {stat.trend.isPositive ? '+' : ''}{stat.trend.value}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
            </GlassCard>
          ))}
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {navigationCards.map((card, index) => {
            return card.active ? (
              <Link key={index} href={card.href}>
                <GlassCard
                  className={cn(
                    "h-full transition-all duration-300",
                    card.active
                      ? "hover:shadow-2xl hover:scale-[1.02] cursor-pointer group"
                      : "opacity-60 cursor-not-allowed"
                  )}
                >
                  <GlassCardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                        card.gradient,
                        !card.active && "grayscale"
                      )}>
                        <card.icon className="w-8 h-8 text-white" />
                      </div>
                      {card.badge && (
                        <span className={cn(
                          "px-3 py-1 text-xs font-bold rounded-full",
                          card.active
                            ? "bg-red-500 text-white"
                            : "bg-yellow-500 text-white"
                        )}>
                          {card.badge}
                        </span>
                      )}
                    </div>

                    <h3 className={cn(
                      "text-xl font-bold mb-2 transition-colors",
                      card.active
                        ? "text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400"
                        : "text-gray-500 dark:text-gray-500"
                    )}>
                      {card.title}
                    </h3>

                    <p className={cn(
                      "mb-4",
                      card.active
                        ? "text-gray-600 dark:text-gray-400"
                        : "text-gray-500 dark:text-gray-600"
                    )}>
                      {card.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-500">
                        {card.stats}
                      </span>
                      {card.active && (
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                      )}
                    </div>
                  </GlassCardContent>
                </GlassCard>
              </Link>
            ) : (
              <div key={index}>
                <GlassCard
                  className={cn(
                    "h-full transition-all duration-300",
                    "opacity-60 cursor-not-allowed"
                  )}
                >
                  <GlassCardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                        card.gradient,
                        "grayscale"
                      )}>
                        <card.icon className="w-6 h-6 text-white" />
                      </div>
                      {!card.active && (
                        <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/50 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200">
                          Em Breve
                        </Badge>
                      )}
                    </div>

                    <h3 className={cn(
                      "text-xl font-bold mb-2 transition-colors",
                      "text-gray-500 dark:text-gray-500"
                    )}>
                      {card.title}
                    </h3>

                    <p className={cn(
                      "mb-4",
                      "text-gray-500 dark:text-gray-600"
                    )}>
                      {card.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-500">
                        {card.stats}
                      </span>
                    </div>
                  </GlassCardContent>
                </GlassCard>
              </div>
            )
          })}
        </div>

        {/* Recent Activity */}
        <GlassCard className="mb-8">
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Atividade Recente
              </h2>
              <Link href="/pt/app">
                <Button variant="ghost" size="sm">
                  Ver tudo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </GlassCardHeader>
          
          <GlassCardContent className="p-0">
            <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {[
                { 
                  icon: Search, 
                  title: 'Nova investigação iniciada',
                  desc: 'Análise de contratos do Ministério da Saúde',
                  time: 'há 2 minutos',
                  color: 'text-blue-600'
                },
                { 
                  icon: AlertTriangle, 
                  title: 'Anomalia detectada',
                  desc: 'Possível superfaturamento em licitação',
                  time: 'há 15 minutos',
                  color: 'text-red-600'
                },
                { 
                  icon: CheckCircle, 
                  title: 'Investigação concluída',
                  desc: 'Análise de gastos com merenda escolar',
                  time: 'há 1 hora',
                  color: 'text-green-600'
                },
                { 
                  icon: Users, 
                  title: 'Múltiplos agentes ativados',
                  desc: 'Zumbi, Anita e Tiradentes investigando',
                  time: 'há 2 horas',
                  color: 'text-purple-600'
                }
              ].map((activity, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <activity.icon className={cn("w-5 h-5 mt-0.5", activity.color)} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.desc}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {activity.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard className="bg-gradient-to-r from-green-600/10 to-blue-600/10">
          <GlassCardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Ações Rápidas
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                leftIcon={<MessageSquare className="w-4 h-4" />}
                onClick={() => router.push('/pt/app/chat')}
              >
                Iniciar Chat com IAs
              </Button>
              <Button
                variant="secondary"
                leftIcon={<Settings className="w-4 h-4" />}
                onClick={() => router.push('/pt/app/configuracoes')}
              >
                Configurações
              </Button>
              <Button
                variant="secondary"
                leftIcon={<Lock className="w-4 h-4" />}
                onClick={() => router.push('/pt/app/perfil')}
              >
                Meu Perfil
              </Button>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  )
}