'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getTranslations } from '@/lib/i18n'
import { InstallPWASection } from '@/components/install-pwa-section'
import { LoadingScreen } from '@/components/loading-screen'
import { agents } from '@/data/agents'
import Image from 'next/image'
import Link from 'next/link'
import { Folder } from 'lucide-react'
import { useAuth } from '@/hooks/use-supabase-auth'

export default function PTPage() {
  const t = getTranslations('pt')
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  // Debug logging
  useEffect(() => {
    console.log('[PT Page] State:', {
      isAuthenticated,
      isLoading,
      timestamp: new Date().toISOString(),
    })
  }, [isAuthenticated, isLoading])

  // Redirect authenticated users directly to app
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('[PT Page] Redirecting authenticated user to /pt/app')
      router.replace('/pt/app')
    }
  }, [isAuthenticated, isLoading, router])

  const handleAccessSystem = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isAuthenticated) {
      router.push('/pt/app')
    } else {
      router.push('/pt/login')
    }
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    console.log('[PT Page] Rendering loading screen (isLoading = true)')
    return <LoadingScreen />
  }

  // If authenticated, show loading screen while redirecting
  if (isAuthenticated) {
    console.log('[PT Page] Rendering loading screen (isAuthenticated = true)')
    return <LoadingScreen />
  }

  console.log('[PT Page] Rendering landing page content')

  return (
    <div className="relative">
      {/* Global background image - very subtle */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('/operarios.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.02,
        }}
      />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="hero relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Subtle animated gradient overlay */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 via-transparent to-blue-500/10"></div>
          </div>

          <div className="hero-container max-w-5xl mx-auto px-6 py-24 text-center relative z-10 stagger-children">
            <h1 className="hero-title text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent">
              Cidadão.AI
            </h1>

            <p className="hero-subtitle-large text-2xl sm:text-3xl font-medium text-gray-800 dark:text-gray-200 mb-8 max-w-3xl mx-auto">
              Inteligência Artificial para Transparência e Controle Social
            </p>

            <p className="hero-description text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
              Monitore gastos públicos, detecte anomalias e acompanhe investigações em tempo real.
              Nossa rede de IAs brasileiras trabalha 24/7 analisando dados do Portal da
              Transparência.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleAccessSystem}
                className="px-8 py-4 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700 transition-colors"
              >
                Acessar o Sistema
              </button>
              <Link
                href="#features"
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-lg font-medium text-gray-700 dark:text-gray-300 hover:border-green-600 dark:hover:border-green-400 transition-all duration-300"
              >
                Ver Demonstração
              </Link>
            </div>
          </div>
        </section>

        {/* PWA Installation Section - Right after Hero */}
        <InstallPWASection />

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
              Como Funciona a Plataforma
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
              Três ferramentas poderosas para o controle social e transparência pública
            </p>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Dashboard Feature */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover-lift">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Dashboard de Investigações</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Visualize em tempo real as análises realizadas pelas IAs. Acompanhe anomalias
                  detectadas, padrões suspeitos e insights sobre gastos públicos.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Gráficos interativos e filtros avançados
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Alertas automáticos de anomalias
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    Exportação de relatórios detalhados
                  </li>
                </ul>
              </div>

              {/* Chat Feature */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover-lift">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Chat com IAs Especializadas</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Converse diretamente com nossas IAs brasileiras. Faça perguntas sobre gastos
                  públicos, solicite análises específicas ou tire dúvidas sobre transparência.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    17 agentes especializados disponíveis
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    Respostas em linguagem natural
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    Histórico completo de conversas
                  </li>
                </ul>
              </div>

              {/* Real-time Monitoring */}
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover-lift">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Monitoramento em Tempo Real</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Nossas IAs trabalham 24/7 analisando dados do Portal da Transparência, detectando
                  padrões e anomalias automaticamente.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">✓</span>
                    Análise contínua de dados públicos
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">✓</span>
                    Machine Learning avançado
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">✓</span>
                    Notificações instantâneas
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Por que Confiar no Cidadão.AI?
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-lg font-medium mb-1">Gratuito</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Acesso completo sem custos
                </div>
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-lg font-medium mb-1">Monitoramento</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  IAs trabalhando continuamente
                </div>
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="text-4xl font-bold text-yellow-600 mb-2">17</div>
                <div className="text-lg font-medium mb-1">Agentes IA</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Especializados em transparência
                </div>
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="text-4xl font-bold text-purple-600 mb-2">∞</div>
                <div className="text-lg font-medium mb-1">Dados Públicos</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Portal da Transparência integrado
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center mt-16">
              <h3 className="text-2xl font-bold mb-4">
                Pronto para exercer seu direito à transparência?
              </h3>
              <Link
                href="/pt/login"
                className="inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl transition-all duration-300 hover-lift hover-glow"
              >
                Acessar Portal do Cidadão
              </Link>
            </div>
          </div>
        </section>

        {/* Spotify Playlist Section */}
        <section className="py-20 bg-gradient-to-b from-transparent via-green-50/50 dark:via-green-900/10 to-transparent">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Trilha Sonora da Transparência
            </h2>

            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
              {/* Responsive iframe container with aspect ratio */}
              <div className="relative w-full pt-[56.25%]">
                {' '}
                {/* 16:9 aspect ratio */}
                <iframe
                  className="absolute inset-0 w-full h-full rounded-xl shadow-lg"
                  src="https://open.spotify.com/embed/playlist/2CnnwkzO3GPYUuPz7TAWva?utm_source=generator"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Links Sections */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-4">Recursos Adicionais</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
              Para desenvolvedores, pesquisadores e interessados nos detalhes técnicos
            </p>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* GitHub */}
              <Link
                href="https://github.com/anderson-ufrj/cidadao.ai-backend"
                className="p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow hover:shadow-lg transition-all duration-300 hover-lift group text-center"
              >
                <div className="text-4xl mb-4">🐙</div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">
                  Código Aberto
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Repositórios no GitHub</p>
              </Link>

              {/* Documentação */}
              <Link
                href="https://anderson-ufrj.github.io/cidadao.ai-technical-docs/docs/intro"
                className="p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow hover:shadow-lg transition-all duration-300 hover-lift group text-center"
              >
                <div className="text-4xl mb-4">📚</div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">
                  Documentação
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Guias técnicos completos</p>
              </Link>

              {/* API */}
              <Link
                href="https://cidadao-api-production.up.railway.app/docs"
                className="p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow hover:shadow-lg transition-all duration-300 hover-lift group text-center"
              >
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">
                  API REST
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Documentação interativa</p>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
