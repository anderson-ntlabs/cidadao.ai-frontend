'use client'

import { useState, useEffect } from 'react'
import { useAcademyDemo } from '@/hooks/use-academy-demo'
import {
  AcademyHeader,
  AcademySidebar,
  StatCard,
  AgentCard,
  QuickActionCard,
  ActivityFeed,
  BadgeShowcase,
  InternshipContractModal,
  CertificateModal,
} from '@/components/academy'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Trophy,
  Flame,
  Clock,
  MessageSquare,
  BookOpen,
  Video,
  FileText,
  Award,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

// Rank configuration
const ranks = {
  novato: { name: 'Novato', color: 'gray', minXp: 0 },
  aprendiz: { name: 'Aprendiz', color: 'green', minXp: 100 },
  contribuidor: { name: 'Contribuidor', color: 'blue', minXp: 500 },
  mentor: { name: 'Mentor', color: 'purple', minXp: 2000 },
  arquiteto: { name: 'Arquiteto', color: 'yellow', minXp: 5000 },
}

// Agent teachers available for chat
const agentTeachers = [
  {
    id: 'abaporu',
    name: 'Abaporu',
    role: 'Orquestrador',
    emoji: '🎭',
    specialty: 'Coordenacao geral e distribuicao de tarefas',
  },
  {
    id: 'zumbi',
    name: 'Zumbi',
    role: 'Detector de Anomalias',
    emoji: '🛡️',
    specialty: 'Seguranca e deteccao de fraudes',
  },
  {
    id: 'anita',
    name: 'Anita',
    role: 'Analista de Dados',
    emoji: '📊',
    specialty: 'Analise estatistica e padroes',
  },
  {
    id: 'tiradentes',
    name: 'Tiradentes',
    role: 'Reporter',
    emoji: '📜',
    specialty: 'Documentacao e relatorios',
  },
  {
    id: 'drummond',
    name: 'Drummond',
    role: 'Comunicador',
    emoji: '✍️',
    specialty: 'Comunicacao clara e objetiva',
  },
  {
    id: 'machado',
    name: 'Machado',
    role: 'Escritor',
    emoji: '📚',
    specialty: 'Textos, narrativas e resumos',
  },
]

export default function AcademyDashboardPage() {
  const { user, isLoading, xpTransactions, badges, checkAndAwardBadges, resetDemo } =
    useAcademyDemo()
  const [showContractModal, setShowContractModal] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)

  // Show internship contract modal on first access
  useEffect(() => {
    if (!isLoading && !user.hasAcceptedInternshipContract) {
      setShowContractModal(true)
    }
  }, [isLoading, user.hasAcceptedInternshipContract])

  // Check for badge eligibility whenever user data changes
  useEffect(() => {
    if (!isLoading) {
      checkAndAwardBadges()
    }
  }, [isLoading, user, checkAndAwardBadges])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const rankInfo = ranks[user.currentRank as keyof typeof ranks] || ranks.novato
  const nextRank = Object.values(ranks).find((r) => r.minXp > user.totalXp)
  const xpForNextRank = nextRank ? nextRank.minXp - user.totalXp : 0

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <AcademyHeader user={user} onReset={resetDemo} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <AcademySidebar user={user} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Ola, {user.name.split(' ')[0]}!
                </h2>
                <span className="text-2xl animate-bounce">👋</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Pronto para mais uma sessao de aprendizado? Seu progresso esta incrivel!
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={Trophy}
                value={`Lv.${user.currentLevel}`}
                label={rankInfo.name}
                iconColor="green"
                progress={
                  nextRank
                    ? {
                        current: user.totalXp,
                        max: nextRank.minXp,
                        label: `Faltam ${xpForNextRank} XP para ${nextRank.name}`,
                      }
                    : undefined
                }
              />

              <StatCard
                icon={Flame}
                value={user.currentStreak}
                label="Dias seguidos"
                sublabel={
                  user.longestStreak > user.currentStreak
                    ? `Recorde: ${user.longestStreak}`
                    : undefined
                }
                iconColor="orange"
              />

              <StatCard
                icon={Clock}
                value={`${Math.floor(user.totalTimeMinutes / 60)}h`}
                label="Total de estudo"
                sublabel={`${user.totalTimeMinutes % 60}min acumulados`}
                iconColor="blue"
              />

              <StatCard
                icon={MessageSquare}
                value={user.totalSessions}
                label="Sessoes"
                iconColor="purple"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Agent Teachers - 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                {/* Section Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Agentes Professores
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Escolha um agente para iniciar uma conversa
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="text-green-600 dark:text-green-400"
                  >
                    Ver todos
                  </Button>
                </div>

                {/* Agent Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {agentTeachers.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      id={agent.id}
                      name={agent.name}
                      role={agent.role}
                      emoji={agent.emoji}
                      specialty={agent.specialty}
                      status="online"
                    />
                  ))}
                </div>

                {/* Activity Feed - Mobile/Tablet */}
                <div className="lg:hidden">
                  <ActivityFeed activities={xpTransactions} />
                </div>
              </div>

              {/* Sidebar Content - 1 column */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card variant="elevated" padding="md">
                  <CardHeader className="mb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Acoes Rapidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <QuickActionCard
                      icon="📝"
                      label="Escrever no diario"
                      description="Registre seu aprendizado"
                      href="/pt/academy/diario"
                    />
                    <QuickActionCard
                      icon={Video}
                      label="Assistir videos"
                      description="Continue seu progresso"
                      href="/pt/academy/videos"
                    />
                    <QuickActionCard
                      icon={FileText}
                      label="Leituras obrigatorias"
                      description="Material essencial"
                      href="/pt/academy/leituras"
                    />
                    <QuickActionCard
                      icon={Trophy}
                      label="Ver ranking"
                      description="Sua posicao atual"
                      href="/pt/academy/ranking"
                    />
                    <QuickActionCard
                      icon={GraduationCap}
                      label="Certificado e Relatorio"
                      description="Baixe seu certificado"
                      onClick={() => setShowCertificateModal(true)}
                      variant="gradient"
                    />
                  </CardContent>
                </Card>

                {/* Activity Feed - Desktop */}
                <div className="hidden lg:block">
                  <ActivityFeed activities={xpTransactions} />
                </div>

                {/* Badges */}
                <BadgeShowcase badges={badges} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <InternshipContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
      />
      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
      />
    </div>
  )
}
