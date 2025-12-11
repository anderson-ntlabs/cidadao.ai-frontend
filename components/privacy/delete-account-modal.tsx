/**
 * Delete Account Modal
 *
 * LGPD-compliant account deletion with confirmation.
 * Supports soft delete (30 day grace) and hard delete (immediate).
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-11
 */

'use client'

import { useState } from 'react'
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
} from 'lucide-react'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
  /** If true, shows option for immediate deletion (for testing) */
  allowHardDelete?: boolean
}

type DeleteMode = 'soft' | 'hard'
type Step = 'warning' | 'confirm' | 'processing' | 'success' | 'error'

export function DeleteAccountModal({
  isOpen,
  onClose,
  userName,
  allowHardDelete = false,
}: DeleteAccountModalProps) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('warning')
  const [mode, setMode] = useState<DeleteMode>('soft')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    scheduledDeletion?: string
    message?: string
  } | null>(null)

  const CONFIRMATION_TEXT = 'DELETAR MINHA CONTA'

  const handleClose = () => {
    // Reset state
    setStep('warning')
    setMode('soft')
    setConfirmation('')
    setError(null)
    setResult(null)
    onClose()
  }

  const handleDelete = async () => {
    if (confirmation !== CONFIRMATION_TEXT) {
      setError('Texto de confirmação incorreto')
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
          confirmation: CONFIRMATION_TEXT,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir conta')
      }

      setResult({
        scheduledDeletion: data.scheduledDeletion,
        message: data.message,
      })
      setStep('success')

      // If hard delete, sign out after 3 seconds
      if (mode === 'hard') {
        setTimeout(async () => {
          await supabase.auth.signOut()
          router.push('/pt')
        }, 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setStep('error')
    }
  }

  const handleExportData = async () => {
    // TODO: Implement data export (LGPD Art. 18 - Right to data portability)
    alert('Exportação de dados será implementada em breve!')
  }

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <ModalContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Trash2 className="w-5 h-5" />
            Excluir Minha Conta
          </ModalTitle>
          <ModalDescription>LGPD Art. 18 - Direito à eliminação de dados pessoais</ModalDescription>
        </ModalHeader>

        <div className="p-6 space-y-6">
          {/* Step: Warning */}
          {step === 'warning' && (
            <>
              {/* Warning Banner */}
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                      Atenção: Esta ação é irreversível
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      Ao excluir sua conta, todos os seus dados serão removidos permanentemente,
                      incluindo progresso, XP, badges e histórico de aprendizado.
                    </p>
                  </div>
                </div>
              </div>

              {/* What will be deleted */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Dados que serão excluídos:
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {[
                    'Perfil e informações pessoais',
                    'Progresso em trilhas de aprendizado',
                    'XP, badges e conquistas',
                    'Sessões de estudo e diário',
                    'Perfis Kids e dados de crianças',
                    'Histórico de conversas com agentes',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* What will be preserved */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  Dados preservados (anonimizados):
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-green-500" />
                    Certificados emitidos permanecem verificáveis
                  </li>
                </ul>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Os certificados são armazenados de forma anônima para permitir verificação de
                  autenticidade mesmo após a exclusão da conta.
                </p>
              </div>

              {/* Export data option */}
              <Button
                variant="secondary"
                className="w-full justify-start gap-2"
                onClick={handleExportData}
              >
                <Download className="w-4 h-4" />
                Exportar meus dados antes de excluir
              </Button>

              {/* Mode selection */}
              {allowHardDelete && (
                <div className="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="font-medium text-gray-900 dark:text-white">Tipo de exclusão:</h4>
                  <div className="space-y-2">
                    <label
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                        mode === 'soft'
                          ? 'border-tarsila-verde bg-tarsila-verde/5'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                      <div>
                        <div className="flex items-center gap-2 font-medium">
                          <Clock className="w-4 h-4" />
                          Exclusão agendada (30 dias)
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Você pode cancelar fazendo login antes do prazo.
                        </p>
                      </div>
                    </label>

                    <label
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                        mode === 'hard'
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                      <div>
                        <div className="flex items-center gap-2 font-medium text-red-600 dark:text-red-400">
                          <Trash2 className="w-4 h-4" />
                          Exclusão imediata
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Dados excluídos instantaneamente. Sem possibilidade de recuperação.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => setStep('confirm')}>
                  Continuar
                </Button>
              </div>
            </>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Confirme a exclusão
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {userName ? `${userName}, para` : 'Para'} confirmar, digite:{' '}
                    <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded font-mono text-red-600 dark:text-red-400">
                      {CONFIRMATION_TEXT}
                    </code>
                  </p>
                </div>
              </div>

              <Input
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="Digite o texto de confirmação"
                className={cn(
                  'text-center font-mono',
                  confirmation === CONFIRMATION_TEXT && 'border-red-500'
                )}
              />

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setStep('warning')}>
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

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className="text-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto" />
              <p className="text-gray-600 dark:text-gray-400">
                {mode === 'hard' ? 'Excluindo seus dados...' : 'Agendando exclusão...'}
              </p>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mode === 'hard' ? 'Conta excluída' : 'Exclusão agendada'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{result?.message}</p>
                {result?.scheduledDeletion && (
                  <p className="text-xs text-gray-500 mt-2">
                    Data de exclusão:{' '}
                    {new Date(result.scheduledDeletion).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
              {mode === 'hard' && (
                <p className="text-sm text-gray-500">Você será desconectado em instantes...</p>
              )}
              {mode === 'soft' && (
                <Button onClick={handleClose} className="mt-4">
                  Entendi
                </Button>
              )}
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Erro ao excluir conta
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
              <Button variant="secondary" onClick={() => setStep('warning')}>
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  )
}
