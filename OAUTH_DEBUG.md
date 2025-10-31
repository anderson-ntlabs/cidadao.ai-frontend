# OAuth Debug Guide

## O que está acontecendo

1. Usuário clica em "Login com Google"
2. Frontend chama `signInWithOAuth()` com `redirectTo: /auth/callback?next=/pt/app`
3. Google autentica
4. Supabase deveria redirecionar para `/auth/callback?next=/pt/app`
5. **MAS** está redirecionando para `/pt`

## Como debugar

### 1. Verificar logs do Vercel

Acesse: https://vercel.com/anderson-henriques-projects/cidadao-ai-frontend/logs

Procure por logs com `[OAuth Callback]` para ver:
- Request URL recebida
- Parâmetro `next` capturado
- URL de redirect final

### 2. Verificar console do browser

Após fazer login com Google, abra DevTools Console e procure por:
- `[Auth] Checking session...`
- `[Auth] Session found:` ou `[Auth] No session found`
- `[AuthLayout] OAuth in progress...`

### 3. Verificar cookies

DevTools → Application → Cookies → `https://cidadao-ai-frontend.vercel.app`

Deve ter:
- `sb-pbsiyuattnwgohvkkkks-auth-token` (session token)
- `oauth_in_progress` (temporário, 10s)

### 4. Testar localmente

```bash
npm run dev
# Abra http://localhost:3000/pt/login
# Clique em "Login com Google"
# Verifique os logs no terminal
```

## Possíveis causas

1. **Supabase ignora `redirectTo` personalizado**
   - Solução: Adicionar `/pt/app` nas Redirect URLs

2. **Callback está falhando silenciosamente**
   - Solução: Verificar logs do Vercel

3. **Session não está sendo persistida**
   - Solução: Verificar se cookies estão sendo setados

4. **AuthLayout está redirecionando muito rápido**
   - Solução: Aumentar timeout de 3s para 5s

## Próximos passos

1. Adicionar `/pt/app` nas Redirect URLs do Supabase
2. Fazer login com Google novamente
3. Verificar logs do Vercel
4. Reportar os logs encontrados
