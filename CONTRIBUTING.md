# 🤝 Guia de Contribuição - Cidadão.AI Frontend

Obrigado por considerar contribuir com o Cidadão.AI! Este documento fornece diretrizes e instruções para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)
- [Pull Requests](#pull-requests)
- [Padrões de Código](#padrões-de-código)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Testes](#testes)

## 📜 Código de Conduta

Este projeto adota um código de conduta para garantir um ambiente acolhedor e inclusivo. Por favor:

- Use linguagem acolhedora e inclusiva
- Respeite pontos de vista e experiências diferentes
- Aceite críticas construtivas com graça
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros da comunidade

## 🎯 Como Contribuir

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub, então:
git clone https://github.com/SEU_USUARIO/cidadao.ai-frontend.git
cd cidadao.ai-frontend
git remote add upstream https://github.com/anderson-ufrj/cidadao.ai-frontend.git
```

### 2. Crie uma Branch

```bash
# Sempre crie branches a partir da main atualizada
git checkout main
git pull upstream main
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

### 3. Convenções de Nomenclatura

- **Features**: `feature/nome-descritivo`
- **Bugs**: `fix/nome-do-bug`
- **Documentação**: `docs/nome-do-doc`
- **Refatoração**: `refactor/nome-da-refatoracao`

## 🐛 Reportando Bugs

Antes de reportar um bug:

1. **Verifique issues existentes** para evitar duplicatas
2. **Teste na versão mais recente** do projeto
3. **Colete informações** sobre o ambiente

### Template de Bug Report

```markdown
## Descrição
Breve descrição do bug

## Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

## Comportamento Esperado
O que deveria acontecer

## Comportamento Atual
O que está acontecendo

## Screenshots
Se aplicável, adicione screenshots

## Ambiente
- OS: [ex: macOS 13.0]
- Browser: [ex: Chrome 120]
- Node: [ex: 18.17.0]
```

## 💡 Sugerindo Melhorias

### Template de Feature Request

```markdown
## Problema
Descreva o problema que esta feature resolve

## Solução Proposta
Descreva como você imagina a solução

## Alternativas
Outras formas de resolver o problema

## Contexto Adicional
Qualquer contexto relevante
```

## 🔀 Pull Requests

### Checklist antes do PR

- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Lint passa sem erros (`npm run lint`)
- [ ] Build passa sem erros (`npm run build`)
- [ ] Commits seguem o padrão

### Template de PR

```markdown
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Passo 1
2. Passo 2
3. Passo 3

## Checklist
- [ ] Meu código segue os padrões do projeto
- [ ] Revisei meu próprio código
- [ ] Comentei partes complexas
- [ ] Atualizei a documentação
- [ ] Minhas mudanças não geram warnings
- [ ] Adicionei testes
- [ ] Todos os testes passam
```

## 💻 Padrões de Código

### TypeScript/JavaScript

```typescript
// ✅ Bom: Nomes descritivos e tipos explícitos
interface UserData {
  id: string
  name: string
  email: string
}

const getUserById = async (id: string): Promise<UserData> => {
  // implementação
}

// ❌ Evite: Nomes genéricos e any
const getData = async (x: any) => {
  // implementação
}
```

### Componentes React

```tsx
// ✅ Bom: Componente bem tipado e documentado
interface ButtonProps {
  /** Texto do botão */
  label: string
  /** Callback de clique */
  onClick: () => void
  /** Variante visual */
  variant?: 'primary' | 'secondary'
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg font-medium',
        variant === 'primary' && 'bg-green-600 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800'
      )}
    >
      {label}
    </button>
  )
}
```

### CSS/Tailwind

```tsx
// ✅ Bom: Classes organizadas e legíveis
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">

// ❌ Evite: Classes desorganizadas
<div className="p-4 flex bg-white shadow-sm items-center dark:bg-gray-800 rounded-lg justify-between">
```

### Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# ✅ Bons exemplos
feat: add user authentication flow
fix: resolve navigation menu overlap on mobile
docs: update README with new installation steps
refactor: simplify dashboard data fetching logic
test: add unit tests for toast component
style: format code with prettier
chore: update dependencies

# ❌ Evite
Fixed stuff
WIP
Update files
```

## 🔧 Configuração do Ambiente

### Requisitos

- Node.js 18+
- npm 9+
- Git

### Setup Inicial

```bash
# Instalar dependências
npm install

# Configurar git hooks (opcional)
npm run prepare

# Verificar instalação
npm run dev
```

### Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
# API Backend (opcional - tem fallback)
NEXT_PUBLIC_API_URL=https://neural-thinker-cidadao-ai-backend.hf.space

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 🧪 Testes

### Executando Testes

```bash
# Testes unitários
npm run test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

### Escrevendo Testes

```tsx
// Exemplo de teste para componente
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/button'

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button label="Click me" onClick={handleClick} />)
    screen.getByText('Click me').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## 📚 Recursos Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 🎉 Reconhecimento

Todos os contribuidores serão reconhecidos no README do projeto. Obrigado por ajudar a tornar o Cidadão.AI melhor!

---

<div align="center">
  <p>Dúvidas? Abra uma <a href="https://github.com/anderson-ufrj/cidadao.ai-frontend/issues">issue</a></p>
  <p>Feito com ❤️ pela comunidade</p>
</div>