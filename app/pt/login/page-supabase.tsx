'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Shield } from 'lucide-react'
import { useAuth } from '@/hooks/use-supabase-auth'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in')
  const [redirectTo, setRedirectTo] = useState<string>('')

  useEffect(() => {
    // Redirect authenticated users to app (sistema autenticado)
    if (isAuthenticated && !isLoading) {
      router.replace('/pt/app')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    // Callback redireciona para /pt/app após login bem-sucedido
    setRedirectTo(`${window.location.origin}/auth/callback?next=/pt/app`)
  }, [])

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // If authenticated, will redirect (handled by useEffect above)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecionando para o sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 relative">
      {/* Background pattern matching site design */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/operarios.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.03
        }}
      />

      {/* Gradient overlay matching site design */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <Link href="/pt" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cidadão.AI</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {view === 'sign_in' ? 'Bem-vindo de volta!' : 'Criar conta'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {view === 'sign_in'
              ? 'Entre para acessar o sistema'
              : 'Cadastre-se para começar'}
          </p>
        </div>

        {/* Login Form Card - Glassmorphism effect */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
          <Auth
            supabaseClient={supabase}
            view={view}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#16a34a',
                    brandAccent: '#15803d',
                    inputBackground: '#f9fafb',
                    inputText: '#111827',
                    inputBorder: '#e5e7eb',
                    inputBorderFocus: '#16a34a',
                    inputBorderHover: '#d1d5db',
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                },
              },
              className: {
                anchor: 'text-green-600 hover:text-green-700 underline',
                button: 'font-semibold',
                input: 'placeholder:text-gray-400',
                label: 'text-gray-700 font-medium',
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  button_label: 'Entrar',
                  loading_button_label: 'Entrando...',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Já tem uma conta? Entre',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Sua senha',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  button_label: 'Criar conta',
                  loading_button_label: 'Criando conta...',
                  social_provider_text: 'Criar conta com {{provider}}',
                  link_text: 'Não tem uma conta? Cadastre-se',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Crie uma senha segura',
                  confirmation_text: 'Verifique seu email para confirmar',
                },
                forgotten_password: {
                  link_text: 'Esqueceu sua senha?',
                  email_label: 'Email',
                  button_label: 'Enviar instruções',
                  loading_button_label: 'Enviando...',
                  confirmation_text: 'Verifique seu email para redefinir a senha',
                  email_input_placeholder: 'seu@email.com',
                },
              },
            }}
            providers={['google', 'github', 'spotify']}
            redirectTo={redirectTo}
            onlyThirdPartyProviders={false}
            magicLink={false}
          />
        </div>

        {/* Toggle Sign In/Sign Up */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {view === 'sign_in' ? (
              <>
                Não tem uma conta?{' '}
                <button
                  onClick={() => setView('sign_up')}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium underline"
                >
                  Cadastre-se gratuitamente
                </button>
              </>
            ) : (
              <>
                Já tem uma conta?{' '}
                <button
                  onClick={() => setView('sign_in')}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium underline"
                >
                  Entre aqui
                </button>
              </>
            )}
          </p>
        </div>

        {/* Back Link */}
        <div className="mt-4 text-center">
          <Link
            href="/pt"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center gap-1"
          >
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </main>
  )
}