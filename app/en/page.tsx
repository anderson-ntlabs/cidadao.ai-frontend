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
      <section 
        className="hero relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-fixed bg-cover bg-center"
        style={{
          backgroundImage: 'url(/operarios.png)',
        }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 via-white/85 to-blue-50/90 dark:from-gray-900/90 dark:via-gray-800/85 dark:to-gray-900/90"></div>
        
        {/* Subtle animated gradient overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 via-transparent to-blue-500/10 animate-gradient-shift"></div>
        </div>
        
        <div className="hero-container max-w-5xl mx-auto px-6 py-24 text-center relative z-10 stagger-children">
          <div className="hero-badge inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 rounded-full text-green-800 dark:text-green-200 font-medium mb-6 hover-glow">
            🇧🇷 Public Transparency with AI
          </div>
          
          <h1 className="hero-title text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent animate-gradient">
            Cidadão.AI
          </h1>
          
          <p className="hero-subtitle-large text-2xl sm:text-3xl font-medium text-gray-800 dark:text-gray-200 mb-8 max-w-3xl mx-auto">
            Artificial Intelligence for Transparency and Social Control
          </p>
          
          <p className="hero-description text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
            Monitor public spending, detect anomalies and track investigations in real time. 
            Our network of Brazilian AIs works 24/7 analyzing data from the Transparency Portal.
          </p>
          
          {/* CTA Buttons - Always go to PT version */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/pt/login" 
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl transition-all duration-300 hover-lift hover-glow"
            >
              Citizen Portal
            </Link>
            <Link 
              href="#features" 
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-lg font-medium text-gray-700 dark:text-gray-300 hover:border-green-600 dark:hover:border-green-400 transition-all duration-300"
            >
              Learn About the Platform
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Already have access? Use the <span className="font-medium">Login</span> button at the top
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            How the Platform Works
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
            Three powerful tools for social control and public transparency
          </p>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Dashboard Feature */}
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Investigation Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                View real-time analyses performed by AIs. Track detected anomalies, 
                suspicious patterns, and insights on public spending.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Interactive charts and advanced filters
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Automatic anomaly alerts
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Detailed report export
                </li>
              </ul>
            </div>

            {/* Chat Feature */}
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Chat with Specialized AIs</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Talk directly with our Brazilian AIs. Ask questions about public spending, 
                request specific analyses, or clarify doubts about transparency.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  17 specialized agents available
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Natural language responses
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Complete conversation history
                </li>
              </ul>
            </div>

            {/* Real-time Monitoring */}
            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Real-time Monitoring</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Our AIs work 24/7 analyzing data from the Transparency Portal, automatically 
                detecting patterns and anomalies.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">✓</span>
                  Continuous public data analysis
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">✓</span>
                  Advanced Machine Learning
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 mr-2">✓</span>
                  Instant notifications
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
            Why Trust Cidadão.AI?
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-lg font-medium mb-1">Free</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Complete access at no cost</div>
            </div>
            
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-lg font-medium mb-1">Monitoring</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">AIs working continuously</div>
            </div>
            
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl font-bold text-yellow-600 mb-2">17</div>
              <div className="text-lg font-medium mb-1">AI Agents</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Specialized in transparency</div>
            </div>
            
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="text-4xl font-bold text-purple-600 mb-2">∞</div>
              <div className="text-lg font-medium mb-1">Public Data</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Integrated Transparency Portal</div>
            </div>
          </div>

          {/* Final CTA - Always go to PT */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold mb-4">Ready to exercise your right to transparency?</h3>
            <Link 
              href="/pt/login" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl transition-all duration-300 hover-lift hover-glow"
            >
              Access Citizen Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Links Sections */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 relative">
        {/* Pattern background instead of image */}
        <div className="absolute inset-0 bg-topography-pattern opacity-5"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Additional Resources
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
            For developers, researchers and those interested in technical details
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* GitHub */}
            <Link 
              href="https://github.com/anderson-ufrj/cidadao.ai-backend" 
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover-lift group text-center"
            >
              <div className="text-4xl mb-4">🐙</div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">Open Source</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">GitHub Repositories</p>
            </Link>
            
            {/* Documentation */}
            <Link 
              href="https://anderson-ufrj.github.io/cidadao.ai-technical-docs/docs/intro" 
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover-lift group text-center"
            >
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">Documentation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Complete technical guides</p>
            </Link>
            
            {/* API */}
            <Link 
              href="https://neural-thinker-cidadao-ai-backend.hf.space/docs" 
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover-lift group text-center"
            >
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">REST API</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Interactive documentation</p>
            </Link>
          </div>
        </div>
      </section>


      <InstallPWA />
    </>
  )
}