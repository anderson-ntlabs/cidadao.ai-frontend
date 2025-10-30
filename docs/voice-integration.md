# Voice Integration - Cidadão.AI Frontend

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-01-30 15:45:00 -0300

---

## 🎤 Overview

This document describes the complete voice integration implementation for the Cidadão.AI frontend chat system. The integration provides:

- **Text-to-Speech (TTS)**: Play agent responses with unique Chirp3-HD voices
- **Speech-to-Text (STT)**: Voice input for user messages
- **16 Unique Agent Voices**: Each agent has their own mythological voice identity

---

## 📁 Architecture

### Components Structure

```
components/voice/
├── voice-player.tsx          # TTS playback component
├── voice-recorder.tsx        # STT recording component
└── index.ts                  # Barrel export

lib/services/
└── voice-manager.service.ts  # Core voice service with caching

components/chat/
└── message-bubble.tsx        # Updated with VoicePlayer integration

app/pt/app/chat/
└── page.tsx                  # Updated with VoiceRecorder integration
```

---

## 🎯 Features Implemented

### 1. VoiceManager Service (`lib/services/voice-manager.service.ts`)

**Responsibilities**:
- Synthesize text to speech via backend API
- Manage audio playback
- Cache audio blobs (LRU with 50 items)
- Queue management for sequential playback
- Transcribe audio to text

**Key Methods**:

```typescript
// Synthesize voice (with caching)
await voiceManager.synthesize(text, agentId?, options?)

// Play audio blob
await voiceManager.play(blob)

// Synthesize and play (convenience)
await voiceManager.synthesizeAndPlay(text, agentId?, options?)

// Stop playback
voiceManager.stop()

// Transcribe audio
const result = await voiceManager.transcribe(audioBlob, 'pt-BR')

// Queue management
voiceManager.addToQueue(agentId, text, priority)
voiceManager.clearQueue()

// Cache management
voiceManager.clearCache()
const stats = voiceManager.getCacheStats()
```

**Caching Strategy**:
- LRU (Least Recently Used) cache
- Max 50 audio files
- Cache key: `${agentId}:${text.substring(0, 100)}`
- Automatic eviction when full

---

### 2. VoicePlayer Component (`components/voice/voice-player.tsx`)

**Purpose**: Add voice playback to chat messages

**Props**:
```typescript
interface VoicePlayerProps {
  text: string              // Text to synthesize
  agentId?: string          // Agent ID for voice selection
  agentName?: string        // Agent name for accessibility
  className?: string        // Custom styling
  size?: 'sm' | 'md' | 'lg'          // Button size
  variant?: 'default' | 'minimal' | 'badge'  // Style variant
  autoPlay?: boolean        // Auto-play on mount
}
```

**Features**:
- ✅ Loading state with spinner
- ✅ Play/stop toggle
- ✅ Error handling with visual feedback
- ✅ Accessibility labels
- ✅ Touch-friendly mobile design
- ✅ Three size options (sm, md, lg)
- ✅ Three visual variants

**Usage Example**:
```tsx
<VoicePlayer
  text="Olá! Sou Drummond, o poeta do povo."
  agentId="drummond"
  agentName="Drummond"
  size="md"
  variant="default"
/>
```

---

### 3. VoiceRecorder Component (`components/voice/voice-recorder.tsx`)

**Purpose**: Enable voice input for chat messages

**Props**:
```typescript
interface VoiceRecorderProps {
  onTranscript: (text: string) => void  // Callback with transcribed text
  className?: string        // Custom styling
  size?: 'sm' | 'md' | 'lg'          // Button size
  variant?: 'default' | 'primary'    // Style variant
  disabled?: boolean        // Disable recording
}
```

**Features**:
- ✅ Microphone permission check
- ✅ Recording timer display
- ✅ Audio processing indicator
- ✅ High-quality audio capture (44.1kHz, echo cancellation)
- ✅ Automatic transcription via backend
- ✅ Confidence score display
- ✅ Error handling

**Usage Example**:
```tsx
<VoiceRecorder
  onTranscript={(text) => setInputMessage(text)}
  size="md"
  variant="primary"
  disabled={false}
/>
```

**Workflow**:
1. User clicks microphone button
2. Request microphone permission (if needed)
3. Start recording with visual feedback
4. User clicks again to stop
5. Audio sent to backend `/api/v1/voice/transcribe`
6. Transcribed text returned via callback
7. Text inserted into input field

---

### 4. MessageBubble Integration

**Changes Made**:
- Added `agentId` prop
- Integrated `VoicePlayer` in quick actions
- Voice button appears on hover (desktop) or always visible (mobile)
- Only shown for assistant messages with content

**Quick Actions Order**:
```
[🔊 Voice] | [📋 Copy] [🔗 Share] [💾 Export] | [👍 Like] [👎 Dislike]
```

---

### 5. Chat Page Integration

**Changes Made**:
- Added `VoiceRecorder` in input area
- Positioned before textarea
- Updated placeholder: "Digite ou fale sua pergunta..."
- Passed `agentId` to `MessageBubble`
- Voice transcript auto-fills textarea and focuses it

**Layout**:
```
[🎤 Mic] [Textarea with voice prompt] [➤ Send]
```

---

## 🔌 Backend Integration

### API Endpoints Used

#### 1. Text-to-Speech (Synthesize)
```
POST /api/v1/voice/synthesize
```

**Request**:
```json
{
  "text": "Olá, sou Drummond",
  "agent_id": "drummond",
  "output_format": "mp3"
}
```

**Response**: Binary MP3 audio file

#### 2. Speech-to-Text (Transcribe)
```
POST /api/v1/voice/transcribe
```

**Request**: `multipart/form-data`
- `audio_file`: Audio blob (webm/mp3)
- `language_code`: "pt-BR"

**Response**:
```json
{
  "transcript": "Quais contratos você pode analisar?",
  "confidence": 0.94,
  "language_code": "pt-BR",
  "metadata": {
    "duration_seconds": 3.2,
    "audio_format": "webm"
  }
}
```

---

## 🎭 Agent Voices

### Complete Voice Mapping

| Agent | Voice Name | Gender | Speed | Mythology |
|-------|------------|--------|-------|-----------|
| Abaporu | Rasalgethi | Male | 1.0x | Head of Serpent Charmer (α Herculis) |
| Zumbi | Fenrir | Male | 0.95x | Norse wolf who breaks chains |
| Anita | Callirrhoe | Female | 1.05x | Beautiful Flow (Greek nymph) |
| Drummond | Zephyr | Female | 1.0x | Gentle west wind (Greek mythology) |
| Senna | Algenib | Male | 1.15x | Wing of Pegasus (γ Pegasi) |
| Tiradentes | Schedar | Male | 0.95x | Breast of Cassiopeia (α Cassiopeiae) |
| Machado | Iapetus | Male | 0.85x | Titan of mortality (Saturn moon) |
| Nanã | Leda | Female | 0.85x | Mother of Helen of Troy (Jupiter moon) |

*(Full list of 16 voices in backend documentation)*

---

## 🧪 Testing

### Manual Testing Checklist

#### Text-to-Speech (TTS)
- [ ] Click voice button on assistant message
- [ ] Audio plays with correct agent voice
- [ ] Loading state shows spinner
- [ ] Stop button works during playback
- [ ] Cache works (second play is instant)
- [ ] Error handling for network failure
- [ ] Mobile touch-friendly buttons

#### Speech-to-Text (STT)
- [ ] Click microphone button
- [ ] Permission request works
- [ ] Recording starts with visual feedback
- [ ] Timer counts up during recording
- [ ] Stop recording works
- [ ] Processing indicator shows
- [ ] Transcript appears in textarea
- [ ] Confidence score shown in toast
- [ ] Error handling for no speech detected

#### Integration
- [ ] Voice button appears in message actions
- [ ] Voice recorder appears in input area
- [ ] Both components work together
- [ ] No console errors
- [ ] Accessibility labels present
- [ ] Works in both light/dark mode

---

## 🎨 UI/UX Details

### Visual Feedback States

**VoicePlayer**:
- Default: Gray speaker icon
- Loading: Spinning loader
- Playing: Green speaker with X (stop icon)
- Error: Red speaker icon

**VoiceRecorder**:
- Default: Gray microphone icon
- Recording: Pulsing red mic with timer
- Processing: Blue "Processando..." badge
- Error: Permission denied state

### Accessibility

**ARIA Labels**:
- VoicePlayer: "Reproduzir mensagem em áudio" / "Parar reprodução de áudio"
- VoiceRecorder: "Iniciar gravação de áudio" / "Parar gravação de áudio"

**Keyboard Support**:
- Buttons are focusable
- Space/Enter to activate
- Visual focus indicators

**Screen Reader Announcements**:
- "Gravando. Fale sua mensagem..." (recording start)
- "Transcrição completa. Confiança: XX%" (transcription success)
- Error messages announced

---

## ⚙️ Configuration

### Environment Variables

No additional environment variables needed. Uses existing:

```bash
NEXT_PUBLIC_API_URL=https://cidadao-api-production.up.railway.app
```

### Browser Permissions

**Required**:
- Microphone access for voice recording
- Audio playback (no permission needed)

**Fallback Behavior**:
- If microphone denied: Recorder disabled with visual indication
- If audio blocked: Error toast shown, user can retry

---

## 🚀 Performance Optimizations

### Caching Strategy
- LRU cache with 50 items max
- Cache key based on agent + first 100 chars
- Instant playback for cached audio
- Automatic eviction when full

### Lazy Loading
- Components are not lazy-loaded (need hooks)
- But audio synthesis is on-demand only

### Network Optimization
- Binary MP3 format (compressed)
- WebM audio for recording (compressed)
- No preloading of common phrases (yet)

---

## 🔮 Future Enhancements

### Planned Features
1. **Auto-play Preference**: User setting to auto-play agent responses
2. **Voice Speed Control**: Adjust playback speed (0.5x - 2x)
3. **Voice Selection**: Choose different voices per agent
4. **Preload Common Phrases**: Cache frequent responses
5. **Offline Support**: Service Worker caching of audio
6. **Waveform Visualization**: Show audio waveform during playback
7. **Streaming TTS**: Real-time audio generation during message typing

### Settings Page Integration
Add voice preferences to user settings:
- Enable/disable auto-play
- Adjust default volume
- Voice speed preference
- Clear voice cache button

---

## 📝 Commit History

```bash
# Initial voice integration
feat(voice): add complete TTS/STT integration with 16 agent voices

- Implement VoiceManager service with caching and queue
- Create VoicePlayer component for message playback
- Create VoiceRecorder component for voice input
- Integrate voice controls into chat interface
- Update MessageBubble with voice playback button
- Add voice input to chat page
- Implement LRU cache for audio blobs (50 items)
- Add microphone permission handling
- Include accessibility features (ARIA, keyboard support)

Backend integration:
- /api/v1/voice/synthesize - Text-to-speech
- /api/v1/voice/transcribe - Speech-to-text
- 16 unique Chirp3-HD premium voices
- Automatic voice selection per agent
```

---

## 🐛 Known Issues

### Current Limitations
1. **No Streaming TTS**: Audio generated after full message complete
2. **WebSocket Not Supported**: Voice works only with REST API
3. **No Voice Cache Persistence**: Cache cleared on page refresh
4. **Audio Format**: WebM for recording (may need conversion for some backends)
5. **No Background Recording**: Tab must be active during recording

### Browser Compatibility
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support (iOS 14.5+)
- ⚠️ Safari < 14.5: Limited getUserMedia support
- ❌ IE11: Not supported (modern browsers only)

---

## 📚 References

- Backend Voice Integration Guide: `cidadao.ai-backend/docs/frontend-voice-integration-guide.md`
- Google Cloud Text-to-Speech: https://cloud.google.com/text-to-speech
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- MediaRecorder API: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

---

**Status**: ✅ Complete and Ready for Testing
**Version**: 1.0.0
**Last Updated**: 2025-01-30
