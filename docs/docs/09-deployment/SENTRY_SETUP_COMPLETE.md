# ✅ Sentry Setup - Guia Completo

**Data:** 06 de outubro de 2025
**Autor:** Anderson Henrique da Silva
**Status:** Configurado e pronto para uso

---

## 📋 Resumo

Sentry está completamente implementado no código do projeto. Apenas requer configuração das credenciais para começar a capturar erros em produção.

---

## ✅ O QUE JÁ ESTÁ IMPLEMENTADO

### 1. Biblioteca Instalada

```json
// package.json
"@sentry/nextjs": "^10.17.0"
```

### 2. Configuração Completa

```typescript
// lib/monitoring/sentry.config.ts
✅ initSentry() - Inicialização automática
✅ captureException() - Captura de erros
✅ captureMessage() - Mensagens customizadas
✅ setUser() - Contexto de usuário
✅ addBreadcrumb() - Tracking de ações
✅ trackPerformance() - Monitoramento de performance
```

### 3. Funcionalidades Configuradas

**Error Tracking:**

- ✅ Captura automática de exceções
- ✅ Filtragem de erros (NetworkError, AbortError)
- ✅ Contexto de erro com breadcrumbs
- ✅ User context quando logado

**Performance Monitoring:**

- ✅ Sample rate: 10% em produção (otimizado)
- ✅ Session replays: 10% de sessões
- ✅ Error replays: 100% quando há erro

**Privacy & Security:**

- ✅ Filtra dados sensíveis de breadcrumbs
- ✅ Desabilitado em desenvolvimento
- ✅ Only captures em production

---

## 🚀 SETUP PASSO A PASSO

### Passo 1: Criar Projeto no Sentry (5 minutos)

1. **Acessar Sentry:**

   ```
   https://sentry.io/signup/
   ```

2. **Criar Conta:**
   - Email: anderson.ufrj@gmail.com
   - Ou login com GitHub

3. **Create Project:**
   - Clique em "Create Project"
   - Platform: **Next.js**
   - Project name: **cidadao-ai-frontend**
   - Team: (Personal ou criar novo)

4. **Copiar DSN:**

   ```
   Formato: https://[KEY]@[ORG].ingest.sentry.io/[PROJECT_ID]

   Exemplo: https://abc123@o123456.ingest.sentry.io/789012
   ```

   ⚠️ **IMPORTANTE:** Copie e guarde esse DSN!

### Passo 2: Configurar no Vercel (3 minutos)

1. **Acessar Dashboard:**

   ```
   https://vercel.com/dashboard
   ```

2. **Navegar até Projeto:**
   - Clique em "cidadao-ai-frontend"
   - Settings → Environment Variables

3. **Adicionar Variável:**

   ```
   Name: NEXT_PUBLIC_SENTRY_DSN
   Value: https://[SEU_DSN_AQUI]
   Environment: ✅ Production (APENAS Production!)
   ```

4. **Salvar:**
   - Clique "Save"
   - Variável será aplicada no próximo deploy

### Passo 3: Redeploy (2 minutos)

1. **Ir para Deployments:**
   - Vercel Dashboard → Deployments

2. **Redeploy último deployment:**
   - Clique nos 3 pontinhos (...)
   - "Redeploy"
   - Confirme

3. **Aguardar Build:**
   - Espere ~2-3 minutos
   - Verifique "Building" → "Ready"

---

## ✅ VALIDAÇÃO

### Teste Automático

```bash
# Rodar script de validação
node scripts/test-sentry.js https://cidadao-ai.vercel.app

# Se Sentry configurado corretamente:
✅ Sentry CONFIGURED
🔑 DSN: https://...

# Se NÃO configurado:
❌ Sentry NOT FOUND in HTML
```

### Teste Manual no Browser

1. **Abrir Console:**
   - Acesse: https://cidadao-ai.vercel.app
   - F12 (DevTools)
   - Console tab

2. **Gerar Erro de Teste:**

   ```javascript
   throw new Error('Sentry Test Error - ' + new Date().toISOString())
   ```

3. **Verificar no Sentry:**
   - Vá em: sentry.io/issues/
   - Deve aparecer o erro em 1-2 minutos
   - Verifique:
     - ✅ Error message visível
     - ✅ Environment: production
     - ✅ URL correta
     - ✅ Browser info
     - ✅ Breadcrumbs capturados

4. **Sucesso:**
   ```
   🎉 Se você vê o erro no Sentry:
   MONITORING ESTÁ FUNCIONANDO!
   ```

---

## 🎯 O QUE SENTRY VAI CAPTURAR

### Erros Automáticos

- ✅ JavaScript runtime errors
- ✅ Unhandled promise rejections
- ✅ Network errors (fetch/axios failures)
- ✅ Component errors (React error boundaries)

### Contexto Capturado

- ✅ User agent (browser, OS)
- ✅ URL atual
- ✅ Timestamp
- ✅ Stack trace completo
- ✅ Breadcrumbs (últimas ações do usuário)
- ✅ User info (quando logado)

### Performance

- ✅ Page load times
- ✅ API call durations
- ✅ Component render times
- ✅ Navigation timing

---

## 📊 DASHBOARD SENTRY

### Onde Ver os Dados

1. **Issues:**

   ```
   sentry.io/organizations/[ORG]/issues/
   ```

   - Lista de todos os erros
   - Frequência
   - Afetados (usuários)

2. **Performance:**

   ```
   sentry.io/organizations/[ORG]/performance/
   ```

   - Transações mais lentas
   - P95, P99
   - Breakdown por operação

3. **Releases:**

   ```
   sentry.io/organizations/[ORG]/releases/
   ```

   - Deploy tracking
   - Erros por release
   - Health score

---

## ⚙️ CONFIGURAÇÕES RECOMENDADAS

### Alerts (Sentry Dashboard)

**Setup no Sentry:**

1. **Error Rate Alert:**

   ```
   Condition: Error count > 50 in 1 hour
   Action: Email para anderson.ufrj@gmail.com
   ```

2. **High Severity:**

   ```
   Condition: Error level = fatal ou critical
   Action: Email imediato
   ```

3. **New Issue:**
   ```
   Condition: First time seeing this error
   Action: Email notification
   ```

### Project Settings

```
General:
  ✅ Auto-assign to team
  ✅ Enable stack trace linking (GitHub)

Data:
  ✅ Enable IP scrubbing
  ✅ Sensitive data filtering

Performance:
  ✅ 10% sample rate (production)
  ✅ 100% sample rate (staging)
```

---

## 🔧 TROUBLESHOOTING

### Sentry não aparece no HTML

```bash
Causas possíveis:
1. ❌ NEXT_PUBLIC_SENTRY_DSN não configurado
2. ❌ Variável está em "Preview" em vez de "Production"
3. ❌ Não fez redeploy após adicionar variável
4. ❌ Build falhou

Solução:
✅ Verificar env vars no Vercel
✅ Garantir que está em "Production"
✅ Fazer redeploy
✅ Verificar build logs
```

### Erros não aparecem no Sentry

```bash
Possíveis causas:
1. ❌ Environment detectado como "development"
2. ❌ DSN incorreto
3. ❌ Firewall bloqueando ingest.sentry.io
4. ❌ Browser com adblocker

Solução:
✅ Verificar NODE_ENV=production
✅ Validar DSN no código-fonte da página
✅ Testar sem VPN/Firewall
✅ Desabilitar adblockers temporariamente
```

### Performance não tracking

```bash
Causa:
- Sample rate muito baixo (10%)
- Apenas 1 em 10 pageviews é tracked

Solução:
✅ Aumentar tracesSampleRate para 1.0 temporariamente
✅ Ou aguardar mais tráfego
```

---

## 📈 MÉTRICAS ESPERADAS

### Após Setup Completo

**Primeiras 24h:**

- ✅ Primeiros eventos capturados
- ✅ Dashboard populando
- ✅ Performance data inicial

**Primeira Semana:**

- ✅ Baseline de erros estabelecido
- ✅ Principais issues identificados
- ✅ Performance patterns visíveis

**Targets:**

- 🎯 Error rate: <1% de pageviews
- 🎯 P95 performance: <3s
- 🎯 Unhandled errors: 0
- 🎯 User feedback integration

---

## 🎉 PRÓXIMOS PASSOS

### Após Sentry Funcionando

1. **Configurar Releases:**

   ```bash
   # Adicionar ao CI/CD
   sentry-cli releases new $VERCEL_GIT_COMMIT_SHA
   sentry-cli releases finalize $VERCEL_GIT_COMMIT_SHA
   ```

2. **Source Maps:**

   ```bash
   # Upload de source maps para stack traces melhores
   # Já configurado no next.config.mjs
   ```

3. **User Feedback:**

   ```typescript
   // Adicionar widget de feedback
   // lib/monitoring/feedback-widget.tsx
   ```

4. **Integration com Slack:**
   ```
   Sentry → Settings → Integrations → Slack
   Receber alertas críticos no Slack
   ```

---

## 📚 RECURSOS

### Documentação

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Error Tracking](https://docs.sentry.io/product/issues/)

### Dashboards

- Production: https://sentry.io/
- Vercel: https://vercel.com/dashboard
- GitHub: https://github.com/anderson-ufrj/cidadao.ai-frontend

---

## ✅ CHECKLIST DE CONCLUSÃO

- [ ] Conta Sentry criada
- [ ] Projeto "cidadao-ai-frontend" criado
- [ ] DSN copiado
- [ ] NEXT_PUBLIC_SENTRY_DSN configurado no Vercel
- [ ] Redeploy realizado
- [ ] Script de teste executado com sucesso
- [ ] Erro de teste apareceu no Sentry dashboard
- [ ] Alerts configurados
- [ ] Documentação atualizada

**Quando todos marcados:** 🎉 SENTRY 100% OPERACIONAL!

---

**Documentado em:** 06/10/2025 13:45 -03
**Última atualização:** Aguardando setup
