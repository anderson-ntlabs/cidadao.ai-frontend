#!/usr/bin/env node

/**
 * Test Maritaca.ai Direct Integration
 *
 * This script tests the Maritaca direct chat endpoint with both models
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function header(title) {
  const line = '='.repeat(60);
  log(`\n${line}`, colors.cyan);
  log(title, colors.bright + colors.cyan);
  log(`${line}\n`, colors.cyan);
}

async function testMaritacaModel(model, testMessage) {
  log(`\n🧪 Testing with ${model}...`, colors.yellow);

  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/direct/maritaca`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: testMessage
          }
        ],
        session_id: `test_maritaca_${Date.now()}`,
        model: model,
      }),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      log(`❌ Request failed (${response.status}): ${errorText}`, colors.red);
      return false;
    }

    const data = await response.json();

    log(`✅ Response received (${duration}ms)`, colors.green);

    // Debug: Show full response structure
    log(`\n🔍 Full Response Structure:`, colors.bright);
    log(JSON.stringify(data, null, 2), colors.blue);

    log(`\n📊 Response Details:`, colors.bright);
    log(`   Model Used: ${data.model}`, colors.blue);
    log(`   Session ID: ${data.session_id}`, colors.blue);
    log(`   Message ID: ${data.message_id}`, colors.blue);
    if (data.processing_time) {
      log(`   Processing Time: ${data.processing_time}ms`, colors.blue);
    }
    if (data.metadata?.tokens_used) {
      log(`   Tokens Used: ${data.metadata.tokens_used}`, colors.blue);
    }

    log(`\n💬 Response Message:`, colors.bright);
    log(`   ${data.response}`, colors.cyan);
    log(`\n📏 Response Length: ${data.response?.length || 0} characters`, colors.blue);

    // Check if response seems truncated
    const lastChars = data.response?.slice(-50) || '';
    log(`\n📝 Last 50 characters: "${lastChars}"`, colors.yellow);

    // Check for common truncation indicators
    const seemsTruncated = !data.response?.endsWith('.') &&
                          !data.response?.endsWith('!') &&
                          !data.response?.endsWith('?') &&
                          data.response?.length > 100;

    if (seemsTruncated) {
      log(`\n⚠️  WARNING: Response may be truncated (doesn't end with punctuation)`, colors.yellow);
    }

    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    log(`❌ Test failed after ${duration}ms: ${error.message}`, colors.red);
    return false;
  }
}

async function runTests() {
  header('🤖 MARITACA.AI INTEGRATION TEST');

  log(`📍 Testing against: ${API_BASE_URL}`, colors.bright);
  log(`📅 Date: ${new Date().toISOString()}\n`, colors.bright);

  const testMessage = 'Olá! Como você pode me ajudar a entender gastos públicos?';
  log(`📝 Test Message: "${testMessage}"\n`, colors.yellow);

  // Test 1: Sabiazinho-3 (Optimized)
  header('TEST 1: Sabiazinho-3 (Optimized Model)');
  const test1 = await testMaritacaModel('sabiazinho-3', testMessage);

  // Wait a bit between requests
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Sabiá-3 (Standard)
  header('TEST 2: Sabiá-3 (Standard Model)');
  const test2 = await testMaritacaModel('sabia-3', testMessage);

  // Summary
  header('📊 TEST SUMMARY');
  log(`Sabiazinho-3: ${test1 ? '✅ PASSED' : '❌ FAILED'}`, test1 ? colors.green : colors.red);
  log(`Sabiá-3: ${test2 ? '✅ PASSED' : '❌ FAILED'}`, test2 ? colors.green : colors.red);

  const allPassed = test1 && test2;
  log(`\n${allPassed ? '✅ All tests PASSED' : '❌ Some tests FAILED'}`, allPassed ? colors.green : colors.red);

  header('🎯 NEXT STEPS');
  if (allPassed) {
    log('✅ Maritaca integration is working correctly!', colors.green);
    log('✅ Both models (sabiazinho-3 and sabia-3) are operational', colors.green);
    log('\n🚀 You can now use the model selector in the chat interface', colors.bright);
  } else {
    log('❌ Some tests failed. Please check:', colors.red);
    log('   1. Backend API is accessible', colors.yellow);
    log('   2. Maritaca endpoint is deployed', colors.yellow);
    log('   3. API keys are configured correctly', colors.yellow);
  }

  log(''); // Empty line at end
}

// Run tests
runTests().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, colors.red);
  process.exit(1);
});
