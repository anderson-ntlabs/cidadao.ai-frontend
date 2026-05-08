'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, Home, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { logger } from '@/lib/utils/logger'

/**
 * Agora Error Boundary
 *
 * Copied from app/pt/app/chat/error.tsx and adapted for Agora routes.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-07
 */

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AgoraError({ error, reset }: ErrorProps) {
  useEffect(() => {
    logger.error(error, {
      component: 'AgoraPage',
      digest: error.digest,
      errorBoundary: true,
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
            Ops! Algo deu errado
          </h1>

          <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
            Encontramos um problema inesperado na Agora. Seu progresso esta salvo.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs font-mono text-slate-500 dark:text-slate-500 mt-2">
                  ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={reset}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>

            <Link href="/pt/agora" className="block">
              <Button variant="secondary" className="w-full" size="lg">
                <GraduationCap className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>

            <Link href="/pt" className="block">
              <Button variant="ghost" className="w-full" size="lg">
                <Home className="w-4 h-4 mr-2" />
                Pagina Inicial
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Se o problema persistir,{' '}
          <a
            href="https://github.com/anderson-ntlabs/cidadao.ai-frontend/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 dark:text-green-400 hover:underline"
          >
            reporte o issue
          </a>
        </p>
      </div>
    </div>
  )
}
