// Direct API test without wrapper
import { createLogger } from '@/lib/logger'

const logger = createLogger('ChatDirect')

import { API_BASE_URL } from './client'

export async function testDirectAPI() {
  const testUrl = `${API_BASE_URL}/api/v1/chat/message`
  logger.info('Testing direct API call to:', testUrl)

  try {
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        message: 'teste',
        session_id: 'test-session',
      }),
    })

    logger.info('Response status:', response.status)
    logger.info('Response headers:', Object.fromEntries(response.headers.entries()))

    const text = await response.text()
    logger.info('Response text:', text)

    if (response.ok) {
      try {
        const data = JSON.parse(text)
        logger.info('Parsed response:', data)
        return data
      } catch (e) {
        console.error('Failed to parse JSON:', e)
        return null
      }
    } else {
      console.error('Response not OK:', response.status, text)
      return null
    }
  } catch (error) {
    console.error('Fetch error:', error)
    return null
  }
}

// Test the API endpoint availability
export async function testAPIHealth() {
  const healthUrl = `${API_BASE_URL}/`
  logger.info('Testing API health at:', healthUrl)

  try {
    const response = await fetch(healthUrl)
    const data = await response.text()
    logger.info('API health response:', data)
    return response.ok
  } catch (error) {
    console.error('API health check failed:', error)
    return false
  }
}
