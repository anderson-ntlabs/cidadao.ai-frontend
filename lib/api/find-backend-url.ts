// Try to find the correct backend URL
export async function findBackendURL() {
  const possibleURLs = [
    // Try with the user-space format
    'https://neural-thinker-cidadao-ai-backend.hf.space',
    // Try with dot separator
    'https://neural-thinker.cidadao-ai-backend.hf.space',
    // Try without 'ai' in the name
    'https://neural-thinker-cidadao-backend.hf.space',
    // Try the embed URL format
    'https://hf.space/embed/neural-thinker/cidadao.ai-backend/+',
    // Try direct proxy format
    'https://neural-thinker-cidadaoai-backend.hf.space',
    // Try with HF proxy
    'https://huggingface.co/spaces/neural-thinker/cidadao.ai-backend/proxy',
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
  
  // Try to get the URL from the iframe if we're on HuggingFace
  try {
    const hfPageResponse = await fetch('https://huggingface.co/spaces/neural-thinker/cidadao.ai-backend');
    const hfPageText = await hfPageResponse.text();
    
    // Look for the actual space URL in the HTML
    const spaceUrlMatch = hfPageText.match(/https:\/\/[^"'\s]+\.hf\.space[^"'\s]*/);
    if (spaceUrlMatch) {
      const foundUrl = spaceUrlMatch[0];
      console.log(`Found URL in HF page: ${foundUrl}`);
      
      // Test it
      const testResponse = await fetch(`${foundUrl}/docs`);
      if (testResponse.status === 200) {
        console.log(`✅ Confirmed working backend at: ${foundUrl}`);
        return foundUrl;
      }
    }
  } catch (error) {
    console.error('Failed to fetch HF page:', error);
  }
  
  console.log('\n❌ Could not find working backend URL');
  return null;
}