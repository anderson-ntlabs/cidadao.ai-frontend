/**
 * GitHub API Integration for Agora
 *
 * Handles GitHub fork verification for onboarding.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-08
 */

import { createLogger } from '@/lib/logger'

const logger = createLogger('GitHubAPI')

// Repository to verify fork
const REPO_OWNER = 'anderson-ufrj'
const REPO_NAME = 'cidadao.ai-frontend'

interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  html_url: string
}

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  owner: GitHubUser
  fork: boolean
  html_url: string
}

interface GitHubFork {
  id: number
  name: string
  full_name: string
  owner: GitHubUser
  html_url: string
  created_at: string
}

interface VerifyForkResult {
  success: boolean
  message: string
  forkUrl?: string
}

/**
 * Check if a user has forked the Cidadao.AI repository
 *
 * Tries multiple methods:
 * 1. Check if user has a repo with the same name (most common)
 * 2. Check the original repo's forks list (requires more API calls)
 */
export async function verifyGitHubFork(username: string): Promise<VerifyForkResult> {
  if (!username || username.trim() === '') {
    return {
      success: false,
      message: 'Nome de usuario do GitHub nao fornecido',
    }
  }

  const cleanUsername = username.trim().replace('@', '')

  try {
    // Method 1: Check if user has a repo with the expected name
    const userRepoUrl = `https://api.github.com/repos/${cleanUsername}/${REPO_NAME}`
    const userRepoResponse = await fetch(userRepoUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Cidadao.AI-Frontend',
      },
    })

    if (userRepoResponse.ok) {
      const repo: GitHubRepo = await userRepoResponse.json()

      // Check if it's actually a fork (not an original repo with same name)
      if (repo.fork) {
        // Verify it's a fork of our repo by checking parent
        const repoDetailsUrl = `https://api.github.com/repos/${cleanUsername}/${REPO_NAME}`
        const detailsResponse = await fetch(repoDetailsUrl, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Cidadao.AI-Frontend',
          },
        })

        if (detailsResponse.ok) {
          const details = await detailsResponse.json()
          const parent = details.parent

          if (parent && parent.full_name === `${REPO_OWNER}/${REPO_NAME}`) {
            return {
              success: true,
              message: `Fork verificado com sucesso!`,
              forkUrl: repo.html_url,
            }
          }
        }

        // It's a fork but we couldn't verify the parent - still accept
        return {
          success: true,
          message: `Fork encontrado!`,
          forkUrl: repo.html_url,
        }
      }

      // User has a repo with the same name but it's not a fork
      return {
        success: false,
        message: `Voce tem um repositorio ${REPO_NAME}, mas nao e um fork do projeto Cidadao.AI`,
      }
    }

    // Method 2: Check the forks list of the original repo
    // This is more expensive API-wise, so we do it as fallback
    const forksUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/forks?per_page=100`
    const forksResponse = await fetch(forksUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Cidadao.AI-Frontend',
      },
    })

    if (forksResponse.ok) {
      const forks: GitHubFork[] = await forksResponse.json()
      const userFork = forks.find(
        (fork) => fork.owner.login.toLowerCase() === cleanUsername.toLowerCase()
      )

      if (userFork) {
        return {
          success: true,
          message: `Fork verificado com sucesso!`,
          forkUrl: userFork.html_url,
        }
      }
    }

    // User hasn't forked the repo
    return {
      success: false,
      message: `Nao encontramos um fork do repositorio ${REPO_OWNER}/${REPO_NAME} na sua conta. Por favor, faca o fork primeiro.`,
    }
  } catch (error) {
    logger.error('GitHub API error', { error })

    // On API error, we give benefit of the doubt to the user
    // This prevents blocking users due to GitHub rate limits
    return {
      success: true,
      message: 'Verificacao automatica indisponivel. Fork aceito provisoriamente.',
    }
  }
}

/**
 * Check if a GitHub username exists
 */
export async function checkGitHubUsername(username: string): Promise<boolean> {
  if (!username || username.trim() === '') {
    return false
  }

  const cleanUsername = username.trim().replace('@', '')

  try {
    const response = await fetch(`https://api.github.com/users/${cleanUsername}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Cidadao.AI-Frontend',
      },
    })

    return response.ok
  } catch {
    return false
  }
}

/**
 * Get the URL for forking the repository
 */
export function getForkUrl(): string {
  return `https://github.com/${REPO_OWNER}/${REPO_NAME}/fork`
}

/**
 * Get the repository URL
 */
export function getRepoUrl(): string {
  return `https://github.com/${REPO_OWNER}/${REPO_NAME}`
}
