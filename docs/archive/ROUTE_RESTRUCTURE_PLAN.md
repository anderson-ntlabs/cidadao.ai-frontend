# Plano de Reestruturação de Rotas

**Autor**: Anderson Henrique da Silva
**Data**: 2025-01-25
**Objetivo**: Separar claramente rotas públicas de autenticadas para melhor UX

---

## 📊 Estrutura Atual (Problemática)

```
app/pt/
├── page.tsx                          ✅ Landing (público)
├── about/page.tsx                    ✅ Sobre (público)
├── agents/page.tsx                   ✅ Agentes (público)
├── cookies/page.tsx                  ✅ Cookies (público)
├── privacy/page.tsx                  ✅ Privacidade (público)
├── terms/page.tsx                    ✅ Termos (público)
├── manifesto/page.tsx                ✅ Manifesto (público)
├── system/page.tsx                   ✅ Sistema (público)
├── login/page.tsx                    ✅ Login (público)
├── debug/page.tsx                    ⚠️  Debug (remover?)
│
└── (authenticated)/                  ❌ PROBLEMA: Grupo de rotas dentro de /pt
    ├── home/page.tsx                 ❌ Confunde com landing /pt
    ├── chat/page.tsx                 ❌ Sem proteção clara
    ├── dashboard/page.tsx            ❌ Sem proteção clara
    ├── investigacoes/page.tsx        ❌ Sem proteção clara
    ├── mapa/page.tsx                 ❌ Sem proteção clara
    ├── perfil/page.tsx               ❌ Sem proteção clara
    ├── notificacoes/page.tsx         ❌ Sem proteção clara
    ├── configuracoes/page.tsx        ❌ Sem proteção clara
    └── help/page.tsx                 ❌ Sem proteção clara
```

**Problemas**:

1. ❌ Grupo `(authenticated)` não impede acesso direto via URL
2. ❌ `/pt/home` vs `/pt` → confusão semântica
3. ❌ Não há indicação visual de "área protegida"
4. ❌ Middleware não funciona bem com grupos de rotas
5. ❌ SEO confuso (mesma estrutura para público/privado)

---

## 🎯 Nova Estrutura (Proposta)

```
app/pt/
│
├── 📂 ROTAS PÚBLICAS (raiz /pt/*)
│   ├── page.tsx                      → /pt (landing)
│   ├── about/page.tsx                → /pt/about
│   ├── agents/page.tsx               → /pt/agents
│   ├── manifesto/page.tsx            → /pt/manifesto
│   ├── system/page.tsx               → /pt/system
│   ├── privacy/page.tsx              → /pt/privacy
│   ├── terms/page.tsx                → /pt/terms
│   ├── cookies/page.tsx              → /pt/cookies
│   └── login/page.tsx                → /pt/login
│
└── 📂 ROTAS AUTENTICADAS (/pt/app/*)
    └── app/
        ├── layout.tsx                 → Middleware de autenticação
        ├── page.tsx                   → /pt/app (dashboard)
        ├── chat/page.tsx              → /pt/app/chat
        ├── investigacoes/page.tsx     → /pt/app/investigacoes
        ├── mapa/page.tsx              → /pt/app/mapa
        ├── perfil/page.tsx            → /pt/app/perfil
        ├── notificacoes/page.tsx      → /pt/app/notificacoes
        ├── configuracoes/page.tsx     → /pt/app/configuracoes
        └── ajuda/page.tsx             → /pt/app/ajuda (antes "help")
```

**Benefícios**:

1. ✅ `/pt/*` = público (SEO friendly)
2. ✅ `/pt/app/*` = autenticado (clara separação)
3. ✅ Middleware protege toda pasta `app/`
4. ✅ Redirect automático se não logado
5. ✅ Breadcrumbs mais claros
6. ✅ Mobile: "Você está na área do aplicativo"

---

## 🔄 Mapeamento de Migração

### Rotas que NÃO mudam (Públicas)

| Antes           | Depois          | Status    |
| --------------- | --------------- | --------- |
| `/pt`           | `/pt`           | ✅ Mantém |
| `/pt/about`     | `/pt/about`     | ✅ Mantém |
| `/pt/agents`    | `/pt/agents`    | ✅ Mantém |
| `/pt/manifesto` | `/pt/manifesto` | ✅ Mantém |
| `/pt/system`    | `/pt/system`    | ✅ Mantém |
| `/pt/privacy`   | `/pt/privacy`   | ✅ Mantém |
| `/pt/terms`     | `/pt/terms`     | ✅ Mantém |
| `/pt/cookies`   | `/pt/cookies`   | ✅ Mantém |
| `/pt/login`     | `/pt/login`     | ✅ Mantém |

### Rotas que MUDAM (Autenticadas)

| Antes               | Depois                  | Ação                  |
| ------------------- | ----------------------- | --------------------- |
| `/pt/home`          | `/pt/app`               | 🔄 Mover + renomear   |
| `/pt/chat`          | `/pt/app/chat`          | 🔄 Mover              |
| `/pt/dashboard`     | `/pt/app`               | 🔄 Mesclar com home   |
| `/pt/investigacoes` | `/pt/app/investigacoes` | 🔄 Mover              |
| `/pt/mapa`          | `/pt/app/mapa`          | 🔄 Mover              |
| `/pt/perfil`        | `/pt/app/perfil`        | 🔄 Mover              |
| `/pt/notificacoes`  | `/pt/app/notificacoes`  | 🔄 Mover              |
| `/pt/configuracoes` | `/pt/app/configuracoes` | 🔄 Mover              |
| `/pt/help`          | `/pt/app/ajuda`         | 🔄 Mover + traduzir   |
| `/pt/debug`         | ❌                      | 🗑️ Remover (dev only) |

---

## 📝 Plano de Execução

### Fase 1: Criar nova estrutura (30min)

```bash
# 1. Criar diretório app
mkdir -p app/pt/app

# 2. Mover arquivos (exemplo)
mv app/pt/\(authenticated\)/chat app/pt/app/chat
mv app/pt/\(authenticated\)/dashboard app/pt/app/
# ... (todos os outros)

# 3. Renomear home → index
mv app/pt/\(authenticated\)/home/page.tsx app/pt/app/page.tsx

# 4. Traduzir help → ajuda
mv app/pt/\(authenticated\)/help app/pt/app/ajuda

# 5. Remover pasta antiga
rm -rf app/pt/\(authenticated\)

# 6. Remover debug
rm -rf app/pt/debug
```

### Fase 2: Criar middleware de proteção (15min)

**Arquivo**: `app/pt/app/layout.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-supabase-auth'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redireciona para login se não autenticado
    if (!loading && !user) {
      router.push('/pt/login?redirect=/pt/app')
    }
  }, [user, loading, router])

  // Mostra loading enquanto verifica auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Não renderiza nada se não autenticado (já está redirecionando)
  if (!user) {
    return null
  }

  // Renderiza children se autenticado
  return <>{children}</>
}
```

### Fase 3: Atualizar navegação (30min)

**Arquivos a atualizar**:

- `components/header.tsx` - Links do header
- `components/footer.tsx` - Links do footer
- `components/navigation.tsx` - Items de navegação
- `components/pt-layout-wrapper.tsx` - Navigation items

**Exemplo de mudança**:

```typescript
// ANTES
const navigationItems = [
  { name: 'Chat', href: '/pt/chat' },
  { name: 'Dashboard', href: '/pt/dashboard' },
  { name: 'Investigações', href: '/pt/investigacoes' },
]

// DEPOIS
const navigationItems = [
  { name: 'Chat', href: '/pt/app/chat' },
  { name: 'Painel', href: '/pt/app' },
  { name: 'Investigações', href: '/pt/app/investigacoes' },
]
```

### Fase 4: Atualizar redirects e links (15min)

**Login page** - Adicionar redirect param:

```typescript
// app/pt/login/page.tsx
const redirect = searchParams.get('redirect') || '/pt/app'

// Após login bem-sucedido:
router.push(redirect)
```

**Breadcrumbs** - Atualizar formatação:

```typescript
// ANTES: /pt/chat → Chat
// DEPOIS: /pt/app/chat → Aplicativo / Chat
```

### Fase 5: Adicionar indicadores visuais (15min)

**App Header** - Badge "Área Autenticada":

```tsx
<header>
  <div className="flex items-center gap-2">
    <span>Cidadão.AI</span>
    <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs rounded-full">
      App
    </span>
  </div>
</header>
```

### Fase 6: Testes (30min)

**Checklist**:

- [ ] Rotas públicas acessíveis sem login
- [ ] Rotas `/pt/app/*` redirecionam se não logado
- [ ] Login redireciona para `/pt/app` após sucesso
- [ ] Logout redireciona para `/pt`
- [ ] Navegação funciona (todos os links)
- [ ] Breadcrumbs corretos
- [ ] Mobile navigation drawer
- [ ] URLs antigas (opcional: redirect 301)

---

## 🔗 Redirects para URLs antigas (Opcional)

Se quiser manter compatibilidade, criar redirects:

**Arquivo**: `next.config.mjs`

```javascript
async redirects() {
  return [
    {
      source: '/pt/home',
      destination: '/pt/app',
      permanent: true, // 301
    },
    {
      source: '/pt/chat',
      destination: '/pt/app/chat',
      permanent: true,
    },
    {
      source: '/pt/dashboard',
      destination: '/pt/app',
      permanent: true,
    },
    // ... outros redirects
  ]
}
```

---

## 📊 Comparação Antes/Depois

### ANTES (Confuso)

```
Usuário não-logado acessa /pt/chat
→ Vê tela de chat vazia ou erro
→ Não sabe o que fazer
→ Abandona o site ❌
```

### DEPOIS (Claro)

```
Usuário não-logado acessa /pt/app/chat
→ Redirect automático para /pt/login?redirect=/pt/app/chat
→ Faz login
→ Volta para /pt/app/chat automaticamente
→ Experiência fluida ✅
```

---

## 🎨 Melhorias Visuais Incluídas

### 1. Badge "App" no header autenticado

```tsx
<div className="flex items-center gap-2">
  <Logo />
  <Badge variant="success">App</Badge>
</div>
```

### 2. Breadcrumbs mais descritivos

```
ANTES: Chat
DEPOIS: Aplicativo › Chat
```

### 3. Loading state durante verificação de auth

```tsx
<div className="min-h-screen flex items-center justify-center">
  <Spinner />
  <p>Verificando autenticação...</p>
</div>
```

### 4. Mensagem clara no login

```tsx
<p className="text-sm text-gray-600">Faça login para acessar o aplicativo Cidadão.AI</p>
```

---

## ⏱️ Estimativa de Tempo

| Fase                   | Tempo       | Complexidade |
| ---------------------- | ----------- | ------------ |
| 1. Mover arquivos      | 30min       | 🟡 Média     |
| 2. Criar middleware    | 15min       | 🟢 Baixa     |
| 3. Atualizar navegação | 30min       | 🟡 Média     |
| 4. Redirects e links   | 15min       | 🟢 Baixa     |
| 5. Indicadores visuais | 15min       | 🟢 Baixa     |
| 6. Testes completos    | 30min       | 🟡 Média     |
| **TOTAL**              | **2h15min** |              |

---

## 🚀 Benefícios Esperados

**Para o Usuário**:

- ✅ Fica claro quando está em área autenticada
- ✅ Não se perde tentando acessar áreas protegidas
- ✅ Experiência de login fluida com redirect
- ✅ URLs semânticas e intuitivas

**Para o Desenvolvedor**:

- ✅ Estrutura clara e organizada
- ✅ Middleware funciona corretamente
- ✅ Fácil adicionar novas rotas autenticadas
- ✅ SEO melhor (separação público/privado)
- ✅ Menos bugs de autenticação

**Para o Projeto**:

- ✅ Mais profissional
- ✅ Pronto para escala
- ✅ Auditável e documentado
- ✅ Padrão da indústria

---

## 📋 Checklist de Migração

### Preparação

- [x] Documentar estrutura atual
- [x] Criar plano de migração
- [ ] Backup do código atual
- [ ] Criar branch: `feature/route-restructure`

### Execução

- [ ] Criar pasta `/pt/app`
- [ ] Mover rotas autenticadas
- [ ] Criar `app/layout.tsx` com middleware
- [ ] Atualizar navigation items
- [ ] Atualizar todos os links
- [ ] Adicionar redirects (opcional)
- [ ] Adicionar indicadores visuais

### Validação

- [ ] Testar rotas públicas
- [ ] Testar rotas autenticadas
- [ ] Testar fluxo de login
- [ ] Testar logout
- [ ] Testar mobile
- [ ] Code review

### Finalização

- [ ] Commit com mensagem descritiva
- [ ] Atualizar documentação
- [ ] PR para main
- [ ] Deploy e teste em produção

---

**Status**: 📋 Planejamento completo
**Próximo passo**: Executar Fase 1 (mover arquivos)
**Responsável**: Anderson Henrique da Silva
