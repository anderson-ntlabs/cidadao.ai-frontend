// Script to check API availability
export async function checkAPIEndpoints() {
  const baseUrls = [
    // Standard HuggingFace Spaces format
    'https://neural-thinker-cidadao-ai-backend.hf.space',
    // Alternative formats
    'https://neural-thinker-cidadaoai-backend.hf.space',
    'https://neuralthinker-cidadao-ai-backend.hf.space',
    // Check saved URL from discovery
    localStorage.getItem('backend_url'),
  ].filter(Boolean);
  
  for (const baseUrl of baseUrls) {
    if (!baseUrl) continue;
    console.log(`\nTesting ${baseUrl}...`);
    
    // Test health endpoint first (more reliable)
    try {
      const healthResponse = await fetch(`${baseUrl}/health`);
      console.log(`${baseUrl}/health - Status: ${healthResponse.status}`);
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('Health check passed:', healthData);
      }
    } catch (error) {
      console.error(`${baseUrl}/health - Error:`, error);
    }
    
    // Test root
    try {
      const response = await fetch(baseUrl);
      console.log(`${baseUrl} - Status: ${response.status}`);
      if (response.ok) {
        const text = await response.text();
        console.log(`Response preview: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error(`${baseUrl} - Error:`, error);
    }
    
    // Test /docs
    try {
      const docsResponse = await fetch(`${baseUrl}/docs`);
      console.log(`${baseUrl}/docs - Status: ${docsResponse.status}`);
    } catch (error) {
      console.error(`${baseUrl}/docs - Error:`, error);
    }
    
    // Test API endpoint
    try {
      const apiResponse = await fetch(`${baseUrl}/api/v1/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'test',
          session_id: 'test',
        }),
      });
      console.log(`${baseUrl}/api/v1/chat/message - Status: ${apiResponse.status}`);
      if (!apiResponse.ok) {
        const text = await apiResponse.text();
        console.log(`Error response: ${text.substring(0, 200)}...`);
      }
    } catch (error) {
      console.error(`${baseUrl}/api/v1/chat/message - Error:`, error);
    }
  }
}