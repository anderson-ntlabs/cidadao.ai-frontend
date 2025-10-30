# Voice Feature - Debug Guide

**Author**: Anderson Henrique da Silva
**Date**: 2025-10-30
**Status**: Debugging

---

## 🐛 Problema Reportado

A feature de voz não está funcionando corretamente no chat.

## 🔍 Diagnóstico

### Código Implementado

1. **VoiceButton Component** (`components/voice/voice-button.tsx`)
   - ✅ Implementado
   - ✅ Hooks corretos (useEffect após todos os hooks)
   - ⚠️ Retorna `null` se não suportado ou desabilitado

2. **MessageBubble Integration** (`components/chat/message-bubble.tsx`)
   - ✅ Import correto
   - ✅ VoiceButton renderizado para mensagens do assistente
   - ✅ agentId passado corretamente

3. **Chat Page** (`app/pt/app/chat/page.tsx`)
   - ✅ agentId passado para MessageBubble

### Possíveis Causas

#### 1. Voz Desabilitada por Padrão
```typescript
// store/voice-store.ts
const defaultSettings: VoiceSettings = {
  enabled: false,  // ⚠️  DESABILITADO POR PADRÃO!
  autoSpeak: false,
  volume: 1.0,
  rate: 1.0,
  pitch: 1.0,
}
```

**Solução**: Usuário precisa ativar em Configurações primeiro.

#### 2. Web Speech API Não Disponível
- Alguns navegadores não suportam
- HTTPS necessário em produção
- Algumas configurações de privacidade bloqueiam

#### 3. VoiceButton Retorna Null
```typescript
// O componente não renderiza nada se:
if (!isSupported || !settings.enabled) {
  return null  // ⚠️  Invisível para o usuário
}
```

## 🔧 Como Testar

### Passo 1: Verificar Suporte do Navegador

Abra o console do navegador (F12) e execute:

```javascript
console.log('Web Speech API suportada:', 'speechSynthesis' in window);

if ('speechSynthesis' in window) {
  const voices = speechSynthesis.getVoices();
  console.log('Vozes disponíveis:', voices.length);
  console.log('Vozes PT-BR:', voices.filter(v => v.lang.includes('pt')).length);
}
```

### Passo 2: Ativar a Feature

1. Acesse: `http://localhost:3001/pt/app/configuracoes`
2. Role até "Voz e Áudio"
3. Ative o switch "Ativar Voz"
4. Ajuste volume/velocidade se necessário

### Passo 3: Verificar Store

No console do navegador:

```javascript
const storeData = localStorage.getItem('cidadao-voice-settings');
if (storeData) {
  const parsed = JSON.parse(storeData);
  console.log('Voz habilitada:', parsed.state.settings.enabled);
  console.log('Settings:', parsed.state.settings);
} else {
  console.log('⚠️  Store não inicializado');
}
```

### Passo 4: Testar no Chat

1. Acesse: `http://localhost:3001/pt/app/chat`
2. Envie uma mensagem
3. Procure o botão de voz (ícone de play) nas ações da resposta
4. Clique no botão

### Passo 5: Verificar Renderização

No console, execute:

```javascript
// Verificar se VoiceButton está no DOM
const voiceButtons = document.querySelectorAll('[aria-label*="Ouvir"]');
console.log('Botões de voz encontrados:', voiceButtons.length);

// Verificar settings
if (window.localStorage) {
  const settings = localStorage.getItem('cidadao-voice-settings');
  console.log('Settings存在:', !!settings);
  if (settings) {
    const parsed = JSON.parse(settings);
    console.log('Voz habilitada:', parsed.state?.settings?.enabled);
  }
}
```

## 🎯 Soluções Rápidas

### Solução 1: Habilitar por Padrão (Desenvolvimento)

Edite `store/voice-store.ts`:

```typescript
const defaultSettings: VoiceSettings = {
  enabled: true,  // ✅ Habilitado para debug
  autoSpeak: false,
  volume: 1.0,
  rate: 1.0,
  pitch: 1.0,
}
```

### Solução 2: Adicionar Indicador Visual

Quando a voz está desabilitada, mostrar um aviso:

```typescript
// Em MessageBubble, antes do VoiceButton:
{role === 'assistant' && !settings.enabled && (
  <Tooltip content="Ative a voz em Configurações">
    <Button variant="ghost" size="icon" disabled>
      <VolumeX className="h-4 w-4" />
    </Button>
  </Tooltip>
)}
```

### Solução 3: Forçar Renderização (Debug)

Temporariamente remover o early return em `voice-button.tsx`:

```typescript
// Comentar estas linhas para debug:
// if (!isSupported || !settings.enabled) {
//   return null
// }

// Substituir por:
if (!isSupported) {
  return <div className="text-xs text-red-500">Não suportado</div>
}

if (!settings.enabled) {
  return <div className="text-xs text-yellow-500">Desabilitado</div>
}
```

## 📊 Checklist de Verificação

### Antes do Chat

- [ ] Navegador suporta Web Speech API
- [ ] Pelo menos 1 voz em português disponível
- [ ] Feature ativada em Configurações
- [ ] Settings salvos no localStorage

### No Chat

- [ ] MessageBubble recebe agentId
- [ ] VoiceButton é renderizado (não retorna null)
- [ ] Botão visível nas ações da mensagem
- [ ] Botão responde ao click
- [ ] Som é reproduzido

### Funcionalidades Avançadas

- [ ] Pause/Resume funciona
- [ ] Stop funciona (botão X)
- [ ] Vozes diferentes por agente
- [ ] Auto-speak funciona (se ativado)
- [ ] Atalhos de teclado funcionam

## 🚨 Erros Comuns

### Erro 1: "speechSynthesis is not defined"

**Causa**: Web Speech API não disponível
**Solução**: Usar navegador compatível (Chrome, Edge, Safari)

### Erro 2: Botão não aparece

**Causa**: Voz desabilitada ou não suportada
**Solução**: Ativar em Configurações

### Erro 3: Nenhum som

**Causa**:
- Volume do sistema baixo
- Voz não carregada
- Erro no utterance

**Solução**:
- Verificar volume do sistema
- Recarregar página (reload voices)
- Ver console para erros

### Erro 4: Vozes não carregam

**Causa**: Voices ainda não foram carregadas pelo navegador
**Solução**: Aguardar evento `voiceschanged`:

```javascript
speechSynthesis.onvoiceschanged = () => {
  console.log('Vozes carregadas:', speechSynthesis.getVoices().length);
};
```

## 🔍 Logs de Debug

Adicione estes logs para diagnóstico:

```typescript
// No VoiceButton
console.log('[VoiceButton] Rendered', {
  isSupported,
  enabled: settings.enabled,
  text: text.substring(0, 50) + '...',
  agentId
});

// No handleSpeak
console.log('[VoiceButton] Speaking', {
  isSpeaking,
  isPaused,
  agentId,
  textLength: text.length
});

// No TTS Service
console.log('[TTS] Speak called', {
  textLength: text.length,
  agentId,
  hasProfile: !!this.agentProfiles[agentId],
  voicesAvailable: this.synthesis?.getVoices().length
});
```

## 📱 Teste em Produção

### Diferenças de Produção

1. **HTTPS Obrigatório**: Alguns navegadores exigem HTTPS para TTS
2. **Service Worker**: Pode interferir com recursos
3. **CSP Headers**: Pode bloquear inline speech
4. **Mobile**: Comportamento diferente em iOS/Android

### Teste em Produção (Vercel)

1. Deploy para Vercel
2. Acesse via HTTPS
3. Teste em diferentes navegadores:
   - Chrome Desktop
   - Chrome Mobile (Android)
   - Safari Desktop
   - Safari Mobile (iOS)
   - Edge
   - Firefox

## 🎓 Referências

- [Web Speech API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Browser Compatibility](https://caniuse.com/speech-synthesis)
- [SpeechSynthesis Interface](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
- [SpeechSynthesisUtterance](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance)

---

## 🎯 Próximos Passos

1. [ ] Executar todos os testes deste guia
2. [ ] Identificar causa raiz do problema
3. [ ] Aplicar solução apropriada
4. [ ] Testar em múltiplos navegadores
5. [ ] Documentar resultado

---

**Última Atualização**: 2025-10-30
**Status**: Em Investigação
