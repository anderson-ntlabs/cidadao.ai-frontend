'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoadingScreen } from '@/components/loading-screen'

interface Investigation {
  id: string
  title: string
  status: 'em_andamento' | 'concluida' | 'pendente'
  anomalyScore: number
  agent: string
  date: string
  description: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Dados mockados
  const investigations: Investigation[] = [
    {
      id: '1',
      title: 'Análise de Contratos Emergenciais - Saúde 2024',
      status: 'em_andamento',
      anomalyScore: 0.87,
      agent: 'Zumbi dos Palmares',
      date: '2024-01-15',
      description: 'Detectadas irregularidades em 23 contratos emergenciais'
    },
    {
      id: '2',
      title: 'Padrões de Gastos - Final de Ano',
      status: 'concluida',
      anomalyScore: 0.92,
      agent: 'Anita Garibaldi',
      date: '2024-01-14',
      description: 'Aumento atípico de 340% em despesas de publicidade'
    },
    {
      id: '3',
      title: 'Licitações de Obras Públicas - Q4 2023',
      status: 'concluida',
      anomalyScore: 0.76,
      agent: 'Tiradentes',
      date: '2024-01-13',
      description: '15 empresas com padrões suspeitos identificadas'
    },
    {
      id: '4',
      title: 'Folha de Pagamento - Gratificações',
      status: 'pendente',
      anomalyScore: 0.65,
      agent: 'Machado de Assis',
      date: '2024-01-12',
      description: 'Aguardando análise detalhada de gratificações atípicas'
    }
  ]
  
  const metrics = {
    totalInvestigacoes: 127,
    anomaliasDetectadas: 89,
    economiaIdentificada: 'R$ 45,7 milhões',
    tempoMedioAnalise: '2.3 horas'
  }
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const isAuth = localStorage.getItem('isAuthenticated')
    
    if (!storedUser || isAuth !== 'true') {
      router.push('/pt/login')
      return
    }
    
    setUser(JSON.parse(storedUser))
    setIsLoading(false)
  }, [router])
  
  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    router.push('/')
  }
  
  const getStatusColor = (status: Investigation['status']) => {
    switch (status) {
      case 'em_andamento':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'concluida':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pendente':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }
  
  const getStatusText = (status: Investigation['status']) => {
    switch (status) {
      case 'em_andamento':
        return 'Em Andamento'
      case 'concluida':
        return 'Concluída'
      case 'pendente':
        return 'Pendente'
    }
  }
  
  const getAnomalyColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600 dark:text-red-400'
    if (score >= 0.6) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }
  
  if (isLoading) {
    return <LoadingScreen />
  }
  
  return (
    <>
      <LoadingScreen />
      {/* Sub-header do Dashboard */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Dashboard de Investigações</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/pt/chat" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                💬 Chat com IAs
              </Link>
              
              <div className="flex items-center gap-3">
                {user && (
                  <>
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {user.name}
                    </span>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 transition-colors"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-1">{metrics.totalInvestigacoes}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total de Investigações</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-red-600 mb-1">{metrics.anomaliasDetectadas}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Anomalias Detectadas</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-blue-600 mb-1">{metrics.economiaIdentificada}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Economia Identificada</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-1">{metrics.tempoMedioAnalise}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tempo Médio de Análise</div>
          </div>
        </div>
        
        {/* Lista de Investigações */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">Investigações Recentes</h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {investigations.map((investigation) => (
              <div key={investigation.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{investigation.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{investigation.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(investigation.status)}`}>
                    {getStatusText(investigation.status)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 dark:text-gray-400">
                      Agente: <span className="font-medium text-gray-700 dark:text-gray-300">{investigation.agent}</span>
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Score de Anomalia: 
                      <span className={`font-bold ml-1 ${getAnomalyColor(investigation.anomalyScore)}`}>
                        {(investigation.anomalyScore * 100).toFixed(0)}%
                      </span>
                    </span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {new Date(investigation.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full py-2 text-center text-blue-600 dark:text-blue-400 hover:underline">
              Ver todas as investigações →
            </button>
          </div>
        </div>
      </main>
    </>
  )
}