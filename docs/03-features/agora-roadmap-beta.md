# Agora Academy - Roadmap Beta

**Versao**: 1.0
**Criado**: 2025-12-08
**Autor**: Anderson Henrique da Silva
**Status Atual**: 82% Completo

---

## Visao Geral

Este roadmap define todas as tarefas necessarias para lancar o beta da Agora Academy.
Organizado em fases com prioridades claras (P0-P3).

---

## Status Atual por Area

| Area                 | Status                 | Completude |
| -------------------- | ---------------------- | ---------- |
| Autenticacao OAuth   | Funcional              | 100%       |
| Sistema XP           | Completo               | 100%       |
| Badges (16)          | Completo               | 100%       |
| Challenges UI        | Backend OK, UI parcial | 70%        |
| Videos (50+)         | Completo               | 100%       |
| Leituras (20+)       | Completo               | 100%       |
| Diario/Calendario    | Completo               | 100%       |
| Chat Educacional     | Funcional              | 90%        |
| Ranking/Leaderboard  | Completo               | 100%       |
| Trilhas (4 tracks)   | Completo               | 100%       |
| Onboarding (5 steps) | Funcional              | 95%        |
| Certificados         | Completo               | 100%       |
| LGPD Compliance      | Completo               | 100%       |
| Mobile Responsive    | Completo               | 100%       |
| Dark Mode            | Completo               | 100%       |
| Acessibilidade       | WCAG AAA               | 100%       |

---

## FASE 1: ESTABILIZACAO (P0 - Critico)

> Itens que bloqueiam o lancamento do beta

### 1.1 Error Boundaries

- **Arquivo**: `app/pt/agora/*/error.tsx`
- **Esforco**: 2-3h
- **Status**: [ ] Pendente
- **Descricao**: Paginas crasham sem feedback visual
- **Tarefas**:
  - [ ] Criar `app/pt/agora/error.tsx` (global)
  - [ ] Criar error boundaries especificos para:
    - [ ] `/trilhas/[trackId]/[moduleId]/error.tsx`
    - [ ] `/chat/error.tsx`
    - [ ] `/videos/error.tsx`
  - [ ] Implementar UI de erro amigavel com opcao de retry
  - [ ] Integrar com sistema de logs (Sentry opcional)
- **Criterio de Aceite**: Usuario ve mensagem amigavel ao inves de tela branca

### 1.2 UI de Challenges Completa

- **Arquivo**: `components/agora/gamification-card.tsx`
- **Esforco**: 6-8h
- **Status**: [ ] Pendente
- **Descricao**: Backend de challenges existe, falta UI completa
- **Tarefas**:
  - [ ] Redesenhar card de challenges no dashboard
  - [ ] Adicionar progress bars animadas
  - [ ] Implementar botao "Resgatar" para rewards
  - [ ] Conectar `claimChallengeReward()` action
  - [ ] Adicionar feedback visual de claim (confetti)
  - [ ] Mostrar timer de reset (daily/weekly)
  - [ ] Adicionar tooltips explicativos
- **Criterio de Aceite**: Usuario consegue ver, progredir e resgatar challenges

### 1.3 Forcar Onboarding/Contrato

- **Arquivo**: `app/pt/agora/layout.tsx` + middleware
- **Esforco**: 2h
- **Status**: [ ] Pendente
- **Descricao**: Usuario pode ignorar contrato e acessar plataforma
- **Tarefas**:
  - [ ] Criar middleware de verificacao de onboarding
  - [ ] Bloquear acesso a todas as paginas se:
    - [ ] `hasCompletedOnboarding === false`
    - [ ] `hasAcceptedLgpd === false`
    - [ ] `hasAcceptedTerms === false`
  - [ ] Redirecionar para `/pt/agora/onboarding` automaticamente
  - [ ] Impedir navegacao manual via URL
- **Criterio de Aceite**: Impossivel acessar dashboard sem completar onboarding

### 1.4 Logout/Session Management

- **Arquivo**: `hooks/use-agora.tsx` + components
- **Esforco**: 3h
- **Status**: [ ] Pendente
- **Descricao**: Sem confirmacao de logout, sem timeout de inatividade
- **Tarefas**:
  - [ ] Criar modal de confirmacao de logout
  - [ ] Implementar timeout de inatividade (30min)
  - [ ] Mostrar warning 5min antes do timeout
  - [ ] Salvar sessao atual antes de logout
  - [ ] Adicionar "Manter conectado" checkbox
  - [ ] Limpar dados sensiveis no logout
- **Criterio de Aceite**: Usuario confirma logout e sessao expira apos inatividade

### 1.5 GitHub Fork Verificacao Real

- **Arquivo**: `hooks/use-agora.tsx` (verifyGitHubFork)
- **Esforco**: 3h
- **Status**: [ ] Pendente
- **Descricao**: Verificacao de fork esta mockada (sempre sucesso)
- **Tarefas**:
  - [ ] Implementar chamada real a GitHub API
  - [ ] Verificar se usuario fez fork do repo correto
  - [ ] Validar que fork e publico
  - [ ] Tratamento de erros (rate limit, repo privado)
  - [ ] Fallback gracioso se API indisponivel
- **Criterio de Aceite**: Sistema valida fork real do repositorio

**Total Fase 1**: ~16h

---

## FASE 2: QUALIDADE (P1 - Importante)

> Itens que melhoram significativamente a experiencia

### 2.1 Skeleton Loaders

- **Esforco**: 4-5h
- **Status**: [ ] Pendente
- **Tarefas**:
  - [ ] Dashboard skeleton
  - [ ] Trilhas skeleton
  - [ ] Videos skeleton
  - [ ] Ranking skeleton
  - [ ] Profile skeleton
  - [ ] Criar componente `<AgoraSkeleton />` reutilizavel
- **Criterio de Aceite**: Toda pagina mostra skeleton enquanto carrega

### 2.2 Validacao de Formularios

- **Esforco**: 3h
- **Status**: [ ] Pendente
- **Tarefas**:
  - [ ] Validacao no diario (mood obrigatorio)
  - [ ] Validacao no perfil (campos obrigatorios)
  - [ ] Validacao no onboarding (GitHub username)
  - [ ] Mensagens de erro claras em PT-BR
  - [ ] Integrar com react-hook-form ou zod
- **Criterio de Aceite**: Formularios validam e mostram erros inline

### 2.3 LGPD Export/Delete

- **Esforco**: 8-10h
- **Status**: [ ] Pendente
- **Tarefas**:
  - [ ] Botao "Exportar meus dados" em /configuracoes
  - [ ] Gerar JSON com todos dados do usuario
  - [ ] Botao "Excluir minha conta"
  - [ ] Modal de confirmacao com consequencias
  - [ ] Server action para deletar todos dados
  - [ ] Email de confirmacao de exclusao
  - [ ] Periodo de graca de 30 dias (soft delete)
- **Criterio de Aceite**: Usuario pode exportar e deletar dados conforme LGPD

### 2.4 Acessibilidade Avancada

- **Esforco**: 4-5h
- **Status**: [ ] Pendente
- **Tarefas**:
  - [ ] Audit ARIA labels em todos componentes
  - [ ] Keyboard navigation completa
  - [ ] Screen reader testing
  - [ ] Focus management em modais
  - [ ] Skip links funcionais
  - [ ] Testar com VLibras
- **Criterio de Aceite**: Score 100 no Lighthouse Accessibility

### 2.5 Rate Limiting XP

- **Esforco**: 4-5h
- **Status**: [ ] Pendente
- **Tarefas**:
  - [ ] Limitar XP por hora (max 500 XP/h)
  - [ ] Limitar XP por dia (max 2000 XP/dia)
  - [ ] Detectar padroes suspeitos de ganho
  - [ ] Implementar cooldown entre acoes
  - [ ] Logging de tentativas de abuso
  - [ ] Server-side validation
- **Criterio de Aceite**: Sistema previne farming de XP

### 2.6 Fix Mock Leaderboard

- **Esforco**: 2h
- **Status**: [ ] Pendente
- **Tarefas**:
  - [ ] Remover dados mockados do ranking
  - [ ] Usar apenas dados reais do Supabase
  - [ ] Adicionar paginacao (10 por pagina)
  - [ ] Cache de 5min para performance
- **Criterio de Aceite**: Leaderboard mostra apenas usuarios reais

**Total Fase 2**: ~30h

---

## FASE 3: POLISH (P2 - Nice to Have)

> Itens que agregam valor mas nao bloqueiam beta

### 3.1 Player de Video nos Modulos

- **Esforco**: 6h
- **Status**: [ ] Pendente
- **Tarefas**:
  - [ ] Integrar player dentro das trilhas
  - [ ] Progress tracking automatico
  - [ ] Marcar como assistido ao completar
  - [ ] Suporte a velocidade de reproducao
- **Criterio de Aceite**: Videos tocam dentro da plataforma

### 3.2 Rankings Temporais

- **Esforco**: 4h
- **Status**: [ ] Pendente
- **Tarefas**:
  - [ ] Ranking semanal (reset toda segunda)
  - [ ] Ranking mensal
  - [ ] Historico de posicoes
  - [ ] Badges de top 3 semanal/mensal
- **Criterio de Aceite**: Usuario ve rankings por periodo

### 3.3 Busca e Filtros

- **Esforco**: 5h
- **Status**: [ ] Pendente
- **Tarefas**:
  - [ ] Busca global (videos, leituras, trilhas)
  - [ ] Filtros por dificuldade
  - [ ] Filtros por duracao
  - [ ] Filtros por status (completo/pendente)
- **Criterio de Aceite**: Usuario encontra conteudo facilmente

### 3.4 Animacoes de Conquistas

- **Esforco**: 4h
- **Status**: [ ] Pendente
- **Tarefas**:
  - [ ] Animacao de level up mais elaborada
  - [ ] Animacao de streak milestone
  - [ ] Sound effects (opcional)
  - [ ] Particulas customizadas por badge tier
- **Criterio de Aceite**: Conquistas sao memoraveis

### 3.5 Certificado PDF Melhorado

- **Esforco**: 4h
- **Status**: [ ] Pendente
- **Tarefas**:
  - [ ] Design profissional
  - [ ] QR code de verificacao
  - [ ] Assinatura digital
  - [ ] Versao compartilhavel (LinkedIn)
- **Criterio de Aceite**: Certificado tem aparencia profissional

### 3.6 Dashboard de Analytics

- **Esforco**: 8h
- **Status**: [ ] Pendente
- **Tarefas**:
  - [ ] Graficos de progresso (XP ao longo do tempo)
  - [ ] Heatmap de atividade
  - [ ] Comparacao com media da turma
  - [ ] Projecao de nivel
- **Criterio de Aceite**: Usuario visualiza seu progresso

**Total Fase 3**: ~31h

---

## FASE 4: EXPANSAO (P3 - Pos-Beta)

> Itens para versoes futuras

### 4.1 CMS para Conteudo

- Permitir edicao de videos/leituras sem deploy
- Admin panel para gestores

### 4.2 Sistema de Mentoria

- Agendamento de 1:1 com mentores
- Video calls integradas
- Feedback estruturado

### 4.3 Projetos Praticos

- Submissao de projetos
- Code review automatizado
- Portfolio do aluno

### 4.4 Comunidade

- Forum de discussao
- Grupos de estudo
- Pareamento de duplas

### 4.5 Integracao Backend

- Agentes reais (Anita, Tiradentes, etc)
- Investigacoes da plataforma principal
- XP cross-platform

### 4.6 Machine Learning

- Recomendacoes personalizadas
- Deteccao de dificuldade
- Adaptive learning path

---

## Cronograma Sugerido

```
SEMANA 1 (08-14/12)
├── Fase 1.1: Error Boundaries ✓
├── Fase 1.2: UI Challenges ✓
├── Fase 1.3: Forcar Onboarding ✓
└── Fase 1.4: Logout/Session ✓

SEMANA 2 (15-21/12)
├── Fase 1.5: GitHub Fork Real
├── Fase 2.1: Skeleton Loaders
├── Fase 2.2: Validacao Forms
└── Fase 2.6: Fix Mock Leaderboard

--- BETA FECHADO (20-50 testadores) ---

SEMANA 3-4 (22/12 - 04/01)
├── Fase 2.3: LGPD Export/Delete
├── Fase 2.4: Acessibilidade
├── Fase 2.5: Rate Limiting
└── Coleta de feedback beta

--- BETA ABERTO (500+ usuarios) ---

JANEIRO 2025
├── Fase 3: Polish items
├── Bug fixes do feedback
└── Preparacao para producao
```

---

## Metricas de Sucesso Beta

| Metrica               | Target      | Como Medir                         |
| --------------------- | ----------- | ---------------------------------- |
| Onboarding Completion | > 80%       | % usuarios que completam 5 steps   |
| DAU/MAU               | > 30%       | Usuarios ativos diarios vs mensais |
| Session Duration      | > 15min     | Tempo medio por sessao             |
| XP per User per Day   | > 50 XP     | Media de ganho diario              |
| Challenge Completion  | > 60%       | % challenges completados           |
| NPS Score             | > 40        | Net Promoter Score                 |
| Bug Reports           | < 10/semana | Issues reportados                  |
| Crash Rate            | < 1%        | Sessoes com erro                   |

---

## Checklist Pre-Beta

- [ ] Todos itens P0 completos
- [ ] Testes E2E passando
- [ ] Coverage > 60%
- [ ] Lighthouse > 90 (todas metricas)
- [ ] Mobile testado (iOS + Android)
- [ ] Dark mode testado
- [ ] VLibras funcionando
- [ ] Documentacao atualizada
- [ ] Onboarding revisado por 3 pessoas
- [ ] Email de boas-vindas configurado
- [ ] Analytics configurado (PostHog)
- [ ] Error tracking configurado (Sentry)
- [ ] Backup de banco configurado
- [ ] Rate limiting ativo
- [ ] LGPD compliance verificado

---

## Notas de Implementacao

### Prioridade de Arquivos

1. `app/pt/agora/error.tsx` - Error boundary global
2. `app/pt/agora/layout.tsx` - Middleware onboarding
3. `components/agora/gamification-card.tsx` - UI challenges
4. `hooks/use-agora.tsx` - Logout + session
5. `lib/agora/github.ts` - Fork verification (novo)

### Dependencias Externas

- GitHub API para verificacao de fork
- Supabase realtime para challenges
- Sentry para error tracking (opcional)
- PostHog para analytics (opcional)

---

## Historico de Atualizacoes

| Data       | Versao | Mudancas                   |
| ---------- | ------ | -------------------------- |
| 2025-12-08 | 1.0    | Criacao inicial do roadmap |

---

**Proxima Revisao**: Apos completar Fase 1
