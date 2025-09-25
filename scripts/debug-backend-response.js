const axios = require('axios');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://neural-thinker-cidadao-ai-backend.hf.space';

async function debugBackendResponse() {
  console.log('🔍 Debugging Backend Response Structure');
  console.log('API URL:', API_URL);
  console.log('----------------------------\n');

  const testMessages = [
    'Olá',
    'Como você pode me ajudar?',
    'Quero investigar contratos públicos',
    'Mostre transparência governamental'
  ];

  const endpoints = [
    '/api/v1/chat/stable',
    '/api/v1/chat/optimized', 
    '/api/v1/chat/emergency',
    '/api/v1/chat/simple'
  ];

  for (const endpoint of endpoints) {
    console.log(`\n🔗 Testing endpoint: ${endpoint}`);
    console.log('=' .repeat(50));
    
    for (const message of testMessages.slice(0, 2)) {
      console.log(`\n📤 Sending: "${message}"`);
      
      try {
        const response = await axios.post(`${API_URL}${endpoint}`, {
          message: message,
          session_id: `debug_${Date.now()}`
        }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 10000
      });
      
      console.log('✅ Status:', response.status);
      console.log('📥 Headers:', response.headers);
      console.log('\n📝 Full Response Data:');
      console.log(JSON.stringify(response.data, null, 2));
      
      // Analyze response structure
      console.log('\n🔍 Response Analysis:');
      console.log('- Has response field:', 'response' in response.data);
      console.log('- Has message field:', 'message' in response.data);
      console.log('- Response text:', response.data.response || response.data.message || 'N/A');
      console.log('- Agent used:', response.data.agent_used || 'N/A');
      console.log('- Session ID:', response.data.session_id || 'N/A');
          console.log('- Message ID:', response.data.message_id || 'N/A');
          
          // Check if it's a maintenance message
          const text = response.data.response || response.data.message || '';
          if (text.includes('manutenção') || text.includes('em breve')) {
            console.log('⚠️  MAINTENANCE MESSAGE DETECTED');
          }
          
        } catch (error) {
          console.error('❌ Request failed:', error.message);
          if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
          }
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

debugBackendResponse().catch(console.error);