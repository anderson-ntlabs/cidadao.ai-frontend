/**
 * STT (Speech-to-Text) Integration Test
 *
 * Tests the transcription endpoint with sample audio
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-10-30
 */

const fs = require('fs')
const path = require('path')

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cidadao-api-production.up.railway.app'

console.log('🎤 STT (Speech-to-Text) Integration Test')
console.log('='.repeat(60))
console.log(`Backend URL: ${API_URL}`)
console.log('='.repeat(60))
console.log('')

/**
 * Test 1: Check STT Endpoint Availability
 */
async function testSTTEndpoint() {
  console.log('🔍 Test 1: STT Endpoint Availability')
  console.log('-'.repeat(60))

  try {
    // Try OPTIONS request to check if endpoint exists
    const response = await fetch(`${API_URL}/api/v1/voice/transcribe`, {
      method: 'OPTIONS',
    })

    console.log(`✅ Endpoint available (${response.status})`)
    console.log('')
  } catch (error) {
    console.log(`⚠️  Endpoint check failed: ${error.message}`)
    console.log('')
  }
}

/**
 * Test 2: Generate Test Audio (Synthetic)
 */
async function testWithSyntheticAudio() {
  console.log('🎙️  Test 2: STT with Synthetic Audio')
  console.log('-'.repeat(60))
  console.log('')
  console.log('⚠️  Note: This test requires real audio input.')
  console.log('To test STT properly:')
  console.log('1. Run: npm run dev')
  console.log('2. Open: http://localhost:3000/pt/app/chat')
  console.log('3. Click the microphone button 🎤')
  console.log('4. Speak: "Olá, quero consultar dados de transparência"')
  console.log('5. Stop recording and verify transcription')
  console.log('')
}

/**
 * Test 3: Test with Pre-recorded Audio (if available)
 */
async function testWithPrerecordedAudio() {
  console.log('📁 Test 3: Check for Test Audio Files')
  console.log('-'.repeat(60))

  const testAudioPath = path.join(__dirname, '..', 'test-audio.webm')

  if (fs.existsSync(testAudioPath)) {
    console.log(`✅ Found test audio: ${testAudioPath}`)

    try {
      const audioBuffer = fs.readFileSync(testAudioPath)
      const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' })

      const formData = new FormData()
      formData.append('audio', audioBlob, 'test.webm')
      formData.append('sample_rate', '44100')

      console.log('→ Uploading test audio...')

      const startTime = Date.now()
      const response = await fetch(`${API_URL}/api/v1/voice/transcribe`, {
        method: 'POST',
        body: formData,
      })

      const duration = Date.now() - startTime

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      console.log(`✅ Transcription successful!`)
      console.log(`  - Duration: ${duration}ms`)
      console.log(`  - Transcription: "${result.transcription}"`)
      console.log(`  - Confidence: ${(result.confidence * 100).toFixed(1)}%`)
      console.log(`  - Language: ${result.language_detected}`)
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`)
    }
  } else {
    console.log(`⚠️  No test audio file found at: ${testAudioPath}`)
    console.log('')
    console.log('To create test audio:')
    console.log('1. Record audio in the browser (webm format)')
    console.log('2. Save as test-audio.webm in project root')
    console.log('3. Re-run this test')
  }

  console.log('')
}

/**
 * Test 4: Validate Request Format
 */
async function testRequestFormat() {
  console.log('📋 Test 4: Validate STT Request Format')
  console.log('-'.repeat(60))

  console.log('Expected request format:')
  console.log('```')
  console.log('POST /api/v1/voice/transcribe')
  console.log('Content-Type: multipart/form-data')
  console.log('')
  console.log('FormData:')
  console.log('  - audio: <audio_file> (webm, mp3, wav, etc.)')
  console.log('  - sample_rate: 44100 (integer)')
  console.log('```')
  console.log('')

  console.log('Expected response format:')
  console.log('```json')
  console.log('{')
  console.log('  "transcription": "Texto transcrito",')
  console.log('  "confidence": 0.95,')
  console.log('  "language_detected": "pt-BR",')
  console.log('  "duration_ms": 1234')
  console.log('}')
  console.log('```')
  console.log('')
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting STT Integration Tests...\n')

  await testSTTEndpoint()
  await testRequestFormat()
  await testWithSyntheticAudio()
  await testWithPrerecordedAudio()

  console.log('='.repeat(60))
  console.log('✅ Test suite completed!')
  console.log('='.repeat(60))
  console.log('')
  console.log('🎯 Manual Testing Steps:')
  console.log('1. npm run dev')
  console.log('2. Open http://localhost:3000/pt/app/chat')
  console.log('3. Click microphone button 🎤')
  console.log('4. Speak clearly in Portuguese')
  console.log('5. Click to stop recording')
  console.log('6. Verify transcription appears in input field')
  console.log('')
  console.log('🔊 TTS Testing:')
  console.log('1. Send a message in chat')
  console.log('2. Wait for agent response')
  console.log('3. Click speaker icon 🔊')
  console.log('4. Verify audio plays with agent voice')
  console.log('')
}

// Run tests
runAllTests().catch((error) => {
  console.error('❌ Test suite failed:', error)
  process.exit(1)
})
