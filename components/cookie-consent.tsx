'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

interface CookieConsentProps {
  locale: 'pt' | 'en'
}

export function CookieConsent({ locale }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShowBanner(false)
  }

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    setShowBanner(false)
  }

  if (!showBanner) return null

  const texts = {
    pt: {
      message: 'Usamos cookies essenciais para garantir o funcionamento adequado do site. Ao continuar navegando, você concorda com nossa',
      policy: 'Política de Cookies',
      accept: 'Aceitar',
      reject: 'Apenas essenciais'
    },
    en: {
      message: 'We use essential cookies to ensure the site functions properly. By continuing to browse, you agree to our',
      policy: 'Cookie Policy',
      accept: 'Accept',
      reject: 'Essential only'
    }
  }

  const t = texts[locale]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">
            {t.message}{' '}
            <Link 
              href={`/${locale}/cookies`} 
              className="text-green-600 hover:underline font-medium"
            >
              {t.policy}
            </Link>
            .
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleReject}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {t.reject}
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              {t.accept}
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}