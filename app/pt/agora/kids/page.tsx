/**
 * Kids Area Entry Page
 *
 * Entry point for Kids mode with two access options:
 * 1. Parent setup (first time) - creates profile and generates unique code
 * 2. Child access (returning) - goes directly to dashboard
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useKids } from '@/hooks/use-kids'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import {
  Baby,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle,
  Copy,
  AlertTriangle,
  User,
  Shield,
  KeyRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KidsContractModal } from '@/components/kids'

type Step = 'choice' | 'setup' | 'contract' | 'code-generated' | 'child-access'

export default function KidsEntryPage() {
  const router = useRouter()
  const {
    isKidsMode,
    kidsProfile,
    childName: existingChildName,
    enableKidsMode,
    generateAccessCode,
    isLoading: kidsLoading,
  } = useKids()

  const [step, setStep] = useState<Step>('choice')
  const [childName, setChildName] = useState('')
  const [parentName, setParentName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState<'lobato' | 'tarsila'>('lobato')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [codeCopied, setCodeCopied] = useState(false)
  const [contractId, setContractId] = useState<string | null>(null)

  const avatars = [
    {
      id: 'lobato' as const,
      name: 'Monteiro Lobato',
      image: '/agents/monteiro_lobato.jpg',
    },
    {
      id: 'tarsila' as const,
      name: 'Tarsila do Amaral',
      image: '/agents/tarsila_a_musa.png',
    },
  ]

  // If already in kids mode with profile, redirect to dashboard
  useEffect(() => {
    if (isKidsMode && kidsProfile && step === 'choice') {
      setStep('child-access')
    }
  }, [isKidsMode, kidsProfile, step])

  const handleParentSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate required fields
    if (!childName || !parentName || !parentEmail) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }

    // Go to contract step
    setStep('contract')
  }

  const handleContractAccept = async (acceptedContractId: string) => {
    setContractId(acceptedContractId)
    setIsLoading(true)
    setError(null)

    try {
      // Enable kids mode (this will create the profile)
      const success = await enableKidsMode(
        parentName,
        parentEmail,
        childName,
        selectedAvatar,
        acceptedContractId
      )

      if (success) {
        // Generate unique parental code
        const code = await generateAccessCode()
        if (code) {
          setGeneratedCode(code)
          setStep('code-generated')
        } else {
          setError('Erro ao gerar código de acesso. Tente novamente.')
          setStep('setup')
        }
      } else {
        setError('Erro ao configurar área Kids. Tente novamente.')
        setStep('setup')
      }
    } catch {
      setError('Erro inesperado. Tente novamente.')
      setStep('setup')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContractClose = () => {
    setStep('setup')
  }

  const handleCopyCode = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    }
  }

  const handleEnterKidsArea = () => {
    router.push('/pt/agora/kids/dashboard')
  }

  // Loading state
  if (kidsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kids-cream to-white dark:from-slate-900 dark:to-slate-800">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-kids-coral" />
          <p className="text-lg text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-kids-cream to-white dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-kids-coral to-kids-turquoise flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Baby className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Área Kids</h1>
          <p className="text-muted-foreground">Aprendizado seguro e divertido para crianças</p>
        </div>

        {/* Step: Choice */}
        {step === 'choice' && (
          <div className="space-y-4">
            {/* Parent Setup Button */}
            <button
              onClick={() => setStep('setup')}
              className="kids-card w-full p-6 text-left hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-kids-purple to-kids-coral flex items-center justify-center">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">Sou Pai/Responsável</h3>
                  <p className="text-sm text-muted-foreground">
                    Primeira vez? Configure a área Kids
                  </p>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Child Access Button (only if already configured) */}
            {isKidsMode && existingChildName && (
              <button
                onClick={handleEnterKidsArea}
                className="kids-card w-full p-6 text-left hover:shadow-xl transition-all group border-kids-green"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-kids-green to-kids-turquoise flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">
                      Entrar como {existingChildName}
                    </h3>
                    <p className="text-sm text-muted-foreground">Continuar aprendendo!</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            )}

            {/* Parental Dashboard Access */}
            <Link
              href="/pt/agora/pais"
              className="block text-center text-sm text-muted-foreground hover:text-kids-coral transition-colors mt-6"
            >
              <KeyRound className="inline h-4 w-4 mr-1" />
              Acessar Dashboard dos Pais (com código)
            </Link>
          </div>
        )}

        {/* Step: Parent Setup Form */}
        {step === 'setup' && (
          <GlassCard>
            <GlassCardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setStep('choice')}
                  className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
                >
                  ←
                </button>
                <h2 className="text-xl font-bold">Configurar Área Kids</h2>
              </div>

              <form onSubmit={handleParentSetup} className="space-y-6">
                {/* Parent Name */}
                <div className="space-y-2">
                  <Label htmlFor="parentName" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Nome do Responsável
                  </Label>
                  <Input
                    id="parentName"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    required
                    className="text-lg h-12"
                  />
                </div>

                {/* Parent Email */}
                <div className="space-y-2">
                  <Label htmlFor="parentEmail" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Email do Responsável
                  </Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="Ex: joao@email.com"
                    required
                    className="text-lg h-12"
                  />
                </div>

                {/* Child Name */}
                <div className="space-y-2">
                  <Label htmlFor="childName" className="flex items-center gap-2">
                    <Baby className="h-4 w-4" />
                    Nome da Criança
                  </Label>
                  <Input
                    id="childName"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Ex: Maria"
                    required
                    className="text-lg h-12"
                  />
                </div>

                {/* Avatar Selection */}
                <div className="space-y-3">
                  <Label>Escolha um Avatar</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {avatars.map((avatar) => (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar.id)}
                        className={cn(
                          'relative p-4 rounded-xl border-3 transition-all',
                          selectedAvatar === avatar.id
                            ? 'border-kids-coral bg-kids-coral/10 shadow-lg'
                            : 'border-border hover:border-kids-coral/50'
                        )}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="relative h-16 w-16 rounded-full overflow-hidden">
                            <Image
                              src={avatar.image}
                              alt={avatar.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-sm font-medium text-center">{avatar.name}</span>
                        </div>
                        {selectedAvatar === avatar.id && (
                          <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-kids-coral" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warning */}
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-200">Importante!</p>
                      <p className="text-amber-700 dark:text-amber-300 mt-1">
                        Após configurar, você receberá um código único. Anote-o! Este código é a
                        única forma de acessar os relatórios de uso da criança.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && <p className="text-sm text-destructive text-center">{error}</p>}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isLoading || !childName || !parentName || !parentEmail}
                  className="w-full h-14 text-lg bg-kids-coral hover:bg-kids-coral/90"
                >
                  Continuar para os Termos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Step: Contract */}
        {step === 'contract' && (
          <>
            <KidsContractModal
              isOpen={true}
              onAccept={handleContractAccept}
              onClose={handleContractClose}
              parentName={parentName}
              parentEmail={parentEmail}
              childName={childName}
            />
            {/* Loading overlay while processing contract */}
            {isLoading && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-kids-coral" />
                  <p className="text-lg font-medium">Configurando Área Kids...</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step: Code Generated */}
        {step === 'code-generated' && generatedCode && (
          <GlassCard>
            <GlassCardContent className="p-6 text-center space-y-6">
              <div className="h-20 w-20 mx-auto rounded-full bg-kids-green flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Área Kids Criada!</h2>
                <p className="text-muted-foreground">
                  Olá {childName}! Sua área de aprendizado está pronta.
                </p>
              </div>

              {/* Code Display */}
              <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-3">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Seu Código de Acesso Parental
                </p>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-3xl font-mono font-bold tracking-widest text-kids-coral">
                    {generatedCode}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className="h-10 w-10 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    {codeCopied ? (
                      <CheckCircle className="h-5 w-5 text-kids-green" />
                    ) : (
                      <Copy className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex gap-3 text-left">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-red-800 dark:text-red-200">
                      ANOTE ESTE CÓDIGO AGORA!
                    </p>
                    <p className="text-red-700 dark:text-red-300 mt-1">
                      Este código será mostrado apenas uma vez. Você precisará dele para acessar os
                      relatórios de uso em /pt/agora/pais
                    </p>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <Button
                onClick={handleEnterKidsArea}
                className="w-full h-14 text-lg bg-kids-green hover:bg-kids-green/90"
              >
                Entrar na Área Kids
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Step: Child Access (returning user) */}
        {step === 'child-access' && (
          <div className="space-y-6">
            <GlassCard>
              <GlassCardContent className="p-6 text-center space-y-6">
                <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-kids-coral to-kids-turquoise flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Olá, {existingChildName}!
                  </h2>
                  <p className="text-muted-foreground">Pronto para aprender hoje?</p>
                </div>

                <Button
                  onClick={handleEnterKidsArea}
                  className="w-full h-14 text-lg bg-kids-coral hover:bg-kids-coral/90"
                >
                  Entrar na Área Kids
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </GlassCardContent>
            </GlassCard>

            <Link
              href="/pt/agora/pais"
              className="block text-center text-sm text-muted-foreground hover:text-kids-coral transition-colors"
            >
              <KeyRound className="inline h-4 w-4 mr-1" />
              Dashboard dos Pais
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 space-y-3">
          <Link
            href="/pt/agora/kids/termos"
            className="text-xs text-muted-foreground hover:text-kids-coral transition-colors"
          >
            Termos de Uso e Privacidade (Área Kids)
          </Link>
          <p className="text-xs text-muted-foreground">
            <Link href="/pt/agora" className="hover:text-kids-coral transition-colors">
              ← Voltar para Ágora
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
