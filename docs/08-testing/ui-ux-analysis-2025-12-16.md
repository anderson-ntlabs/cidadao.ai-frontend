# Análise de UI/UX - Cidadão.AI

**Data:** 2025-12-16
**Autor:** Anderson Henrique da Silva
**Versão:** 1.0

---

## Sumário Executivo

Esta análise avalia a UI/UX do Cidadão.AI comparando com padrões da indústria (GOV.UK Design System, USWDS, Material Design 3) e melhores práticas de aplicações gov-tech e EdTech.

### Pontuação Geral

| Área                        | Nota | Benchmark                                     |
| --------------------------- | ---- | --------------------------------------------- |
| **Consistência Visual**     | 7/10 | Bom, mas com variações entre sistemas         |
| **Hierarquia de Navegação** | 6/10 | Três sistemas diferentes sem unificação clara |
| **Acessibilidade**          | 8/10 | WCAG AAA implementado, mas falta testes reais |
| **Mobile Experience**       | 7/10 | Componentes existem, integração incompleta    |
| **Clareza de CTAs**         | 6/10 | Excesso de caminhos na landing page           |
| **Feedback Visual**         | 8/10 | Skeleton, toasts e estados bem implementados  |

---

## 1. Análise dos Fluxos Principais

### 1.1 Fluxo: Landing Page → Páginas de Conteúdo

```
/pt → /pt/about
/pt → /pt/agents
/pt → /pt/manifesto
```

#### Estado Atual

| Aspecto                 | Implementação                                           | Problema                               |
| ----------------------- | ------------------------------------------------------- | -------------------------------------- |
| **Header**              | SimplifiedHeader na landing, HeaderV2 nas content pages | Transição abrupta de header            |
| **Navegação de volta**  | Link no footer apenas                                   | Não há breadcrumb ou back button       |
| **Consistência visual** | Mesma paleta de cores                                   | Background varia (gradiente vs sólido) |
| **Loading states**      | Nenhum (ISR)                                            | OK - páginas são estáticas             |

#### Comparação com GOV.UK Design System

| Padrão GOV.UK                   | Cidadão.AI              | Status      |
| ------------------------------- | ----------------------- | ----------- |
| Breadcrumbs em todas as páginas | Apenas no /app          | ❌ Faltando |
| Back link consistente           | Ausente                 | ❌ Faltando |
| Typography scale padronizada    | Variações entre páginas | ⚠️ Parcial  |
| Phase banner (alpha/beta)       | Ausente                 | ❌ Faltando |

#### Recomendações

1. **Adicionar breadcrumbs** nas páginas de conteúdo
2. **Manter header consistente** - SimplifiedHeader em todas ou transição suave
3. **Back link** no topo de cada página de conteúdo
4. **Phase banner** indicando que é projeto em desenvolvimento

---

### 1.2 Fluxo: Landing Page → Sistema Cidadão (App)

```
/pt → /pt/login → /pt/app → /pt/app/chat
```

#### Estado Atual

| Aspecto          | Implementação                    | Problema                      |
| ---------------- | -------------------------------- | ----------------------------- |
| **Autenticação** | OAuth Google + GitHub            | OK                            |
| **Onboarding**   | Toast de boas-vindas apenas      | Muito básico                  |
| **Dashboard**    | Cards com stats + navegação      | 3 de 4 features desabilitadas |
| **Chat**         | Seletor de agentes + empty state | Complexo para iniciantes      |

#### Jornada do Usuário Atual

```
1. Landing (CTA "Começar Agora")
   └── Login (OAuth)
       └── Dashboard (olá + stats mockados)
           └── Chat (17 agentes, qual escolher?)
               └── Conversa (sem tutorial)
```

#### Problemas Identificados

| Problema                    | Impacto                                                     | Severidade |
| --------------------------- | ----------------------------------------------------------- | ---------- |
| **Sem onboarding guiado**   | Usuário não sabe por onde começar                           | 🔴 Alta    |
| **Stats mockados**          | Dados não são reais, quebra confiança                       | 🔴 Alta    |
| **"Em Breve" excessivo**    | 3 cards de 4 desabilitados = sensação de produto incompleto | 🟡 Média   |
| **17 agentes sem contexto** | Qual agente usar? Paralisia de escolha                      | 🟡 Média   |
| **Header do AuthLayout**    | Diferente demais da landing                                 | 🟢 Baixa   |

#### Comparação com Padrões da Indústria

| Padrão                    | ChatGPT/Claude          | Cidadão.AI        | Gap |
| ------------------------- | ----------------------- | ----------------- | --- |
| Onboarding progressivo    | Tour interativo         | Ausente           | ❌  |
| Empty state com sugestões | Sim, contextual         | Sim, mas genérico | ⚠️  |
| Feedback de ações         | Streaming + typing      | Streaming OK      | ✅  |
| Histórico de conversas    | Sidebar                 | Implementado      | ✅  |
| Personalização            | Instruções customizadas | Ausente           | ❌  |

#### Recomendações

1. **Onboarding Tour** - Guiar usuário pelo dashboard e chat
2. **Remover ou ocultar features "Em Breve"** - Mostrar apenas o que funciona
3. **Agente recomendado** - Sugerir Abaporu como ponto de partida
4. **Stats reais ou remover** - Não mostrar dados mockados
5. **Quick start** - "Pergunte sobre gastos da sua cidade" como primeiro passo

---

### 1.3 Fluxo: Landing Page → Sistema Ágora

```
/pt → /pt/agora/login → /pt/agora/selecao → /pt/agora (dashboard)
                                          → /pt/agora/kids (modo kids)
```

#### Estado Atual

| Aspecto               | Implementação                   | Problema                       |
| --------------------- | ------------------------------- | ------------------------------ |
| **Entrada**           | Login separado do app principal | Confuso - dois logins?         |
| **Seleção de modo**   | Aprendiz vs Kids                | OK, mas poderia ser automático |
| **Dashboard**         | XP, badges, trilhas             | Gamificação bem implementada   |
| **Bottom Navigation** | 5 tabs mobile                   | OK                             |
| **Kids Mode**         | Proteção LGPD, consent parental | Bem estruturado                |

#### Problemas de Navegação

| Problema                        | Descrição                                      |
| ------------------------------- | ---------------------------------------------- |
| **Dois sistemas de login**      | `/pt/login` (App) vs `/pt/agora/login` (Ágora) |
| **Sem cross-linking**           | Usuário no App não sabe que Ágora existe       |
| **Identidade visual diferente** | Ágora usa amarelo/laranja, App usa verde/azul  |
| **BottomNav vs Sidebar**        | Mobile experiences completamente diferentes    |

#### Comparação com EdTech (Duolingo, Khan Academy)

| Padrão                   | Duolingo              | Cidadão.AI Ágora     | Gap |
| ------------------------ | --------------------- | -------------------- | --- |
| Progresso visual         | XP bar always visible | Badge modal separado | ⚠️  |
| Streak reminder          | Push + in-app         | Apenas in-app        | ⚠️  |
| Onboarding adaptativo    | 5 telas contextuais   | Ausente              | ❌  |
| Daily goal               | Sim, customizável     | Ausente              | ❌  |
| Achievements celebration | Confetti + sound      | Modal simples        | ⚠️  |

#### Recomendações

1. **Unificar autenticação** - Single Sign-On entre App e Ágora
2. **Menu de sistemas** - Permitir navegação entre App ↔ Ágora
3. **Progress bar persistente** - XP sempre visível no header
4. **Onboarding Ágora** - Tour pelos recursos de gamificação
5. **Daily reminder** - Meta diária de aprendizado

---

## 2. Análise de Consistência Visual

### 2.1 Paleta de Cores

| Sistema           | Cores Primárias                 | Gradientes                     |
| ----------------- | ------------------------------- | ------------------------------ |
| **Landing**       | Verde + Amarelo + Azul (Brasil) | `from-green-600 to-blue-600`   |
| **App**           | Verde + Azul                    | `from-green-500 to-blue-600`   |
| **Ágora**         | Amarelo + Laranja               | `academy-gradient` (amber-500) |
| **Content Pages** | Verde + Azul                    | Mesma da landing               |

**Problema:** Ágora tem identidade visual separada. Isso é intencional (EdTech feel) ou inconsistência?

### 2.2 Tipografia

| Elemento | Landing | App   | Ágora |
| -------- | ------- | ----- | ----- |
| **H1**   | 5xl-8xl | 4xl   | 4xl   |
| **H2**   | 3xl-4xl | 2xl   | 2xl   |
| **Body** | lg-xl   | base  | base  |
| **Font** | Inter   | Inter | Inter |

**Problema:** Landing usa tipografia maior (marketing), mas a transição é abrupta.

### 2.3 Componentes de Card

| Tipo                     | Uso                   | Visual                            |
| ------------------------ | --------------------- | --------------------------------- |
| **GlassCard**            | App dashboard, modals | Frosted glass, `backdrop-blur-md` |
| **Card (feature cards)** | Landing               | Gradient backgrounds              |
| **Card (content)**       | Agents, About         | Border + shadow                   |
| **CardV2**               | Design system         | CVA variants                      |

**Problema:** 4 tipos diferentes de cards em uso. Deveria haver consolidação.

### 2.4 Botões

| Variant       | Uso               | Consistência     |
| ------------- | ----------------- | ---------------- |
| **Primary**   | CTAs principais   | ✅ Consistente   |
| **Secondary** | Ações secundárias | ✅ Consistente   |
| **Ghost**     | Links inline      | ✅ Consistente   |
| **Gradient**  | Hero CTAs         | ⚠️ Só na landing |

**Problema:** Botões gradiente só existem na landing. CTAs importantes no app são solid color.

---

## 3. Análise de Navegação

### 3.1 Estrutura de Headers

```
┌─────────────────────────────────────────────────────────────┐
│ SimplifiedHeader                                             │
│ [Logo] [Cidadão.AI]                    [PT/EN] [Theme] [Login]│
├─────────────────────────────────────────────────────────────┤
│ Usado em: /pt, /en, /pt/login, /en/login                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ HeaderV2 (Full Navigation)                                   │
│ [Logo] [Sobre] [Agentes] [Manifesto] [API]  [PT/EN] [Theme]  │
├─────────────────────────────────────────────────────────────┤
│ Usado em: /pt/about, /pt/agents, /pt/manifesto               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ AuthLayout Header                                            │
│ [Logo] [Search...] [Notifications] [User Menu]               │
│ ─────────────────────────────────────────────────────────── │
│ [Dashboard] [Chat] [Investigações] [...]                     │
├─────────────────────────────────────────────────────────────┤
│ Usado em: /pt/app/*                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ AgoraHeader                                                  │
│ [Logo] [Ágora]          [XP Badge] [User Menu]               │
├─────────────────────────────────────────────────────────────┤
│ Usado em: /pt/agora/*                                        │
└─────────────────────────────────────────────────────────────┘
```

**Problema:** 4 headers diferentes = 4 experiências de navegação diferentes.

### 3.2 Mobile Navigation

| Sistema           | Implementação     | Padrão       |
| ----------------- | ----------------- | ------------ |
| **Landing**       | Hamburger menu    | Drawer       |
| **Content Pages** | Hamburger menu    | Drawer       |
| **App**           | Hamburger menu    | Drawer       |
| **Ágora**         | Bottom Navigation | 5 tabs fixas |

**Problema:** Inconsistência entre App (drawer) e Ágora (bottom nav).

### 3.3 Breadcrumbs

| Rota                         | Breadcrumb                    | Status          |
| ---------------------------- | ----------------------------- | --------------- |
| `/pt/app/chat`               | `Home > Chat`                 | ✅ Implementado |
| `/pt/app/investigacoes/[id]` | `Home > Investigações > [id]` | ✅ Implementado |
| `/pt/about`                  | Ausente                       | ❌ Faltando     |
| `/pt/agora/trilhas/[id]`     | Ausente                       | ❌ Faltando     |

---

## 4. Análise de UX por Fluxo

### 4.1 Primeiro Acesso (New User Journey)

```
Atual:
Landing → "Começar Agora" → Login → Dashboard → ???

Problema: Usuário não sabe o que fazer após login.

Ideal (benchmark ChatGPT):
Landing → Login → Tutorial (3 steps) → Primeira conversa guiada → Dashboard
```

### 4.2 Fluxo de Chat

```
Atual:
Dashboard → "Chat com IAs" → Seletor de Agentes → Escolher 1 de 17 → Conversar

Problemas:
1. 17 agentes é overwhelming
2. Não há recomendação inicial
3. Empty state genérico
4. Sem histórico destacado
```

### 4.3 Fluxo Ágora

```
Atual:
Landing → Card "Ágora" → Login separado → Seleção Modo → Dashboard → Trilhas

Problemas:
1. Login duplicado
2. Seleção de modo poderia ser após tour
3. Dashboard não destaca próxima ação
4. Trilhas não mostram progresso no card
```

---

## 5. Comparação com Design Systems de Referência

### 5.1 GOV.UK Design System

| Componente       | GOV.UK               | Cidadão.AI       | Ação Necessária   |
| ---------------- | -------------------- | ---------------- | ----------------- |
| Typography scale | 6 sizes definidos    | Variável         | Padronizar        |
| Spacing units    | 8px base             | Tailwind default | OK                |
| Focus states     | 3px yellow outline   | 2px green ring   | OK                |
| Error messages   | Always with icon     | Parcial          | Adicionar ícones  |
| Form validation  | Inline + summary     | Inline apenas    | Adicionar summary |
| Back link        | Sempre presente      | Apenas no app    | Adicionar         |
| Phase banner     | Alpha/Beta indicator | Ausente          | Adicionar         |

### 5.2 USWDS (U.S. Web Design System)

| Componente       | USWDS                 | Cidadão.AI   | Ação Necessária      |
| ---------------- | --------------------- | ------------ | -------------------- |
| Banner component | "Official gov site"   | Ausente      | Considerar adicionar |
| Identifier       | Agency identification | Logo + nome  | OK                   |
| Alert component  | 4 variants            | Toast system | OK                   |
| Card layouts     | 3 patterns            | 4+ variações | Consolidar           |
| Navigation       | Mega menu option      | Drawer       | Avaliar              |

### 5.3 Material Design 3

| Componente      | Material 3          | Cidadão.AI      | Ação Necessária     |
| --------------- | ------------------- | --------------- | ------------------- |
| Color tokens    | Dynamic theming     | Static colors   | Considerar          |
| Motion          | Standardized easing | Definido        | ✅ OK               |
| Elevation       | 5 levels            | Shadow classes  | OK                  |
| FAB             | Floating action     | Ausente         | Avaliar para mobile |
| Snackbar        | Bottom toast        | Top-right toast | Avaliar posição     |
| Navigation rail | Side nav            | Drawer + bottom | Inconsistente       |

---

## 6. Matriz de Priorização

### Alta Prioridade (Impacto Alto, Esforço Baixo/Médio)

| Item                         | Impacto | Esforço | Ação                           |
| ---------------------------- | ------- | ------- | ------------------------------ |
| Remover/ocultar "Em Breve"   | Alto    | Baixo   | Mostrar só features funcionais |
| Onboarding tour              | Alto    | Médio   | Guiar primeiro uso             |
| Unificar login App/Ágora     | Alto    | Médio   | Single auth context            |
| Breadcrumbs em content pages | Médio   | Baixo   | Adicionar componente           |
| Progress bar XP visível      | Médio   | Baixo   | Mover para header              |

### Média Prioridade (Impacto Médio, Esforço Médio)

| Item               | Impacto | Esforço | Ação                    |
| ------------------ | ------- | ------- | ----------------------- |
| Consolidar cards   | Médio   | Médio   | Usar CardV2 everywhere  |
| Agente recomendado | Médio   | Baixo   | Highlight Abaporu       |
| Daily goal Ágora   | Médio   | Médio   | Implementar sistema     |
| Back link pattern  | Médio   | Baixo   | Componente reutilizável |
| Header unificado   | Médio   | Alto    | Redesign necessário     |

### Baixa Prioridade (Impacto Baixo ou Esforço Alto)

| Item                    | Impacto | Esforço | Ação          |
| ----------------------- | ------- | ------- | ------------- |
| Phase banner            | Baixo   | Baixo   | Considerar    |
| Navigation rail desktop | Baixo   | Alto    | Manter atual  |
| Dynamic color theming   | Baixo   | Alto    | Manter atual  |
| Mega menu               | Baixo   | Alto    | Manter drawer |

---

## 7. Recomendações Finais

### 7.1 Quick Wins (Implementar Imediatamente)

1. **Ocultar cards "Em Breve"** no dashboard do App
2. **Adicionar breadcrumbs** nas páginas `/about`, `/agents`, `/manifesto`
3. **Destacar Abaporu** como agente inicial recomendado
4. **Progress bar XP** sempre visível no header do Ágora

### 7.2 Melhorias de Curto Prazo (1-2 sprints)

1. **Onboarding tour** com react-joyride ou similar
2. **Unificar autenticação** App + Ágora com context compartilhado
3. **Consolidar cards** para usar CardV2 em todo o sistema
4. **Menu de sistemas** permitindo navegar App ↔ Ágora

### 7.3 Melhorias de Médio Prazo (3-4 sprints)

1. **Redesign do header** com navegação unificada
2. **Sistema de daily goals** no Ágora
3. **Personalização de agentes** (favoritos, ordem)
4. **Dashboard com dados reais** ou remover completamente

### 7.4 Considerações de Longo Prazo

1. **Design system documentation** completa em Storybook
2. **User testing** com usuários reais para validar mudanças
3. **Analytics de comportamento** para identificar drop-offs
4. **A/B testing** para otimizar conversões

---

## 8. Conclusão

O Cidadão.AI possui uma base sólida de UI com boa acessibilidade (WCAG AAA) e componentes bem estruturados. Os principais gaps estão na **consistência entre sistemas** (App vs Ágora) e na **experiência de primeiro uso** (onboarding).

A implementação de quick wins pode melhorar significativamente a percepção do usuário sem grande esforço de desenvolvimento. A unificação da autenticação e navegação deve ser prioridade para criar uma experiência coesa.

### Próximos Passos Recomendados

1. Validar esta análise com stakeholders
2. Priorizar quick wins para implementação imediata
3. Planejar sprint de UX para melhorias de curto prazo
4. Agendar user testing após implementação

---

_Documento gerado como parte da análise de qualidade do projeto Cidadão.AI._
