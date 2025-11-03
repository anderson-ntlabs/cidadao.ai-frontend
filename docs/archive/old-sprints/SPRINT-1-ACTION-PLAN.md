# 🚀 Sprint 1 - Plano de Ação: Limpeza Segura

**Data:** 29/09/2025  
**Executor:** Anderson Henrique da Silva  
**Objetivo:** Remover 11.148 linhas de código morto com segurança

## 📊 Resumo da Análise

- **56 arquivos** para deletar
- **11.148 linhas** de código obsoleto
- **ALERTA:** Alguns arquivos -v2 ainda são usados!

## 🎯 Estratégia em 3 Fases

### 🟢 FASE 1: Deletar Imediatamente (Seguros)

**33 arquivos | ~5.800 linhas**

#### Páginas antigas (não usadas)

```bash
# Deletar com segurança - nenhuma importação ativa
rm app/pt/\(authenticated\)/chat/page-v1.tsx
rm app/pt/\(authenticated\)/dashboard/page-v1.tsx
rm app/pt/\(authenticated\)/investigations/page-v1.tsx
rm app/pt/about/page-v1.tsx
rm app/pt/agents/page-v1.tsx
rm app/pt/contact/page-v1.tsx
rm app/pt/docs/page-v1.tsx
rm app/pt/faq/page-v1.tsx
rm app/pt/privacy/page-v1.tsx
rm app/pt/terms/page-v1.tsx
```

#### Componentes obsoletos

```bash
# UI components v1 (não usados)
rm components/ui/button-v1.tsx
rm components/ui/card-v1.tsx
rm components/ui/select-v1.tsx
rm components/ui/skeleton-v1.tsx

# Layouts antigos
rm components/auth-layout-v1.tsx
rm app/pt/\(authenticated\)/layout-v1.tsx
```

#### Scripts de teste obsoletos

```bash
rm scripts/test-chat-components.js
rm scripts/test-store-v1.js
rm scripts/test-ui-components.js
```

### 🟡 FASE 2: Renomear e Atualizar (30+ importações)

**17 arquivos | ~4.100 linhas**

#### 1. Renomear componentes -v2 para versão principal

```bash
# PASSO 1: Renomear arquivos
mv components/ui/button-v2.tsx components/ui/button.tsx
mv components/ui/card-v2.tsx components/ui/card.tsx
mv components/ui/glass-card-v2.tsx components/ui/glass-card.tsx
mv components/ui/select-v2.tsx components/ui/select.tsx
mv components/ui/skeleton-v2.tsx components/ui/skeleton.tsx
mv components/ui/switch-v2.tsx components/ui/switch.tsx
```

#### 2. Atualizar todas as importações

```bash
# PASSO 2: Atualizar imports em massa
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/button-v2/button/g'
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/card-v2/card/g'
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/glass-card-v2/glass-card/g'
# ... repetir para todos os componentes
```

#### 3. Componentes a renomear:

- [ ] button-v2.tsx → button.tsx (32 imports)
- [ ] card-v2.tsx → card.tsx (3 imports)
- [ ] glass-card-v2.tsx → glass-card.tsx (19 imports)
- [ ] select-v2.tsx → select.tsx (2 imports)
- [ ] skeleton-v2.tsx → skeleton.tsx (10 imports)
- [ ] switch-v2.tsx → switch.tsx (1 import)
- [ ] breadcrumbs-v2.tsx → breadcrumbs.tsx (4 imports)
- [ ] auth-layout-v2.tsx → auth-layout.tsx (9 imports)
- [ ] header-v2.tsx → header.tsx (3 imports)
- [ ] navigation-v2.tsx → navigation.tsx (6 imports)
- [ ] mobile-nav-v2.tsx → mobile-nav.tsx (3 imports)

### 🔴 FASE 3: Limpar Adaptadores e Testes

**6 arquivos | ~800 linhas**

#### Adaptadores de chat para remover

```bash
# Após verificar que smart-chat.service.ts funciona sem eles
rm lib/api/chat-adapter-simple.ts
rm lib/api/chat-adapter-stable.ts
rm lib/api/chat-adapter-optimized.ts
```

#### Mover páginas de teste

```bash
# Criar nova estrutura
mkdir -p app/test

# Mover páginas
mv app/pt/test-auth app/test/auth
mv app/pt/test-breadcrumbs app/test/breadcrumbs
mv app/pt/test-buttons app/test/buttons
mv app/pt/test-cards app/test/cards
mv app/pt/test-layout app/test/layout
mv app/pt/test-navigation app/test/navigation
```

## 📋 Checklist de Execução

### Dia 1-2: Preparação

- [ ] Criar branch: `git checkout -b sprint-1-cleanup`
- [ ] Backup completo: `git stash` ou tag
- [ ] Rodar testes iniciais
- [ ] Anotar métricas atuais (bundle size, build time)

### Dia 3-5: Fase 1 (Deletar seguros)

- [ ] Deletar 33 arquivos identificados
- [ ] Commit: "chore: remove obsolete v1 components and pages"
- [ ] Testar aplicação
- [ ] Verificar build

### Dia 6-8: Fase 2 (Renomear -v2)

- [ ] Renomear todos os arquivos -v2
- [ ] Atualizar imports automaticamente
- [ ] Verificar manualmente imports complexos
- [ ] Commit: "refactor: rename v2 components to main version"
- [ ] Rodar todos os testes

### Dia 9-10: Fase 3 (Adaptadores e testes)

- [ ] Verificar smart-chat.service.ts
- [ ] Remover adaptadores não usados
- [ ] Mover páginas de teste
- [ ] Commit: "chore: clean up chat adapters and reorganize tests"

### Dia 11-12: Validação Final

- [ ] Rodar build completo
- [ ] Testar todas as funcionalidades
- [ ] Medir métricas finais
- [ ] Documentar resultados
- [ ] PR com todas as mudanças

## 🎯 Métricas Esperadas

| Métrica          | Antes | Depois | Redução    |
| ---------------- | ----- | ------ | ---------- |
| Arquivos         | 456   | ~400   | -56 files  |
| Linhas de código | ~50k  | ~39k   | -11k lines |
| Bundle size      | 2.5MB | ~1.8MB | -28%       |
| Build time       | 45s   | ~35s   | -22%       |

## ⚠️ Pontos de Atenção

1. **NÃO deletar** arquivos -v2 diretamente - eles precisam ser renomeados
2. **Testar** após cada fase
3. **Commits pequenos** e bem descritos
4. **Verificar** imports após renomeação
5. **Manter** chat-adapter-optimized-maritaca.ts (usado pelo smart service)

## 🚨 Rollback Plan

Se algo der errado:

```bash
git checkout main
git branch -D sprint-1-cleanup
git checkout -b sprint-1-cleanup
# Recomeçar com mais cuidado
```

## ✅ Definition of Done

- [ ] 56 arquivos removidos/reorganizados
- [ ] Zero erros de build
- [ ] Zero erros de TypeScript
- [ ] Aplicação funcionando normalmente
- [ ] Bundle size reduzido em >25%
- [ ] PR aprovado e mergeado

---

**Próximo passo:** Começar pela Fase 1 (arquivos seguros para deletar)
