# Branch Protection Guide

---

**Documento**: Guia de Proteção de Branch
**Projeto**: Cidadão.AI - Frontend
**Autor**: Anderson Henrique da Silva
**Data**: 2025-09-29 16:29:16 -03 (Horário de Brasília)
**Localização**: Minas Gerais, Brasil
**Categoria**: Technical Documentation / Git Workflow
**Última Atualização**: 2025-10-04

---

## Configuração de Proteção de Branch para Sprint 2

### Objetivo

Configurar proteção no branch `main` para garantir que todo código passa pelos testes antes do merge.

### Passos para Configuração no GitHub

1. **Acesse as Configurações do Repositório**
   - Vá para Settings → Branches
   - Clique em "Add rule" ou edite a regra existente para `main`

2. **Configurações Recomendadas**

   ✅ **Require a pull request before merging**
   - Require approvals: 1
   - Dismiss stale pull request approvals when new commits are pushed

   ✅ **Require status checks to pass before merging**
   - Require branches to be up to date before merging
   - Status checks obrigatórios:
     - `test` (do workflow test.yml)
     - `build` (do workflow build.yml)

   ✅ **Require conversation resolution before merging**

   ✅ **Include administrators** (opcional, mas recomendado)

3. **Verificações de Status Específicas**

   ```
   - test / test (20.x)
   - build / build
   ```

4. **Configurações Adicionais Opcionais**
   - Require linear history
   - Require deployments to succeed before merging
   - Lock branch (apenas para releases)

### Benefícios

- ✅ Garante que todos os testes passam antes do merge
- ✅ Previne commits diretos no main
- ✅ Mantém histórico limpo e rastreável
- ✅ Aumenta a qualidade do código
- ✅ Reduz bugs em produção

### Verificação

Após configurar, teste criando um PR com:

1. Código que falha nos testes → deve bloquear merge
2. Código que passa nos testes → deve permitir merge

### Exceções

Em casos emergenciais, administradores podem:

- Fazer merge sem passar pelos checks (se "Include administrators" estiver desmarcado)
- Temporariamente desabilitar as proteções

### Integração com CI/CD

Nossa configuração já está pronta:

- ✅ GitHub Actions configurado (test.yml e build.yml)
- ✅ Testes rodando automaticamente em PRs
- ✅ Coverage reports sendo gerados
- ✅ Cache de dependências otimizado
