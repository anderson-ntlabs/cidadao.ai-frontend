# ROADMAP 2025 - Melhorias Cidadão.AI Frontend

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-10-26 08:15:04 -0300

---

## 📊 Sumário Executivo

Este roadmap aborda 15 áreas críticas de melhoria identificadas através de análise abrangente do código. O plano está organizado em 5 sprints cobrindo qualidade de código, performance, segurança, acessibilidade e testes.

**Duração Total Estimada**: 6-8 semanas
**Total de Commits Planejados**: 53+ commits individuais
**Meta de Cobertura**: 80% de cobertura de testes em caminhos críticos

---

## 🎯 Sprint 1: Qualidade de Código & Tratamento de Erros (Semana 1-2)

**Objetivo**: Estabelecer tratamento robusto de erros e remover débito técnico
**Commits Estimados**: 12 commits

### Fase 1.1: Error Boundaries & Logging (3-4 dias)

**Commit 1**: `refactor(logging): substituir console.log por logger utility`
- Arquivos: `app/pt/app/chat/page.tsx`, `app/pt/app/mapa/page.tsx`, `lib/api/*.ts`
- Remover todos os console.log/error/warn
- Padronizar no logger utility existente
- Adicionar debug logging controlado por ambiente
- **Impacto**: Baixo esforço, médio impacto (DX + Segurança)

**Commit 2**: `feat(error): adicionar error boundary para rota de chat`
- Arquivos: `app/pt/app/chat/error.tsx` (novo)
- Criar error.tsx com UI amigável de erro
- Adicionar ações "Tentar Novamente" e "Reportar Problema"
- Implementar telemetria de erros
- **Impacto**: Baixo esforço, alto impacto (UX)

**Commit 3**: `feat(error): adicionar error boundary para rota de investigações`
- Arquivos: `app/pt/app/investigacoes/error.tsx` (novo)
- Estrutura similar ao error boundary do chat
- Adicionar sugestões de recuperação específicas ao contexto
- **Impacto**: Baixo esforço, alto impacto (UX)

**Commit 4**: `feat(error): adicionar error boundary para rota de visualização de mapa`
- Arquivos: `app/pt/app/mapa/error.tsx` (novo)
- Tratar erros específicos de visualização
- Fornecer fallback para visualização em tabela em caso de erro
- **Impacto**: Baixo esforço, alto impacto (UX)

**Commit 5**: `feat(error): adicionar error boundary para rota de dashboard`
- Arquivos: `app/pt/app/dashboard/error.tsx` (novo)
- Tratar falhas de carregamento de dados graciosamente
- **Impacto**: Baixo esforço, alto impacto (UX)

**Commit 6**: `feat(error): adicionar componente wrapper de async error boundary`
- Arquivos: `components/error/async-error-boundary.tsx` (novo)
- Handler reutilizável de erros em operações assíncronas
- Suporte para timeout com AbortController
- Estados de Loading/Error/Success
- **Impacto**: Médio esforço, médio impacto (UX)

### Fase 1.2: Validação de Inputs & Segurança (2-3 dias)

**Commit 7**: `feat(security): adicionar validação de input ao serviço de chat`
- Arquivos: `lib/api/chat.service.ts`
- Usar validadores existentes de `input-validation.ts`
- Sanitizar mensagens do usuário antes de enviar
- Validar formato de IDs de sessão
- **Impacto**: Baixo esforço, médio impacto (Segurança)

**Commit 8**: `feat(security): adicionar validação a inputs de busca e filtros`
- Arquivos: `app/pt/app/investigacoes/page.tsx`, `app/pt/app/mapa/page.tsx`
- Validar códigos de estado, valores de filtros
- Sanitizar queries de busca
- **Impacto**: Baixo esforço, médio impacto (Segurança)

**Commit 9**: `feat(security): melhorar headers CSP no middleware`
- Arquivos: `middleware.ts`
- Remover 'unsafe-inline' e 'unsafe-eval'
- Adicionar suporte a inline scripts baseado em nonce
- Documentar exceção CSP do VLibras
- **Impacto**: Baixo esforço, médio impacto (Segurança)

**Commit 10**: `feat(security): adicionar UI de feedback de rate limit`
- Arquivos: `components/error/rate-limit-notice.tsx` (novo)
- Mostrar erro 429 amigável aos usuários
- Exibir contagem regressiva de retry-after
- **Impacto**: Baixo esforço, baixo impacto (UX)

### Fase 1.3: Documentação & Limpeza de Código (1-2 dias)

**Commit 11**: `docs(code): adicionar comentários JSDoc às ações das stores`
- Arquivos: `store/chat-store.ts`, `store/notification-store.ts`
- Documentar todos os métodos públicos
- Adicionar descrições de parâmetros/retorno
- Documentar formato do estado
- **Impacto**: Baixo esforço, médio impacto (DX)

**Commit 12**: `docs(architecture): criar documentação de arquitetura`
- Arquivos: `docs/ARCHITECTURE.md` (novo)
- Documentar padrões de fluxo de dados
- Explicar interação store/componente
- Mapear fluxo de autenticação
- **Impacto**: Baixo esforço, médio impacto (DX)

---

## 🚀 Sprint 2: Otimização de Performance (Semana 3)

**Objetivo**: Reduzir tamanho do bundle e melhorar performance em runtime
**Commits Estimados**: 8 commits

### Fase 2.1: Lazy Loading & Code Splitting (2-3 dias)

**Commit 13**: `perf(export): lazy load das bibliotecas jsPDF e html2canvas`
- Arquivos: `lib/export-service.ts`
- Converter para dynamic imports
- Adicionar estado de loading durante import
- Reduzir bundle inicial em ~200KB
- **Impacto**: Baixo esforço, médio impacto (Performance)

**Commit 14**: `perf(charts): lazy load da biblioteca Recharts`
- Arquivos: `app/pt/app/mapa/page.tsx`, `app/pt/app/dashboard/page.tsx`
- Usar React.lazy para componentes de gráfico
- Adicionar skeleton loading state
- **Impacto**: Baixo esforço, médio impacto (Performance)

**Commit 15**: `perf(icons): otimizar imports de ícones Lucide React`
- Arquivos: Todos os componentes usando lucide-react
- Converter para imports tree-shakeable
- Usar dynamic import para ícones raramente usados
- **Impacto**: Médio esforço, baixo impacto (Performance)

**Commit 16**: `perf(agents): dividir dados de agentes por tier para lazy loading`
- Arquivos: `data/agents.ts` → `data/agents/tier1.ts`, `tier2.ts`, `tier3.ts`
- Carregar apenas agentes necessários por rota
- Reduzir payload inicial de dados
- **Impacto**: Médio esforço, médio impacto (Performance)

### Fase 2.2: Otimização de Store & Estado (2 dias)

**Commit 17**: `perf(store): adicionar selectors granulares à chat store`
- Arquivos: `store/chat-store.ts`
- Criar selectors específicos: useMessages, useSession, useIsLoading
- Reduzir re-renders de componentes
- Adicionar exemplos de uso em JSDoc
- **Impacto**: Médio esforço, médio impacto (Performance)

**Commit 18**: `perf(store): memoizar estado derivado em componentes de chat`
- Arquivos: `app/pt/app/chat/page.tsx`
- Usar useMemo para lastAssistantMessage
- Memoizar mensagens filtradas
- Otimizar cálculos de scroll
- **Impacto**: Baixo esforço, médio impacto (Performance)

**Commit 19**: `perf(websocket): extrair estado WebSocket para store separada`
- Arquivos: `store/websocket-store.ts` (novo), `store/chat-store.ts`
- Separar estado de conexão do estado de UI
- Prevenir re-renders desnecessários
- **Impacto**: Médio esforço, médio impacto (Performance)

**Commit 20**: `perf(bundle): executar análise de bundle e criar relatório de otimização`
- Arquivos: `docs/bundle-analysis.md` (novo)
- Executar `npm run analyze`
- Documentar maiores dependências
- Criar recomendações de otimização
- **Impacto**: Baixo esforço, baixo impacto (Documentação)

---

## 🔧 Sprint 3: Refatoração de Componentes (Semana 4-5)

**Objetivo**: Quebrar componentes grandes e reduzir complexidade
**Commits Estimados**: 9 commits

### Fase 3.1: Refatoração de Componente de Chat (3 dias)

**Commit 21**: `refactor(chat): extrair componente MessageList`
- Arquivos: `components/chat/message-list.tsx` (novo), `app/pt/app/chat/page.tsx`
- Separar lógica de renderização de mensagens
- Adicionar virtualização para conversas longas
- **Impacto**: Alto esforço, médio impacto (Qualidade de Código)

**Commit 22**: `refactor(chat): extrair componente ChatInput`
- Arquivos: `components/chat/chat-input.tsx` (novo)
- Mover área de input e controles
- Adicionar ARIA labels apropriadas
- **Impacto**: Médio esforço, médio impacto (Qualidade de Código)

**Commit 23**: `refactor(chat): criar custom hook useChatScroll`
- Arquivos: `hooks/use-chat-scroll.ts` (novo)
- Extrair lógica de scroll-to-bottom
- Auto-scroll em novas mensagens
- **Impacto**: Médio esforço, baixo impacto (Qualidade de Código)

### Fase 3.2: Refatoração de Componente de Mapa (3 dias)

**Commit 24**: `refactor(map): extrair MapComponent da página`
- Arquivos: `components/map/brazil-map.tsx` (novo), `app/pt/app/mapa/page.tsx`
- Separar renderização do mapa SVG
- Reduzir page.tsx para ~300 linhas
- **Impacto**: Alto esforço, alto impacto (Qualidade de Código)

**Commit 25**: `refactor(map): criar componente StateTooltip`
- Arquivos: `components/map/state-tooltip.tsx` (novo)
- Extrair lógica e UI do tooltip
- Adicionar animações de hover
- **Impacto**: Médio esforço, baixo impacto (Qualidade de Código)

**Commit 26**: `refactor(map): criar componente MapLegend`
- Arquivos: `components/map/map-legend.tsx` (novo)
- Extrair renderização da legenda
- Tornar reutilizável para outras visualizações
- **Impacto**: Baixo esforço, baixo impacto (Qualidade de Código)

**Commit 27**: `refactor(map): criar custom hook useMapState`
- Arquivos: `hooks/use-map-state.ts` (novo)
- Extrair lógica de seleção de estado e API
- Adicionar estados de loading/error
- **Impacto**: Médio esforço, médio impacto (Qualidade de Código)

### Fase 3.3: Refatoração de Componente de Investigações (2-3 dias)

**Commit 28**: `refactor(investigations): extrair dados mock para constantes`
- Arquivos: `data/mock/investigations.ts` (novo), `app/pt/app/investigacoes/page.tsx`
- Centralizar dados mock
- Tornar reutilizável para testes
- **Impacto**: Baixo esforço, baixo impacto (Qualidade de Código)

**Commit 29**: `refactor(investigations): criar componente InvestigationCard`
- Arquivos: `components/investigations/investigation-card.tsx` (novo)
- Extrair lógica de renderização do card
- Adicionar handlers de interação
- **Impacto**: Médio esforço, médio impacto (Qualidade de Código)

---

## 🎨 Sprint 4: Melhorias de Acessibilidade & UX (Semana 5-6)

**Objetivo**: Alcançar conformidade WCAG 2.1 AA e melhorar navegação por teclado
**Commits Estimados**: 10 commits

### Fase 4.1: ARIA Labels & HTML Semântico (2-3 dias)

**Commit 30**: `a11y(chat): adicionar ARIA labels à interface de chat`
- Arquivos: `app/pt/app/chat/page.tsx`, `components/chat/*.tsx`
- Adicionar aria-label a textarea, botões
- Usar HTML semântico para mensagens
- Adicionar role="log" para container de mensagens
- **Impacto**: Médio esforço, médio impacto (Acessibilidade)

**Commit 31**: `a11y(forms): associar todos os labels de formulário com inputs`
- Arquivos: Todos os componentes com inputs de formulário
- Garantir que <label> envolva ou use htmlFor
- Adicionar aria-describedby para erros
- **Impacto**: Médio esforço, médio impacto (Acessibilidade)

**Commit 32**: `a11y(navigation): melhorar navegação por teclado`
- Arquivos: `components/header.tsx`, `components/mobile-nav.tsx`
- Adicionar indicadores visuais de foco
- Garantir ordem lógica de tab
- Adicionar skip links
- **Impacto**: Médio esforço, alto impacto (Acessibilidade)

**Commit 33**: `a11y(modals): implementar focus trap em modais`
- Arquivos: Criar `hooks/use-focus-trap.ts`, atualizar componentes de modal
- Aprisionar foco dentro de modais abertos
- Retornar foco ao fechar
- Suportar tecla Escape para fechar
- **Impacto**: Médio esforço, médio impacto (Acessibilidade)

### Fase 4.2: Suporte a Leitores de Tela & Teclado (2 dias)

**Commit 34**: `a11y(messages): adicionar estrutura semântica às mensagens de chat`
- Arquivos: `components/chat/message.tsx`
- Usar <article> para mensagens
- Adicionar hierarquia apropriada de headings
- Incluir timestamps em formato acessível
- **Impacto**: Baixo esforço, médio impacto (Acessibilidade)

**Commit 35**: `a11y(charts): adicionar alternativas acessíveis para visualizações`
- Arquivos: Componentes de gráfico em dashboard, mapa
- Fornecer tabelas de dados como alternativas
- Adicionar descrições em alt text
- **Impacto**: Médio esforço, médio impacto (Acessibilidade)

**Commit 36**: `a11y(shortcuts): criar guia de atalhos de teclado`
- Arquivos: `components/a11y/keyboard-shortcuts.tsx` (atualizar)
- Documentar todos os atalhos disponíveis
- Tornar descobrível via tecla "?"
- **Impacto**: Baixo esforço, baixo impacto (Acessibilidade)

### Fase 4.3: Testes de Acessibilidade & Conformidade (1-2 dias)

**Commit 37**: `a11y(tests): adicionar testes automatizados de acessibilidade com axe-core`
- Arquivos: `tests/a11y/*.test.ts` (novo)
- Configurar @axe-core/react
- Testar páginas críticas
- Criar etapa de pipeline CI
- **Impacto**: Médio esforço, alto impacto (Acessibilidade)

**Commit 38**: `a11y(audit): executar auditoria WAVE e corrigir problemas críticos`
- Arquivos: Correções em vários componentes
- Documentar achados em `docs/a11y-audit.md`
- Corrigir problemas de contraste de cores
- **Impacto**: Médio esforço, médio impacto (Acessibilidade)

**Commit 39**: `a11y(docs): criar documentação de conformidade de acessibilidade`
- Arquivos: `docs/ACCESSIBILITY.md` (novo)
- Documentar status de conformidade WCAG 2.1 AA
- Listar problemas restantes e roadmap
- **Impacto**: Baixo esforço, baixo impacto (Documentação)

---

## 🧪 Sprint 5: Infraestrutura de Testes (Semana 6-8)

**Objetivo**: Alcançar 80% de cobertura de testes em caminhos críticos
**Commits Estimados**: 10+ commits

### Fase 5.1: Configuração de Testes (1 dia)

**Commit 40**: `test(setup): configurar Vitest para testes de componentes`
- Arquivos: `vitest.config.ts` (novo), `package.json`
- Instalar @testing-library/react, vitest
- Configurar utilitários de teste
- Configurar thresholds de cobertura (80%)
- **Impacto**: Baixo esforço, alto impacto (Testes)

**Commit 41**: `test(setup): configurar Playwright para testes E2E`
- Arquivos: `playwright.config.ts` (novo), `package.json`
- Instalar Playwright
- Configurar navegadores de teste
- Criar fixtures de teste base
- **Impacto**: Baixo esforço, alto impacto (Testes)

### Fase 5.2: Testes Unitários & de Integração (3-4 dias)

**Commit 42**: `test(store): adicionar testes abrangentes para chat store`
- Arquivos: `tests/store/chat-store.test.ts` (novo)
- Testar todas as ações e atualizações de estado
- Mockar chamadas de API
- Testar cenários de erro
- **Impacto**: Médio esforço, alto impacto (Testes)

**Commit 43**: `test(hooks): adicionar testes para custom hooks`
- Arquivos: `tests/hooks/*.test.ts` (novo)
- Testar useAuth, useChatScroll, useMapState
- Cobrir casos extremos
- **Impacto**: Médio esforço, médio impacto (Testes)

**Commit 44**: `test(services): adicionar testes para chat adapters`
- Arquivos: `tests/services/chat-adapter.test.ts` (novo)
- Testar todas as implementações de adapter
- Mockar respostas de fetch
- Testar tratamento de erros e retries
- **Impacto**: Médio esforço, alto impacto (Testes)

**Commit 45**: `test(components): adicionar testes para componentes críticos de UI`
- Arquivos: `tests/components/*.test.tsx` (novo)
- Testar MessageList, ChatInput, InvestigationCard
- Testes de interação do usuário
- Validação da árvore de acessibilidade
- **Impacto**: Alto esforço, alto impacto (Testes)

### Fase 5.3: Testes E2E (3-4 dias)

**Commit 46**: `test(e2e): adicionar testes E2E de fluxo de autenticação`
- Arquivos: `tests/e2e/auth.spec.ts` (novo)
- Testar login com todos os provedores OAuth
- Testar persistência de sessão
- Testar fluxo de logout
- **Impacto**: Médio esforço, alto impacto (Testes)

**Commit 47**: `test(e2e): adicionar testes E2E de conversa de chat`
- Arquivos: `tests/e2e/chat.spec.ts` (novo)
- Testar envio de mensagens
- Testar respostas de agentes
- Testar gerenciamento de sessão
- **Impacto**: Alto esforço, alto impacto (Testes)

**Commit 48**: `test(e2e): adicionar testes E2E de filtragem de investigações`
- Arquivos: `tests/e2e/investigations.spec.ts` (novo)
- Testar interações de filtro
- Testar carregamento de dados
- Testar funcionalidade de exportação
- **Impacto**: Médio esforço, médio impacto (Testes)

**Commit 49**: `test(ci): integrar testes ao pipeline de CI/CD`
- Arquivos: `.github/workflows/test.yml` (atualizar)
- Executar testes unitários em PR
- Executar testes E2E em staging
- Bloquear merge em falhas de teste
- **Impacto**: Baixo esforço, alto impacto (Testes)

**Commit 50**: `test(coverage): adicionar relatórios de cobertura de código`
- Arquivos: Configuração de coverage em `vitest.config.ts`
- Gerar relatórios HTML de cobertura
- Configurar thresholds mínimos (80%)
- Adicionar badge de cobertura ao README
- **Impacto**: Baixo esforço, médio impacto (Testes)

---

## 🔄 Bônus: Melhorias de Type Safety (Contínuo)

**Objetivo**: Eliminar todos os tipos `any` e melhorar rigor do TypeScript
**Commits Estimados**: 5+ commits (podem ser feitos em paralelo com outros sprints)

**Commit 51**: `refactor(types): remover tipos any dos clientes de API`
- Arquivos: `lib/api/*.ts`
- Substituir `any` por tipos específicos
- Criar interfaces tipadas para respostas
- **Impacto**: Médio esforço, médio impacto (Qualidade de Código)

**Commit 52**: `refactor(types): melhorar tratamento de tipos de erro`
- Arquivos: Todos os blocos catch com `error: any`
- Usar `error: unknown` com type guards
- Criar classes de erro tipadas
- **Impacto**: Médio esforço, médio impacto (Qualidade de Código)

**Commit 53**: `refactor(types): adicionar tipos estritos aos query parsers`
- Arquivos: `lib/api/query-parser.ts`
- Substituir `Record<string, any>`
- Criar discriminated unions
- **Impacto**: Médio esforço, médio impacto (Qualidade de Código)

**Commit 54**: `refactor(types): habilitar opções mais estritas do compilador TypeScript`
- Arquivos: `tsconfig.json`
- Habilitar `noImplicitAny: true`
- Habilitar `strictNullChecks: true`
- Corrigir erros resultantes
- **Impacto**: Alto esforço, alto impacto (Qualidade de Código)

**Commit 55**: `refactor(types): adicionar schemas de validação Zod`
- Arquivos: `lib/validation/schemas.ts` (novo)
- Criar validação em runtime para respostas de API
- Garantir type safety nas boundaries
- **Impacto**: Médio esforço, alto impacto (Qualidade de Código + Segurança)

---

## 📈 Métricas de Sucesso

### Qualidade de Código
- ✅ Zero `console.log` em código de produção
- ✅ Todas as rotas têm error boundaries
- ✅ Nenhum componente com mais de 400 linhas
- ✅ Menos de 5 tipos `any` restantes
- ✅ Todas as funções públicas têm JSDoc

### Performance
- ✅ Tamanho do bundle inicial reduzido em 20%+
- ✅ LCP (Largest Contentful Paint) < 2.5s
- ✅ TBT (Total Blocking Time) < 200ms
- ✅ CLS (Cumulative Layout Shift) < 0.1

### Segurança
- ✅ CSP sem unsafe-inline/unsafe-eval
- ✅ Todos os inputs de usuário validados
- ✅ Rate limiting com feedback ao usuário
- ✅ Nenhum dado sensível em logs

### Acessibilidade
- ✅ Conformidade WCAG 2.1 AA
- ✅ Zero violações críticas do axe
- ✅ Todos os elementos interativos acessíveis por teclado
- ✅ Todos os formulários têm labels apropriadas

### Testes
- ✅ 80%+ de cobertura de código
- ✅ Testes E2E para 3 fluxos críticos
- ✅ Todas as stores têm testes unitários
- ✅ CI/CD bloqueia em falhas de teste

---

## 🗓️ Resumo da Timeline

| Sprint | Duração | Área de Foco | Commits |
|--------|---------|--------------|---------|
| Sprint 1 | Semana 1-2 | Qualidade de Código & Tratamento de Erros | 12 |
| Sprint 2 | Semana 3 | Otimização de Performance | 8 |
| Sprint 3 | Semana 4-5 | Refatoração de Componentes | 9 |
| Sprint 4 | Semana 5-6 | Acessibilidade & UX | 10 |
| Sprint 5 | Semana 6-8 | Infraestrutura de Testes | 10 |
| Bônus | Contínuo | Type Safety | 5+ |
| **Total** | **6-8 semanas** | **Todas as Áreas** | **54+** |

---

## 🚀 Como Começar

### Sprint 1 - Tarefas do Primeiro Dia
1. Criar feature branch: `git checkout -b feat/sprint-1-error-handling`
2. Começar com Commit 1: Substituir console.log
3. Seguir roadmap commit por commit
4. Criar PR após conclusão de cada fase

### Workflow Diário
```bash
# Início do dia
git checkout main && git pull origin main
git checkout feat/sprint-X-nome-da-feature

# Após cada commit
npm run type-check
npm run lint
npm run test (uma vez que testes estejam configurados)

# Final da fase
git push origin feat/sprint-X-nome-da-feature
# Criar PR para revisão
```

---

## 📝 Observações Importantes

- Cada commit deve ser atômico e deployável
- PRs devem ser criados por fase (não por commit)
- Todos os commits seguem formato conventional commit
- Sem menções a ferramentas de IA nas mensagens de commit
- Todos os commits em inglês (padrão internacional)
- Code reviews necessários antes de merge
- Testes devem passar antes de cada commit
- Documentação atualizada junto com código

---

## 🎯 Priorização por Valor de Negócio

### Impacto Imediato ao Usuário (Alta Prioridade)
1. Error boundaries (Sprint 1) - Previne crashes
2. Acessibilidade (Sprint 4) - Inclusão
3. Performance (Sprint 2) - Experiência fluida

### Qualidade de Longo Prazo (Média Prioridade)
4. Refatoração (Sprint 3) - Manutenibilidade
5. Type Safety (Bônus) - Menos bugs

### Confiança & Sustentabilidade (Média Prioridade)
6. Testes (Sprint 5) - Confiabilidade

---

**Vamos construir uma plataforma de transparência de classe mundial! 🇧🇷**
