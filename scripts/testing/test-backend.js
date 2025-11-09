// Quick script to test the backend URL
const https = require('https')

const testUrl = 'https://cidadao-api-production.up.railway.app'

console.log(`Testing backend at: ${testUrl}`)

// Test health endpoint
https
  .get(`${testUrl}/health`, (res) => {
    console.log(`Health endpoint status: ${res.statusCode}`)

    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      console.log('Health response:', data)
    })
  })
  .on('error', (err) => {
    console.error('Health endpoint error:', err.message)
  })

// Test docs endpoint
https
  .get(`${testUrl}/docs`, (res) => {
    console.log(`Docs endpoint status: ${res.statusCode}`)
  })
  .on('error', (err) => {
    console.error('Docs endpoint error:', err.message)
  })

// Test root endpoint
https
  .get(testUrl, (res) => {
    console.log(`Root endpoint status: ${res.statusCode}`)

    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      console.log('Root response preview:', data.substring(0, 200))
    })
  })
  .on('error', (err) => {
    console.error('Root endpoint error:', err.message)
  })
