/**
 * Academy Diary Page
 *
 * Learning diary for daily reflections with:
 * - Mood tracking
 * - Learning summaries
 * - XP rewards
 *
 * Author: Anderson Henrique da Silva
 * Refactored: 2025-12-06 - Design System integration
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAcademyDemo } from '@/hooks/use-academy-demo'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Sparkles,
  Check,
  Lightbulb,
  Target,
  AlertCircle,
} from 'lucide-react'

const moods = [
  { id: 'great', emoji: '😄', label: 'Otimo!', color: 'green' },
  { id: 'good', emoji: '🙂', label: 'Bem', color: 'blue' },
  { id: 'neutral', emoji: '😐', label: 'Normal', color: 'yellow' },
  { id: 'struggling', emoji: '😓', label: 'Dificil', color: 'orange' },
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

      toast.success('Diário salvo!', '+10 XP por registrar seu aprendizado')

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Carregando diario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/pt/academy"
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h1 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                    Diário de Aprendizado
                  </h1>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Registre suas reflexões diárias
                </p>
              </div>
            </div>

            <Button onClick={() => setShowForm(true)} variant="primary" size="md">
              <Plus className="w-4 h-4" />
              Nova entrada
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats card */}
        <Card
          variant="filled"
          padding="md"
          className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200/50 dark:border-green-700/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {diaryEntries.length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Entradas registradas</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  +{diaryEntries.length * 10} XP total
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* New entry form */}
        {showForm && (
          <Card variant="elevated" padding="lg" className="mb-8 animate-fade-in">
            <CardHeader className="mb-6">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Como foi sua sessão de hoje?
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Mood selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Como você está se sentindo?
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {moods.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={() => setFormData({ ...formData, mood: mood.id })}
                      className={cn(
                        'p-4 rounded-xl border-2 text-center transition-all group',
                        formData.mood === mood.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      )}
                    >
                      <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">
                        {mood.emoji}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {mood.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* What I learned */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Lightbulb className="w-4 h-4 text-green-500" />O que você aprendeu hoje? *
                </label>
                <textarea
                  value={formData.whatLearned}
                  onChange={(e) => setFormData({ ...formData, whatLearned: e.target.value })}
                  placeholder="Descreva os principais conceitos ou habilidades que você desenvolveu..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none h-24 transition-all"
                  required
                />
              </div>

              {/* Where I struggled */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Onde você teve dificuldade?
                </label>
                <textarea
                  value={formData.whatStruggled}
                  onChange={(e) => setFormData({ ...formData, whatStruggled: e.target.value })}
                  placeholder="Descreva os desafios que enfrentou e as dúvidas que surgiram..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none h-24 transition-all"
                />
              </div>

              {/* Next steps */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  Quais são seus próximos passos?
                </label>
                <textarea
                  value={formData.nextSteps}
                  onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
                  placeholder="O que você planeja estudar ou fazer na próxima sessão..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none h-24 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={() => setShowForm(false)} variant="ghost" size="md">
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.mood || !formData.whatLearned || isSubmitting}
                  variant="primary"
                  size="md"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Salvar entrada (+10 XP)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Entries list */}
        <div className="space-y-4">
          {diaryEntries.length === 0 ? (
            <Card variant="outlined" padding="lg" className="text-center">
              <div className="py-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl">📝</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Nenhuma entrada ainda
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Comece a registrar seu aprendizado diário para ganhar XP e acompanhar seu
                  progresso!
                </p>
                <Button onClick={() => setShowForm(true)} variant="primary" size="lg">
                  <Plus className="w-5 h-5" />
                  Criar primeira entrada
                </Button>
              </div>
            </Card>
          ) : (
            diaryEntries.map((entry, index) => {
              const mood = moods.find((m) => m.id === entry.mood)
              return (
                <Card
                  key={entry.id}
                  variant="elevated"
                  padding="md"
                  className="group hover:shadow-lg transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 flex items-center justify-center text-2xl">
                        {mood?.emoji || '😐'}
                      </div>
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
                    <Badge variant="success" size="sm">
                      <Sparkles className="w-3 h-3" />
                      +10 XP
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {entry.whatLearned && (
                      <div className="p-4 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-200/50 dark:border-green-700/30">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                          <Lightbulb className="w-4 h-4" />O que aprendi
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">{entry.whatLearned}</p>
                      </div>
                    )}

                    {entry.whatStruggled && (
                      <div className="p-4 rounded-xl bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200/50 dark:border-orange-700/30">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-400 mb-2">
                          <AlertCircle className="w-4 h-4" />
                          Dificuldades
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">{entry.whatStruggled}</p>
                      </div>
                    )}

                    {entry.nextSteps && (
                      <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-700/30">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
                          <Target className="w-4 h-4" />
                          Proximos passos
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">{entry.nextSteps}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
