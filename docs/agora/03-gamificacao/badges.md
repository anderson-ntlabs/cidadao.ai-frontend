# Badges e Conquistas

> Sistema completo de badges da Ágora Academy

---

## 1. Visão Geral

Badges são conquistas visuais que reconhecem marcos importantes na jornada do estudante. Cada badge possui critérios específicos, recompensa em XP e significado pedagógico.

### 1.1 Propósito dos Badges

```
+------------------------------------------------------------------+
|                    FUNÇÕES DOS BADGES                             |
+------------------------------------------------------------------+
|                                                                    |
|  1. RECONHECIMENTO  - Validar conquistas do estudante             |
|  2. MOTIVAÇÃO       - Criar metas de curto prazo                  |
|  3. ORIENTAÇÃO      - Guiar comportamentos desejáveis             |
|  4. IDENTIDADE      - Construir senso de pertencimento            |
|  5. PORTFÓLIO       - Evidência de competências                   |
|                                                                    |
+------------------------------------------------------------------+
```

---

## 2. Badges Implementados

### 2.1 Tier 1 - Iniciante (Facilmente Alcançáveis)

| Badge          | Emoji | Nome           | Critério       | XP  | Pedagógico          |
| -------------- | ----- | -------------- | -------------- | --- | ------------------- |
| pioneiro       | 🚀    | Pioneiro       | Primeiro login | 25  | Boas-vindas         |
| curioso        | 🔍    | Curioso        | 100+ XP        | 15  | Engajamento inicial |
| primeiro-passo | 👣    | Primeiro Passo | 1+ sessão      | 20  | Hábito de estudo    |

**Código de Implementação**:

```typescript
// hooks/use-agora.tsx:157-188
{
  id: 'pioneiro',
  type: 'pioneiro',
  name: 'Pioneiro',
  description: 'Primeiro login na Ágora',
  emoji: '🚀',
  criteria: 'Primeiro login',
  xpReward: 25,
  check: () => true, // Automático no primeiro login
},
{
  id: 'curioso',
  type: 'curioso',
  name: 'Curioso',
  description: 'Acumulou 100 XP',
  emoji: '🔍',
  criteria: '100+ XP',
  xpReward: 15,
  check: (user: AgoraUser) => user.totalXp >= 100,
},
{
  id: 'primeiro-passo',
  type: 'primeiro-passo',
  name: 'Primeiro Passo',
  description: 'Completou a primeira sessão de estudo',
  emoji: '👣',
  criteria: '1+ sessão',
  xpReward: 20,
  check: (user: AgoraUser) => user.totalSessions >= 1,
},
```

### 2.2 Tier 2 - Intermediário

| Badge       | Emoji | Nome        | Critério                | XP  | Pedagógico   |
| ----------- | ----- | ----------- | ----------------------- | --- | ------------ |
| explorador  | 🧭    | Explorador  | 5+ sessões              | 30  | Consistência |
| japaguri    | 🍜    | Japaguri    | 3+ streak OU 5+ sessões | 50  | Assiduidade  |
| estudioso   | 📚    | Estudioso   | 500+ XP                 | 40  | Dedicação    |
| maratonista | 🏃    | Maratonista | 60+ minutos             | 35  | Foco         |

**Nota Cultural**: O badge "Japaguri" faz referência ao prato coreano popularizado no filme "Parasita", simbolizando a fusão de ingredientes simples em algo especial - assim como a combinação de pequenos esforços diários resulta em grande aprendizado.

### 2.3 Tier 3 - Avançado

| Badge       | Emoji | Nome        | Critério        | XP  | Pedagógico   |
| ----------- | ----- | ----------- | --------------- | --- | ------------ |
| dedicado    | ⭐    | Dedicado    | 7+ dias streak  | 75  | Disciplina   |
| veterano    | 🎖️    | Veterano    | 20+ sessões     | 60  | Experiência  |
| scholar     | 🎓    | Scholar     | 1000+ XP        | 75  | Conhecimento |
| persistente | 💪    | Persistente | 14+ dias streak | 100 | Resiliência  |

### 2.4 Tier 4 - Elite

| Badge     | Emoji | Nome      | Critério        | XP  | Pedagógico        |
| --------- | ----- | --------- | --------------- | --- | ----------------- |
| mestre    | 👑    | Mestre    | 2500+ XP        | 150 | Maestria          |
| lenda     | 🏆    | Lenda     | 30+ dias streak | 200 | Excelência        |
| centurião | ⚔️    | Centurião | 100+ sessões    | 250 | Dedicação extrema |
| iluminado | ✨    | Iluminado | 5000+ XP        | 300 | Transcendência    |

---

## 3. Sistema de Verificação

### 3.1 Fluxo de Verificação

```
Ação do Usuário
       |
       v
  addXp() ou
  endSession()
       |
       v
checkAndAwardBadges()
       |
       v
+------+------+
|             |
v             v
Badge      Badge não
elegível    elegível
|             |
v             |
Persistir     |
no Supabase   |
|             |
v             |
Celebração <--+
```

### 3.2 Código de Verificação

```typescript
// hooks/use-agora.tsx:1177-1233
const checkAndAwardBadges = useCallback(async () => {
  if (!user) return

  try {
    // 1. Buscar badges atuais
    const { data: profile } = await supabase
      .from('agora_profiles')
      .select('badges')
      .eq('user_id', user.id)
      .single()

    const currentBadges: string[] = (profile?.badges as string[]) || []
    const newBadgeIds: string[] = []
    let bonusXp = 0

    // 2. Verificar cada badge
    for (const badge of BADGE_DEFINITIONS) {
      if (currentBadges.includes(badge.id)) continue
      if (badge.check(user)) {
        newBadgeIds.push(badge.id)
        bonusXp += badge.xpReward
        trackBadgeEarned(badge.id, badge.name)
      }
    }

    // 3. Persistir novos badges
    if (newBadgeIds.length > 0) {
      await supabase
        .from('agora_profiles')
        .update({ badges: [...currentBadges, ...newBadgeIds] })
        .eq('user_id', user.id)

      // 4. Adicionar XP bônus
      if (bonusXp > 0) {
        await addXp(bonusXp, 'badge', `Badges conquistados: ${newBadgeIds.join(', ')}`)
      }

      // 5. Celebrar cada badge
      for (const badge of newBadges) {
        useCelebrationStore.getState().celebrateBadge(badge.name, badge.emoji, 0)
      }
    }
  } catch (error) {
    logger.error('Failed to check badges', { error })
  }
}, [user, supabase, addXp])
```

---

## 4. Visualização de Badges

### 4.1 Componente BadgeShowcase

```typescript
// components/agora/badge-showcase.tsx

// Badge conquistado
<div className="flex items-center gap-4 p-4 rounded-xl
  bg-gradient-to-r from-yellow-50/80 to-amber-50/80
  dark:from-yellow-900/20 dark:to-amber-900/20">
  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl">
    {badge.emoji}
  </div>
  <div>
    <p className="font-bold">{badge.name}</p>
    <p className="text-xs">{badge.criteria}</p>
  </div>
  <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
</div>

// Badge bloqueado
<div className="relative opacity-40 grayscale">
  <div className="text-2xl">{badge.emoji}</div>
  <Lock className="absolute inset-0 w-4 h-4" />
</div>
```

### 4.2 Celebração de Badge

```typescript
// store/celebration-store.ts
celebrateBadge: (badgeName, emoji, xpReward) => {
  set({
    isOpen: true,
    celebration: {
      type: 'badge',
      title: 'Novo Badge!',
      subtitle: badgeName,
      emoji: emoji,
      description: 'Você conquistou um novo badge!',
      xpReward: xpReward,
    },
  })
}
```

---

## 5. Badges Propostos

### 5.1 Badges de Competência (Prioridade Alta)

| Badge        | Emoji | Nome            | Critério                 | XP  | Justificativa          |
| ------------ | ----- | --------------- | ------------------------ | --- | ---------------------- |
| code-quality | 💎    | Código Limpo    | PR aprovado sem revisões | 100 | Qualidade > quantidade |
| helper       | 🤝    | Colaborador     | Ajudar 3 colegas no chat | 75  | Aprendizagem social    |
| debugger     | 🔧    | Caçador de Bugs | Corrigir bug documentado | 80  | Resolução de problemas |
| documenter   | 📝    | Documentador    | PR com docs completas    | 60  | Comunicação técnica    |
| reviewer     | 👁️    | Revisor         | 5 code reviews aceitos   | 90  | Pensamento crítico     |

### 5.2 Badges de Trilha (Prioridade Média)

| Badge           | Emoji | Nome               | Critério             | XP  | Trilha     |
| --------------- | ----- | ------------------ | -------------------- | --- | ---------- |
| intro-complete  | 🎯    | Iniciado           | Completar Introdução | 100 | Introdução |
| backend-hero    | 🖥️    | Herói do Backend   | Completar Backend    | 200 | Backend    |
| frontend-master | 🎨    | Mestre do Frontend | Completar Frontend   | 200 | Frontend   |
| ai-wizard       | 🧙    | Mago da IA         | Completar IA/ML      | 250 | IA/ML      |
| devops-ninja    | 🥷    | Ninja DevOps       | Completar DevOps     | 200 | DevOps     |
| full-stack      | 🦄    | Unicórnio          | Completar 3+ trilhas | 500 | Multi      |

### 5.3 Badges de Evento (Prioridade Baixa)

| Badge       | Emoji | Nome              | Critério                 | XP  | Tipo           |
| ----------- | ----- | ----------------- | ------------------------ | --- | -------------- |
| early-bird  | 🐦    | Early Adopter     | Cadastro no primeiro mês | 50  | Temporal       |
| hackathon   | 🏅    | Hackathonista     | Participar de hackathon  | 100 | Evento         |
| beta-tester | 🧪    | Beta Tester       | Reportar bug válido      | 75  | Contribuição   |
| mentor-pick | ⭐    | Escolha do Mentor | Destaque do mês          | 150 | Reconhecimento |

### 5.4 Badges Secretos

| Badge           | Emoji | Nome                       | Critério                     | XP  | Descoberta |
| --------------- | ----- | -------------------------- | ---------------------------- | --- | ---------- |
| night-owl       | 🦉    | Coruja                     | 10 sessões após meia-noite   | 50  | Secreto    |
| weekend-warrior | 🗡️    | Guerreiro de Fim de Semana | 20 sessões no fim de semana  | 60  | Secreto    |
| speed-runner    | ⚡    | Speed Runner               | Completar trilha em 1 semana | 100 | Secreto    |
| perfectionist   | 💯    | Perfeccionista             | 100% em todos os quizzes     | 150 | Secreto    |

---

## 6. Métricas de Badges

### 6.1 Distribuição Ideal

```
Tier 1 (Iniciante):  70% dos usuários
Tier 2 (Intermediário): 40% dos usuários
Tier 3 (Avançado): 15% dos usuários
Tier 4 (Elite): 5% dos usuários
Secretos: <1% dos usuários
```

### 6.2 KPIs

| Métrica               | Descrição                              | Meta |
| --------------------- | -------------------------------------- | ---- |
| Taxa de 1º Badge      | % usuários com pelo menos 1 badge      | >90% |
| Badges/Usuário        | Média de badges por usuário ativo      | 4-6  |
| Tempo para Tier 2     | Dias médios para primeiro badge Tier 2 | 7-14 |
| Engajamento pós-badge | Retorno em 7 dias após badge           | >60% |

---

## 7. Implementação Técnica

### 7.1 Schema do Banco

```sql
-- Badges são armazenados como array em agora_profiles
badges TEXT[] DEFAULT '{}'

-- Exemplo de valor
badges = ['pioneiro', 'curioso', 'primeiro-passo', 'japaguri']
```

### 7.2 Migração para Tabela Separada (Proposta)

```sql
-- Proposta: tabela separada para mais flexibilidade
CREATE TABLE agora_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  UNIQUE(user_id, badge_id)
);

-- Permite:
-- 1. Queries mais eficientes
-- 2. Metadata por badge (ex: qual PR desbloqueou)
-- 3. Histórico de conquistas
-- 4. Rankings por badge específico
```

---

## 8. Celebração Visual

### 8.1 Modal de Badge

```
+----------------------------------+
|                                  |
|         🏆                       |
|     NOVO BADGE!                  |
|                                  |
|   +-----------------------+      |
|   |                       |      |
|   |       🍜              |      |
|   |                       |      |
|   |     Japaguri          |      |
|   |                       |      |
|   | "Assíduo: 3+ dias     |      |
|   |  seguidos"            |      |
|   |                       |      |
|   +-----------------------+      |
|                                  |
|        +50 XP                    |
|                                  |
|      [ INCRÍVEL! ]               |
|                                  |
+----------------------------------+
```

### 8.2 Animação de Confetti

```css
/* components/agora/celebration-modal.tsx */
@keyframes confetti-fall {
  0% {
    transform: translateY(-100%) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.animate-confetti-fall {
  animation: confetti-fall var(--duration) ease-out forwards;
  animation-delay: var(--delay);
}
```

---

## 9. Integração com Outras Features

### 9.1 Perfil do Usuário

- Badges exibidos no perfil público
- Opção de destacar badges favoritos
- Histórico de conquistas

### 9.2 Ranking

- Filtro por badges específicos
- Leaderboard de badges raros
- Destaques semanais

### 9.3 Certificado

- Badges relevantes listados no certificado
- QR code para verificação
- Selo especial para badges de elite

---

## 10. Referências

- Hamari, J. (2017). Do badges increase user activity? A field experiment on the effects of gamification. Computers in Human Behavior.
- Antin, J. & Churchill, E. (2011). Badges in Social Media: A Social Psychological Perspective. CHI 2011.
- Denny, P. (2013). The Effect of Virtual Achievements on Student Engagement. CHI 2013.

---

**Autor**: Anderson Henrique da Silva
**Última atualização**: 2025-12-09
**Código fonte**: `hooks/use-agora.tsx:157-315`, `components/agora/badge-showcase.tsx`
