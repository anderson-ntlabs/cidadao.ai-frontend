'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTooltipStore } from '@/store/tooltip-store'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: string | React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  trigger?: 'hover' | 'click' | 'focus'
  dismissible?: boolean
  showOnce?: boolean
  className?: string
  ariaLabel?: string
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  trigger = 'hover',
  dismissible = false,
  showOnce = false,
  className,
  ariaLabel,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const { hasSeenTooltip, markTooltipSeen } = useTooltipStore()

  const tooltipId = `tooltip-${content?.toString().slice(0, 20)}`
  const hasBeenSeen = hasSeenTooltip(tooltipId)

  useEffect(() => {
    if (!triggerRef.current) return

    const calculatePosition = () => {
      const rect = triggerRef.current!.getBoundingClientRect()
      const scrollX = window.scrollX
      const scrollY = window.scrollY
      const spacing = 8

      let x = 0
      let y = 0

      switch (position) {
        case 'top':
          x = rect.left + rect.width / 2 + scrollX
          y = rect.top + scrollY - spacing
          break
        case 'bottom':
          x = rect.left + rect.width / 2 + scrollX
          y = rect.bottom + scrollY + spacing
          break
        case 'left':
          x = rect.left + scrollX - spacing
          y = rect.top + rect.height / 2 + scrollY
          break
        case 'right':
          x = rect.right + scrollX + spacing
          y = rect.top + rect.height / 2 + scrollY
          break
      }

      setCoords({ x, y })
    }

    const showTooltip = () => {
      if (showOnce && hasBeenSeen) return

      timeoutRef.current = setTimeout(() => {
        calculatePosition()
        setIsVisible(true)
        if (showOnce) {
          markTooltipSeen(tooltipId)
        }
      }, delay)
    }

    const hideTooltip = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setIsVisible(false)
    }

    const element = triggerRef.current

    if (trigger === 'hover') {
      element.addEventListener('mouseenter', showTooltip)
      element.addEventListener('mouseleave', hideTooltip)
      element.addEventListener('focus', showTooltip)
      element.addEventListener('blur', hideTooltip)
    } else if (trigger === 'click') {
      element.addEventListener('click', () => {
        isVisible ? hideTooltip() : showTooltip()
      })
    } else if (trigger === 'focus') {
      element.addEventListener('focus', showTooltip)
      element.addEventListener('blur', hideTooltip)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (element) {
        element.removeEventListener('mouseenter', showTooltip)
        element.removeEventListener('mouseleave', hideTooltip)
        element.removeEventListener('focus', showTooltip)
        element.removeEventListener('blur', hideTooltip)
        element.removeEventListener('click', showTooltip)
      }
    }
  }, [position, delay, trigger, isVisible, showOnce, hasBeenSeen, tooltipId, markTooltipSeen])

  const handleDismiss = () => {
    setIsVisible(false)
    if (showOnce) {
      markTooltipSeen(tooltipId)
    }
  }

  if (showOnce && hasBeenSeen) {
    return <>{children}</>
  }

  return (
    <>
      <div ref={triggerRef} className="inline-block">
        {children}
      </div>

      {typeof window !== 'undefined' &&
        createPortal(
          <div
            className={cn(
              'tooltip-container fixed z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-md shadow-lg',
              'max-w-xs break-words transition-all duration-150',
              position === 'top' && '-translate-x-1/2 -translate-y-full',
              position === 'bottom' && '-translate-x-1/2',
              position === 'left' && '-translate-x-full -translate-y-1/2',
              position === 'right' && '-translate-y-1/2',
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none',
              className
            )}
            style={{
              left: `${coords.x}px`,
              top: `${coords.y}px`,
            }}
            role="tooltip"
            aria-label={ariaLabel}
          >
            {content}

            {dismissible && (
              <button
                onClick={handleDismiss}
                className="ml-2 text-gray-400 hover:text-white"
                aria-label="Fechar dica"
              >
                ✕
              </button>
            )}

            {/* Arrow */}
            <div
              className={cn(
                'absolute w-0 h-0 border-solid',
                position === 'top' &&
                  'bottom-[-8px] left-1/2 -translate-x-1/2 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-900',
                position === 'bottom' &&
                  'top-[-8px] left-1/2 -translate-x-1/2 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-gray-900',
                position === 'left' &&
                  'right-[-8px] top-1/2 -translate-y-1/2 border-t-[8px] border-b-[8px] border-l-[8px] border-t-transparent border-b-transparent border-l-gray-900',
                position === 'right' &&
                  'left-[-8px] top-1/2 -translate-y-1/2 border-t-[8px] border-b-[8px] border-r-[8px] border-t-transparent border-b-transparent border-r-gray-900'
              )}
            />
          </div>,
          document.body
        )}

      <style jsx>{`
        .tooltip-container {
          transform-origin: center;
        }

        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes tooltipFadeOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.9);
          }
        }
      `}</style>
    </>
  )
}

// Componente helper para tooltips estratégicos
interface StrategicTooltipProps extends Omit<TooltipProps, 'content' | 'showOnce'> {
  tooltipKey:
    | 'first-chat'
    | 'upload-hint'
    | 'agent-selector'
    | 'export-data'
    | 'chat-history'
    | 'send-message'
    | 'contrast-toggle'
  content?: string | React.ReactNode
}

export function StrategicTooltip({
  tooltipKey,
  content,
  children,
  ...props
}: StrategicTooltipProps) {
  const strategicContent = {
    'first-chat': 'Digite sua dúvida aqui! Por exemplo: "Como renovar meu RG?"',
    'upload-hint': 'Arraste documentos ou clique para enviar',
    'agent-selector': 'Cada agente tem uma especialidade diferente',
    'export-data': 'Baixe suas conversas em PDF ou JSON',
    'chat-history': 'Veja suas conversas anteriores',
    'send-message': 'Pressione Enter para enviar',
    'contrast-toggle': 'Modo de alto contraste',
  }

  return (
    <Tooltip content={content || strategicContent[tooltipKey]} showOnce dismissible {...props}>
      {children}
    </Tooltip>
  )
}
