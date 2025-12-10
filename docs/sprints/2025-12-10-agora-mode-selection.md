# Sprint: Agora Mode Selection Architecture

**Data**: 2025-12-10
**Autor**: Anderson Henrique da Silva
**Objetivo**: Separar claramente Ágora Academy e Ágora Kids com tela de seleção

---

## Problema Atual

### Arquitetura Confusa

```
/pt/agora/login → entra direto no dashboard (mistura contextos)
     ↓
/pt/agora/* ← Academy (adulto)
/pt/agora/kids/* ← Kids (criança)
     ↑
Estados persistem em localStorage (nunca limpa)
```

### Issues Identificados

1. **Estado persistente em localStorage**
   - `kids-store.ts` → `persist()` em localStorage
   - `agora-chat-store.ts` → `persist()` em localStorage
   - `badge-store.ts` → `persist()` em localStorage
   - Fechar aba NÃO limpa nada

2. **Providers compartilhados**
   - `AgoraProvider` + `AgoraAuthProvider` envolvem TUDO
   - Kids usa `useKids()` que depende do mesmo contexto
   - Layout único para Academy e Kids

3. **Navegação sem fronteiras**
   - Nenhuma tela de seleção pós-login
   - Kids pode navegar para Academy (e vice-versa)
   - Redirecionamentos automáticos confusos

4. **Sessões não isoladas**
   - `NavigationSessionService` tenta gerenciar mas é complexo
   - `beforeunload` chama APIs mas não limpa localStorage

---

## Arquitetura Proposta

### Fluxo Principal

```
/pt/agora/login
     ↓ (após autenticação)
/pt/agora/selecao (NOVA PÁGINA)
     ↓
┌─────────────────────┬─────────────────────┐
│   "Acessar Ágora"   │  "Área Kids"        │
│   (botão Academy)   │  (botão Kids)       │
└─────────────────────┴─────────────────────┘
     ↓                       ↓
/pt/agora/dashboard    /pt/agora/kids/dashboard
(Academy mode)         (Kids mode)
```

### Regras de Navegação

1. **Login** → sempre vai para `/pt/agora/selecao`
2. **Fechar aba** → limpa `sessionStorage` (estado do modo atual)
3. **Trocar modo** → volta para `/pt/agora/selecao`
4. **Dentro de um modo** → só navega dentro dele

### Storage Strategy

```
localStorage (persiste):
- Dados do usuário (perfil, badges, XP)
- Preferências (tema, configurações)

sessionStorage (morre com aba):
- currentMode: 'academy' | 'kids' | null
- Sessão de estudo atual
- Estado de navegação
```

---

## Tarefas do Sprint

### Fase 1: Página de Seleção (1-2h)

- [ ] Criar `/pt/agora/selecao/page.tsx`
- [ ] Design: 2 cards grandes (Academy | Kids)
- [ ] Verificar se usuário tem perfil Kids ativo
- [ ] Salvar modo selecionado em `sessionStorage`

### Fase 2: Redirecionar Login (30min)

- [ ] Modificar `/pt/agora/login/page.tsx`
- [ ] Após login → redirect para `/pt/agora/selecao`
- [ ] Nunca ir direto para dashboard

### Fase 3: Guards de Modo (1h)

- [ ] Criar hook `useAgoraMode()`:
  ```typescript
  type AgoraMode = 'academy' | 'kids' | null
  function useAgoraMode() {
    const mode = sessionStorage.getItem('agora_mode')
    const setMode = (m: AgoraMode) => sessionStorage.setItem('agora_mode', m)
    const clearMode = () => sessionStorage.removeItem('agora_mode')
    return { mode, setMode, clearMode }
  }
  ```
- [ ] Criar guard para páginas Academy
- [ ] Criar guard para páginas Kids

### Fase 4: Layout Separado (1-2h)

- [ ] Criar `/pt/agora/(academy)/layout.tsx` - Route Group
- [ ] Mover páginas Academy para `(academy)`
- [ ] Header Academy com botão "Trocar para Kids"
- [ ] Header Kids com botão "Sair para Seleção"

### Fase 5: Cleanup no Fechamento (1h)

- [ ] Modificar `beforeunload` handler
- [ ] Chamar APIs de end-session
- [ ] Limpar `sessionStorage` (não localStorage)
- [ ] Testar fechamento de aba

### Fase 6: Refatorar Stores (1-2h)

- [ ] Separar dados persistentes de dados de sessão
- [ ] `kids-store.ts`:
  - Persistente: `childName`, `parentEmail`, `avatar`
  - Sessão: `isKidsMode`, `currentSession`
- [ ] Garantir que `isKidsMode` vem de `sessionStorage`

### Fase 7: Testes e Polish (1h)

- [ ] Testar fluxo completo
- [ ] Testar fechar aba e reabrir
- [ ] Testar trocar entre modos
- [ ] Verificar que estados não vazam

---

## Estrutura de Arquivos Final

```
app/pt/agora/
├── selecao/
│   └── page.tsx          # NOVA - Tela de seleção
├── (academy)/            # Route Group - Academy
│   ├── layout.tsx        # Layout Academy com header
│   ├── page.tsx          # Dashboard Academy
│   ├── chat/
│   ├── diario/
│   ├── ranking/
│   ├── trilhas/
│   └── ...
├── kids/                 # Kids (já existe)
│   ├── layout.tsx        # Layout Kids
│   ├── page.tsx          # Setup/Seleção Kids
│   ├── dashboard/
│   ├── chat/
│   └── videos/
├── pais/                 # Dashboard pais (isolado)
├── login/
├── onboarding/
└── layout.tsx            # Layout raiz (apenas providers base)
```

---

## Hooks Novos/Modificados

### `useAgoraMode` (NOVO)

```typescript
// hooks/use-agora-mode.ts
export function useAgoraMode() {
  const [mode, setModeState] = useState<'academy' | 'kids' | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('agora_mode')
    setModeState(stored as 'academy' | 'kids' | null)
  }, [])

  const setMode = (m: 'academy' | 'kids') => {
    sessionStorage.setItem('agora_mode', m)
    setModeState(m)
  }

  const clearMode = () => {
    sessionStorage.removeItem('agora_mode')
    setModeState(null)
  }

  return { mode, setMode, clearMode, isAcademy: mode === 'academy', isKids: mode === 'kids' }
}
```

### `useRequireAcademyMode` (NOVO)

```typescript
export function useRequireAcademyMode() {
  const router = useRouter()
  const { mode } = useAgoraMode()

  useEffect(() => {
    if (mode !== 'academy') {
      router.push('/pt/agora/selecao')
    }
  }, [mode])

  return mode === 'academy'
}
```

---

## Estimativa Total: 6-8 horas

### Prioridade de Implementação

1. ⭐ Fase 1 + 2 (Seleção + Redirect) - MVP funcional
2. ⭐ Fase 3 (Guards) - Segurança de navegação
3. Fase 5 (Cleanup) - Corrigir leak de estado
4. Fase 4 (Layouts) - Polish
5. Fase 6 (Stores) - Refatoração profunda
6. Fase 7 (Testes) - Validação

---

## Riscos e Mitigações

| Risco                   | Impacto | Mitigação                                                   |
| ----------------------- | ------- | ----------------------------------------------------------- |
| Quebrar fluxo existente | Alto    | Implementar incrementalmente                                |
| Usuários perderem dados | Médio   | Manter localStorage para dados, só sessionStorage para modo |
| Route Groups complexos  | Médio   | Testar bem antes de mover arquivos                          |

---

## Critérios de Aceite

- [ ] Após login, usuário SEMPRE vê tela de seleção
- [ ] Fechar aba e reabrir → volta para seleção
- [ ] Em Academy, não consegue acessar URLs de Kids (e vice-versa)
- [ ] Botão "Trocar Modo" funciona corretamente
- [ ] Estado de XP/badges persiste (localStorage)
- [ ] Estado de modo atual NÃO persiste (sessionStorage)
