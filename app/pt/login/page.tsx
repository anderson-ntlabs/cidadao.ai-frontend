'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingScreen } from '@/components/loading-screen'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  
  const handleLogin = async (provider: string) => {
    setIsLoading(true)
    setLoadingProvider(provider)
    
    // Simula processo de autenticação
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Salva usuário mockado no localStorage
    const mockUser = {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@email.com',
      provider: provider,
      avatar: `https://ui-avatars.com/api/?name=João+Silva&background=10b981&color=fff`,
      createdAt: new Date().toISOString()
    }
    
    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('isAuthenticated', 'true')
    
    // Redireciona para dashboard
    router.push('/pt/dashboard')
  }
  
  const providers = [
    {
      id: 'google',
      name: 'Google',
      icon: '🔍',
      bgColor: 'bg-white hover:bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300'
    },
    {
      id: 'govbr',
      name: 'Gov.br',
      icon: '🇧🇷',
      bgColor: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white',
      borderColor: 'border-blue-600'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: '🐙',
      bgColor: 'bg-gray-900 hover:bg-gray-800',
      textColor: 'text-white',
      borderColor: 'border-gray-900'
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: '𝕏',
      bgColor: 'bg-black hover:bg-gray-900',
      textColor: 'text-white',
      borderColor: 'border-black'
    }
  ]
  
  return (
    <>
      <LoadingScreen />
      {/* Main Content */}
      <section className="min-h-[80vh] py-20">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            {/* Título */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">
                Portal do Cidadão
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Acesse com sua conta preferida para começar
              </p>
            </div>
            
            {/* Providers */}
            <div className="space-y-3 mb-8">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleLogin(provider.id)}
                  disabled={isLoading}
                  className={`
                    w-full flex items-center justify-center gap-3 px-6 py-3 
                    ${provider.bgColor} ${provider.textColor} 
                    border ${provider.borderColor} rounded-lg font-medium
                    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                    ${!isLoading && 'hover:shadow-lg hover:scale-[1.02]'}
                  `}
                >
                  {loadingProvider === provider.id ? (
                    <span className="animate-pulse">Conectando...</span>
                  ) : (
                    <>
                      <span className="text-xl">{provider.icon}</span>
                      <span>Entrar com {provider.name}</span>
                    </>
                  )}
                </button>
              ))}
            </div>
            
            {/* Divisor */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">
                  ou
                </span>
              </div>
            </div>
            
            {/* Login com email (futuro) */}
            <button
              disabled
              className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-lg font-medium cursor-not-allowed"
            >
              Entrar com Email (Em breve)
            </button>
            
            {/* Termos */}
            <p className="mt-8 text-xs text-center text-gray-600 dark:text-gray-400">
              Ao entrar, você concorda com nossos{' '}
              <Link href="/pt/privacy" className="text-green-600 hover:underline">
                termos de uso
              </Link>
              {' '}e{' '}
              <Link href="/pt/privacy" className="text-green-600 hover:underline">
                política de privacidade
              </Link>
            </p>
          </div>
          
          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur-sm rounded-lg border border-blue-200/50 dark:border-blue-800/50">
            <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
              🔒 Ambiente de demonstração - Nenhuma informação real é coletada
            </p>
          </div>
        </div>
      </section>
    </>
  )
}