// Test backend connection with proper error handling
export async function testBackendConnection() {
  // Try multiple possible URLs
  const urls = [
    'https://neural-thinker-cidadao-ai-backend.hf.space',
    localStorage.getItem('backend_url'), // Check if we found a working URL
  ].filter(Boolean);
  
  console.log('=== Testing Backend Connection ===');
  
  for (const baseUrl of urls) {
    console.log(`\n🔍 Testing: ${baseUrl}`);
    
    if (await testSingleBackend(baseUrl as string)) {
      console.log(`\n✅ Backend is working at: ${baseUrl}`);
      return true;
    }
  }
  
  console.log('\n❌ No working backend found');
  return false;
}

async function testSingleBackend(baseUrl: string) {
  
  // 1. Test root endpoint
  console.log('\n1. Testing root endpoint...');
  try {
    const rootResponse = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    console.log(`Root endpoint status: ${rootResponse.status}`);
    const rootData = await rootResponse.text();
    console.log('Root response:', rootData);
  } catch (error) {
    console.error('Root endpoint error:', error);
  }
  
  // 2. Test docs endpoint
  console.log('\n2. Testing docs endpoint...');
  try {
    const docsResponse = await fetch(`${baseUrl}/docs`);
    console.log(`Docs endpoint status: ${docsResponse.status}`);
  } catch (error) {
    console.error('Docs endpoint error:', error);
  }
  
  // 3. Test chat suggestions endpoint (GET)
  console.log('\n3. Testing suggestions endpoint...');
  try {
    const suggestionsResponse = await fetch(`${baseUrl}/api/v1/chat/suggestions`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    console.log(`Suggestions endpoint status: ${suggestionsResponse.status}`);
    if (suggestionsResponse.ok) {
      const suggestions = await suggestionsResponse.json();
      console.log('Suggestions:', suggestions);
    } else {
      const errorText = await suggestionsResponse.text();
      console.log('Suggestions error:', errorText);
    }
  } catch (error) {
    console.error('Suggestions endpoint error:', error);
  }
  
  // 4. Test chat message endpoint (POST)
  console.log('\n4. Testing chat message endpoint...');
  const testMessage = {
    message: 'Olá, teste de conexão',
    session_id: 'test-session-' + Date.now(),
    context: {}
  };
  
  try {
    console.log('Sending request:', testMessage);
    const chatResponse = await fetch(`${baseUrl}/api/v1/chat/message`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });
    
    console.log(`Chat endpoint status: ${chatResponse.status}`);
    console.log('Response headers:', Object.fromEntries(chatResponse.headers.entries()));
    
    const responseText = await chatResponse.text();
    console.log('Raw response:', responseText);
    
    if (chatResponse.ok) {
      try {
        const chatData = JSON.parse(responseText);
        console.log('Parsed chat response:', chatData);
        return chatData;
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
    }
  } catch (error) {
    console.error('Chat endpoint error:', error);
  }
  
  console.log('\n=== End of Backend Connection Test ===');
  return false; // Return false if no successful connection
}