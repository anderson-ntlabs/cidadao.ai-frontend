# 🚀 Roadmap de Otimização Completa - Cidadão.AI Frontend

**Data**: 21/11/2025
**Autor**: Anderson Henrique da Silva

## 📊 Análise do Estado Atual

### Métricas Atuais

- **Bundle Size**: ~250-342 KB First Load JS (muito alto)
- **Node Modules**: 1.4GB (85 dependências diretas)
- **Arquivos TypeScript**: 445 arquivos
- **Performance Score**: RES 47 (POOR)
- **Build Time**: ~19s com warnings

### Principais Problemas Identificados

#### 1. Bundle Size Excessivo

- First Load JS de 250-342 KB é muito alto
- Muitas dependências pesadas carregadas desnecessariamente
- Falta de code splitting efetivo

#### 2. Dependências Pesadas

```
Bibliotecas Problemáticas:
- framer-motion: ~300KB (animações)
- recharts: ~500KB (gráficos)
- d3: ~400KB (visualizações)
- jspdf + html2canvas: ~600KB (PDF export)
- @sentry/nextjs: ~200KB (monitoring)
- posthog-js: ~150KB (analytics)
```

#### 3. Arquitetura Não Otimizada

- Client Components usados onde Server Components seriam suficientes
- Estado global (Zustand) muito grande
- Falta de lazy loading estratégico
- CSS não otimizado (Tailwind classes duplicadas)

#### 4. Performance Issues

- TTFB alto (3.24s)
- CLS problemático (0.97)
- LCP lento (4.47s)
- JavaScript blocking render

## 🎯 Roadmap de Otimização

### FASE 1: Quick Wins (1-2 dias) ⚡

#### 1.1 Remover Dependências Não Utilizadas

```bash
# Analisar e remover pacotes não usados
npx depcheck

# Candidatos para remoção:
- @emotion/is-prop-valid (não usado)
- @types/d3 (substituir por tipos inline)
- minimatch (pode ser substituído)
```

#### 1.2 Lazy Loading Agressivo

```typescript
// Antes
import { Chart } from 'recharts'

// Depois
const Chart = dynamic(() => import('recharts').then(mod => mod.Chart), {
  ssr: false,
  loading: () => <ChartSkeleton />
})
```

**Componentes para Lazy Load:**

- Todos os gráficos (recharts, d3)
- PDF Export (jspdf, html2canvas)
- Animações (framer-motion)
- Modais pesados
- Páginas de admin/dashboard

#### 1.3 Otimizar Imagens

```typescript
// Implementar blur placeholders
const myLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`
}

// Usar AVIF como formato principal
formats: ['image/avif', 'image/webp']
```

### FASE 2: Refatoração de Componentes (3-4 dias) 🔧

#### 2.1 Converter para Server Components

**Candidatos para conversão:**

- Páginas estáticas (about, manifesto, privacy)
- Headers e footers
- Listas de agentes
- Cards informativos
- Sidebars não interativas

#### 2.2 Implementar Route Groups

```
app/
├── (public)/           # Páginas públicas (SSG)
│   ├── about/
│   ├── manifesto/
│   └── agents/
├── (auth)/            # Páginas com autenticação (CSR)
│   ├── app/
│   └── dashboard/
└── (static)/          # Páginas 100% estáticas
    ├── privacy/
    └── terms/
```

#### 2.3 Otimizar Estado Global

```typescript
// Dividir stores do Zustand
- chatStore.ts (30KB)      → chatStore.ts (10KB)
                           → messagesStore.ts (10KB)
                           → agentsStore.ts (10KB)

// Implementar persist seletivo
const useStore = create(
  persist(
    (set) => ({...}),
    {
      name: 'app-storage',
      partialize: (state) => ({
        // Apenas dados essenciais
        theme: state.theme,
        locale: state.locale
      })
    }
  )
)
```

### FASE 3: Bundle Optimization (2-3 dias) 📦

#### 3.1 Substituir Bibliotecas Pesadas

| Atual         | Tamanho | Substituir Por      | Novo Tamanho | Economia |
| ------------- | ------- | ------------------- | ------------ | -------- |
| recharts      | 500KB   | visx ou victory     | 200KB        | -60%     |
| framer-motion | 300KB   | auto-animate        | 2KB          | -99%     |
| d3 (completo) | 400KB   | d3-scale + d3-shape | 50KB         | -87%     |
| jspdf         | 400KB   | pdfmake-lite        | 150KB        | -62%     |
| posthog-js    | 150KB   | analytics-lite      | 10KB         | -93%     |

#### 3.2 Implementar Barrel Exports

```typescript
// components/index.ts
export { Button } from './ui/button'
export { Card } from './ui/card'
// ... outros componentes

// Uso
import { Button, Card } from '@/components'
```

#### 3.3 Tree Shaking Agressivo

```javascript
// next.config.mjs
experimental: {
  optimizePackageImports: ['lucide-react', '@radix-ui/*', 'date-fns', 'lodash-es']
}

// Webpack config
sideEffects: false // no package.json
```

### FASE 4: Arquitetura e Performance (4-5 dias) 🏗️

#### 4.1 Implementar Islands Architecture

```typescript
// app/pt/page.tsx
export default function Page() {
  return (
    <>
      <StaticHeader />         {/* Server Component */}
      <HeroSection />          {/* Server Component */}
      <InteractiveChat />      {/* Client Island */}
      <StaticFooter />        {/* Server Component */}
    </>
  )
}
```

#### 4.2 Edge Runtime para APIs Críticas

```typescript
// app/api/chat/route.ts
export const runtime = 'edge' // Roda no Edge, não no Node
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  // 10x mais rápido que Node runtime
}
```

#### 4.3 Implementar Streaming SSR

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'

export default function Dashboard() {
  return (
    <>
      <Header />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </>
  )
}
```

#### 4.4 Service Worker Otimizado

```javascript
// Estratégias de cache por tipo de recurso
const cacheStrategies = {
  images: 'CacheFirst', // 30 dias
  api: 'NetworkFirst', // Cache fallback
  static: 'StaleWhileRevalidate', // Atualiza em background
  pages: 'NetworkOnly', // Sempre fresh
}
```

### FASE 5: Monitoring e Observability (2 dias) 📈

#### 5.1 Substituir Sentry por Alternativa Leve

```typescript
// Implementar error boundary customizado
class ErrorBoundary extends Component {
  componentDidCatch(error, errorInfo) {
    // Log para servidor próprio, não Sentry
    logError({ error, errorInfo, userId })
  }
}
```

#### 5.2 Analytics Customizado

```typescript
// Substituir PostHog por solução própria
const analytics = {
  track: (event, properties) => {
    if (!shouldTrack()) return

    // Enviar para Vercel Analytics ou próprio backend
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event, properties }),
    })
  },
}
```

### FASE 6: CSS e Styling (1-2 dias) 🎨

#### 6.1 Purge CSS Não Utilizado

```javascript
// tailwind.config.ts
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  // Remover classes não usadas
  purge: {
    enabled: true,
    preserveHtmlElements: false,
  },
}
```

#### 6.2 CSS Modules para Componentes Críticos

```css
/* Button.module.css */
.button {
  @apply px-4 py-2 rounded-lg;
  /* CSS real ao invés de Tailwind para componentes hot path */
}
```

#### 6.3 Critical CSS Inline

```typescript
// app/layout.tsx
export default function RootLayout() {
  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: criticalCSS // CSS crítico inline
        }} />
      </head>
    </html>
  )
}
```

## 📈 Métricas de Sucesso

### Targets Após Implementação

| Métrica           | Atual     | Target | Melhoria |
| ----------------- | --------- | ------ | -------- |
| **First Load JS** | 250-342KB | <100KB | -70%     |
| **TTFB**          | 3.24s     | <0.5s  | -85%     |
| **FCP**           | 3.32s     | <1s    | -70%     |
| **LCP**           | 4.47s     | <2s    | -55%     |
| **CLS**           | 0.97      | <0.05  | -95%     |
| **RES Score**     | 47        | >90    | +90%     |
| **Build Time**    | 19s       | <10s   | -50%     |
| **Node Modules**  | 1.4GB     | <500MB | -65%     |

## 🛠️ Ferramentas de Monitoramento

### Para Acompanhar Progresso

1. **Bundle Analyzer**: `npm run analyze`
2. **Lighthouse CI**: `npm run lighthouse`
3. **Vercel Speed Insights**: Dashboard
4. **Chrome DevTools**: Coverage tab
5. **WebPageTest.org**: Testes externos

## 📅 Cronograma Sugerido

### Sprint 1 (Semana 1)

- [ ] FASE 1: Quick Wins (2 dias)
- [ ] FASE 2: Início da Refatoração (3 dias)

### Sprint 2 (Semana 2)

- [ ] FASE 2: Conclusão (1 dia)
- [ ] FASE 3: Bundle Optimization (3 dias)
- [ ] FASE 6: CSS Optimization (1 dia)

### Sprint 3 (Semana 3)

- [ ] FASE 4: Arquitetura (5 dias)

### Sprint 4 (Semana 4)

- [ ] FASE 5: Monitoring (2 dias)
- [ ] Testes e ajustes finais (3 dias)

## 🎯 Priorização

### Must Have (P0)

1. Lazy loading de componentes pesados
2. Conversão para Server Components
3. Remoção de dependências não usadas
4. Otimização de imagens

### Should Have (P1)

1. Substituição de bibliotecas pesadas
2. Edge runtime para APIs
3. Service Worker otimizado
4. CSS optimization

### Nice to Have (P2)

1. Islands Architecture completa
2. Analytics customizado
3. Monitoring próprio
4. Micro-frontends

## 💰 ROI Estimado

### Benefícios Esperados

- **Performance**: 70-90% mais rápido
- **UX**: Carregamento instantâneo percebido
- **SEO**: Melhoria de 50+ pontos no score
- **Conversão**: Estimativa de +30% em conversões
- **Custos**: -40% em bandwidth do Vercel
- **Manutenção**: Código 50% mais simples

### Investimento

- **Tempo**: 4 semanas (1 desenvolvedor)
- **Risco**: Baixo (mudanças incrementais)
- **Complexidade**: Média

## 🚦 Próximos Passos Imediatos

1. **Criar branch `perf/optimization-2025`**
2. **Implementar Quick Wins (FASE 1)**
3. **Medir impacto após cada fase**
4. **Documentar mudanças**
5. **Deploy incremental**

## 📝 Notas Importantes

- **Sempre medir antes e depois** de cada otimização
- **Deploy incremental** para detectar regressões
- **Feature flags** para rollback rápido
- **A/B testing** em mudanças críticas
- **Backup** antes de grandes refatorações

---

_Este roadmap é um documento vivo e deve ser atualizado conforme o progresso._

**Última atualização**: 21/11/2025
