import { createClient } from './client'
import { logger } from '@/lib/utils/logger'

/**
 * Supabase Auth Helpers
 *
 * Funções auxiliares para autenticação OAuth e gerenciamento de sessão
 */

/**
 * Login com Google OAuth
 */
export async function signInWithGoogle() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=/pt/app`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    logger.error(error, { provider: 'google', action: 'signInWithOAuth' })
    throw error
  }

  return data
}

/**
 * Login com GitHub OAuth
 */
export async function signInWithGithub() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=/pt/app`,
    },
  })

  if (error) {
    logger.error(error, { provider: 'github', action: 'signInWithOAuth' })
    throw error
  }

  return data
}

/**
 * Login com Spotify OAuth 🎵
 *
 * Configuração Supabase:
 * - Provider: Spotify
 * - Callback URL: https://pbsiyuattnwgohvkkkks.supabase.co/auth/v1/callback
 * - Scopes: user-read-email (padrão)
 */
export async function signInWithSpotify() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'spotify',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=/pt/app`,
      scopes: 'user-read-email user-read-private',
    },
  })

  if (error) {
    logger.error(error, { provider: 'spotify', action: 'signInWithOAuth' })
    throw error
  }

  return data
}

/**
 * Login com Facebook OAuth 👥
 *
 * Configuração Supabase:
 * - Provider: Facebook
 * - Callback URL: https://pbsiyuattnwgohvkkkks.supabase.co/auth/v1/callback
 * - Scopes: email, public_profile (padrão)
 */
export async function signInWithFacebook() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=/pt/app`,
      scopes: 'email public_profile',
    },
  })

  if (error) {
    logger.error(error, { provider: 'facebook', action: 'signInWithOAuth' })
    throw error
  }

  return data
}

/**
 * Logout
 */
export async function signOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    logger.error(error, { action: 'signOut' })
    throw error
  }

  // Redireciona para landing page
  window.location.href = '/pt'
}

/**
 * Verifica se usuário está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()

  return !!session
}

/**
 * Obtém usuário atual
 */
export async function getCurrentUser() {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    logger.error(error, { action: 'getCurrentUser' })
    return null
  }

  return user
}
