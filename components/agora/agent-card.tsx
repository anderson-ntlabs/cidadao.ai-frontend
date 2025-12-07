/**
 * Academy Agent Card Component
 *
 * Reusable agent card following the design system with:
 * - Agent avatar/emoji display
 * - Name and role
 * - Specialty description
 * - Interactive hover effects
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 */

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, MessageCircle, Sparkles } from 'lucide-react'

interface AgentCardProps {
  id: string
  name: string
  role: string
  emoji?: string
  avatar?: string
  specialty?: string
  description?: string
  status?: 'online' | 'offline' | 'busy'
  isNew?: boolean
  messageCount?: number
  className?: string
}

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  busy: 'bg-yellow-500',
}

export function AgentCard({
  id,
  name,
  role,
  emoji,
  avatar,
  specialty,
  description,
  status = 'online',
  isNew,
  messageCount,
  className,
}: AgentCardProps) {
  return (
    <Link href={`/pt/agora/chat?agent=${id}`}>
      <Card
        variant="outlined"
        padding="md"
        interactive
        className={cn(
          'group relative overflow-hidden',
          'hover:border-green-500/50 dark:hover:border-green-400/50',
          'hover:shadow-lg hover:shadow-green-500/5',
          className
        )}
      >
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 via-transparent to-blue-50/0 group-hover:from-green-50/50 group-hover:to-blue-50/50 dark:group-hover:from-green-900/10 dark:group-hover:to-blue-900/10 transition-all duration-300" />

        <div className="relative z-10">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={name}
                  width={56}
                  height={56}
                  className="rounded-2xl shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform duration-300 shadow-md">
                  {emoji || '🤖'}
                </div>
              )}

              {/* Status indicator */}
              <div
                className={cn(
                  'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800',
                  statusColors[status]
                )}
              />

              {/* New badge */}
              {isNew && (
                <div className="absolute -top-2 -right-2">
                  <Badge variant="warning" size="sm" className="px-1.5">
                    <Sparkles className="w-3 h-3" />
                  </Badge>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {name}
                </h4>
                {messageCount !== undefined && messageCount > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30">
                    <MessageCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      {messageCount}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>

              {(specialty || description) && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2">
                  {specialty || description}
                </p>
              )}
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 self-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
