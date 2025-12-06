'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAcademyDemo } from '@/hooks/use-academy-demo'
import { InternshipContractModal } from '@/components/academy/internship-contract-modal'
import { CertificateModal } from '@/components/academy/certificate-modal'

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
    specialty: 'Coordenação geral',
  },
  { id: 'zumbi', name: 'Zumbi', role: 'Detector', emoji: '🛡️', specialty: 'Segurança e anomalias' },
  { id: 'anita', name: 'Anita', role: 'Analista', emoji: '📊', specialty: 'Análise de dados' },
  {
    id: 'tiradentes',
    name: 'Tiradentes',
    role: 'Reporter',
    emoji: '📜',
    specialty: 'Documentação',
  },
  { id: 'drummond', name: 'Drummond', role: 'Comunicador', emoji: '✍️', specialty: 'Comunicação' },
  {
    id: 'machado',
    name: 'Machado',
    role: 'Escritor',
    emoji: '📚',
    specialty: 'Textos e narrativas',
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const rankInfo = ranks[user.currentRank as keyof typeof ranks] || ranks.novato
  const nextRank = Object.values(ranks).find((r) => r.minXp > user.totalXp)
  const xpForNextRank = nextRank ? nextRank.minXp - user.totalXp : 0
  const progressToNextRank = nextRank
    ? ((user.totalXp - rankInfo.minXp) / (nextRank.minXp - rankInfo.minXp)) * 100
    : 100

  // Get last 5 XP transactions
  const recentActivities = xpTransactions.slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center text-white font-bold">
                A
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-gray-100">Academy</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cidadao.AI - Demo</p>
              </div>
            </div>

            {/* User info */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <span className="text-lg">⚡</span>
                <span className="font-bold text-yellow-700 dark:text-yellow-400">
                  {user.totalXp} XP
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full ring-2 ring-green-500"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{rankInfo.name}</p>
                </div>
              </div>

              <button
                onClick={resetDemo}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Resetar Demo"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Demo banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 text-center text-sm">
        <span className="font-medium">🎮 Modo Demo</span> - Explore a Academy sem precisar fazer
        login. Dados salvos no navegador.
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Olá, {user.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Pronto para mais uma sessão de aprendizado?
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Lv.{user.currentLevel}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{rankInfo.name}</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>{user.totalXp} XP</span>
                <span>{nextRank ? `${nextRank.minXp} XP` : 'MAX'}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min(progressToNextRank, 100)}%` }}
                />
              </div>
              {nextRank && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  Faltam {xpForNextRank} XP para {nextRank.name}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl">
                🔥
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {user.currentStreak}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dias seguidos</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                ⏱️
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.floor(user.totalTimeMinutes / 60)}h
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total de estudo</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl">
                💬
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {user.totalSessions}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sessões</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Agent teachers */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Agentes Professores
              </h3>
              <Link
                href="/pt/academy/chat"
                className="text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                Ver todos
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {agentTeachers.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/pt/academy/chat?agent=${agent.id}`}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      {agent.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400">
                        {agent.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{agent.role}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                        {agent.specialty}
                      </p>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.625 12H14.625M12 8.625V14.625M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Ações rápidas</h3>
              <div className="space-y-2">
                <Link
                  href="/pt/academy/diario"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
                >
                  <span className="text-xl">📝</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                    Escrever no diário
                  </span>
                </Link>
                <Link
                  href="/pt/academy/videos"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
                >
                  <span className="text-xl">🎬</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                    Assistir vídeos
                  </span>
                </Link>
                <Link
                  href="/pt/academy/leituras"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
                >
                  <span className="text-xl">📚</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                    Leituras obrigatórias
                  </span>
                </Link>
                <Link
                  href="/pt/academy/ranking"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
                >
                  <span className="text-xl">🏅</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                    Ver ranking
                  </span>
                </Link>
                <button
                  onClick={() => setShowCertificateModal(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 hover:from-green-100 hover:to-blue-100 dark:hover:from-green-900/30 dark:hover:to-blue-900/30 transition-colors group border border-green-200 dark:border-green-700"
                >
                  <span className="text-xl">🎓</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                    Certificado e Relatório
                  </span>
                </button>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Atividade recente</h3>
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 text-sm">
                      <span className="text-green-600 dark:text-green-400 font-bold">
                        +{activity.amount} XP
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 truncate">
                        {activity.description}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Nenhuma atividade ainda.
                  <br />
                  Comece conversando com um agente!
                </p>
              )}
            </div>

            {/* Badges */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                🏅 Badges Conquistados
                {badges.length > 0 && (
                  <span className="text-sm font-normal text-gray-500">({badges.length})</span>
                )}
              </h3>
              {badges.length > 0 ? (
                <div className="space-y-3">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-700"
                    >
                      <span className="text-2xl">{badge.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-gray-100">{badge.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {badge.criteria}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-3xl block mb-2">🍜</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Seja assíduo para ganhar o badge <strong>Japaguri</strong>!
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    3+ dias seguidos, 5+ sessões ou 3+ diários
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Internship Contract Modal */}
      <InternshipContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
      />

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
      />
    </div>
  )
}
