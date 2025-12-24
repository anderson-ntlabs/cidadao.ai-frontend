// Verify the backend URL is working
// Note: Backend migrated from HuggingFace to Railway in October 2024
const https = require('https')

const backendUrl = 'https://cidadao-api-production.up.railway.app'

console.log('🔍 Verifying Backend URL...\n')

https
  .get(`${backendUrl}/health`, (res) => {
    console.log(`Testing: ${backendUrl}`)
    console.log(`  /health status: ${res.statusCode}`)

    if (res.statusCode === 200) {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.status === 'healthy') {
            console.log(`  ✅ Backend is healthy`)
            console.log(`  Health response:`, json)
            console.log('\n' + '='.repeat(50))
            console.log(`\n🎉 SUCCESS! The backend URL is:\n${backendUrl}\n`)
            console.log('Your .env.local should have:')
            console.log(`NEXT_PUBLIC_API_URL=${backendUrl}`)
          }
        } catch (e) {
          console.log('  Response is not JSON')
        }
      })
    } else {
      console.log('\n❌ Backend health check failed')
      console.log('Please verify the Railway deployment is running')
    }
  })
  .on('error', (err) => {
    console.log(`  Error: ${err.message}`)
    console.log('\n❌ Could not connect to backend')
    console.log('Please check if Railway deployment is running')
  })
