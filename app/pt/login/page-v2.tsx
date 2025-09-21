'use client'

import '@/styles/design-system/tokens/index.css'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoadingScreen } from '@/components/loading-screen'
import { ButtonV2 } from '@/components/ui/button-v2'
import { CardV2, CardV2Content, CardV2Header, CardV2Title, CardV2Description } from '@/components/ui/card-v2'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, Chrome, Github, Mail, Shield } from 'lucide-react'

export default function LoginPageV2() {
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
      avatar: `https://ui-avatars.com/api/?name=João+Silva&background=16a34a&color=fff`,
      createdAt: new Date().toISOString()
    }
    
    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('isAuthenticated', 'true')
    
    // Mostra notificação de sucesso
    toast.success(`Bem-vindo(a), ${mockUser.name}!`, 'Login realizado com sucesso')
    
    // Verifica se há URL de redirecionamento salva
    const redirectUrl = localStorage.getItem('redirectAfterLogin')
    if (redirectUrl) {
      localStorage.removeItem('redirectAfterLogin')
      router.push(redirectUrl)
    } else {
      // Redireciona para home
      router.push('/pt/home')
    }
  }
  
  const providers = [
    {
      id: 'google',
      name: 'Google',
      icon: Chrome,
      color: 'hover:bg-gray-50 dark:hover:bg-gray-800'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      color: 'hover:bg-gray-50 dark:hover:bg-gray-800'
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'hover:bg-gray-50 dark:hover:bg-gray-800'
    }
  ]
  
  if (isLoading) {
    return <LoadingScreen />
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Topography pattern */}
      <div className="absolute inset-0 bg-topography-pattern opacity-[0.02] pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-space-4 sm:px-space-6 py-space-6">
          <nav className="flex items-center justify-between">
            <Link 
              href="/pt" 
              className="flex items-center gap-space-2 text-gray-700 dark:text-gray-300 hover:text-brand-green-600 dark:hover:text-brand-green-400 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Voltar ao início</span>
            </Link>
            
            <Link href="/pt" className="flex items-center gap-space-3">
              <div className="w-10 h-10 bg-brand-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-green-600 to-brand-blue-600 bg-clip-text text-transparent">
                Cidadão.AI
              </span>
            </Link>
          </nav>
        </div>
      </header>
      
      {/* Login Form */}
      <main className="relative z-10 flex items-center justify-center px-space-4 py-space-12 sm:px-space-6 lg:px-space-8">
        <div className="w-full max-w-md">
          <CardV2 variant="elevated" className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
            <CardV2Header className="text-center space-y-space-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-brand-green-600 to-brand-blue-600 rounded-full flex items-center justify-center mb-space-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardV2Title className="text-2xl">Bem-vindo de volta</CardV2Title>
              <CardV2Description>
                Acesse sua conta para continuar explorando a transparência pública
              </CardV2Description>
            </CardV2Header>
            
            <CardV2Content className="space-y-space-4">
              {/* OAuth Providers */}
              <div className="space-y-space-3">
                {providers.map((provider) => {
                  const Icon = provider.icon
                  return (
                    <ButtonV2
                      key={provider.id}
                      variant="outline"
                      size="lg"
                      className="w-full justify-center"
                      onClick={() => handleLogin(provider.id)}
                      disabled={isLoading}
                      leftIcon={
                        loadingProvider === provider.id ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )
                      }
                    >
                      Entrar com {provider.name}
                    </ButtonV2>
                  )
                })}
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-space-2 bg-white dark:bg-gray-900 text-gray-500">
                    Ou continue com
                  </span>
                </div>
              </div>
              
              {/* Demo Access */}
              <div className="text-center space-y-space-3">
                <ButtonV2
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => handleLogin('demo')}
                  disabled={isLoading}
                >
                  Acessar versão demo
                </ButtonV2>
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ao fazer login, você concorda com nossos{' '}
                  <Link href="/pt/termos" className="text-brand-blue-600 hover:text-brand-blue-700">
                    Termos de Uso
                  </Link>{' '}
                  e{' '}
                  <Link href="/pt/privacidade" className="text-brand-blue-600 hover:text-brand-blue-700">
                    Política de Privacidade
                  </Link>
                </p>
              </div>
            </CardV2Content>
          </CardV2>
          
          {/* Additional Info */}
          <div className="mt-space-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Primeira vez aqui?{' '}
              <Link 
                href="/pt/sobre" 
                className="font-medium text-brand-green-600 hover:text-brand-green-700 dark:text-brand-green-400"
              >
                Saiba mais sobre o Cidadão.AI
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 mt-auto py-space-8">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2024 Cidadão.AI - Transparência para todos</p>
        </div>
      </footer>
    </div>
  )
}