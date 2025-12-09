/**
 * Kids Header Component
 *
 * Simplified header for Kids area that reuses AgoraHeader
 * with isKidsMode=true for a cleaner, child-friendly UI.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import { useRouter } from 'next/navigation'
import { AgoraHeader } from '@/components/agora/agora-header'
import { useKids } from '@/hooks/use-kids'

// Avatar images mapping for header display
const AVATAR_IMAGES: Record<string, string> = {
  monica: '/kids/monica.jpg',
  cocorico: '/kids/cocorico.jpg',
  ze_carioca: '/kids/ze_carioca.png',
  jorel: '/kids/jorel.webp',
  luluzinha: '/kids/luluzinha.webp',
  lobato: '/agents/monteiro-lobato.png',
  tarsila: '/agents/tarsila-amaral.png',
}

function getAvatarImage(avatarId: string | null): string {
  if (!avatarId) return AVATAR_IMAGES.monica
  return AVATAR_IMAGES[avatarId] || AVATAR_IMAGES.monica
}

export function KidsHeader() {
  const router = useRouter()
  const { childName, childAvatar, disableKidsMode } = useKids()

  const handleExitKidsMode = async () => {
    await disableKidsMode()
    router.push('/pt/agora')
  }

  // Create user object for AgoraHeader
  const kidsUser = {
    name: childName || 'Amiguinho',
    avatar: getAvatarImage(childAvatar),
    totalXp: 0, // Hidden in Kids mode
    currentLevel: 1, // Hidden in Kids mode
    currentRank: 'novato', // Hidden in Kids mode
  }

  return (
    <AgoraHeader
      user={kidsUser}
      onLogout={handleExitKidsMode}
      isKidsMode={true}
      kidsChildName={childName || undefined}
    />
  )
}

export default KidsHeader
