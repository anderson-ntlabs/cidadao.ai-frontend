'use client'

import { getTranslations } from '@/lib/i18n'
import { InstallPWA } from '@/components/install-pwa'
import { LoadingScreen } from '@/components/loading-screen'
import { agents } from '@/data/agents'
import Image from 'next/image'
import Link from 'next/link'
import { Folder } from 'lucide-react'

export default function ENPage() {
  const t = getTranslations('en')
  
  return (
    <>
      <LoadingScreen />
      {/* Hero Section */}
      <section className="hero relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
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
            🇧🇷 Public Transparency with AI
          </div>
          
          <h1 className="hero-title text-5xl sm:text-7xl font-bold mb-4 bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent animate-gradient">
            Cidadão.AI
          </h1>
          
          <p className="hero-subtitle-large text-2xl sm:text-3xl font-medium text-gray-800 dark:text-gray-200 mb-6">
            Official Documentation Hub
          </p>
          
          <p className="hero-mission text-xl text-gray-700 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
            This is the meeting point between technology, citizenship and public responsibility.
          </p>
          
          <p className="hero-description text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
            Cidadão.AI brings together multiple Brazilian artificial intelligences working in network 
            to democratize access to public data, strengthen transparency and empower 
            every citizen with clear, accessible and auditable information.
          </p>
        </div>
      </section>

      {/* Agents Carousel Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Meet Our Brazilian AIs
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
            Each agent is a specialized artificial intelligence, working 24/7 for public transparency
          </p>
          
          {/* All 17 Agents Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-9 gap-3 sm:gap-4 md:gap-6 justify-items-center">
              {agents.map((agent, index) => (
                <Link 
                  href="/en/agents" 
                  key={agent.id} 
                  className="group cursor-pointer animate-fade-in-up" 
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="text-center transform transition-all duration-300 hover:scale-105">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto mb-3 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-4 group-hover:ring-green-500 dark:group-hover:ring-green-400 transition-all duration-300 shadow-md group-hover:shadow-xl">
                    <Image
                      src={`/agents/${agent.image}`}
                      alt={agent.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <h3 className="font-medium text-sm sm:text-base group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">{agent.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 opacity-80 group-hover:opacity-100 transition-opacity duration-300">{agent.role.en}</p>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/en/agents" className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover-lift hover-glow">
              Understand our AI agents
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
          {/* Repositories */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Repositories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="https://github.com/anderson-ufrj/cidadao.ai-backend" 
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover-lift group">
                <div className="flex items-start gap-3">
                  <Folder className="w-8 h-8 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">cidadao.ai-backend</h3>
                    <p className="text-gray-600 dark:text-gray-400">Backend system with FastAPI and AI agents</p>
                  </div>
                </div>
              </Link>
              <Link href="https://github.com/anderson-ufrj/cidadao.ai-frontend" 
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover-lift group">
                <div className="flex items-start gap-3">
                  <Folder className="w-8 h-8 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">cidadao.ai-frontend</h3>
                    <p className="text-gray-600 dark:text-gray-400">Modern web interface (in development)</p>
                  </div>
                </div>
              </Link>
              <Link href="https://github.com/anderson-ufrj/cidadao.ai-technical-docs" 
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover-lift group">
                <div className="flex items-start gap-3">
                  <Folder className="w-8 h-8 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">cidadao.ai-technical-docs</h3>
                    <p className="text-gray-600 dark:text-gray-400">Detailed technical documentation</p>
                  </div>
                </div>
              </Link>
              {/* <Link href="https://github.com/anderson-ufrj/cidadao.ai-models" 
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover-lift group">
                <div className="flex items-start gap-3">
                  <Folder className="w-8 h-8 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">cidadao.ai-models</h3>
                    <p className="text-gray-600 dark:text-gray-400">Machine Learning and AI models</p>
                  </div>
                </div>
              </Link> */}
              <Link href="https://github.com/anderson-ufrj/cidadao.ai-hub" 
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover-lift group">
                <div className="flex items-start gap-3">
                  <Folder className="w-8 h-8 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">cidadao.ai-hub</h3>
                    <p className="text-gray-600 dark:text-gray-400">This documentation hub (source code)</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Applications */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Applications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="https://cidadao-ai-frontend.vercel.app/" 
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-green-500">
                <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">🌐 Web App</h3>
                <p className="text-gray-600 dark:text-gray-400">Modern frontend for agent interaction</p>
              </Link>
              <Link href="https://huggingface.co/spaces/neural-thinker/cidadao.ai-backend" 
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">⚡ FastAPI Backend</h3>
                <p className="text-gray-600 dark:text-gray-400">RESTful API for system integration</p>
              </Link>
            </div>
          </div>

          {/* Documentation & Research */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Documentation & Research</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="https://anderson-ufrj.github.io/cidadao.ai-technical-docs/docs/intro" 
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover-lift group">
                <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">📚 Technical Documentation</h3>
                <p className="text-gray-600 dark:text-gray-400">Complete technical documentation</p>
              </Link>
              <Link href="/docs/notas-de-pesquisa.pdf" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover-lift group">
                <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">📄 Research Notes</h3>
                <p className="text-gray-600 dark:text-gray-400">Detailed technical document (PDF)</p>
              </Link>
            </div>
          </div>

          {/* Other Links */}
          <div>
            <h2 className="text-2xl font-bold mb-8">🔗 Other Links</h2>
            
            {/* System & Status */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-red-600">🔴 System & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="https://neural-thinker-cidadao-ai-backend.hf.space/health" 
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h4 className="font-medium mb-1">System Health</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Check operational status</p>
                </Link>
                <Link href="https://neural-thinker-cidadao-ai-backend.hf.space/metrics" 
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h4 className="font-medium mb-1">Metrics</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Prometheus metrics endpoint</p>
                </Link>
              </div>
            </div>

            {/* API & Documentation */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-blue-600">📚 API & Documentation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="https://neural-thinker-cidadao-ai-backend.hf.space/docs" 
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h4 className="font-medium mb-1">Swagger UI</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Interactive API documentation</p>
                </Link>
                <Link href="https://neural-thinker-cidadao-ai-backend.hf.space/redoc" 
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h4 className="font-medium mb-1">ReDoc</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Alternative API documentation</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InstallPWA />
    </>
  )
}