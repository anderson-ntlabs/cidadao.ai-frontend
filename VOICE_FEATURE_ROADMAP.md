# 🎙️ Voice Feature Implementation Roadmap - Cidadão.AI Frontend

**Document Version**: 1.0
**Created**: 2025-10-30
**Author**: Anderson Henrique da Silva
**Project**: Cidadão.AI Frontend (Next.js 15)
**Estimated Total Time**: 2-3 weeks
**Cost**: $0 (Phase 1-2), $5-20/month (Phase 3+)

---

## 📋 Executive Summary

Implementation of Text-to-Speech (TTS) and Speech-to-Text (STT) features for AI agents in Cidadão.AI platform, using a progressive enhancement approach:

1. **Phase 1 (MVP)**: Web Speech API (frontend-only, zero cost)
2. **Phase 2**: Speech-to-Text + User preferences
3. **Phase 3**: Backend Premium TTS (optional, for quality)
4. **Phase 4**: Advanced features (voice cloning, emotion, SSML)

**Why This Matters**:
- 🎯 Accessibility: Support for visually impaired users
- 🚀 Differentiation: Unique feature in Brazilian transparency platforms
- 💡 UX Innovation: More natural interaction with AI agents
- 🌐 Inclusion: Serve users with lower literacy levels

---

## 🎯 Phase 1: MVP - Text-to-Speech (Frontend Only)

**Timeline**: Week 1 (5 days)
**Effort**: 16-20 hours
**Cost**: $0
**Goal**: Ship basic voice functionality using Web Speech API

### Day 1-2: Core Voice Service (6-8 hours)

#### 1.1 Create Voice Service Module
**File**: `src/lib/voice/tts-service.ts`

**Features**:
- Text-to-Speech using Web Speech API
- Agent voice personality mapping
- Voice queue management
- Pause/Resume/Stop controls
- Error handling and fallbacks

**Implementation**:
```typescript
// src/lib/voice/tts-service.ts

export interface VoiceConfig {
  pitch: number;      // 0.0 - 2.0 (default: 1.0)
  rate: number;       // 0.1 - 10.0 (default: 1.0)
  volume: number;     // 0.0 - 1.0 (default: 1.0)
  voiceName?: string; // Preferred voice name
}

export interface AgentVoiceProfile {
  agentId: string;
  agentName: string;
  config: VoiceConfig;
  description: string;
}

export class TTSService {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPaused = false;
  private isEnabled = true;

  // Agent voice personalities
  private agentProfiles: Record<string, AgentVoiceProfile> = {
    'zumbi': {
      agentId: 'zumbi',
      agentName: 'Zumbi dos Palmares',
      config: { pitch: 0.8, rate: 0.9, volume: 1.0 },
      description: 'Voz grave e reflexiva'
    },
    'anita': {
      agentId: 'anita',
      agentName: 'Anita Garibaldi',
      config: { pitch: 1.2, rate: 1.0, volume: 1.0 },
      description: 'Voz clara e analítica'
    },
    'tiradentes': {
      agentId: 'tiradentes',
      agentName: 'Tiradentes',
      config: { pitch: 1.0, rate: 1.1, volume: 1.0 },
      description: 'Voz enérgica e assertiva'
    },
    'machado': {
      agentId: 'machado',
      agentName: 'Machado de Assis',
      config: { pitch: 0.9, rate: 0.8, volume: 1.0 },
      description: 'Voz pausada e eloquente'
    },
    'senna': {
      agentId: 'ayrton_senna',
      agentName: 'Ayrton Senna',
      config: { pitch: 1.1, rate: 1.2, volume: 1.0 },
      description: 'Voz rápida e dinâmica'
    },
    'bonifacio': {
      agentId: 'bonifacio',
      agentName: 'José Bonifácio',
      config: { pitch: 0.85, rate: 0.85, volume: 1.0 },
      description: 'Voz formal e autoridade'
    }
  };

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    } else {
      throw new Error('Web Speech API not supported in this browser');
    }
  }

  /**
   * Check if TTS is available in the browser
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Get available voices for pt-BR
   */
  async getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      let voices = this.synthesis.getVoices();

      if (voices.length > 0) {
        resolve(voices.filter(v => v.lang.startsWith('pt')));
      } else {
        // Voices load asynchronously in some browsers
        this.synthesis.onvoiceschanged = () => {
          voices = this.synthesis.getVoices();
          resolve(voices.filter(v => v.lang.startsWith('pt')));
        };
      }
    });
  }

  /**
   * Speak text with agent's voice personality
   */
  async speak(text: string, agentId?: string): Promise<void> {
    if (!this.isEnabled) {
      console.log('TTS is disabled');
      return;
    }

    // Stop current speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';

    // Apply agent voice profile
    if (agentId && this.agentProfiles[agentId]) {
      const profile = this.agentProfiles[agentId];
      utterance.pitch = profile.config.pitch;
      utterance.rate = profile.config.rate;
      utterance.volume = profile.config.volume;
    }

    // Select best pt-BR voice
    const voices = await this.getAvailableVoices();
    if (voices.length > 0) {
      // Prefer "pt-BR" over "pt-PT"
      const ptBrVoice = voices.find(v => v.lang === 'pt-BR') || voices[0];
      utterance.voice = ptBrVoice;
    }

    // Event handlers
    utterance.onstart = () => {
      this.currentUtterance = utterance;
      this.isPaused = false;
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      this.isPaused = false;
    };

    utterance.onerror = (event) => {
      console.error('TTS error:', event.error);
      this.currentUtterance = null;
    };

    this.synthesis.speak(utterance);
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
      this.isPaused = true;
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume();
      this.isPaused = false;
    }
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.synthesis.speaking || this.synthesis.pending) {
      this.synthesis.cancel();
      this.currentUtterance = null;
      this.isPaused = false;
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  /**
   * Check if paused
   */
  isPausedState(): boolean {
    return this.isPaused;
  }

  /**
   * Enable/disable TTS
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Get agent voice profile
   */
  getAgentProfile(agentId: string): AgentVoiceProfile | undefined {
    return this.agentProfiles[agentId];
  }

  /**
   * Get all agent profiles
   */
  getAllProfiles(): AgentVoiceProfile[] {
    return Object.values(this.agentProfiles);
  }
}

// Singleton instance
let ttsInstance: TTSService | null = null;

export function getTTSService(): TTSService {
  if (!ttsInstance && TTSService.isSupported()) {
    ttsInstance = new TTSService();
  }

  if (!ttsInstance) {
    throw new Error('TTS Service not available');
  }

  return ttsInstance;
}

export default getTTSService;
```

**Testing**:
```bash
# Create test file
touch src/lib/voice/__tests__/tts-service.test.ts

# Manual test in browser console
const tts = getTTSService();
await tts.speak("Olá, sou o Zumbi dos Palmares", "zumbi");
```

---

#### 1.2 Create Voice Store (Zustand)
**File**: `src/store/voice-store.ts`

**Features**:
- Persist user voice preferences
- Global voice enabled/disabled state
- Auto-speak settings
- Volume/rate/pitch overrides

**Implementation**:
```typescript
// src/store/voice-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VoiceSettings {
  enabled: boolean;
  autoSpeak: boolean;        // Auto-speak agent responses
  volume: number;            // 0.0 - 1.0
  rate: number;              // 0.5 - 2.0
  pitch: number;             // 0.5 - 2.0
  preferredVoice?: string;   // Voice name preference
}

interface VoiceState {
  settings: VoiceSettings;
  currentlySpeaking: boolean;
  currentAgent: string | null;

  // Actions
  setEnabled: (enabled: boolean) => void;
  setAutoSpeak: (autoSpeak: boolean) => void;
  setVolume: (volume: number) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setPreferredVoice: (voice: string) => void;
  setCurrentlySpeaking: (speaking: boolean, agent?: string | null) => void;
  resetSettings: () => void;
}

const defaultSettings: VoiceSettings = {
  enabled: false,  // Disabled by default (opt-in)
  autoSpeak: false,
  volume: 1.0,
  rate: 1.0,
  pitch: 1.0,
  preferredVoice: undefined
};

export const useVoiceStore = create<VoiceState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      currentlySpeaking: false,
      currentAgent: null,

      setEnabled: (enabled) =>
        set((state) => ({
          settings: { ...state.settings, enabled }
        })),

      setAutoSpeak: (autoSpeak) =>
        set((state) => ({
          settings: { ...state.settings, autoSpeak }
        })),

      setVolume: (volume) =>
        set((state) => ({
          settings: { ...state.settings, volume }
        })),

      setRate: (rate) =>
        set((state) => ({
          settings: { ...state.settings, rate }
        })),

      setPitch: (pitch) =>
        set((state) => ({
          settings: { ...state.settings, pitch }
        })),

      setPreferredVoice: (preferredVoice) =>
        set((state) => ({
          settings: { ...state.settings, preferredVoice }
        })),

      setCurrentlySpeaking: (speaking, agent = null) =>
        set({ currentlySpeaking: speaking, currentAgent: agent }),

      resetSettings: () =>
        set({ settings: defaultSettings })
    }),
    {
      name: 'cidadao-voice-settings',
      version: 1
    }
  )
);
```

---

### Day 3: UI Components (6-8 hours)

#### 1.3 Voice Button Component
**File**: `src/components/voice/VoiceButton.tsx`

**Features**:
- Play/Pause/Stop controls
- Visual feedback (speaking animation)
- Keyboard shortcuts
- Accessibility (ARIA labels)

**Implementation**:
```typescript
// src/components/voice/VoiceButton.tsx

'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getTTSService } from '@/lib/voice/tts-service';
import { useVoiceStore } from '@/store/voice-store';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  text: string;
  agentId?: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function VoiceButton({
  text,
  agentId,
  className,
  variant = 'ghost',
  size = 'icon',
  showLabel = false
}: VoiceButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { settings, setCurrentlySpeaking } = useVoiceStore();

  const ttsService = getTTSService();

  // Check if TTS is supported
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  if (!isSupported || !settings.enabled) {
    return null; // Don't render if not supported or disabled
  }

  const handleSpeak = async () => {
    if (isSpeaking && !isPaused) {
      // Currently speaking -> pause
      ttsService.pause();
      setIsPaused(true);
    } else if (isPaused) {
      // Paused -> resume
      ttsService.resume();
      setIsPaused(false);
    } else {
      // Not speaking -> start
      setIsSpeaking(true);
      setCurrentlySpeaking(true, agentId);

      try {
        await ttsService.speak(text, agentId);
      } catch (error) {
        console.error('TTS error:', error);
      } finally {
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentlySpeaking(false);
      }
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    ttsService.stop();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentlySpeaking(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        ttsService.stop();
      }
    };
  }, []);

  const getIcon = () => {
    if (isSpeaking && !isPaused) {
      return <Volume2 className={cn("h-4 w-4", isSpeaking && "animate-pulse")} />;
    } else if (isPaused) {
      return <Pause className="h-4 w-4" />;
    } else {
      return <Play className="h-4 w-4" />;
    }
  };

  const getTooltip = () => {
    if (isSpeaking && !isPaused) {
      return 'Pausar (Ctrl+Shift+P)';
    } else if (isPaused) {
      return 'Continuar (Ctrl+Shift+P)';
    } else {
      return 'Ouvir mensagem (Ctrl+Shift+S)';
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              onClick={handleSpeak}
              className={cn(className)}
              aria-label={getTooltip()}
            >
              {getIcon()}
              {showLabel && (
                <span className="ml-2">
                  {isSpeaking ? (isPaused ? 'Pausado' : 'Falando...') : 'Ouvir'}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltip()}</p>
          </TooltipContent>
        </Tooltip>

        {isSpeaking && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStop}
                aria-label="Parar"
              >
                <VolumeX className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Parar (Esc)</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
```

---

#### 1.4 Voice Settings Panel
**File**: `src/components/voice/VoiceSettingsPanel.tsx`

**Features**:
- Enable/disable toggle
- Auto-speak toggle
- Volume/Rate/Pitch sliders
- Voice preview
- Agent voice samples

**Implementation**:
```typescript
// src/components/voice/VoiceSettingsPanel.tsx

'use client';

import { useEffect, useState } from 'react';
import { Volume2, VolumeX, Mic, TestTube } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getTTSService } from '@/lib/voice/tts-service';
import { useVoiceStore } from '@/store/voice-store';

export function VoiceSettingsPanel() {
  const { settings, setEnabled, setAutoSpeak, setVolume, setRate, setPitch, setPreferredVoice } = useVoiceStore();
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const ttsService = getTTSService();
  const agentProfiles = ttsService.getAllProfiles();

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    const voices = await ttsService.getAvailableVoices();
    setAvailableVoices(voices);
  };

  const testVoice = async (agentId: string) => {
    setIsTesting(true);
    const profile = ttsService.getAgentProfile(agentId);
    const testText = `Olá, eu sou ${profile?.agentName}. Esta é minha voz característica.`;

    try {
      await ttsService.speak(testText, agentId);
    } catch (error) {
      console.error('Test voice error:', error);
    } finally {
      setIsTesting(false);
    }
  };

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
                onValueChange={([value]) => setVolume(value)}
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
                onValueChange={([value]) => setRate(value)}
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
                onValueChange={([value]) => setPitch(value)}
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
                    <div className="space-y-1">
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
                      variant="outline"
                      size="sm"
                      onClick={() => testVoice(profile.agentId)}
                      disabled={isTesting}
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Testar
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
  );
}
```

---

### Day 4: Integration (4-6 hours)

#### 1.5 Integrate into Chat Component
**File**: `src/components/chat/ChatMessage.tsx` (modify existing)

**Changes**:
```typescript
// Add VoiceButton to message header

import { VoiceButton } from '@/components/voice/VoiceButton';
import { useVoiceStore } from '@/store/voice-store';

export function ChatMessage({ message, agentId }) {
  const { settings } = useVoiceStore();
  const ttsService = getTTSService();

  // Auto-speak if enabled
  useEffect(() => {
    if (settings.enabled && settings.autoSpeak && message.role === 'assistant') {
      ttsService.speak(message.content, agentId);
    }
  }, [message.id]);

  return (
    <div className="chat-message">
      <div className="message-header">
        <Avatar />
        <span>{agentName}</span>
        <VoiceButton
          text={message.content}
          agentId={agentId}
          size="sm"
        />
      </div>
      <div className="message-content">
        {message.content}
      </div>
    </div>
  );
}
```

#### 1.6 Add to Settings Page
**File**: `src/app/settings/page.tsx` (modify existing)

```typescript
import { VoiceSettingsPanel } from '@/components/voice/VoiceSettingsPanel';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Existing settings */}
      <ProfileSettings />
      <NotificationSettings />

      {/* New voice settings */}
      <VoiceSettingsPanel />

      <SecuritySettings />
    </div>
  );
}
```

---

### Day 5: Testing & Polish (2-4 hours)

#### 1.7 Keyboard Shortcuts
**File**: `src/hooks/useVoiceShortcuts.ts`

```typescript
// src/hooks/useVoiceShortcuts.ts

import { useEffect } from 'react';
import { getTTSService } from '@/lib/voice/tts-service';
import { useVoiceStore } from '@/store/voice-store';

export function useVoiceShortcuts() {
  const { settings, setEnabled } = useVoiceStore();
  const ttsService = getTTSService();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+S: Speak (toggle)
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setEnabled(!settings.enabled);
      }

      // Ctrl+Shift+P: Pause/Resume
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        if (ttsService.isSpeaking()) {
          if (ttsService.isPausedState()) {
            ttsService.resume();
          } else {
            ttsService.pause();
          }
        }
      }

      // Esc: Stop speaking
      if (e.key === 'Escape' && ttsService.isSpeaking()) {
        e.preventDefault();
        ttsService.stop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.enabled]);
}
```

#### 1.8 Analytics Events
**File**: `src/lib/analytics/voice-analytics.ts`

```typescript
// Track voice usage

export function trackVoiceEvent(
  action: 'enabled' | 'disabled' | 'speak' | 'pause' | 'stop',
  agentId?: string
) {
  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'voice_interaction', {
      action,
      agent_id: agentId,
      timestamp: new Date().toISOString()
    });
  }
}
```

#### 1.9 Documentation
**Files**:
- `docs/features/VOICE_FEATURE.md`
- Update `README.md`
- Add to user guide

---

## 📊 Phase 1 Deliverables

**Code Files Created/Modified**: 12 files
- ✅ `src/lib/voice/tts-service.ts` (new)
- ✅ `src/store/voice-store.ts` (new)
- ✅ `src/components/voice/VoiceButton.tsx` (new)
- ✅ `src/components/voice/VoiceSettingsPanel.tsx` (new)
- ✅ `src/hooks/useVoiceShortcuts.ts` (new)
- ✅ `src/lib/analytics/voice-analytics.ts` (new)
- ✅ `src/components/chat/ChatMessage.tsx` (modified)
- ✅ `src/app/settings/page.tsx` (modified)
- ✅ `docs/features/VOICE_FEATURE.md` (new)

**Testing Checklist**:
- [ ] Voice works in Chrome/Edge
- [ ] Voice works in Firefox
- [ ] Voice works in Safari
- [ ] Mobile voice works (iOS/Android)
- [ ] Keyboard shortcuts functional
- [ ] Settings persist across sessions
- [ ] Agent personalities distinguishable
- [ ] Auto-speak works correctly
- [ ] Pause/Resume functional
- [ ] No memory leaks (cleanup on unmount)

**Metrics to Track**:
- % users who enable voice
- Average messages spoken per session
- Most used agent voices
- Browser/OS breakdown
- Errors/failures

---

## 🎤 Phase 2: Speech-to-Text + Enhancements

**Timeline**: Week 2 (5 days)
**Effort**: 16-20 hours
**Cost**: $0 (Web Speech API)

### Day 6-7: Speech Recognition (6-8 hours)

#### 2.1 Speech-to-Text Service
**File**: `src/lib/voice/stt-service.ts`

**Features**:
- Voice input using Web Speech API
- Real-time transcription
- Language detection
- Noise handling
- Confidence scores

```typescript
// src/lib/voice/stt-service.ts

export interface TranscriptResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: string[];
}

export class STTService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.lang = 'pt-BR';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;
  }

  static isSupported(): boolean {
    return typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  async startListening(
    onResult: (result: TranscriptResult) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    if (!this.recognition || this.isListening) return;

    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      const alternatives = Array.from(result)
        .slice(1, 3)
        .map(alt => alt.transcript);

      onResult({
        transcript,
        confidence,
        isFinal: result.isFinal,
        alternatives
      });
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Failed to start recognition:', error);
      onError?.('Failed to start listening');
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

// Singleton
let sttInstance: STTService | null = null;

export function getSTTService(): STTService {
  if (!sttInstance && STTService.isSupported()) {
    sttInstance = new STTService();
  }

  if (!sttInstance) {
    throw new Error('STT Service not available');
  }

  return sttInstance;
}
```

#### 2.2 Voice Input Button
**File**: `src/components/voice/VoiceInputButton.tsx`

```typescript
// Microphone button with live transcription display

'use client';

import { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSTTService, TranscriptResult } from '@/lib/voice/stt-service';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceInputButton({ onTranscript, className }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const sttService = getSTTService();

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  if (!isSupported) return null;

  const handleToggleListening = async () => {
    if (isListening) {
      sttService.stopListening();
      setIsListening(false);
      setInterimText('');
    } else {
      setIsListening(true);

      await sttService.startListening(
        (result: TranscriptResult) => {
          if (result.isFinal) {
            onTranscript(result.transcript);
            setInterimText('');
          } else {
            setInterimText(result.transcript);
          }
        },
        (error) => {
          console.error('STT error:', error);
          setIsListening(false);
          setInterimText('');
        }
      );
    }
  };

  return (
    <div className="relative">
      <Button
        variant={isListening ? 'destructive' : 'ghost'}
        size="icon"
        onClick={handleToggleListening}
        className={className}
        aria-label={isListening ? 'Parar gravação' : 'Iniciar gravação'}
      >
        {isListening ? (
          <MicOff className="h-4 w-4 animate-pulse" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {interimText && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-muted p-2 rounded text-sm">
          {interimText}
        </div>
      )}
    </div>
  );
}
```

#### 2.3 Integrate into Chat Input
**File**: `src/components/chat/ChatInput.tsx` (modify)

```typescript
// Add voice input button next to send button

import { VoiceInputButton } from '@/components/voice/VoiceInputButton';

export function ChatInput() {
  const [message, setMessage] = useState('');

  const handleVoiceTranscript = (text: string) => {
    setMessage(prev => prev + ' ' + text);
  };

  return (
    <div className="chat-input">
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
      <div className="flex gap-2">
        <VoiceInputButton onTranscript={handleVoiceTranscript} />
        <Button onClick={sendMessage}>Enviar</Button>
      </div>
    </div>
  );
}
```

---

### Day 8-9: Enhancements (6-8 hours)

#### 2.4 Voice Command Detection
**File**: `src/lib/voice/command-detector.ts`

Detect voice commands like:
- "Pausar" / "Parar" / "Continuar"
- "Falar mais devagar" / "Falar mais rápido"
- "Aumentar volume" / "Diminuir volume"

```typescript
// Simple pattern matching for voice commands

export interface VoiceCommand {
  type: 'pause' | 'stop' | 'resume' | 'speed' | 'volume';
  value?: number;
}

export function detectCommand(text: string): VoiceCommand | null {
  const lower = text.toLowerCase().trim();

  if (lower.includes('pausar') || lower.includes('pause')) {
    return { type: 'pause' };
  }

  if (lower.includes('parar') || lower.includes('stop')) {
    return { type: 'stop' };
  }

  if (lower.includes('continuar') || lower.includes('resume')) {
    return { type: 'resume' };
  }

  if (lower.includes('devagar') || lower.includes('mais lento')) {
    return { type: 'speed', value: -0.2 };
  }

  if (lower.includes('rápido') || lower.includes('mais rápido')) {
    return { type: 'speed', value: 0.2 };
  }

  // Add more patterns...

  return null;
}
```

#### 2.5 Voice Waveform Visualization
**File**: `src/components/voice/VoiceWaveform.tsx`

Visual feedback during speaking/listening

```typescript
// Animated waveform using canvas or CSS

export function VoiceWaveform({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-center gap-1 h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 bg-primary rounded-full transition-all",
            isActive && "animate-pulse"
          )}
          style={{
            height: isActive ? `${Math.random() * 100}%` : '20%',
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  );
}
```

#### 2.6 Multi-language Support
**File**: Update `tts-service.ts` and `stt-service.ts`

Add support for English (for international users)

```typescript
// Auto-detect language or let user choose

interface LanguageConfig {
  code: string;
  name: string;
  voices: string[];
}

const supportedLanguages: LanguageConfig[] = [
  { code: 'pt-BR', name: 'Português (Brasil)', voices: ['pt-BR'] },
  { code: 'en-US', name: 'English (US)', voices: ['en-US'] }
];
```

---

### Day 10: Testing & Polish (2-4 hours)

#### 2.7 Error Handling & Fallbacks
- Browser permission denied
- Microphone not available
- Network errors (for future backend TTS)
- Graceful degradation

#### 2.8 Performance Optimization
- Lazy load voice components
- Debounce interim transcripts
- Cancel pending speech on page navigation

#### 2.9 Accessibility Audit
- Screen reader compatibility
- ARIA labels
- Keyboard navigation
- Focus management

---

## 📊 Phase 2 Deliverables

**New Features**:
- ✅ Speech-to-Text (voice input)
- ✅ Real-time transcription
- ✅ Voice commands
- ✅ Waveform visualization
- ✅ Multi-language support
- ✅ Enhanced error handling

**Code Files Created/Modified**: 8 additional files
- ✅ `src/lib/voice/stt-service.ts` (new)
- ✅ `src/components/voice/VoiceInputButton.tsx` (new)
- ✅ `src/lib/voice/command-detector.ts` (new)
- ✅ `src/components/voice/VoiceWaveform.tsx` (new)
- ✅ `src/components/chat/ChatInput.tsx` (modified)

---

## 🚀 Phase 3: Backend Premium TTS (Optional)

**Timeline**: Week 3 (5 days)
**Effort**: 20-24 hours
**Cost**: $5-20/month (scales with usage)
**When**: After validating 30%+ users use voice feature

### Day 11-12: Backend Infrastructure (8-10 hours)

#### 3.1 Backend TTS Endpoint
**File**: `cidadao.ai-backend/src/api/routes/tts.py`

```python
# Google Cloud Text-to-Speech integration

from fastapi import APIRouter, HTTPException
from google.cloud import texttospeech
from src.services.cache_service import CacheService
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/tts", tags=["Text-to-Speech"])
cache = CacheService()

class TTSRequest(BaseModel):
    text: str
    agent_id: str
    language: str = "pt-BR"
    format: str = "mp3"

@router.post("/speak")
async def generate_speech(request: TTSRequest):
    # Check cache first (7 days TTL)
    cache_key = f"tts:{request.agent_id}:{hash(request.text)}"
    cached_audio = await cache.get(cache_key)

    if cached_audio:
        return Response(
            content=cached_audio,
            media_type="audio/mpeg",
            headers={"X-Cache": "HIT"}
        )

    # Generate new audio
    client = texttospeech.TextToSpeechClient()

    # Map agents to Google voices
    voice_map = {
        'zumbi': {'name': 'pt-BR-Wavenet-B', 'gender': 'MALE'},
        'anita': {'name': 'pt-BR-Wavenet-A', 'gender': 'FEMALE'},
        'tiradentes': {'name': 'pt-BR-Wavenet-C', 'gender': 'MALE'},
        # ... more agents
    }

    voice_config = voice_map.get(request.agent_id, {
        'name': 'pt-BR-Wavenet-A',
        'gender': 'NEUTRAL'
    })

    synthesis_input = texttospeech.SynthesisInput(text=request.text)

    voice = texttospeech.VoiceSelectionParams(
        language_code=request.language,
        name=voice_config['name'],
        ssml_gender=getattr(
            texttospeech.SsmlVoiceGender,
            voice_config['gender']
        )
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=1.0,
        pitch=0.0
    )

    try:
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        # Cache for 7 days
        await cache.set(cache_key, response.audio_content, ttl=604800)

        return Response(
            content=response.audio_content,
            media_type="audio/mpeg",
            headers={"X-Cache": "MISS"}
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"TTS generation failed: {str(e)}"
        )

@router.get("/voices")
async def list_available_voices(language: str = "pt-BR"):
    """List available voices for a language"""
    client = texttospeech.TextToSpeechClient()
    voices = client.list_voices(language_code=language)

    return {
        "voices": [
            {
                "name": voice.name,
                "language_codes": voice.language_codes,
                "gender": voice.ssml_gender.name
            }
            for voice in voices.voices
        ]
    }
```

#### 3.2 Smart TTS Service (Frontend)
**File**: `src/lib/voice/smart-tts.ts`

```typescript
// Intelligent provider selection

type TTSProvider = 'browser' | 'backend';

export class SmartTTSService {
  private frontendTTS: TTSService;
  private provider: TTSProvider = 'browser';

  constructor() {
    this.frontendTTS = getTTSService();
  }

  async speak(text: string, agentId: string): Promise<void> {
    const provider = this.selectProvider(text);

    if (provider === 'backend') {
      try {
        await this.speakBackend(text, agentId);
      } catch (error) {
        console.warn('Backend TTS failed, falling back to browser');
        await this.frontendTTS.speak(text, agentId);
      }
    } else {
      await this.frontendTTS.speak(text, agentId);
    }
  }

  private selectProvider(text: string): TTSProvider {
    // Use frontend for:
    // - Short texts (<500 chars)
    // - Offline mode
    // - Slow connection
    // - User preference

    const isOnline = navigator.onLine;
    const isShort = text.length < 500;
    const connectionType = (navigator as any).connection?.effectiveType;
    const isSlowConnection = connectionType === '2g' || connectionType === 'slow-2g';

    if (!isOnline || isShort || isSlowConnection) {
      return 'browser';
    }

    // Check user plan (future: premium users get backend)
    // const userPlan = getUserPlan();
    // if (userPlan === 'free') return 'browser';

    return 'backend';
  }

  private async speakBackend(text: string, agentId: string): Promise<void> {
    const response = await fetch('/api/v1/tts/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, agent_id: agentId })
    });

    if (!response.ok) {
      throw new Error('Backend TTS failed');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    await new Promise((resolve, reject) => {
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play();
    });

    // Cleanup
    URL.revokeObjectURL(audioUrl);
  }
}
```

---

### Day 13-14: Advanced Features (8-10 hours)

#### 3.3 SSML Support
**File**: Update backend `tts.py`

```python
# Speech Synthesis Markup Language for advanced control

class SSMLRequest(BaseModel):
    ssml: str
    agent_id: str

@router.post("/speak/ssml")
async def generate_speech_ssml(request: SSMLRequest):
    synthesis_input = texttospeech.SynthesisInput(ssml=request.ssml)
    # ... rest of the code
```

Example SSML:
```xml
<speak>
  <prosody rate="slow" pitch="-2st">
    Detectei <emphasis level="strong">três anomalias</emphasis> críticas.
  </prosody>
  <break time="500ms"/>
  <prosody rate="fast">
    O contrato número <say-as interpret-as="digits">12345</say-as>
    apresenta valor <emphasis>300% acima da média</emphasis>.
  </prosody>
</speak>
```

#### 3.4 Voice Caching & CDN
**File**: `cidadao.ai-backend/src/services/tts_cache_service.py`

```python
# Intelligent caching strategy

class TTSCacheService:
    def __init__(self):
        self.redis = Redis()
        self.s3 = boto3.client('s3')  # or Cloudflare R2

    async def get_or_generate(
        self,
        text: str,
        agent_id: str
    ) -> bytes:
        cache_key = self._generate_key(text, agent_id)

        # Check Redis (hot cache - 24h)
        cached = await self.redis.get(cache_key)
        if cached:
            return cached

        # Check S3 (warm cache - 30 days)
        try:
            s3_object = self.s3.get_object(
                Bucket='cidadao-tts-cache',
                Key=cache_key
            )
            audio = s3_object['Body'].read()

            # Promote to Redis
            await self.redis.setex(cache_key, 86400, audio)
            return audio

        except ClientError:
            pass

        # Generate new (cold)
        audio = await self._generate_tts(text, agent_id)

        # Cache in both layers
        await self.redis.setex(cache_key, 86400, audio)
        self.s3.put_object(
            Bucket='cidadao-tts-cache',
            Key=cache_key,
            Body=audio,
            ContentType='audio/mpeg'
        )

        return audio
```

#### 3.5 Analytics & Monitoring
**File**: `cidadao.ai-backend/src/services/tts_analytics.py`

```python
# Track usage and costs

class TTSAnalytics:
    async def log_usage(
        self,
        user_id: str,
        agent_id: str,
        text_length: int,
        cache_hit: bool,
        provider: str
    ):
        await db.tts_usage.insert_one({
            'user_id': user_id,
            'agent_id': agent_id,
            'text_length': text_length,
            'cache_hit': cache_hit,
            'provider': provider,
            'timestamp': datetime.utcnow()
        })

    async def get_monthly_cost(self) -> float:
        # Google TTS: $4 per 1M characters (WaveNet)
        total_chars = await db.tts_usage.aggregate([
            {'$match': {
                'timestamp': {'$gte': start_of_month},
                'cache_hit': False,
                'provider': 'google'
            }},
            {'$group': {'_id': None, 'total': {'$sum': '$text_length'}}}
        ]).to_list(1)

        chars = total_chars[0]['total'] if total_chars else 0
        cost = (chars / 1_000_000) * 4.0
        return cost
```

---

### Day 15: Testing & Optimization (4-6 hours)

#### 3.6 Load Testing
```bash
# Test backend TTS under load
artillery quick --count 100 --num 10 \
  http://localhost:8000/api/v1/tts/speak

# Monitor cache hit rate
redis-cli --stat

# Check Google Cloud TTS quota
gcloud services quota describe \
  texttospeech.googleapis.com/default
```

#### 3.7 Cost Optimization
- Implement text chunking for long messages
- Deduplicate similar texts
- Compression (MP3 → Opus for bandwidth)
- CDN for popular audio files

---

## 📊 Phase 3 Deliverables

**New Infrastructure**:
- ✅ Backend TTS endpoint (FastAPI)
- ✅ Google Cloud TTS integration
- ✅ Redis caching layer
- ✅ S3/R2 storage for audio files
- ✅ Smart provider selection
- ✅ SSML support
- ✅ Analytics & monitoring

**Cost Management**:
- Free tier: 4M chars/month (Google)
- Expected: $5-10/month for 1000 users
- Cache hit rate: target 80%+

---

## 🎨 Phase 4: Advanced Features (Future)

**Timeline**: Month 2+
**Effort**: 40+ hours
**Cost**: $50-200/month

### 4.1 Voice Cloning (ElevenLabs)
- Custom agent voices
- Emotion & style control
- Multiple languages

### 4.2 Real-time Streaming
- WebSocket TTS streaming
- Instant first-word playback
- Lower latency (<100ms)

### 4.3 Voice Personas
- Different moods (serious, friendly, urgent)
- Context-aware tone
- Dynamic emotion injection

### 4.4 Multilingual Support
- Auto language detection
- On-the-fly translation + TTS
- Regional accents (PT-PT, PT-BR variants)

### 4.5 Voice Analytics Dashboard
- User engagement metrics
- Popular agent voices
- Quality feedback
- A/B testing results

---

## 📈 Success Metrics

### Phase 1 (MVP) Goals
- [ ] 10%+ users enable voice feature
- [ ] 5+ messages spoken per active user
- [ ] <1% error rate
- [ ] 4.0+ satisfaction rating

### Phase 2 Goals
- [ ] 20%+ users enable voice
- [ ] 5%+ use voice input (STT)
- [ ] 10+ messages per session

### Phase 3 Goals
- [ ] 30%+ users enable voice
- [ ] 80%+ cache hit rate
- [ ] <$20/month cost
- [ ] <200ms latency (p95)

### Phase 4 Goals
- [ ] 50%+ users enable voice
- [ ] Premium feature conversion: 10%
- [ ] 4.5+ satisfaction rating
- [ ] Multi-language support: 3+ languages

---

## 🔧 Technical Requirements

### Frontend
- **Node.js**: ≥18.0.0
- **Next.js**: 15.x
- **TypeScript**: ≥5.0.0
- **Dependencies**:
  - `zustand` (state management)
  - `lucide-react` (icons)

### Backend (Phase 3+)
- **Python**: ≥3.11
- **FastAPI**: ≥0.104.0
- **Dependencies**:
  ```bash
  pip install google-cloud-texttospeech
  pip install redis
  pip install boto3  # for S3/R2
  ```

### Environment Variables
```bash
# Backend (.env)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
TTS_CACHE_BUCKET=cidadao-tts-cache

# Frontend (.env.local)
NEXT_PUBLIC_TTS_BACKEND_URL=https://api.cidadao.ai/api/v1/tts
NEXT_PUBLIC_ENABLE_BACKEND_TTS=true
```

---

## 🚦 Quality Checklist

### Code Quality
- [ ] TypeScript strict mode
- [ ] ESLint passing
- [ ] Prettier formatted
- [ ] No console errors
- [ ] Accessibility (WCAG AA)
- [ ] Mobile responsive

### Performance
- [ ] Lazy loading components
- [ ] Code splitting
- [ ] Asset optimization
- [ ] Lighthouse score: 90+

### Testing
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Browser compatibility tests
- [ ] Performance tests

### Documentation
- [ ] Feature documentation
- [ ] API documentation
- [ ] User guide
- [ ] Developer guide
- [ ] Changelog

---

## 🎯 Go-Live Checklist

### Pre-Launch
- [ ] Feature complete (Phase 1 + 2)
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Accessibility audit passed
- [ ] User testing completed (10+ users)

### Launch
- [ ] Deploy to production
- [ ] Enable feature flag
- [ ] Monitor error rates
- [ ] Track analytics
- [ ] Collect user feedback

### Post-Launch
- [ ] Weekly metrics review
- [ ] Address user feedback
- [ ] Optimize based on data
- [ ] Plan Phase 3 (if metrics positive)

---

## 📞 Support & Resources

### Documentation
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- Google Cloud TTS: https://cloud.google.com/text-to-speech
- ElevenLabs: https://docs.elevenlabs.io/

### Tools
- Browser compatibility: https://caniuse.com/speech-synthesis
- Audio testing: Chrome DevTools → Media panel
- Analytics: Google Analytics 4

### Team Contacts
- **Product**: Anderson Henrique (Product Owner)
- **Backend**: Backend team (TTS API integration)
- **Frontend**: Frontend team (UI implementation)
- **QA**: QA team (testing & validation)

---

## 🎉 Summary

This roadmap provides a comprehensive, phased approach to implementing voice features in Cidadão.AI frontend:

1. **Phase 1 (Week 1)**: Ship MVP with Web Speech API - zero cost, immediate value
2. **Phase 2 (Week 2)**: Add STT + enhancements - still zero cost
3. **Phase 3 (Week 3)**: Optional premium backend - only if metrics justify
4. **Phase 4 (Future)**: Advanced features - scale with success

**Start Date**: Ready to begin
**First Release**: 1 week from start
**Full Feature Set**: 2-3 weeks
**Investment**: $0 initially, scales with success

Let's build the most accessible Brazilian transparency platform! 🚀🎙️
