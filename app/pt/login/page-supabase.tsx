'use client'

import { useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { Briefcase, Shield } from 'lucide-react'

export default function LoginPage() {
  const supabase = createClient()
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in')

  return (
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Branding */}
      <div className="lg:w-1/2 bg-gradient-to-br from-green-600 to-green-800 p-8 lg:p-16 flex flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <Shield className="h-8 w-8" />
            <span className="text-2xl font-bold">Cidadão.AI</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Transparência e Inteligência Artificial
          </h1>
          
          <p className="text-lg lg:text-xl opacity-90 mb-12">
            Democratizando o acesso aos dados públicos brasileiros através de 
            agentes de IA especializados.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Análise Inteligente</h3>
                <p className="opacity-80">
                  17 agentes de IA especializados para investigar contratos, 
                  licitações e gastos públicos
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20">
          <p className="opacity-80 text-sm">
            Uma iniciativa de transparência pública inspirada na cultura brasileira
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {view === 'sign_in' ? 'Bem-vindo de volta!' : 'Criar conta'}
            </h2>
            <p className="text-gray-600">
              {view === 'sign_in' 
                ? 'Entre para acessar o painel de transparência' 
                : 'Cadastre-se para começar a investigar'}
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
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
              providers={['google', 'github']}
              redirectTo={`${window.location.origin}/auth/callback`}
              onlyThirdPartyProviders={false}
              magicLink={false}
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {view === 'sign_in' ? (
                <>
                  Não tem uma conta?{' '}
                  <button
                    onClick={() => setView('sign_up')}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Cadastre-se gratuitamente
                  </button>
                </>
              ) : (
                <>
                  Já tem uma conta?{' '}
                  <button
                    onClick={() => setView('sign_in')}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Entre aqui
                  </button>
                </>
              )}
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/pt" 
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}