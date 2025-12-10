/**
 * Gov.br Mock Login Component
 *
 * Simulates the Gov.br OAuth login flow for development/demo purposes.
 * Shows a realistic Gov.br login modal with CPF input and trust level selection.
 *
 * In production, this will be replaced with real Gov.br OAuth integration.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Modal, ModalContent } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'
import {
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  CreditCard,
  Fingerprint,
  ArrowRight,
  Info,
} from 'lucide-react'

interface GovBrMockLoginProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (userData: GovBrUserData) => void
}

export interface GovBrUserData {
  cpf: string
  name: string
  email: string
  trustLevel: 'bronze' | 'prata' | 'ouro'
  photoUrl?: string
  birthDate?: string
  phone?: string
}

// Mock user data based on CPF
const MOCK_USERS: Record<string, Omit<GovBrUserData, 'cpf'>> = {
  '000.000.000-00': {
    name: 'Usuário Demo',
    email: 'demo@cidadao.ai',
    trustLevel: 'ouro',
    birthDate: '1990-01-15',
    phone: '(31) 99999-0000',
  },
  '111.111.111-11': {
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    trustLevel: 'prata',
    birthDate: '1985-06-20',
    phone: '(11) 98888-1111',
  },
  '222.222.222-22': {
    name: 'João Santos',
    email: 'joao.santos@email.com',
    trustLevel: 'bronze',
    birthDate: '1995-03-10',
    phone: '(21) 97777-2222',
  },
}

// Trust level descriptions
const TRUST_LEVELS = {
  bronze: {
    label: 'Bronze',
    color: 'bg-amber-600',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    description: 'Cadastro básico validado',
    icon: Shield,
    features: ['Acesso básico', 'Consultas públicas'],
  },
  prata: {
    label: 'Prata',
    color: 'bg-gray-400',
    textColor: 'text-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
    description: 'Validação por banco ou biometria',
    icon: Smartphone,
    features: ['Acesso intermediário', 'Serviços digitais', 'Assinatura simples'],
  },
  ouro: {
    label: 'Ouro',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    description: 'Validação por certificado digital ou biometria facial',
    icon: Fingerprint,
    features: ['Acesso completo', 'Assinatura avançada', 'Todos os serviços'],
  },
}

type LoginStep = 'cpf' | 'password' | 'trust' | 'loading' | 'success'

export function GovBrMockLogin({ isOpen, onClose, onSuccess }: GovBrMockLoginProps) {
  const [step, setStep] = useState<LoginStep>('cpf')
  const [cpf, setCpf] = useState('')
  const [cpfError, setCpfError] = useState('')
  const [selectedTrust, setSelectedTrust] = useState<'bronze' | 'prata' | 'ouro'>('prata')
  const [userData, setUserData] = useState<GovBrUserData | null>(null)

  // Format CPF as user types
  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9)
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value)
    if (formatted.length <= 14) {
      setCpf(formatted)
      setCpfError('')
    }
  }

  const validateCpf = useCallback(() => {
    if (cpf.length !== 14) {
      setCpfError('CPF inválido')
      return false
    }
    return true
  }, [cpf])

  const handleCpfSubmit = useCallback(() => {
    if (!validateCpf()) return

    // Check if it's a known mock user
    const mockUser = MOCK_USERS[cpf]
    if (mockUser) {
      setUserData({ cpf, ...mockUser })
      setSelectedTrust(mockUser.trustLevel)
    } else {
      // Generate random user for unknown CPF
      setUserData({
        cpf,
        name: 'Cidadão Brasileiro',
        email: `cidadao.${cpf.replace(/\D/g, '').slice(0, 4)}@email.com`,
        trustLevel: 'bronze',
      })
      setSelectedTrust('bronze')
    }

    setStep('password')
  }, [cpf, validateCpf])

  const handlePasswordSubmit = useCallback(() => {
    setStep('trust')
  }, [])

  const handleTrustSelect = useCallback((level: 'bronze' | 'prata' | 'ouro') => {
    setSelectedTrust(level)
  }, [])

  const handleConfirm = useCallback(() => {
    setStep('loading')

    // Simulate API delay
    setTimeout(() => {
      setStep('success')

      // After success animation, return user data
      setTimeout(() => {
        if (userData) {
          onSuccess({ ...userData, trustLevel: selectedTrust })
        }
        // Reset state
        setStep('cpf')
        setCpf('')
        setUserData(null)
      }, 1500)
    }, 2000)
  }, [userData, selectedTrust, onSuccess])

  const handleClose = useCallback(() => {
    setStep('cpf')
    setCpf('')
    setCpfError('')
    setUserData(null)
    onClose()
  }, [onClose])

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <ModalContent size="default" className="p-0 overflow-hidden">
        {/* Gov.br Header */}
        <div className="bg-[#1351B4] text-white p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Image
                src="/govbr-logo.svg"
                alt="Gov.br"
                width={32}
                height={32}
                className="object-contain"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span className="text-[#1351B4] font-bold text-sm">GOV</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">Acesso Gov.br</h2>
              <p className="text-xs text-blue-200">Identidade digital do cidadão brasileiro</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'cpf' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Identifique-se com o CPF
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Digite seu CPF para acessar sua conta Gov.br
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CPF
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border-2 text-lg text-center font-mono',
                    'focus:outline-none focus:ring-2 focus:ring-[#1351B4] focus:border-transparent',
                    'bg-white dark:bg-gray-800',
                    cpfError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  )}
                  autoFocus
                />
                {cpfError && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {cpfError}
                  </p>
                )}
              </div>

              {/* Demo hint */}
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Modo demonstração:</strong> Use 000.000.000-00 para testar com conta
                    Ouro, ou qualquer CPF válido para conta Bronze.
                  </span>
                </p>
              </div>

              <Button
                onClick={handleCpfSubmit}
                className="w-full bg-[#1351B4] hover:bg-[#0C4199]"
                disabled={cpf.length !== 14}
              >
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 'password' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#1351B4]/10 flex items-center justify-center mb-4">
                  <CreditCard className="w-8 h-8 text-[#1351B4]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Olá, {userData?.name?.split(' ')[0]}!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">CPF: {cpf}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border-2 text-lg',
                    'focus:outline-none focus:ring-2 focus:ring-[#1351B4] focus:border-transparent',
                    'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  )}
                  autoFocus
                  defaultValue="demo123" // Pre-filled for demo
                />
              </div>

              {/* Demo hint */}
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Modo demonstração: qualquer senha é aceita
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep('cpf')} className="flex-1">
                  Voltar
                </Button>
                <Button
                  onClick={handlePasswordSubmit}
                  className="flex-1 bg-[#1351B4] hover:bg-[#0C4199]"
                >
                  Entrar
                </Button>
              </div>
            </div>
          )}

          {step === 'trust' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Selecione o nível de confiabilidade
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Escolha como deseja se autenticar
                </p>
              </div>

              <div className="space-y-3">
                {(
                  Object.entries(TRUST_LEVELS) as [
                    keyof typeof TRUST_LEVELS,
                    (typeof TRUST_LEVELS)[keyof typeof TRUST_LEVELS],
                  ][]
                ).map(([key, level]) => (
                  <button
                    key={key}
                    onClick={() => handleTrustSelect(key)}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 text-left transition-all',
                      selectedTrust === key
                        ? 'border-[#1351B4] bg-[#1351B4]/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#1351B4]/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center',
                          level.color
                        )}
                      >
                        <level.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{level.label}</span>
                          {selectedTrust === key && (
                            <CheckCircle2 className="w-4 h-4 text-[#1351B4]" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {level.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {level.features.map((feature) => (
                            <span
                              key={feature}
                              className={cn(
                                'text-[10px] px-2 py-0.5 rounded-full',
                                level.bgColor,
                                level.textColor
                              )}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep('password')} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={handleConfirm} className="flex-1 bg-[#1351B4] hover:bg-[#0C4199]">
                  Confirmar
                </Button>
              </div>
            </div>
          )}

          {step === 'loading' && (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#1351B4] mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Autenticando...
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Validando sua identidade com Gov.br
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Autenticado com sucesso!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Bem-vindo(a), {userData?.name}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800">
                <div className={cn('w-3 h-3 rounded-full', TRUST_LEVELS[selectedTrust].color)} />
                <span className="text-sm font-medium">
                  Conta {TRUST_LEVELS[selectedTrust].label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-[10px] text-gray-400 text-center">
            Este é um ambiente de demonstração. Em produção, a autenticação será feita através do
            sistema oficial Gov.br.
          </p>
        </div>
      </ModalContent>
    </Modal>
  )
}

export default GovBrMockLogin
