/**
 * Tests for useBadge hook
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBadge } from '../use-badge'

// Mock badge store
const mockBadges: any[] = []
const mockLoadBadges = vi.fn()
const mockHasBadge = vi.fn().mockReturnValue(false)
const mockGetBadge = vi.fn()
const mockShowNewBadgeAnimation = vi.fn()
const mockClearNewBadgeAnimation = vi.fn()

const mockBadgeStore = {
  badges: mockBadges,
  isLoading: false,
  newBadgeAnimation: null as any,
  loadBadges: mockLoadBadges,
  hasBadge: mockHasBadge,
  getBadge: mockGetBadge,
  showNewBadgeAnimation: mockShowNewBadgeAnimation,
  clearNewBadgeAnimation: mockClearNewBadgeAnimation,
}

vi.mock('@/store/badge-store', () => ({
  useBadgeStore: () => mockBadgeStore,
  selectHasColaboradorBadge: vi.fn(),
  selectBadgeCount: vi.fn(),
}))

vi.mock('@/data/badges', () => ({
  BADGES: {
    colaborador: {
      type: 'colaborador',
      name_pt: 'Colaborador',
      name_en: 'Collaborator',
      description_pt: 'Você contribuiu para a plataforma',
      description_en: 'You contributed to the platform',
      icon: 'medal',
      color: 'gold',
      rarity: 'common',
    },
    primeiro_contato: {
      type: 'primeiro_contato',
      name_pt: 'Primeiro Contato',
      name_en: 'First Contact',
      description_pt: 'Iniciou sua primeira conversa',
      description_en: 'Started your first conversation',
      icon: 'message',
      color: 'blue',
      rarity: 'common',
    },
  },
}))

describe('useBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBadges.length = 0
    mockBadgeStore.isLoading = false
    mockBadgeStore.newBadgeAnimation = null
    mockHasBadge.mockReturnValue(false)
  })

  describe('State', () => {
    it('returns badges from store', () => {
      const testBadges = [{ id: '1', badge_type: 'colaborador' }]
      mockBadges.push(...testBadges)

      const { result } = renderHook(() => useBadge())

      expect(result.current.badges).toEqual(testBadges)
    })

    it('returns isLoading from store', () => {
      mockBadgeStore.isLoading = true

      const { result } = renderHook(() => useBadge())

      expect(result.current.isLoading).toBe(true)
    })

    it('returns badgeCount', () => {
      mockBadges.push({ id: '1' }, { id: '2' }, { id: '3' })

      const { result } = renderHook(() => useBadge())

      expect(result.current.badgeCount).toBe(3)
    })

    it('returns hasCollaboratorBadge false when user does not have badge', () => {
      mockHasBadge.mockReturnValue(false)

      const { result } = renderHook(() => useBadge())

      expect(result.current.hasCollaboratorBadge).toBe(false)
    })

    it('returns hasCollaboratorBadge true when user has badge', () => {
      mockHasBadge.mockReturnValue(true)

      const { result } = renderHook(() => useBadge())

      expect(result.current.hasCollaboratorBadge).toBe(true)
    })

    it('returns hasAnimation false when no animation', () => {
      mockBadgeStore.newBadgeAnimation = null

      const { result } = renderHook(() => useBadge())

      expect(result.current.hasAnimation).toBe(false)
    })

    it('returns hasAnimation true when animation active', () => {
      mockBadgeStore.newBadgeAnimation = { badge_type: 'colaborador' }

      const { result } = renderHook(() => useBadge())

      expect(result.current.hasAnimation).toBe(true)
    })

    it('returns newBadgeAnimation from store', () => {
      const animation = { badge_type: 'colaborador' }
      mockBadgeStore.newBadgeAnimation = animation

      const { result } = renderHook(() => useBadge())

      expect(result.current.newBadgeAnimation).toEqual(animation)
    })
  })

  describe('getBadgeInfo', () => {
    it('returns badge info in Portuguese by default', () => {
      const { result } = renderHook(() => useBadge())

      const info = result.current.getBadgeInfo('colaborador')

      expect(info?.name).toBe('Colaborador')
      expect(info?.description).toBe('Você contribuiu para a plataforma')
    })

    it('returns badge info in Portuguese when locale is pt', () => {
      const { result } = renderHook(() => useBadge())

      const info = result.current.getBadgeInfo('colaborador', 'pt')

      expect(info?.name).toBe('Colaborador')
      expect(info?.description).toBe('Você contribuiu para a plataforma')
    })

    it('returns badge info in English when locale is en', () => {
      const { result } = renderHook(() => useBadge())

      const info = result.current.getBadgeInfo('colaborador', 'en')

      expect(info?.name).toBe('Collaborator')
      expect(info?.description).toBe('You contributed to the platform')
    })

    it('returns full badge info structure', () => {
      const { result } = renderHook(() => useBadge())

      const info = result.current.getBadgeInfo('colaborador')

      expect(info).toEqual({
        type: 'colaborador',
        name: 'Colaborador',
        description: 'Você contribuiu para a plataforma',
        icon: 'medal',
        color: 'gold',
        rarity: 'common',
      })
    })

    it('returns null for unknown badge type', () => {
      const { result } = renderHook(() => useBadge())

      const info = result.current.getBadgeInfo('unknown' as any)

      expect(info).toBeNull()
    })

    it('works with primeiro_contato badge', () => {
      const { result } = renderHook(() => useBadge())

      const info = result.current.getBadgeInfo('primeiro_contato')

      expect(info?.name).toBe('Primeiro Contato')
    })
  })

  describe('Actions', () => {
    it('loadBadges calls store loadBadges', () => {
      const { result } = renderHook(() => useBadge())

      act(() => {
        result.current.loadBadges()
      })

      expect(mockLoadBadges).toHaveBeenCalled()
    })

    it('hasBadge calls store hasBadge', () => {
      const { result } = renderHook(() => useBadge())

      result.current.hasBadge('colaborador')

      expect(mockHasBadge).toHaveBeenCalledWith('colaborador')
    })

    it('getBadge calls store getBadge', () => {
      const { result } = renderHook(() => useBadge())

      result.current.getBadge('colaborador')

      expect(mockGetBadge).toHaveBeenCalledWith('colaborador')
    })

    it('showNewBadgeAnimation calls store showNewBadgeAnimation', () => {
      const { result } = renderHook(() => useBadge())

      act(() => {
        result.current.showNewBadgeAnimation('colaborador')
      })

      expect(mockShowNewBadgeAnimation).toHaveBeenCalledWith('colaborador')
    })

    it('clearNewBadgeAnimation calls store clearNewBadgeAnimation', () => {
      const { result } = renderHook(() => useBadge())

      act(() => {
        result.current.clearNewBadgeAnimation()
      })

      expect(mockClearNewBadgeAnimation).toHaveBeenCalled()
    })
  })
})
