/**
 * Parental Access Page
 *
 * Login page for parents to access Kids mode dashboard.
 * Sends a verification code via email for each access.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 * @updated 2025-12-10 - Email-based verification
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import {
  Shield,
  Lock,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Mail,
  CheckCircle,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'

type Step = 'request' | 'verify'

export default function ParentalAccessPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('request')
  const [email] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Step 1: Request code via email
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/parental/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao enviar código')
        return
      }

      setMaskedEmail(data.email)
      setSuccess('Código enviado! Verifique seu email.')
      setStep('verify')

      // In development, show the code in console
      if (data.code) {
        console.log('[DEV] Parental code:', data.code)
        setSuccess(`Código enviado! (Dev: ${data.code})`)
      }
    } catch {
      setError('Erro ao conectar com o servidor')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/parental/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email: email || maskedEmail }),
      })

      const data = await response.json()

      if (!response.ok || !data.isValid) {
        setError(data.error || 'Código inválido ou expirado')
        return
      }

      // Store access in session and redirect
      sessionStorage.setItem(
        'parental_access',
        JSON.stringify({
          userId: data.userId,
          kidsProfileId: data.kidsProfileId,
          childName: data.childName,
          accessedAt: new Date().toISOString(),
        })
      )

      router.push('/pt/agora/pais/dashboard')
    } catch {
      setError('Erro ao validar código')
    } finally {
      setIsLoading(false)
    }
  }

  // Resend code
  const handleResendCode = async () => {
    setCode('')
    setError(null)
    setSuccess(null)
    await handleRequestCode({ preventDefault: () => {} } as React.FormEvent)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <Link
          href="/pt/agora/kids"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Área Kids
        </Link>

        {/* Main Card */}
        <GlassCard>
          <GlassCardContent className="p-8">
            <div className="text-center mb-8">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard dos Pais</h1>
              <p className="text-sm text-muted-foreground">
                {step === 'request'
                  ? 'Enviaremos um código de verificação para seu email'
                  : `Código enviado para ${maskedEmail}`}
              </p>
            </div>

            {/* Step 1: Request Code */}
            {step === 'request' && (
              <form onSubmit={handleRequestCode} className="space-y-6">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Verificação por Email
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Por segurança, enviaremos um código de 6 dígitos para o email cadastrado no
                        seu perfil Ágora.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" />
                      Enviar Código por Email
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Step 2: Verify Code */}
            {step === 'verify' && (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                {/* Success Message */}
                {success && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    {success}
                  </div>
                )}

                {/* Code Input */}
                <div className="space-y-2">
                  <Label htmlFor="code" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Código de Verificação
                  </Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-3xl font-mono tracking-[0.5em] h-16"
                    required
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    O código expira em 10 minutos
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || code.length < 6}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Acessar Dashboard'
                  )}
                </Button>

                {/* Resend Code */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reenviar código
                  </button>
                </div>
              </form>
            )}
          </GlassCardContent>
        </GlassCard>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Cada acesso requer um novo código por segurança
          </p>
          <Link href="/pt/agora/kids/termos" className="text-xs text-emerald-600 hover:underline">
            Termos de Uso e Privacidade
          </Link>
        </div>
      </div>
    </div>
  )
}
