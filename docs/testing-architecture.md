# Testing Architecture

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-10-25 14:47:03 -0300
**Última Atualização**: 2025-10-25 14:47:03 -0300

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Testes](#estrutura-de-testes)
3. [Tipos de Testes](#tipos-de-testes)
4. [Padrões e Convenções](#padrões-e-convenções)
5. [Ferramentas e Framework](#ferramentas-e-framework)
6. [Cobertura de Testes](#cobertura-de-testes)
7. [Boas Práticas](#boas-práticas)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O Cidadão.AI Frontend possui uma arquitetura de testes robusta e abrangente, com **943 testes passando** distribuídos em **52 arquivos de teste**, alcançando **91% de cobertura de código**.

### Filosofia de Testes

- **Test-Driven Quality**: Qualidade do código garantida por testes automatizados
- **Fast Feedback**: Testes rápidos para feedback imediato durante desenvolvimento
- **Comprehensive Coverage**: Cobertura de unit, integration e E2E tests
- **Maintainable Tests**: Testes legíveis e fáceis de manter
- **Production Confidence**: 100% dos testes devem passar antes de deploy

---

## 📁 Estrutura de Testes

```
cidadao.ai-frontend/
├── __tests__/              # Testes de integração E2E
│   ├── e2e/               # Testes Playwright
│   └── integration/       # Testes de integração
├── components/            # Testes de componentes
│   └── **/*.test.tsx
├── hooks/                 # Testes de hooks
│   └── **/*.test.ts
├── lib/                   # Testes de utilitários
│   ├── api/*.test.ts
│   ├── services/*.test.ts
│   ├── utils/*.test.ts
│   └── telemetry/*.test.ts
├── store/                 # Testes de stores
│   └── **/*.test.ts
└── vitest.config.mjs      # Configuração Vitest
```

---

## 🧪 Tipos de Testes

### 1. Unit Tests (Vitest)

**Objetivo**: Testar unidades isoladas de código (funções, componentes, hooks)

**Localização**: Arquivo `.test.ts` ou `.test.tsx` ao lado do código fonte

**Exemplos**:
- `lib/utils/retry.test.ts` - Testes de retry utility
- `hooks/use-chat.test.ts` - Testes do hook de chat
- `components/ui/button.test.tsx` - Testes de componente

**Características**:
- ✅ Rápidos (< 1s por suite)
- ✅ Isolados (sem dependências externas)
- ✅ Determinísticos (sempre mesmo resultado)
- ✅ Mocks para dependencies

### 2. Integration Tests (Vitest + Testing Library)

**Objetivo**: Testar integração entre múltiplos componentes/módulos

**Localização**: `__tests__/integration/`

**Exemplos**:
- `__tests__/integration/auth/use-auth.test.tsx` - Fluxo de autenticação
- Integration com Supabase
- Integration com backend API

**Características**:
- ✅ Testam fluxos reais de usuário
- ✅ Múltiplos componentes trabalhando juntos
- ✅ Mocks para APIs externas
- ⚠️ Mais lentos que unit tests

### 3. E2E Tests (Playwright)

**Objetivo**: Testar aplicação completa em ambiente real de navegador

**Localização**: `__tests__/e2e/` e `e2e/`

**Exemplos**:
- Login flow completo
- Chat interaction
- Navigation tests

**Características**:
- ✅ Testa experiência real do usuário
- ✅ Cross-browser testing
- ✅ Visual regression testing
- ⚠️ Mais lentos (segundos por teste)
- ⚠️ Mais frágeis (podem quebrar por mudanças de UI)

### 4. Component Tests (Storybook)

**Objetivo**: Desenvolvimento e documentação visual de componentes

**Localização**: `stories/*.stories.tsx`

**Características**:
- ✅ Isolamento visual de componentes
- ✅ Documentação interativa
- ✅ Testes de acessibilidade
- ✅ Design system consistency

---

## 📐 Padrões e Convenções

### Naming Conventions

```typescript
// ✅ BOM - Descritivo e claro
describe('useChat', () => {
  it('should send message to unified chat endpoint', async () => {
    // test implementation
  })
})

// ❌ RUIM - Vago e genérico
describe('hook', () => {
  it('works', () => {
    // test implementation
  })
})
```

### Estrutura de Testes

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// 1. Imports
// 2. Mocks
vi.mock('@/lib/api/client')

describe('ComponentName or FunctionName', () => {
  // 3. Setup
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 4. Tests agrupados por funcionalidade
  describe('featureName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test'

      // Act
      const result = functionUnderTest(input)

      // Assert
      expect(result).toBe('expected')
    })
  })
})
```

### Mock Patterns

#### Mock de Fetch API

```typescript
const mockFetch = vi.fn()
global.fetch = mockFetch as any

mockFetch.mockResolvedValue({
  ok: true,
  headers: new Headers({ 'content-type': 'application/json' }),
  json: async () => ({ message: 'Success' }),
})
```

#### Mock de Módulos

```typescript
vi.mock('@/lib/api/client', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn()
  }
}))
```

#### Mock de Hooks

```typescript
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user' },
    isAuthenticated: true
  })
}))
```

### Async Testing

```typescript
// ✅ BOM - Usando act() para React hooks
await act(async () => {
  result.current.sendMessage({ message: 'test' })
})

// ✅ BOM - Usando waitFor para mudanças assíncronas
await waitFor(() => {
  expect(result.current.isLoading).toBe(false)
})

// ❌ RUIM - Sem act() pode causar warnings
result.current.sendMessage({ message: 'test' })
```

---

## 🛠️ Ferramentas e Framework

### Vitest

Framework principal de testes, escolhido por:
- ⚡ Performance superior (Vite-powered)
- 🔄 Hot Module Replacement (HMR)
- 📊 Coverage nativa com v8
- 🎯 API compatível com Jest
- 🔍 Source maps nativos

**Configuração**: `vitest.config.mjs`

### Testing Library

Biblioteca para testar React components:
- `@testing-library/react` - Render e queries
- `@testing-library/user-event` - Simulação de eventos
- `@testing-library/jest-dom` - Matchers customizados

**Filosofia**: Testar como usuário usa, não detalhes de implementação

### Playwright

Framework E2E para testes de navegador:
- 🌐 Multi-browser (Chrome, Firefox, Safari)
- 📱 Mobile emulation
- 📸 Screenshots e videos
- 🎭 Trace viewer

**Configuração**: `playwright.config.ts`

---

## 📊 Cobertura de Testes

### Métricas Atuais (2025-10-25)

```
Test Files:  52 passed (53 total)
Tests:       943 passed | 46 skipped (989 total)
Coverage:    91%
Duration:    ~9.4s
```

### Coverage por Categoria

| Categoria | Coverage | Status |
|-----------|----------|--------|
| Components | ~85% | ✅ Good |
| Hooks | ~95% | ✅ Excellent |
| Utils | ~90% | ✅ Good |
| Services | ~75% | ⚠️ Needs improvement |
| API | ~85% | ✅ Good |
| Stores | ~80% | ✅ Good |

### Meta de Coverage

- **Mínimo Aceitável**: 80%
- **Target**: 95%
- **Ideal**: 100% (funções críticas)

**Arquivos com Prioridade de Coverage**:
1. `lib/services/*.ts` - Business logic crítica
2. `lib/api/*.ts` - Integração com backend
3. `hooks/*.ts` - Lógica de estado compartilhada

---

## ✅ Boas Práticas

### DO ✅

1. **Teste comportamento, não implementação**
   ```typescript
   // ✅ BOM
   expect(button).toHaveTextContent('Submit')

   // ❌ RUIM
   expect(component.state.buttonText).toBe('Submit')
   ```

2. **Use queries acessíveis**
   ```typescript
   // ✅ BOM - Usa role acessível
   const button = screen.getByRole('button', { name: 'Submit' })

   // ❌ RUIM - Usa className
   const button = container.querySelector('.submit-btn')
   ```

3. **Mocks mínimos e focados**
   ```typescript
   // ✅ BOM - Mock apenas o necessário
   vi.mock('@/lib/api/client', () => ({
     api: { post: vi.fn() }
   }))

   // ❌ RUIM - Mock genérico demais
   vi.mock('@/lib/api/client')
   ```

4. **Cleanup entre testes**
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks()
   })

   afterEach(() => {
     vi.restoreAllMocks()
   })
   ```

5. **Assertions significativas**
   ```typescript
   // ✅ BOM
   expect(response).toMatchObject({
     message: 'Success',
     status: 200
   })

   // ❌ RUIM - Muito vago
   expect(response).toBeTruthy()
   ```

### DON'T ❌

1. **Não teste detalhes de implementação**
2. **Não use timeouts arbitrários** (`setTimeout(1000)`)
3. **Não ignore warnings de `act()`**
4. **Não faça testes dependentes** (ordem importa)
5. **Não commite testes quebrados**

---

## 🔧 Troubleshooting

### Problema: "act() warning"

**Sintoma**: Warning sobre updates não wrapped em act()

**Solução**:
```typescript
// Wrap async operations
await act(async () => {
  await result.current.asyncFunction()
})
```

### Problema: Unhandled Promise Rejection

**Sintoma**: Testes passam mas warnings de promises não tratadas

**Solução**:
```typescript
// Attach catch handler imediatamente
const promise = asyncFunction()
promise.catch(() => {}) // Previne unhandled rejection

await expect(promise).rejects.toThrow()
```

### Problema: "Cannot read properties of null"

**Sintoma**: `result.current` é null

**Solução**:
```typescript
// Use optional chaining
expect(result.current?.isLoading).toBe(false)

// Ou verifique se renderizou
expect(result.current).toBeDefined()
```

### Problema: Testes falham aleatoriamente

**Sintoma**: Tests passam/falham sem mudanças de código

**Causas Comuns**:
1. Race conditions em async code
2. Shared state entre testes
3. Timeouts muito curtos
4. Mocks não resetados

**Solução**:
```typescript
// Reset state entre testes
beforeEach(() => {
  vi.clearAllMocks()
  vi.clearAllTimers()
})

// Use waitFor para async
await waitFor(() => {
  expect(element).toBeInTheDocument()
}, { timeout: 3000 })
```

---

## 📚 Recursos e Referências

### Documentação Oficial

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)

### Guias Internos

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guia de contribuição
- [README.md](../README.md) - Visão geral do projeto

### Exemplos de Testes

- `hooks/use-chat.test.ts` - Exemplo de teste de hook
- `lib/utils/retry.test.ts` - Exemplo de teste de utilidade
- `components/ui/button.test.tsx` - Exemplo de teste de componente

---

## 📝 Changelog

### 2025-10-25 - Major Test Stabilization

**Fixes**:
- ✅ Resolved unhandled promise rejections in retry tests
- ✅ Fixed React hooks dependency warnings in a11y components
- ✅ Updated database field references (session_id vs id)
- ✅ Fixed authentication redirect paths
- ✅ Complete rewrite of use-chat tests for unified endpoint
- ✅ Updated adapter tests for current response structure

**Impact**:
- 23 failing tests → 0 failing tests
- 943 tests passing
- 91% coverage maintained
- Zero ESLint warnings
- Zero TypeScript errors

---

**Última revisão**: 2025-10-25 por Anderson Henrique da Silva
