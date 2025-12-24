/**
 * Research Notes Card - Lazy Loaded Version
 *
 * Lightweight wrapper that only loads react-pdf when user clicks.
 * Reduces initial bundle by ~200KB+ by deferring PDF library.
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-24
 */

'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'

interface ResearchNotesCardLazyProps {
  locale?: 'pt' | 'en'
}

const translations = {
  pt: { title: 'Notas', loading: 'Carregando...' },
  en: { title: 'Notes', loading: 'Loading...' },
}

// Only load the full PDF component when user clicks
const ResearchNotesCardFull = dynamic(
  () => import('./research-notes-card').then((mod) => ({ default: mod.ResearchNotesCard })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-700 dark:text-gray-300">Loading PDF viewer...</span>
        </div>
      </div>
    ),
  }
)

export function ResearchNotesCardLazy({ locale = 'pt' }: ResearchNotesCardLazyProps) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const t = translations[locale]

  const handleClick = useCallback(() => {
    setShouldLoad(true)
  }, [])

  // Before user clicks, show lightweight button
  if (!shouldLoad) {
    return (
      <button
        onClick={handleClick}
        className="block w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-center group"
      >
        <div className="text-2xl mb-2">📝</div>
        <h4 className="text-sm font-bold flex items-center justify-center gap-1">{t.title}</h4>
      </button>
    )
  }

  // After click, load the full component with PDF viewer (auto-opens modal)
  return <ResearchNotesCardFull locale={locale} autoOpen />
}
