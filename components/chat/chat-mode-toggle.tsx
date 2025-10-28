'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ChatMode = 'cidadao' | 'maritaca'

interface ChatModeToggleProps {
  mode: ChatMode
  onModeChange: (mode: ChatMode) => void
  className?: string
}

export function ChatModeToggle({ mode, onModeChange, className }: ChatModeToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg p-1',
        'bg-gray-100 dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {/* Cidadão.AI Mode */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onModeChange('cidadao')}
        className={cn(
          'gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
          mode === 'cidadao'
            ? 'bg-white dark:bg-gray-700 shadow-sm text-green-600 dark:text-green-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        )}
      >
        <span className="text-base">🏛️</span>
        <span className="hidden sm:inline">Cidadão.AI</span>
        <span className="sm:hidden">Cidadão</span>
      </Button>

      {/* Maritaca Direct Mode */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onModeChange('maritaca')}
        className={cn(
          'gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
          mode === 'maritaca'
            ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600 dark:text-purple-400'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        )}
      >
        <span className="text-base">🦜</span>
        <span className="hidden sm:inline">Maritaca Direto</span>
        <span className="sm:hidden">Maritaca</span>
      </Button>
    </div>
  )
}

/**
 * Description component to explain the difference between modes
 */
export function ChatModeDescription({ mode }: { mode: ChatMode }) {
  if (mode === 'cidadao') {
    return (
      <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span className="text-sm">🏛️</span>
        <p>
          <span className="font-medium text-gray-900 dark:text-gray-100">Cidadão.AI</span> usa o
          modelo Sabiá aprimorado com sistema multi-agente. O Cidadão fala através da Maritaca,
          mas com inteligência aumentada por especialistas brasileiros.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
      <span className="text-sm">🦜</span>
      <p>
        <span className="font-medium text-gray-900 dark:text-gray-100">Maritaca Direto</span> acessa
        os modelos base da Maritaca.AI sem camadas adicionais. Ideal para testar os modelos
        gratuitamente.
      </p>
    </div>
  )
}
