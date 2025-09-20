#!/usr/bin/env node
import { sendChatMessage } from '../lib/api/chat-adapter-v2';

async function testChatIntegration() {
  console.log('=== Testing Chat Integration ===\n');
  
  const testMessages = [
    { message: 'Olá', description: 'Simple greeting' },
    { message: 'Como você funciona?', description: 'About system question' },
    { message: 'Quero investigar contratos suspeitos', description: 'Investigation request' },
  ];

  for (const test of testMessages) {
    console.log(`\nTest: ${test.description}`);
    console.log(`Message: "${test.message}"`);
    console.log('-'.repeat(50));
    
    try {
      const response = await sendChatMessage({
        message: test.message,
        session_id: 'test-session-' + Date.now(),
      });
      
      console.log('✅ Success!');
      console.log(`Agent: ${response.agent_name} (${response.agent_id})`);
      console.log(`Response: ${response.message.substring(0, 100)}...`);
      console.log(`Confidence: ${response.confidence}`);
      console.log(`Metadata:`, response.metadata);
      
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  testChatIntegration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

export { testChatIntegration };