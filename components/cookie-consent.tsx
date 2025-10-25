'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Cookie, GraduationCap, Shield } from 'lucide-react'

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

    // Dispatch event to notify analytics system
    window.dispatchEvent(new Event('consent-updated'))
  }

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    setShowBanner(false)

    // Dispatch event to notify analytics system
    window.dispatchEvent(new Event('consent-updated'))
  }

  if (!showBanner) return null

  const texts = {
    pt: {
      title: 'Cookies & Privacidade',
      message: 'Usamos cookies essenciais para funcionamento do site e coletamos dados anônimos de uso para pesquisa científica sobre transparência pública.',
      features: [
        '🍪 Cookies essenciais',
        '📊 Analytics anônimos (PostHog)',
        '🔬 Pesquisa acadêmica LGPD-compliant',
      ],
      policy: 'Política de Privacidade',
      cookies: 'Política de Cookies',
      accept: 'Aceitar Tudo',
      reject: 'Apenas Essenciais'
    },
    en: {
      title: 'Cookies & Privacy',
      message: 'We use essential cookies for site functionality and collect anonymous usage data for scientific research on public transparency.',
      features: [
        '🍪 Essential cookies',
        '📊 Anonymous analytics (PostHog)',
        '🔬 LGPD-compliant academic research',
      ],
      policy: 'Privacy Policy',
      cookies: 'Cookie Policy',
      accept: 'Accept All',
      reject: 'Essential Only'
    }
  }

  const t = texts[locale]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Cookie className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {t.title}
              </h3>
            </div>
            <button
              onClick={handleReject}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Message */}
          <p className="text-sm text-white/95 leading-relaxed">
            {t.message}
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-white/90">
            {t.features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm"
              >
                {feature}
              </div>
            ))}
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-4 text-xs text-white/80">
            <Link
              href={`/${locale}/privacy`}
              className="hover:text-white hover:underline flex items-center gap-1"
            >
              <Shield className="h-3 w-3" />
              {t.policy}
            </Link>
            <Link
              href={`/${locale}/cookies`}
              className="hover:text-white hover:underline flex items-center gap-1"
            >
              <Cookie className="h-3 w-3" />
              {t.cookies}
            </Link>
            <Link
              href={`/${locale}/sobre`}
              className="hover:text-white hover:underline flex items-center gap-1"
            >
              <GraduationCap className="h-3 w-3" />
              {locale === 'pt' ? 'Pesquisa Científica' : 'Scientific Research'}
            </Link>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleAccept}
              className="flex-1 px-6 py-3 bg-white text-green-600 hover:bg-green-50 font-bold rounded-lg shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {t.accept}
            </button>
            <button
              onClick={handleReject}
              className="flex-1 px-6 py-3 text-white border-2 border-white/30 hover:bg-white/10 font-semibold rounded-lg transition-colors"
            >
              {t.reject}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}