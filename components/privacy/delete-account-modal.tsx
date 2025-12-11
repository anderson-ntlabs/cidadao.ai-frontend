/**
 * Delete Account Modal - Gamified LGPD Edition
 *
 * LGPD-compliant account deletion with gamified steps.
 * Makes the deletion process educational and intentional.
 *
 * "Conquistas invertidas" - achievements for understanding your rights
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-11
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  Trash2,
  Shield,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  FileCheck,
  Download,
  Trophy,
  Lock,
  Unlock,
  ArrowRight,
  BookOpen,
  Scale,
  Heart,
  Sparkles,
} from 'lucide-react'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
}

type Step =
  | 'intro'
  | 'understand'
  | 'export'
  | 'choose'
  | 'confirm'
  | 'processing'
  | 'success'
  | 'error'
type DeleteMode = 'soft' | 'hard'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
}

export function DeleteAccountModal({ isOpen, onClose, userName }: DeleteAccountModalProps) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('intro')
  const [mode, setMode] = useState<DeleteMode>('soft')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [hasExported, setHasExported] = useState(false)
  const [result, setResult] = useState<{
    scheduledDeletion?: string
    message?: string
  } | null>(null)

  // Gamification: Track unlocked steps
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'rights',
      title: 'Conhecedor de Direitos',
      description: 'Entendeu seus direitos LGPD',
      icon: <Scale className="w-5 h-5" />,
      unlocked: false,
    },
    {
      id: 'backup',
      title: 'Guardião de Memórias',
      description: 'Exportou seus dados',
      icon: <Download className="w-5 h-5" />,
      unlocked: false,
    },
    {
      id: 'decision',
      title: 'Decisão Consciente',
      description: 'Escolheu o tipo de exclusão',
      icon: <BookOpen className="w-5 h-5" />,
      unlocked: false,
    },
    {
      id: 'farewell',
      title: 'Até Logo, Amigo',
      description: 'Completou o processo',
      icon: <Heart className="w-5 h-5" />,
      unlocked: false,
    },
  ])

  const CONFIRMATION_TEXT = 'EXCLUIR'

  // Calculate progress
  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const progress = (unlockedCount / achievements.length) * 100

  const unlockAchievement = (id: string) => {
    setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, unlocked: true } : a)))
  }

  const handleClose = () => {
    setStep('intro')
    setMode('soft')
    setConfirmation('')
    setError(null)
    setResult(null)
    setHasExported(false)
    setAchievements((prev) => prev.map((a) => ({ ...a, unlocked: false })))
    onClose()
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/user/export-data')
      if (!response.ok) throw new Error('Erro ao exportar')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cidadao-ai-dados-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setHasExported(true)
      unlockAchievement('backup')
    } catch (err) {
      setError('Erro ao exportar dados. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDelete = async () => {
    if (confirmation !== CONFIRMATION_TEXT) {
      setError('Digite "EXCLUIR" para confirmar')
      return
    }

    setStep('processing')
    setError(null)

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          confirmation: 'DELETAR MINHA CONTA',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir conta')
      }

      unlockAchievement('farewell')
      setResult({
        scheduledDeletion: data.scheduledDeletion,
        message: data.message,
      })
      setStep('success')

      if (mode === 'hard') {
        setTimeout(async () => {
          await supabase.auth.signOut()
          router.push('/pt')
        }, 4000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setStep('error')
    }
  }

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-6 px-2">
      {['intro', 'understand', 'export', 'choose', 'confirm'].map((s, i) => {
        const stepOrder = ['intro', 'understand', 'export', 'choose', 'confirm']
        const currentIndex = stepOrder.indexOf(step)
        const isComplete = i < currentIndex
        const isCurrent = s === step

        return (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                isComplete && 'bg-tarsila-verde text-white',
                isCurrent && 'bg-tarsila-amarelo text-gray-900 ring-4 ring-tarsila-amarelo/30',
                !isComplete && !isCurrent && 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              )}
            >
              {isComplete ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            {i < 4 && (
              <div
                className={cn(
                  'w-8 h-1 mx-1',
                  i < currentIndex ? 'bg-tarsila-verde' : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )

  // Achievement badge component
  const AchievementBadge = ({ achievement }: { achievement: Achievement }) => (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-all',
        achievement.unlocked
          ? 'bg-tarsila-verde/10 border-tarsila-verde text-tarsila-verde'
          : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          achievement.unlocked ? 'bg-tarsila-verde text-white' : 'bg-gray-200 dark:bg-gray-700'
        )}
      >
        {achievement.unlocked ? achievement.icon : <Lock className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-sm', !achievement.unlocked && 'text-gray-500')}>
          {achievement.title}
        </p>
        <p className="text-xs text-gray-500 truncate">{achievement.description}</p>
      </div>
      {achievement.unlocked && <Sparkles className="w-4 h-4 text-tarsila-amarelo" />}
    </div>
  )

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <ModalContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Trash2 className="w-5 h-5" />
            Excluir Minha Conta
          </ModalTitle>
          <ModalDescription>LGPD Art. 18 - Jornada de exclusão consciente</ModalDescription>
        </ModalHeader>

        <div className="p-6 space-y-6">
          {/* Progress bar */}
          {!['processing', 'success', 'error'].includes(step) && (
            <>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-tarsila-verde to-tarsila-amarelo transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <StepIndicator />
            </>
          )}

          {/* Step 1: Intro */}
          {step === 'intro' && (
            <>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {userName ? `${userName}, ` : ''}Sentiremos sua falta! 💔
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Antes de ir, vamos garantir que você entenda seus direitos e faça backup dos
                    seus dados.
                  </p>
                </div>
              </div>

              {/* Achievements preview */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-tarsila-amarelo" />
                  Conquistas desta jornada
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {achievements.map((a) => (
                    <AchievementBadge key={a.id} achievement={a} />
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={() => setStep('understand')}>
                Iniciar Jornada
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {/* Step 2: Understand Rights */}
          {step === 'understand' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Scale className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Seus Direitos (LGPD Art. 18)
                    </h3>
                    <p className="text-sm text-gray-500">Passo 1 de 4</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl space-y-3">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    A Lei Geral de Proteção de Dados garante que você pode:
                  </p>
                  <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                    {[
                      '✓ Solicitar a exclusão de todos os seus dados',
                      '✓ Exportar seus dados em formato legível',
                      '✓ Revogar consentimentos a qualquer momento',
                      '✓ Saber exatamente quais dados são coletados',
                    ].map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                    O que será excluído:
                  </h4>
                  <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                    <li>• Perfil e informações pessoais</li>
                    <li>• XP, badges e progresso</li>
                    <li>• Sessões de estudo e diário</li>
                    <li>• Perfis Kids (se houver)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />O que será preservado:
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Certificados emitidos permanecerão verificáveis de forma anônima.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setStep('intro')}>
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    unlockAchievement('rights')
                    setStep('export')
                  }}
                >
                  Entendi meus direitos
                  <Unlock className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Export Data */}
          {step === 'export' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Download className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Exporte seus dados</h3>
                    <p className="text-sm text-gray-500">Passo 2 de 4</p>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400">
                  Baixe uma cópia de todos os seus dados antes de excluir. Isso inclui seu perfil,
                  progresso, conquistas e histórico.
                </p>

                <Button
                  variant={hasExported ? 'secondary' : 'primary'}
                  className="w-full"
                  onClick={handleExportData}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Exportando...
                    </>
                  ) : hasExported ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                      Dados exportados!
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Baixar meus dados (JSON)
                    </>
                  )}
                </Button>

                {hasExported && (
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                    <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Conquista desbloqueada: Guardião de Memórias!
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setStep('understand')}
                >
                  Voltar
                </Button>
                <Button className="flex-1" onClick={() => setStep('choose')}>
                  {hasExported ? 'Continuar' : 'Pular esta etapa'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}

          {/* Step 4: Choose Mode */}
          {step === 'choose' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Escolha o tipo de exclusão
                    </h3>
                    <p className="text-sm text-gray-500">Passo 3 de 4</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Soft delete option */}
                  <label
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                      mode === 'soft'
                        ? 'border-tarsila-verde bg-tarsila-verde/5'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    <input
                      type="radio"
                      name="deleteMode"
                      value="soft"
                      checked={mode === 'soft'}
                      onChange={() => setMode('soft')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-tarsila-verde" />
                        <span className="font-semibold">Exclusão Agendada</span>
                        <span className="text-xs px-2 py-0.5 bg-tarsila-verde/20 text-tarsila-verde rounded-full">
                          Recomendado
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Seus dados serão excluídos em <strong>30 dias</strong>. Você pode cancelar
                        fazendo login antes do prazo.
                      </p>
                    </div>
                  </label>

                  {/* Hard delete option */}
                  <label
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                      mode === 'hard'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    <input
                      type="radio"
                      name="deleteMode"
                      value="hard"
                      checked={mode === 'hard'}
                      onChange={() => setMode('hard')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          Exclusão Imediata
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Todos os seus dados serão excluídos <strong>instantaneamente</strong>. Esta
                        ação é irreversível.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setStep('export')}>
                  Voltar
                </Button>
                <Button
                  variant={mode === 'hard' ? 'destructive' : 'primary'}
                  className="flex-1"
                  onClick={() => {
                    unlockAchievement('decision')
                    setStep('confirm')
                  }}
                >
                  Confirmar escolha
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}

          {/* Step 5: Confirm */}
          {step === 'confirm' && (
            <>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Última etapa
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Para confirmar a {mode === 'hard' ? 'exclusão imediata' : 'exclusão agendada'},
                    digite:
                  </p>
                  <code className="inline-block mt-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg font-mono text-red-600 dark:text-red-400 text-lg">
                    {CONFIRMATION_TEXT}
                  </code>
                </div>
              </div>

              <Input
                value={confirmation}
                onChange={(e) => {
                  setConfirmation(e.target.value.toUpperCase())
                  setError(null)
                }}
                placeholder="Digite aqui"
                className={cn(
                  'text-center font-mono text-lg',
                  confirmation === CONFIRMATION_TEXT &&
                    'border-red-500 bg-red-50 dark:bg-red-900/20'
                )}
              />

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setStep('choose')}>
                  Voltar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={confirmation !== CONFIRMATION_TEXT}
                >
                  {mode === 'hard' ? 'Excluir Agora' : 'Agendar Exclusão'}
                </Button>
              </div>
            </>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <div className="text-center py-12 space-y-4">
              <Loader2 className="w-16 h-16 animate-spin text-red-500 mx-auto" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {mode === 'hard' ? 'Excluindo seus dados...' : 'Agendando exclusão...'}
              </p>
              <p className="text-sm text-gray-500">Isso pode levar alguns segundos</p>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {mode === 'hard' ? 'Conta excluída' : 'Exclusão agendada'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{result?.message}</p>
                {result?.scheduledDeletion && (
                  <p className="text-sm text-gray-500 mt-2">
                    Data de exclusão:{' '}
                    <strong>
                      {new Date(result.scheduledDeletion).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </strong>
                  </p>
                )}
              </div>

              {/* Final achievements */}
              <div className="p-4 rounded-xl bg-tarsila-amarelo/10 border border-tarsila-amarelo/30">
                <h4 className="font-medium text-tarsila-amarelo mb-3 flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Conquistas desbloqueadas
                </h4>
                <div className="flex justify-center gap-4">
                  {achievements
                    .filter((a) => a.unlocked)
                    .map((a) => (
                      <div key={a.id} className="text-center">
                        <div className="w-12 h-12 rounded-full bg-tarsila-verde text-white flex items-center justify-center mx-auto mb-1">
                          {a.icon}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{a.title}</p>
                      </div>
                    ))}
                </div>
              </div>

              {mode === 'hard' ? (
                <p className="text-sm text-gray-500">
                  Você será desconectado em instantes... Obrigado por fazer parte da Ágora! 💚
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">
                    Mudou de ideia? Faça login antes da data e sua conta será reativada.
                  </p>
                  <Button onClick={handleClose}>Entendi</Button>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ops! Algo deu errado
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
              <Button variant="secondary" onClick={() => setStep('confirm')}>
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  )
}
