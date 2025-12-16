'use client'

/**
 * Certificate Verification Page
 *
 * Public page to verify certificate authenticity.
 * Accessible without login - validates certificates even after account deletion.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-11
 */

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  GraduationCap,
  Search,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
  Shield,
  Clock,
  Trophy,
  Award,
  Calendar,
} from 'lucide-react'
import type { VerificationResult } from '@/app/api/verify-certificate/route'

export default function VerificarCertificadoPage() {
  const searchParams = useSearchParams()
  const initialCode = searchParams.get('code') || ''

  const [code, setCode] = useState(initialCode)
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)

  const handleVerify = async () => {
    if (!code.trim()) return

    setIsVerifying(true)
    setResult(null)

    try {
      const response = await fetch(
        `/api/verify-certificate?code=${encodeURIComponent(code.trim())}`
      )
      const data: VerificationResult = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Verification error:', error)
      setResult({
        success: false,
        valid: false,
        error: 'Erro ao verificar certificado. Tente novamente.',
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 academy-bg">
      {/* Top bar */}
      <div className="fixed top-4 right-4 z-20">
        <div className="backdrop-blur-sm bg-background/50 rounded-full">
          <ThemeToggle />
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold academy-text mb-2">Validar Certificado</h1>
          <p className="academy-text-muted">
            Verifique a autenticidade de um certificado emitido pela Ágora Cidadão.AI
          </p>
        </div>

        {/* Verification Card */}
        <GlassCard className="mb-6">
          <GlassCardContent className="p-6 space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium academy-text mb-2">
                Código de Verificação
              </label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  type="text"
                  placeholder="Ex: CERT-A1B2C3-XYZ123"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && void handleVerify()}
                  className="font-mono uppercase"
                />
                <Button
                  onClick={() => void handleVerify()}
                  disabled={!code.trim() || isVerifying}
                  className="academy-gradient text-white shrink-0"
                >
                  {isVerifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs academy-text-muted mt-2">
                O código está localizado no canto inferior direito do certificado
              </p>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Result */}
        {result && (
          <GlassCard className="mb-6 overflow-hidden">
            {result.valid && result.certificate ? (
              <>
                {/* Valid Certificate Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Certificado Válido</h2>
                      <p className="text-sm text-white/80">Autenticidade verificada</p>
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <GlassCardContent className="p-6 space-y-4">
                  {/* Holder Name */}
                  <div className="text-center py-4 border-b dark:border-gray-700">
                    <p className="text-sm academy-text-muted mb-1">Certificamos que</p>
                    <p className="text-2xl font-bold academy-text">
                      {result.certificate.holderName}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs academy-text-muted">Carga Horária</p>
                        <p className="font-semibold academy-text">
                          {result.certificate.totalHours}h
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="text-xs academy-text-muted">Rank Final</p>
                        <p className="font-semibold academy-text">{result.certificate.finalRank}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Award className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-xs academy-text-muted">Tipo</p>
                        <p className="font-semibold academy-text capitalize">
                          {result.certificate.certificateType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Calendar className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-xs academy-text-muted">Emitido em</p>
                        <p className="font-semibold academy-text text-sm">
                          {formatDate(result.certificate.issuedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Program */}
                  <div className="text-center pt-4 border-t dark:border-gray-700">
                    <p className="text-xs academy-text-muted">Programa</p>
                    <p className="font-medium academy-text">{result.certificate.programName}</p>
                  </div>

                  {/* Verification Code */}
                  <div className="text-center">
                    <p className="text-xs academy-text-muted">Código de Verificação</p>
                    <p className="font-mono text-sm academy-text">
                      {result.certificate.verificationCode}
                    </p>
                  </div>
                </GlassCardContent>
              </>
            ) : (
              /* Invalid/Not Found */
              <GlassCardContent className="p-6">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-7 h-7 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-200">
                      Certificado Não Encontrado
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {result.error ||
                        'Não foi possível verificar este código. Verifique se digitou corretamente.'}
                    </p>
                  </div>
                </div>
              </GlassCardContent>
            )}
          </GlassCard>
        )}

        {/* Info */}
        <GlassCard className="mb-6">
          <GlassCardContent className="p-4">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm academy-text-muted">
                <p className="font-medium academy-text mb-1">Sobre a Verificação</p>
                <p>
                  Os certificados da Ágora Cidadão.AI são verificáveis permanentemente, mesmo após a
                  exclusão da conta do titular, conforme a LGPD. Cada certificado possui um código
                  único que garante sua autenticidade.
                </p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Footer */}
        <div className="text-center">
          <Link
            href="/pt/agora/login"
            className="inline-flex items-center gap-2 text-sm academy-text-muted hover:text-tarsila-amarelo transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Login
          </Link>
        </div>
      </div>
    </div>
  )
}
