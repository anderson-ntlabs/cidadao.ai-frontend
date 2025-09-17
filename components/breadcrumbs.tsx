'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 py-3">
      {/* Home */}
      <Link 
        href="/pt" 
        className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
        aria-label="Início"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-3 h-3 text-gray-400" />
          {item.href && index < items.length - 1 ? (
            <Link 
              href={item.href} 
              className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}