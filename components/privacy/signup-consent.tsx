/**
 * Sign-up Consent Gate
 *
 * LGPD (Lei 13.709/2018, art. 8) consent shown before an account can be
 * created or used. The sign-in / sign-up controls passed as children stay
 * disabled until the person confirms they read the privacy policy, the
 * responsible AI policy and the terms. The choice is remembered on this
 * device so returning users are not asked again.
 */

'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'cidadao_signup_consent_v1'

interface SignupConsentProps {
  children: React.ReactNode
  className?: string
}

function readStoredConsent(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

function storeConsent(accepted: boolean): void {
  try {
    if (accepted) {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Storage unavailable (private mode): consent applies to this visit only
  }
}

export function SignupConsent({ children, className }: SignupConsentProps): JSX.Element {
  const checkboxId = useId()
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    setAccepted(readStoredConsent())
  }, [])

  const handleChange = (value: boolean): void => {
    setAccepted(value)
    storeConsent(value)
  }

  return (
    <div className={className}>
      <div className="mb-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50/80 dark:bg-green-900/20 p-3 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-start gap-2">
          <input
            id={checkboxId}
            type="checkbox"
            checked={accepted}
            onChange={(e) => handleChange(e.target.checked)}
            className="mt-1 h-4 w-4 flex-shrink-0 accent-green-600"
            data-testid="signup-consent-checkbox"
          />
          <label htmlFor={checkboxId}>
            Li e concordo com a{' '}
            <Link
              href="/pt/privacy"
              target="_blank"
              className="text-green-700 dark:text-green-400 underline"
            >
              Política de Privacidade
            </Link>
            , a{' '}
            <Link
              href="/pt/responsible-ai"
              target="_blank"
              className="text-green-700 dark:text-green-400 underline"
            >
              Política de IA Responsável
            </Link>{' '}
            e os{' '}
            <Link
              href="/pt/terms"
              target="_blank"
              className="text-green-700 dark:text-green-400 underline"
            >
              Termos de Uso
            </Link>
            , e consinto com o tratamento dos meus dados pessoais (nome, e-mail e mensagens enviadas
            aos agentes) para criar e usar minha conta, conforme a LGPD.
          </label>
        </div>
        {!accepted && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400" role="status">
            Marque a caixa acima para entrar ou criar sua conta.
          </p>
        )}
      </div>

      <fieldset
        disabled={!accepted}
        aria-disabled={!accepted}
        className={cn('min-w-0 transition-opacity', !accepted && 'opacity-50')}
      >
        {children}
      </fieldset>
    </div>
  )
}
