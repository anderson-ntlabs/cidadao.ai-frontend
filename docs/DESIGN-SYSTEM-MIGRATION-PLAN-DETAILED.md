# Plano Detalhado de Migração do Design System - Cidadão.AI

**Trabalho de Domingo - 21/09/2025**  
**Autor: Anderson Henrique da Silva**

## 📋 Sumário Executivo

Este documento detalha o plano completo de migração do design system do Cidadão.AI, com sprints, entregáveis e estratégias de commit para garantir uma transição suave e sem quebras no sistema atual.

---

## 🎯 Sprint 1: Fundação do Design System (5 dias)

### Dia 1: Setup e Tokens Base

#### Tarefas:
1. **Criar estrutura de pastas**
   ```
   styles/
   ├── design-system/
   │   ├── tokens/
   │   │   ├── colors.css
   │   │   ├── spacing.css
   │   │   ├── typography.css
   │   │   └── index.css
   │   └── components/
   ```

2. **Implementar tokens de cores**
   ```css
   /* styles/design-system/tokens/colors.css */
   :root {
     /* Brand Colors - Extraídas da index */
     --cidadao-green-600: #16a34a;
     --cidadao-green-500: #22c55e;
     --cidadao-green-700: #15803d;
     
     --cidadao-blue-600: #2563eb;
     --cidadao-blue-500: #3b82f6;
     --cidadao-blue-700: #1d4ed8;
     
     --cidadao-yellow-500: #eab308;
     --cidadao-yellow-600: #ca8a04;
     
     /* Semantic Tokens */
     --color-primary: var(--cidadao-green-600);
     --color-primary-hover: var(--cidadao-green-700);
     --color-primary-light: var(--cidadao-green-500);
     
     --color-secondary: var(--cidadao-blue-600);
     --color-secondary-hover: var(--cidadao-blue-700);
     --color-secondary-light: var(--cidadao-blue-500);
   }
   ```

#### Commits:
```bash
git add styles/design-system/
git commit -m "feat: add design system folder structure

- Create tokens directory for design variables
- Add base structure for component styles
- Prepare for incremental migration"

git add styles/design-system/tokens/colors.css
git commit -m "feat: implement color tokens based on brand identity

- Extract colors from index page
- Create semantic color mappings
- Add hover and light variants"
```

### Dia 2: Sistema de Espaçamento e Tipografia

#### Tarefas:
1. **Criar tokens de espaçamento**
   ```css
   /* styles/design-system/tokens/spacing.css */
   :root {
     /* Base unit: 4px */
     --space-0: 0;
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
     
     /* Component specific */
     --button-padding-x: var(--space-6);
     --button-padding-y: var(--space-3);
     --card-padding: var(--space-6);
     --section-spacing: var(--space-20);
   }
   ```

2. **Configurar tipografia**
   ```css
   /* styles/design-system/tokens/typography.css */
   :root {
     /* Font families */
     --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
     --font-mono: 'Fira Code', monospace;
     
     /* Font sizes */
     --text-xs: 0.75rem;    /* 12px */
     --text-sm: 0.875rem;   /* 14px */
     --text-base: 1rem;     /* 16px */
     --text-lg: 1.125rem;   /* 18px */
     --text-xl: 1.25rem;    /* 20px */
     --text-2xl: 1.5rem;    /* 24px */
     --text-3xl: 1.875rem;  /* 30px */
     --text-4xl: 2.25rem;   /* 36px */
     
     /* Line heights */
     --leading-tight: 1.25;
     --leading-normal: 1.5;
     --leading-relaxed: 1.75;
     
     /* Font weights */
     --font-normal: 400;
     --font-medium: 500;
     --font-semibold: 600;
     --font-bold: 700;
   }
   ```

#### Commits:
```bash
git add styles/design-system/tokens/spacing.css
git commit -m "feat: add spacing system with 4px base unit

- Define 12 spacing values
- Add component-specific spacing tokens
- Create consistent spacing scale"

git add styles/design-system/tokens/typography.css
git commit -m "feat: implement typography tokens

- Define font families and sizes
- Add line height and weight scales
- Maintain consistency with current design"
```

### Dia 3: Tailwind Integration e Utilities

#### Tarefas:
1. **Atualizar tailwind.config.js**
   ```js
   // Adicionar ao extend
   colors: {
     'brand': {
       'green': {
         500: 'var(--cidadao-green-500)',
         600: 'var(--cidadao-green-600)',
         700: 'var(--cidadao-green-700)',
       },
       'blue': {
         500: 'var(--cidadao-blue-500)',
         600: 'var(--cidadao-blue-600)',
         700: 'var(--cidadao-blue-700)',
       }
     }
   }
   ```

2. **Criar utilities customizadas**
   ```css
   /* styles/design-system/utilities.css */
   @layer utilities {
     /* Spacing utilities */
     .p-button { 
       padding: var(--button-padding-y) var(--button-padding-x);
     }
     
     .p-card {
       padding: var(--card-padding);
     }
     
     /* Shadow utilities */
     .shadow-card {
       box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
     }
     
     .shadow-card-hover {
       box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
     }
   }
   ```

#### Commits:
```bash
git add tailwind.config.js
git commit -m "feat: integrate design tokens with Tailwind

- Map CSS variables to Tailwind colors
- Enable design token usage in classes
- Maintain backwards compatibility"

git add styles/design-system/utilities.css
git commit -m "feat: add custom utility classes

- Create component-specific padding utilities
- Add consistent shadow styles
- Reduce repetition in component code"
```

### Dia 4: Componente Button v2

#### Tarefas:
1. **Criar novo componente Button**
   ```tsx
   // components/ui/button-v2.tsx
   import { cn } from '@/lib/utils'
   
   const buttonVariants = {
     primary: 'bg-brand-green-600 hover:bg-brand-green-700 text-white',
     secondary: 'border-2 border-gray-300 hover:border-brand-green-600',
     ghost: 'text-gray-700 hover:text-brand-green-600 hover:bg-gray-50'
   }
   
   const buttonSizes = {
     sm: 'text-sm py-2 px-4',
     md: 'text-base py-3 px-6',
     lg: 'text-lg py-4 px-8'
   }
   
   export function ButtonV2({ 
     variant = 'primary', 
     size = 'md',
     className,
     ...props 
   }) {
     return (
       <button
         className={cn(
           'p-button rounded-lg font-medium transition-all duration-200',
           'focus:outline-none focus:ring-2 focus:ring-brand-green-500',
           buttonVariants[variant],
           buttonSizes[size],
           className
         )}
         {...props}
       />
     )
   }
   ```

2. **Adicionar feature flag**
   ```tsx
   // components/ui/button.tsx
   import { Button as ButtonV1 } from './button-v1'
   import { ButtonV2 } from './button-v2'
   
   export const Button = process.env.NEXT_PUBLIC_USE_NEW_DESIGN === 'true' 
     ? ButtonV2 
     : ButtonV1
   ```

#### Commits:
```bash
git add components/ui/button-v2.tsx
git commit -m "feat: create ButtonV2 component with new design system

- Add primary, secondary, and ghost variants
- Implement size variations (sm, md, lg)
- Use new color and spacing tokens"

git add components/ui/button.tsx
git commit -m "feat: add feature flag for gradual button migration

- Enable A/B testing of new design
- Maintain backwards compatibility
- Allow easy rollback if needed"
```

### Dia 5: Documentação e Testes

#### Tarefas:
1. **Criar stories no Storybook**
   ```tsx
   // stories/ButtonV2.stories.tsx
   export default {
     title: 'Design System v2/Button',
     component: ButtonV2,
   }
   
   export const AllVariants = () => (
     <div className="space-y-4">
       <ButtonV2 variant="primary">Primary Button</ButtonV2>
       <ButtonV2 variant="secondary">Secondary Button</ButtonV2>
       <ButtonV2 variant="ghost">Ghost Button</ButtonV2>
     </div>
   )
   ```

2. **Documentar uso no README**
   ```md
   ## Design System v2
   
   ### Ativando o novo design
   ```bash
   NEXT_PUBLIC_USE_NEW_DESIGN=true npm run dev
   ```
   
   ### Componentes migrados
   - [x] Button
   - [ ] Card
   - [ ] Navigation
   ```

#### Commits:
```bash
git add stories/ButtonV2.stories.tsx
git commit -m "docs: add Storybook stories for ButtonV2

- Document all button variants
- Show size variations
- Include interactive examples"

git add README.md docs/design-system-v2.md
git commit -m "docs: add design system v2 documentation

- Explain feature flag usage
- Track migration progress
- Document design decisions"
```

---

## 🎯 Sprint 2: Componentes Core (5 dias)

### Dia 6-7: Card Component

#### Tarefas:
1. **Criar CardV2**
   ```tsx
   // components/ui/card-v2.tsx
   export function CardV2({ 
     variant = 'elevated',
     className,
     children,
     ...props 
   }) {
     const variants = {
       elevated: 'bg-white shadow-card hover:shadow-card-hover',
       outlined: 'bg-white border border-gray-200'
     }
     
     return (
       <div
         className={cn(
           'p-card rounded-lg transition-all duration-200',
           variants[variant],
           className
         )}
         {...props}
       >
         {children}
       </div>
     )
   }
   ```

#### Commits:
```bash
git add components/ui/card-v2.tsx
git commit -m "feat: create CardV2 with consistent styling

- Add elevated and outlined variants
- Use design system tokens
- Implement hover states"
```

### Dia 8: Navigation Component

#### Tarefas:
1. **Criar NavigationV2 com breadcrumbs**
   ```tsx
   // components/navigation-v2.tsx
   export function NavigationV2({ items, currentPath }) {
     return (
       <nav className="flex items-center space-x-8">
         {items.map((item) => (
           <Link
             key={item.href}
             href={item.href}
             className={cn(
               'flex items-center gap-2 text-sm font-medium',
               'transition-colors duration-200',
               currentPath === item.href
                 ? 'text-brand-green-600'
                 : 'text-gray-700 hover:text-brand-green-600'
             )}
           >
             {item.icon && <span>{item.icon}</span>}
             <span>{item.label}</span>
           </Link>
         ))}
       </nav>
     )
   }
   ```

2. **Implementar Breadcrumbs**
   ```tsx
   // components/breadcrumbs-v2.tsx
   export function BreadcrumbsV2({ items }) {
     return (
       <nav aria-label="Breadcrumb">
         <ol className="flex items-center space-x-2 text-sm">
           {items.map((item, index) => (
             <li key={item.href} className="flex items-center">
               {index > 0 && <ChevronRight className="mx-2" />}
               <Link
                 href={item.href}
                 className={cn(
                   index === items.length - 1
                     ? 'text-gray-900 font-medium'
                     : 'text-gray-600 hover:text-brand-green-600'
                 )}
               >
                 {item.label}
               </Link>
             </li>
           ))}
         </ol>
       </nav>
     )
   }
   ```

#### Commits:
```bash
git add components/navigation-v2.tsx
git commit -m "feat: create NavigationV2 with active states

- Add visual indication for current page
- Include icon support with labels
- Use consistent color scheme"

git add components/breadcrumbs-v2.tsx
git commit -m "feat: implement BreadcrumbsV2 component

- Add proper ARIA labels
- Show clear navigation hierarchy
- Style active/inactive states"
```

### Dia 9-10: Layout Integration

#### Tarefas:
1. **Criar AuthLayoutV2**
   ```tsx
   // components/layouts/auth-layout-v2.tsx
   export function AuthLayoutV2({ children }) {
     return (
       <div className="min-h-screen bg-gray-50">
         <HeaderV2 />
         <div className="max-w-7xl mx-auto px-6 py-6">
           <BreadcrumbsV2 />
           <main className="mt-6">
             {children}
           </main>
         </div>
       </div>
     )
   }
   ```

#### Commits:
```bash
git add components/layouts/auth-layout-v2.tsx
git commit -m "feat: create AuthLayoutV2 with integrated navigation

- Include header and breadcrumbs
- Apply consistent spacing
- Prepare for gradual page migration"
```

---

## 🎯 Sprint 3: Migração de Páginas (5 dias)

### Dia 11-12: Home Page (Pós-login)

#### Tarefas:
1. **Migrar Home para novo design**
   ```tsx
   // app/pt/(authenticated)/home/page.tsx
   // Substituir componentes antigos por V2
   <CardV2 variant="elevated">
     <h3 className="text-lg font-semibold text-gray-900">
       Dashboard de Investigações
     </h3>
     <p className="text-sm text-gray-600 mt-2">
       Acompanhe investigações e análises em tempo real
     </p>
     <ButtonV2 variant="primary" className="mt-4">
       Acessar
     </ButtonV2>
   </CardV2>
   ```

#### Commits:
```bash
git add app/pt/(authenticated)/home/page.tsx
git commit -m "refactor: migrate home page to design system v2

- Replace old cards with CardV2
- Update buttons to ButtonV2
- Apply new spacing system"
```

### Dia 13: Dashboard

#### Tarefas:
1. **Padronizar gráficos e cards**
   ```tsx
   // Usar cores do design system nos gráficos
   const chartColors = {
     primary: 'var(--cidadao-green-600)',
     secondary: 'var(--cidadao-blue-600)',
     accent: 'var(--cidadao-yellow-600)'
   }
   ```

#### Commits:
```bash
git add app/pt/(authenticated)/dashboard/page.tsx
git commit -m "refactor: update dashboard with consistent colors

- Apply design system colors to charts
- Standardize card layouts
- Fix spacing inconsistencies"
```

### Dia 14-15: Chat Interface

#### Tarefas:
1. **Redesenhar interface do chat**
   ```tsx
   // Remover verde forte, usar tons do design system
   const ChatHeaderV2 = () => (
     <div className="bg-white border-b border-gray-200 p-4">
       <div className="flex items-center gap-3">
         <Avatar />
         <div>
           <h2 className="font-semibold text-gray-900">
             {agent.name}
           </h2>
           <p className="text-sm text-gray-600">
             {agent.description}
           </p>
         </div>
       </div>
     </div>
   )
   ```

#### Commits:
```bash
git add app/pt/(authenticated)/chat/page.tsx
git commit -m "refactor: redesign chat interface with brand colors

- Remove aggressive green background
- Apply consistent header style
- Improve message hierarchy"
```

---

## 🎯 Sprint 4: Mobile e Responsividade (5 dias)

### Dia 16-17: Navegação Mobile

#### Tarefas:
1. **Criar menu mobile otimizado**
   ```tsx
   // components/mobile-nav-v2.tsx
   export function MobileNavV2() {
     return (
       <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
         <div className="flex justify-around py-2">
           {mobileItems.map(item => (
             <Link
               key={item.href}
               href={item.href}
               className="flex flex-col items-center p-2 min-w-[64px]"
             >
               <span className="text-2xl">{item.icon}</span>
               <span className="text-xs mt-1">{item.label}</span>
             </Link>
           ))}
         </div>
       </nav>
     )
   }
   ```

#### Commits:
```bash
git add components/mobile-nav-v2.tsx
git commit -m "feat: create optimized mobile navigation

- Use bottom navigation pattern
- Ensure 44px minimum touch targets
- Add clear labels to all icons"
```

### Dia 18: Cards Responsivos

#### Tarefas:
1. **Ajustar grid system**
   ```css
   /* Usar grid responsivo consistente */
   .card-grid {
     display: grid;
     grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
     gap: var(--space-6);
   }
   ```

#### Commits:
```bash
git add styles/design-system/components/grid.css
git commit -m "feat: add responsive grid system

- Create flexible card layouts
- Maintain consistent gaps
- Work well on all screen sizes"
```

### Dia 19-20: Testes e Ajustes Finais

#### Tarefas:
1. **Testar em múltiplos dispositivos**
2. **Verificar contraste WCAG AA**
3. **Otimizar performance**
4. **Remover código antigo (se estável)**

#### Commits:
```bash
git add .
git commit -m "fix: address mobile responsiveness issues

- Fix text size on small screens
- Adjust padding for mobile
- Ensure proper touch targets"

git commit -m "perf: remove unused CSS and optimize bundle

- Remove old component styles
- Reduce CSS bundle size
- Improve loading performance"
```

---

## 🎯 Sprint 5: Polimento e Documentação (5 dias)

### Dia 21-22: Animações e Micro-interações

#### Tarefas:
1. **Padronizar transições**
   ```css
   :root {
     --transition-fast: 150ms ease;
     --transition-base: 200ms ease;
     --transition-slow: 300ms ease;
   }
   ```

#### Commits:
```bash
git add styles/design-system/tokens/animations.css
git commit -m "feat: standardize animation timing

- Define consistent transition durations
- Create reusable animation tokens
- Improve perceived performance"
```

### Dia 23-24: Documentação Final

#### Tarefas:
1. **Atualizar Storybook com todos componentes**
2. **Criar guia de migração**
3. **Documentar decisões de design**

#### Commits:
```bash
git add .storybook/
git commit -m "docs: complete Storybook documentation

- Add all v2 components
- Include usage examples
- Document design decisions"
```

### Dia 25: Deploy e Monitoramento

#### Tarefas:
1. **Remover feature flags**
2. **Deploy para produção**
3. **Monitorar métricas**

#### Commits:
```bash
git commit -m "feat: enable design system v2 by default

- Remove feature flags
- Make v2 the default experience
- Complete migration process"
```

---

## 📊 Métricas de Acompanhamento

### Por Sprint:
- **Sprint 1**: Tokens criados, Button migrado
- **Sprint 2**: 3 componentes core migrados
- **Sprint 3**: 4 páginas principais atualizadas
- **Sprint 4**: 100% mobile responsive
- **Sprint 5**: Documentação completa

### Indicadores de Sucesso:
- ✅ Cores reduzidas de 35 para 12
- ✅ Espaçamentos de 34 para 12
- ✅ Contraste WCAG AA em todos textos
- ✅ Touch targets ≥ 44px no mobile
- ✅ 0 quebras em produção

---

## 🚀 Estratégia de Rollback

### Em caso de problemas:
1. **Reverter feature flag**
   ```bash
   NEXT_PUBLIC_USE_NEW_DESIGN=false
   ```

2. **Git revert se necessário**
   ```bash
   git revert <commit-hash>
   ```

3. **Hotfix branch**
   ```bash
   git checkout -b hotfix/design-system-issue
   ```

---

## 📝 Checklist Final

### Antes de cada commit:
- [ ] Código testado localmente
- [ ] Sem quebras visuais
- [ ] Performance mantida/melhorada
- [ ] Acessibilidade verificada

### Antes do merge:
- [ ] Code review aprovado
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Screenshots comparativos

---

**Data de Início Prevista**: 22/09/2025  
**Data de Conclusão Prevista**: 27/10/2025  
**Responsável**: Anderson Henrique da Silva

---

*"Um design system bem implementado é invisível para o usuário, mas fundamental para o desenvolvedor."*