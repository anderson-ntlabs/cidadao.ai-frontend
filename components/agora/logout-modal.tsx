'use client'

import { useState } from 'react'
import { LogOut, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Logout Confirmation Modal
 *
 * Asks user to confirm logout action.
 * Optionally shows active session warning.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-08
 */

interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  hasActiveSession?: boolean
  sessionDuration?: number // in minutes
}

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  hasActiveSession = false,
  sessionDuration = 0,
}: LogoutModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 id="logout-title" className="text-lg font-bold text-gray-900 dark:text-white">
              Sair da Ágora
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Tem certeza que deseja sair? Seu progresso está salvo automaticamente.
          </p>

          {/* Active session warning */}
          {hasActiveSession && sessionDuration > 0 && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200 text-sm">
                  Sessão de estudo ativa
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                  Você tem uma sessão de {sessionDuration} minutos em andamento. Ao sair, a sessão
                  será finalizada e o XP será calculado.
                </p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>Ao sair:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Sua sessão atual será encerrada</li>
              <li>Seu progresso e XP estão salvos</li>
              <li>Você precisará fazer login novamente</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="flex-1 bg-red-600 hover:bg-red-700"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saindo...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sair
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
