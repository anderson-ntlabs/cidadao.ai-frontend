# 📱 Plano de Otimização Mobile - Cidadão.AI

**Autor**: Anderson Henrique da Silva
**Data**: 2025-10-28
**Prioridade**: ALTA (Brasil = Mobile First)

---

## 🎯 Objetivo

Otimizar a experiência mobile do Cidadão.AI para o mercado brasileiro, onde **70%+ dos acessos** vêm de dispositivos móveis.

---

## 📊 Problemas Identificados

### 1. **Chat Interface** 🔴 CRÍTICO
- [ ] Toggle Cidadão.AI/Maritaca muito pequeno em mobile
- [ ] Seletor de modelo difícil de clicar (botão pequeno)
- [ ] Descrição dos modos ocupa muito espaço vertical
- [ ] Input de mensagem não se ajusta ao teclado virtual
- [ ] Mensagens do agente com gradiente difíceis de ler em telas pequenas

### 2. **Header/Navigation** 🟡 IMPORTANTE
- [ ] Botões "Nova" e "Histórico" sem labels em mobile
- [ ] Logo + título ocupam muito espaço horizontal
- [ ] Falta botão de voltar consistente

### 3. **Performance** 🔴 CRÍTICO
- [ ] Bundle JS muito grande (chunks não otimizados)
- [ ] Imagens não lazy-loaded adequadamente
- [ ] Animações pesadas (framer-motion)
- [ ] Service Worker não cacheia assets críticos

### 4. **UX Específica Mobile** 🟡 IMPORTANTE
- [ ] Falta feedback tátil (vibração) em ações
- [ ] Scroll infinito sem indicador de loading
- [ ] Botões flutuantes (FAB) obstruem conteúdo
- [ ] Gestos (swipe) não implementados

### 5. **Acessibilidade Mobile** 🟢 DESEJÁVEL
- [ ] Touch targets < 44px (WCAG)
- [ ] VLibras widget muito grande em mobile
- [ ] Contraste de cores em modo escuro

---

## 🔧 Soluções Propostas

### Sprint 1: Chat Interface (2-3 dias)

#### 1.1 Toggle de Modo Responsivo
```tsx
// Versão Mobile Otimizada
<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
  {/* Em mobile: botões full-width empilhados */}
  <button className="w-full sm:w-auto py-3 sm:py-2">
    🏛️ Cidadão.AI
  </button>
  <button className="w-full sm:w-auto py-3 sm:py-2">
    🦜 Maritaca Direto
  </button>
</div>
```

**Mudanças:**
- Mobile: Botões empilhados, full-width, touch-friendly (min 44px altura)
- Desktop: Inline toggle compacto (como está)
- Transição suave com `@media (min-width: 640px)`

#### 1.2 Seletor de Modelo Modal
```tsx
// Mobile: Modal bottom sheet
// Desktop: Dropdown atual

{isMobile ? (
  <BottomSheet open={isOpen} onClose={onClose}>
    <ModelGrid models={[sabia3, sabiazinho3]} />
  </BottomSheet>
) : (
  <DropdownMenu>...</DropdownMenu>
)}
```

**Vantagens:**
- Bottom sheet nativo iOS/Android
- Cards grandes e clicáveis
- Animação suave (slide-up)
- Mais espaço para descrições

#### 1.3 Descrição dos Modos Colapsável
```tsx
// Accordion em mobile, sempre visível em desktop
<Collapsible defaultOpen={!isMobile}>
  <CollapsibleTrigger className="sm:hidden">
    ℹ️ Info
  </CollapsibleTrigger>
  <CollapsibleContent>
    <ChatModeDescription mode={mode} />
  </CollapsibleContent>
</Collapsible>
```

#### 1.4 Input com Teclado Virtual
```tsx
// useEffect para ajustar viewport quando teclado abre
useEffect(() => {
  const handleResize = () => {
    // iOS Safari: viewport muda quando teclado abre
    const vh = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
  };

  window.visualViewport?.addEventListener('resize', handleResize);
  return () => window.visualViewport?.removeEventListener('resize', handleResize);
}, []);
```

---

### Sprint 2: Performance (2 dias)

#### 2.1 Code Splitting Otimizado
```tsx
// Lazy load componentes pesados
const MaritacaModelSelector = dynamic(
  () => import('@/components/chat/maritaca-model-selector'),
  { loading: () => <Skeleton className="h-10 w-32" /> }
);

const ChatHistorySidebar = dynamic(
  () => import('@/components/chat/chat-history-sidebar'),
  { ssr: false } // Não precisa em SSR
);
```

#### 2.2 Image Optimization
```tsx
// Usar next/image com priority nos críticos
<Image
  src="/agents/abaporu.png"
  alt="Cidadão.AI"
  width={40}
  height={40}
  priority={isAboveTheFold}
  sizes="(max-width: 768px) 32px, 40px" // Menor em mobile
/>
```

#### 2.3 Service Worker Cache Strategy
```typescript
// app/sw.ts
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'serwist';

const cacheStrategies = {
  // API responses: Network first, fallback cache
  '/api/': new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5
  }),

  // Static assets: Cache first
  '/_next/static/': new CacheFirst({
    cacheName: 'static-cache',
    maxEntries: 100
  }),

  // Images: Stale while revalidate
  '/agents/': new StaleWhileRevalidate({
    cacheName: 'images-cache',
    maxEntries: 50
  })
};
```

#### 2.4 Bundle Size Reduction
```javascript
// next.config.mjs
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@radix-ui/react-icons',
    'recharts', // Lazy load apenas quando usar gráficos
    'framer-motion' // Substituir por CSS animations em mobile
  ],
  // Remove lodash, use apenas funções específicas
  modularizeImports: {
    'lodash': {
      transform: 'lodash/{{member}}'
    }
  }
}
```

**Meta**: Reduzir bundle de ~800KB para ~400KB em mobile

---

### Sprint 3: UX Mobile Nativa (2 dias)

#### 3.1 Gestos e Interações
```tsx
// Swipe para voltar (iOS-like)
import { useSwipeable } from 'react-swipeable';

const handlers = useSwipeable({
  onSwipedRight: () => router.back(),
  preventDefaultTouchmoveEvent: true,
  trackMouse: false // Apenas touch
});

<div {...handlers}>
  <ChatMessages />
</div>
```

#### 3.2 Feedback Tátil
```typescript
// Vibração em ações críticas
const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30, 10, 30]
    };
    navigator.vibrate(patterns[type]);
  }
};

// Uso:
<Button onClick={() => {
  hapticFeedback('medium');
  handleSendMessage();
}}>
  Enviar
</Button>
```

#### 3.3 Pull to Refresh
```tsx
import PullToRefresh from 'react-simple-pull-to-refresh';

<PullToRefresh
  onRefresh={async () => {
    await loadMoreMessages();
    hapticFeedback('light');
  }}
  pullingContent={<Spinner />}
>
  <MessageList />
</PullToRefresh>
```

#### 3.4 Bottom Navigation (Alternativa ao Header)
```tsx
// Mobile: Nav no bottom (thumb-friendly)
// Desktop: Header no top (como está)

{isMobile ? (
  <BottomNav>
    <NavItem icon={Home} href="/pt/app" />
    <NavItem icon={MessageSquare} href="/pt/app/chat" />
    <NavItem icon={Search} href="/pt/app/investigacoes" />
    <NavItem icon={User} href="/pt/app/perfil" />
  </BottomNav>
) : (
  <HeaderV2 {...headerProps} />
)}
```

---

### Sprint 4: Acessibilidade Mobile (1 dia)

#### 4.1 Touch Targets WCAG
```css
/* Mínimo 44x44px para todos os botões/links em mobile */
@media (max-width: 640px) {
  button,
  a[role="button"],
  [role="checkbox"],
  [role="radio"] {
    min-width: 44px;
    min-height: 44px;
    padding: 12px;
  }
}
```

#### 4.2 VLibras Widget Responsivo
```tsx
// Versão compacta em mobile
<VLibrasWidget
  locale="pt"
  size={isMobile ? 'small' : 'medium'}
  position={isMobile ? 'bottom-left' : 'bottom-right'}
/>
```

#### 4.3 Modo Escuro Otimizado
```css
/* Aumentar contraste em mobile (telas menores + luz solar) */
@media (max-width: 640px) and (prefers-color-scheme: dark) {
  :root {
    --foreground: 255 255 255; /* Branco puro */
    --background: 0 0 0; /* Preto puro */
  }
}
```

---

## 📏 Métricas de Sucesso

### Performance
- [ ] **LCP** (Largest Contentful Paint): < 2.5s em 3G
- [ ] **FID** (First Input Delay): < 100ms
- [ ] **CLS** (Cumulative Layout Shift): < 0.1
- [ ] **Bundle Size**: < 400KB (gzip)
- [ ] **Time to Interactive**: < 5s em 3G

### UX
- [ ] **Touch Target Coverage**: 100% ≥ 44px
- [ ] **Scroll Performance**: 60 FPS consistente
- [ ] **Keyboard Handling**: Sem overlap de conteúdo
- [ ] **Offline Support**: Mensagens em cache acessíveis

### Acessibilidade
- [ ] **WCAG 2.1 AA**: 100% compliance
- [ ] **Screen Reader**: Navegação fluida com VoiceOver/TalkBack
- [ ] **Contrast Ratio**: ≥ 4.5:1 em todos os textos

---

## 🛠️ Ferramentas de Teste

### Performance
```bash
# Lighthouse CI
npm run lighthouse:mobile

# Bundle Analyzer
ANALYZE=true npm run build

# WebPageTest
# https://webpagetest.org (3G, Motorola G4)
```

### Device Testing
```bash
# BrowserStack (dispositivos reais)
# - iPhone 12 Mini (iOS 15)
# - Samsung Galaxy A52 (Android 12)
# - Xiaomi Redmi Note 10 (Android 11) ← Popular no Brasil

# Chrome DevTools Device Mode
# - Galaxy S20 Ultra
# - iPhone 13 Pro Max
# - Pixel 5
```

### Acessibilidade
```bash
# axe DevTools
npx @axe-core/cli https://cidadao-ai-frontend.vercel.app/pt/app/chat

# WAVE
# https://wave.webaim.org

# Screen Readers
# - iOS: VoiceOver
# - Android: TalkBack
```

---

## 📋 Checklist de Implementação

### Semana 1
- [ ] Refatorar toggle de modo (mobile-first)
- [ ] Criar bottom sheet para seletor de modelo
- [ ] Implementar descrição colapsável
- [ ] Corrigir input + teclado virtual
- [ ] Otimizar code splitting

### Semana 2
- [ ] Implementar gestos (swipe back)
- [ ] Adicionar feedback tátil
- [ ] Pull to refresh na lista de mensagens
- [ ] Bottom navigation (opcional)
- [ ] Otimizar service worker cache

### Semana 3
- [ ] Aumentar touch targets (44px min)
- [ ] VLibras widget responsivo
- [ ] Modo escuro otimizado
- [ ] Testes em dispositivos reais
- [ ] Performance audit e correções

---

## 🚀 Quick Wins (Pode fazer AGORA)

### 1. Touch Targets Mínimos (15 min)
```tsx
// components/ui/button.tsx
const sizeVariants = {
  sm: 'h-11 px-4 text-sm', // Era h-9, aumentar para mobile
  md: 'h-12 px-6',         // Era h-10
  lg: 'h-14 px-8',         // Era h-12
};
```

### 2. Skeleton Loading (30 min)
```tsx
// Enquanto carrega mensagens
{isLoading && (
  <>
    <Skeleton className="h-16 w-3/4 mb-4" />
    <Skeleton className="h-16 w-2/3 mb-4 ml-auto" />
  </>
)}
```

### 3. Safe Area Insets (20 min)
```css
/* globals.css - para notch/home indicator */
@supports (padding: max(0px)) {
  .safe-area-top {
    padding-top: max(1rem, env(safe-area-inset-top));
  }

  .safe-area-bottom {
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }
}
```

### 4. Prevent Zoom on Input Focus (5 min)
```html
<!-- layout.tsx -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
/>
```

---

## 💡 Referências

- [Web.dev Mobile Performance](https://web.dev/fast/)
- [WCAG 2.1 Touch Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Touch Targets](https://material.io/design/usability/accessibility.html#layout-typography)
- [Next.js Mobile Optimization](https://nextjs.org/docs/pages/building-your-application/optimizing)

---

**Status**: 📝 Planejamento
**Próximo Passo**: Aprovação e início Sprint 1
