# Mapa de Transparência - Fallback e Recuperação Graceful

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-10-23 13:42:00 -0300

## Situação Atual

O mapa de transparência foi implementado com sucesso, mas o endpoint principal do backend está retornando erro 500.

### Endpoint com Problema

```
GET https://cidadao-api-production.up.railway.app/api/v1/transparency/coverage/map
```

**Erro Retornado:**

```json
{
  "status": "error",
  "status_code": 500,
  "error": {
    "error": "HTTPException",
    "message": "Failed to generate coverage map: 'AsyncSession' object has no attribute 'query'",
    "details": {}
  }
}
```

### Causa Raiz

O erro indica um problema de migração do SQLAlchemy. O código backend está usando a sintaxe antiga:

```python
# ❌ Sintaxe SQLAlchemy 1.x (não funciona mais)
session.query(Model)

# ✅ Sintaxe SQLAlchemy 2.x (correta)
from sqlalchemy import select
session.execute(select(Model))
```

## Solução Implementada (Frontend)

### 1. Dados Mock de Fallback

Implementado em `lib/services/transparency-map.service.ts`:

```typescript
function getMockMapData(): TransparencyMapData {
  // Retorna dados simulados para demonstração
  // Contém 4 estados (SP, RJ, MG, BA) com APIs reais
}
```

**Fluxo de Fallback:**

1. Tenta buscar dados do backend
2. Se falhar, usa cache do localStorage (se disponível)
3. Se não há cache, usa dados mock
4. Interface funcional em todos os cenários

### 2. Banner de Status

Adicionado banner informativo na página do mapa que detecta automaticamente:

- **Modo Demonstração**: Quando está usando dados mock
- **Erro de Conexão**: Quando há erro específico do backend
- **Reconexão**: Mostra status de tentativas de reconexão

**Detecção de Mock Data:**

```typescript
const isUsingMockData =
  apiMapData && !apiMapData.cache_info?.cached && apiMapData.summary.states_with_apis <= 4
```

### 3. Graceful Degradation

O mapa continua 100% funcional:

- ✅ Visualização interativa do Brasil
- ✅ Hover com estatísticas por estado
- ✅ Clique para detalhes de APIs
- ✅ Estatísticas resumidas
- ✅ Lista de problemas conhecidos
- ✅ Call-to-action para contribuir

## Endpoint Funcionando

O endpoint de health check está operacional:

```
GET https://cidadao-api-production.up.railway.app/api/v1/transparency/health
```

**Status Atual (2025-10-23 16:16:08):**

- 5/13 APIs healthy (38.5% overall health)
- **Healthy**: SP-tce, SP-ckan, RS-ckan, SC-ckan, BA-ckan
- **Unhealthy**: CE-tce, RJ-tce, BA-tce, MG-tce, PE-tce, RJ-ckan, RO-state, FEDERAL-portal

## Próximos Passos

### Para o Time de Backend

1. **Corrigir SQLAlchemy Query** (Prioridade Alta)

   Arquivo provável: `src/services/transparency_service.py` ou similar

   ```python
   # Encontrar código como:
   results = session.query(APIHealth).filter(...)

   # Substituir por:
   from sqlalchemy import select
   results = session.execute(
       select(APIHealth).filter(...)
   ).scalars().all()
   ```

2. **Testar Endpoint Localmente**

   ```bash
   curl -s "http://localhost:8000/api/v1/transparency/coverage/map" | python3 -m json.tool
   ```

3. **Deploy da Correção**

   Após correção, o frontend automaticamente:
   - Detectará dados reais do backend
   - Ocultará o banner de demonstração
   - Exibirá todos os 13 estados mapeados

### Para o Frontend

✅ **Implementação Completa** - Nenhuma ação adicional necessária.

O frontend está preparado para:

- Receber dados reais assim que backend for corrigido
- Continuar funcionando com mock enquanto isso
- Transicionar automaticamente entre modos

## Testes Realizados

### Build de Produção

```bash
npm run build
# ✅ Build successful
# ✅ /pt/mapa compilado: 5.87 kB
# ✅ Static generation: 37 páginas
```

### Type Checking

```bash
npm run type-check
# ✅ No TypeScript errors
```

### Funcionalidades Testadas

- ✅ Carregamento de GeoJSON (3.3MB)
- ✅ Projeção Mercator dos estados
- ✅ Hover tooltip com estatísticas
- ✅ Click para modal de detalhes
- ✅ Integração com fallback
- ✅ Banner de status condicional
- ✅ Responsividade (desktop/mobile)
- ✅ Dark mode

## Estrutura de Dados

### Backend Esperado (quando corrigido)

```typescript
interface TransparencyMapData {
  last_update: string
  cache_info: {
    cached: boolean
    last_update: string
    age_minutes: number
  }
  states: Record<string, StateData>
  summary: SummaryStats
  issues: Issue[]
  call_to_action: CallToAction
}
```

### Mock Atual (4 estados)

- **SP**: 2 APIs healthy (TCE + CKAN)
- **RJ**: 1 API healthy (TCE)
- **MG**: 1 API blocked (TCE - firewall)
- **BA**: 1 API degraded (TCE - slow response)

### Produção Esperada (13 APIs em 10 estados)

Baseado em `/api/v1/transparency/health`:

- SP: TCE + CKAN (2 healthy)
- RS: CKAN (1 healthy)
- SC: CKAN (1 healthy)
- BA: TCE + CKAN (1 healthy, 1 unhealthy)
- RJ: TCE + CKAN (2 unhealthy)
- MG: TCE (1 unhealthy - firewall)
- PE: TCE (1 unhealthy)
- CE: TCE (1 unhealthy)
- RO: State Portal (1 unhealthy)
- Federal: Portal (1 unhealthy)

## Métricas de Performance

### Frontend

- **Bundle Size**: 5.87 kB (mapa)
- **First Load JS**: 255 kB (incluindo shared chunks)
- **Loading Strategy**:
  - GeoJSON: 3.3MB carregado uma vez
  - API Data: Cache-first com 6h TTL
  - Mock Fallback: < 10KB inline

### API Esperada

- **Endpoint**: `/api/v1/transparency/coverage/map`
- **Timeout**: 65 segundos (cold start tolerance)
- **Cache**: 6 horas (configura vel)
- **Size**: ~50-100KB JSON estimado

## Monitoramento

### Indicadores de Sucesso

1. **Banner Desaparece**: Dados reais chegando
2. **10+ Estados**: Todos estados mapeados visíveis
3. **Cache Atualizado**: localStorage com dados frescos
4. **Zero Erros**: Console limpo

### Alertas

- ⚠️ Banner amarelo: Usando mock ou cache antigo
- 🔄 Spinner: Reconectando ao backend
- ❌ Erro específico: Problema de rede ou backend

## Referências

### Arquivos Modificados

1. `lib/services/transparency-map.service.ts` - Service layer + mock fallback
2. `app/pt/(authenticated)/mapa/page.tsx` - Map component + status banner
3. `components/auth-layout.tsx` - Adicionado link de navegação

### Documentação Relacionada

- Backend API Guide (fornecido pelo usuário)
- SQLAlchemy 2.0 Migration Guide
- Next.js App Router Documentation
- Mercator Projection Algorithm

## Conclusão

✅ **Frontend Pronto para Produção**

O mapa está completamente funcional com estratégia de fallback robusta.

**Experiência do Usuário:**

- ✅ Interface sempre responsiva
- ✅ Dados sempre disponíveis (mock ou reais)
- ✅ Feedback claro sobre status da conexão
- ✅ Transição suave quando backend for restaurado

**Próxima Ação:**

- Backend corrigir erro SQLAlchemy no endpoint `/coverage/map`
- Frontend detectará automaticamente e usará dados reais
