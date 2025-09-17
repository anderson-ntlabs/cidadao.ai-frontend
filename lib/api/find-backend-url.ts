// Try to find the correct backend URL
export async function findBackendURL() {
  const possibleURLs = [
    // Standard HuggingFace Spaces URL format
    'https://neural-thinker-cidadao-ai-backend.hf.space',
    // Alternative formats that might work
    'https://neural-thinker-cidadaoai-backend.hf.space',
    'https://neural-thinker-cidadao-backend.hf.space',
    // Direct app URL (from HF Spaces)
    'https://neural-thinker-cidadao.ai-backend.hf.space',
    // Try with different separators
    'https://neuralthinker-cidadaoai-backend.hf.space',
    'https://neuralthinker-cidadao-ai-backend.hf.space',
  ];

  console.log('=== Searching for Backend URL ===');
  
  for (const url of possibleURLs) {
    console.log(`\nTrying ${url}...`);
    
    try {
      // First try the root endpoint
      const rootResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/html',
        },
      });
      
      console.log(`${url} - Root status: ${rootResponse.status}`);
      
      // If root returns 404, try /docs
      if (rootResponse.status === 404 || rootResponse.status === 200) {
        const docsResponse = await fetch(`${url}/docs`, {
          method: 'GET',
          headers: {
            'Accept': 'text/html',
          },
        });
        
        console.log(`${url}/docs - Status: ${docsResponse.status}`);
        
        if (docsResponse.status === 200) {
          console.log(`✅ Found working backend at: ${url}`);
          
          // Test if API endpoints work
          const apiTest = await fetch(`${url}/api/v1/chat/suggestions`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });
          
          console.log(`${url}/api/v1/chat/suggestions - Status: ${apiTest.status}`);
          
          if (apiTest.status !== 404) {
            return url;
          }
        }
      }
    } catch (error) {
      console.error(`${url} - Error:`, error);
    }
  }
  
  // Also try checking the direct app URL from HuggingFace
  console.log('\nChecking HuggingFace direct app URL...');
  try {
    // The app runs on port 7860 internally, but HF handles the routing
    const hfAppUrl = 'https://neural-thinker-cidadao-ai-backend.hf.space';
    
    // Test with a simple health check first
    const healthResponse = await fetch(`${hfAppUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log(`${hfAppUrl}/health - Status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      // If health check works, test the docs endpoint
      const docsResponse = await fetch(`${hfAppUrl}/docs`);
      if (docsResponse.ok) {
        console.log(`✅ Confirmed working backend at: ${hfAppUrl}`);
        return hfAppUrl;
      }
    }
  } catch (error) {
    console.error('Failed to check HF app directly:', error);
  }
  
  console.log('\n❌ Could not find working backend URL');
  return null;
}