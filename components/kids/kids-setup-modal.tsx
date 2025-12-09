/**
 * Kids Setup Modal Component
 *
 * Modal for parents to configure Kids mode.
 * Collects child name, email for reports, and avatar preference.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import { useState, useEffect } from 'react'
import { useKids } from '@/hooks/use-kids'
import { useRouter } from 'next/navigation'
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Baby, Mail, User, CheckCircle } from 'lucide-react'
import Image from 'next/image'

interface KidsSetupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lang?: 'pt' | 'en'
}

type Avatar = 'lobato' | 'tarsila'

export function KidsSetupModal({ open, onOpenChange, lang = 'pt' }: KidsSetupModalProps) {
  const router = useRouter()
  const { enableKidsMode, parentEmail: existingParentEmail } = useKids()

  const [childName, setChildName] = useState('')
  const [parentEmail, setParentEmail] = useState(existingParentEmail || '')
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>('lobato')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'form' | 'success'>('form')

  const avatars: { id: Avatar; name: string; image: string }[] = [
    {
      id: 'lobato',
      name: 'Monteiro Lobato',
      image: '/agents/monteiro_lobato.jpg',
    },
    {
      id: 'tarsila',
      name: 'Tarsila do Amaral',
      image: '/agents/tarsila_a_musa.png',
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const success = await enableKidsMode(childName, parentEmail, selectedAvatar)

      if (success) {
        setStep('success')
        // Redirect to Kids area after brief delay
        setTimeout(() => {
          onOpenChange(false)
          router.push(`/${lang}/agora/kids`)
        }, 2000)
      } else {
        setError(
          lang === 'pt'
            ? 'Erro ao ativar modo Kids. Tente novamente.'
            : 'Error enabling Kids mode. Please try again.'
        )
      }
    } catch {
      setError(
        lang === 'pt' ? 'Erro inesperado. Tente novamente.' : 'Unexpected error. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep('form')
    setError(null)
    onOpenChange(false)
  }

  // Listen for close events from Modal
  useEffect(() => {
    const handleModalClose = () => handleClose()
    window.addEventListener('modal-close', handleModalClose)
    return () => window.removeEventListener('modal-close', handleModalClose)
  }, [])

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent className="sm:max-w-md">
        {step === 'form' ? (
          <>
            <ModalHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-kids-coral to-kids-turquoise flex items-center justify-center">
                  <Baby className="h-5 w-5 text-white" />
                </div>
                <ModalTitle className="text-xl">
                  {lang === 'pt' ? 'Configurar Área Kids' : 'Setup Kids Area'}
                </ModalTitle>
              </div>
              <ModalDescription>
                {lang === 'pt'
                  ? 'Configure o perfil do seu filho para uma experiência segura e divertida.'
                  : "Set up your child's profile for a safe and fun experience."}
              </ModalDescription>
            </ModalHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Child Name */}
              <div className="space-y-2">
                <Label htmlFor="childName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {lang === 'pt' ? 'Nome da Criança' : "Child's Name"}
                </Label>
                <Input
                  id="childName"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder={lang === 'pt' ? 'Ex: Maria' : 'Ex: Mary'}
                  required
                  className="text-lg"
                />
              </div>

              {/* Parent Email */}
              <div className="space-y-2">
                <Label htmlFor="parentEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {lang === 'pt' ? 'Email para Relatórios' : 'Email for Reports'}
                </Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="pai@email.com"
                  required
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  {lang === 'pt'
                    ? 'Você receberá relatórios diários sobre o progresso.'
                    : 'You will receive daily progress reports.'}
                </p>
              </div>

              {/* Avatar Selection */}
              <div className="space-y-3">
                <Label>{lang === 'pt' ? 'Escolha um Mentor' : 'Choose a Mentor'}</Label>
                <div className="grid grid-cols-2 gap-4">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`
                        relative p-4 rounded-xl border-3 transition-all
                        ${
                          selectedAvatar === avatar.id
                            ? 'border-primary bg-primary/10 shadow-lg'
                            : 'border-border hover:border-primary/50'
                        }
                      `}
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
                        <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && <p className="text-sm text-destructive text-center">{error}</p>}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !childName || !parentEmail}
                className="w-full kids-button bg-kids-coral hover:bg-kids-coral/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {lang === 'pt' ? 'Ativando...' : 'Enabling...'}
                  </>
                ) : (
                  <>{lang === 'pt' ? 'Ativar Área Kids' : 'Enable Kids Area'}</>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="h-20 w-20 mx-auto rounded-full bg-kids-green flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {lang === 'pt' ? 'Área Kids Ativada!' : 'Kids Area Enabled!'}
            </h3>
            <p className="text-muted-foreground">
              {lang === 'pt'
                ? `Olá ${childName}! Entrando na área de diversão...`
                : `Hi ${childName}! Entering the fun zone...`}
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-kids-coral" />
          </div>
        )}
      </ModalContent>
    </Modal>
  )
}

export default KidsSetupModal
