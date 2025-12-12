# ADR-001: Result Type Pattern para Error Handling

## Status

Aceito

## Data

2025-12-12

## Contexto

O codebase apresentava varios problemas com error handling:

1. **Return null silenciosos**: Funcoes retornavam `null` sem indicar o motivo da falha
2. **Inconsistencia**: Alguns services retornavam `{ error: string }`, outros `null`, outros lançavam exceptions
3. **Type safety fraco**: TypeScript nao conseguia inferir se uma operacao falhou ou nao
4. **Logs insuficientes**: Erros eram swallowed sem logging adequado

Exemplos problematicos encontrados:

```typescript
// Problema 1: Return null silencioso
async function getUser(id: string) {
  try {
    const user = await db.users.findById(id)
    return user // null se nao encontrar
  } catch {
    return null // Erro? Nao encontrado? Impossivel saber
  }
}

// Problema 2: Inconsistencia de tipos
async function createPost(data: PostData) {
  // As vezes retorna { error: string }
  // As vezes retorna { data: Post }
  // As vezes throw Error
}
```

## Decisao

Adotar o **Result Type Pattern** (tambem conhecido como Either monad) para todas as operacoes que podem falhar.

### Implementacao

Criar `lib/types/result.ts` com:

```typescript
type Success<T> = { success: true; data: T }
type Failure = { success: false; error: { code: string; message: string; cause?: unknown } }
type Result<T> = Success<T> | Failure
```

### Factory Functions

```typescript
// Criar resultado de sucesso
success(data) // => { success: true, data }

// Criar resultado de falha
failure(code, message, cause?) // => { success: false, error: { code, message, cause } }
```

### Uso Padrao

```typescript
async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const user = await db.users.findById(id)
    if (!user) {
      return failure('NOT_FOUND', `User ${id} not found`)
    }
    return success(user)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return failure('DB_ERROR', 'Database error', error)
  }
}

// Consumer
const result = await fetchUser('123')
if (result.success) {
  console.log(result.data.name)
} else {
  handleError(result.error)
}
```

## Consequencias

### Positivas

- **Type safety**: TypeScript força verificacao de sucesso/falha
- **Consistencia**: Todas as operacoes seguem o mesmo padrao
- **Debuggabilidade**: Erros sempre tem code, message e opcionalmente cause
- **Composability**: Funcoes utilitarias como `map`, `flatMap`, `combine`
- **No silent failures**: Impossivel ignorar erros acidentalmente

### Negativas

- **Verbosidade**: Mais codigo que `try/catch` tradicional
- **Curva de aprendizado**: Desenvolvedores precisam aprender o padrao
- **Refactoring**: Services existentes precisam ser migrados gradualmente

### Neutras

- Nao muda comportamento em runtime, apenas adiciona type safety
- Compativel com codigo existente (migracao gradual)

## Alternativas Consideradas

### Alternativa 1: Exceptions everywhere

**Descricao**: Usar try/catch em todo lugar

**Pros**:

- Familiar para maioria dos desenvolvedores
- Menos verboso

**Cons**:

- TypeScript nao rastreia quais funcoes podem throw
- Facil esquecer de catch
- Perde informacao de tipo no catch (sempre `unknown`)

**Por que foi rejeitada**: Type safety insuficiente

### Alternativa 2: Biblioteca externa (neverthrow, fp-ts)

**Descricao**: Usar uma biblioteca de Result type existente

**Pros**:

- Mais funcionalidades
- Comunidade e documentacao

**Cons**:

- Dependencia externa
- API mais complexa (especialmente fp-ts)
- Overhead de bundle size

**Por que foi rejeitada**: Nossa implementacao e suficiente e nao adiciona dependencias

## Referencias

- [Rust Result Type](https://doc.rust-lang.org/std/result/)
- [TypeScript Error Handling](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)

## Notas

### Migracao Gradual

A migracao sera feita por modulo:

1. Sprint 2: `lib/services/`
2. Sprint 4: `lib/chat/`
3. Futuros sprints: Demais modulos

### Error Codes Padronizados

Ver `ErrorCodes` em `lib/types/result.ts` para lista de codigos padrao.
