/**
 * Voice Settings Panel
 *
 * Complete settings interface for voice features including
 * enable/disable, volume, rate, pitch controls and agent voice previews
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

'use client'

import { useEffect, useState } from 'react'
import { Volume2, TestTube } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { getTTSService } from '@/lib/voice/tts-service'
import { useVoiceStore } from '@/store/voice-store'

export function VoiceSettingsPanel() {
  const { settings, setEnabled, setAutoSpeak, setVolume, setRate, setPitch, setPreferredVoice } = useVoiceStore()
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isTesting, setIsTesting] = useState(false)
  const [testingAgentId, setTestingAgentId] = useState<string | null>(null)

  const ttsService = getTTSService()
  const agentProfiles = ttsService.getAllProfiles()

  useEffect(() => {
    loadVoices()
  }, [])

  const loadVoices = async () => {
    const voices = await ttsService.getAvailableVoices()
    setAvailableVoices(voices)
  }

  const testVoice = async (agentId: string) => {
    setIsTesting(true)
    setTestingAgentId(agentId)
    const profile = ttsService.getAgentProfile(agentId)
    const testText = `Olá, eu sou ${profile?.agentName}. Esta é minha voz característica.`

    try {
      await ttsService.speak(testText, agentId)
    } catch (error) {
      console.error('Test voice error:', error)
    } finally {
      setIsTesting(false)
      setTestingAgentId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Configurações de Voz
        </CardTitle>
        <CardDescription>
          Personalize a experiência de áudio dos agentes
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="voice-enabled">Ativar Voz</Label>
            <p className="text-sm text-muted-foreground">
              Habilitar narração de mensagens dos agentes
            </p>
          </div>
          <Switch
            id="voice-enabled"
            checked={settings.enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Auto-speak */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-speak">Falar Automaticamente</Label>
                <p className="text-sm text-muted-foreground">
                  Narrar respostas assim que chegarem
                </p>
              </div>
              <Switch
                id="auto-speak"
                checked={settings.autoSpeak}
                onCheckedChange={setAutoSpeak}
              />
            </div>

            <Separator />

            {/* Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Volume</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(settings.volume * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.volume]}
                onValueChange={(values: number[]) => setVolume(values[0])}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Velocidade</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.rate.toFixed(1)}x
                </span>
              </div>
              <Slider
                value={[settings.rate]}
                onValueChange={(values: number[]) => setRate(values[0])}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Pitch */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Tom</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.pitch.toFixed(1)}x
                </span>
              </div>
              <Slider
                value={[settings.pitch]}
                onValueChange={(values: number[]) => setPitch(values[0])}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>

            <Separator />

            {/* Voice Selection */}
            <div className="space-y-2">
              <Label>Voz Preferida</Label>
              <Select
                value={settings.preferredVoice || ''}
                onValueChange={setPreferredVoice}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Padrão do sistema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Padrão do sistema</SelectItem>
                  {availableVoices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Agent Voice Profiles */}
            <div className="space-y-3">
              <Label>Personalidades dos Agentes</Label>
              <div className="grid gap-2">
                {agentProfiles.map((profile) => (
                  <div
                    key={profile.agentId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1 flex-1">
                      <p className="font-medium text-sm">{profile.agentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {profile.description}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Tom: {profile.config.pitch}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Vel: {profile.config.rate}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => testVoice(profile.agentId)}
                      disabled={isTesting}
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      {testingAgentId === profile.agentId ? 'Testando...' : 'Testar'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Beta Notice */}
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium mb-1">🎙️ Recurso em Beta</p>
              <p className="text-muted-foreground text-xs">
                A qualidade da voz varia de acordo com o navegador e sistema operacional.
                Em breve teremos vozes premium com qualidade profissional.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
