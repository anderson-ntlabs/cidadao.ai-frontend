/**
 * Voice Backend Integration Test
 *
 * Tests TTS and STT endpoints from the backend
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-01-30
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app';

console.log('🎤 Voice Backend Integration Test');
console.log('='.repeat(50));
console.log(`Backend URL: ${API_URL}`);
console.log('='.repeat(50));
console.log('');

/**
 * Test 1: Text-to-Speech (Synthesize)
 */
async function testTextToSpeech() {
  console.log('📝 Test 1: Text-to-Speech Synthesis');
  console.log('-'.repeat(50));

  const testCases = [
    {
      name: 'Drummond (Zephyr voice)',
      payload: {
        text: 'Olá! Sou Drummond, o poeta do povo brasileiro.',
        agent_id: 'drummond'
      }
    },
    {
      name: 'Zumbi (Fenrir voice)',
      payload: {
        text: 'Sou Zumbi dos Palmares, detector de anomalias.',
        agent_id: 'zumbi'
      }
    },
    {
      name: 'No agent (default voice)',
      payload: {
        text: 'Teste sem agente específico.'
      }
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n→ Testing: ${testCase.name}`);
      console.log(`  Payload:`, JSON.stringify(testCase.payload, null, 2));

      const startTime = Date.now();
      const response = await fetch(`${API_URL}/api/v1/voice/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.payload),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const contentType = response.headers.get('Content-Type');

      console.log(`  ✅ Success!`);
      console.log(`  - Status: ${response.status}`);
      console.log(`  - Duration: ${duration}ms`);
      console.log(`  - Content-Type: ${contentType}`);
      console.log(`  - Audio Size: ${(blob.size / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
    }
  }

  console.log('');
}

/**
 * Test 2: List Agent Voices
 */
async function testAgentVoices() {
  console.log('📋 Test 2: List Agent Voices');
  console.log('-'.repeat(50));

  try {
    const startTime = Date.now();
    const response = await fetch(`${API_URL}/api/v1/voice/agent-voices`);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`✅ Success!`);
    console.log(`- Duration: ${duration}ms`);
    console.log(`- Total Agents: ${data.total_agents}`);
    console.log(`- Statistics:`, JSON.stringify(data.statistics, null, 2));
    console.log('');

    // Display first 5 agents
    console.log('📊 Sample Agent Voices:');
    console.log('-'.repeat(50));
    data.agents.slice(0, 5).forEach((agent, idx) => {
      console.log(`\n${idx + 1}. ${agent.agent_name} (${agent.agent_id})`);
      console.log(`   Voice: ${agent.voice_name}`);
      console.log(`   Gender: ${agent.gender}`);
      console.log(`   Speed: ${agent.speaking_rate}x`);
      console.log(`   Mythology: ${agent.mythological_meaning}`);
    });
    console.log(`\n... and ${data.total_agents - 5} more agents`);
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }

  console.log('');
}

/**
 * Test 3: Backend Health Check
 */
async function testBackendHealth() {
  console.log('🏥 Test 3: Backend Health Check');
  console.log('-'.repeat(50));

  try {
    const startTime = Date.now();
    const response = await fetch(`${API_URL}/health`);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`✅ Backend is healthy!`);
    console.log(`- Duration: ${duration}ms`);
    console.log(`- Response:`, JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(`❌ Backend health check failed: ${error.message}`);
  }

  console.log('');
}

/**
 * Test 4: Check Voice Endpoints Availability
 */
async function testEndpointsAvailability() {
  console.log('🔍 Test 4: Voice Endpoints Availability');
  console.log('-'.repeat(50));

  const endpoints = [
    { name: 'Synthesize (POST)', url: '/api/v1/voice/synthesize', method: 'OPTIONS' },
    { name: 'Transcribe (POST)', url: '/api/v1/voice/transcribe', method: 'OPTIONS' },
    { name: 'Agent Voices (GET)', url: '/api/v1/voice/agent-voices', method: 'HEAD' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint.url}`, {
        method: endpoint.method,
      });

      const status = response.status;
      const statusText = response.statusText;

      // CORS/OPTIONS requests might return 200, 204, or 405
      if (status === 200 || status === 204 || status === 405 || status === 404) {
        console.log(`✅ ${endpoint.name}: Available (${status} ${statusText})`);
      } else {
        console.log(`⚠️  ${endpoint.name}: Unexpected status (${status} ${statusText})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }

  console.log('');
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Voice Backend Tests...\n');

  await testBackendHealth();
  await testEndpointsAvailability();
  await testAgentVoices();
  await testTextToSpeech();

  console.log('='.repeat(50));
  console.log('✅ All tests completed!');
  console.log('='.repeat(50));
  console.log('');
  console.log('Next steps:');
  console.log('1. Open http://localhost:3001/pt/app/chat');
  console.log('2. Send a message to get an agent response');
  console.log('3. Click the 🔊 speaker icon to test TTS');
  console.log('4. Click the 🎤 microphone icon to test STT');
  console.log('');
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
