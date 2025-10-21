// Try to find the correct backend URL
export async function findBackendURL() {
  // Railway is the primary backend (HuggingFace Spaces is deprecated/offline)
  const possibleURLs = [
    'https://cidadao-api-production.up.railway.app',
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
  
  // Fallback to Railway if no URL worked (shouldn't happen)
  console.log('\n⚠️  No backend URL found from list, using Railway as fallback');
  const railwayUrl = 'https://cidadao-api-production.up.railway.app';

  try {
    const healthResponse = await fetch(`${railwayUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(`${railwayUrl}/health - Status: ${healthResponse.status}`);

    if (healthResponse.ok) {
      console.log(`✅ Railway backend is available: ${railwayUrl}`);
      return railwayUrl;
    }
  } catch (error) {
    console.error('Failed to connect to Railway:', error);
  }
  
  console.log('\n❌ Could not find working backend URL');
  return null;
}