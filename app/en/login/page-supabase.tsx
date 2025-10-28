'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { Briefcase, Shield, Users, ChartBar, FileSearch, Brain } from 'lucide-react'
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
    <main className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Branding */}
      <div className="lg:w-1/2 bg-gradient-to-br from-green-600 to-green-800 p-8 lg:p-16 flex flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <Shield className="h-8 w-8" />
            <span className="text-2xl font-bold">Cidadão.AI</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Transparency and Artificial Intelligence
          </h1>

          <p className="text-lg lg:text-xl opacity-90 mb-12">
            Democratizing access to Brazilian public data through
            specialized AI agents.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">17 AI Agents</h3>
                <p className="opacity-80 text-sm">
                  Virtual specialists inspired by Brazilian heroes
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileSearch className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Deep Investigation</h3>
                <p className="opacity-80 text-sm">
                  Analysis of contracts, bids, and public spending
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <ChartBar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Clear Visualizations</h3>
                <p className="opacity-80 text-sm">
                  Interactive dashboards with real-time insights
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20">
          <p className="opacity-80 text-sm">
            A public transparency initiative inspired by Brazilian culture
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {view === 'sign_in' ? 'Welcome back!' : 'Create account'}
            </h2>
            <p className="text-gray-600">
              {view === 'sign_in'
                ? 'Sign in to access the transparency dashboard'
                : 'Sign up to start investigating'}
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
              providers={['google', 'github', 'spotify']}
              redirectTo={redirectTo}
              onlyThirdPartyProviders={false}
              magicLink={false}
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {view === 'sign_in' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => setView('sign_up')}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Sign up for free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setView('sign_in')}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/en"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
