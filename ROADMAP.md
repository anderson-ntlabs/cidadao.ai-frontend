# CIDADÃO.AI - ROADMAP COMPLETO

**Última Atualização**: 2025-11-03
**Status Atual**: ✅ Frontend Production-Ready | 🟡 Backend Monitoring Pending

---

## 📊 STATUS GERAL DO PROJETO

### Frontend (cidadao.ai-frontend)

- ✅ **Build**: Funcional e otimizado
- ✅ **Testes**: 1,355 passando (100%)
- ✅ **CI/CD**: GitHub Actions funcionando
- ✅ **Segurança**: Vulnerabilidades críticas resolvidas
- 🟡 **Logging**: 24% migrado para sistema profissional
- ⏳ **Deploy**: Pronto para Vercel

### Backend (cidadao.ai-backend)

- ✅ **API**: 17 agentes implementados
- ✅ **Railway**: Deploy em produção
- ✅ **Documentação**: World-class FastAPI docs
- 🟡 **Monitoring**: Stack configurado, métricas pendentes
- ⏳ **Database**: In-memory (PostgreSQL planejado)

---

## 🎯 ROADMAP POR PRIORIDADE

### 🔥 CRÍTICO - PRÓXIMAS 48 HORAS

#### 1. Deploy Frontend para Vercel

**Status**: Pronto | **Tempo**: 30 min | **Responsável**: DevOps

**Checklist**:

```bash
□ Criar projeto no Vercel
□ Conectar repositório GitHub
□ Configurar variáveis de ambiente:
  - NEXT_PUBLIC_API_URL (Railway backend)
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - NEXT_PUBLIC_GA_ID (opcional)
□ Verificar build em preview
□ Deploy para produção
□ Testar OAuth flow completo
□ Configurar domínio customizado (opcional)
```

**Comandos**:

```bash
# Via Vercel CLI
vercel login
vercel --prod

# Ou via dashboard: vercel.com
```

---

### 🟡 ALTA PRIORIDADE - PRÓXIMA SEMANA

#### 2. Completar Migração de Console.logs

**Status**: 24% completo (9/38 arquivos) | **Tempo**: 2-3 horas

**Arquivos Restantes por Prioridade**:

**P1 - Auth & Core (1-2 horas)**:

- `hooks/use-supabase-auth.tsx` (6 calls)
- `store/chat-store.ts` (3 calls)
- `store/versioned/base.store.ts` (3 calls)

**P2 - Services (1 hora)**:

- `lib/services/chat-session.service.ts` (6 calls)
- `lib/services/cached-smart-chat.service.ts` (1 call)
- `lib/services/transparency-map.service.ts` (2 calls)

**P3 - API Adapters (2 horas)**:

- `lib/api/chat-direct.ts` (7 calls)
- `lib/api/natural-language-parser.ts` (6 calls)
- `lib/api/check-api.ts` (8 calls)
- `lib/api/find-backend-url.ts` (10 calls)
- 7 outros adapters (1 call cada)

**P4 - Utilities (1 hora)**:

- `lib/websocket/chat-websocket.ts` (8 calls)
- `lib/analytics/posthog-config.ts` (7 calls)
- `lib/sse/chat-sse.ts` (4 calls)
- 10 outros utils (1-3 calls cada)

**Script de Automação**:

```bash
# Já criado: migrate-console-to-logger.sh
./migrate-console-to-logger.sh
```

#### 3. Resolver Lighthouse CI Failures

**Status**: CI falhando | **Tempo**: 1 hora

**Problemas Identificados**:

- Performance score baixo
- Accessibility warnings
- PWA best practices

**Ações**:

```bash
# Rodar localmente
npm run lighthouse

# Verificar issues específicos
npx lighthouse https://localhost:3000 --view
```

---

### 🟢 MÉDIO PRAZO - PRÓXIMAS 2 SEMANAS

#### 4. Backend: Implementar Métricas Prometheus

**Status**: Stack configurado, código Python pendente | **Tempo**: 4-6 horas

**Tarefas**:

```python
# 1. Adicionar dependência
# requirements.txt
prometheus_client==0.18.0

# 2. Criar métricas
from prometheus_client import Counter, Histogram, Gauge

# Agentes
agent_requests_total = Counter('agent_requests_total', 'Total agent requests', ['agent_id'])
agent_response_time = Histogram('agent_response_time_seconds', 'Agent response time')
agent_errors_total = Counter('agent_errors_total', 'Total agent errors', ['agent_id'])

# Investigações
investigation_created = Counter('investigation_created_total', 'Investigations created')
investigation_completed = Counter('investigation_completed_total', 'Investigations completed')

# Anomalias
anomalies_detected = Counter('anomalies_detected_total', 'Anomalies detected', ['type'])

# 3. Expor /metrics endpoint
from fastapi import FastAPI
from prometheus_client import make_asgi_app

app = FastAPI()
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)
```

**Arquivos a Modificar**:

- `src/agents/base_agent.py` - Instrumentar métodos
- `src/agents/zumbi.py` - Métricas de anomalias
- `src/core/investigation.py` - Métricas de investigações
- `src/main.py` - Expor endpoint /metrics

#### 5. Backend: Testar Stack de Monitoring

**Status**: Containers prontos | **Tempo**: 2 horas

**Checklist**:

```bash
cd cidadao.ai-backend

# 1. Subir stack local
make monitoring-up
# ou
docker-compose -f docker-compose.monitoring.yml up -d

# 2. Acessar dashboards
# Grafana: http://localhost:3000 (admin/cidadao123)
# Prometheus: http://localhost:9090

# 3. Verificar métricas
curl http://localhost:8000/metrics

# 4. Criar alertas
# Via Grafana UI: Alerting → Alert Rules
```

**Dashboards a Criar**:

- Overview (CPU, RAM, requests/s)
- Agentes (requests por agente, latência, erros)
- Investigações (criadas, completadas, tempo médio)
- Anomalias (detectadas por tipo, severidade)

#### 6. Backend: Expandir Sistema de Agentes

**Status**: 10 operacionais, 7 estrutura apenas | **Tempo**: 8-12 horas

**Agentes Prioritários**:

**Anita Garibaldi (Analista)** - 4h:

```python
class AnitaGaribaldiAgent(BaseAgent):
    """
    Especialista em análise de padrões contratuais
    - Identifica licitações suspeitas
    - Analisa sequências de contratos
    - Detecta padrões de favorecimento
    """

    async def analyze_contract_patterns(self, contracts: List[Dict]) -> AnalysisResult:
        # Implementar lógica de análise
        pass
```

**Tiradentes (Repórter)** - 4h:

```python
class TiradentesAgent(BaseAgent):
    """
    Especialista em geração de relatórios
    - Cria relatórios formatados
    - Exporta para PDF/DOCX
    - Gráficos e visualizações
    """

    async def generate_report(self, investigation_id: str) -> Report:
        # Implementar geração de relatórios
        pass
```

---

### 🔵 LONGO PRAZO - PRÓXIMO MÊS

#### 7. Implementar Features Real-Time

**Status**: Infraestrutura pronta, desabilitada | **Tempo**: 6-8 horas

**WebSocket** (4h):

```typescript
// Frontend: lib/websocket/chat-websocket.ts (já criado)
// Habilitar via env
NEXT_PUBLIC_FEATURE_WEBSOCKET=true

// Backend: implementar WebSocket handler
from fastapi import WebSocket

@app.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket):
    await websocket.accept()
    # Implementar lógica de streaming
```

**SSE (Server-Sent Events)** (2h):

```typescript
// Frontend: lib/sse/chat-sse.ts (já implementado)
// Backend: usar StreamingResponse
from fastapi.responses import StreamingResponse

@app.post("/api/chat/stream")
async def stream_chat():
    async def event_generator():
        yield f"data: {json.dumps(message)}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

#### 8. Aumentar Cobertura de Testes

**Status**: Frontend 91%, Backend ~40% | **Tempo**: 10-15 horas

**Frontend** (já em 91% ✅):

- Manter testes existentes
- Adicionar testes E2E com Playwright

**Backend** (precisa subir para 80%):

```bash
cd cidadao.ai-backend

# Rodar testes com coverage
make test

# Identificar gaps
pytest --cov=src --cov-report=html
open htmlcov/index.html

# Priorizar:
# 1. Agentes críticos (Zumbi, Abaporu)
# 2. API routes principais
# 3. Services de investigação
```

**Meta**: 80% coverage em todos os módulos

#### 9. CI/CD para Backend

**Status**: Manual deployment no Railway | **Tempo**: 4-6 horas

**GitHub Actions Workflow**:

```yaml
# .github/workflows/backend-ci.yml
name: Backend CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements-dev.txt
      - run: make test
      - run: make lint

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm i -g @railway/cli
          railway up
```

---

## 📦 FEATURES PLANEJADAS (BACKLOG)

### Frontend

- [ ] Modo offline completo (Service Worker + IndexedDB)
- [ ] Notificações push (via Supabase)
- [ ] Tema customizável pelo usuário
- [ ] Exportação avançada (Excel, CSV com múltiplas abas)
- [ ] Compartilhamento social de investigações
- [ ] Histórico de navegação persistente

### Backend

- [ ] PostgreSQL integration (substituir in-memory)
- [ ] Redis para cache distribuído
- [ ] ML models treinados (não só thresholds)
- [ ] Agendamento de investigações recorrentes
- [ ] API de webhooks para integrações
- [ ] GraphQL endpoint (além de REST)

### DevOps

- [ ] Kubernetes deployment (escalar agentes)
- [ ] Terraform IaC
- [ ] Backup automático de dados
- [ ] Disaster recovery plan
- [ ] Blue-green deployment

---

## 🎯 METAS DE QUALIDADE

### Código

- ✅ Frontend: 91% test coverage (mantido)
- ⏳ Backend: 40% → 80% test coverage
- ✅ Zero TypeScript errors
- 🟡 ESLint warnings reduzidos (em progresso)

### Performance

- Frontend: Lighthouse score > 90
- Backend: Response time < 500ms (p95)
- Database: Query time < 100ms (p99)

### Segurança

- ✅ Vulnerabilidades críticas: 0
- 🟡 Vulnerabilidades low: 4 (dev deps)
- ⏳ Penetration testing: Pendente
- ⏳ Security audit: Pendente

### Documentação

- ✅ API docs: World-class (FastAPI)
- ✅ Frontend docs: CLAUDE.md completo
- 🟡 User docs: Básico
- ⏳ Video tutorials: Pendente

---

## 🚀 RELEASES PLANEJADAS

### v1.0.0 - MVP (Atual - Nov 2025)

- ✅ Frontend funcional com OAuth
- ✅ Backend com 10 agentes operacionais
- ✅ Deploy em produção (Railway + Vercel)
- ⏳ Documentação de usuário

### v1.1.0 - Observability (Dez 2025)

- ⏳ Prometheus metrics completo
- ⏳ Grafana dashboards em produção
- ⏳ Alertas configurados
- ⏳ Distributed tracing (Jaeger)

### v1.2.0 - Real-Time (Jan 2026)

- ⏳ WebSocket habilitado
- ⏳ SSE para streaming
- ⏳ Notificações push
- ⏳ Updates em tempo real

### v2.0.0 - Enterprise (Mar 2026)

- ⏳ PostgreSQL + Redis
- ⏳ ML models treinados
- ⏳ 80%+ test coverage
- ⏳ Kubernetes deployment
- ⏳ Security audit completo

---

## 📝 COMO USAR ESTE ROADMAP

### Para Desenvolvedores

1. **Escolha uma tarefa** da seção correspondente à sua sprint
2. **Crie uma branch**: `git checkout -b feat/task-name`
3. **Desenvolva** seguindo os padrões do projeto
4. **Teste**: Adicione testes unitários e E2E
5. **Commit**: Use conventional commits (sem menções a IA)
6. **PR**: Crie pull request com descrição detalhada

### Para Product Owner

- **Sprint Planning**: Use seções 🔥 CRÍTICO e 🟡 ALTA PRIORIDADE
- **Backlog Grooming**: Organize features da seção 📦 BACKLOG
- **Release Planning**: Consulte seção 🚀 RELEASES

### Para DevOps

- **Monitoring**: Priorize seção "Backend: Métricas Prometheus"
- **CI/CD**: Implemente workflows da seção "CI/CD para Backend"
- **Infraestrutura**: Planeje usando metas de Performance

---

## 🤝 CONTRIBUINDO

### Processo

1. Pegue uma tarefa do roadmap
2. Atualize o status no GitHub Projects
3. Desenvolva seguindo o CLAUDE.md
4. Mantenha este roadmap atualizado
5. Celebre quando completar! 🎉

### Contato

- **GitHub**: anderson-ufrj/cidadao.ai-\*
- **Issues**: Use templates de issue
- **Discussions**: Para perguntas gerais

---

**Última Revisão**: Anderson Henrique da Silva
**Próxima Revisão**: 2025-11-10 (semanal)
