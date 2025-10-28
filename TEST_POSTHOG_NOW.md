# 🧪 Guia de Teste PostHog - AGORA!

**Servidor rodando em**: http://localhost:3001

---

## ✅ Passo a Passo para Testar

### 1️⃣ Abrir o Site (30 segundos)

```
✅ Servidor já está rodando em: http://localhost:3001
```

**Abrir no navegador:**
- Chrome/Brave: `Ctrl+Shift+N` (janela anônima)
- Firefox: `Ctrl+Shift+P` (janela privada)

**URL para testar:**
```
http://localhost:3001/pt
```

---

### 2️⃣ Abrir DevTools Console (10 segundos)

**Atalho:**
- Windows/Linux: `F12` ou `Ctrl+Shift+I`
- Mac: `Cmd+Option+I`

**Ir para aba Console**

---

### 3️⃣ Verificar Logs do PostHog (30 segundos)

**O que você DEVE ver no console:**

```
[PostHog] 🚀 Initializing analytics...
[PostHog] 📊 Config loaded: {apiKey: "phc_Q2NjgVvg...", apiHost: "https://us.i.posthog.com"}
[PostHog] ⚠️ Analytics DISABLED - No consent
```

**✅ ESPERADO neste momento:**
- PostHog inicializa
- Mas está DISABLED porque você ainda não aceitou cookies

---

### 4️⃣ Aceitar Cookie Consent (10 segundos)

**Você verá um banner verde na parte inferior da tela:**

```
🍪 Cookies & Privacidade

[Aceitar Tudo]  [Apenas Essenciais]
```

**Clicar em: "Aceitar Tudo"**

---

### 5️⃣ Verificar PostHog Ativado (20 segundos)

**Após aceitar, no console você DEVE ver:**

```
[PostHog] ✅ Analytics ENABLED
[PostHog] 👤 User consent: true
[PostHog] 📍 Tracking pageview: /pt
```

**✅ Se você vê essas mensagens = SUCESSO!** 🎉

---

### 6️⃣ Testar Navegação (2 minutos)

**Navegar pelas páginas:**

1. **Página Inicial** → `/pt`
   - Console deve mostrar: `[PostHog] 📍 Tracking pageview: /pt`

2. **Chat** → Clicar em "Iniciar Chat" ou ir para `/pt/chat`
   - Console deve mostrar: `[PostHog] 📍 Tracking pageview: /pt/chat`

3. **Agentes** → Ir para `/pt/agentes`
   - Console deve mostrar: `[PostHog] 📍 Tracking pageview: /pt/agentes`

4. **Dashboard** → Ir para `/pt/dashboard`
   - Console deve mostrar: `[PostHog] 📍 Tracking pageview: /pt/dashboard`

**✅ Se cada navegação mostra um novo pageview = SUCESSO!** 🎉

---

### 7️⃣ Testar Páginas em Inglês (1 minuto)

**Trocar idioma ou ir direto para:**
```
http://localhost:3001/en
```

**Console deve mostrar:**
```
[PostHog] 📍 Tracking pageview: /en
```

**Navegar para:**
```
http://localhost:3001/en/chat
```

**Console deve mostrar:**
```
[PostHog] 📍 Tracking pageview: /en/chat
```

**✅ Se páginas em inglês rastreiam = CORREÇÃO FUNCIONOU!** 🎉

---

### 8️⃣ Verificar LocalStorage (30 segundos)

**No DevTools:**
1. Ir para aba **Application**
2. Menu esquerdo → **Local Storage**
3. Expandir `http://localhost:3001`

**Você DEVE ver:**
```
cookie-consent: "accepted"
ph_phc_Q2NjgVvg..._posthog: {...} (dados de sessão)
```

**✅ Se essas chaves existem = PERSISTÊNCIA OK!** 🎉

---

### 9️⃣ Verificar Network Requests (1 minuto)

**No DevTools:**
1. Ir para aba **Network**
2. Filtrar por: `posthog` ou `capture`
3. Navegar entre páginas

**Você DEVE ver requests para:**
```
POST https://us.i.posthog.com/decide/
POST https://us.i.posthog.com/e/
```

**Status esperado:** `200 OK`

**✅ Se requests aparecem com 200 = ENVIANDO DADOS!** 🎉

---

### 🔟 Verificar PostHog Dashboard (3-5 minutos)

**IMPORTANTE:** Eventos levam 2-3 minutos para aparecer!

**Abrir PostHog Dashboard:**
```
https://app.posthog.com/project/YOUR_PROJECT_ID/events
```

**Filtrar:**
- Time range: **Last 1 hour**
- Refresh: Clicar no botão de refresh

**Eventos esperados:**
- `$pageview` - Visualizações de página
- `$pageleave` - Saídas de página
- `$autocapture` - Cliques automáticos

**✅ Se eventos aparecem = DASHBOARD FUNCIONANDO!** 🎉

---

## 🎯 Checklist Final

Marque cada item conforme você testa:

- [ ] Console mostra `[PostHog] 🚀 Initializing`
- [ ] Antes de aceitar: `⚠️ Analytics DISABLED`
- [ ] Banner de cookies aparece
- [ ] Após aceitar: `✅ Analytics ENABLED`
- [ ] Navegação PT rastreia pageviews
- [ ] Navegação EN rastreia pageviews
- [ ] LocalStorage tem `cookie-consent: accepted`
- [ ] LocalStorage tem dados `ph_phc_...`
- [ ] Network mostra requests POST para posthog.com
- [ ] Requests retornam 200 OK
- [ ] Dashboard PostHog mostra eventos (após 2-3 min)

---

## ✅ Critérios de Sucesso

### MÍNIMO (Obrigatório):
1. ✅ Console mostra `Analytics ENABLED` após aceitar cookies
2. ✅ Pageviews rastreados em PT e EN
3. ✅ Network requests com status 200

### IDEAL (Recomendado):
1. ✅ Eventos aparecem no PostHog Dashboard
2. ✅ Session recordings funcionam
3. ✅ Autocapture detecta cliques

---

## 🐛 Troubleshooting Rápido

### Problema: Console não mostra logs do PostHog

**Solução:**
```javascript
// No console, digite:
window.posthog

// Deve retornar: {capture: ƒ, identify: ƒ, ...}
// Se retornar undefined, há problema na inicialização
```

### Problema: "Analytics DISABLED" mesmo após aceitar

**Solução:**
```javascript
// No console, verificar consent:
localStorage.getItem('cookie-consent')

// Deve retornar: "accepted"
// Se não, forçar:
localStorage.setItem('cookie-consent', 'accepted')
location.reload()
```

### Problema: Network requests falham (404/403)

**Solução:**
1. Verificar se PostHog service está online:
   - https://status.posthog.com
2. Verificar se API key está correta:
   - `.env.local` → `NEXT_PUBLIC_POSTHOG_KEY`

### Problema: Eventos não aparecem no Dashboard

**Solução:**
1. **Esperar 2-3 minutos** (delay normal)
2. Forçar refresh do dashboard: `Ctrl+Shift+R`
3. Mudar filtro para "Last 1 hour"
4. Verificar se está no projeto correto

---

## 📸 Screenshots Esperados

### Console (Após aceitar cookies):
```
[PostHog] 🚀 Initializing analytics...
[PostHog] 📊 Config loaded: {...}
[PostHog] ✅ Analytics ENABLED
[PostHog] 👤 User consent: true
[PostHog] 📍 Tracking pageview: /pt
[PostHog] 📍 Tracking pageview: /pt/chat
[PostHog] 📍 Tracking pageview: /pt/dashboard
```

### LocalStorage:
```
cookie-consent: "accepted"
ph_phc_Q2NjgVvg4HroMh0Gv7C041m4DC6tqd8OX7AKfWeQrLj_posthog: {
  "distinct_id": "...",
  "posthog_session_id": "...",
  ...
}
```

### Network (Filter: posthog):
```
Name                    Status  Type        Size
decide/                 200     xhr         2.3 KB
e/                      200     xhr         1.5 KB
e/                      200     xhr         1.5 KB
s/                      200     xhr         896 B
```

---

## 🎉 Sucesso Confirmado!

Se você conseguiu:
1. ✅ Ver logs do PostHog no console
2. ✅ Analytics ENABLED após aceitar cookies
3. ✅ Pageviews rastreados em PT e EN
4. ✅ Network requests com 200 OK

**PARABÉNS! PostHog está 100% funcional!** 🚀

---

## 📞 Próximos Passos

### Agora:
1. ✅ Testar com usuários reais
2. ✅ Monitorar dashboard por 24 horas
3. ✅ Verificar session recordings

### Depois:
1. Configurar dashboard personalizado
2. Adicionar tracking em componentes
3. Executar migration Supabase
4. Deploy para produção (Vercel)

---

**Tempo estimado total:** 10-15 minutos
**Dificuldade:** ⭐ Fácil

**Documentação completa:**
- `docs/analytics/POSTHOG_TROUBLESHOOTING.md` (580 linhas)
- `docs/analytics/POSTHOG_FIX_SUMMARY.md`

**Teste automatizado:**
```bash
node scripts/test-posthog.js
```

---

**Boa sorte nos testes!** 🍀
