import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignupConsent } from '../signup-consent'

function renderGate(): void {
  render(
    <SignupConsent>
      <button type="button">Criar conta</button>
    </SignupConsent>
  )
}

describe('SignupConsent', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('keeps sign-up controls disabled until consent is given', async () => {
    const user = userEvent.setup()
    renderGate()

    const button = screen.getByRole('button', { name: 'Criar conta' })
    expect(button).toBeDisabled()

    await user.click(screen.getByTestId('signup-consent-checkbox'))
    expect(button).toBeEnabled()
  })

  it('links to the privacy, responsible AI and terms pages', () => {
    renderGate()
    expect(screen.getByRole('link', { name: 'Política de Privacidade' })).toHaveAttribute(
      'href',
      '/pt/privacy'
    )
    expect(screen.getByRole('link', { name: 'Política de IA Responsável' })).toHaveAttribute(
      'href',
      '/pt/responsible-ai'
    )
    expect(screen.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute('href', '/pt/terms')
  })

  it('remembers consent given earlier on this device', () => {
    window.localStorage.setItem('cidadao_signup_consent_v1', new Date().toISOString())
    renderGate()
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeEnabled()
  })
})
