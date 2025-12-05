'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAcademyAuth, ALLOWED_DOMAIN } from '@/hooks/use-academy-auth'

export default function AcademyLoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, loginWithGoogle, user } = useAcademyAuth()

  useEffect(() => {
    // Redirect authenticated users to academy dashboard
    if (isAuthenticated && !isLoading) {
      if (user?.hasAcceptedLgpd) {
        router.replace('/pt/academy')
      } else {
        router.replace('/pt/academy/onboarding')
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verificando autenticacao...</p>
        </div>
      </div>
    )
  }

  // If authenticated, show redirect message
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Redirecionando para a Academy...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background pattern */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/operarios.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.02,
        }}
      />

      {/* Content */}
      <div className="w-full max-w-lg relative z-10">
        {/* Header with logos */}
        <div className="text-center mb-8">
          {/* Partner logos */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="w-16 h-16 relative">
              <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                NT
              </div>
            </div>
            <div className="text-gray-300 dark:text-gray-600 text-2xl font-light">+</div>
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex items-center justify-center p-2">
              <span className="text-green-700 dark:text-green-400 font-bold text-xs text-center leading-tight">
                IFSUL
                <br />
                DEMINAS
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Academia Cidadao.AI
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Programa de Estagio em Inteligencia Artificial
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
          {/* Welcome message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10 text-green-600 dark:text-green-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Bem-vindo(a), Estagiario(a)!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Faca login com sua conta institucional do IFSULDEMINAS
            </p>
          </div>

          {/* Domain restriction notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Acesso restrito
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Apenas emails <strong>@{ALLOWED_DOMAIN}</strong> podem acessar a Academy.
                </p>
              </div>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group shadow-sm hover:shadow-md"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-400">
              Entrar com Google (@{ALLOWED_DOMAIN})
            </span>
          </button>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
              O que voce vai encontrar:
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🤖', text: '16 agentes IA' },
                { icon: '🎮', text: 'Gamificacao' },
                { icon: '📚', text: 'Videos e artigos' },
                { icon: '📜', text: 'Certificado' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Partnership info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Parceria oficial entre Neural Thinker AI Engineering e<br />
            IFSULDEMINAS - Laboratorio LabSoft
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Coordenacao: Profa. Dra. Aracele Garcia de Oliveira Fassbinder
          </p>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href="/pt/login"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Voltar para login principal
          </Link>
        </div>
      </div>
    </main>
  )
}
