/**
 * Voice Settings Component
 *
 * Comprehensive voice configuration panel for TTS.
 * Allows users to customize voices for each agent democratically.
 *
 * Features:
 * - Default voice selection
 * - Per-agent voice customization
 * - Rate, pitch, volume sliders
 * - Voice preview/test
 * - TTS enable/disable toggle
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-01
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { useVoiceSettingsStore } from '@/store/voice-settings-store'
import { webSpeechTTS, type VoiceOption } from '@/lib/speech/web-speech-tts.service'
import { agents } from '@/data/agents'
import { toast } from '@/hooks/use-toast'
import Image from 'next/image'

interface VoiceSettingsProps {
  className?: string
}

export function VoiceSettings({ className }: VoiceSettingsProps) {
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([])
  const [ptVoices, setPtVoices] = useState<VoiceOption[]>([])
  const [isLoadingVoices, setIsLoadingVoices] = useState(true)
  const [isTesting, setIsTesting] = useState(false)
  const [testingAgentId, setTestingAgentId] = useState<string | null>(null)
  const [expandedAgents, setExpandedAgents] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  const {
    defaultVoice,
    agentVoices,
    ttsEnabled,
    autoPlayResponses,
    setDefaultVoice,
    setDefaultRate,
    setDefaultPitch,
    setDefaultVolume,
    setAgentVoice,
    removeAgentVoice,
    resetAgentVoices,
    setTTSEnabled,
    setAutoPlayResponses,
    resetToDefaults,
  } = useVoiceSettingsStore()

  // Load available voices
  useEffect(() => {
    const loadVoices = async () => {
      setIsLoadingVoices(true)

      if (!webSpeechTTS.isSupported()) {
        setIsSupported(false)
        setIsLoadingVoices(false)
        return
      }

      try {
        const allVoices = await webSpeechTTS.getVoices()
        const portugueseVoices = await webSpeechTTS.getPortugueseVoices()

        setAvailableVoices(allVoices)
        setPtVoices(portugueseVoices)

        // Set default voice if not set
        if (!defaultVoice.voiceURI && portugueseVoices.length > 0) {
          const defaultPtVoice = await webSpeechTTS.getDefaultPortugueseVoice()
          if (defaultPtVoice) {
            setDefaultVoice(defaultPtVoice.voiceURI)
          }
        }
      } catch (error) {
        console.error('Failed to load voices:', error)
        toast.error('Erro', 'Falha ao carregar vozes do navegador')
      } finally {
        setIsLoadingVoices(false)
      }
    }

    loadVoices()
  }, [defaultVoice.voiceURI, setDefaultVoice])

  // Test voice
  const testVoice = useCallback(
    async (voiceURI: string | null, agentId?: string) => {
      if (isTesting) {
        webSpeechTTS.stop()
        setIsTesting(false)
        setTestingAgentId(null)
        return
      }

      const testText = agentId
        ? `Olá! Eu sou ${agents.find((a) => a.id === agentId)?.name || 'um agente'}. Esta é minha voz.`
        : 'Olá! Esta é a voz padrão do sistema Cidadão.AI.'

      setIsTesting(true)
      setTestingAgentId(agentId || null)

      try {
        await webSpeechTTS.speak(testText, voiceURI || undefined, {
          rate: defaultVoice.rate,
          pitch: defaultVoice.pitch,
          volume: defaultVoice.volume,
        })
      } catch (error) {
        console.error('Test voice error:', error)
        toast.error('Erro', 'Falha ao testar voz')
      } finally {
        setIsTesting(false)
        setTestingAgentId(null)
      }
    },
    [isTesting, defaultVoice.rate, defaultVoice.pitch, defaultVoice.volume]
  )

  // Stop test (exported for potential future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _stopTest = useCallback(() => {
    webSpeechTTS.stop()
    setIsTesting(false)
    setTestingAgentId(null)
  }, [])

  if (!isSupported) {
    return (
      <GlassCard className={className}>
        <GlassCardContent className="p-6">
          <div className="text-center py-8">
            <VolumeX className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              TTS Não Suportado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Seu navegador não suporta a Web Speech API.
              <br />
              Tente usar Chrome, Edge ou Safari para habilitar o recurso de voz.
            </p>
          </div>
        </GlassCardContent>
      </GlassCard>
    )
  }

  if (isLoadingVoices) {
    return (
      <GlassCard className={className}>
        <GlassCardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-green-500 mr-3" />
            <span className="text-gray-600 dark:text-gray-400">Carregando vozes...</span>
          </div>
        </GlassCardContent>
      </GlassCard>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* TTS Toggle */}
      <GlassCard>
        <GlassCardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                {ttsEnabled ? (
                  <Volume2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                ) : (
                  <VolumeX className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Leitura de Respostas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Habilita a conversão de texto para voz nas respostas dos agentes
                </p>
              </div>
            </div>
            <button
              onClick={() => setTTSEnabled(!ttsEnabled)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                ttsEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  ttsEnabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {/* Auto-play toggle */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Reprodução Automática
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Reproduzir automaticamente as respostas dos agentes
                </p>
              </div>
              <button
                onClick={() => setAutoPlayResponses(!autoPlayResponses)}
                disabled={!ttsEnabled}
                className={cn(
                  'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                  !ttsEnabled && 'opacity-50 cursor-not-allowed',
                  autoPlayResponses && ttsEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-3 w-3 transform rounded-full bg-white transition-transform',
                    autoPlayResponses && ttsEnabled ? 'translate-x-5' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Default Voice Settings */}
      <GlassCard>
        <GlassCardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Voz Padrão</h3>

          {/* Voice selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selecionar Voz
            </label>
            <div className="flex gap-2">
              <select
                value={defaultVoice.voiceURI || ''}
                onChange={(e) => setDefaultVoice(e.target.value || null)}
                disabled={!ttsEnabled}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg border',
                  'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600',
                  'text-gray-900 dark:text-white',
                  'focus:ring-2 focus:ring-green-500 focus:border-transparent',
                  !ttsEnabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <option value="">Voz padrão do sistema</option>
                <optgroup label="Português (Brasil)">
                  {ptVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Outras vozes">
                  {availableVoices
                    .filter((v) => !v.lang.startsWith('pt'))
                    .map((voice) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                </optgroup>
              </select>
              <Button
                variant="secondary"
                onClick={() => testVoice(defaultVoice.voiceURI)}
                disabled={!ttsEnabled}
                className="shrink-0"
              >
                {isTesting && !testingAgentId ? (
                  <Square className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {ptVoices.length} vozes em português disponíveis
            </p>
          </div>

          {/* Rate slider */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Velocidade
              </label>
              <span className="text-sm text-gray-500">{defaultVoice.rate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={defaultVoice.rate}
              onChange={(e) => setDefaultRate(parseFloat(e.target.value))}
              disabled={!ttsEnabled}
              className={cn(
                'w-full h-2 rounded-lg appearance-none cursor-pointer',
                'bg-gray-200 dark:bg-gray-700',
                !ttsEnabled && 'opacity-50 cursor-not-allowed'
              )}
            />
          </div>

          {/* Pitch slider */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tom</label>
              <span className="text-sm text-gray-500">{defaultVoice.pitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={defaultVoice.pitch}
              onChange={(e) => setDefaultPitch(parseFloat(e.target.value))}
              disabled={!ttsEnabled}
              className={cn(
                'w-full h-2 rounded-lg appearance-none cursor-pointer',
                'bg-gray-200 dark:bg-gray-700',
                !ttsEnabled && 'opacity-50 cursor-not-allowed'
              )}
            />
          </div>

          {/* Volume slider */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Volume</label>
              <span className="text-sm text-gray-500">
                {Math.round(defaultVoice.volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={defaultVoice.volume}
              onChange={(e) => setDefaultVolume(parseFloat(e.target.value))}
              disabled={!ttsEnabled}
              className={cn(
                'w-full h-2 rounded-lg appearance-none cursor-pointer',
                'bg-gray-200 dark:bg-gray-700',
                !ttsEnabled && 'opacity-50 cursor-not-allowed'
              )}
            />
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Per-Agent Voice Settings */}
      <GlassCard>
        <GlassCardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Vozes por Agente
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Personalize a voz de cada agente individualmente
              </p>
            </div>
            <div className="flex gap-2">
              {Object.keys(agentVoices).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetAgentVoices}
                  disabled={!ttsEnabled}
                  className="text-red-500 hover:text-red-600"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedAgents(!expandedAgents)}
                disabled={!ttsEnabled}
              >
                {expandedAgents ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Recolher
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Expandir
                  </>
                )}
              </Button>
            </div>
          </div>

          {expandedAgents && (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg',
                    'bg-gray-50 dark:bg-gray-800/50',
                    !ttsEnabled && 'opacity-50'
                  )}
                >
                  {/* Agent avatar */}
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={agent.image}
                      alt={agent.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>

                  {/* Agent info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {agent.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {agent.role.pt}
                    </p>
                  </div>

                  {/* Voice selector */}
                  <select
                    value={agentVoices[agent.id] || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setAgentVoice(agent.id, e.target.value)
                      } else {
                        removeAgentVoice(agent.id)
                      }
                    }}
                    disabled={!ttsEnabled}
                    className={cn(
                      'w-40 px-2 py-1 text-sm rounded-lg border',
                      'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600',
                      'text-gray-900 dark:text-white',
                      'focus:ring-1 focus:ring-green-500',
                      !ttsEnabled && 'cursor-not-allowed'
                    )}
                  >
                    <option value="">Usar padrão</option>
                    {ptVoices.map((voice) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name.replace('Microsoft ', '').replace('Google ', '')}
                      </option>
                    ))}
                  </select>

                  {/* Test button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      testVoice(agentVoices[agent.id] || defaultVoice.voiceURI, agent.id)
                    }
                    disabled={!ttsEnabled}
                    className="shrink-0"
                  >
                    {isTesting && testingAgentId === agent.id ? (
                      <Square className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!expandedAgents && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Clique em &quot;Expandir&quot; para configurar a voz de cada agente
            </p>
          )}
        </GlassCardContent>
      </GlassCard>

      {/* Reset button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          onClick={() => {
            resetToDefaults()
            toast.success(
              'Configurações restauradas',
              'Todas as configurações de voz foram resetadas'
            )
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restaurar Padrões
        </Button>
      </div>
    </div>
  )
}
