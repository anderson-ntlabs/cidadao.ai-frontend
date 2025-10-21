// Try to discover the correct HuggingFace Spaces app URL
const https = require('https');

// Based on Railway deployment, try these URLs
const possibleUrls = [
  // Production Railway URL
  'https://cidadao-api-production.up.railway.app',

  // Legacy HuggingFace URLs (kept for reference)
  // 'https://neural-thinker-cidadao-ai-backend.hf.space',
  // 'https://neural-thinker-cidadaoai-backend.hf.space',
  // 'https://neuralthinker-cidadao-ai-backend.hf.space',
];

console.log('🔍 Discovering HuggingFace Spaces App URL...\n');

let foundUrl = null;
let completed = 0;

possibleUrls.forEach((url, index) => {
  setTimeout(() => {
    console.log(`Testing: ${url}`);
    
    https.get(`${url}/health`, (res) => {
      console.log(`  /health status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.status === 'healthy') {
              console.log(`  ✅ FOUND WORKING URL: ${url}`);
              console.log(`  Health response:`, json);
              foundUrl = url;
            }
          } catch (e) {
            // Not JSON
          }
          
          completed++;
          checkCompletion();
        });
      } else {
        completed++;
        checkCompletion();
      }
    }).on('error', (err) => {
      console.log(`  Error: ${err.message}`);
      completed++;
      checkCompletion();
    });
  }, index * 500); // Stagger requests
});

function checkCompletion() {
  if (completed === possibleUrls.length) {
    console.log('\n' + '='.repeat(50));
    if (foundUrl) {
      console.log(`\n🎉 SUCCESS! The working backend URL is:\n${foundUrl}\n`);
      console.log('Update your .env.local file with:');
      console.log(`NEXT_PUBLIC_API_URL=${foundUrl}`);
    } else {
      console.log('\n❌ Could not find a working URL.');
      console.log('\nPlease check:');
      console.log('1. Is the Space running? Check: https://huggingface.co/spaces/neural-thinker/cidadao.ai-backend');
      console.log('2. In the "App" tab, right-click and "Open frame in new tab" to get the direct URL');
      console.log('3. Or inspect the iframe src attribute');
    }
  }
}