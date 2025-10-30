# 🎙️ Instruções para Testar a Feature de Voz

**Autor**: Anderson Henrique da Silva
**Data**: 2025-10-30

---

## 📋 Pré-requisitos

1. ✅ Servidor dev rodando: `npm run dev`
2. ✅ Navegador com Web Speech API (Chrome, Edge, Safari)
3. ✅ Som ativado no sistema

---

## 🚀 Passo a Passo - Teste Rápido

### 1. Limpar Cache (Importante!)

Abra o DevTools (F12) e execute no Console:

```javascript
// Limpar localStorage para aplicar novas configurações
localStorage.removeItem('cidadao-voice-settings')
console.log('✅ Cache de voz limpo! Recarregue a página.');
```

**Depois, recarregue a página (F5 ou Ctrl+R)**

### 2. Verificar Auto-Enable

No console, verifique:

```javascript
const settings = localStorage.getItem('cidadao-voice-settings')
if (settings) {
  const parsed = JSON.parse(settings)
  console.log('Voz habilitada:', parsed.state.settings.enabled)
} else {
  console.log('Settings não inicializados ainda')
}
```

**Esperado**: `enabled: true` em desenvolvimento

### 3. Acessar o Chat

1. Vá para: http://localhost:3001/pt/app/chat
2. Faça login (se necessário)
3. Envie uma mensagem (qualquer pergunta)

### 4. Procurar o Botão de Voz

Na resposta do assistente, procure pelos botões de ação:

```
[Copiar] [Compartilhar] [Exportar] [▶️ PLAY] | [👍] [👎]
                                      ↑
                                  Botão de voz
```

### 5. Verificar Console

Você deve ver logs como:

```
[VoiceButton] Render {
  isSupported: true,
  enabled: true,
  willRender: true,
  agentId: "abaporu",
  textPreview: "Olá! Como posso ajudar você a entender melhor..."
}
```

### 6. Clicar no Botão

1. Clique no botão ▶️ Play
2. Deve começar a falar a mensagem
3. Console deve mostrar:

```
[VoiceButton] handleSpeak called {
  isSpeaking: false,
  isPaused: false,
  agentId: "abaporu",
  textLength: 245,
  enabled: true
}
```

---

## 🔍 Diagnóstico de Problemas

### Problema 1: Botão Não Aparece

**Verifique no console:**

```javascript
// Teste 1: API suportada?
console.log('Speech API:', 'speechSynthesis' in window)

// Teste 2: Voz habilitada?
const settings = localStorage.getItem('cidadao-voice-settings')
if (settings) {
  console.log('Enabled:', JSON.parse(settings).state.settings.enabled)
}

// Teste 3: Botões no DOM?
const buttons = document.querySelectorAll('[aria-label*="Ouvir"]')
console.log('Botões encontrados:', buttons.length)
```

**Solução**:
- Se API não suportada → Use Chrome/Edge/Safari
- Se não habilitado → Limpe localStorage e recarregue
- Se botões = 0 → Verifique console para erros

### Problema 2: Botão Aparece Mas Não Fala

**Verifique:**

1. Volume do sistema não está mudo
2. Console mostra erros de TTS
3. Vozes carregadas:

```javascript
speechSynthesis.getVoices().forEach(v => {
  if (v.lang.includes('pt')) {
    console.log(v.name, v.lang)
  }
})
```

**Solução**:
- Verificar volume do sistema
- Recarregar página (vozes podem não ter carregado)
- Testar voz manualmente:

```javascript
const u = new SpeechSynthesisUtterance('Teste')
u.lang = 'pt-BR'
speechSynthesis.speak(u)
```

### Problema 3: Todas as Vozes Iguais

**Teste perfis de agentes:**

```javascript
// No console
const profiles = {
  zumbi: { pitch: 0.8, rate: 0.9 },
  anita: { pitch: 1.2, rate: 1.0 },
  senna: { pitch: 1.1, rate: 1.2 }
}

Object.entries(profiles).forEach(([name, config]) => {
  const u = new SpeechSynthesisUtterance(`Olá, eu sou ${name}`)
  u.lang = 'pt-BR'
  u.pitch = config.pitch
  u.rate = config.rate
  speechSynthesis.speak(u)
})
```

**Esperado**: Vozes notavelmente diferentes

---

## 🎯 Checklist Completo

### Básico
- [ ] Web Speech API disponível no navegador
- [ ] Voz auto-habilitada em desenvolvimento
- [ ] Botão aparece nas mensagens do assistente
- [ ] Clicar no botão reproduz a mensagem
- [ ] Console mostra logs de debug

### Funcionalidades
- [ ] Pause/Resume funciona (botão muda para Pause quando falando)
- [ ] Stop funciona (botão X aparece quando falando)
- [ ] Vozes diferentes para diferentes agentes
- [ ] Atalhos de teclado funcionam:
  - [ ] Ctrl+Shift+S toggle voz
  - [ ] Ctrl+Shift+P pause/resume
  - [ ] Esc para stop

### Configurações
- [ ] Painel de configurações acessível (Configurações → Voz e Áudio)
- [ ] Toggle enable/disable funciona
- [ ] Sliders de volume/velocidade/tom funcionam
- [ ] Botão "Testar" em cada agente funciona
- [ ] Settings são salvos no localStorage

---

## 🧪 Testes Automatizados

### Script de Teste no Navegador

Cole no console:

```javascript
// Test Suite Completo
console.log('🧪 INICIANDO TESTE DE VOZ\n')

// 1. Verificar API
console.log('1️⃣ Web Speech API:', 'speechSynthesis' in window ? '✅' : '❌')

// 2. Verificar Settings
const settings = localStorage.getItem('cidadao-voice-settings')
console.log('2️⃣ Settings existem:', settings ? '✅' : '❌')
if (settings) {
  const parsed = JSON.parse(settings)
  console.log('   Voz habilitada:', parsed.state.settings.enabled ? '✅' : '❌')
}

// 3. Verificar Vozes
const voices = speechSynthesis.getVoices()
const ptVoices = voices.filter(v => v.lang.includes('pt'))
console.log('3️⃣ Vozes disponíveis:', voices.length)
console.log('   Vozes PT-BR:', ptVoices.length, ptVoices.length > 0 ? '✅' : '❌')

// 4. Verificar Botões no DOM
const buttons = document.querySelectorAll('[aria-label*="Ouvir"]')
console.log('4️⃣ Botões no DOM:', buttons.length, buttons.length > 0 ? '✅' : '❌')

// 5. Teste de Fala
console.log('5️⃣ Testando fala...')
const test = new SpeechSynthesisUtterance('Teste de voz do Cidadão ponto AI')
test.lang = 'pt-BR'
test.onstart = () => console.log('   ▶️  Reproduzindo... ✅')
test.onend = () => console.log('   ✅ Concluído!')
test.onerror = (e) => console.error('   ❌ Erro:', e.error)
speechSynthesis.speak(test)

console.log('\n✅ TESTE COMPLETO!')
```

---

## 📱 Teste em Produção

### Diferenças Importantes

1. **HTTPS Obrigatório**: Alguns navegadores exigem HTTPS
2. **Voz Desabilitada por Padrão**: Em produção, `enabled: false`
3. **Service Worker**: Pode afetar comportamento

### Como Testar

1. Deploy para Vercel
2. Acesse via HTTPS
3. Vá em Configurações → Ative a voz manualmente
4. Teste no chat

---

## 💡 Dicas

1. **Sempre limpe o localStorage** ao testar mudanças
2. **Recarregue a página** após limpar cache
3. **Use Chrome DevTools** para ver todos os logs
4. **Teste em modo anônimo** para ambiente limpo
5. **Verifique volume do sistema** antes de reportar bugs

---

## 🆘 Suporte

Se nada funcionar, forneça estas informações:

```javascript
// Cole isso no console e copie o resultado
console.log('DEBUG INFO:', {
  browser: navigator.userAgent,
  speechAPI: 'speechSynthesis' in window,
  voices: speechSynthesis.getVoices().length,
  ptVoices: speechSynthesis.getVoices().filter(v => v.lang.includes('pt')).length,
  settings: localStorage.getItem('cidadao-voice-settings'),
  buttonsInDOM: document.querySelectorAll('[aria-label*="Ouvir"]').length,
  url: window.location.href,
  nodeEnv: process.env.NODE_ENV
})
```

---

**Última Atualização**: 2025-10-30
**Status**: Ready for Testing
