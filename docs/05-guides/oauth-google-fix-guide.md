# Google OAuth Error 400: invalid_request - Guia de Correção

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-01-28 16:50:00 -0300

---

## 🔴 Erro Observado

```
Fazer Login com o Google
Acesso bloqueado: erro de autorização

andersonhs27@gmail.com
Ocorreu um erro durante a solicitação de autorização. Tente de novo.

Erro 400: invalid_request
Detalhes da solicitação: flowName=GeneralOAuthFlow
```

---

## 🎯 Diagnóstico

O erro `400: invalid_request` do Google OAuth ocorre quando:

1. **Redirect URI não está registrada** no Google Cloud Console
2. **Redirect URI no Supabase difere** da registrada no Google
3. **Client ID/Secret incorretos** ou não configurados
4. **Aplicação OAuth está em teste** e email não está na lista de usuários teste

---

## ✅ Solução Completa

### Passo 1: Verificar Configuração no Supabase Dashboard

1. **Abrir Supabase Dashboard**:

   ```
   https://supabase.com/dashboard/project/pbsiyuattnwgohvkkkks
   ```

2. **Ir para Authentication → Providers → Google**

3. **Verificar campos**:
   - ✅ **Enabled**: Deve estar marcado
   - ✅ **Client ID (for OAuth)**: Deve ter valor
   - ✅ **Client Secret (for OAuth)**: Deve ter valor
   - ✅ **Authorized redirect URIs**: Deve ter URL de callback

4. **Copiar a Callback URL do Supabase**:
   ```
   https://pbsiyuattnwgohvkkkks.supabase.co/auth/v1/callback
   ```

---

### Passo 2: Configurar Google Cloud Console

#### 2.1. Acessar Google Cloud Console

1. **Ir para**: https://console.cloud.google.com
2. **Logar com**: andersonhs27@gmail.com
3. **Selecionar projeto**: Cidadão.AI (ou criar se não existir)

#### 2.2. Habilitar Google+ API (se ainda não habilitado)

```
APIs & Services → Library → Google+ API → Enable
```

#### 2.3. Criar OAuth 2.0 Credentials

1. **Ir para**: `APIs & Services` → `Credentials`

2. **Clicar**: `+ CREATE CREDENTIALS` → `OAuth client ID`

3. **Configurar**:
   - **Application type**: Web application
   - **Name**: Cidadão.AI Frontend

4. **Adicionar Authorized JavaScript origins**:

   ```
   http://localhost:3001
   https://cidadao-ai-frontend.vercel.app
   https://cidadao.ai
   ```

5. **Adicionar Authorized redirect URIs** (CRÍTICO!):

   ```
   http://localhost:3001/auth/callback
   https://pbsiyuattnwgohvkkkks.supabase.co/auth/v1/callback
   https://cidadao-ai-frontend.vercel.app/auth/callback
   ```

6. **Clicar**: `CREATE`

7. **Copiar**:
   - Client ID (formato: `xxxxx.apps.googleusercontent.com`)
   - Client Secret

---

### Passo 3: Atualizar Supabase com Credentials do Google

1. **Voltar para Supabase Dashboard**:

   ```
   https://supabase.com/dashboard/project/pbsiyuattnwgohvkkkks/auth/providers
   ```

2. **Clicar em**: Google

3. **Preencher**:
   - **Client ID (for OAuth)**: Colar Client ID do Google
   - **Client Secret (for OAuth)**: Colar Client Secret do Google

4. **Clicar**: `Save`

---

### Passo 4: Configurar Tela de Consentimento OAuth

1. **Ir para**: `APIs & Services` → `OAuth consent screen`

2. **Escolher**: `External` (para permitir qualquer usuário Google)

3. **Preencher informações do app**:

   ```
   App name: Cidadão.AI
   User support email: andersonhs27@gmail.com
   Developer contact: andersonhs27@gmail.com
   ```

4. **Scopes**: Adicionar apenas:

   ```
   .../auth/userinfo.email
   .../auth/userinfo.profile
   openid
   ```

5. **Test users** (se app está em teste):
   - Adicionar: andersonhs27@gmail.com
   - Adicionar outros emails que precisem acessar

6. **Clicar**: `SAVE AND CONTINUE` até o final

---

### Passo 5: Corrigir Redirect URL no Callback

O código atual redireciona para `/pt/home` que não existe mais:

```typescript
// ❌ ERRADO (linha 8 de app/auth/callback/route.ts)
const next = requestUrl.searchParams.get('next') ?? '/pt/home'

// ✅ CORRETO
const next = requestUrl.searchParams.get('next') ?? '/pt/app'
```

**Correção**:

```bash
# Editar app/auth/callback/route.ts
# Mudar linha 8:
const next = requestUrl.searchParams.get('next') ?? '/pt/app'
```

---

## 🧪 Testar Localmente

### Teste 1: Verificar Configuração

```bash
# 1. Verificar servidor rodando
curl http://localhost:3001

# 2. Testar callback route existe
curl http://localhost:3001/auth/callback
# Deve redirecionar para /auth/error (esperado sem code)
```

### Teste 2: Testar OAuth Flow

1. **Abrir navegador**: http://localhost:3001/pt/login

2. **Clicar**: "Fazer Login com o Google"

3. **Selecionar conta**: andersonhs27@gmail.com

4. **Permitir acesso**

5. **Verificar**:
   - ✅ Redireciona para `/auth/callback?code=xxx`
   - ✅ Processa código
   - ✅ Redireciona para `/pt/app`
   - ✅ Usuário está logado

### Teste 3: Verificar Logs

**No terminal do servidor**:

```bash
# Deve mostrar:
✓ OAuth code exchange successful
→ Redirecting to /pt/app

# NÃO deve mostrar:
❌ OAuth exchange error: ...
❌ OAuth callback missing code parameter
```

**No console do navegador (F12)**:

```javascript
// Verificar sessão Supabase
localStorage.getItem('supabase.auth.token')
// Deve retornar um objeto com access_token
```

---

## 🔍 Troubleshooting

### Problema 1: "Erro 400: invalid_request" persiste

**Causa**: Redirect URI no Google não corresponde à usada

**Verificar**:

```bash
# 1. Abrir console do navegador durante OAuth
# 2. Na aba Network, procurar requisição para google.com
# 3. Ver query param: redirect_uri=xxx
# 4. Verificar se esse EXATO redirect_uri está no Google Console
```

**Solução**:

- Adicionar EXATAMENTE a URI que aparece no Network
- Não esquecer protocolo (http:// vs https://)
- Não esquecer porta (:3001)

### Problema 2: "Acesso bloqueado: este aplicativo está em teste"

**Causa**: OAuth consent screen está em modo "Testing"

**Solução A** (Rápida - para desenvolvimento):

```
Google Console → OAuth consent screen → Test users
→ Adicionar andersonhs27@gmail.com
```

**Solução B** (Completa - para produção):

```
Google Console → OAuth consent screen
→ Clicar "PUBLISH APP"
→ Aguardar aprovação do Google (1-3 dias)
```

### Problema 3: "Redirect URI mismatch"

**Causa**: URI no Supabase difere da no Google

**Solução**:

```
1. Copiar EXATO URI do Supabase:
   https://pbsiyuattnwgohvkkkks.supabase.co/auth/v1/callback

2. Adicionar no Google Console EXATAMENTE assim

3. Sem trailing slash
4. Protocolo https://
```

### Problema 4: Redireciona mas não faz login

**Causa**: Sessão não está sendo persistida

**Solução**: Verificar `app/auth/callback/route.ts` usa `createServerClient` com cookie handling correto (já está correto no código atual)

### Problema 5: Fica em loop infinito

**Causa**: Middleware interceptando e redirecionando

**Verificar**: `middleware.ts` não deve redirecionar `/auth/callback`

---

## 📋 Checklist Completo

### Google Cloud Console

- [ ] Projeto criado/selecionado
- [ ] Google+ API habilitada
- [ ] OAuth 2.0 Client criado
- [ ] Redirect URIs adicionadas:
  - [ ] `http://localhost:3001/auth/callback`
  - [ ] `https://pbsiyuattnwgohvkkkks.supabase.co/auth/v1/callback`
  - [ ] `https://cidadao-ai-frontend.vercel.app/auth/callback`
- [ ] JavaScript origins adicionadas
- [ ] OAuth consent screen configurada
- [ ] Test users adicionados (se em teste)
- [ ] Client ID e Secret copiados

### Supabase Dashboard

- [ ] Google provider habilitado
- [ ] Client ID inserido
- [ ] Client Secret inserido
- [ ] Configurações salvas

### Código

- [ ] `app/auth/callback/route.ts` redireciona para `/pt/app`
- [ ] Supabase env vars corretas em `.env.local`
- [ ] Servidor rodando em porta 3001

### Testes

- [ ] OAuth flow completa sem erros
- [ ] Usuário logado após callback
- [ ] Sessão persiste após refresh
- [ ] Logout funciona

---

## 🚀 Quick Fix (Solução Rápida)

Se você quer apenas fazer funcionar **agora para desenvolvimento**:

### 1. Corrigir redirect no código:

```bash
# Editar app/auth/callback/route.ts linha 8:
const next = requestUrl.searchParams.get('next') ?? '/pt/app'

# Commit:
git add app/auth/callback/route.ts
git commit -m "fix(auth): correct OAuth callback redirect to /pt/app"
git push origin main
```

### 2. Adicionar redirect URI no Google Console:

```
1. https://console.cloud.google.com/apis/credentials
2. Clicar no OAuth 2.0 Client existente
3. Em "Authorized redirect URIs", adicionar:
   http://localhost:3001/auth/callback
4. Clicar SAVE
5. Aguardar 5 minutos (propagação)
```

### 3. Testar:

```bash
# Restartar servidor
npm run dev

# Abrir navegador
open http://localhost:3001/pt/login

# Clicar "Login com Google"
# Deve funcionar!
```

---

## 📚 Recursos Adicionais

**Google OAuth Documentation**:

- https://developers.google.com/identity/protocols/oauth2

**Supabase Auth Documentation**:

- https://supabase.com/docs/guides/auth/social-login/auth-google

**Common OAuth Errors**:

- https://developers.google.com/identity/protocols/oauth2/web-server#error-codes

**OAuth Consent Screen**:

- https://support.google.com/cloud/answer/10311615

---

## ✅ Status Final

Após seguir este guia:

- ✅ Google OAuth deve funcionar em desenvolvimento (localhost:3001)
- ✅ Google OAuth deve funcionar em produção (Vercel)
- ✅ Usuários podem fazer login sem erros
- ✅ Sessão persiste após login

**Se problemas persistirem**: Verificar console do navegador e logs do servidor para mensagens de erro específicas.

---

**Última atualização**: 2025-01-28 16:50:00 -0300
