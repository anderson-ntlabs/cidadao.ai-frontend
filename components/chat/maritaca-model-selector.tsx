'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Zap, Brain } from 'lucide-react'
import { type MaritacaModel } from '@/lib/chat'
import { cn } from '@/lib/utils'

interface MaritacaModelSelectorProps {
  selectedModel: MaritacaModel
  onModelChange: (model: MaritacaModel) => void
  className?: string
}

// Model configurations
const MODEL_INFO = {
  'sabiazinho-3': {
    name: 'Sabiazinho-3',
    description: 'Modelo otimizado para velocidade e eficiência',
    icon: '🐦',
    contextLength: 8192,
    costLevel: 1,
    speed: 'fast',
    quality: 'good',
  },
  'sabia-3': {
    name: 'Sabiá-3',
    description: 'Modelo completo com máxima qualidade',
    icon: '🦜',
    contextLength: 32768,
    costLevel: 2,
    speed: 'medium',
    quality: 'excellent',
  },
} as const

function getModelInfo(model: MaritacaModel) {
  return MODEL_INFO[model] || MODEL_INFO['sabiazinho-3']
}

export function MaritacaModelSelector({
  selectedModel,
  onModelChange,
  className,
}: MaritacaModelSelectorProps) {
  const currentModelInfo = getModelInfo(selectedModel)
  const sabia3Info = getModelInfo('sabia-3')
  const sabiazinho3Info = getModelInfo('sabiazinho-3')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            'gap-2 text-xs font-medium',
            'border border-gray-200 dark:border-gray-700',
            'hover:border-green-500 dark:hover:border-green-500',
            'transition-all',
            className
          )}
        >
          <span className="text-base">{currentModelInfo.icon}</span>
          <span className="hidden sm:inline">{currentModelInfo.name}</span>
          <span className="sm:hidden">
            {selectedModel === 'sabia-3' ? 'Sabiá-3' : 'Sabiazinho-3'}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400 font-normal">
          Selecione o modelo Maritaca.AI
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Sabiazinho-3 - Optimized */}
        <DropdownMenuItem
          onClick={() => onModelChange('sabiazinho-3')}
          className={cn(
            'cursor-pointer py-3 px-3',
            selectedModel === 'sabiazinho-3' &&
              'bg-green-50 dark:bg-green-900/20 border-l-2 border-green-500'
          )}
        >
          <div className="flex items-start gap-3 w-full">
            <div className="flex-shrink-0 mt-0.5">
              <Zap className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{sabiazinho3Info.icon}</span>
                <span className="font-medium text-sm">Sabiazinho-3</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 font-medium">
                  Rápido
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {sabiazinho3Info.description}
              </p>
              <div className="flex gap-2 mt-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  Velocidade: Alta
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  Qualidade: Boa
                </span>
              </div>
            </div>
            {selectedModel === 'sabiazinho-3' && (
              <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
            )}
          </div>
        </DropdownMenuItem>

        {/* Sabiá-3 - Standard */}
        <DropdownMenuItem
          onClick={() => onModelChange('sabia-3')}
          className={cn(
            'cursor-pointer py-3 px-3',
            selectedModel === 'sabia-3' &&
              'bg-green-50 dark:bg-green-900/20 border-l-2 border-green-500'
          )}
        >
          <div className="flex items-start gap-3 w-full">
            <div className="flex-shrink-0 mt-0.5">
              <Brain className="h-5 w-5 text-purple-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{sabia3Info.icon}</span>
                <span className="font-medium text-sm">Sabiá-3</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
                  Avançado
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {sabia3Info.description}
              </p>
              <div className="flex gap-2 mt-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  Velocidade: Normal
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  Qualidade: Alta
                </span>
              </div>
            </div>
            {selectedModel === 'sabia-3' && (
              <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
            )}
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-3 py-2 text-[10px] text-gray-500 dark:text-gray-400">
          <p className="flex items-center gap-1">
            <span className="text-green-500">✓</span>
            Uso gratuito para testes
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
