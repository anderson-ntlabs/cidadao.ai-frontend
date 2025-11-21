/**
 * Voice Input Debug Component
 *
 * Debug component to test Speech-to-Text functionality
 * and identify issues with browser permissions
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-11-21
 */

'use client'

import { useState, useEffect } from 'react'
import { VoiceInputButton } from './voice-input-button'
import { getBrowserInfo, isSpeechRecognitionSupported } from '@/lib/speech/browser-detection'

export function VoiceInputDebug() {
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [browserInfo, setBrowserInfo] = useState<any>(null)
  const [permissionStatus, setPermissionStatus] = useState<string>('checking...')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Check browser support
    const info = getBrowserInfo()
    setBrowserInfo(info)

    // Check microphone permission
    checkMicrophonePermission()
  }, [])

  const checkMicrophonePermission = async () => {
    try {
      // Check if navigator.permissions is available
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        setPermissionStatus(result.state)

        result.addEventListener('change', () => {
          setPermissionStatus(result.state)
        })
      } else {
        // Fallback: try to get user media to check permission
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            stream.getTracks().forEach((track) => track.stop())
            setPermissionStatus('granted')
          } else {
            setPermissionStatus('not available')
          }
        } catch (err) {
          setPermissionStatus('denied or not requested')
        }
      }
    } catch (err) {
      setPermissionStatus('unable to check')
      console.error('Permission check error:', err)
    }
  }

  const handleTranscript = (text: string) => {
    setTranscript((prev) => prev + ' ' + text)
    console.log('Final transcript:', text)
  }

  const handleInterimTranscript = (text: string) => {
    setInterimTranscript(text)
    console.log('Interim transcript:', text)
  }

  const handleClear = () => {
    setTranscript('')
    setInterimTranscript('')
    setError('')
  }

  const testMicrophone = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Microphone API not available in this browser')
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setError('')
      setPermissionStatus('granted - microphone working!')

      // Stop the stream after testing
      setTimeout(() => {
        stream.getTracks().forEach((track) => track.stop())
      }, 1000)
    } catch (err: any) {
      setError(`Microphone error: ${err.message}`)
      setPermissionStatus('denied or error')
    }
  }

  if (!browserInfo) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold">🎤 Speech-to-Text Debug Panel</h2>

      {/* Browser Info */}
      <div className="space-y-2 p-4 bg-gray-100 dark:bg-gray-700 rounded">
        <h3 className="font-semibold">Browser Information:</h3>
        <ul className="text-sm space-y-1">
          <li>
            Browser: {browserInfo.name} {browserInfo.version}
          </li>
          <li>Mobile: {browserInfo.isMobile ? 'Yes' : 'No'}</li>
          <li>Speech API Support: {browserInfo.supportsSpeechRecognition ? '✅ Yes' : '❌ No'}</li>
          <li>
            User Agent: <code className="text-xs">{browserInfo.userAgent}</code>
          </li>
        </ul>
      </div>

      {/* Permission Status */}
      <div className="space-y-2 p-4 bg-gray-100 dark:bg-gray-700 rounded">
        <h3 className="font-semibold">Microphone Permission:</h3>
        <p
          className={`text-sm ${
            permissionStatus === 'granted'
              ? 'text-green-600'
              : permissionStatus === 'denied'
                ? 'text-red-600'
                : 'text-yellow-600'
          }`}
        >
          Status: {permissionStatus}
        </p>
        <button
          onClick={testMicrophone}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Microphone Access
        </button>
      </div>

      {/* Speech Recognition Test */}
      {browserInfo.supportsSpeechRecognition ? (
        <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded">
          <h3 className="font-semibold text-green-700 dark:text-green-300">
            ✅ Speech Recognition Available
          </h3>

          <div className="flex items-center gap-4">
            <VoiceInputButton
              onTranscript={handleTranscript}
              onInterimTranscript={handleInterimTranscript}
              lang="pt-BR"
              size="lg"
              variant="primary"
              showTooltip={true}
            />
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear
            </button>
          </div>

          {/* Transcript Display */}
          <div className="space-y-2">
            <div className="p-3 bg-white dark:bg-gray-800 rounded border">
              <p className="text-sm text-gray-500">Final Transcript:</p>
              <p className="font-mono">{transcript || '(empty)'}</p>
            </div>

            {interimTranscript && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-300">
                <p className="text-sm text-gray-500">Interim (real-time):</p>
                <p className="font-mono animate-pulse">{interimTranscript}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded">
          <h3 className="font-semibold text-red-700 dark:text-red-300">
            ❌ Speech Recognition Not Supported
          </h3>
          <p className="text-sm mt-2">
            Your browser ({browserInfo.name}) does not support the Web Speech API. Please use Google
            Chrome or Microsoft Edge for speech-to-text functionality.
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
        <h3 className="font-semibold mb-2">📝 Instructions:</h3>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Make sure you're using Chrome or Edge browser</li>
          <li>Click "Test Microphone Access" to check permission</li>
          <li>Click the microphone button and speak in Portuguese</li>
          <li>Your speech will be transcribed in real-time</li>
          <li>The final transcript appears when you stop speaking</li>
        </ol>
      </div>

      {/* Console Instructions */}
      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
        <h3 className="font-semibold mb-2">🔍 Debug Info:</h3>
        <p className="text-sm">
          Open the browser console (F12) to see detailed logs about the speech recognition process.
        </p>
      </div>
    </div>
  )
}
