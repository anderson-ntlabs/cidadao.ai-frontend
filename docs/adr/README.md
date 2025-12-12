# Architecture Decision Records (ADRs)

Este diretorio contem os Architecture Decision Records (ADRs) do projeto Cidadao.AI Frontend.

## O que sao ADRs?

ADRs sao documentos que capturam decisoes arquiteturais importantes feitas durante o desenvolvimento do projeto. Eles fornecem contexto historico sobre por que certas decisoes foram tomadas.

## Estrutura

Cada ADR segue o template em `template.md` e inclui:

- **Status**: Proposto, Aceito, Depreciado ou Substituido
- **Contexto**: O problema ou necessidade que levou a decisao
- **Decisao**: O que foi decidido
- **Consequencias**: Impactos positivos e negativos
- **Alternativas**: Outras opcoes consideradas

## Lista de ADRs

| ID                                             | Titulo                                  | Status       | Data       |
| ---------------------------------------------- | --------------------------------------- | ------------ | ---------- |
| [ADR-001](./ADR-001-result-type-pattern.md)    | Result Type Pattern para Error Handling | Aceito       | 2025-12-12 |
| [ADR-002](./ADR-002-agora-state-management.md) | Agora State Management Architecture     | Implementado | 2025-12-12 |
| ADR-003                                        | Service to Hook Migration Strategy      | Pendente     | -          |
| ADR-004                                        | Test Coverage Strategy                  | Pendente     | -          |

## Como criar um novo ADR

1. Copie o arquivo `template.md`
2. Renomeie para `ADR-XXX-titulo-em-kebab-case.md`
3. Preencha todas as secoes
4. Atualize a tabela acima
5. Submeta para revisao

## Referencias

- [ADR GitHub Organization](https://adr.github.io/)
- [Michael Nygard's article on ADRs](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
