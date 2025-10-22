'use client'

import { useState, useEffect } from 'react'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { cn } from '@/lib/utils'
import { Brain, Sparkles } from 'lucide-react'
import { agents } from '@/data/agents'

interface AgentThinkingIndicatorProps {
  currentAgentId?: string
  isThinking: boolean
  confidence?: number
  className?: string
}

/**
 * Floating indicator that shows which agent is currently processing
 * Inspired by the multi-agent orchestration system where Abaporu
 * delegates tasks to specialized agents
 */
export function AgentThinkingIndicator({
  currentAgentId = 'abaporu',
  isThinking,
  confidence = 0,
  className
}: AgentThinkingIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false)

  // Find the current agent
  const currentAgent = agents.find(a => a.id === currentAgentId) || agents[0]

  useEffect(() => {
    if (isThinking) {
      // Small delay before showing to avoid flashing
      const timer = setTimeout(() => setShowIndicator(true), 100)
      return () => clearTimeout(timer)
    } else {
      // Hide immediately when done
      setShowIndicator(false)
    }
  }, [isThinking])

  if (!showIndicator) return null

  return (
    <div
      className={cn(
        "fixed bottom-24 right-6 z-50",
        "transition-all duration-300 ease-out",
        showIndicator ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      {/* Main Card */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-green-200/50 dark:border-green-800/50 p-4 min-w-[280px]">
        {/* Agent Avatar + Info */}
        <div className="flex items-center gap-3 mb-3">
          {/* Animated Avatar Container */}
          <div className="relative">
            {/* Pulsing Ring */}
            <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 animate-pulse opacity-30" />

            {/* Agent Avatar */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-green-400/50 ring-offset-2 ring-offset-white dark:ring-offset-gray-900">
              <OptimizedImage
                src={currentAgent.image}
                alt={currentAgent.name}
                width={48}
                height={48}
                className="object-cover"
                fallback={
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                }
              />
            </div>
          </div>

          {/* Agent Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
              {currentAgent.name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {currentAgent.role.pt}
            </p>
          </div>

          {/* Sparkles Icon */}
          <Sparkles className="w-5 h-5 text-green-500 animate-pulse flex-shrink-0" />
        </div>

        {/* Thinking Animation */}
        <div className="space-y-2">
          {/* Progress Bar */}
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-green-400 rounded-full animate-shimmer"
              style={{
                width: confidence > 0 ? `${confidence * 100}%` : '100%',
                backgroundSize: '200% 100%',
              }}
            />
          </div>

          {/* Status Text */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Processando...
            </span>
            {confidence > 0 && (
              <span className="text-gray-500 dark:text-gray-500 font-medium">
                {Math.round(confidence * 100)}%
              </span>
            )}
          </div>
        </div>

        {/* Master Orchestrator Badge (if not Abaporu) */}
        {currentAgentId !== 'abaporu' && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <OptimizedImage
                src="/agents/abaporu.png"
                alt="Abaporu"
                width={16}
                height={16}
                className="w-4 h-4 rounded-full object-cover opacity-60"
              />
              <span>Orquestrado por Abaporu</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Compact version for inline use in chat messages
 */
export function AgentThinkingBadge({
  agentId,
  className
}: {
  agentId: string
  className?: string
}) {
  const agent = agents.find(a => a.id === agentId)
  if (!agent) return null

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
      "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",
      className
    )}>
      <OptimizedImage
        src={agent.image}
        alt={agent.name}
        width={20}
        height={20}
        className="w-5 h-5 rounded-full object-cover"
      />
      <span className="text-xs font-medium text-green-700 dark:text-green-300">
        {agent.name}
      </span>
    </div>
  )
}
