# Guia de Acessibilidade Educacional

> Diretrizes de acessibilidade para a Ágora Academy

---

## 1. Visão Geral

A Ágora Academy tem compromisso com a inclusão digital e educacional. Este guia estabelece padrões de acessibilidade que garantem que todos os estudantes, independentemente de suas habilidades ou deficiências, possam ter uma experiência de aprendizagem completa.

### 1.1 Compromisso com Acessibilidade

```
+------------------------------------------------------------------+
|                    COMPROMISSO ÁGORA                              |
+------------------------------------------------------------------+
|                                                                    |
|  "A plataforma será acessível a todos, seguindo WCAG AAA e        |
|   oferecendo suporte a LIBRAS através do VLibras."                |
|                                                                    |
|   - Visão e Missão da Ágora Academy                               |
|                                                                    |
+------------------------------------------------------------------+
```

### 1.2 Padrões Seguidos

| Padrão      | Nível      | Descrição                                   |
| ----------- | ---------- | ------------------------------------------- |
| WCAG 2.1    | AAA        | Web Content Accessibility Guidelines        |
| eMAG 3.1    | Completo   | Modelo de Acessibilidade em Governo Digital |
| EN 301 549  | Aplicável  | Norma europeia de acessibilidade            |
| Section 508 | Referência | Padrão de acessibilidade dos EUA            |

---

## 2. Princípios POUR

### 2.1 Perceptível

Informação e interface devem ser apresentadas de formas perceptíveis por todos.

| Diretriz                | Implementação na Ágora                  |
| ----------------------- | --------------------------------------- |
| Alternativas em texto   | Alt text em todas as imagens            |
| Legendas e transcrições | Vídeos com legendas em PT-BR            |
| Adaptável               | Conteúdo funciona em diferentes layouts |
| Distinguível            | Contraste 7:1 em modo alto contraste    |

**Implementação de Alto Contraste**:

```typescript
// components/a11y/accessibility-panel.tsx
const toggleHighContrast = () => {
  document.documentElement.classList.toggle('high-contrast')
  localStorage.setItem('a11y_high_contrast', String(!isHighContrast))
}

// CSS global
.high-contrast {
  --foreground: #000000;
  --background: #ffffff;
  --primary: #0000ff;
  --accent: #ff0000;
  /* Contraste mínimo 7:1 */
}
```

### 2.2 Operável

Interface e navegação devem ser operáveis por todos os usuários.

| Diretriz               | Implementação na Ágora               |
| ---------------------- | ------------------------------------ |
| Teclado acessível      | Todas as funcionalidades via teclado |
| Tempo suficiente       | Sem limites de tempo obrigatórios    |
| Navegação              | Skip links, landmarks, headings      |
| Modalidades de entrada | Mouse, teclado, touch, voz           |

**Atalhos de Teclado**:

| Atalho    | Função                             |
| --------- | ---------------------------------- |
| Alt + A   | Abrir painel de acessibilidade     |
| Alt + H   | Alternar alto contraste            |
| Alt + +/- | Aumentar/diminuir tamanho da fonte |
| Alt + V   | Ativar/desativar VLibras           |
| Tab       | Navegar entre elementos focáveis   |
| Enter     | Ativar elemento focado             |
| Esc       | Fechar modal/menu                  |

### 2.3 Compreensível

Informação e operação da interface devem ser compreensíveis.

| Diretriz               | Implementação na Ágora             |
| ---------------------- | ---------------------------------- |
| Legível                | Linguagem clara, leitura fácil     |
| Previsível             | Navegação consistente              |
| Assistência na entrada | Validação clara, mensagens de erro |
| Idioma                 | PT-BR com opção de EN              |

**Níveis de Leitura**:

```typescript
// Proposta: diferentes níveis de complexidade textual
interface ContentAccessibility {
  level: 'simple' | 'standard' | 'technical'
  readingAge: number // Idade de leitura estimada
  vocabulary: 'basic' | 'intermediate' | 'advanced'
}

// Exemplo de conteúdo adaptável
const content = {
  simple: 'Um array é uma lista de coisas.',
  standard: 'Um array é uma estrutura de dados que armazena múltiplos valores.',
  technical:
    'Um array é uma estrutura de dados linear que armazena elementos de mesmo tipo em posições contíguas de memória.',
}
```

### 2.4 Robusto

Conteúdo deve ser robusto o suficiente para funcionar com diversas tecnologias.

| Diretriz            | Implementação na Ágora     |
| ------------------- | -------------------------- |
| Compatível          | HTML semântico válido      |
| Nome, função, valor | ARIA labels corretos       |
| Parsing             | Código válido sem erros    |
| Status messages     | Live regions para anúncios |

---

## 3. VLibras - Língua Brasileira de Sinais

### 3.1 Integração do VLibras

O VLibras é um widget que traduz automaticamente conteúdo textual para LIBRAS.

```typescript
// components/a11y/vlibras-lazy.tsx
export function VLibrasWidget() {
  const { isEnabled, locale } = useVLibras()

  useEffect(() => {
    if (!isEnabled || locale !== 'pt') return

    const script = document.createElement('script')
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
    script.onload = () => {
      new window.VLibras.Widget('https://vlibras.gov.br/app')
    }
    document.body.appendChild(script)
  }, [isEnabled, locale])

  return null
}
```

### 3.2 Configuração do VLibras

| Configuração | Valor                     |
| ------------ | ------------------------- |
| Ativação     | Apenas em rotas `/pt/*`   |
| Posição      | Canto inferior direito    |
| Velocidade   | Configurável pelo usuário |
| Avatar       | Maya (padrão)             |

### 3.3 Conteúdo Otimizado para LIBRAS

- Evitar jargões e siglas sem explicação
- Preferir frases curtas e diretas
- Usar vocabulário concreto quando possível
- Incluir glossário de termos técnicos

---

## 4. Acessibilidade em Conteúdo Educacional

### 4.1 Vídeos Acessíveis

| Requisito      | Especificação                  |
| -------------- | ------------------------------ |
| Legendas       | Obrigatórias em PT-BR          |
| Audiodescrição | Para conteúdo visual relevante |
| Transcrição    | Disponível para download       |
| Controles      | Acessíveis por teclado         |
| Velocidade     | Ajustável (0.5x a 2x)          |

**Exemplo de Estrutura de Vídeo**:

```typescript
interface AccessibleVideo {
  url: string
  captions: {
    language: 'pt-BR' | 'en'
    url: string // Arquivo .vtt
  }[]
  audioDescription?: {
    url: string
    language: string
  }
  transcript: {
    language: string
    content: string
  }[]
  chapters?: {
    time: number
    title: string
  }[]
}
```

### 4.2 Quizzes Acessíveis

| Requisito             | Implementação                           |
| --------------------- | --------------------------------------- |
| Navegação por teclado | Tab entre opções, Enter para selecionar |
| Feedback sonoro       | Anúncios de resultado via ARIA          |
| Tempo extra           | Opção para usuários que necessitam      |
| Formato alternativo   | Versão texto puro disponível            |

### 4.3 Exercícios de Código

| Requisito              | Implementação                             |
| ---------------------- | ----------------------------------------- |
| Editor acessível       | Monaco Editor com suporte a screen reader |
| Atalhos personalizados | Configuráveis por preferência             |
| Modo texto             | Alternativa ao editor visual              |
| Output acessível       | Resultados anunciados via live region     |

---

## 5. Componentes Acessíveis

### 5.1 Painel de Acessibilidade

```
+----------------------------------+
|    ACESSIBILIDADE               X|
+----------------------------------+
|                                  |
|  CONTRASTE                       |
|  [Normal] [Alto]                 |
|                                  |
|  TAMANHO DA FONTE                |
|  [ - ] 100% [ + ]                |
|                                  |
|  VLIBRAS (LIBRAS)                |
|  [Desativado] [Ativado]          |
|                                  |
|  ANIMAÇÕES                       |
|  [Ativadas] [Reduzidas]          |
|                                  |
|  ATALHOS DE TECLADO              |
|  Alt+H: Alto contraste           |
|  Alt+A: Este painel              |
|  Alt+V: VLibras                  |
|                                  |
+----------------------------------+
```

### 5.2 Skip Links

```typescript
// components/a11y/skip-links.tsx
export function SkipLinks() {
  return (
    <nav aria-label="Links de navegação rápida" className="skip-links">
      <a href="#main-content">Ir para conteúdo principal</a>
      <a href="#main-nav">Ir para navegação</a>
      <a href="#search">Ir para busca</a>
    </nav>
  )
}
```

### 5.3 Anunciador de Screen Reader

```typescript
// components/a11y/announcer.tsx
export function Announcer() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handler = (e: CustomEvent) => setMessage(e.detail)
    window.addEventListener('announce', handler as EventListener)
    return () => window.removeEventListener('announce', handler as EventListener)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

// Uso em qualquer lugar
function announce(message: string) {
  window.dispatchEvent(new CustomEvent('announce', { detail: message }))
}

// Exemplo
announce('Quiz concluído. Você acertou 8 de 10 questões.')
```

---

## 6. Design Responsivo e Mobile

### 6.1 Touch Targets

| Dispositivo | Tamanho Mínimo | Espaçamento Mínimo |
| ----------- | -------------- | ------------------ |
| Mobile      | 44x44 px       | 8px                |
| Tablet      | 44x44 px       | 8px                |
| Desktop     | 24x24 px       | 4px                |

### 6.2 Mobile-First

```css
/* Base mobile-first */
.card {
  padding: 1rem;
  font-size: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .card {
    padding: 1.5rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .card {
    padding: 2rem;
  }
}
```

### 6.3 Orientação

- Interface funciona em portrait e landscape
- Conteúdo não é cortado em rotação
- Preferências de orientação são respeitadas

---

## 7. Checklist de Acessibilidade

### 7.1 Para Desenvolvedores

```
ANTES DE CADA PR:
[ ] Todas as imagens têm alt text descritivo
[ ] Formulários têm labels associados
[ ] Cores não são o único meio de transmitir informação
[ ] Contraste de cores é adequado (4.5:1 texto, 3:1 UI)
[ ] Navegação funciona 100% por teclado
[ ] Focus states são visíveis
[ ] ARIA é usado corretamente
[ ] Heading hierarchy é lógica (h1 > h2 > h3...)
[ ] Links têm texto descritivo (não "clique aqui")
[ ] Animações respeitam prefers-reduced-motion
```

### 7.2 Para Criadores de Conteúdo

```
ANTES DE PUBLICAR:
[ ] Linguagem é clara e concisa
[ ] Termos técnicos são explicados
[ ] Imagens têm descrição alternativa
[ ] Vídeos têm legendas
[ ] Estrutura de headings é lógica
[ ] Links são descritivos
[ ] Glossário atualizado (se necessário)
```

### 7.3 Para QA/Testes

```
TESTES DE ACESSIBILIDADE:
[ ] Navegação completa só com teclado
[ ] Teste com NVDA/JAWS (screen reader)
[ ] Teste com VLibras ativado
[ ] Teste em modo alto contraste
[ ] Teste com zoom 200%
[ ] Teste em diferentes tamanhos de tela
[ ] Validação automática (axe, Lighthouse)
```

---

## 8. Ferramentas de Teste

### 8.1 Automáticas

| Ferramenta   | Uso                                     |
| ------------ | --------------------------------------- |
| axe DevTools | Extensão de navegador para testes       |
| Lighthouse   | Auditoria integrada ao Chrome           |
| Pa11y        | CLI para testes automatizados           |
| jest-axe     | Testes de acessibilidade em componentes |

### 8.2 Manuais

| Ferramenta | Uso                                |
| ---------- | ---------------------------------- |
| NVDA       | Screen reader gratuito (Windows)   |
| VoiceOver  | Screen reader nativo (macOS/iOS)   |
| TalkBack   | Screen reader nativo (Android)     |
| WAVE       | Avaliador visual de acessibilidade |

### 8.3 Script de Diagnóstico

```bash
# scripts/diagnostics/diagnose-a11y.js
node scripts/diagnostics/diagnose-vlibras.js

# Saída esperada
# [VLibras] Widget carregado: OK
# [VLibras] Tradução funcionando: OK
# [Contraste] Modo normal: 4.5:1 OK
# [Contraste] Modo alto: 7:1 OK
# [Keyboard] Navegação: 100% coberta
# [ARIA] Roles válidos: OK
```

---

## 9. Métricas de Acessibilidade

### 9.1 KPIs

| Métrica                  | Meta      | Descrição                      |
| ------------------------ | --------- | ------------------------------ |
| Lighthouse Accessibility | ≥ 95      | Score de acessibilidade        |
| Erros axe                | 0         | Zero violações críticas        |
| Cobertura de legendas    | 100%      | Todos os vídeos com legendas   |
| Cobertura de alt text    | 100%      | Todas as imagens com descrição |
| Uso de VLibras           | Monitorar | % de usuários que ativam       |
| Uso de alto contraste    | Monitorar | % de usuários que ativam       |

### 9.2 Monitoramento

```typescript
// lib/analytics/a11y-tracker.ts
trackA11yFeatureUsage(feature: string, enabled: boolean)
trackA11yIssueReported(issue: string, context: string)
trackScreenReaderDetected(name: string)
```

---

## 10. Roadmap de Acessibilidade

### 10.1 Implementado

- [x] Alto contraste
- [x] Ajuste de tamanho de fonte
- [x] VLibras integrado
- [x] Skip links
- [x] ARIA labels básicos
- [x] Navegação por teclado

### 10.2 Em Desenvolvimento

- [ ] Audiodescrição em vídeos
- [ ] Modo leitor simplificado
- [ ] Preferência de animações reduzidas
- [ ] Temas de cores para daltonismo

### 10.3 Planejado

- [ ] Legendas ao vivo (IA)
- [ ] Tradução automática para LIBRAS (avatar IA)
- [ ] Comandos de voz
- [ ] Personalização avançada de interface

---

## 11. Referências

- W3C. (2018). Web Content Accessibility Guidelines (WCAG) 2.1.
- Governo Digital Brasil. (2014). eMAG - Modelo de Acessibilidade em Governo Eletrônico.
- VLibras. (2024). Documentação do Widget. https://vlibras.gov.br/
- MDN Web Docs. (2024). Accessibility. Mozilla Developer Network.
- WebAIM. (2024). WCAG 2 Checklist. https://webaim.org/standards/wcag/checklist

---

**Autor**: Anderson Henrique da Silva
**Última atualização**: 2025-12-09
**Código fonte**: `components/a11y/`, `hooks/use-vlibras.ts`
