'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAcademyAuth } from '@/hooks/use-academy-auth'
import { LgpdConsentModal } from '@/components/academy/lgpd-consent-modal'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

type Track = 'backend' | 'frontend' | 'ia' | 'devops'

const tracks: { id: Track; name: string; description: string; icon: string }[] = [
  {
    id: 'backend',
    name: 'Backend',
    description: 'Python, FastAPI, bancos de dados, APIs',
    icon: '⚙️',
  },
  {
    id: 'frontend',
    name: 'Frontend',
    description: 'Next.js, React, TypeScript, Tailwind',
    icon: '🎨',
  },
  {
    id: 'ia',
    name: 'Inteligencia Artificial',
    description: 'LangChain, agentes, LLMs, ML',
    icon: '🤖',
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'Docker, CI/CD, monitoramento, deploy',
    icon: '🚀',
  },
]

export default function AcademyOnboardingPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, refreshProfile } = useAcademyAuth()
  const supabase = createClient()

  const [showLgpd, setShowLgpd] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    matricula: '',
    curso: 'Ciencia da Computacao',
    periodo: 1,
    mainTrack: 'backend' as Track,
    githubUsername: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/pt/academy/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (user) {
      if (user.hasAcceptedLgpd) {
        // If LGPD already accepted, check if profile is complete
        if (user.matricula) {
          router.replace('/pt/academy')
        } else {
          setStep(2) // Go to profile completion
        }
      } else {
        setShowLgpd(true)
      }
    }
  }, [user, router])

  const handleLgpdClose = () => {
    setShowLgpd(false)
    setStep(2) // Move to profile step
  }

  const handleSubmitProfile = async () => {
    if (!user) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // First, check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('academy_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (profile doesn't exist)
        throw new Error(`Erro ao verificar perfil: ${checkError.message}`)
      }

      let saveError = null

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('academy_profiles')
          .update({
            matricula: formData.matricula,
            curso: formData.curso,
            periodo: formData.periodo,
            main_track: formData.mainTrack,
            github_username: formData.githubUsername || null,
            program_status: 'in_progress',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)

        saveError = error
      } else {
        // Insert new profile
        const { error } = await supabase.from('academy_profiles').insert({
          user_id: user.id,
          full_name: user.name,
          email: user.email,
          avatar_url: user.avatar,
          matricula: formData.matricula,
          curso: formData.curso,
          periodo: formData.periodo,
          main_track: formData.mainTrack,
          github_username: formData.githubUsername || null,
          program_status: 'in_progress',
          program_start_date: new Date().toISOString().split('T')[0],
        })

        saveError = error
      }

      if (saveError) {
        throw new Error(`Erro ao salvar perfil: ${saveError.message}`)
      }

      await refreshProfile()
      toast.success('Perfil salvo!', 'Bem-vindo(a) a Academy!')
      router.push('/pt/academy')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Failed to update profile:', error)
      setSubmitError(errorMessage)
      toast.error('Erro ao salvar', errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* LGPD Modal */}
      <LgpdConsentModal isOpen={showLgpd} onClose={handleLgpdClose} />

      {/* Profile Completion Form */}
      {step === 2 && (
        <div className="w-full max-w-2xl">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div className="w-16 h-1 bg-green-600 rounded"></div>
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
              2
            </div>
          </div>

          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Complete seu Perfil
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Precisamos de algumas informacoes para personalizar sua experiencia
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmitProfile()
              }}
              className="space-y-6"
            >
              {/* Row 1: Matricula + Periodo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matricula */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Matricula IFSULDEMINAS
                  </label>
                  <input
                    type="text"
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                    placeholder="Ex: 2024001234"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Periodo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Periodo atual
                  </label>
                  <select
                    value={formData.periodo}
                    onChange={(e) =>
                      setFormData({ ...formData, periodo: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                      <option key={p} value={p}>
                        {p}o periodo
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Curso - Apenas Ciência da Computação (Campus Muzambinho) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Curso
                </label>
                <div className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  Ciencia da Computacao - Campus Muzambinho
                </div>
              </div>

              {/* Track Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Escolha sua trilha principal
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {tracks.map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, mainTrack: track.id })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.mainTrack === track.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="text-2xl mb-2">{track.icon}</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {track.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {track.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* GitHub (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GitHub Username <span className="text-gray-400">(opcional)</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                    github.com/
                  </span>
                  <input
                    type="text"
                    value={formData.githubUsername}
                    onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                    placeholder="seu-username"
                    className="flex-1 px-4 py-3 rounded-r-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        Erro ao salvar perfil
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-300 mt-1">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !formData.matricula}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                  isSubmitting || !formData.matricula
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    Salvando...
                  </span>
                ) : (
                  'Comecar minha jornada'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
