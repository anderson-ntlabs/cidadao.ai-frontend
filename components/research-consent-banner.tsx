/**
 * Research Consent Banner
 *
 * Asks users for explicit consent to collect anonymized usage data
 * for academic research purposes (LGPD compliant)
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GraduationCap, X } from 'lucide-react'
import { Button } from './ui/button'

interface ResearchConsentBannerProps {
  locale: 'pt' | 'en'
}

export function ResearchConsentBanner({ locale }: ResearchConsentBannerProps) {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Only show if cookie consent is accepted but research consent not decided
    const cookieConsent = localStorage.getItem('cookie-consent')
    const researchConsent = localStorage.getItem('research-consent')

    if (cookieConsent === 'accepted' && !researchConsent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('research-consent', 'accepted')
    setShowBanner(false)

    // Dispatch event to notify analytics system
    window.dispatchEvent(new Event('consent-updated'))
  }

  const handleReject = () => {
    localStorage.setItem('research-consent', 'rejected')
    setShowBanner(false)

    // Dispatch event to notify analytics system
    window.dispatchEvent(new Event('consent-updated'))
  }

  if (!showBanner) return null

  const texts = {
    pt: {
      title: 'Contribua com a pesquisa científica',
      message: 'Coletamos dados anônimos de uso para pesquisa acadêmica sobre usabilidade de sistemas de transparência pública. Seus dados serão completamente anonimizados e usados apenas para fins científicos.',
      learn_more: 'Saiba mais',
      privacy: 'Política de Privacidade',
      accept: 'Aceitar e Contribuir',
      reject: 'Não, obrigado',
    },
    en: {
      title: 'Contribute to scientific research',
      message: 'We collect anonymous usage data for academic research on public transparency systems usability. Your data will be completely anonymized and used only for scientific purposes.',
      learn_more: 'Learn more',
      privacy: 'Privacy Policy',
      accept: 'Accept & Contribute',
      reject: 'No, thanks',
    },
  }

  const t = texts[locale]

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 mx-4 md:mx-auto md:max-w-2xl">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl border border-blue-400/50 overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {t.title}
              </h3>
            </div>

            <button
              onClick={handleReject}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Message */}
          <p className="text-sm text-white/90 mb-4 leading-relaxed">
            {t.message}
          </p>

          {/* Links */}
          <div className="flex flex-wrap gap-4 text-xs text-white/70 mb-4">
            <Link
              href={`/${locale}/privacy`}
              className="hover:text-white hover:underline flex items-center gap-1"
            >
              {t.privacy}
            </Link>
            <Link
              href={`/${locale}/sobre`}
              className="hover:text-white hover:underline flex items-center gap-1"
            >
              {t.learn_more}
            </Link>
          </div>

          {/* Benefits */}
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <p className="text-xs text-white/80">
              {locale === 'pt' ? (
                <>
                  ✅ Dados 100% anônimos •
                  🔬 Uso apenas científico •
                  📊 Ajuda a melhorar a plataforma •
                  🛡️ LGPD compliant
                </>
              ) : (
                <>
                  ✅ 100% anonymous data •
                  🔬 Scientific use only •
                  📊 Helps improve the platform •
                  🛡️ LGPD compliant
                </>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAccept}
              className="flex-1 bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
            >
              {t.accept}
            </Button>
            <Button
              onClick={handleReject}
              variant="ghost"
              className="flex-1 text-white border border-white/30 hover:bg-white/10"
            >
              {t.reject}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
