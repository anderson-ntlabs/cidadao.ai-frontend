# Scripts de Teste e Utilitários - Cidadão.AI Frontend

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Última Atualização**: 2025-01-30

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Scripts de Teste](#scripts-de-teste)
  - [Backend Integration](#backend-integration)
  - [Chat & API](#chat--api)
  - [Acessibilidade](#acessibilidade)
  - [Analytics & Monitoring](#analytics--monitoring)
- [Scripts de Build & Deploy](#scripts-de-build--deploy)
- [Scripts de Análise](#scripts-de-análise)
- [Utilitários](#utilitários)
- [Como Usar](#como-usar)

---

## 🎯 Visão Geral

Este diretório contém **40+ scripts** para teste manual, análise e automação do frontend Cidadão.AI. Estes scripts complementam os testes automatizados (Vitest, Playwright) e são usados para:

- ✅ **Validação de Integração**: Testar conectividade com backend Railway
- 🔍 **Debugging**: Diagnosticar problemas de produção
- 📊 **Análise**: UX, bundle, segurança, performance
- 🛠️ **Automação**: Geração de código, migration tools

**Convenções**:
- `test-*.js` - Scripts de teste manual
- `check-*.js` - Validação de status/configuração
- `analyze-*.js` - Análise de código/UX/bundle
- `generate-*.js` - Geração de código/assets
- `monitor-*.js` - Monitoramento contínuo
- `diagnose-*.js` - Ferramentas de diagnóstico

---

## 🧪 Scripts de Teste

### Backend Integration

#### `test-backend-comprehensive.js` ⭐ **PRINCIPAL**
**Propósito**: Teste completo de todos os endpoints do backend Railway

**Uso**:
```bash
node scripts/test-backend-comprehensive.js
```

**Testa**:
- ✅ Health check (`/health`)
- ✅ Chat endpoints (`/api/v1/chat/message`, `/api/v1/chat/stream`)
- ✅ Agent endpoints (`/api/v1/agents`)
- ✅ Transparency API (`/api/v1/transparency/*`)
- ✅ Authentication flow

**Output**: Relatório detalhado de status, response times, e erros

---

#### `test-backend-endpoints.js`
**Propósito**: Teste rápido dos endpoints críticos

**Uso**:
```bash
node scripts/test-backend-endpoints.js
```

**Testa**: Subset dos endpoints principais para validação rápida

---

#### `check-backend-status.js`
**Propósito**: Verifica se backend Railway está online

**Uso**:
```bash
node scripts/check-backend-status.js
```

**Output**: Status (UP/DOWN), versão da API, response time

---

#### `debug-backend.js` / `debug-backend-response.js`
**Propósito**: Debugging detalhado de respostas do backend

**Uso**:
```bash
node scripts/debug-backend.js
node scripts/debug-backend-response.js
```

**Features**:
- Request/response headers
- Body inspection
- Network timing breakdown

---

### Chat & API

#### `test-maritaca.js` ⭐
**Propósito**: Testa integração com Maritaca AI (modelo alternativo ao backend)

**Uso**:
```bash
node scripts/test-maritaca.js
```

**Testa**:
- Maritaca API connectivity
- Response quality
- Error handling

---

#### `test-integration-complete.js`
**Propósito**: Teste end-to-end de integração chat completa

**Uso**:
```bash
node scripts/test-integration-complete.js
```

**Testa**:
- Chat adapters (backend, SSE, fallback)
- Caching layer
- Session management
- Error recovery

---

#### `test-simple-messages.js` / `test-simple-endpoint.js`
**Propósito**: Testes básicos de mensagens e endpoints

**Uso**:
```bash
node scripts/test-simple-messages.js
node scripts/test-simple-endpoint.js
```

**Uso**: Debugging rápido de problemas de chat

---

### Acessibilidade

#### `test-vlibras.js` ⭐
**Propósito**: Testa integração VLibras (LIBRAS - Brazilian Sign Language)

**Uso**:
```bash
node scripts/test-vlibras.js
```

**Testa**:
- Widget loading
- Avatar selection (Guga, Ícaro, Hozana)
- PT-only loading logic
- User preference persistence
- CSP compatibility

**Documentação**: `docs/accessibility-vlibras.md`

---

#### `diagnose-vlibras.js` 🔍
**Propósito**: Ferramenta de diagnóstico completa para VLibras

**Uso**:
```bash
node scripts/diagnose-vlibras.js
```

**Output**:
- Checklist de configuração
- CSP validation
- Network requests
- Console errors
- Troubleshooting steps

**Documentação**: `scripts/README-VLIBRAS-DIAGNOSTIC.md`

---

#### `check-wcag-contrast.js`
**Propósito**: Valida contraste de cores WCAG 2.1 AAA

**Uso**:
```bash
node scripts/check-wcag-contrast.js
```

**Output**: Relatório de contraste (minimum 7:1 ratio para AAA)

---

### Analytics & Monitoring

#### `test-posthog.js` ⭐
**Propósito**: Testa integração PostHog analytics

**Uso**:
```bash
node scripts/test-posthog.js
```

**Testa**:
- Event tracking
- User identification
- Feature flags
- Session replay

---

#### `test-posthog-env.js`
**Propósito**: Valida variáveis de ambiente PostHog

**Uso**:
```bash
node scripts/test-posthog-env.js
```

---

#### `test-unified-consent.js`
**Propósito**: Testa sistema de consent para cookies/analytics

**Uso**:
```bash
node scripts/test-unified-consent.js
```

**Testa**:
- Cookie consent banner
- Opt-in/opt-out persistence
- LGPD compliance

---

#### `test-sentry.js`
**Propósito**: Testa integração Sentry error tracking

**Uso**:
```bash
node scripts/test-sentry.js
```

**Testa**:
- Error reporting
- Breadcrumbs
- User context
- Environment tagging

---

#### `monitor-*.js` (vários)
**Propósito**: Monitoramento contínuo de endpoints

**Scripts**:
- `monitor-drummond.js` - Monitora agent Drummond
- `monitor-new-endpoints.js` - Monitora novos endpoints

**Uso**:
```bash
node scripts/monitor-drummond.js
# Ctrl+C para parar
```

**Output**: Real-time latency, error rate, uptime

---

### Features & Components

#### `test-tour.js`
**Propósito**: Testa sistema de tour interativo (Driver.js)

**Uso**:
```bash
node scripts/test-tour.js
```

**Testa**:
- Tour steps progression
- User interaction
- Persistence

---

#### `test-transparency-map.js`
**Propósito**: Testa mapa de transparência

**Uso**:
```bash
node scripts/test-transparency-map.js
```

**Testa**:
- Geographic visualization
- Data loading
- Fallback handling

---

#### `test-feature-flag.js`
**Propósito**: Testa sistema de feature flags

**Uso**:
```bash
node scripts/test-feature-flag.js
```

---

## 🔧 Scripts de Build & Deploy

### `generate-api-types.js` 🏗️
**Propósito**: Gera TypeScript types a partir do backend OpenAPI spec

**Uso**:
```bash
npm run generate:types
# ou
node scripts/generate-api-types.js
```

**Output**: `types/generated/api.ts`

**Status**: ⚠️ Requer backend OpenAPI spec endpoint

---

### `generate-component.js` 🏗️
**Propósito**: Scaffolding de novos componentes React

**Uso**:
```bash
npm run generate:component
# ou
node scripts/generate-component.js ComponentName
```

**Cria**:
- `components/ComponentName/index.tsx`
- `components/ComponentName/ComponentName.test.tsx`
- `components/ComponentName/ComponentName.stories.tsx`
- `components/ComponentName/ComponentName.module.css`

---

### `generate-icons.js` / `generate-splash.js`
**Propósito**: Gera ícones PWA e splash screens

**Uso**:
```bash
node scripts/generate-icons.js
node scripts/generate-splash.js
```

**Output**: `public/icons/*`, `public/splash/*`

---

## 📊 Scripts de Análise

### `analyze-bundle.js` 📦
**Propósito**: Analisa bundle size e otimizações

**Uso**:
```bash
npm run analyze
# ou
ANALYZE=true npm run build
```

**Output**:
- Bundle analyzer visual report
- Chunk size breakdown
- Optimization opportunities

---

### `analyze-ux-design.js` 🎨
**Propósito**: Análise de UX e consistência de design

**Uso**:
```bash
node scripts/analyze-ux-design.js
```

**Output**:
- Color palette usage
- Typography consistency
- Spacing violations
- Component reuse analysis

**Relatório**: `docs/design/ux-analysis/`

---

### `analyze-internal-ux.js` 🎨
**Propósito**: Análise interna de UX (screenshots)

**Uso**:
```bash
node scripts/analyze-internal-ux.js
```

**Output**: `docs/design/ux-analysis/ux-internal-screenshots/`

---

### `security-audit.js` 🔒
**Propósito**: Auditoria de segurança automatizada

**Uso**:
```bash
node scripts/security-audit.js
```

**Verifica**:
- CSP headers
- CORS configuration
- Authentication flows
- XSS vulnerabilities
- Dependency vulnerabilities

**Output**: Relatório de segurança com recomendações

---

## 🛠️ Utilitários

### `migrate-console-logs.js`
**Propósito**: Migra `console.log` para logger estruturado

**Uso**:
```bash
node scripts/migrate-console-logs.js
```

**Transformação**:
```javascript
// Antes
console.log('User logged in:', userId);

// Depois
logger.info('User logged in', { userId });
```

---

### `check-restart.js`
**Propósito**: Verifica se app precisa de restart

**Uso**:
```bash
node scripts/check-restart.js
```

---

### `discover-hf-url.js`
**Propósito**: Descobre URL do backend HuggingFace Spaces

**Uso**:
```bash
node scripts/discover-hf-url.js
```

**Output**: URL atual do backend HF

---

### `test-header-fix.js`
**Propósito**: Testa correção de headers (debugging)

**Uso**:
```bash
node scripts/test-header-fix.js
```

---

### `verify-backend.js`
**Propósito**: Verificação rápida de backend

**Uso**:
```bash
node scripts/verify-backend.js
```

---

## 🚀 Como Usar

### Pré-requisitos

```bash
# Instalar dependências
npm install

# Configurar environment variables
cp .env.example .env.local
# Editar NEXT_PUBLIC_API_URL com backend URL
```

### Workflow Típico

#### 1. **Antes de Iniciar Desenvolvimento**
```bash
# Verificar backend está online
node scripts/check-backend-status.js

# Testar endpoints críticos
node scripts/test-backend-endpoints.js
```

#### 2. **Após Mudanças no Chat**
```bash
# Teste completo de integração
node scripts/test-integration-complete.js

# Teste adaptadores
node scripts/test-backend-comprehensive.js
```

#### 3. **Antes de Enviar PR**
```bash
# Security audit
node scripts/security-audit.js

# WCAG compliance
node scripts/check-wcag-contrast.js

# Bundle analysis
npm run analyze
```

#### 4. **Debugging de Produção**
```bash
# Backend issues
node scripts/debug-backend.js

# VLibras issues
node scripts/diagnose-vlibras.js

# Analytics issues
node scripts/test-posthog.js
```

---

## 📝 Adicionando Novos Scripts

### Template

```javascript
#!/usr/bin/env node

/**
 * test-new-feature.js
 *
 * Purpose: [Describe what this script tests/does]
 * Usage: node scripts/test-new-feature.js
 *
 * Author: Anderson Henrique
 * Date: 2025-01-30
 */

console.log('🧪 Testing New Feature...\n');

async function testNewFeature() {
  try {
    // Test logic here
    console.log('✅ Test passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testNewFeature();
```

### Checklist

- [ ] Adicionar shebang (`#!/usr/bin/env node`)
- [ ] Documentar propósito e usage no header
- [ ] Adicionar ao `scripts/README.md` (este arquivo)
- [ ] Usar emojis para output legível (✅ ❌ ⚠️ 🧪)
- [ ] Handle errors gracefully
- [ ] Exit com código apropriado (0 = success, 1 = failure)

---

## 🔗 Documentação Relacionada

- [Testing Guide](../docs/guides/TESTING.md)
- [Manual Testing Documentation](../docs/manual-testing-scripts.md)
- [Backend Integration Status](../docs/FRONTEND-BACKEND-INTEGRATION-STATUS.md)
- [VLibras Integration](../docs/accessibility-vlibras.md)

---

## 📞 Suporte

**Problemas com scripts?**
1. Verificar variáveis de ambiente (`.env.local`)
2. Verificar backend está online (`check-backend-status.js`)
3. Consultar documentação específica do script
4. Abrir issue no GitHub com log completo

**Contribuindo com novos scripts?**
- Seguir template acima
- Adicionar documentação neste README
- Adicionar testes se aplicável
- Seguir convenções de nomenclatura

---

**Última Revisão**: 2025-01-30
**Mantido por**: Frontend Team
**Total de Scripts**: 40+
