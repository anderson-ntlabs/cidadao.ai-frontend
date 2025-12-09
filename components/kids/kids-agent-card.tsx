/**
 * Kids Agent Card Component
 *
 * Displays Kids mode agents (Monteiro Lobato, Tarsila do Amaral)
 * with child-friendly design and large touch targets.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import { Agent } from '@/types/agent'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

interface KidsAgentCardProps {
  agent: Agent
  lang?: 'pt' | 'en'
  onSelect?: (agentId: string) => void
}

export function KidsAgentCard({ agent, lang = 'pt', onSelect }: KidsAgentCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(agent.id)
    }
  }

  // Determine card color based on agent
  const getCardColor = () => {
    switch (agent.id) {
      case 'monteiro-lobato':
        return 'border-kids-green hover:border-kids-green/80 hover:shadow-kids-green/20'
      case 'tarsila-amaral':
        return 'border-kids-coral hover:border-kids-coral/80 hover:shadow-kids-coral/20'
      default:
        return 'border-kids-turquoise hover:border-kids-turquoise/80'
    }
  }

  const getIconColor = () => {
    switch (agent.id) {
      case 'monteiro-lobato':
        return 'bg-kids-green text-white'
      case 'tarsila-amaral':
        return 'bg-kids-coral text-white'
      default:
        return 'bg-kids-turquoise text-white'
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`
        kids-card w-full p-6 text-left
        border-4 ${getCardColor()}
        hover:shadow-xl
        focus:outline-none focus:ring-4 focus:ring-primary/30
        transition-all duration-200
      `}
    >
      <div className="flex flex-col items-center text-center gap-4">
        {/* Agent Image */}
        <div className="relative">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg">
            <Image src={agent.image} alt={agent.name} fill className="object-cover" />
          </div>
          {/* Chat Icon Badge */}
          <div
            className={`
            absolute -bottom-1 -right-1
            h-10 w-10 rounded-full ${getIconColor()}
            flex items-center justify-center
            shadow-lg
          `}
          >
            <MessageCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Agent Info */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">{agent.name}</h3>
          <p className="text-sm font-medium text-muted-foreground">{agent.role[lang]}</p>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">{agent.description[lang]}</p>

        {/* CTA */}
        <div
          className={`
          mt-2 px-6 py-2 rounded-full font-bold
          ${getIconColor()}
          transition-transform hover:scale-105
        `}
        >
          {lang === 'pt' ? 'Conversar!' : 'Chat!'}
        </div>
      </div>
    </button>
  )
}

export default KidsAgentCard
