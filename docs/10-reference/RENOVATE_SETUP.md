# 🤖 Renovate Setup - Cidadão.AI Frontend

**Status**: ✅ Configuration Ready | ⏳ Awaiting Installation

---

## Quick Start (3 passos)

### 1. Instalar o Renovate no GitHub

Visite: **https://github.com/apps/renovate**

1. Clique em **"Install"**
2. Escolha **"Only select repositories"**
3. Selecione: `anderson-ufrj/cidadao.ai-frontend` (ou nome correto do repo)
4. Clique em **"Install"**

### 2. Aguardar o Onboarding PR

Dentro de alguns minutos, Renovate criará um PR:

```
Configure Renovate
Este PR inicial explica como o Renovate funcionará no seu projeto
```

**O que fazer**:

- ✅ Leia o PR para entender o que vai acontecer
- ✅ Faça merge do Onboarding PR
- ✅ Aguarde as primeiras atualizações (Mon/Thu 5am BRT)

### 3. Verificar Dependency Dashboard

Após o merge, Renovate criará uma Issue:

```
🤖 Renovate Dependency Dashboard
Lista todas as dependências e atualizações pendentes
```

**Marcar como favorita** (pin) para acesso rápido!

---

## O que vai acontecer

### Primeira Execução (após onboarding)

Renovate vai:

1. **Escanear** todas as 80+ dependências do projeto
2. **Criar PRs** para atualizações disponíveis
3. **Agrupar** atualizações relacionadas (Next.js, Supabase, etc.)
4. **Rodar CI/CD** automaticamente em cada PR
5. **Automerge** patches seguros (ex: `15.0.0` → `15.0.1`)

**Espere 5-15 PRs na primeira execução** (dependências desatualizadas acumuladas).

### Rotina Normal (após primeira execução)

- **Segunda/Quinta 5am**: PRs para patches e minors
- **Domingo 5am**: PRs para major updates
- **A qualquer hora**: Security patches (vulnerabilidades)
- **Dia 1 do mês**: Lock file maintenance

---

## Configuração Implementada

### ✅ O que está configurado

**Automerge Ativado**:

- ✅ Patches (ex: `1.0.0` → `1.0.1`)
- ✅ DevDependencies minors (ex: `eslint 8.0` → `8.1`)
- ✅ Linting/formatting tools

**Review Manual Necessário**:

- ❌ Major updates (ex: `14.x` → `15.x`)
- ❌ Production deps minors
- ❌ Next.js, React, Supabase (sempre agrupados)

**Agendamento**:

- 📅 Mon/Thu 5am BRT: Updates regulares
- 📅 Sunday 5am BRT: Major updates
- 📅 Imediatamente: Security patches

**Limites**:

- 🚦 Max 5 PRs abertos simultaneamente
- 🚦 Max 2 PRs novos por hora

### 📋 Grupos de Pacotes

| Grupo                 | Pacotes                             | Automerge |
| --------------------- | ----------------------------------- | --------- |
| **Next.js ecosystem** | next, react, react-dom              | ❌ Manual |
| **Supabase**          | @supabase/\*                        | ❌ Manual |
| **Testing tools**     | vitest, playwright, testing-library | ❌ Manual |
| **Linting**           | eslint, prettier                    | ✅ Auto   |
| **TypeScript**        | typescript, @types/\*               | ❌ Manual |

---

## Primeiros Passos Após Instalação

### Dia 1: Merge Onboarding PR

```bash
# No GitHub:
# 1. Review o PR "Configure Renovate"
# 2. Merge (cria o Dependency Dashboard)
```

### Dia 2: Review Dashboard

```bash
# No GitHub Issues:
# 1. Abra "🤖 Renovate Dependency Dashboard"
# 2. Veja lista completa de atualizações pendentes
# 3. Pin (⭐) a issue para acesso rápido
```

### Primeira Semana: Review PRs Iniciais

Renovate criará vários PRs na primeira execução:

**Prioridade Alta (merge rápido)**:

- 🔴 Security patches (label: `security`)
- 🟡 Patches de produção (label: `dependencies`)

**Prioridade Média (review esta semana)**:

- 🟢 DevDependencies minors
- 🟢 Linting/formatting tools

**Prioridade Baixa (agendar para próximo sprint)**:

- 🔵 Major updates (label: `major-update`)
- 🔵 Breaking changes

### Após 1 Mês: Ajustar Configuração

Baseado na experiência:

**Se muitos PRs acumularam**:

```json
// renovate.json - reduzir frequência
"schedule": ["before 5am on sunday"]  // Só domingos
```

**Se tudo está tranquilo**:

```json
// renovate.json - aumentar automerge
"packageRules": [
  {
    "matchDepTypes": ["dependencies"],
    "matchUpdateTypes": ["minor"],
    "automerge": true  // Automerge minors também
  }
]
```

---

## Gerenciamento de PRs

### Comandos do Renovate

Comente nos PRs para controlar o Renovate:

```bash
@renovate rebase       # Atualiza PR com main
@renovate retry        # Tenta novamente se falhou
@renovate recreate     # Deleta e recria PR
@renovate pause        # Pausa este PR
@renovate unpause      # Resume este PR
```

No Dependency Dashboard:

```bash
@renovate pause all    # Pausa TODAS atualizações
@renovate unpause all  # Resume tudo
@renovate check        # Força checagem imediata
```

### Workflow Recomendado

**Toda Segunda (5 minutos)**:

1. ✅ Abrir Dependency Dashboard
2. ✅ Ver PRs de security (merge imediatamente)
3. ✅ Ver PRs automerged (verificar se passou CI)
4. ✅ Agendar review de majors para fim de semana

**Toda Sexta (10 minutos)**:

1. ✅ Review PRs de minors acumulados
2. ✅ Testar localmente se necessário
3. ✅ Merge PRs aprovados
4. ✅ Fechar PRs que não faremos (comentar motivo)

**Primeiro Domingo do Mês (30 minutos)**:

1. ✅ Review major updates
2. ✅ Ler changelogs e migration guides
3. ✅ Planejar trabalho de migração
4. ✅ Criar issues para breaking changes

---

## Testando Localmente

Se quiser testar uma atualização antes do merge:

```bash
# Checkout do PR do Renovate
gh pr checkout <PR-number>

# Instalar dependências atualizadas
npm install

# Rodar testes
npm run test
npm run test:playwright

# Testar no navegador
npm run dev
# Abrir http://localhost:3000

# Se tudo OK, fazer merge no GitHub
# Se problema, comentar no PR e fechar
```

---

## Configuração Avançada

### Alterar Agendamento

```json
// renovate.json
"schedule": ["after 10pm every weekday"]  // Fora do horário
"schedule": ["every weekend"]             // Só fim de semana
"schedule": ["before 5am on monday"]      // Só segunda
```

### Adicionar Mais Automerge

```json
// renovate.json - automerge minors também
"packageRules": [
  {
    "matchUpdateTypes": ["minor"],
    "matchDepTypes": ["dependencies"],
    "automerge": true
  }
]
```

### Ignorar Pacote Específico

```json
// renovate.json - nunca atualizar este pacote
"ignoreDeps": ["problematic-package"]
```

### Alterar Limites de PRs

```json
// renovate.json
"prConcurrentLimit": 10,  // Mais PRs simultâneos
"prHourlyLimit": 5        // Mais PRs por hora
```

---

## Troubleshooting

### Renovate não criou PRs após 24h

**Verificar**:

1. App instalado? GitHub Settings → Integrations → Renovate
2. Onboarding PR foi merged? Sem merge, Renovate não roda
3. Branch protection muito restrito? Renovate precisa criar branches

**Fix**: Comentar no Dashboard: `@renovate check`

### Automerge não funciona

**Causas comuns**:

1. ❌ CI/CD falhou (testes, lint, type-check)
2. ❌ Branch protection exige aprovação manual
3. ❌ Merge conflicts existem

**Fix**:

```json
// renovate.json - forçar automerge via GitHub
"platformAutomerge": true
```

E no GitHub: Settings → Branches → Desabilitar "Require approval"

### Muitos PRs de uma vez

**Fix rápido**: Comentar no Dashboard:

```
@renovate pause all
```

Depois ajustar `renovate.json`:

```json
"prConcurrentLimit": 2,
"schedule": ["before 5am on sunday"]
```

Quando pronto: `@renovate unpause all`

---

## Documentação Completa

Documentação detalhada criada em:

📄 **`docs/10-reference/renovate-guide.md`**

Contém:

- ✅ Como funciona o Renovate
- ✅ Todas as regras configuradas
- ✅ Cenários comuns e soluções
- ✅ Melhores práticas
- ✅ Monitoramento e métricas
- ✅ Segurança e supply chain

---

## Checklist de Setup

Antes de instalar:

- [x] Configuração criada (`renovate.json`)
- [x] Documentação escrita
- [x] JSON validado (sintaxe OK)
- [ ] App instalado no GitHub
- [ ] Onboarding PR merged
- [ ] Dashboard criado e pinned

Após primeira semana:

- [ ] Primeiros PRs revisados
- [ ] Automerge funcionando
- [ ] Security patches aplicados
- [ ] Configuração ajustada se necessário

---

## Próximos Passos

1. **AGORA**: Instalar Renovate em https://github.com/apps/renovate
2. **Hoje**: Merge do Onboarding PR
3. **Esta semana**: Review primeiros PRs
4. **Próximo mês**: Ajustar configuração baseado na experiência

---

## Suporte

**Problemas com Renovate?**

1. Ler: `docs/10-reference/renovate-guide.md`
2. Verificar: Dependency Dashboard no GitHub Issues
3. Buscar: https://docs.renovatebot.com
4. Perguntar: https://github.com/renovatebot/renovate/discussions

**Problemas com configuração deste projeto?**

Abra uma issue no GitHub com label `dependencies` e mencione este setup.

---

**Pronto para começar! 🚀**

Acesse: https://github.com/apps/renovate e instale agora mesmo!
