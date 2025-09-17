// Try to discover the correct HuggingFace Spaces app URL
const https = require('https');

// Based on HuggingFace Spaces patterns, try these URLs
const possibleUrls = [
  // Standard pattern: {username}-{space-name}.hf.space
  'https://neural-thinker-cidadao-ai-backend.hf.space',
  'https://neural-thinker-cidadaoai-backend.hf.space',
  'https://neuralthinker-cidadao-ai-backend.hf.space',
  
  // With dots
  'https://neural-thinker.cidadao-ai-backend.hf.space',
  'https://neural-thinker.cidadao.ai-backend.hf.space',
  
  // Proxy patterns
  'https://huggingface.co/spaces/neural-thinker/cidadao.ai-backend/proxy',
  'https://huggingface.co/spaces/neural-thinker/cidadao.ai-backend/resolve/main',
  
  // Direct patterns
  'https://hf.space/neural-thinker/cidadao.ai-backend',
  'https://hf.space/embed/neural-thinker/cidadao.ai-backend/+',
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