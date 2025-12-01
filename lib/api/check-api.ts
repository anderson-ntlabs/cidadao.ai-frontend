// Script to check API availability
import { createLogger } from '@/lib/logger'

const logger = createLogger('CheckApi')

export async function checkAPIEndpoints() {
  const baseUrls = [
    // Standard HuggingFace Spaces format
    'https://cidadao-api-production.up.railway.app',
    // Alternative formats
    'https://neural-thinker-cidadaoai-backend.hf.space',
    'https://neuralthinker-cidadao-ai-backend.hf.space',
    // Check saved URL from discovery
    localStorage.getItem('backend_url'),
  ].filter(Boolean)

  for (const baseUrl of baseUrls) {
    if (!baseUrl) continue
    logger.info(`\nTesting ${baseUrl}...`)

    // Test health endpoint first (more reliable)
    // Use trailing slash to avoid 307 redirect that causes Mixed Content
    try {
      const healthResponse = await fetch(`${baseUrl}/health/`)
      logger.info(`${baseUrl}/health/ - Status: ${healthResponse.status}`)
      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        logger.info('Health check passed:', healthData)
      }
    } catch (error) {
      console.error(`${baseUrl}/health/ - Error:`, error)
    }

    // Test root
    try {
      const response = await fetch(baseUrl)
      logger.info(`${baseUrl} - Status: ${response.status}`)
      if (response.ok) {
        const text = await response.text()
        logger.info(`Response preview: ${text.substring(0, 100)}...`)
      }
    } catch (error) {
      console.error(`${baseUrl} - Error:`, error)
    }

    // Test /docs
    try {
      const docsResponse = await fetch(`${baseUrl}/docs`)
      logger.info(`${baseUrl}/docs - Status: ${docsResponse.status}`)
    } catch (error) {
      console.error(`${baseUrl}/docs - Error:`, error)
    }

    // Test API endpoint
    try {
      const apiResponse = await fetch(`${baseUrl}/api/v1/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'test',
          session_id: 'test',
        }),
      })
      logger.info(`${baseUrl}/api/v1/chat/message - Status: ${apiResponse.status}`)
      if (!apiResponse.ok) {
        const text = await apiResponse.text()
        logger.info(`Error response: ${text.substring(0, 200)}...`)
      }
    } catch (error) {
      console.error(`${baseUrl}/api/v1/chat/message - Error:`, error)
    }
  }
}
