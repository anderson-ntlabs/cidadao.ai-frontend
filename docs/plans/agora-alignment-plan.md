# Plano Cirúrgico: Alinhamento Ágora com Cidadão.AI

**Data**: 2025-12-07
**Autor**: Anderson Henrique da Silva
**Objetivo**: Tornar o chat do Ágora idêntico ao app principal, mantendo apenas agentes educacionais

---

## Análise Atual

### Diferenças Identificadas

| Aspecto            | Ágora Atual    | App Principal                      | Ação                      |
| ------------------ | -------------- | ---------------------------------- | ------------------------- |
| **State**          | useState local | useChatStore (Zustand)             | Migrar                    |
| **API**            | fetch direto   | ChatService com adapters           | Usar ChatService          |
| **Componentes**    | Custom simples | MessageBubble, AgentSelector, etc. | Reutilizar                |
| **Agentes**        | 3 hardcoded    | 17 em agents.ts                    | Filtrar para educacionais |
| **Mobile**         | Básico         | MobileChatContainer                | Reutilizar                |
| **Streaming**      | Custom SSE     | store.sendStreamingMessage         | Usar store                |
| **Acessibilidade** | Nenhuma        | VLibras + Painel A11y              | Adicionar                 |

### Agentes Educacionais

1. **Lina Bo Bardi** (`bobardi`) - UI/UX - JÁ EXISTE em agents.ts
2. **Santos-Dumont** - Engenharia - PRECISA ADICIONAR em agents.ts

---

## Fases de Implementação

### Fase 1: Preparação (3 commits)

#### 1.1 Adicionar Santos-Dumont em agents.ts

```typescript
{
  id: 'santos-dumont',
  name: 'Santos-Dumont',
  role: { pt: 'Mentor de Engenharia', en: 'Engineering Mentor' },
  description: {
    pt: 'Pai da aviação, ensina inovação, arquitetura de software e engenharia criativa...',
    en: 'Father of aviation, teaches innovation, software architecture and creative engineering...',
  },
  image: '/agents/santos-dumont.png',
  wikipedia: 'https://pt.wikipedia.org/wiki/Santos_Dumont',
  tracks: ['backend', 'fullstack', 'devops'],
}
```

#### 1.2 Criar helper para filtrar agentes educacionais

```typescript
// Em data/agents.ts
export const EDUCATIONAL_AGENT_IDS = ['santos-dumont', 'bobardi'] as const
export function getEducationalAgents(): Agent[] {
  return agents.filter((a) => EDUCATIONAL_AGENT_IDS.includes(a.id))
}
```

#### 1.3 Verificar/adicionar imagem do Santos-Dumont

- Verificar se `/public/agents/santos-dumont.png` existe
- Se não, criar placeholder ou usar imagem adequada

---

### Fase 2: Chat Store para Ágora (2 commits)

#### 2.1 Criar agora-chat-store.ts

- Cópia simplificada do chat-store.ts
- Usa ChatService existente
- Filtra agentes para educacionais apenas
- Integra com useAgora() para XP tracking

#### 2.2 Atualizar ChatService para suportar modo educacional

- Adicionar opção de filtro de agentes
- Manter compatibilidade com app principal

---

### Fase 3: Componentes Compartilhados (4 commits)

#### 3.1 Criar AgoraAgentSelector

- Baseado em AgentSelector do app principal
- Mostra apenas agentes educacionais
- Mantém mesmo visual

#### 3.2 Criar AgoraChatPage

- Usa componentes do app principal:
  - MessageBubble
  - StreamingStatus
  - ChatEmptyState (adaptado)
  - VoiceRecorder/VoiceInputButton
- Usa agora-chat-store para estado
- Integra XP do useAgora()

#### 3.3 Adicionar mobile components

- Reutilizar MobileChatContainer
- Reutilizar MobileChatInput
- Adaptar para contexto Ágora

#### 3.4 Atualizar layout Ágora

- Importar componentes de acessibilidade
- Manter bottom navigation

---

### Fase 4: Acessibilidade (2 commits)

#### 4.1 Adicionar VLibras ao layout Ágora

```typescript
// Em app/pt/agora/layout.tsx
import { VLibrasLazy } from '@/components/a11y/vlibras-lazy'
```

#### 4.2 Adicionar painel de acessibilidade

```typescript
import { AccessibilityPanel } from '@/components/a11y/accessibility-panel'
```

---

### Fase 5: Design Tokens (1 commit)

#### 5.1 Importar design system no layout Ágora

```typescript
import '@/styles/design-system/tokens/index.css'
```

---

### Fase 6: Cleanup (1 commit)

#### 6.1 Remover código duplicado

- Remover implementação antiga do chat Ágora
- Consolidar helpers

---

## Arquivos a Modificar

### Criar:

- `store/agora-chat-store.ts`
- `components/agora/agora-agent-selector.tsx`
- `components/agora/agora-chat-empty-state.tsx`

### Modificar:

- `data/agents.ts` - Adicionar Santos-Dumont + helpers
- `app/pt/agora/chat/page.tsx` - Reescrever usando componentes compartilhados
- `app/pt/agora/layout.tsx` - Adicionar acessibilidade

### Verificar:

- `public/agents/santos-dumont.png` - Verificar existência

---

## Ordem de Commits

1. `feat(agents): add Santos-Dumont as engineering mentor`
2. `feat(agents): add educational agents filter helpers`
3. `feat(agora): create agora-chat-store with ChatService integration`
4. `feat(agora): create AgoraAgentSelector component`
5. `refactor(agora/chat): rewrite chat page using shared components`
6. `feat(agora): add mobile chat components support`
7. `feat(agora): add VLibras accessibility widget`
8. `feat(agora): add accessibility panel`
9. `style(agora): import design system tokens`
10. `refactor(agora): cleanup legacy chat implementation`

---

## Riscos e Mitigações

| Risco                          | Mitigação                              |
| ------------------------------ | -------------------------------------- |
| Quebrar chat do app principal  | Testes antes de cada commit            |
| XP tracking parar de funcionar | Manter integração com useAgora()       |
| Mobile UX degradar             | Reutilizar componentes mobile testados |

---

## Critérios de Sucesso

- [ ] Chat Ágora usa mesmos componentes visuais do app principal
- [ ] Apenas 2 agentes disponíveis (Santos-Dumont, Lina Bo Bardi)
- [ ] XP é concedido por conversas
- [ ] VLibras funciona no Ágora
- [ ] Painel de acessibilidade presente
- [ ] Streaming funciona corretamente
- [ ] Mobile funciona identicamente ao app principal
