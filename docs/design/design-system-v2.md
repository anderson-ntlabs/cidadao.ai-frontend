# Design System v2 - Cidadão.AI

---

**Documento**: Design System v2
**Projeto**: Cidadão.AI - Frontend
**Autor**: Anderson Henrique da Silva
**Data**: 2025-09-21 15:21:02 -03 (Horário de Brasília)
**Localização**: Minas Gerais, Brasil
**Categoria**: Design Guide / Design System
**Última Atualização**: 2025-10-04

---

## 📚 Introdução

O Design System v2 do Cidadão.AI foi criado para padronizar a interface da plataforma, garantindo consistência visual e melhor experiência do usuário. Este documento serve como guia de referência para desenvolvedores.

## 🎨 Tokens de Design

### Cores

O sistema de cores foi simplificado de 35 para 12 cores principais:

```css
/* Cores da Marca */
--cidadao-green-600: #16a34a;  /* Principal */
--cidadao-blue-600: #2563eb;   /* Secundária */
--cidadao-yellow-600: #ca8a04; /* Destaque */

/* Cores Semânticas */
--color-primary: var(--cidadao-green-600);
--color-secondary: var(--cidadao-blue-600);
--color-accent: var(--cidadao-yellow-600);
--color-danger: var(--cidadao-red-600);
--color-success: var(--cidadao-green-600);
--color-warning: var(--cidadao-yellow-600);
```

### Espaçamento

Sistema baseado em unidade de 4px:

```css
--space-1: 4px;   /* Mínimo */
--space-2: 8px;   /* Pequeno */
--space-3: 12px;  /* Compact */
--space-4: 16px;  /* Padrão */
--space-6: 24px;  /* Médio */
--space-8: 32px;  /* Grande */
--space-12: 48px; /* Extra grande */
```

### Tipografia

```css
/* Tamanhos */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem;  /* 36px */
```

## 🧩 Componentes

### Button v2

O componente Button foi o primeiro a ser migrado para o novo design system.

#### Variantes

```tsx
// Primary - CTA principal com gradiente
<Button variant="primary">Ação Principal</Button>

// Secondary - Ação secundária com borda
<Button variant="secondary">Ação Secundária</Button>

// Ghost - Ação terciária sem borda
<Button variant="ghost">Ação Sutil</Button>

// Destructive - Ações perigosas
<Button variant="destructive">Deletar</Button>

// Success - Ações positivas
<Button variant="success">Confirmar</Button>

// Warning - Ações de alerta
<Button variant="warning">Atenção</Button>
```

#### Tamanhos

```tsx
<Button size="sm">Pequeno</Button>
<Button size="md">Médio (padrão)</Button>
<Button size="lg">Grande</Button>
<Button size="xl">Extra Grande</Button>
<Button size="icon"><Heart /></Button>
```

#### Estados

```tsx
// Carregando
<Button loading>Processando...</Button>

// Desabilitado
<Button disabled>Indisponível</Button>

// Com ícones
<Button leftIcon={<Search />}>Pesquisar</Button>
<Button rightIcon={<ChevronRight />}>Próximo</Button>
```

### Card v2

O componente Card oferece múltiplas variantes para diferentes contextos.

#### Variantes

```tsx
// Elevated - Padrão com sombra
<Card variant="elevated">Conteúdo</Card>

// Outlined - Com borda
<Card variant="outlined">Conteúdo</Card>

// Ghost - Sem fundo
<Card variant="ghost">Conteúdo</Card>

// Filled - Com fundo cinza
<Card variant="filled">Conteúdo</Card>
```

#### Composição

```tsx
<Card>
  <CardHeader>
    <CardBadge variant="success">Ativo</CardBadge>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição opcional</CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo principal do card
  </CardContent>
  <CardFooter>
    <span>Info</span>
    <Button size="sm">Ação</Button>
  </CardFooter>
</Card>
```

#### Card de Estatísticas

```tsx
<CardStat
  title="Investigações"
  value="1,234"
  description="Total este mês"
  trend={{ value: 12, isPositive: true }}
  icon={<FileText />}
/>
```

## 🚀 Como Usar

### 1. Ativar o Design System v2

Configure a variável de ambiente:

```bash
# .env.local
NEXT_PUBLIC_USE_NEW_DESIGN=true
```

Ou ao executar:

```bash
NEXT_PUBLIC_USE_NEW_DESIGN=true npm run dev
```

### 2. Usar os Tokens

```tsx
// Em componentes React
<div className="p-card bg-brand-green-600 text-white">
  Conteúdo
</div>

// Em CSS
.custom-element {
  padding: var(--space-4);
  color: var(--color-primary);
}
```

### 3. Utilities Customizadas

```tsx
// Padding de componentes
<div className="p-button">Botão</div>
<div className="p-card">Card</div>

// Sombras
<div className="shadow-card hover:shadow-card-hover">
  Card com sombra
</div>

// Tipografia
<h1 className="text-heading-1">Título</h1>
<p className="text-body">Parágrafo</p>

// Gradientes
<div className="bg-gradient-brand">
  Gradiente da marca
</div>
```

## 🧪 Testes

### Executar Testes com Playwright

```bash
# Instalar Playwright (primeira vez)
npm install -D @playwright/test
npx playwright install

# Executar testes
npx playwright test

# Modo interativo
npx playwright test --ui

# Apenas testes do design system
npx playwright test tests/e2e/design-system/
```

### Estrutura de Testes

```
tests/
└── e2e/
    └── design-system/
        ├── button-v2.spec.ts
        ├── card-v2.spec.ts (próximo)
        └── navigation-v2.spec.ts (próximo)
```

## 📊 Métricas de Sucesso

- ✅ Redução de cores: 35 → 12 (65% menos)
- ✅ Contraste WCAG AA garantido
- ✅ Touch targets mínimos de 44px no mobile
- ✅ Performance: 0 impacto no bundle size
- ✅ Backward compatibility mantida

## 🔄 Status da Migração

### Componentes Migrados
- [x] Button
- [x] Card
- [ ] Navigation (próximo)
- [ ] Breadcrumbs
- [ ] Input
- [ ] Modal
- [ ] Toast

### Páginas Migradas
- [ ] Home (pós-login)
- [ ] Dashboard
- [ ] Chat
- [ ] Investigações

## 🛠️ Ferramentas de Desenvolvimento

### Storybook

```bash
npm run storybook
```

Acesse: http://localhost:6006

### Visual Testing

Use o Playwright para capturar screenshots:

```typescript
await expect(page).toHaveScreenshot('button-variants.png');
```

## 📝 Convenções

### Nomenclatura de Classes

- Prefixo `p-` para padding utilities
- Prefixo `text-` para tipografia
- Prefixo `bg-` para backgrounds
- Prefixo `shadow-` para sombras

### Estrutura de Arquivos

```
styles/
├── design-system/
│   ├── tokens/
│   │   ├── colors.css
│   │   ├── spacing.css
│   │   ├── typography.css
│   │   └── index.css
│   ├── components/
│   │   └── (component styles)
│   └── utilities.css
```

### Commits

Seguir o padrão semântico:

```bash
feat: add new component to design system
fix: correct color contrast issue
refactor: simplify button variants
docs: update design system documentation
```

## 🤝 Contribuindo

1. Sempre testar em light e dark mode
2. Verificar acessibilidade (WCAG AA)
3. Testar em mobile (min 320px)
4. Documentar no Storybook
5. Adicionar testes E2E

## 📚 Recursos

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [CVA (Class Variance Authority)](https://cva.style/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Playwright Docs](https://playwright.dev/docs/intro)

## 🚨 Troubleshooting

### Feature flag não funciona
```bash
# Verificar se está definida
echo $NEXT_PUBLIC_USE_NEW_DESIGN

# Limpar cache
rm -rf .next
npm run dev
```

### Cores não aparecem
- Verificar se `globals.css` importa os tokens
- Verificar se está usando as classes corretas (ex: `bg-brand-green-600`)

### Testes falhando
- Verificar se o servidor está rodando na porta 3000
- Executar `npx playwright install` para instalar browsers

---

*Última atualização: Sprint 1 - Dia 5*