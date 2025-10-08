#!/usr/bin/env node

/**
 * Test script to verify chat functionality with Railway backend
 */

const axios = require('axios');

const RAILWAY_BACKEND = 'https://cidadao-api-production.up.railway.app';

async function testChatEndpoint(endpoint, message) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${endpoint}`);
  console.log(`Message: "${message}"`);
  console.log('='.repeat(60));

  try {
    const startTime = Date.now();

    const response = await axios.post(
      `${RAILWAY_BACKEND}${endpoint}`,
      {
        message,
        session_id: `test_${Date.now()}`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const duration = Date.now() - startTime;

    console.log(`✅ Success in ${duration}ms`);
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));

    return { success: true, data: response.data, duration };
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    }
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('\n🚀 Testing Cidadão.AI Chat with Railway Backend');
  console.log(`Backend URL: ${RAILWAY_BACKEND}\n`);

  const endpoints = [
    { path: '/api/v1/chat/stable', name: 'Stable Chat (Primary)' },
    { path: '/api/v1/chat/message', name: 'Message Chat' },
    { path: '/api/v1/chat/simple', name: 'Simple Chat (Fallback)' },
  ];

  const testMessages = [
    'Olá!',
    'Me ajude a investigar contratos',
    'Quais são os agentes disponíveis?',
  ];

  for (const endpoint of endpoints) {
    for (const message of testMessages) {
      await testChatEndpoint(endpoint.path, message);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
    }
  }

  console.log('\n✅ Test completed!');
}

main().catch(console.error);