# Sprint Roadmap - 15 Dezembro 2025 a 15 Janeiro 2026

**Autor**: Anderson Henrique da Silva
**Criado**: 15/12/2025
**Periodo**: 1 mes (4 semanas)
**Objetivo**: Estabilizar testes, resolver problemas criticos, preparar para producao

---

## Situacao Atual (15/12/2025)

### Metricas do Projeto

| Metrica              | Valor Anterior | Valor Atual | Observacao                            |
| -------------------- | -------------- | ----------- | ------------------------------------- |
| Arquivos de teste    | 551 (errado)   | **166**     | Contagem corrigida                    |
| Testes totais        | N/A            | **3793**    | Todos executam sem crash              |
| Memoria max (testes) | 24GB+ (crash)  | **~4GB**    | ✅ RESOLVIDO                          |
| Tempo de execucao    | N/A (crash)    | **47s**     | Suite completa                        |
| Testes passando      | N/A            | **~30%**    | Muitos testes com problemas de window |
| Cobertura alvo       | 60%            | 20%         | Threshold atual: 20% (temporario)     |
| Erros TypeScript     | 0              | 0           | Build passando                        |
| Bundle size          | ~400KB         | ~400KB      | Meta: 250KB                           |

### Problema Critico Descoberto

~~**Testes consumindo toda memoria RAM (24GB)** - PC trava ao rodar `npm run test:coverage`~~

**✅ RESOLVIDO em 15/12/2025** - Configuração de paralelismo corrigida.

**Causa identificada**:

- ~~551 arquivos de teste rodando simultaneamente~~ → Eram 166 arquivos
- ~~Memory leaks em mocks ou setup~~ → Problema era paralelismo sem limites
- ✅ Falta de isolamento entre testes → Resolvido com pool: forks
- ✅ Configuracao do Vitest inadequada para escala → Corrigida

### Novo Problema Identificado (15/12/2025)

**~70% dos testes estão falhando** - Problemas de qualidade nos testes, não de memória

**Causas principais**:

- Testes manipulando `window` incorretamente (TypeError: window is not defined)
- Mocks de fetch/AbortSignal não compatíveis com jsdom
- Testes com assertions desatualizadas

**Impacto**: Testes executam sem crash, mas muitos falham. Isso precisa ser corrigido na Semana 2.

---

## Semana 1 (15-21 Dez): Estabilizacao de Testes ✅ COMPLETO

### P0 - CRITICO: Resolver Memory Leak nos Testes

**Objetivo**: Testes devem rodar sem consumir mais de 4GB de RAM

#### Dia 1-2: Diagnostico ✅ COMPLETO (15/12/2025)

- [x] Identificar arquivos de teste que consomem mais memoria
  - Descoberto: 166 arquivos de teste no projeto (não 551 - contagem incluía node_modules)
  - Problema real: paralelismo excessivo sem limites
- [x] Analisar `vitest.setup.ts` para memory leaks
  - Adicionado beforeEach/afterEach com cleanup completo
- [x] Verificar mocks globais que acumulam estado
  - Configurado clearMocks, restoreMocks, clearAllTimers
- [x] Revisar `config/vitest.config.mjs` para otimizacoes
  - Configuração completamente reescrita

#### Dia 3-4: Implementacao ✅ COMPLETO (15/12/2025)

- [x] Configurar `maxWorkers` no Vitest (limitar paralelismo)
  - maxWorkers: 1, maxConcurrency: 1 (execução sequencial)
- [x] Adicionar `--pool=forks` ou `--pool=vmThreads`
  - pool: forks com singleFork: true para isolamento
- [x] Implementar `afterEach` com cleanup em mocks pesados
  - vi.clearAllMocks(), vi.clearAllTimers(), vi.restoreAllMocks()
- [x] Criar script para rodar testes em batches
  - scripts/testing/run-tests-batch.sh
- [x] Configurar `--maxConcurrency` para limitar testes simultaneos
  - sequence.concurrent: false

#### Dia 5-6: Validacao ✅ COMPLETO (15/12/2025)

- [x] Testar com `NODE_OPTIONS="--max-old-space-size=4096"`
  - 3793 testes em 47s sem crash (antes: travava PC)
- [x] Monitorar memoria durante execucao
  - Máximo ~4GB usado vs 24GB+ antes
- [x] Documentar configuracao otimizada
  - Commit: perf(test): optimize vitest configuration for memory efficiency
- [x] Criar comando `npm run test:safe` com limites de memoria
  - Novos comandos: test:safe, test:safe:coverage, test:lib, test:hooks, etc.

**Entregaveis**:

```bash
# Novos comandos para rodar testes de forma segura
npm run test:safe        # Testes com limite de memoria
npm run test:batch       # Testes em batches por pasta
npm run test:single      # Testar arquivo unico
```

---

## Semana 2 (22-28 Dez): Otimizacao de Testes

### P1: Reorganizar Estrutura de Testes

**Objetivo**: Facilitar execucao parcial e debugging

#### Tarefas

- [ ] Categorizar testes por dominio:
  ```
  __tests__/
  ├── unit/           # Testes rapidos, sem IO
  │   ├── lib/
  │   ├── hooks/
  │   └── store/
  ├── integration/    # Testes com mocks externos
  │   ├── api/
  │   └── supabase/
  └── e2e/           # Playwright (ja existe)
  ```
- [ ] Criar comandos por categoria:
  - `npm run test:unit` - apenas testes unitarios rapidos
  - `npm run test:integration` - testes com mocks
- [ ] Mover testes pesados para execucao separada
- [ ] Identificar e remover testes duplicados

### P2: Aumentar Coverage para 60%

**Areas prioritarias**:

- [ ] `lib/chat/` - ChatService e adapters
- [ ] `store/` - Zustand stores principais
- [ ] `hooks/agora/` - Hooks de gamificacao

---

## Semana 3 (29 Dez - 4 Jan): Qualidade e Performance

### P1: Resolver Divida Tecnica Pendente

Baseado no roadmap anterior que nao foi completado:

- [ ] Consolidar export-service (ainda tem duplicatas?)
- [ ] Remover codigo morto identificado
- [ ] Migrar console.log para logger
- [ ] Revisar e limpar dependencies nao utilizadas

### P2: Bundle Size

**Meta**: Reduzir de 400KB para 300KB

- [ ] Analisar com `ANALYZE=true npm run build`
- [ ] Lazy load jsPDF e html2canvas
- [ ] Otimizar imports de lucide-react
- [ ] Revisar chunks splitting

---

## Semana 4 (5-15 Jan): Preparacao para Producao

### P0: Validacao Final

- [ ] Rodar todos os testes com nova configuracao
- [ ] Verificar coverage >= 60%
- [ ] Build de producao sem erros
- [ ] Lighthouse score >= 90

### P1: Documentacao

- [ ] Atualizar CLAUDE.md com novas configuracoes de teste
- [ ] Documentar comandos de teste otimizados
- [ ] Criar guia de troubleshooting para memoria

### P2: Monitoramento

- [ ] Validar Sentry funcionando
- [ ] Configurar alertas
- [ ] Health check endpoint

---

## Comandos de Teste Propostos

```bash
# Testes seguros (com limite de memoria)
npm run test:safe

# Por categoria
npm run test:unit           # Rapidos, < 1 min
npm run test:integration    # Com mocks, < 5 min
npm run test:e2e            # Playwright

# Por dominio
npm run test:lib            # lib/**
npm run test:store          # store/**
npm run test:hooks          # hooks/**

# Debugging
npm run test:debug          # Com UI do Vitest
npm run test:single <file>  # Arquivo especifico
```

---

## Configuracao Vitest Proposta

```javascript
// config/vitest.config.mjs - otimizado para memoria
export default defineConfig({
  test: {
    // Limitar paralelismo
    maxWorkers: 2,
    maxConcurrency: 5,

    // Usar forks para isolamento de memoria
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 2,
        minForks: 1,
      },
    },

    // Timeout mais agressivo
    testTimeout: 10000,

    // Limpar memoria entre testes
    clearMocks: true,
    restoreMocks: true,

    // Sequencial para debugging
    // sequence: { concurrent: false },
  },
})
```

---

## Metricas de Sucesso

| Metrica              | Atual | Meta Semana 2 | Meta Final |
| -------------------- | ----- | ------------- | ---------- |
| Memoria max (testes) | 24GB+ | 4GB           | 4GB        |
| Tempo testes unit    | N/A   | < 2 min       | < 2 min    |
| Coverage             | ~20%  | 40%           | 60%        |
| Bundle size          | 400KB | 350KB         | 300KB      |
| Lighthouse           | ~85   | 90            | 90+        |

---

## Riscos e Mitigacoes

| Risco                               | Probabilidade | Impacto | Mitigacao                           |
| ----------------------------------- | ------------- | ------- | ----------------------------------- |
| Memory leak em bibliotecas externas | Media         | Alto    | Isolar com mocks leves              |
| Testes falham apos otimizacao       | Alta          | Medio   | Rodar em batch, corrigir aos poucos |
| Feriados atrasam progresso          | Alta          | Medio   | Front-load trabalho critico         |
| Coverage nao atinge 60%             | Media         | Baixo   | Priorizar areas criticas            |

---

## Prioridades Resumidas

### P0 - Bloqueadores (Semana 1)

1. **Resolver memory leak dos testes**
2. Criar comandos de teste seguros

### P1 - Alta Prioridade (Semanas 2-3)

1. Reorganizar estrutura de testes
2. Aumentar coverage para 60%
3. Resolver divida tecnica pendente

### P2 - Media Prioridade (Semana 4)

1. Reduzir bundle size
2. Documentacao atualizada
3. Validacao de producao

---

## Checkpoints

- [ ] **22/12**: Testes rodam sem travar PC
- [ ] **29/12**: Estrutura de testes reorganizada
- [ ] **05/01**: Coverage >= 50%
- [ ] **15/01**: Projeto pronto para producao

---

**Proxima revisao**: 22/12/2025

---

_Criado: 15/12/2025 por Anderson Henrique da Silva_
