# Badges e Conquistas

> Sistema completo de badges da Agora Academy

---

## 1. Visao Geral

Badges sao conquistas visuais que reconhecem marcos importantes na jornada do estudante. Cada badge possui criterios especificos, recompensa em XP e significado pedagogico.

### 1.1 Proposito dos Badges

```
+------------------------------------------------------------------+
|                    FUNCOES DOS BADGES                             |
+------------------------------------------------------------------+
|                                                                    |
|  1. RECONHECIMENTO  - Validar conquistas do estudante             |
|  2. MOTIVACAO       - Criar metas de curto prazo                  |
|  3. ORIENTACAO      - Guiar comportamentos desejaveis             |
|  4. IDENTIDADE      - Construir senso de pertencimento            |
|  5. PORTFOLIO       - Evidencia de competencias                   |
|                                                                    |
+------------------------------------------------------------------+
```

---

## 2. Badges Implementados

### 2.1 Tier 1 - Iniciante (Facilmente Alcancaveis)

| Badge          | Emoji | Nome           | Criterio       | XP  | Pedagogico          |
| -------------- | ----- | -------------- | -------------- | --- | ------------------- |
| pioneiro       | 🚀    | Pioneiro       | Primeiro login | 25  | Boas-vindas         |
| curioso        | 🔍    | Curioso        | 100+ XP        | 15  | Engajamento inicial |
| primeiro-passo | 👣    | Primeiro Passo | 1+ sessao      | 20  | Habito de estudo    |

**Codigo de Implementacao**:

```typescript
// hooks/use-agora.tsx:157-188
{
  id: 'pioneiro',
  type: 'pioneiro',
  name: 'Pioneiro',
  description: 'Primeiro login na Agora',
  emoji: '🚀',
  criteria: 'Primeiro login',
  xpReward: 25,
  check: () => true, // Automatico no primeiro login
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
  description: 'Completou a primeira sessao de estudo',
  emoji: '👣',
  criteria: '1+ sessao',
  xpReward: 20,
  check: (user: AgoraUser) => user.totalSessions >= 1,
},
```

### 2.2 Tier 2 - Intermediario

| Badge       | Emoji | Nome        | Criterio                | XP  | Pedagogico   |
| ----------- | ----- | ----------- | ----------------------- | --- | ------------ |
| explorador  | 🧭    | Explorador  | 5+ sessoes              | 30  | Consistencia |
| japaguri    | 🍜    | Japaguri    | 3+ streak OU 5+ sessoes | 50  | Assiduidade  |
| estudioso   | 📚    | Estudioso   | 500+ XP                 | 40  | Dedicacao    |
| maratonista | 🏃    | Maratonista | 60+ minutos             | 35  | Foco         |

**Nota Cultural**: O badge "Japaguri" faz referencia ao prato coreano popularizado no filme "Parasita", simbolizando a fusao de ingredientes simples em algo especial - assim como a combinacao de pequenos esforcos diarios resulta em grande aprendizado.

### 2.3 Tier 3 - Avancado

| Badge       | Emoji | Nome        | Criterio        | XP  | Pedagogico   |
| ----------- | ----- | ----------- | --------------- | --- | ------------ |
| dedicado    | ⭐    | Dedicado    | 7+ dias streak  | 75  | Disciplina   |
| veterano    | 🎖️    | Veterano    | 20+ sessoes     | 60  | Experiencia  |
| scholar     | 🎓    | Scholar     | 1000+ XP        | 75  | Conhecimento |
| persistente | 💪    | Persistente | 14+ dias streak | 100 | Resiliencia  |

### 2.4 Tier 4 - Elite

| Badge     | Emoji | Nome      | Criterio        | XP  | Pedagogico        |
| --------- | ----- | --------- | --------------- | --- | ----------------- |
| mestre    | 👑    | Mestre    | 2500+ XP        | 150 | Maestria          |
| lenda     | 🏆    | Lenda     | 30+ dias streak | 200 | Excelencia        |
| centuriao | ⚔️    | Centuriao | 100+ sessoes    | 250 | Dedicacao extrema |
| iluminado | ✨    | Iluminado | 5000+ XP        | 300 | Transcendencia    |

---

## 3. Sistema de Verificacao

### 3.1 Fluxo de Verificacao

```
Acao do Usuario
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
Badge      Badge nao
elegivel    elegivel
|             |
v             |
Persistir     |
no Supabase   |
|             |
v             |
Celebracao <--+
```

### 3.2 Codigo de Verificacao

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

      // 4. Adicionar XP bonus
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

## 4. Visualizacao de Badges

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

### 4.2 Celebracao de Badge

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
      description: 'Voce conquistou um novo badge!',
      xpReward: xpReward,
    },
  })
}
```

---

## 5. Badges Propostos

### 5.1 Badges de Competencia (Prioridade Alta)

| Badge        | Emoji | Nome            | Criterio                 | XP  | Justificativa          |
| ------------ | ----- | --------------- | ------------------------ | --- | ---------------------- |
| code-quality | 💎    | Codigo Limpo    | PR aprovado sem revisoes | 100 | Qualidade > quantidade |
| helper       | 🤝    | Colaborador     | Ajudar 3 colegas no chat | 75  | Aprendizagem social    |
| debugger     | 🔧    | Cacador de Bugs | Corrigir bug documentado | 80  | Resolucao de problemas |
| documenter   | 📝    | Documentador    | PR com docs completas    | 60  | Comunicacao tecnica    |
| reviewer     | 👁️    | Revisor         | 5 code reviews aceitos   | 90  | Pensamento critico     |

### 5.2 Badges de Trilha (Prioridade Media)

| Badge           | Emoji | Nome               | Criterio             | XP  | Trilha     |
| --------------- | ----- | ------------------ | -------------------- | --- | ---------- |
| intro-complete  | 🎯    | Iniciado           | Completar Introducao | 100 | Introducao |
| backend-hero    | 🖥️    | Heroi do Backend   | Completar Backend    | 200 | Backend    |
| frontend-master | 🎨    | Mestre do Frontend | Completar Frontend   | 200 | Frontend   |
| ai-wizard       | 🧙    | Mago da IA         | Completar IA/ML      | 250 | IA/ML      |
| devops-ninja    | 🥷    | Ninja DevOps       | Completar DevOps     | 200 | DevOps     |
| full-stack      | 🦄    | Unicornio          | Completar 3+ trilhas | 500 | Multi      |

### 5.3 Badges de Evento (Prioridade Baixa)

| Badge       | Emoji | Nome              | Criterio                 | XP  | Tipo           |
| ----------- | ----- | ----------------- | ------------------------ | --- | -------------- |
| early-bird  | 🐦    | Early Adopter     | Cadastro no primeiro mes | 50  | Temporal       |
| hackathon   | 🏅    | Hackathonista     | Participar de hackathon  | 100 | Evento         |
| beta-tester | 🧪    | Beta Tester       | Reportar bug valido      | 75  | Contribuicao   |
| mentor-pick | ⭐    | Escolha do Mentor | Destaque do mes          | 150 | Reconhecimento |

### 5.4 Badges Secretos

| Badge           | Emoji | Nome                       | Criterio                     | XP  | Descoberta |
| --------------- | ----- | -------------------------- | ---------------------------- | --- | ---------- |
| night-owl       | 🦉    | Coruja                     | 10 sessoes apos meia-noite   | 50  | Secreto    |
| weekend-warrior | 🗡️    | Guerreiro de Fim de Semana | 20 sessoes no fim de semana  | 60  | Secreto    |
| speed-runner    | ⚡    | Speed Runner               | Completar trilha em 1 semana | 100 | Secreto    |
| perfectionist   | 💯    | Perfeccionista             | 100% em todos os quizzes     | 150 | Secreto    |

---

## 6. Metricas de Badges

### 6.1 Distribuicao Ideal

```
Tier 1 (Iniciante):  70% dos usuarios
Tier 2 (Intermediario): 40% dos usuarios
Tier 3 (Avancado): 15% dos usuarios
Tier 4 (Elite): 5% dos usuarios
Secretos: <1% dos usuarios
```

### 6.2 KPIs

| Metrica               | Descricao                              | Meta |
| --------------------- | -------------------------------------- | ---- |
| Taxa de 1o Badge      | % usuarios com pelo menos 1 badge      | >90% |
| Badges/Usuario        | Media de badges por usuario ativo      | 4-6  |
| Tempo para Tier 2     | Dias medios para primeiro badge Tier 2 | 7-14 |
| Engajamento pos-badge | Retorno em 7 dias apos badge           | >60% |

---

## 7. Implementacao Tecnica

### 7.1 Schema do Banco

```sql
-- Badges sao armazenados como array em agora_profiles
badges TEXT[] DEFAULT '{}'

-- Exemplo de valor
badges = ['pioneiro', 'curioso', 'primeiro-passo', 'japaguri']
```

### 7.2 Migracao para Tabela Separada (Proposta)

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
-- 3. Historico de conquistas
-- 4. Rankings por badge especifico
```

---

## 8. Celebracao Visual

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
|   | "Assiduo: 3+ dias     |      |
|   |  seguidos"            |      |
|   |                       |      |
|   +-----------------------+      |
|                                  |
|        +50 XP                    |
|                                  |
|      [ INCRIVEL! ]               |
|                                  |
+----------------------------------+
```

### 8.2 Confetti Animation

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

## 9. Integracao com Outras Features

### 9.1 Perfil do Usuario

- Badges exibidos no perfil publico
- Opção de destacar badges favoritos
- Historico de conquistas

### 9.2 Ranking

- Filtro por badges especificos
- Leaderboard de badges raros
- Destaques semanais

### 9.3 Certificado

- Badges relevantes listados no certificado
- QR code para verificacao
- Selo especial para badges de elite

---

## 10. Referencias

- Hamari, J. (2017). Do badges increase user activity? A field experiment on the effects of gamification. Computers in Human Behavior.
- Antin, J. & Churchill, E. (2011). Badges in Social Media: A Social Psychological Perspective. CHI 2011.
- Denny, P. (2013). The Effect of Virtual Achievements on Student Engagement. CHI 2013.

---

**Autor**: Anderson Henrique da Silva
**Ultima atualizacao**: 2025-12-09
**Codigo fonte**: `hooks/use-agora.tsx:157-315`, `components/agora/badge-showcase.tsx`
