# Sprint 1 - Tarefas Detalhadas

**Sprint:** Limpeza e Organização  
**Duração:** 30/09/2025 - 13/10/2025  
**Objetivo:** Eliminar 20% de código morto e preparar base para testes

## 📋 Checklist de Tarefas

### 🧹 Dia 1-3: Análise e Mapeamento

#### Identificação de Código Morto

```bash
# Rodar estes comandos para mapear:
find app -name "*-v[1-4].tsx" -type f
find components -name "*-old.tsx" -type f
find components -name "*-deprecated.tsx" -type f
```

- [ ] Criar lista completa de arquivos para deletar
- [ ] Verificar dependências com `grep -r "import.*from.*v1"`
- [ ] Backup do estado atual: `git checkout -b backup-before-cleanup`

### 🗑️ Dia 4-7: Remoção de Arquivos

#### Páginas Obsoletas (app/)

- [ ] `app/pt/chat/page-v1.tsx`
- [ ] `app/pt/chat/page-v2.tsx`
- [ ] `app/pt/chat/page-v4.tsx`
- [ ] `app/pt/dashboard/page-v1.tsx`
- [ ] `app/pt/profile/page-old.tsx`
- [ ] `app/pt/settings/page-old.tsx`
- [ ] `app/en/` (versões antigas equivalentes)

#### Componentes Obsoletos (components/)

- [ ] `components/chat/chat-interface-v1.tsx`
- [ ] `components/chat/chat-interface-v2.tsx`
- [ ] `components/auth-layout-old.tsx`
- [ ] `components/header-old.tsx`
- [ ] `components/navigation-old.tsx`
- [ ] `components/ui/*-deprecated.tsx`

#### Adaptadores de Chat Obsoletos (lib/api/)

- [ ] `lib/api/chat-adapter-simple.ts`
- [ ] `lib/api/chat-adapter-stable.ts`
- [ ] `lib/api/chat-adapter-optimized.ts`
- [ ] Manter apenas: `chat-adapter-v3.ts` e `smart-chat.service.ts`

### 📁 Dia 8-10: Reorganização

#### Mover Páginas de Teste

```bash
# De:
app/pt/test-animations/
app/pt/test-glassmorphism/
app/pt/test-loading/
app/pt/test-notifications/

# Para:
app/test/animations/
app/test/glassmorphism/
app/test/loading/
app/test/notifications/
```

- [ ] Criar estrutura `/app/test/`
- [ ] Mover todas as páginas test-\*
- [ ] Atualizar imports se necessário
- [ ] Adicionar `/test` ao .gitignore para produção

### 📦 Dia 11-12: Consolidação de Dependências

#### Análise de Bibliotecas de Gráficos

- [ ] Contar uso de Recharts: `grep -r "recharts" --include="*.tsx" | wc -l`
- [ ] Contar uso de ApexCharts: `grep -r "apexcharts" --include="*.tsx" | wc -l`
- [ ] Decisão: Manter ****\_**** (preencher após análise)
- [ ] Migrar componentes se necessário
- [ ] Remover biblioteca não escolhida

#### Remover Supabase

```bash
npm uninstall @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
```

- [ ] Remover arquivos:
  - `lib/supabase.ts`
  - `lib/supabase-client.ts`
  - `hooks/use-supabase-auth.ts`
- [ ] Substituir `useAuth` por versão mockada em todos os lugares
- [ ] Remover variáveis de ambiente do Supabase

### 🧪 Dia 13-14: Validação e Entrega

#### Testes de Regressão

- [ ] `npm run build` - deve passar sem erros
- [ ] `npm run lint` - zero warnings
- [ ] `npm run type-check` - zero erros
- [ ] Testar manualmente todas as páginas principais
- [ ] Verificar bundle size: antes vs depois

#### Métricas para Reportar

- [ ] Número de arquivos removidos: \_\_\_
- [ ] Linhas de código removidas: \_\_\_
- [ ] Redução no bundle size: **_MB → _**MB
- [ ] Tempo de build: **_s → _**s

### 🎯 Definition of Done

- [ ] Zero arquivos com sufixo -v1, -v2, -v3, -v4
- [ ] Zero arquivos com sufixo -old, -deprecated
- [ ] Todas páginas de teste em `/app/test/`
- [ ] Apenas uma biblioteca de gráficos
- [ ] Supabase completamente removido
- [ ] Build passando sem erros
- [ ] Aplicação funcionando normalmente
- [ ] PR criado com todas as mudanças
- [ ] Code review aprovado

### 📊 Resultado Esperado

Ao final do Sprint 1:

- 📉 **20% menos código** para manter
- 📦 **Bundle 30% menor** (~2MB → ~1.4MB)
- 🏗️ **Estrutura pronta** para implementar testes
- 🧹 **Zero débito técnico** de arquivos obsoletos

---

## 🚨 Pontos de Atenção

1. **Antes de deletar:** Sempre verificar se o arquivo é importado em algum lugar
2. **Commits pequenos:** Fazer commits por categoria (páginas, componentes, etc.)
3. **Testar frequentemente:** Rodar a aplicação após cada grande remoção
4. **Documentar decisões:** Anotar porque escolhemos uma lib sobre outra

## 💡 Scripts Úteis

```bash
# Encontrar imports órfãos
npm run lint

# Ver tamanho do bundle
npm run build && npm run analyze

# Encontrar arquivos não utilizados
npx unimported

# Verificar tipos
npm run type-check
```
