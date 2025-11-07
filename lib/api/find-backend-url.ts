import { createLogger } from '@/lib/logger'

const logger = createLogger('FindBackendURL')

// Try to find the correct backend URL
export async function findBackendURL() {
  // Railway is the primary backend (HuggingFace Spaces is deprecated/offline)
  const possibleURLs = ['https://cidadao-api-production.up.railway.app']

  logger.info('Searching for backend URL')

  for (const url of possibleURLs) {
    logger.info('Trying backend URL', { url })

    try {
      // First try the root endpoint
      const rootResponse = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json, text/html',
        },
      })

      logger.info('Root endpoint response', { url, status: rootResponse.status })

      // If root returns 404, try /docs
      if (rootResponse.status === 404 || rootResponse.status === 200) {
        const docsResponse = await fetch(`${url}/docs`, {
          method: 'GET',
          headers: {
            Accept: 'text/html',
          },
        })

        logger.info('Docs endpoint response', { url, status: docsResponse.status })

        if (docsResponse.status === 200) {
          logger.info('Found working backend', { url })

          // Test if API endpoints work
          const apiTest = await fetch(`${url}/api/v1/chat/suggestions`, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          })

          logger.info('API test response', {
            url,
            endpoint: '/api/v1/chat/suggestions',
            status: apiTest.status,
          })

          if (apiTest.status !== 404) {
            return url
          }
        }
      }
    } catch (error) {
      logger.error('Backend URL connection failed', { url, error })
    }
  }

  // Fallback to Railway if no URL worked (shouldn't happen)
  logger.warn('No backend URL found from list, using Railway as fallback')
  const railwayUrl = 'https://cidadao-api-production.up.railway.app'

  try {
    const healthResponse = await fetch(`${railwayUrl}/health`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    logger.info('Railway health check', { status: healthResponse.status })

    if (healthResponse.ok) {
      logger.info('Railway backend is available', { url: railwayUrl })
      return railwayUrl
    }
  } catch (error) {
    logger.error('Failed to connect to Railway', { error })
  }

  logger.error('Could not find working backend URL')
  return null
}
