'use client'

import '@/styles/design-system/tokens/index.css'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoadingScreen } from '@/components/loading-screen'
import { ButtonV2 } from '@/components/ui/button'
import { CardV2, CardV2Content, CardV2Header, CardV2Title, CardV2Description } from '@/components/ui/card'
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
      // Redireciona para dashboard
      router.push('/pt/dashboard')
    }
  }
  
  const providers = [
    {
      id: 'google',
      name: 'Google',
      icon: Chrome,
      color: 'hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/20 dark:hover:to-orange-900/20'
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      color: 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-900/20 dark:hover:to-gray-800/20'
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20'
    }
  ]
  
  if (isLoading) {
    return <LoadingScreen />
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Image - Operários */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/operarios.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.03
        }}
      />
      
      {/* Animated gradient overlay - matching landing page */}
      <div className="absolute inset-0 z-[1]">
        <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 via-transparent to-blue-500/10"></div>
      </div>
      
      {/* Topography pattern - matching landing page */}
      <div className="absolute inset-0 opacity-[0.02] z-[2]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '30px 30px'
      }} />
      
      {/* Header */}
      <header className="relative z-10 animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
          <nav className="flex items-center justify-between">
            <Link 
              href="/pt" 
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Voltar ao início</span>
            </Link>
            
            <Link href="/pt" className="flex items-center gap-3 hover-lift">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent">
                Cidadão.AI
              </span>
            </Link>
          </nav>
        </div>
      </header>
      
      {/* Login Form */}
      <main className="relative z-10 flex items-center justify-center px-6 py-12 sm:px-8 lg:px-12 min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CardV2 variant="elevated" className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 shadow-2xl hover:shadow-3xl transition-all duration-300 hover-lift">
            <CardV2Header className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-600 via-yellow-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-xl hover-glow">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <CardV2Title className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Bem-vindo de volta
              </CardV2Title>
              <CardV2Description className="text-lg">
                Acesse sua conta para continuar explorando a transparência pública
              </CardV2Description>
            </CardV2Header>
            
            <CardV2Content className="space-y-6">
              {/* OAuth Providers */}
              <div className="space-y-3">
                {providers.map((provider) => {
                  const Icon = provider.icon
                  return (
                    <ButtonV2
                      key={provider.id}
                      variant="secondary"
                      size="lg"
                      className={`w-full justify-center transition-all duration-300 ${provider.color} hover:shadow-lg hover-lift`}
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
                  <span className="px-4 bg-white/90 dark:bg-gray-900/90 text-gray-500 rounded-full">
                    Ou continue com
                  </span>
                </div>
              </div>
              
              {/* Demo Access */}
              <div className="text-center space-y-4">
                <ButtonV2
                  variant="primary"
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 hover:shadow-xl transition-all duration-300 hover-lift hover-glow"
                  onClick={() => handleLogin('demo')}
                  disabled={isLoading}
                >
                  Acessar versão demo
                </ButtonV2>
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ao fazer login, você concorda com nossos{' '}
                  <Link href="/pt/termos" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    Termos de Uso
                  </Link>{' '}
                  e{' '}
                  <Link href="/pt/privacidade" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    Política de Privacidade
                  </Link>
                </p>
              </div>
            </CardV2Content>
          </CardV2>
          
          {/* Additional Info */}
          <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Primeira vez aqui?{' '}
              <Link 
                href="/pt/sobre" 
                className="font-medium text-green-600 hover:text-green-700 dark:text-green-400 transition-colors"
              >
                Saiba mais sobre o Cidadão.AI
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 mt-auto py-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2">© 2024 Cidadão.AI - Transparência para todos</p>
          <div className="flex justify-center gap-4">
            <Link href="https://github.com/anderson-ufrj/cidadao.ai-backend" className="hover:text-green-600 transition-colors">
              GitHub
            </Link>
            <span>•</span>
            <Link href="https://neural-thinker-cidadao-ai-backend.hf.space/docs" className="hover:text-green-600 transition-colors">
              API
            </Link>
            <span>•</span>
            <Link href="/pt/privacidade" className="hover:text-green-600 transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}