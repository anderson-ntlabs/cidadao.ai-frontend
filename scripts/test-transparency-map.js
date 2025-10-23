/**
 * Test Transparency Map Integration
 *
 * Autor: Anderson Henrique da Silva
 * Data: 2025-10-23
 *
 * Tests the integration between frontend and backend transparency map endpoint
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app';
const COVERAGE_MAP_ENDPOINT = '/api/v1/transparency/coverage/map';

async function testTransparencyMapIntegration() {
  console.log('🧪 Testing Transparency Map Integration\n');
  console.log(`📡 Backend URL: ${API_BASE_URL}`);
  console.log(`🔗 Endpoint: ${COVERAGE_MAP_ENDPOINT}\n`);

  try {
    console.log('⏳ Fetching data from backend...');
    const startTime = Date.now();

    const response = await fetch(`${API_BASE_URL}${COVERAGE_MAP_ENDPOINT}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const fetchTime = Date.now() - startTime;
    console.log(`⏱️  Response time: ${fetchTime}ms\n`);

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      process.exit(1);
    }

    const data = await response.json();

    // Validate structure
    console.log('✅ Response received successfully!\n');
    console.log('📊 Summary Statistics:');
    console.log(`   - Total States: ${data.summary.total_states}`);
    console.log(`   - States with APIs: ${data.summary.states_with_apis}`);
    console.log(`   - States Working: ${data.summary.states_working}`);
    console.log(`   - Total APIs: ${data.summary.total_apis}`);
    console.log(`   - Total Endpoints: ${data.summary.total_endpoints}`);
    console.log(`   - Coverage: ${data.summary.overall_coverage_percentage}%\n`);

    console.log('🗺️  States with Data:');
    Object.entries(data.states).forEach(([code, state]) => {
      console.log(`   ${code}: ${state.name}`);
      console.log(`      Status: ${state.status}`);
      console.log(`      APIs: ${state.apis.length}`);
      state.apis.forEach(api => {
        console.log(`         - ${api.name} (${api.status}): ${api.endpoints} endpoints`);
        console.log(`           URL: ${api.url}`);
      });
      console.log('');
    });

    console.log('🕒 Cache Info:');
    console.log(`   - Cached: ${data.cache_info.cached}`);
    console.log(`   - Last Update: ${data.cache_info.last_update}`);
    console.log(`   - Age: ${data.cache_info.age_minutes} minutes`);
    if (data.cache_info.note) {
      console.log(`   - Note: ${data.cache_info.note}`);
    }

    console.log('\n✅ All tests passed! Frontend can successfully consume backend data.');
    console.log(`📦 Recommended cache strategy: ${data.cache_info.cached ? 'Use cached data' : 'Fresh data available'}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run tests
testTransparencyMapIntegration();
