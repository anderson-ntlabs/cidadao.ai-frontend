/**
 * Voice Test Page
 *
 * Test page for debugging Speech-to-Text functionality
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-11-21
 */

import { VoiceInputDebug } from '@/components/voice/voice-input-debug'

export default function VoiceTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Sistema de Teste - Speech to Text</h1>
        <VoiceInputDebug />
      </div>
    </div>
  )
}
