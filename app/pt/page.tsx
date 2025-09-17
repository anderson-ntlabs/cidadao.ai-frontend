'use client'

import { getTranslations } from '@/lib/i18n'
import { InstallPWA } from '@/components/install-pwa'
import { LoadingScreen } from '@/components/loading-screen'
import { agents } from '@/data/agents'
import Image from 'next/image'
import Link from 'next/link'
import { Folder } from 'lucide-react'

export default function PTPage() {
  const t = getTranslations('pt')
  
  return (
    <>
      <LoadingScreen />
      {/* Hero Section */}
      <section className="hero relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Geometric Pattern Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-topography-pattern opacity-20 dark:opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-green-100/40 via-transparent to-blue-100/40 dark:from-green-900/20 dark:via-transparent dark:to-blue-900/20"></div>
        </div>
        
        {/* Animated lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-conic from-green-500/10 via-transparent to-blue-500/10 animate-spin-slow"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-conic from-yellow-500/10 via-transparent to-green-500/10 animate-spin-slow animation-delay-4000"></div>
        </div>
        
        {/* Diagonal stripes */}
        <div className="absolute inset-0 bg-stripes-diagonal opacity-[0.02] dark:opacity-[0.01]"></div>
        
        <div className="hero-container max-w-5xl mx-auto px-6 py-24 text-center relative z-10 stagger-children">
          <div className="hero-badge inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 rounded-full text-green-800 dark:text-green-200 font-medium mb-6 hover-glow">
            🇧🇷 Transparência Pública com IA
          </div>
          
          <h1 className="hero-title text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent animate-gradient">
            Cidadão.AI
          </h1>
          
          <p className="hero-subtitle-large text-2xl sm:text-3xl font-medium text-gray-800 dark:text-gray-200 mb-8 max-w-3xl mx-auto">
            Inteligência Artificial para Transparência e Controle Social
          </p>
          
          <p className="hero-description text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
            Monitore gastos públicos, detecte anomalias e acompanhe investigações em tempo real. 
            Nossa rede de IAs brasileiras trabalha 24/7 analisando dados do Portal da Transparência.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/login" 
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl transition-all duration-300 hover-lift hover-glow"
            >
              Portal do Cidadão
            </Link>
            <Link 
              href="#features" 
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-lg font-medium text-gray-700 dark:text-gray-300 hover:border-green-600 dark:hover:border-green-400 transition-all duration-300"
            >
              Conheça a Plataforma
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Já possui acesso? Use o botão <span className="font-medium">Entrar</span> no topo da página
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800">
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
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Dashboard de Investigações</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Visualize em tempo real as análises realizadas pelas IAs. Acompanhe anomalias detectadas, 
                padrões suspeitos e insights sobre gastos públicos.
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
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Chat com IAs Especializadas</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Converse diretamente com nossas IAs brasileiras. Faça perguntas sobre gastos públicos, 
                solicite análises específicas ou tire dúvidas sobre transparência.
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
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Monitoramento em Tempo Real</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Nossas IAs trabalham 24/7 analisando dados do Portal da Transparência, detectando padrões 
                e anomalias automaticamente.
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
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Por que Confiar no Cidadão.AI?
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-lg font-medium mb-1">Gratuito</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Acesso completo sem custos</div>
            </div>
            
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-lg font-medium mb-1">Monitoramento</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">IAs trabalhando continuamente</div>
            </div>
            
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl font-bold text-yellow-600 mb-2">17</div>
              <div className="text-lg font-medium mb-1">Agentes IA</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Especializados em transparência</div>
            </div>
            
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-4xl font-bold text-purple-600 mb-2">∞</div>
              <div className="text-lg font-medium mb-1">Dados Públicos</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Portal da Transparência integrado</div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold mb-4">Pronto para exercer seu direito à transparência?</h3>
            <Link 
              href="/login" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl transition-all duration-300 hover-lift hover-glow"
            >
              Acessar Portal do Cidadão
            </Link>
          </div>
        </div>
      </section>

      {/* Links Sections */}
      <section 
        className="py-20 bg-gray-50 dark:bg-gray-900/95 relative bg-cover bg-center bg-fixed bg-no-repeat"
        style={{
          backgroundImage: 'url(/operarios.png)',
        }}
      >
        {/* Overlay para melhorar legibilidade */}
        <div className="absolute inset-0 bg-gray-50/95 dark:bg-gray-900/95" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Recursos Adicionais
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
            Para desenvolvedores, pesquisadores e interessados nos detalhes técnicos
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* GitHub */}
            <Link 
              href="https://github.com/anderson-ufrj/cidadao.ai-backend" 
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover-lift group text-center"
            >
              <div className="text-4xl mb-4">🐙</div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">Código Aberto</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Repositórios no GitHub</p>
            </Link>
            
            {/* Documentação */}
            <Link 
              href="https://anderson-ufrj.github.io/cidadao.ai-technical-docs/docs/intro" 
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover-lift group text-center"
            >
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">Documentação</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Guias técnicos completos</p>
            </Link>
            
            {/* API */}
            <Link 
              href="https://neural-thinker-cidadao-ai-backend.hf.space/docs" 
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover-lift group text-center"
            >
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">API REST</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Documentação interativa</p>
            </Link>
          </div>
        </div>
      </section>


      <InstallPWA />
    </>
  )
}