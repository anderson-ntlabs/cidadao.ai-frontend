# Bug Report: URLs Truncadas no Endpoint /api/v1/transparency/coverage/map

**Data**: 2025-11-25
**Reportado por**: Anderson Henrique da Silva
**Severidade**: Média
**Componente**: Backend - Transparency Coverage Map API

---

## Resumo do Problema

O endpoint `/api/v1/transparency/coverage/map` está retornando URLs truncadas para algumas APIs federais. As URLs aparecem como `"url":"https:/"` ao invés da URL completa.

---

## Evidência

### Request

```bash
curl -s "https://cidadao-api-production.up.railway.app/api/v1/transparency/coverage/map"
```

### Response (URLs com problema)

```json
{
  "states": {
    "BR": {
      "name": "Federal",
      "status": "healthy",
      "apis": [
        {
          "name": "Portal da Transparência",
          "url": "https:/", // ❌ TRUNCADA
          "endpoints": 3,
          "status": "operational"
        },
        {
          "name": "SICONFI - Tesouro Nacional",
          "url": "https:/", // ❌ TRUNCADA
          "endpoints": 12,
          "status": "operational"
        },
        {
          "name": "CNJ - DataJud",
          "url": "https:/", // ❌ TRUNCADA
          "endpoints": 1,
          "status": "restricted"
        },
        {
          "name": "TCE-CE",
          "url": "https:/", // ❌ TRUNCADA (no estado CE)
          "endpoints": 2,
          "status": "timeout"
        }
      ]
    }
  }
}
```

---

## URLs Corretas (Documentação)

Baseado na documentação em `docs/api/apis/apis_governamentais_completo.md`:

| API                        | URL Truncada | URL Correta                                             |
| -------------------------- | ------------ | ------------------------------------------------------- |
| Portal da Transparência    | `https:/`    | `https://api.portaldatransparencia.gov.br/api-de-dados` |
| SICONFI - Tesouro Nacional | `https:/`    | `https://apidatalake.tesouro.gov.br`                    |
| CNJ - DataJud              | `https:/`    | `https://api-publica.datajud.cnj.jus.br`                |
| TCE-CE                     | `https:/`    | `https://api.tce.ce.gov.br` (verificar)                 |

### URLs que estão corretas:

- ✅ IBGE: `https://servicodados.ibge.gov.br`
- ✅ CGU e-Aud: `https://eaud.cgu.gov.br/v3`
- ✅ PNCP: `https://pncp.gov.br`
- ✅ Dados.gov.br: `https://dados.gov.br`
- ✅ Câmara dos Deputados: `https://dadosabertos.camara.leg.br`
- ✅ Senado Federal: `https://legis.senado.leg.br/dadosabertos/senador/lista/atual`
- ✅ TCU: `https://contas.tcu.gov.br/ords/condenacao/consulta/inabilitados`

---

## Impacto no Frontend

1. **Mapa de Transparência** (`/pt/app/mapa`): Links das APIs federais quebrados
2. **UX**: Usuários não conseguem acessar a documentação das APIs diretamente
3. **Confiabilidade**: Aparenta que o sistema está com dados incompletos

---

## Possíveis Causas

1. **Parsing incorreto** da URL durante scraping/verificação
2. **Configuração hardcoded** com URLs incompletas
3. **Problema de encoding** ao salvar no cache/banco

---

## Sugestão de Correção

### Arquivo provável: `src/services/transparency_apis/coverage_service.py` ou similar

```python
# Mapeamento correto das URLs federais
FEDERAL_API_URLS = {
    "Portal da Transparência": "https://api.portaldatransparencia.gov.br/api-de-dados",
    "SICONFI - Tesouro Nacional": "https://apidatalake.tesouro.gov.br",
    "CNJ - DataJud": "https://api-publica.datajud.cnj.jus.br",
    "IBGE - Geografia": "https://servicodados.ibge.gov.br",
    "CGU e-Aud (Auditoria)": "https://eaud.cgu.gov.br/v3",
    "PNCP - Contratos Públicos": "https://pncp.gov.br/api",
    "Dados.gov.br - Catálogo": "https://dados.gov.br/api",
    "Câmara dos Deputados": "https://dadosabertos.camara.leg.br/api/v2",
    "Senado Federal": "https://legis.senado.leg.br/dadosabertos",
    "TCU - Tribunal de Contas": "https://contas.tcu.gov.br/ords/api/publica",
}
```

---

## Referências

- Documentação completa: `docs/api/apis/apis_governamentais_completo.md`
- Inventário de APIs: `docs/api/05-GOVERNMENT-apis-30plus.md`
- Frontend afetado: `app/pt/app/mapa/page.tsx`

---

## Checklist para Correção

- [ ] Identificar onde as URLs estão sendo definidas/extraídas
- [ ] Corrigir URLs truncadas para as completas
- [ ] Adicionar validação para garantir que URLs tenham formato válido
- [ ] Testar endpoint após correção
- [ ] Invalidar cache se necessário (`?force_refresh=true`)

---

**Status**: ✅ RESOLVIDO
**Data da Correção**: 2025-11-25
**Prioridade**: Média-Alta (afeta UX do mapa de transparência)

---

## Resolução

**Causa raiz identificada**: O código usava `.split("/api")[0]` para extrair URL base, mas URLs como `https://api.portaldatransparencia.gov.br` contêm "api" no domínio.

**Correção aplicada**: Substituído por `urllib.parse.urlparse()`:

```python
# Antes (quebrado)
"url": api_def["url"].split("/api")[0]

# Depois (corrigido)
parsed = urlparse(api_def["url"])
base_url = f"{parsed.scheme}://{parsed.netloc}"
```

**Verificação**: Testado com `?force_refresh=true` - todas URLs corretas.
