// Script to check API availability
export async function checkAPIEndpoints() {
  const baseUrls = [
    'https://neural-thinker-cidadao-ai-backend.hf.space',
    'https://huggingface.co/spaces/neural-thinker/cidadao-ai-backend',
    'https://neural-thinker.hf.space',
  ];
  
  for (const baseUrl of baseUrls) {
    console.log(`\nTesting ${baseUrl}...`);
    
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