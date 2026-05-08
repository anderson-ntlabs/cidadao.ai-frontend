/**
 * Tests for GitHub API Integration
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock logger
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    error: vi.fn(),
    debug: vi.fn(),
  }),
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

import { verifyGitHubFork, checkGitHubUsername, getForkUrl, getRepoUrl } from './github'

describe('GitHub API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('verifyGitHubFork', () => {
    it('should return error for empty username', async () => {
      const result = await verifyGitHubFork('')

      expect(result.success).toBe(false)
      expect(result.message).toContain('não fornecido')
    })

    it('should return error for whitespace username', async () => {
      const result = await verifyGitHubFork('   ')

      expect(result.success).toBe(false)
    })

    it('should clean @ from username', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ fork: true, html_url: 'https://github.com/testuser/repo' }),
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            parent: { full_name: 'anderson-ntlabs/cidadao.ai-frontend' },
          }),
      })

      await verifyGitHubFork('@testuser')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('testuser'),
        expect.any(Object)
      )
    })

    it('should verify fork successfully when repo is a verified fork', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            fork: true,
            html_url: 'https://github.com/testuser/cidadao.ai-frontend',
          }),
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            parent: { full_name: 'anderson-ntlabs/cidadao.ai-frontend' },
          }),
      })

      const result = await verifyGitHubFork('testuser')

      expect(result.success).toBe(true)
      expect(result.message).toContain('verificado')
      expect(result.forkUrl).toBe('https://github.com/testuser/cidadao.ai-frontend')
    })

    it('should accept fork when parent verification fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            fork: true,
            html_url: 'https://github.com/testuser/cidadao.ai-frontend',
          }),
      })
      mockFetch.mockResolvedValueOnce({
        ok: false,
      })

      const result = await verifyGitHubFork('testuser')

      expect(result.success).toBe(true)
      expect(result.message).toContain('Fork encontrado')
    })

    it('should reject when repo exists but is not a fork', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ fork: false }),
      })

      const result = await verifyGitHubFork('testuser')

      expect(result.success).toBe(false)
      expect(result.message).toContain('não é um fork')
    })

    it('should check forks list when user repo not found', async () => {
      // First call: user repo not found
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      })
      // Second call: check forks list
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            { owner: { login: 'testuser' }, html_url: 'https://github.com/testuser/repo' },
          ]),
      })

      const result = await verifyGitHubFork('testuser')

      expect(result.success).toBe(true)
      expect(result.forkUrl).toBe('https://github.com/testuser/repo')
    })

    it('should return error when fork not found in any method', async () => {
      // First call: user repo not found
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      })
      // Second call: check forks list - user not found
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ owner: { login: 'otheruser' } }]),
      })

      const result = await verifyGitHubFork('testuser')

      expect(result.success).toBe(false)
      expect(result.message).toContain('Não encontramos')
    })

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await verifyGitHubFork('testuser')

      expect(result.success).toBe(true)
      expect(result.message).toContain('indisponível')
    })
  })

  describe('checkGitHubUsername', () => {
    it('should return false for empty username', async () => {
      const result = await checkGitHubUsername('')

      expect(result).toBe(false)
    })

    it('should return false for whitespace username', async () => {
      const result = await checkGitHubUsername('   ')

      expect(result).toBe(false)
    })

    it('should return true for existing user', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      const result = await checkGitHubUsername('testuser')

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/users/testuser',
        expect.any(Object)
      )
    })

    it('should return false for non-existing user', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false })

      const result = await checkGitHubUsername('nonexistent')

      expect(result).toBe(false)
    })

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await checkGitHubUsername('testuser')

      expect(result).toBe(false)
    })

    it('should clean @ from username', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      await checkGitHubUsername('@testuser')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/users/testuser',
        expect.any(Object)
      )
    })
  })

  describe('getForkUrl', () => {
    it('should return correct fork URL', () => {
      const url = getForkUrl()

      expect(url).toBe('https://github.com/anderson-ntlabs/cidadao.ai-frontend/fork')
    })
  })

  describe('getRepoUrl', () => {
    it('should return correct repo URL', () => {
      const url = getRepoUrl()

      expect(url).toBe('https://github.com/anderson-ntlabs/cidadao.ai-frontend')
    })
  })
})
