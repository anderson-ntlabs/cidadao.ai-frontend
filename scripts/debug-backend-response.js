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

  for (const message of testMessages) {
    console.log(`\n📤 Testing message: "${message}"`);
    
    try {
      const response = await axios.post(`${API_URL}/api/v1/chat/message`, {
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
    
    console.log('\n' + '='.repeat(60));
  }
}

debugBackendResponse().catch(console.error);