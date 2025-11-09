/**
 * Test Voice Feature
 *
 * Comprehensive test for TTS voice functionality
 *
 * @author Anderson Henrique da Silva
 * @date 2025-10-30
 */

console.log('🎙️ TESTE DE FUNCIONALIDADE DE VOZ\n')
console.log('━'.repeat(80))

// Test 1: Check if Web Speech API is available
console.log('\n📋 TESTE 1: Verificando Web Speech API...\n')

if (typeof window === 'undefined') {
  console.log('⚠️  Executando em Node.js - Web Speech API não disponível')
  console.log('   Este teste precisa ser executado em um navegador')
  console.log('\n💡 Como testar:')
  console.log('   1. Abra http://localhost:3001')
  console.log('   2. Abra o Console do navegador (F12)')
  console.log('   3. Cole e execute este script:')
  console.log('\n')

  const browserTest = `
// Test Voice Feature in Browser
console.log('🎙️ TESTE DE VOZ NO NAVEGADOR\\n');

// 1. Check API availability
console.log('1️⃣ Web Speech API disponível:', 'speechSynthesis' in window);
console.log('');

// 2. List available voices
if ('speechSynthesis' in window) {
  const getVoices = () => {
    const voices = speechSynthesis.getVoices();
    console.log('2️⃣ Vozes disponíveis:', voices.length);

    const ptBrVoices = voices.filter(v => v.lang.includes('pt'));
    console.log('   Vozes em Português:', ptBrVoices.length);

    if (ptBrVoices.length > 0) {
      console.log('\\n   Exemplos:');
      ptBrVoices.slice(0, 3).forEach(v => {
        console.log(\`   - \${v.name} (\${v.lang})\`);
      });
    }
    console.log('');

    // 3. Test basic TTS
    console.log('3️⃣ Testando síntese de voz...');
    const utterance = new SpeechSynthesisUtterance('Olá, eu sou o Cidadão ponto AI');
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => console.log('   ▶️  Reproduzindo...');
    utterance.onend = () => console.log('   ✅ Concluído!');
    utterance.onerror = (e) => console.error('   ❌ Erro:', e.error);

    speechSynthesis.speak(utterance);
  };

  // Load voices (might be async)
  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.onvoiceschanged = getVoices;
  } else {
    getVoices();
  }

  // 4. Test agent voice profiles
  setTimeout(() => {
    console.log('\\n4️⃣ Testando perfis de agentes...');

    const agentProfiles = {
      zumbi: { name: 'Zumbi', pitch: 0.8, rate: 0.9 },
      anita: { name: 'Anita', pitch: 1.2, rate: 1.0 },
      senna: { name: 'Senna', pitch: 1.1, rate: 1.2 }
    };

    Object.entries(agentProfiles).forEach(([id, profile], index) => {
      setTimeout(() => {
        console.log(\`   🎤 Testando voz de \${profile.name}...\`);
        const utterance = new SpeechSynthesisUtterance(
          \`Olá, eu sou \${profile.name}\`
        );
        utterance.lang = 'pt-BR';
        utterance.pitch = profile.pitch;
        utterance.rate = profile.rate;
        utterance.volume = 1.0;

        utterance.onend = () => {
          console.log(\`   ✅ \${profile.name}: pitch=\${profile.pitch}, rate=\${profile.rate}\`);
        };

        speechSynthesis.speak(utterance);
      }, index * 3000);
    });
  }, 2000);

  // 5. Test store integration
  setTimeout(() => {
    console.log('\\n5️⃣ Verificando integração com store...');

    try {
      // Check if store exists
      const storeData = localStorage.getItem('cidadao-voice-settings');
      if (storeData) {
        const settings = JSON.parse(storeData);
        console.log('   ✅ Store encontrado:', {
          enabled: settings.state.settings.enabled,
          volume: settings.state.settings.volume,
          rate: settings.state.settings.rate,
          pitch: settings.state.settings.pitch
        });
      } else {
        console.log('   ⚠️  Store não inicializado (use as configurações primeiro)');
      }
    } catch (error) {
      console.error('   ❌ Erro ao verificar store:', error.message);
    }
  }, 10000);
}
`

  console.log(browserTest)
  console.log('\n━'.repeat(80))
} else {
  // Running in browser
  console.log('✅ Executando em navegador')
  eval(browserTest)
}

console.log('\n📝 CHECKLIST DE VERIFICAÇÃO:\n')
console.log('□ Web Speech API disponível no navegador')
console.log('□ Pelo menos uma voz em português disponível')
console.log('□ Botão de voz aparece nas mensagens do chat')
console.log('□ Clicar no botão reproduz a mensagem')
console.log('□ Vozes diferentes para cada agente')
console.log('□ Configurações salvas no localStorage')
console.log('□ Atalhos de teclado funcionando (Ctrl+Shift+S, Ctrl+Shift+P, Esc)')
console.log('□ Botão de pause/resume funciona')
console.log('□ Auto-speak funciona quando ativado')
console.log('')

console.log('━'.repeat(80))
console.log('\n✅ TESTE COMPLETO!\n')
