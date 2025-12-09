/**
 * Parental Access Page
 *
 * Login page for parents to access Kids mode dashboard.
 * Requires access code sent via email.
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
import { GlassCard } from '@/components/ui/glass-card'
import { Shield, Lock, Loader2, ArrowLeft, Mail, AlertCircle } from 'lucide-react'
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
        setError(result.error || 'Codigo invalido')
      }
    } catch {
      setError('Erro ao validar codigo. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <Link
          href="/pt/agora"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Agora
        </Link>

        {/* Main Card */}
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Area dos Pais</h1>
            <p className="text-sm text-muted-foreground">
              Acesse o dashboard para ver o progresso do seu filho
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code Input */}
            <div className="space-y-2">
              <Label htmlFor="code" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Codigo de Acesso
              </Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: ABC123"
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest h-14"
                required
              />
              <p className="text-xs text-muted-foreground text-center">
                Digite o codigo de 6 caracteres enviado por email
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
            <Button type="submit" disabled={isLoading || code.length < 6} className="w-full h-12">
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
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Nao recebeu o codigo?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Verifique sua caixa de spam ou solicite um novo codigo no painel principal da
                  Agora.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          O codigo expira em 24 horas por seguranca
        </p>
      </div>
    </div>
  )
}
