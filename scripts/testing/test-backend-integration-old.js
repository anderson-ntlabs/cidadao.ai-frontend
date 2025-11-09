const axios = require('axios')

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'

async function testBackendIntegration() {
  console.log('🔧 Testing Backend Integration')
  console.log('API URL:', API_URL)
  console.log('----------------------------\n')

  // Test 1: Health check
  console.log('1️⃣ Testing health endpoint...')
  try {
    const health = await axios.get(`${API_URL}/health`)
    console.log('✅ Health check passed:', health.data)
  } catch (error) {
    console.error('❌ Health check failed:', error.response?.data || error.message)
  }
  console.log()

  // Test 2: Chat message endpoint
  console.log('2️⃣ Testing chat message endpoint...')
  try {
    const chatResponse = await axios.post(
      `${API_URL}/api/v1/chat/message`,
      {
        message: 'Olá, como você pode me ajudar?',
        session_id: `test_${Date.now()}`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('✅ Chat response received:')
    console.log('- Response:', chatResponse.data.response?.substring(0, 100) + '...')
    console.log('- Session ID:', chatResponse.data.session_id)
    console.log('- Message ID:', chatResponse.data.message_id)
    console.log('- Agent Used:', chatResponse.data.agent_used)
    console.log('- Processing Time:', chatResponse.data.processing_time, 'ms')
  } catch (error) {
    console.error('❌ Chat request failed:', error.response?.data || error.message)
  }
  console.log()

  // Test 3: Check for Drummond
  console.log('3️⃣ Testing if Drummond is available...')
  try {
    const drummondResponse = await axios.post(
      `${API_URL}/api/v1/chat/message`,
      {
        message: 'Quem é Carlos Drummond de Andrade?',
        session_id: `drummond_test_${Date.now()}`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('✅ Agent response:', drummondResponse.data.agent_used)
    if (drummondResponse.data.agent_used.toLowerCase().includes('drummond')) {
      console.log('🎭 Drummond agent is active!')
    } else {
      console.log('🤖 Response from:', drummondResponse.data.agent_used)
    }
  } catch (error) {
    console.error('❌ Drummond test failed:', error.response?.data || error.message)
  }
}

// Run the test
testBackendIntegration().catch(console.error)
