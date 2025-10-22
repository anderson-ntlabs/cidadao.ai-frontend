/**
 * Live Chat Integration Test
 * Tests the fixed chat endpoint directly against the backend
 */

const API_URL = 'https://cidadao-api-production.up.railway.app';

async function testChatEndpoint() {
  console.log('🧪 Testing Chat Integration After Fix\n');
  console.log(`Backend URL: ${API_URL}`);
  console.log(`Testing endpoint: POST /api/v1/chat/message\n`);

  const testMessage = {
    message: 'Olá, como você pode me ajudar?',
    session_id: `test_${Date.now()}`,
    context: {
      locale: 'pt'
    }
  };

  console.log('📤 Sending message:', testMessage.message);

  try {
    const startTime = Date.now();

    const response = await fetch(`${API_URL}/api/v1/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });

    const duration = Date.now() - startTime;

    console.log(`⏱️  Response time: ${duration}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Request failed:', errorText);
      return false;
    }

    const data = await response.json();

    console.log('✅ Success! Backend Response:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Agent: ${data.agent_name} (${data.agent_id})`);
    console.log(`Message: ${data.message}`);
    console.log(`Confidence: ${data.confidence}`);
    console.log(`Session ID: ${data.session_id}`);

    if (data.suggested_actions && data.suggested_actions.length > 0) {
      console.log(`\nSuggested Actions:`);
      data.suggested_actions.forEach(action => console.log(`  • ${action}`));
    }

    if (data.metadata) {
      console.log(`\nMetadata:`);
      console.log(JSON.stringify(data.metadata, null, 2));
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

async function testMultipleMessages() {
  console.log('\n🔄 Testing Multiple Message Types:\n');

  const testCases = [
    { message: 'Olá', description: 'Greeting' },
    { message: 'Quais dados você tem sobre licitações?', description: 'Question about data' },
    { message: 'Me ajude a investigar anomalias', description: 'Investigation request' },
  ];

  const results = [];

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.description}`);
    console.log(`Message: "${testCase.message}"`);

    try {
      const response = await fetch(`${API_URL}/api/v1/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testCase.message,
          session_id: `test_${Date.now()}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${data.agent_name}: ${data.message.substring(0, 100)}...`);
        results.push({ test: testCase.description, passed: true });
      } else {
        console.log(`❌ Failed with status ${response.status}`);
        results.push({ test: testCase.description, passed: false });
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      results.push({ test: testCase.description, passed: false });
    }

    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Test Results Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.test}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const passedCount = results.filter(r => r.passed).length;
  console.log(`\nPassed: ${passedCount}/${results.length}`);

  return passedCount === results.length;
}

async function main() {
  console.log('🚀 Cidadão.AI Chat Integration Test\n');
  console.log('Testing after endpoint fix: /stable → /message\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test basic chat
  const basicTestPassed = await testChatEndpoint();

  if (!basicTestPassed) {
    console.log('\n❌ Basic test failed. Stopping here.');
    process.exit(1);
  }

  // Test multiple messages
  const multiTestPassed = await testMultipleMessages();

  if (multiTestPassed) {
    console.log('\n🎉 All tests passed! Chat integration is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the results above.');
    process.exit(1);
  }
}

main();
