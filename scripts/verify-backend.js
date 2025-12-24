// Verify the backend is working correctly
const https = require('https')

const baseUrl = 'https://cidadao-api-production.up.railway.app'

console.log('🔍 Testing backend at:', baseUrl)
console.log('='.repeat(50))

// Test 1: Health endpoint
console.log('\n1. Testing /health endpoint...')
https
  .get(`${baseUrl}/health`, (res) => {
    console.log(`   Status: ${res.statusCode}`)

    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      console.log('   Response:', data)
    })
  })
  .on('error', (err) => {
    console.error('   Error:', err.message)
  })

// Test 2: Chat suggestions endpoint
setTimeout(() => {
  console.log('\n2. Testing /api/v1/chat/suggestions endpoint...')
  https
    .get(`${baseUrl}/api/v1/chat/suggestions`, (res) => {
      console.log(`   Status: ${res.statusCode}`)

      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          console.log('   Response:', JSON.stringify(json, null, 2))
        } catch (e) {
          console.log('   Response:', data.substring(0, 200))
        }
      })
    })
    .on('error', (err) => {
      console.error('   Error:', err.message)
    })
}, 1000)

// Test 3: Chat message endpoint
setTimeout(() => {
  console.log('\n3. Testing /api/v1/chat/message endpoint...')

  const postData = JSON.stringify({
    message: 'Olá, teste de conexão',
    session_id: 'test-' + Date.now(),
  })

  const url = new URL(`${baseUrl}/api/v1/chat/message`)

  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
    },
  }

  const req = https.request(options, (res) => {
    console.log(`   Status: ${res.statusCode}`)

    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      try {
        const json = JSON.parse(data)
        console.log('   Response:', JSON.stringify(json, null, 2))
      } catch (e) {
        console.log('   Response:', data.substring(0, 200))
      }
    })
  })

  req.on('error', (err) => {
    console.error('   Error:', err.message)
  })

  req.write(postData)
  req.end()
}, 2000)

// Test 4: Docs endpoint
setTimeout(() => {
  console.log('\n4. Testing /docs endpoint...')
  https
    .get(`${baseUrl}/docs`, (res) => {
      console.log(`   Status: ${res.statusCode}`)
      console.log('   Content-Type:', res.headers['content-type'])
    })
    .on('error', (err) => {
      console.error('   Error:', err.message)
    })
}, 3000)
