# Supabase Migration Instructions

**IMPORTANTE**: Execute esta migration para criar a tabela de eventos de usabilidade.

---

## 📋 Passo a Passo

### 1. Acessar Supabase Dashboard

1. Abra: https://supabase.com/dashboard
2. Faça login com sua conta
3. Selecione o projeto: **Cidadão.AI** (pbsiyuattnwgohvkkkks)

### 2. Abrir SQL Editor

1. No menu lateral, clique em **SQL Editor**
2. Clique no botão **+ New query**

### 3. Copiar e Colar a Migration

1. Abra o arquivo: `supabase/migrations/20250124000000_create_usability_events.sql`
2. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
3. Cole no SQL Editor do Supabase (Ctrl+V)

### 4. Executar a Migration

1. Clique no botão **RUN** (ou pressione Ctrl+Enter)
2. Aguarde a execução (deve levar ~2-3 segundos)
3. Verifique se apareceu: ✅ **Success. No rows returned**

### 5. Verificar Criação da Tabela

1. No menu lateral, clique em **Table Editor**
2. Você deve ver a nova tabela: **usability_events**
3. Clique nela para ver a estrutura

### 6. Verificar Views Criadas

1. Volte ao **SQL Editor**
2. Execute esta query para verificar as views:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'VIEW'
  AND table_name LIKE '%event%'
  OR table_name LIKE '%agent%'
  OR table_name LIKE '%accessibility%';
```

3. Você deve ver:
   - ✅ daily_event_summary
   - ✅ agent_usage_stats
   - ✅ device_browser_stats
   - ✅ accessibility_usage
   - ✅ performance_metrics

---

## ✅ Verificação Rápida

Execute esta query para testar a tabela:

```sql
-- Inserir evento de teste
INSERT INTO usability_events (
  event_type,
  event_category,
  session_id,
  page_path,
  has_research_consent
) VALUES (
  'page_view',
  'navigation',
  'test_session_123',
  '/pt/app',
  true
);

-- Buscar evento de teste
SELECT * FROM usability_events
WHERE session_id = 'test_session_123';

-- Deletar evento de teste
DELETE FROM usability_events
WHERE session_id = 'test_session_123';
```

Se funcionar, **migration está OK!** ✅

---

## 🚨 Se Aparecer Erro

### Erro: "permission denied for schema public"

**Solução**: Verifique se está logado como admin no Supabase.

### Erro: "relation already exists"

**Solução**: Tabela já foi criada. Está tudo OK!

### Erro: "function uuid_generate_v4 does not exist"

**Solução**: Execute antes da migration:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 📊 Após a Migration

Teste o sistema completo:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Abra o browser:**
   ```
   http://localhost:3000/pt
   ```

3. **Aceite os consentimentos:**
   - Cookie Consent (banner verde)
   - Research Consent (banner azul/roxo)

4. **Navegue pela plataforma:**
   - Visite algumas páginas
   - Clique em botões
   - Use o chat

5. **Verifique PostHog:**
   - Abra: https://app.posthog.com
   - Vá em **Events**
   - Você deve ver eventos chegando!

6. **Verifique Supabase:**
   ```sql
   SELECT * FROM usability_events
   ORDER BY created_at DESC
   LIMIT 10;
   ```

---

## 🎉 Pronto!

Se chegou até aqui e viu eventos tanto no PostHog quanto no Supabase, **está tudo funcionando!**

Agora você pode:
- ✅ Coletar dados de usabilidade
- ✅ Ver session replays no PostHog
- ✅ Fazer queries SQL no Supabase
- ✅ Exportar dados para sua pesquisa

---

**Última Atualização**: 2025-01-24
