# ADR-002: Agora State Management Architecture

## Status

Proposto (Em Avaliacao)

## Data

2025-12-12

## Contexto

A plataforma Agora tem uma estrutura de providers aninhados no layout:

```
AgoraAuthProvider (autenticacao Supabase)
  └── AgoraProvider (estado completo da plataforma)
      └── AgoraLayoutContent
          └── AuthGuard
              └── Children
```

### Problemas Identificados

1. **Sobreposicao de responsabilidades**: Ambos `AgoraAuthProvider` e `AgoraProvider` gerenciam user state
2. **Provider muito grande**: `AgoraProvider` tem ~1900 linhas com multiplas responsabilidades:
   - User state
   - Sessions management
   - XP transactions
   - Diary entries
   - Badges
   - Gamification (challenges)
   - Onboarding flow
   - Cache management
3. **Acoplamento**: Dificil testar componentes isoladamente

### Analise de Impacto

**Pros de refatorar agora:**

- Codigo mais limpo e modular
- Testes mais faceis
- Menos re-renders desnecessarios

**Contras de refatorar agora:**

- O codigo atual funciona bem em producao
- Alto risco de introducao de bugs
- ~1900 linhas para reescrever
- Muitos componentes dependem da API atual
- Tempo significativo de desenvolvimento

## Decisao

**Adiar a refatoracao completa** e adotar uma estrategia incremental:

### Fase 1 - Documentacao (Sprint 3 - Atual)

- Documentar a arquitetura atual neste ADR
- Nao fazer mudancas estruturais ainda

### Fase 2 - Melhorias Incrementais (Sprints Futuros)

- Extrair hooks menores do `AgoraProvider` (ex: `useAgoraSessions`, `useAgoraGamification`)
- Manter backward compatibility com a API existente
- Migrar componentes gradualmente

### Fase 3 - Unificacao (Quando Houver Necessidade)

- Criar `UnifiedAgoraContext` com reducer pattern
- Consolidar `AgoraAuthProvider` dentro do provider unificado
- Implementar apenas quando houver problemas reais de performance ou manutenibilidade

## Consequencias

### Positivas

- Evita introducao de bugs em codigo funcionando
- Permite focar em testes e qualidade (maior impacto imediato)
- Mantem velocidade de desenvolvimento
- Decisao pode ser revista quando houver dados reais de performance

### Negativas

- Debt tecnico permanece por mais tempo
- Novos desenvolvedores podem ter dificuldade com o codigo atual
- Algumas oportunidades de otimizacao nao serao aproveitadas

### Neutras

- A API publica dos hooks (`useAgora()`, `useAgoraAuth()`) permanece estavel
- Componentes existentes continuam funcionando sem mudancas

## Alternativas Consideradas

### Alternativa 1: Refatoracao Completa Agora

**Pros:**

- Codigo limpo de uma vez
- Sem debt tecnico

**Contras:**

- Alto risco
- Tempo significativo
- Pode atrasar outras features

**Por que foi rejeitada:** Risco muito alto para o beneficio neste momento

### Alternativa 2: Usar Zustand para Tudo

**Pros:**

- API mais simples
- Melhor devtools
- Menos boilerplate

**Contras:**

- Reescrita completa necessaria
- Perda de compatibilidade com contextos React existentes
- Muitos componentes precisariam ser atualizados

**Por que foi rejeitada:** Mesmo risco da Alternativa 1

## Monitoramento

Indicadores para reavaliar esta decisao:

1. **Performance**: Se re-renders desnecessarios causarem lentidao perceptivel
2. **Bugs recorrentes**: Se bugs relacionados a state management aumentarem
3. **Developer feedback**: Se equipe reportar dificuldade significativa
4. **Cobertura de testes**: Se baixa testabilidade impedir aumento de cobertura

## Referencias

- [React Context Best Practices](https://react.dev/learn/passing-data-deeply-with-context)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Kent C. Dodds - Application State Management with React](https://kentcdodds.com/blog/application-state-management-with-react)

## Notas

### Estrutura Atual de Arquivos

```
hooks/
├── use-agora.tsx            # Provider principal (~1900 linhas)
├── use-agora-auth.tsx       # Provider de autenticacao (~530 linhas)
├── use-agora-gamification.tsx  # Hook para gamificacao (ja extraido)
├── use-agora-sessions.tsx   # Hook para sessoes (ja extraido)
├── use-agora-mode.tsx       # Hook para modo (aprendiz/kids)
└── use-kids.tsx             # Hook para modo kids
```

### Proximos Passos Recomendados

1. Aumentar cobertura de testes nos hooks existentes (Sprint 4)
2. Monitorar metricas de performance em producao
3. Reavaliar esta decisao em 2-3 sprints
