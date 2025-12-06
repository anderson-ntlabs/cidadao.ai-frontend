'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAcademyDemo } from '@/hooks/use-academy-demo'
import { toast } from '@/hooks/use-toast'

const moods = [
  { id: 'great', emoji: '😄', label: 'Otimo!' },
  { id: 'good', emoji: '🙂', label: 'Bem' },
  { id: 'neutral', emoji: '😐', label: 'Normal' },
  { id: 'struggling', emoji: '😓', label: 'Dificil' },
] as const

export default function AcademyDiaryPage() {
  const { user, isLoading, diaryEntries, addDiaryEntry } = useAcademyDemo()

  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    mood: '' as 'great' | 'good' | 'neutral' | 'struggling' | '',
    whatLearned: '',
    whatStruggled: '',
    nextSteps: '',
    content: '',
  })

  const handleSubmit = async () => {
    if (!formData.mood || !formData.whatLearned) return

    setIsSubmitting(true)
    try {
      addDiaryEntry({
        content:
          formData.content ||
          `${formData.whatLearned}\n\n${formData.whatStruggled || ''}\n\n${formData.nextSteps || ''}`,
        mood: formData.mood as 'great' | 'good' | 'neutral' | 'struggling',
        whatLearned: formData.whatLearned,
        whatStruggled: formData.whatStruggled,
        nextSteps: formData.nextSteps,
        entryDate: new Date().toISOString().split('T')[0],
      })

      toast.success('Diario salvo!', '+10 XP por registrar seu aprendizado')

      setFormData({ mood: '', whatLearned: '', whatStruggled: '', nextSteps: '', content: '' })
      setShowForm(false)
    } catch (error) {
      console.error('Failed to save diary entry:', error)
      toast.error('Erro ao salvar', 'Tente novamente')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/pt/academy"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                  Diario de Aprendizado
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Registre suas reflexoes diarias
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nova entrada
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* New entry form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
              Como foi sua sessao de hoje?
            </h2>

            {/* Mood selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Como voce esta se sentindo?
              </label>
              <div className="flex gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setFormData({ ...formData, mood: mood.id })}
                    className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                      formData.mood === mood.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-3xl mb-1">{mood.emoji}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* What I learned */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                O que voce aprendeu hoje? *
              </label>
              <textarea
                value={formData.whatLearned}
                onChange={(e) => setFormData({ ...formData, whatLearned: e.target.value })}
                placeholder="Descreva os principais conceitos ou habilidades que voce desenvolveu..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none h-24"
                required
              />
            </div>

            {/* Where I struggled */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Onde voce teve dificuldade?
              </label>
              <textarea
                value={formData.whatStruggled}
                onChange={(e) => setFormData({ ...formData, whatStruggled: e.target.value })}
                placeholder="Descreva os desafios que enfrentou e as duvidas que surgiram..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none h-24"
              />
            </div>

            {/* Next steps */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quais sao seus proximos passos?
              </label>
              <textarea
                value={formData.nextSteps}
                onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
                placeholder="O que voce planeja estudar ou fazer na proxima sessao..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none h-24"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.mood || !formData.whatLearned || isSubmitting}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                  formData.mood && formData.whatLearned && !isSubmitting
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar entrada (+10 XP)'}
              </button>
            </div>
          </div>
        )}

        {/* Entries list */}
        <div className="space-y-4">
          {diaryEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Nenhuma entrada ainda
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Comece a registrar seu aprendizado diario para ganhar XP e acompanhar seu progresso!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium"
              >
                Criar primeira entrada
              </button>
            </div>
          ) : (
            diaryEntries.map((entry) => {
              const mood = moods.find((m) => m.id === entry.mood)
              return (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{mood?.emoji || '😐'}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {new Date(entry.entryDate).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(entry.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {entry.whatLearned && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                        O que aprendi
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">{entry.whatLearned}</p>
                    </div>
                  )}

                  {entry.whatStruggled && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
                        Dificuldades
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">{entry.whatStruggled}</p>
                    </div>
                  )}

                  {entry.nextSteps && (
                    <div>
                      <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                        Proximos passos
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">{entry.nextSteps}</p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
