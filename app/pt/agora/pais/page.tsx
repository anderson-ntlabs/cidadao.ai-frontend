/**
 * Parental Access Page
 *
 * Login page for parents to access Kids mode dashboard.
 * Requires unique access code generated during Kids setup.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParentalAccess } from '@/hooks/use-kids'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { Shield, Lock, Loader2, ArrowLeft, AlertCircle, HelpCircle, Baby } from 'lucide-react'
import Link from 'next/link'

export default function ParentalAccessPage() {
  const router = useRouter()
  const { verifyAndGetAccess } = useParentalAccess()

  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await verifyAndGetAccess(code.toUpperCase())

      if (result.success) {
        // Store access in session and redirect
        sessionStorage.setItem(
          'parental_access',
          JSON.stringify({
            code: code.toUpperCase(),
            childName: result.childName,
            accessedAt: new Date().toISOString(),
          })
        )
        router.push('/pt/agora/pais/dashboard')
      } else {
        setError(result.error || 'Código inválido ou expirado')
      }
    } catch {
      setError('Erro ao validar código. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
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
              <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-kids-purple to-kids-coral flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard dos Pais</h1>
              <p className="text-sm text-muted-foreground">
                Acompanhe o progresso de aprendizado do seu filho
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Code Input */}
              <div className="space-y-2">
                <Label htmlFor="code" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Código de Acesso Parental
                </Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="ABC123"
                  maxLength={6}
                  className="text-center text-3xl font-mono tracking-[0.5em] h-16 uppercase"
                  required
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Digite o código de 6 caracteres gerado ao configurar a Área Kids
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
                className="w-full h-12 bg-kids-coral hover:bg-kids-coral/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Validando...
                  </>
                ) : (
                  'Acessar Dashboard'
                )}
              </Button>
            </form>

            {/* Help Section */}
            <div className="mt-8 pt-6 border-t space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <HelpCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Perdeu seu código?
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Infelizmente, o código é mostrado apenas uma vez durante a configuração inicial.
                    Por segurança, não é possível recuperá-lo. Você precisará reconfigurar a Área
                    Kids.
                  </p>
                </div>
              </div>

              <Link
                href="/pt/agora/kids"
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm"
              >
                <Baby className="h-4 w-4" />
                Configurar nova Área Kids
              </Link>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            O código não expira, mas guarde-o em local seguro
          </p>
          <Link href="/pt/agora/kids/termos" className="text-xs text-kids-coral hover:underline">
            Termos de Uso e Privacidade
          </Link>
        </div>
      </div>
    </div>
  )
}
