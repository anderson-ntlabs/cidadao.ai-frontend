# 📊 BASELINE METRICS - CIDADÃO.AI FRONTEND

**Autor**: Anderson Henrique da Silva
**Data de Coleta**: 2025-10-31 22:45:00 -0300
**Branch**: consolidation-2025

---

## 📈 MÉTRICAS ATUAIS (ANTES DA CONSOLIDAÇÃO)

### Build & Bundle

- **Build Output Size**: 3.1MB (.next/static)
- **First Load JS**: 222 KB (shared by all)
- **Largest Route**: /pt/app/dashboard - 383 KB
- **Middleware Size**: 69.5 KB
- **Build Time**: ~45 seconds

### Codebase

- **Total Lines of Code (lib/)**: 25,277 lines
- **Direct Dependencies**: 78 packages
- **Chat Adapters**: 6 implementations
- **Scripts Folder**: 55 manual test scripts

### Arquitetura Atual

#### Chat System Complexity

```
lib/api/
├── chat-adapter-backend.ts
├── chat-adapter-fallback.ts
├── chat-adapter-maritaca.ts
├── chat-adapter-optimized.ts
├── chat-adapter-simple.ts
├── chat-adapter-sse.ts
└── [outros serviços]

lib/services/
├── smart-chat.service.ts (adapter selector)
├── chat-cache.service.ts (caching layer)
└── chat.service.ts (main service)
```

### Test Coverage

- **Unit Tests**: ~0% (sem framework configurado)
- **Integration Tests**: 0 (apenas scripts manuais)
- **E2E Tests**: 0
- **Scripts Manuais**: 55 arquivos em `/scripts`

### TypeScript Coverage

- **Strict Mode**: false
- **skipLibCheck**: true (problema!)
- **Files with 'any'**: Estimado ~40%
- **Type Coverage**: ~60%

### Performance (não medido automaticamente)

- **Lighthouse Score**: Não configurado
- **Core Web Vitals**: Não monitorado
- **Bundle Analysis**: Não configurado

### Dependencies Analysis

#### Heavy Dependencies Detected

- **d3**: Full import (should be tree-shaken)
- **recharts**: Full import
- **jspdf**: Loaded even when not used
- **html2canvas**: Loaded globally
- **lucide-react**: Not optimized imports

### Code Duplication

- **Chat Adapters**: ~35% código duplicado entre adapters
- **API Calls**: Múltiplas implementações similares
- **State Management**: Lógica repetida entre stores

### Technical Debt Indicators

- **Cyclomatic Complexity**: Não medido (estimado >15 em alguns arquivos)
- **Function Length**: Algumas funções >200 linhas
- **File Length**: Alguns arquivos >1000 linhas
- **Nesting Depth**: Até 6 níveis em alguns componentes

---

## 🎯 TARGETS PÓS-CONSOLIDAÇÃO

| Métrica        | Atual | Meta   | Diferença |
| -------------- | ----- | ------ | --------- |
| Bundle Size    | 3.1MB | <500KB | -84%      |
| First Load JS  | 222KB | <150KB | -32%      |
| Chat Adapters  | 6     | 2      | -67%      |
| Test Coverage  | 0%    | 70%    | +70%      |
| Type Coverage  | ~60%  | 100%   | +40%      |
| Build Time     | 45s   | <120s  | OK        |
| Dependencies   | 78    | <50    | -36%      |
| Manual Scripts | 55    | 0      | -100%     |

---

## 📝 NOTAS CRÍTICAS

### Problemas Mais Urgentes

1. **Zero testes automatizados** - Risco extremo de regressões
2. **6 chat adapters** - Complexidade desnecessária e impossível de manter
3. **Bundle size 3.1MB** - Performance ruim para usuários
4. **skipLibCheck: true** - Escondendo erros de tipo
5. **55 scripts manuais** - Processo de teste não escalável

### Quick Wins Identificados

1. Remover imports desnecessários de d3/recharts
2. Lazy load componentes pesados (PDF, Charts)
3. Consolidar chat adapters em 2
4. Configurar Vitest (já tem dependência)
5. Ativar strict mode no TypeScript

---

## 📊 COMANDOS PARA MONITORAMENTO

```bash
# Bundle Analysis
npm run build 2>&1 | grep "First Load"

# Dependency Count
npm list --depth=0 | wc -l

# Code Complexity (instalar primeiro)
npx code-complexity lib --limit 10

# Type Coverage (instalar primeiro)
npx type-coverage

# Find Large Files
find lib -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -rn | head -20

# Find Duplicates
npx jscpd lib --min-lines 10 --min-tokens 50
```

---

**Status**: BASELINE COLETADO ✅
**Próximo Passo**: Iniciar Fase 1 - Fundação
