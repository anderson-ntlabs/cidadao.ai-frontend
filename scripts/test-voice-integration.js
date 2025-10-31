/**
 * Voice Integration Test
 *
 * Tests the complete voice integration flow:
 * 1. Fetch agent voices from backend
 * 2. Test TTS with Drummond voice
 * 3. Validate response format
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-30
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app';

console.log('🎤 Voice Integration Test');
console.log('='.repeat(60));
console.log(`Backend URL: ${API_URL}`);
console.log('='.repeat(60));
console.log('');

/**
 * Test 1: Fetch Agent Voices
 */
async function testAgentVoices() {
  console.log('📋 Test 1: Fetch Agent Voices');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(`${API_URL}/api/v1/voice/agent-voices`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('✅ Success!');
    console.log(`- Total Agents: ${data.total_voices || Object.keys(data.agents).length}`);
    console.log(`- Statistics:`, JSON.stringify(data.statistics, null, 2));
    console.log('');

    // Display first 3 agents
    console.log('📊 Sample Agent Voices:');
    console.log('-'.repeat(60));

    const agents = Object.entries(data.agents).slice(0, 3);
    agents.forEach(([agentId, agent], idx) => {
      console.log(`\n${idx + 1}. ${agent.agent_name} (${agentId})`);
      console.log(`   Voice: ${agent.voice_name}`);
      console.log(`   Gender: ${agent.gender}`);
      console.log(`   Quality: ${agent.quality}`);
      console.log(`   Speed: ${agent.speaking_rate}x`);
    });

    console.log(`\n... and ${Object.keys(data.agents).length - 3} more agents\n`);

    return data;
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    return null;
  }
}

/**
 * Test 2: Text-to-Speech with Drummond Voice
 */
async function testTTSDrummond() {
  console.log('🗣️  Test 2: TTS with Drummond Voice (Zephyr)');
  console.log('-'.repeat(60));

  const testCases = [
    {
      name: 'Short greeting',
      text: 'Olá! Eu sou Drummond.',
      voice: 'pt-BR-Chirp3-HD-Zephyr'
    },
    {
      name: 'Medium sentence',
      text: 'Bem-vindo ao Cidadão.AI, sua plataforma de transparência.',
      voice: 'pt-BR-Chirp3-HD-Zephyr'
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n→ Testing: ${testCase.name}`);
      console.log(`  Text: "${testCase.text}"`);
      console.log(`  Voice: ${testCase.voice}`);

      const startTime = Date.now();
      const response = await fetch(`${API_URL}/api/v1/voice/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testCase.text,
          voice_name: testCase.voice,
          speaking_rate: 1.0
        }),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
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
 * Test 3: Multiple Agent Voices
 */
async function testMultipleVoices() {
  console.log('🎭 Test 3: Multiple Agent Voices');
  console.log('-'.repeat(60));

  const agents = [
    { id: 'drummond', voice: 'pt-BR-Chirp3-HD-Zephyr', gender: 'Female' },
    { id: 'zumbi', voice: 'pt-BR-Chirp3-HD-Fenrir', gender: 'Male' },
    { id: 'anita', voice: 'pt-BR-Chirp3-HD-Callirrhoe', gender: 'Female' },
  ];

  for (const agent of agents) {
    try {
      console.log(`\n→ Testing: ${agent.id} (${agent.voice})`);

      const startTime = Date.now();
      const response = await fetch(`${API_URL}/api/v1/voice/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `Olá! Sou ${agent.id}.`,
          voice_name: agent.voice,
        }),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();

      console.log(`  ✅ ${agent.gender} voice working!`);
      console.log(`  - Latency: ${duration}ms`);
      console.log(`  - Size: ${(blob.size / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
    }
  }

  console.log('');
}

/**
 * Test 4: Health Check
 */
async function testHealthCheck() {
  console.log('🏥 Test 4: Voice Service Health');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(`${API_URL}/api/v1/voice/health`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('✅ Voice service healthy!');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
  }

  console.log('');
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Voice Integration Tests...\n');

  await testHealthCheck();
  await testAgentVoices();
  await testTTSDrummond();
  await testMultipleVoices();

  console.log('='.repeat(60));
  console.log('✅ All tests completed!');
  console.log('='.repeat(60));
  console.log('');
  console.log('Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Open: http://localhost:3000/pt/app/chat');
  console.log('3. Send a message and click the 🔊 speaker icon');
  console.log('4. Verify audio plays with agent voice');
  console.log('');
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
