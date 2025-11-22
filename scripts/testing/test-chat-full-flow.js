#!/usr/bin/env node

/**
 * Test complete chat flow from frontend perspective
 */

const axios = require('axios')

const BACKEND = 'https://cidadao-api-production.up.railway.app'
const FRONTEND = 'http://localhost:3000'

async function testBackendDirect() {
  console.log('\n🔵 Testing Backend Directly...')

  try {
    const response = await axios.post(`${BACKEND}/api/v1/chat/stable`, {
      message: 'quanto é 2 + 2?',
      session_id: 'test_direct',
    })

    console.log('✅ Backend Response:', {
      message: response.data.message?.substring(0, 100),
      agent: response.data.agent_name,
      confidence: response.data.confidence,
    })

    return true
  } catch (error) {
    console.error('❌ Backend Error:', error.message)
    return false
  }
}

async function testFrontendAPI() {
  console.log('\n🟢 Testing Frontend API Route...')

  try {
    // Simulate what the frontend does
    const response = await axios.post(
      `${BACKEND}/api/v1/chat/stable`,
      {
        message: 'quanto é 2 + 2?',
        session_id: 'test_frontend',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 30000,
      }
    )

    console.log('✅ Frontend-style Response:', {
      hasMessage: !!response.data.message,
      messageLength: response.data.message?.length,
      isEmpty: !response.data.message || response.data.message.trim().length === 0,
      preview: response.data.message?.substring(0, 150),
    })

    // Check if message would be rejected
    const messageText = response.data.message || response.data.response || ''

    if (!messageText || messageText.trim().length === 0) {
      console.log('⚠️  WOULD BE REJECTED: Empty message')
      return false
    }

    console.log('✅ Message is valid and would be accepted')
    return true
  } catch (error) {
    console.error('❌ Frontend API Error:', error.message)
    if (error.response) {
      console.log('Response status:', error.response.status)
      console.log('Response data:', error.response.data)
    }
    return false
  }
}

async function main() {
  console.log('🚀 Testing Chat Full Flow\n')
  console.log(`Backend: ${BACKEND}`)
  console.log(`Frontend: ${FRONTEND}\n`)

  const backendOk = await testBackendDirect()
  const frontendOk = await testFrontendAPI()

  console.log('\n📊 Results:')
  console.log(`Backend Direct: ${backendOk ? '✅' : '❌'}`)
  console.log(`Frontend API: ${frontendOk ? '✅' : '❌'}`)

  if (backendOk && !frontendOk) {
    console.log('\n⚠️  Backend works but frontend would reject the response!')
    console.log('Check frontend validation logic in chat-adapter-backend.ts')
  }
}

main().catch(console.error)
