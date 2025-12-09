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
import { getAvatarPath } from './kids-avatar-selector'

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
    avatar: getAvatarPath(childAvatar),
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
