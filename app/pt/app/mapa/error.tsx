'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, Home, Table } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { logger } from '@/lib/utils/logger'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function MapError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    logger.error(error, {
      component: 'MapPage',
      digest: error.digest,
      errorBoundary: true
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-md w-full">
        {/* Error Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
            Erro na Visualização do Mapa
          </h1>

          {/* Description */}
          <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
            Não foi possível renderizar o mapa de transparência. Você pode tentar a visualização em tabela como alternativa.
          </p>

          {/* Error Details (Development only) */}
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

          {/* Suggestions */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Possíveis causas:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Falha ao carregar dados do GeoJSON</li>
              <li>• Problema na API de transparência</li>
              <li>• Incompatibilidade com o navegador</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Try Again */}
            <Button
              onClick={reset}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>

            {/* Table View Fallback */}
            <Button
              onClick={() => {
                // Switch to table view if available
                if (typeof window !== 'undefined') {
                  const url = new URL(window.location.href)
                  url.searchParams.set('view', 'table')
                  window.location.href = url.toString()
                }
              }}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              <Table className="w-4 h-4 mr-2" />
              Ver como Tabela
            </Button>

            {/* Go Home */}
            <Link href="/pt/app" className="block">
              <Button variant="ghost" className="w-full" size="lg">
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Erro persiste em múltiplos navegadores?{' '}
          <a
            href="https://github.com/anderson-ufrj/cidadao.ai-frontend/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 dark:text-green-400 hover:underline"
          >
            Nos avise
          </a>
        </p>
      </div>
    </div>
  )
}
