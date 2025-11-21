/**
 * Ensure HTTPS URL
 *
 * Utility to ensure URLs always use HTTPS protocol
 * to prevent Mixed Content errors in production
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-11-21
 */

/**
 * Ensures a URL uses HTTPS protocol
 *
 * @param url - The URL to check/fix
 * @returns URL with HTTPS protocol
 */
export function ensureHttps(url: string | undefined | null): string {
  if (!url) {
    return 'https://cidadao-api-production.up.railway.app'
  }

  // If URL starts with http://, replace with https://
  if (url.startsWith('http://')) {
    return url.replace(/^http:/, 'https:')
  }

  // If URL doesn't start with protocol, add https://
  if (!url.startsWith('http')) {
    return `https://${url}`
  }

  return url
}

/**
 * Get API URL with HTTPS guaranteed
 *
 * @returns API URL with HTTPS protocol
 */
export function getSecureApiUrl(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://cidadao-api-production.up.railway.app'

  return ensureHttps(apiUrl)
}

/**
 * Check if URL is using secure protocol
 *
 * @param url - URL to check
 * @returns true if URL uses HTTPS
 */
export function isSecureUrl(url: string): boolean {
  return url.startsWith('https://')
}

/**
 * Fix Mixed Content issues by ensuring all API URLs use HTTPS
 *
 * @param config - Fetch config object
 * @returns Config with HTTPS URL
 */
export function ensureSecureFetch(
  url: string,
  config?: RequestInit
): [string, RequestInit | undefined] {
  return [ensureHttps(url), config]
}
