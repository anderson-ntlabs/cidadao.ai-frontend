# Plano de Migração do Design System - Cidadão.AI

## 1. Análise do Estado Atual

### Cores Identificadas na Index
- **Verde Principal**: `green-600` (#16a34a) - Identidade principal
- **Azul Principal**: `blue-600` (#2563eb) - Complementar
- **Amarelo**: `yellow-600` (#ca8a04) - Destaque/Alerta
- **Roxo**: `purple-600` (#9333ea) - Dados infinitos
- **Cinzas**: Múltiplas variações (gray-100 a gray-900)
- **Gradientes**: `from-green-600 via-yellow-500 to-blue-600`

### Problemas Identificados
1. **35 cores únicas** no sistema interno (deveria ter 10-12 max)
2. **8 variações de cinza** diferentes
3. **34 valores de espaçamento** únicos
4. **Falta de tokens de design** centralizados
5. **Componentes inconsistentes** entre páginas
6. **Navegação sem padrão visual** claro

## 2. Design System Proposto

### 2.1 Paleta de Cores (Tokens)

```css
/* Core Brand Colors */
--color-brand-green: #16a34a;      /* green-600 */
--color-brand-blue: #2563eb;       /* blue-600 */
--color-brand-yellow: #ca8a04;     /* yellow-600 */

/* Semantic Colors */
--color-primary: var(--color-brand-green);
--color-secondary: var(--color-brand-blue);
--color-accent: var(--color-brand-yellow);
--color-danger: #dc2626;           /* red-600 */
--color-warning: var(--color-brand-yellow);
--color-success: var(--color-brand-green);
--color-info: var(--color-brand-blue);

/* Neutral Scale (5 tons apenas) */
--color-neutral-50: #f9fafb;       /* gray-50 */
--color-neutral-200: #e5e7eb;      /* gray-200 */
--color-neutral-500: #6b7280;      /* gray-500 */
--color-neutral-700: #374151;      /* gray-700 */
--color-neutral-900: #111827;      /* gray-900 */

/* Surfaces */
--color-surface-primary: #ffffff;
--color-surface-secondary: var(--color-neutral-50);
--color-surface-elevated: #ffffff;
--color-surface-overlay: rgba(0, 0, 0, 0.5);

/* Dark Mode */
--color-surface-primary-dark: #1f2937;
--color-surface-secondary-dark: #111827;
```

### 2.2 Sistema de Espaçamento

```css
/* Base: 4px */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

### 2.3 Componentes Padronizados

#### Botões (3 variantes)
1. **Primary**: Verde gradiente (CTAs principais)
2. **Secondary**: Borda com hover state
3. **Ghost**: Sem borda, apenas texto

#### Cards (2 variantes)
1. **Elevated**: Com sombra suave
2. **Outlined**: Com borda

#### Navegação
- Breadcrumbs obrigatórios
- Active state visual claro
- Labels em todos os ícones

## 3. Plano de Implementação Incremental

### Fase 1: Fundação (Semana 1)
1. **Criar arquivo de tokens** (`styles/design-tokens.css`)
2. **Atualizar Tailwind config** com cores customizadas
3. **Criar componente ThemeProvider** para gerenciar temas
4. **Documentar padrões** no Storybook

### Fase 2: Componentes Base (Semana 2)
1. **Padronizar botões** em todo sistema
2. **Unificar cards** (home, dashboard, chat)
3. **Criar componente Navigation** consistente
4. **Implementar Breadcrumbs** globalmente

### Fase 3: Páginas Principais (Semana 3)
1. **Refatorar Home** pós-login
2. **Padronizar Dashboard**
3. **Unificar interface do Chat**
4. **Ajustar Investigações**

### Fase 4: Responsividade (Semana 4)
1. **Otimizar navegação mobile**
2. **Ajustar cards responsivos**
3. **Melhorar chat mobile**
4. **Testar em múltiplos dispositivos**

## 4. Ordem de Prioridade

### Crítico (Fazer primeiro)
1. Tokens de cor
2. Sistema de espaçamento
3. Navegação e breadcrumbs
4. Contraste de cores (acessibilidade)

### Alto
1. Padronização de botões
2. Unificação de cards
3. Interface do chat
4. Mobile responsiveness

### Médio
1. Animações consistentes
2. Ícones padronizados
3. Tipografia
4. Estados de loading

### Baixo
1. Micro-interações
2. Easter eggs
3. Temas customizados

## 5. Estratégia de Migração

### Princípios
1. **Não quebrar nada** - Mudanças incrementais
2. **Testar cada etapa** - Commits pequenos e frequentes
3. **Documentar mudanças** - Atualizar Storybook
4. **Medir impacto** - Métricas de performance

### Processo por Componente
1. Criar nova versão do componente
2. Adicionar flag para toggle entre versões
3. Testar em ambiente isolado
4. Migrar gradualmente por página
5. Remover versão antiga após estabilização

### Exemplo de Migração (Button)
```tsx
// Fase 1: Criar novo componente
export const ButtonV2 = ({ variant = 'primary', ...props }) => {
  const styles = {
    primary: 'bg-gradient-to-r from-green-600 to-blue-600',
    secondary: 'border-2 border-gray-300',
    ghost: 'text-gray-700'
  }
  return <button className={styles[variant]} {...props} />
}

// Fase 2: Feature flag
const Button = process.env.NEXT_PUBLIC_USE_NEW_DESIGN === 'true' 
  ? ButtonV2 
  : ButtonV1

// Fase 3: Migrar gradualmente
// Fase 4: Remover ButtonV1
```

## 6. Métricas de Sucesso

### Quantitativas
- Reduzir cores únicas de 35 para 12
- Reduzir variações de cinza de 8 para 5
- Reduzir espaçamentos de 34 para 12
- Melhorar contraste para WCAG AA (4.5:1)

### Qualitativas
- Navegação mais clara e intuitiva
- Identidade visual consistente
- Melhor experiência mobile
- Maior velocidade de desenvolvimento

## 7. Riscos e Mitigações

### Riscos
1. Quebrar funcionalidades existentes
2. Usuários confusos com mudanças
3. Performance degradada
4. Conflitos de merge

### Mitigações
1. Testes extensivos antes de deploy
2. Mudanças graduais com comunicação
3. Monitorar métricas de performance
4. Branches de feature bem organizadas

## 8. Timeline Estimado

- **Semana 1**: Fundação e tokens
- **Semana 2**: Componentes base
- **Semana 3**: Páginas principais
- **Semana 4**: Mobile e polimento
- **Semana 5**: Testes e ajustes finais
- **Semana 6**: Deploy e monitoramento

## 9. Checklist de Implementação

### [ ] Fase 1 - Fundação
- [ ] Criar design-tokens.css
- [ ] Atualizar tailwind.config.js
- [ ] Implementar ThemeProvider
- [ ] Documentar no Storybook

### [ ] Fase 2 - Componentes
- [ ] ButtonV2 com 3 variantes
- [ ] CardV2 com 2 variantes
- [ ] NavigationV2 com breadcrumbs
- [ ] Testar todos os componentes

### [ ] Fase 3 - Páginas
- [ ] Migrar Home
- [ ] Migrar Dashboard
- [ ] Migrar Chat
- [ ] Migrar Investigações

### [ ] Fase 4 - Mobile
- [ ] Otimizar menu mobile
- [ ] Ajustar cards responsivos
- [ ] Melhorar chat mobile
- [ ] Testar em dispositivos reais

## 10. Próximos Passos

1. Revisar e aprovar este plano
2. Criar branch `feature/design-system-v2`
3. Começar pela criação dos tokens
4. Implementar um componente por vez
5. Fazer code review a cada PR
6. Manter documentação atualizada

---

**Nota**: Este plano é vivo e deve ser atualizado conforme aprendemos mais durante a implementação.