'use client'

import { ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './card'
import { Button } from './button'
import { Download, Maximize2, MoreVertical, RefreshCw } from 'lucide-react'
import { Dropdown } from './dropdown'

interface ChartCardProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  onRefresh?: () => void
  onFullscreen?: () => void
  onExport?: () => void
  actions?: Array<{
    label: string
    icon?: ReactNode
    onClick: () => void
  }>
  isLoading?: boolean
  error?: string | null
}

export function ChartCard({
  title,
  description,
  children,
  className,
  onRefresh,
  onFullscreen,
  onExport,
  actions = [],
  isLoading = false,
  error = null
}: ChartCardProps) {
  const defaultActions = [
    ...(onRefresh ? [{ label: 'Atualizar', icon: <RefreshCw className="w-4 h-4" />, onClick: onRefresh }] : []),
    ...(onFullscreen ? [{ label: 'Tela cheia', icon: <Maximize2 className="w-4 h-4" />, onClick: onFullscreen }] : []),
    ...(onExport ? [{ label: 'Exportar', icon: <Download className="w-4 h-4" />, onClick: onExport }] : []),
    ...actions
  ]

  return (
    <Card className={`h-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm mt-1">{description}</CardDescription>
          )}
        </div>
        {defaultActions.length > 0 && (
          <Dropdown
            trigger={
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
          >
            {defaultActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </Dropdown>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-red-500">
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}