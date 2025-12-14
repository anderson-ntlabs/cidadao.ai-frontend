/**
 * Tests for User Converter Utilities
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect } from 'vitest'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import {
  generateFallbackAvatar,
  extractAvatar,
  extractName,
  convertToAuthUser,
  convertToAgoraUser,
  createNewAgoraUser,
  mergeUserUpdate,
  needsConsent,
  hasCompletedSetup,
  type AgoraProfileRow,
} from './user-converter'

// Helper to create mock Supabase user
function createMockSupabaseUser(overrides: Partial<SupabaseUser> = {}): SupabaseUser {
  return {
    id: 'user-123',
    app_metadata: { provider: 'github' },
    user_metadata: {
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
    },
    aud: 'authenticated',
    created_at: '2025-01-01T00:00:00Z',
    email: 'test@example.com',
    ...overrides,
  } as SupabaseUser
}

// Helper to create mock profile row
function createMockProfile(overrides: Partial<AgoraProfileRow> = {}): AgoraProfileRow {
  return {
    user_id: 'user-123',
    full_name: 'Profile Name',
    email: 'profile@example.com',
    avatar_url: 'https://example.com/profile-avatar.jpg',
    github_username: 'testuser',
    total_xp: 100,
    current_level: 2,
    current_rank: 'aprendiz',
    has_accepted_terms: true,
    has_completed_onboarding: true,
    onboarding_step: 5,
    ...overrides,
  }
}

describe('generateFallbackAvatar', () => {
  it('should generate UI Avatars URL with default colors', () => {
    const url = generateFallbackAvatar('Test User')

    expect(url).toContain('ui-avatars.com/api')
    expect(url).toContain('name=Test%20User')
    expect(url).toContain('background=16a34a')
    expect(url).toContain('color=fff')
    expect(url).toContain('size=128')
  })

  it('should allow custom colors and size', () => {
    const url = generateFallbackAvatar('Test', 'ff0000', '000', 64)

    expect(url).toContain('background=ff0000')
    expect(url).toContain('color=000')
    expect(url).toContain('size=64')
  })

  it('should encode special characters in name', () => {
    const url = generateFallbackAvatar('José Ação')

    expect(url).toContain('name=Jos%C3%A9%20A%C3%A7%C3%A3o')
  })
})

describe('extractAvatar', () => {
  it('should extract avatar from user_metadata.avatar_url', () => {
    const user = createMockSupabaseUser({
      user_metadata: { avatar_url: 'https://github.com/avatar.jpg' },
    })
    const avatar = extractAvatar(user, 'Test')

    expect(avatar).toBe('https://github.com/avatar.jpg')
  })

  it('should extract avatar from user_metadata.picture', () => {
    const user = createMockSupabaseUser({
      user_metadata: { picture: 'https://google.com/picture.jpg' },
    })
    const avatar = extractAvatar(user, 'Test')

    expect(avatar).toBe('https://google.com/picture.jpg')
  })

  it('should extract avatar from identities array', () => {
    const user = createMockSupabaseUser({
      user_metadata: {},
      identities: [
        {
          id: '123',
          user_id: 'user-123',
          identity_data: { avatar_url: 'https://identity.com/avatar.jpg' },
          provider: 'github',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
      ],
    })
    const avatar = extractAvatar(user, 'Test')

    expect(avatar).toBe('https://identity.com/avatar.jpg')
  })

  it('should generate fallback avatar when none found', () => {
    const user = createMockSupabaseUser({
      user_metadata: {},
      identities: [],
    })
    const avatar = extractAvatar(user, 'Test User')

    expect(avatar).toContain('ui-avatars.com')
    expect(avatar).toContain('name=Test%20User')
  })
})

describe('extractName', () => {
  it('should extract name from full_name', () => {
    const user = createMockSupabaseUser({
      user_metadata: { full_name: 'Full Name' },
    })

    expect(extractName(user)).toBe('Full Name')
  })

  it('should fallback to name field', () => {
    const user = createMockSupabaseUser({
      user_metadata: { name: 'Name Only' },
    })

    expect(extractName(user)).toBe('Name Only')
  })

  it('should fallback to user_name', () => {
    const user = createMockSupabaseUser({
      user_metadata: { user_name: 'username123' },
    })

    expect(extractName(user)).toBe('username123')
  })

  it('should fallback to email prefix', () => {
    const user = createMockSupabaseUser({
      email: 'john.doe@example.com',
      user_metadata: {},
    })

    expect(extractName(user)).toBe('john.doe')
  })

  it('should fallback to Estudante', () => {
    const user = createMockSupabaseUser({
      email: undefined,
      user_metadata: {},
    })

    expect(extractName(user)).toBe('Estudante')
  })
})

describe('convertToAuthUser', () => {
  it('should convert Supabase user to AuthUser', () => {
    const supabaseUser = createMockSupabaseUser({
      user_metadata: {
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        user_name: 'testuser',
      },
    })

    const authUser = convertToAuthUser(supabaseUser)

    expect(authUser.id).toBe('user-123')
    expect(authUser.email).toBe('test@example.com')
    expect(authUser.name).toBe('Test User')
    expect(authUser.avatar).toBe('https://example.com/avatar.jpg')
    expect(authUser.githubUsername).toBe('testuser')
    expect(authUser.provider).toBe('github')
  })

  it('should handle missing email', () => {
    const supabaseUser = createMockSupabaseUser({
      email: undefined,
    })

    const authUser = convertToAuthUser(supabaseUser)

    expect(authUser.email).toBe('')
  })
})

describe('convertToAgoraUser', () => {
  it('should convert Supabase user without profile', () => {
    const supabaseUser = createMockSupabaseUser()
    const agoraUser = convertToAgoraUser(supabaseUser)

    expect(agoraUser.id).toBe('user-123')
    expect(agoraUser.email).toBe('test@example.com')
    expect(agoraUser.totalXp).toBe(0)
    expect(agoraUser.currentLevel).toBe(1)
    expect(agoraUser.hasCompletedOnboarding).toBe(false)
  })

  it('should use profile data when available', () => {
    const supabaseUser = createMockSupabaseUser()
    const profile = createMockProfile()
    const agoraUser = convertToAgoraUser(supabaseUser, profile)

    expect(agoraUser.name).toBe('Profile Name')
    expect(agoraUser.avatar).toBe('https://example.com/profile-avatar.jpg')
    expect(agoraUser.totalXp).toBe(100)
    expect(agoraUser.currentLevel).toBe(2)
    expect(agoraUser.currentRank).toBe('aprendiz')
    expect(agoraUser.hasAcceptedTerms).toBe(true)
    expect(agoraUser.hasCompletedOnboarding).toBe(true)
  })

  it('should set hasAcceptedLgpd from parameter', () => {
    const supabaseUser = createMockSupabaseUser()
    const agoraUser = convertToAgoraUser(supabaseUser, null, true)

    expect(agoraUser.hasAcceptedLgpd).toBe(true)
  })

  it('should handle null profile', () => {
    const supabaseUser = createMockSupabaseUser()
    const agoraUser = convertToAgoraUser(supabaseUser, null)

    expect(agoraUser.totalXp).toBe(0)
    expect(agoraUser.tracks).toEqual([])
  })
})

describe('createNewAgoraUser', () => {
  it('should create new user with defaults', () => {
    const authUser = {
      id: 'user-456',
      email: 'new@example.com',
      name: 'New User',
      avatar: 'https://example.com/new.jpg',
      githubUsername: 'newuser',
      provider: 'github',
    }

    const agoraUser = createNewAgoraUser(authUser)

    expect(agoraUser.id).toBe('user-456')
    expect(agoraUser.email).toBe('new@example.com')
    expect(agoraUser.totalXp).toBe(0)
    expect(agoraUser.currentLevel).toBe(1)
    expect(agoraUser.currentRank).toBe('novato')
    expect(agoraUser.hasAcceptedLgpd).toBe(false)
    expect(agoraUser.hasAcceptedTerms).toBe(false)
    expect(agoraUser.hasCompletedOnboarding).toBe(false)
    expect(agoraUser.isSuperuser).toBe(false)
  })

  it('should set consent when provided', () => {
    const authUser = {
      id: 'user-456',
      email: 'new@example.com',
      name: 'New User',
      avatar: 'https://example.com/new.jpg',
    }

    const agoraUser = createNewAgoraUser(authUser, true)

    expect(agoraUser.hasAcceptedLgpd).toBe(true)
  })
})

describe('mergeUserUpdate', () => {
  it('should merge updates into user', () => {
    const user = createNewAgoraUser({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test',
      avatar: 'https://example.com/test.jpg',
    })

    const updated = mergeUserUpdate(user, { totalXp: 500, currentLevel: 3 })

    expect(updated.totalXp).toBe(500)
    expect(updated.currentLevel).toBe(3)
    expect(updated.email).toBe('test@example.com')
  })
})

describe('needsConsent', () => {
  it('should return true when LGPD not accepted', () => {
    const user = createNewAgoraUser({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test',
      avatar: '',
    })
    user.hasAcceptedLgpd = false
    user.hasAcceptedTerms = true

    expect(needsConsent(user)).toBe(true)
  })

  it('should return true when terms not accepted', () => {
    const user = createNewAgoraUser({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test',
      avatar: '',
    })
    user.hasAcceptedLgpd = true
    user.hasAcceptedTerms = false

    expect(needsConsent(user)).toBe(true)
  })

  it('should return false when both accepted', () => {
    const user = createNewAgoraUser({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test',
      avatar: '',
    })
    user.hasAcceptedLgpd = true
    user.hasAcceptedTerms = true

    expect(needsConsent(user)).toBe(false)
  })
})

describe('hasCompletedSetup', () => {
  it('should return false when consent not given', () => {
    const user = createNewAgoraUser({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test',
      avatar: '',
    })

    expect(hasCompletedSetup(user)).toBe(false)
  })

  it('should return false when onboarding not completed', () => {
    const user = createNewAgoraUser({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test',
      avatar: '',
    })
    user.hasAcceptedLgpd = true
    user.hasAcceptedTerms = true
    user.hasCompletedOnboarding = false

    expect(hasCompletedSetup(user)).toBe(false)
  })

  it('should return true when all setup completed', () => {
    const user = createNewAgoraUser({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test',
      avatar: '',
    })
    user.hasAcceptedLgpd = true
    user.hasAcceptedTerms = true
    user.hasCompletedOnboarding = true

    expect(hasCompletedSetup(user)).toBe(true)
  })
})
