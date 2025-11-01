# Plano de Sprints - Cidadão.AI Frontend

**Autor:** Anderson Henrique da Silva  
**Data de Criação:** 29 de setembro de 2025  
**Duração Total:** 8 sprints (16 semanas)  
**Metodologia:** Scrum adaptado

## Visão Geral

Este documento detalha o planejamento em sprints para elevar a qualidade do projeto de 7.5/10 para 9+/10.

### Objetivos Principais:

1. Eliminar débito técnico (código morto)
2. Implementar cobertura de testes (80%)
3. Otimizar performance e bundle size
4. Melhorar documentação e DX

---

## 🚀 Sprint 1: Limpeza e Organização (2 semanas)

**Início:** 30/09/2025 | **Fim:** 13/10/2025

### Objetivos:

- Remover todo código morto
- Organizar estrutura do projeto
- Preparar base para testes

### User Stories:

#### 1.1 Remoção de Código Morto (13 story points)

**Como** desenvolvedor  
**Quero** remover todos os arquivos obsoletos  
**Para** reduzir complexidade e bundle size

**Tarefas:**

- [ ] Identificar e listar todos arquivos v1, v2, v3 obsoletos
- [ ] Remover páginas antigas (60+ arquivos)
- [ ] Remover componentes não utilizados
- [ ] Limpar adaptadores de chat obsoletos
- [ ] Atualizar imports afetados
- [ ] Testar aplicação após remoções

#### 1.2 Reorganização de Estrutura (8 points)

**Como** desenvolvedor  
**Quero** reorganizar arquivos de teste  
**Para** separar código de produção de desenvolvimento

**Tarefas:**

- [ ] Mover páginas test-\* para /app/test/
- [ ] Criar estrutura de pastas para testes
- [ ] Configurar aliases de importação
- [ ] Atualizar tsconfig paths

#### 1.3 Consolidação de Dependências (5 points)

**Como** desenvolvedor  
**Quero** remover bibliotecas duplicadas  
**Para** reduzir bundle size

**Tarefas:**

- [ ] Análise: Recharts vs ApexCharts
- [ ] Remover biblioteca não escolhida
- [ ] Migrar componentes se necessário
- [ ] Remover Supabase não utilizado

### Entregáveis:

- Código 20% mais limpo
- Bundle size reduzido em ~30%
- Estrutura organizada para testes

### Métricas de Sucesso:

- ✅ 0 arquivos obsoletos
- ✅ Bundle < 2MB
- ✅ Build time < 40s

---

## 🧪 Sprint 2: Fundação de Testes (2 semanas)

**Início:** 14/10/2025 | **Fim:** 27/10/2025

### Objetivos:

- Configurar infraestrutura de testes
- Criar primeiros testes unitários
- Estabelecer padrões de teste

### User Stories:

#### 2.1 Setup Framework de Testes (8 points)

**Como** desenvolvedor  
**Quero** configurar Vitest  
**Para** começar a escrever testes unitários

**Tarefas:**

- [ ] Instalar Vitest e React Testing Library
- [ ] Configurar vitest.config.ts
- [ ] Setup de mocks e test utilities
- [ ] Criar exemplo de teste
- [ ] Integrar com VS Code

#### 2.2 Testes de Componentes Core (13 points)

**Como** desenvolvedor  
**Quero** testar componentes principais  
**Para** garantir funcionamento básico

**Tarefas:**

- [ ] Testar Button, Card, GlassCard
- [ ] Testar sistema de Tooltips
- [ ] Testar hooks principais
- [ ] Testar utils/helpers
- [ ] Coverage report setup

#### 2.3 CI/CD para Testes (5 points)

**Como** equipe  
**Quero** testes rodando no GitHub Actions  
**Para** prevenir regressões

**Tarefas:**

- [ ] Criar workflow de testes
- [ ] Configurar cache de dependências
- [ ] Badge de coverage no README
- [ ] Proteção de branch com testes

### Entregáveis:

- Vitest configurado
- 20% coverage inicial
- CI rodando testes

---

## 🎯 Sprint 3: Cobertura de Testes Críticos (2 semanas)

**Início:** 28/10/2025 | **Fim:** 10/11/2025

### Objetivos:

- Testar fluxos críticos
- Atingir 40% de cobertura
- Documentar padrões de teste

### User Stories:

#### 3.1 Testes do Sistema de Chat (13 points)

**Como** usuário  
**Quero** chat funcionando corretamente  
**Para** interagir com os agentes

**Tarefas:**

- [ ] Testar chat adapters
- [ ] Testar smart chat service
- [ ] Testar chat store (Zustand)
- [ ] Testar error handling
- [ ] Testar cache service

#### 3.2 Testes de Acessibilidade (8 points)

**Como** usuário com deficiência  
**Quero** navegação acessível  
**Para** usar o sistema completamente

**Tarefas:**

- [ ] Testar ContrastToggle
- [ ] Testar navegação por teclado
- [ ] Testar ARIA labels
- [ ] jest-axe para a11y automático

#### 3.3 Testes E2E Expandidos (8 points)

**Como** QA  
**Quero** testes end-to-end completos  
**Para** validar fluxos de usuário

**Tarefas:**

- [ ] Expandir testes Playwright
- [ ] Fluxo completo de chat
- [ ] Fluxo de investigação
- [ ] Testes de PWA
- [ ] Screenshots automáticos

### Entregáveis:

- 40% cobertura de testes
- Fluxos críticos testados
- Guia de testes documentado

---

## ⚡ Sprint 4: Otimização de Performance (2 semanas)

**Início:** 11/11/2025 | **Fim:** 24/11/2025

### Objetivos:

- Implementar lazy loading
- Otimizar bundle size
- Melhorar Core Web Vitals

### User Stories:

#### 4.1 Lazy Loading de Componentes (8 points)

**Como** usuário  
**Quero** carregamento rápido  
**Para** melhor experiência

**Tarefas:**

- [ ] Identificar componentes pesados
- [ ] Implementar dynamic imports
- [ ] Loading skeletons
- [ ] Preload crítico
- [ ] Medir impacto

#### 4.2 Otimização de Imagens (5 points)

**Como** usuário mobile  
**Quero** imagens otimizadas  
**Para** economizar dados

**Tarefas:**

- [ ] Migrar para next/image
- [ ] Configurar AVIF/WebP
- [ ] Lazy loading de imagens
- [ ] Blur placeholders
- [ ] CDN setup

#### 4.3 Code Splitting Avançado (8 points)

**Como** desenvolvedor  
**Quero** bundles menores  
**Para** deploy mais rápido

**Tarefas:**

- [ ] Análise com webpack-bundle-analyzer
- [ ] Split por rotas
- [ ] Vendor bundles otimizados
- [ ] Tree shaking agressivo
- [ ] Minificação avançada

### Entregáveis:

- Bundle < 1.5MB
- Lighthouse 90+
- LCP < 2.5s

---

## 📚 Sprint 5: Documentação e DX (2 semanas)

**Início:** 25/11/2025 | **Fim:** 08/12/2025

### Objetivos:

- Documentar componentes
- Melhorar developer experience
- Criar guias completos

### User Stories:

#### 5.1 Documentação de Componentes (8 points)

**Como** novo desenvolvedor  
**Quero** documentação clara  
**Para** contribuir facilmente

**Tarefas:**

- [ ] JSDoc em todos componentes
- [ ] Exemplos de uso
- [ ] Props documentation
- [ ] Storybook stories
- [ ] README por pasta

#### 5.2 Guias de Desenvolvimento (5 points)

**Como** desenvolvedor  
**Quero** guias práticos  
**Para** seguir padrões

**Tarefas:**

- [ ] Guia de contribuição
- [ ] Padrões de código
- [ ] Guia de testes
- [ ] Troubleshooting
- [ ] FAQ técnico

#### 5.3 Developer Tooling (8 points)

**Como** desenvolvedor  
**Quero** ferramentas produtivas  
**Para** desenvolver mais rápido

**Tarefas:**

- [ ] Husky + lint-staged
- [ ] Component generators
- [ ] VS Code snippets
- [ ] Debug configurations
- [ ] Git hooks úteis

### Entregáveis:

- 100% componentes documentados
- Storybook completo
- DX melhorado significativamente

---

## 🔒 Sprint 6: Segurança e Qualidade (2 semanas)

**Início:** 09/12/2025 | **Fim:** 22/12/2025

### Objetivos:

- Audit de segurança
- Atingir 60% cobertura
- Zero warnings/errors

### User Stories:

#### 6.1 Security Hardening (8 points)

**Como** usuário  
**Quero** aplicação segura  
**Para** proteger meus dados

**Tarefas:**

- [ ] Dependency audit
- [ ] OWASP checklist
- [ ] CSP headers
- [ ] Input validation
- [ ] Security tests

#### 6.2 Qualidade de Código (8 points)

**Como** equipe  
**Quero** código limpo  
**Para** manutenção fácil

**Tarefas:**

- [ ] Fix todos ESLint warnings
- [ ] Refatorar código complexo
- [ ] Remover console.logs
- [ ] Type safety 100%
- [ ] Dead code final check

#### 6.3 Mais Testes (5 points)

**Como** desenvolvedor  
**Quero** 60% cobertura  
**Para** confiança no código

**Tarefas:**

- [ ] Testes de integração
- [ ] Testes de API
- [ ] Testes de store
- [ ] Mutation testing
- [ ] Coverage gaps

### Entregáveis:

- 0 vulnerabilidades
- 0 warnings
- 60% test coverage

---

## 🎨 Sprint 7: Polish e UX (2 semanas)

**Início:** 06/01/2026 | **Fim:** 19/01/2026

### Objetivos:

- Melhorias de UX mantendo identidade visual
- Animações e transições suaves
- Feedback visual consistente
- **PRESERVAR o dark mode atual que já está perfeito**

### User Stories:

#### 7.1 Micro-interações (8 points)

**Como** usuário  
**Quero** feedback visual  
**Para** entender ações

**Tarefas:**

- [ ] Loading states melhorados
- [ ] Hover animations
- [ ] Success animations
- [ ] Error states
- [ ] Skeleton screens

#### 7.2 Mobile Experience (8 points)

**Como** usuário mobile  
**Quero** experiência otimizada  
**Para** usar em qualquer lugar

**Tarefas:**

- [ ] Touch targets 44px+
- [ ] Gesture support
- [ ] Viewport optimizations
- [ ] Offline enhancements
- [ ] PWA improvements

#### 7.3 Dark Mode Refinamento (5 points)

**Como** usuário  
**Quero** manter o dark mode lindo atual com pequenos ajustes  
**Para** experiência consistente

**Tarefas:**

- [ ] Preservar estética atual (gradientes verde-azul)
- [ ] Garantir consistência em TODAS as páginas
- [ ] Melhorar apenas transições light/dark
- [ ] Validar contraste mantendo visual atual
- [ ] Adicionar opção "Manter tema do sistema"

**IMPORTANTE:** O dark mode atual é amado e deve ser PRESERVADO. Apenas refinamentos sutis.

### Entregáveis:

- UX polida
- Mobile-first
- Animations smooth

---

## 🏁 Sprint 8: Finalização e Deploy (2 semanas)

**Início:** 20/01/2026 | **Fim:** 02/02/2026

### Objetivos:

- Atingir 80% cobertura
- Performance final
- Production ready

### User Stories:

#### 8.1 Cobertura Final (8 points)

**Como** equipe  
**Quero** 80% coverage  
**Para** qualidade garantida

**Tarefas:**

- [ ] Gap analysis
- [ ] Critical paths 100%
- [ ] Edge cases
- [ ] Error scenarios
- [ ] Integration tests

#### 8.2 Production Optimization (8 points)

**Como** DevOps  
**Quero** deploy otimizado  
**Para** performance máxima

**Tarefas:**

- [ ] Build optimization
- [ ] CDN configuration
- [ ] Caching strategy
- [ ] Monitoring setup
- [ ] Rollback plan

#### 8.3 Documentação Final (5 points)

**Como** equipe  
**Quero** docs completos  
**Para** manutenção futura

**Tarefas:**

- [ ] Architecture docs
- [ ] Deployment guide
- [ ] Runbook
- [ ] Changelog
- [ ] Release notes

### Entregáveis:

- 80% test coverage
- Score 9+/10
- Production deployed

---

## 📊 Resumo do Planejamento

### Timeline Total:

- **8 Sprints**
- **16 semanas**
- **30/09/2025 a 02/02/2026**

### Distribuição de Esforço:

```
Sprint 1: Limpeza         ████████████ 26 points
Sprint 2: Testes Base     ████████████ 26 points
Sprint 3: Testes Critical ██████████████ 29 points
Sprint 4: Performance     ████████████ 21 points
Sprint 5: Documentação    ████████████ 21 points
Sprint 6: Segurança      ████████████ 21 points
Sprint 7: Polish         ████████████ 21 points
Sprint 8: Finalização    ████████████ 21 points
```

### Métricas de Acompanhamento:

| Sprint | Coverage | Bundle | Lighthouse | Code Health |
| ------ | -------- | ------ | ---------- | ----------- |
| 1      | 0%       | 2.0MB  | 85         | 7.5/10      |
| 2      | 20%      | 1.8MB  | 87         | 8.0/10      |
| 3      | 40%      | 1.7MB  | 88         | 8.2/10      |
| 4      | 45%      | 1.5MB  | 92         | 8.5/10      |
| 5      | 50%      | 1.5MB  | 92         | 8.7/10      |
| 6      | 60%      | 1.4MB  | 93         | 8.9/10      |
| 7      | 70%      | 1.4MB  | 94         | 9.0/10      |
| 8      | 80%      | 1.3MB  | 95+        | 9.2/10      |

### Riscos e Mitigações:

1. **Risco:** Quebrar funcionalidades ao remover código
   - **Mitigação:** Testes manuais extensivos no Sprint 1

2. **Risco:** Curva de aprendizado com Vitest
   - **Mitigação:** Pair programming e exemplos

3. **Risco:** Performance degradada com mais features
   - **Mitigação:** Monitoring contínuo

### Definição de Pronto (DoD):

- [ ] Código revisado
- [ ] Testes escritos
- [ ] Documentação atualizada
- [ ] Zero warnings
- [ ] Performance validada

### Cerimônias Sugeridas:

- **Planning:** Segunda-feira manhã
- **Daily:** 15min às 9h30
- **Review:** Sexta à tarde
- **Retro:** Sexta final do sprint

---

## 🎯 Resultado Esperado

Ao final dos 8 sprints teremos:

- ✅ **Score 9.2/10** de qualidade
- ✅ **80%** de cobertura de testes
- ✅ **Bundle < 1.3MB**
- ✅ **Lighthouse 95+**
- ✅ **Zero débito técnico**
- ✅ **Documentação completa**
- ✅ **DX excepcional**
- ✅ **Production-ready**

O projeto estará pronto para escalar com confiança e servir como referência de qualidade.
