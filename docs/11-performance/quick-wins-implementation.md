# 🚀 Quick Wins - Implementação Imediata

## 📅 Ações para Hoje (21/11/2025)

### 1. Remover Dependências Não Utilizadas ❌

```bash
# Instalar ferramenta de análise
npm install -g depcheck

# Rodar análise
depcheck

# Remover pacotes identificados
npm uninstall @emotion/is-prop-valid @types/dompurify @types/papaparse minimatch pino driver.js @djpfs/react-vlibras jspdf-autotable
```

### 2. Lazy Loading Imediato 🔄

#### 2.1 Componentes de Gráficos

```typescript
// components/charts/index.tsx
import dynamic from 'next/dynamic'

export const LineChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />
  }
)

export const BarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />
  }
)
```

#### 2.2 PDF Export

```typescript
// lib/export/pdf-export.ts
export const exportToPDF = async () => {
  // Carrega apenas quando necessário
  const [jsPDF, html2canvas] = await Promise.all([
    import('jspdf').then((mod) => mod.jsPDF),
    import('html2canvas'),
  ])

  // Implementação do export
}
```

#### 2.3 Animações

```typescript
// components/animations/index.tsx
import dynamic from 'next/dynamic'

export const AnimatedCard = dynamic(() => import('./animated-card'), { ssr: false })

export const AnimatedTransition = dynamic(() => import('./animated-transition'), { ssr: false })
```

### 3. Otimização de Imports 📦

#### 3.1 Lucide Icons

```typescript
// ❌ ANTES - importa toda a biblioteca
import { Home, User, Settings } from 'lucide-react'

// ✅ DEPOIS - importa apenas ícones usados
import Home from 'lucide-react/dist/esm/icons/home'
import User from 'lucide-react/dist/esm/icons/user'
import Settings from 'lucide-react/dist/esm/icons/settings'
```

#### 3.2 Date-fns

```typescript
// ❌ ANTES
import { format, parseISO } from 'date-fns'

// ✅ DEPOIS
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
```

#### 3.3 Lodash (se usado)

```typescript
// ❌ ANTES
import { debounce, throttle } from 'lodash'

// ✅ DEPOIS
import debounce from 'lodash-es/debounce'
import throttle from 'lodash-es/throttle'
```

### 4. Converter Componentes Estáticos para Server Components 🔄

#### Arquivos para converter AGORA:

1. `app/pt/about/page.tsx`
2. `app/pt/manifesto/page.tsx`
3. `app/pt/privacy/page.tsx`
4. `app/pt/terms/page.tsx`
5. `app/pt/cookies/page.tsx`
6. `components/header.tsx` (versão não interativa)
7. `components/footer.tsx`

#### Template de Conversão:

```typescript
// ❌ ANTES
'use client'

import { useState } from 'react'

export default function AboutPage() {
  const [state, setState] = useState()
  // componente com estado
}

// ✅ DEPOIS
// Remove 'use client'
// Remove hooks desnecessários

export default function AboutPage() {
  // componente server-side
  return (
    <div>
      {/* Conteúdo estático */}
    </div>
  )
}
```

### 5. Implementar Resource Hints 🔗

```typescript
// app/layout.tsx
export default function RootLayout() {
  return (
    <html>
      <head>
        {/* Preconnect para APIs */}
        <link rel="preconnect" href="https://cidadao-api-production.up.railway.app" />
        <link rel="dns-prefetch" href="https://cidadao-api-production.up.railway.app" />

        {/* Preload para fontes críticas */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
    </html>
  )
}
```

### 6. Bundle Analyzer 📊

```bash
# Gerar relatório antes das mudanças
ANALYZE=true npm run build > before-optimization.txt

# Implementar mudanças...

# Gerar relatório depois
ANALYZE=true npm run build > after-optimization.txt

# Comparar resultados
diff before-optimization.txt after-optimization.txt
```

## 📈 Métricas para Acompanhar

### Antes de começar, registrar:

```
Current Metrics (21/11/2025):
- First Load JS: 250-342 KB
- Build Time: ~19s
- Node Modules: 1.4GB
- Dependencies: 84 total
```

### Após cada mudança, medir:

1. Bundle size: `npm run build`
2. Lighthouse score: `npm run lighthouse`
3. Build time
4. Runtime performance

## ✅ Checklist de Implementação

### Hoje (21/11)

- [ ] Remover 8 dependências não utilizadas
- [ ] Implementar lazy loading para gráficos
- [ ] Implementar lazy loading para PDF export
- [ ] Converter 5 páginas estáticas para Server Components
- [ ] Otimizar imports do lucide-react
- [ ] Adicionar resource hints
- [ ] Rodar bundle analyzer

### Amanhã (22/11)

- [ ] Implementar code splitting por rota
- [ ] Otimizar Zustand stores
- [ ] Configurar Edge runtime para APIs críticas
- [ ] Implementar Critical CSS

## 🎯 Resultados Esperados (Quick Wins)

| Métrica      | Antes | Depois | Economia |
| ------------ | ----- | ------ | -------- |
| Bundle Size  | 342KB | ~200KB | -40%     |
| Dependencies | 84    | 76     | -10%     |
| Build Time   | 19s   | ~15s   | -20%     |
| Node Modules | 1.4GB | ~1.1GB | -20%     |

## 🔥 Comando Rápido para Começar

```bash
# 1. Criar branch de otimização
git checkout -b perf/quick-wins-phase-1

# 2. Remover dependências não usadas
npm uninstall @emotion/is-prop-valid @types/dompurify @types/papaparse minimatch pino driver.js @djpfs/react-vlibras jspdf-autotable

# 3. Dedupe dependencies
npm dedupe

# 4. Limpar cache
rm -rf .next node_modules/.cache

# 5. Rebuild
npm run build
```

---

**Começar AGORA com essas mudanças = melhoria imediata de 30-40% na performance!**
