'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-supabase-auth'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in')
  const [redirectTo, setRedirectTo] = useState<string>('')

  useEffect(() => {
    // Redirect authenticated users to app (authenticated system)
    if (isAuthenticated && !isLoading) {
      router.replace('/pt/app')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    // Callback redirects to /pt/app after successful login
    setRedirectTo(`${window.location.origin}/auth/callback?next=/pt/app`)
  }, [])

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If authenticated, will redirect (handled by useEffect above)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to system...</p>
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
          opacity: 0.03,
        }}
      />

      {/* Gradient overlay matching site design */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-green-50/50 via-transparent to-blue-50/50 dark:from-green-900/20 dark:to-blue-900/20" />

      <div className="w-full max-w-md relative z-10">
        {/* Welcome heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {view === 'sign_in' ? 'Welcome back!' : 'Create account'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {view === 'sign_in' ? 'Sign in to access the system' : 'Sign up to get started'}
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
                  password_label: 'Password',
                  button_label: 'Sign in',
                  loading_button_label: 'Signing in...',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: 'Already have an account? Sign in',
                  email_input_placeholder: 'your@email.com',
                  password_input_placeholder: 'Your password',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Password',
                  button_label: 'Create account',
                  loading_button_label: 'Creating account...',
                  social_provider_text: 'Sign up with {{provider}}',
                  link_text: "Don't have an account? Sign up",
                  email_input_placeholder: 'your@email.com',
                  password_input_placeholder: 'Create a secure password',
                  confirmation_text: 'Check your email to confirm',
                },
                forgotten_password: {
                  link_text: 'Forgot your password?',
                  email_label: 'Email',
                  button_label: 'Send instructions',
                  loading_button_label: 'Sending...',
                  confirmation_text: 'Check your email to reset password',
                  email_input_placeholder: 'your@email.com',
                },
              },
            }}
            providers={['google', 'github']}
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
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => setView('sign_up')}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium underline"
                >
                  Sign up for free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setView('sign_in')}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium underline"
                >
                  Sign in here
                </button>
              </>
            )}
          </p>
        </div>

        {/* Back Link */}
        <div className="mt-4 text-center">
          <Link
            href="/en"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center gap-1"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
