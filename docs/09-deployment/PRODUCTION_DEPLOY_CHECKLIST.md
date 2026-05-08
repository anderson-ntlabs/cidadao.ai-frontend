# 🚀 Production Deployment Checklist

**Data:** 04 de outubro de 2025
**Status do Projeto:** 82% Implementado - Production Ready ✅

---

## ✅ PRÉ-REQUISITOS COMPLETADOS

### Infraestrutura

- [x] Multi-region deployment configurado (US, EU, APAC)
- [x] Security headers A+ rating
- [x] Vercel Edge Functions setup
- [x] Bundle otimizado (<400KB first load)
- [x] Dynamic imports implementados
- [x] Image optimization (AVIF/WebP)

### Monitoring & Segurança

- [x] Sentry configuration completo
- [x] Custom metrics service pronto
- [x] Security hardening (OWASP Top 10)
- [x] Rate limiting implementado
- [x] CSRF protection ready
- [x] Content Security Policy configurado

### Testes

- [x] 161 component tests (91% coverage)
- [x] E2E tests implementados (Playwright)
- [x] Lighthouse CI configurado
- [x] Performance budgets definidos

---

## 📋 CHECKLIST DE DEPLOY

### 1. Configuração Vercel (10 min)

#### 1.1 Criar Projeto

```bash
# Login Vercel CLI
npm i -g vercel
vercel login

# Link projeto
cd cidadao.ai-frontend
vercel link
```

#### 1.2 Configurar Environment Variables

```bash
# Production
vercel env add NEXT_PUBLIC_API_URL production
# Valor: https://cidadao-api-production.up.railway.app

vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Valor: Obter em sentry.io após criar projeto

vercel env add KV_REST_API_URL production
# Valor: Obter após criar Vercel KV database

vercel env add KV_REST_API_TOKEN production
# Valor: Obter após criar Vercel KV database
```

#### 1.3 Criar Vercel KV Database

1. Acesse dashboard.vercel.com
2. Vá em "Storage" → "Create Database"
3. Selecione "KV" (Redis)
4. Nome: `cidadao-ai-kv-production`
5. Region: Escolha mais próxima (sugestão: `iad1` - US East)
6. Copie as environment variables geradas

### 2. Configurar Sentry (5 min)

#### 2.1 Criar Projeto Sentry

1. Acesse sentry.io
2. Create New Project
3. Platform: Next.js
4. Nome: `cidadao-ai-frontend`
5. Copie o DSN

#### 2.2 Configurar Alertas

```
Error Rate > 1% → Email/Slack
Performance (p95) > 3s → Email
```

### 3. Verificação Final (5 min)

#### 3.1 Build Local

```bash
npm run build
npm run start

# Verificar:
# - Build successful ✅
# - No TypeScript errors ✅
# - No ESLint errors ✅
```

#### 3.2 Rodar Testes

```bash
# Unit tests
npm test

# E2E tests (opcional - pode rodar em CI)
npm run test:e2e

# Lighthouse (opcional - pode rodar em CI)
npm run lighthouse
```

### 4. Deploy! (2 min)

```bash
# Deploy para production
vercel --prod

# Aguardar deploy finalizar
# URL será gerada: https://cidadao-ai.vercel.app
```

### 5. Pós-Deploy (10 min)

#### 5.1 Verificar Deployment

- [ ] Acessar URL de production
- [ ] Testar navegação principal
- [ ] Testar chat (verificar backend connection)
- [ ] Verificar console (sem errors críticos)
- [ ] Testar em mobile

#### 5.2 Verificar Monitoring

- [ ] Sentry recebendo eventos
- [ ] Vercel Analytics ativo
- [ ] KV cache funcionando

#### 5.3 Performance Check

```bash
# Lighthouse CI (production URL)
PLAYWRIGHT_BASE_URL=https://cidadao-ai.vercel.app npm run lighthouse

# Verificar scores:
# - Performance: >90 ✅
# - Accessibility: >95 ✅
# - Best Practices: >95 ✅
# - SEO: >95 ✅
```

### 6. Custom Domain (Opcional)

```bash
# Adicionar domínio
vercel domains add cidadao.ai

# Configurar DNS
# A record: 76.76.21.21
# CNAME record: cname.vercel-dns.com

# SSL automático (Vercel)
```

---

## 🔥 DEPLOY RÁPIDO (TL;DR)

**Se você já tem Vercel CLI configurado:**

```bash
# 1. Criar Vercel KV database no dashboard
# 2. Configurar env vars (copiar de .env.example)
# 3. Deploy!

vercel --prod

# Pronto! 🎉
```

---

## 📊 MÉTRICAS ESPERADAS (Post-Deploy)

### Performance

- First Load JS: <400KB ✅
- Time to Interactive: <3.5s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1

### Lighthouse Scores

- Performance: >90
- Accessibility: >95
- Best Practices: >95
- SEO: >95

### Uptime & Reliability

- Target: 99.9% uptime
- Error Rate: <1%
- API Latency (p95): <300ms

---

## 🐛 TROUBLESHOOTING

### Build Falha

```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Não Funcionam

```bash
# Verificar vars
vercel env ls

# Re-adicionar
vercel env rm NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_API_URL production
```

### KV Connection Error

- Verificar KV_REST_API_URL está correto
- Verificar KV_REST_API_TOKEN está correto
- KV database deve estar na mesma região

### Sentry Não Recebe Eventos

- Verificar NEXT_PUBLIC_SENTRY_DSN
- Verificar Sentry DSN está público (NEXT*PUBLIC*)
- Check browser console para erros de Sentry

---

## 📞 SUPORTE

**Vercel:**

- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

**Sentry:**

- Docs: https://docs.sentry.io
- Support: https://sentry.io/support

**Projeto:**

- Issues: github.com/anderson-ntlabs/cidadao.ai-frontend/issues
- Email: anderson.ufrj@gmail.com

---

## ✅ STATUS

- [ ] Vercel projeto criado
- [ ] Environment variables configuradas
- [ ] Vercel KV database criado
- [ ] Sentry projeto criado
- [ ] First deployment successful
- [ ] Performance check passed
- [ ] Monitoring verificado
- [ ] Custom domain (opcional)

**Tempo Total Estimado:** 30-45 minutos

**Resultado:** Aplicação production-ready em Vercel! 🚀
