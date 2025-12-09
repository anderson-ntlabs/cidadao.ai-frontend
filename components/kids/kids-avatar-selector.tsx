/**
 * Kids Avatar Selector Component
 *
 * Allows children to choose their avatar from images in /public/kids folder.
 * Dynamically loads all available images - just add new images to the folder!
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Check, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

// Static list of available avatars in /public/kids folder
// To add more avatars: just add images to /public/kids/ and update this list
export const KIDS_AVATARS = [
  { id: 'monica', name: 'Monica', file: 'monica.jpg' },
  { id: 'cocorico', name: 'Cocorico', file: 'cocorico.jpg' },
  { id: 'ze_carioca', name: 'Ze Carioca', file: 'ze_carioca.png' },
  { id: 'jorel', name: 'Irmao do Jorel', file: 'jorel.webp' },
  { id: 'luluzinha', name: 'Luluzinha', file: 'luluzinha.webp' },
]

// Helper to get avatar image path
export function getAvatarPath(avatarId: string | null): string {
  const avatar = KIDS_AVATARS.find((a) => a.id === avatarId)
  if (avatar) return `/kids/${avatar.file}`
  // Default to first avatar
  return `/kids/${KIDS_AVATARS[0].file}`
}

// Helper to get avatar name
export function getAvatarName(avatarId: string | null): string {
  const avatar = KIDS_AVATARS.find((a) => a.id === avatarId)
  return avatar?.name || KIDS_AVATARS[0].name
}

interface KidsAvatarSelectorProps {
  currentAvatar: string | null
  onAvatarChange: (avatarId: string) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  showEditButton?: boolean
  className?: string
}

export function KidsAvatarSelector({
  currentAvatar,
  onAvatarChange,
  disabled = false,
  size = 'lg',
  showEditButton = true,
  className,
}: KidsAvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || KIDS_AVATARS[0].id)

  // Listen for modal close event
  useEffect(() => {
    const handleClose = () => setIsOpen(false)
    window.addEventListener('modal-close', handleClose)
    return () => window.removeEventListener('modal-close', handleClose)
  }, [])

  // Sync selected avatar with current when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(currentAvatar || KIDS_AVATARS[0].id)
    }
  }, [isOpen, currentAvatar])

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  }

  const handleSave = () => {
    onAvatarChange(selectedAvatar)
    setIsOpen(false)
  }

  return (
    <>
      {/* Current Avatar Display */}
      <div className={cn('relative group', className)}>
        <div
          className={cn(
            sizeClasses[size],
            'rounded-2xl bg-gradient-to-br from-kids-turquoise to-kids-coral p-1 shadow-lg'
          )}
        >
          <div className="w-full h-full rounded-xl bg-white dark:bg-gray-800 overflow-hidden">
            <Image
              src={getAvatarPath(currentAvatar)}
              alt={getAvatarName(currentAvatar)}
              width={size === 'lg' ? 96 : size === 'md' ? 64 : 48}
              height={size === 'lg' ? 96 : size === 'md' ? 64 : 48}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Edit Button */}
        {showEditButton && !disabled && (
          <button
            onClick={() => setIsOpen(true)}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-kids-coral text-white shadow-lg flex items-center justify-center hover:bg-kids-coral/90 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Trocar avatar"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Avatar Selection Modal */}
      <Modal open={isOpen} onOpenChange={setIsOpen}>
        <ModalContent size="sm" showCloseButton={true}>
          <ModalHeader>
            <ModalTitle className="text-center text-xl font-bold">Escolha seu Avatar!</ModalTitle>
          </ModalHeader>

          <div className="py-4">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {KIDS_AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={cn(
                    'relative flex flex-col items-center p-2 rounded-xl transition-all',
                    selectedAvatar === avatar.id
                      ? 'bg-kids-coral/20 ring-2 ring-kids-coral scale-105'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md">
                    <Image
                      src={`/kids/${avatar.file}`}
                      alt={avatar.name}
                      fill
                      className="object-cover"
                    />
                    {selectedAvatar === avatar.id && (
                      <div className="absolute inset-0 bg-kids-coral/30 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                  <span className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300 text-center line-clamp-1">
                    {avatar.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Info text */}
            <div className="mt-4 p-3 rounded-xl bg-kids-yellow/20 text-center">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Clique no avatar que voce mais gosta!
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <Button variant="secondary" onClick={() => setIsOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-kids-coral hover:bg-kids-coral/90 text-white"
            >
              Salvar
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  )
}

export default KidsAvatarSelector
