import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProfileService } from './profile.service'
import type { UserProfile, UserPreferences } from '@/types/profile'

// Mock dependencies
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  }),
}))

vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    error: vi.fn(),
  }),
}))

describe('ProfileService', () => {
  let service: ProfileService
  let mockSupabase: any
  let mockFrom: any
  let mockStorage: any
  let mockLogger: any

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ProfileService()
    mockSupabase = (service as any).supabase
    mockLogger = (service as any).logger

    // Setup default mock chain for database
    mockFrom = {
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
    }

    mockSupabase.from = vi.fn().mockReturnValue(mockFrom)

    // Setup default mock for storage
    mockStorage = {
      upload: vi.fn(),
      getPublicUrl: vi.fn(),
    }

    mockSupabase.storage = {
      from: vi.fn().mockReturnValue(mockStorage),
    }

    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock document and window
    global.document = {
      documentElement: {
        classList: {
          toggle: vi.fn(),
        },
      },
    } as any

    global.window = {
      matchMedia: vi.fn().mockReturnValue({
        matches: false,
      }),
    } as any
  })

  describe('getProfile', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockProfileData = {
      id: 'user-123',
      name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      bio: 'Test bio',
    }

    it('should fetch user profile successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.single.mockResolvedValue({ data: mockProfileData, error: null })

      const result = await service.getProfile()

      expect(result).toEqual({
        ...mockProfileData,
        email: 'test@example.com',
      })
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockFrom.select).toHaveBeenCalledWith('*')
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'user-123')
      expect(mockFrom.single).toHaveBeenCalled()
    })

    it('should return null when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await service.getProfile()

      expect(result).toBeNull()
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should return null when database error occurs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.single.mockResolvedValue({ data: null, error: { message: 'DB error' } })

      const result = await service.getProfile()

      expect(result).toBeNull()
      expect(mockLogger.error).toHaveBeenCalledWith('Error fetching profile', {
        message: 'DB error',
      })
    })

    it('should handle exceptions and return null', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Auth error'))

      const result = await service.getProfile()

      expect(result).toBeNull()
      expect(mockLogger.error).toHaveBeenCalledWith('Profile fetch error', expect.any(Error))
    })
  })

  describe('updateProfile', () => {
    const mockUser = { id: 'user-123' }
    const updateData = { name: 'Updated Name', bio: 'Updated bio' }

    it('should update profile successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.eq.mockResolvedValue({ error: null })

      const result = await service.updateProfile(updateData)

      expect(result).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockFrom.update).toHaveBeenCalledWith(updateData)
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'user-123')
    })

    it('should return false when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await service.updateProfile(updateData)

      expect(result).toBe(false)
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should return false when database error occurs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.eq.mockResolvedValue({ error: { message: 'Update failed' } })

      const result = await service.updateProfile(updateData)

      expect(result).toBe(false)
      // Logger is used instead of console.error
    })

    it('should handle exceptions and return false', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Auth error'))

      const result = await service.updateProfile(updateData)

      expect(result).toBe(false)
      // Logger is used instead of console.error
    })
  })

  describe('getPreferences', () => {
    const mockUser = { id: 'user-123' }
    const mockPreferences: UserPreferences = {
      theme: 'dark',
      language: 'pt',
      notifications_enabled: true,
      email_notifications: false,
    }

    it('should fetch user preferences successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.single.mockResolvedValue({ data: mockPreferences, error: null })

      const result = await service.getPreferences()

      expect(result).toEqual(mockPreferences)
      expect(mockSupabase.from).toHaveBeenCalledWith('user_preferences')
      expect(mockFrom.select).toHaveBeenCalledWith(
        'theme, language, notifications_enabled, email_notifications'
      )
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123')
    })

    it('should return null when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await service.getPreferences()

      expect(result).toBeNull()
    })

    it('should return null when database error occurs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.single.mockResolvedValue({ data: null, error: { message: 'DB error' } })

      const result = await service.getPreferences()

      expect(result).toBeNull()
      // Logger is used instead of console.error
    })

    it('should handle exceptions and return null', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Auth error'))

      const result = await service.getPreferences()

      expect(result).toBeNull()
      // Logger is used instead of console.error
    })
  })

  describe('updatePreferences', () => {
    const mockUser = { id: 'user-123' }

    it('should update preferences successfully and apply theme', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.eq.mockResolvedValue({ error: null })

      const updateData = { theme: 'dark' as const }
      const result = await service.updatePreferences(updateData)

      expect(result).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('user_preferences')
      expect(mockFrom.update).toHaveBeenCalledWith(updateData)
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark', true)
    })

    it('should handle auto theme based on system preference', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.eq.mockResolvedValue({ error: null })

      // Mock dark mode preference
      ;(window.matchMedia as any).mockReturnValue({ matches: true })

      const updateData = { theme: 'auto' as const }
      const result = await service.updatePreferences(updateData)

      expect(result).toBe(true)
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark', true)
    })

    it('should update preferences without theme change', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.eq.mockResolvedValue({ error: null })

      const updateData = { language: 'en' as const }
      const result = await service.updatePreferences(updateData)

      expect(result).toBe(true)
      expect(document.documentElement.classList.toggle).not.toHaveBeenCalled()
    })

    it('should return false when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await service.updatePreferences({ theme: 'dark' })

      expect(result).toBe(false)
    })

    it('should return false when database error occurs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockFrom.eq.mockResolvedValue({ error: { message: 'Update failed' } })

      const result = await service.updatePreferences({ theme: 'dark' })

      expect(result).toBe(false)
      // Logger is used instead of console.error
    })

    it('should handle exceptions and return false', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Auth error'))

      const result = await service.updatePreferences({ theme: 'dark' })

      expect(result).toBe(false)
      // Logger is used instead of console.error
    })
  })

  describe('uploadAvatar', () => {
    const mockUser = { id: 'user-123' }
    const mockFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' })

    beforeEach(() => {
      vi.spyOn(Date, 'now').mockReturnValue(1234567890)
    })

    it('should upload avatar successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockStorage.upload.mockResolvedValue({ data: { path: 'test-path' }, error: null })
      mockStorage.getPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://example.com/avatar.jpg' },
      })

      const result = await service.uploadAvatar(mockFile)

      expect(result).toBe('https://example.com/avatar.jpg')
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('avatars')
      expect(mockStorage.upload).toHaveBeenCalledWith('user-123/avatar-1234567890.jpg', mockFile, {
        cacheControl: '3600',
        upsert: true,
      })
      expect(mockStorage.getPublicUrl).toHaveBeenCalledWith('user-123/avatar-1234567890.jpg')
    })

    it('should handle files without extension', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockStorage.upload.mockResolvedValue({ data: { path: 'test-path' }, error: null })
      mockStorage.getPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://example.com/avatar' },
      })

      const fileWithoutExt = new File(['content'], 'avatar', { type: 'image/jpeg' })
      const result = await service.uploadAvatar(fileWithoutExt)

      expect(result).toBe('https://example.com/avatar')
      expect(mockStorage.upload).toHaveBeenCalledWith(
        'user-123/avatar-1234567890.avatar',
        fileWithoutExt,
        expect.any(Object)
      )
    })

    it('should return null when user not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

      const result = await service.uploadAvatar(mockFile)

      expect(result).toBeNull()
      expect(mockSupabase.storage.from).not.toHaveBeenCalled()
    })

    it('should return null when upload fails', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      mockStorage.upload.mockResolvedValue({ data: null, error: { message: 'Upload failed' } })

      const result = await service.uploadAvatar(mockFile)

      expect(result).toBeNull()
      // Logger is used instead of console.error
    })

    it('should handle exceptions and return null', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Auth error'))

      const result = await service.uploadAvatar(mockFile)

      expect(result).toBeNull()
      // Logger is used instead of console.error
    })
  })

  describe('applyTheme', () => {
    it('should apply light theme', () => {
      ;(service as any).applyTheme('light')

      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark', false)
    })

    it('should apply dark theme', () => {
      ;(service as any).applyTheme('dark')

      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark', true)
    })

    it('should apply auto theme based on system preference - light mode', () => {
      ;(window.matchMedia as any).mockReturnValue({ matches: false })

      ;(service as any).applyTheme('auto')

      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark', false)
    })

    it('should apply auto theme based on system preference - dark mode', () => {
      ;(window.matchMedia as any).mockReturnValue({ matches: true })

      ;(service as any).applyTheme('auto')

      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark', true)
    })
  })
})
