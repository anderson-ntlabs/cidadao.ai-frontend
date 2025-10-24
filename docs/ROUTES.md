# 🗺️ Documentação Completa de Rotas - Cidadão.AI Frontend

**Última Atualização**: 2025-01-21
**Versão**: 1.1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Rotas Portuguesas (PT)](#rotas-portuguesas-pt)
3. [Rotas Inglesas (EN)](#rotas-inglesas-en)
4. [Rotas de API](#rotas-de-api)
5. [Convenções de Nomenclatura](#convenções-de-nomenclatura)
6. [Guia de Migração](#guia-de-migração)

---

## 🎯 Visão Geral

O Cidadão.AI Frontend usa Next.js 15 App Router com estrutura de rotas baseada em arquivo. O sistema é **principalmente em português** com suporte limitado para inglês em páginas públicas.

### 🚀 Phase 1: Simplified Post-Login Experience

**Strategic Decision (Jan 2025)**: To provide a focused user experience in Phase 1, we've simplified the post-login flow:

- ✅ **Active Features**: Home, Chat, Profile, Settings, Help
- 🚧 **Coming Soon**: Dashboard, Notifications, Investigations
- 🎯 **Post-login destination**: `/pt/home` (main hub)
- 💡 **User Experience**: Disabled features show "EM BREVE" badges with grayscale styling

**Navigation Changes**:
- Desktop header: Only Home and Chat are clickable
- Mobile bottom nav: Only Home and Chat are shown
- Home page cards: Disabled features have muted styling + "Em Breve" badge
- All navigation components updated for consistency

### Convenções Importantes

✅ **Sempre use rotas em português** para áreas autenticadas:
- `/pt/perfil` (não `/pt/profile`)
- `/pt/notificacoes` (não `/pt/notifications`)
- `/pt/configuracoes` (não `/pt/settings`)

❌ **Rotas em inglês NÃO existem** para áreas autenticadas
- `/en/(authenticated)/*` não está implementado

---

## 🇧🇷 Rotas Portuguesas (PT)

### Públicas (Não Autenticadas)

| Rota | Arquivo | Descrição | Status |
|------|---------|-----------|--------|
| `/pt` | `app/pt/page.tsx` | Landing page principal | ✅ Ativo |
| `/pt/about` | `app/pt/about/page.tsx` | Sobre o projeto | ✅ Ativo |
| `/pt/agents` | `app/pt/agents/page.tsx` | Lista de 17 agentes IA | ✅ Ativo |
| `/pt/cookies` | `app/pt/cookies/page.tsx` | Política de cookies | ✅ Ativo |
| `/pt/login` | `app/pt/login/page.tsx` | Login/OAuth | ✅ Ativo |
| `/pt/manifesto` | `app/pt/manifesto/page.tsx` | Manifesto do projeto | ✅ Ativo |
| `/pt/privacy` | `app/pt/privacy/page.tsx` | Política de privacidade | ✅ Ativo |
| `/pt/system` | `app/pt/system/page.tsx` | Status do sistema | ✅ Ativo |
| `/pt/debug` | `app/pt/debug/page.tsx` | Ferramentas de debug | ⚠️ Dev only |

### Autenticadas (Requer Login)

Todas as rotas autenticadas estão sob `/pt/(authenticated)/`:

**⚠️ PHASE 1 - Simplified Post-Login Experience**

Post-login defaults to `/pt/home` which serves as the main hub. Only Home and Chat are fully active in Phase 1.

| Rota | Arquivo | Descrição | Status |
|------|---------|-----------|--------|
| `/pt/home` | `app/pt/(authenticated)/home/page.tsx` | Main hub post-login | ✅ Active |
| `/pt/chat` | `app/pt/(authenticated)/chat/page.tsx` | Chat with AI agents | ✅ Active |
| `/pt/dashboard` | `app/pt/(authenticated)/dashboard/page.tsx` | Investigations dashboard | 🚧 Coming Soon |
| `/pt/investigacoes` | `app/pt/(authenticated)/investigacoes/page.tsx` | Detailed investigations | 🚧 Coming Soon |
| `/pt/mapa` | `app/pt/(authenticated)/mapa/page.tsx` | Transparency Map | ✅ Active |
| `/pt/notificacoes` | `app/pt/(authenticated)/notificacoes/page.tsx` | Notification center | 🚧 Coming Soon |
| `/pt/perfil` | `app/pt/(authenticated)/perfil/page.tsx` | User profile | ✅ Active |
| `/pt/configuracoes` | `app/pt/(authenticated)/configuracoes/page.tsx` | Settings | ✅ Active |
| `/pt/help` | `app/pt/(authenticated)/help/page.tsx` | Help center | ✅ Active |

---

## 🇺🇸 Rotas Inglesas (EN)

### Públicas (Não Autenticadas)

| Rota | Arquivo | Descrição | Status |
|------|---------|-----------|--------|
| `/en` | `app/en/page.tsx` | Landing page (English) | ✅ Ativo |
| `/en/about` | `app/en/about/page.tsx` | About the project | ✅ Ativo |
| `/en/agents` | `app/en/agents/page.tsx` | AI agents list | ✅ Ativo |
| `/en/cookies` | `app/en/cookies/page.tsx` | Cookie policy | ✅ Ativo |
| `/en/login` | `app/en/login/page.tsx` | Login/OAuth | ✅ Ativo |
| `/en/manifesto` | `app/en/manifesto/page.tsx` | Project manifesto | ✅ Ativo |
| `/en/privacy` | `app/en/privacy/page.tsx` | Privacy policy | ✅ Ativo |
| `/en/system` | `app/en/system/page.tsx` | System status | ✅ Ativo |

### ⚠️ Autenticadas (NÃO IMPLEMENTADAS)

```
❌ /en/(authenticated)/* → ROTAS NÃO EXISTEM
```

**Razão**: O sistema é focado no mercado brasileiro. Páginas autenticadas são apenas em português.

---

## 📍 Detalhamento de Rotas Importantes

### /pt/mapa - Transparency Map

**Status**: ✅ Active (Added in Jan 2025)
**Access**: Authenticated users only

Interactive geographic visualization of Brazilian government transparency data.

**Features**:
- Interactive map with clickable regions
- Real-time data from Railway backend API
- Fallback UI when backend unavailable
- Cache-first strategy for performance
- Responsive design (desktop + mobile)

**Backend Integration**:
- Endpoint: `${API_URL}/api/v1/transparency/map`
- Cache TTL: 1 hour
- Fallback: Local mock data

**Related Documentation**:
- [Transparency Map Integration](./transparency-map-integration-complete.md)
- [Fallback Handling](./transparency-map-fallback.md)
- [Backend API Integration](./frontend-backend-integration-analysis.md)

**Navigation**:
Accessible from Home page cards or direct URL.

---

## 📡 Rotas de API

### Internas (Next.js API Routes)

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/web-vitals` | POST | Tracking de Web Vitals |
| `/api/metrics` | GET | Métricas de performance |
| `/api/monitoring/dashboard` | GET | Dashboard de monitoramento |
| `/api/security/csp-report` | POST | CSP violation reports |
| `/api/test-backend` | GET | Backend connectivity test |

### Edge Functions

| Rota | Descrição |
|------|-----------|
| `/api/edge/chat` | Chat API com edge runtime |

### OAuth Callbacks

| Rota | Descrição |
|------|-----------|
| `/auth/callback` | OAuth callback handler |
| `/auth/error` | OAuth error page |

---

## 🏗️ Convenções de Nomenclatura

### ✅ Padrão Correto (Português)

```typescript
// Links e navegação
<Link href="/pt/perfil">Perfil</Link>
<Link href="/pt/notificacoes">Notificações</Link>
<Link href="/pt/configuracoes">Configurações</Link>

// Verificação de rotas
pathname.includes('/perfil')
pathname.includes('/notificacoes')
pathname.includes('/configuracoes')
```

### ❌ Padrão Incorreto (Inglês)

```typescript
// NÃO USAR - Rotas não existem!
<Link href="/pt/profile">Profile</Link>        ❌
<Link href="/pt/notifications">Notifications</Link>  ❌
<Link href="/pt/settings">Settings</Link>      ❌
```

### 📝 Arquivos de Componente

Ao criar componentes de navegação:

```typescript
// ✅ Correto
const navigation = [
  { name: 'Perfil', href: '/pt/perfil' },
  { name: 'Notificações', href: '/pt/notificacoes' },
  { name: 'Configurações', href: '/pt/configuracoes' },
]

// ❌ Incorreto
const navigation = [
  { name: 'Profile', href: '/pt/profile' },      // Rota não existe
  { name: 'Notifications', href: '/pt/notifications' },  // Rota não existe
  { name: 'Settings', href: '/pt/settings' },    // Rota não existe
]
```

---

## 🔄 Guia de Migração

Se você encontrar rotas antigas em inglês, use este guia para migração:

### Mapeamento de Rotas

| ❌ Rota Antiga (Inglês) | ✅ Rota Nova (Português) |
|------------------------|-------------------------|
| `/pt/profile` | `/pt/perfil` |
| `/pt/notifications` | `/pt/notificacoes` |
| `/pt/settings` | `/pt/configuracoes` |
| `/pt/investigations` | `/pt/investigacoes` |

### Comando de Busca e Substituição

```bash
# Encontrar referências antigas
grep -r "/pt/profile\|/pt/notifications\|/pt/settings" components/

# Substituir com sed (exemplo)
find components/ -name "*.tsx" -exec sed -i 's|/pt/profile|/pt/perfil|g' {} +
find components/ -name "*.tsx" -exec sed -i 's|/pt/notifications|/pt/notificacoes|g' {} +
find components/ -name "*.tsx" -exec sed -i 's|/pt/settings|/pt/configuracoes|g' {} +
```

---

## 🧪 Testes de Rotas

### Verificar Rotas Quebradas

```bash
# Build the app
npm run build

# Se houver rotas quebradas, o build vai falhar com:
# Error: Page "/pt/notifications" is not found
```

### Testar Navegação Manualmente

```bash
npm run dev

# Testar cada rota:
# ✅ http://localhost:3000/pt/perfil
# ✅ http://localhost:3000/pt/notificacoes
# ✅ http://localhost:3000/pt/configuracoes

# ❌ http://localhost:3000/pt/profile (404)
# ❌ http://localhost:3000/pt/notifications (404)
# ❌ http://localhost:3000/pt/settings (404)
```

---

## 📚 Referências de Código

### Componentes que Usam Rotas

1. **components/auth-header.tsx**
   - Menu de navegação principal
   - Links do usuário (perfil, logout)

2. **components/mobile-nav.tsx**
   - Navegação mobile bottom bar
   - Drawer menu

3. **components/pt-layout-wrapper.tsx**
   - Detecção de rotas autenticadas
   - Renderização condicional de layouts

4. **components/navigation-v2-demo.tsx**
   - Demonstração de componentes de navegação

### Hooks e Utilities

```typescript
// Hook para verificar rota autenticada
const isAuthenticatedRoute =
  pathname.includes('/dashboard') ||
  pathname.includes('/chat') ||
  pathname.includes('/investigacoes') ||
  pathname.includes('/home') ||
  pathname.includes('/mapa') ||
  pathname.includes('/perfil') ||
  pathname.includes('/notificacoes') ||
  pathname.includes('/configuracoes')
```

---

## 🚨 Problemas Comuns

### 1. Rota 404 após refatoração

**Problema**: Link para `/pt/profile` resulta em 404

**Solução**: Atualizar para `/pt/perfil`

```diff
- <Link href="/pt/profile">Perfil</Link>
+ <Link href="/pt/perfil">Perfil</Link>
```

### 2. Menu não clicável

**Problema**: Menu de usuário não responde a cliques

**Causa comum**: Z-index incorreto ou rota quebrada

**Solução**:
1. Verificar z-index do header (`z-50`)
2. Verificar se href está correto (`/pt/perfil`)
3. Verificar se rota existe em `app/pt/(authenticated)/`

### 3. Navegação inconsistente

**Problema**: Algumas partes do app usam rotas em inglês, outras em português

**Solução**: Padronizar TODAS as rotas para português

---

## 📝 Changelog de Rotas

### 2025-01-21 - Consolidação V3

- ✅ Removido `/pt/(authenticated)/profile/` (duplicado)
- ✅ Mantido `/pt/(authenticated)/perfil/` como canônico
- ✅ Atualizado todos os componentes para usar rotas PT

### Rotas Removidas

```
❌ /pt/(authenticated)/profile/     → Substituído por /pt/perfil
❌ /pt/(authenticated)/chat/page-v1.tsx  → Consolidado em page.tsx
❌ /pt/(authenticated)/chat/page-v3.tsx  → Consolidado em page.tsx
... (19 arquivos versionados removidos)
```

---

## 🎓 Boas Práticas

### 1. Sempre use constantes

```typescript
// ✅ Bom
const ROUTES = {
  HOME: '/pt/home',
  CHAT: '/pt/chat',
  PROFILE: '/pt/perfil',
  NOTIFICATIONS: '/pt/notificacoes',
  SETTINGS: '/pt/configuracoes',
} as const

<Link href={ROUTES.PROFILE}>Perfil</Link>
```

### 2. Type-safe routing

```typescript
type AuthRoute =
  | '/pt/home'
  | '/pt/chat'
  | '/pt/dashboard'
  | '/pt/investigacoes'
  | '/pt/perfil'
  | '/pt/notificacoes'
  | '/pt/configuracoes'
  | '/pt/help'

const navigate = (route: AuthRoute) => {
  router.push(route)
}
```

### 3. Verificação em tempo de build

```typescript
// next.config.mjs
export default {
  async redirects() {
    return [
      // Redirect old English routes to Portuguese
      {
        source: '/pt/profile',
        destination: '/pt/perfil',
        permanent: true,
      },
      {
        source: '/pt/notifications',
        destination: '/pt/notificacoes',
        permanent: true,
      },
      {
        source: '/pt/settings',
        destination: '/pt/configuracoes',
        permanent: true,
      },
    ]
  },
}
```

---

**Documento mantido por**: Equipe Cidadão.AI
**Última revisão**: 2025-01-21
**Próxima revisão**: Ao adicionar/remover rotas
