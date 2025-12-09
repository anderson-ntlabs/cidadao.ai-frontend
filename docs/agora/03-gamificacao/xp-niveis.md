# Sistema de XP e Níveis

> Documentação completa do sistema de progressão da Ágora Academy

---

## 1. Visão Geral

O sistema de XP (Experience Points) é o mecanismo central de progressão na Ágora Academy. Ele quantifica o engajamento e aprendizado do estudante, desbloqueando níveis, ranks e recompensas.

### 1.1 Princípios do Sistema

```
+------------------------------------------------------------------+
|                    PRINCÍPIOS DE DESIGN                          |
+------------------------------------------------------------------+
|                                                                    |
|  1. JUSTO        - Mesmas regras para todos                       |
|  2. TRANSPARENTE - Fórmulas públicas e claras                     |
|  3. MOTIVADOR    - Recompensas frequentes e significativas        |
|  4. BALANCEADO   - Nem fácil demais, nem impossível               |
|  5. PEDAGÓGICO   - XP alinhado a objetivos de aprendizagem        |
|                                                                    |
+------------------------------------------------------------------+
```

---

## 2. Fontes de XP

### 2.1 Tabela Completa de Fontes

| Categoria      | Ação                   | XP Base  | Multiplicador  | XP Max |
| -------------- | ---------------------- | -------- | -------------- | ------ |
| **Diário**     | Login diário           | 5        | Streak (1x-2x) | 10     |
| **Sessão**     | Iniciar sessão         | 5        | -              | 5      |
| **Sessão**     | Completar sessão       | 10       | Duração        | 50     |
| **Chat**       | 5 mensagens com mentor | 5        | -              | 5      |
| **Diário**     | Entrada no diário      | 10       | -              | 10     |
| **Módulo**     | Completar vídeo        | 15       | -              | 15     |
| **Módulo**     | Completar leitura      | 10       | -              | 10     |
| **Módulo**     | Completar quiz         | 20       | Acertos        | 30     |
| **Módulo**     | Completar exercício    | 25       | -              | 25     |
| **Projeto**    | PR submetido           | 50       | -              | 50     |
| **Projeto**    | PR aprovado            | 100      | Complexidade   | 300    |
| **Badge**      | Conquistar badge       | Variável | -              | 15-300 |
| **Desafio**    | Diário completado      | 15-20    | -              | 20     |
| **Desafio**    | Semanal completado     | 75-150   | -              | 150    |
| **Milestone**  | Completar trilha       | 500      | -              | 500    |
| **Onboarding** | Completar onboarding   | 50       | -              | 50     |
| **Termos**     | Aceitar termos         | 100      | -              | 100    |

### 2.2 Fórmulas de Cálculo

#### Login Diário com Streak

```typescript
// hooks/use-agora.tsx:326-349
const STREAK_MULTIPLIERS = {
  3: 1.1, // 10% bonus após 3 dias
  7: 1.25, // 25% bonus após 7 dias
  14: 1.5, // 50% bonus após 14 dias
  30: 2.0, // 100% bonus após 30 dias
}

function getStreakMultiplier(streak: number): number {
  const thresholds = Object.keys(STREAK_MULTIPLIERS)
    .map(Number)
    .sort((a, b) => b - a)

  for (const threshold of thresholds) {
    if (streak >= threshold) {
      return STREAK_MULTIPLIERS[threshold]
    }
  }
  return 1.0
}

// Cálculo final
const bonusAmount = Math.round(DAILY_LOGIN_BONUS * getStreakMultiplier(streak))
```

#### Sessão de Estudo

```typescript
// XP por sessão = base + (minutos / 10) * 2
// Mínimo: 5 XP (iniciar)
// Máximo: 50 XP (sessão de 2h+)

const sessionXp = Math.min(50, 5 + Math.floor(durationMinutes / 10) * 2)
```

---

## 3. Sistema de Níveis

### 3.1 Fórmula de Nível

```typescript
// hooks/use-agora.tsx:829
const newLevel = Math.floor(newXp / 100) + 1
```

**Tabela de Progressão**:

| Nível | XP Mínimo | XP Máximo | XP para Próximo |
| ----- | --------- | --------- | --------------- |
| 1     | 0         | 99        | 100             |
| 2     | 100       | 199       | 100             |
| 3     | 200       | 299       | 100             |
| 4     | 300       | 399       | 100             |
| 5     | 400       | 499       | 100             |
| ...   | ...       | ...       | 100             |
| 10    | 900       | 999       | 100             |
| 20    | 1900      | 1999      | 100             |
| 50    | 4900      | 4999      | 100             |

### 3.2 Visualização de Progresso

```
Nível 5: [████████░░] 80%
         400/500 XP

Próxima recompensa em: 100 XP
```

---

## 4. Sistema de Ranks

### 4.1 Hierarquia de Ranks

```
                    ARQUITETO
                   (5000+ XP)
                       |
                    MENTOR
                  (2000-4999 XP)
                       |
                  CONTRIBUIDOR
                  (500-1999 XP)
                       |
                    APRENDIZ
                  (100-499 XP)
                       |
                     NOVATO
                   (0-99 XP)
```

### 4.2 Tabela de Ranks

| Rank         | XP Mínimo | Cor     | Ícone | Benefícios        |
| ------------ | --------- | ------- | ----- | ----------------- |
| Novato       | 0         | Cinza   | -     | Acesso básico     |
| Aprendiz     | 100       | Verde   | 🌱    | Badge "Curioso"   |
| Contribuidor | 500       | Azul    | ⚡    | Badge "Estudioso" |
| Mentor       | 2000      | Roxo    | 🎓    | Badge "Mestre"    |
| Arquiteto    | 5000      | Dourado | 👑    | Badge "Iluminado" |

### 4.3 Código de Cálculo

```typescript
// hooks/use-agora.tsx:830-834
let newRank = 'novato'
if (newXp >= 5000) newRank = 'arquiteto'
else if (newXp >= 2000) newRank = 'mentor'
else if (newXp >= 500) newRank = 'contribuidor'
else if (newXp >= 100) newRank = 'aprendiz'
```

---

## 5. Multiplicadores e Bônus

### 5.1 Streak Bonus

| Dias de Streak | Multiplicador | Bônus no Login |
| -------------- | ------------- | -------------- |
| 1-2            | 1.0x          | 5 XP           |
| 3-6            | 1.1x          | 5-6 XP         |
| 7-13           | 1.25x         | 6-7 XP         |
| 14-29          | 1.5x          | 7-8 XP         |
| 30+            | 2.0x          | 10 XP          |

### 5.2 Bônus de Milestone

| Milestone       | XP Bônus | Descrição              |
| --------------- | -------- | ---------------------- |
| Primeira sessão | 20       | Badge "Primeiro Passo" |
| Trilha completa | 500      | Bônus de conclusão     |
| 100 sessões     | 250      | Badge "Centurião"      |
| 30 dias streak  | 200      | Badge "Lenda"          |

### 5.3 Bônus Proposto (Roadmap)

| Tipo             | Bônus                      | Status   |
| ---------------- | -------------------------- | -------- |
| Revisão espaçada | +50% em quizzes de revisão | Proposto |
| Ajudar colega    | +25 XP por resposta útil   | Proposto |
| Code review      | +50 XP por review aceito   | Proposto |
| Primeiro PR      | +100 XP bônus único        | Proposto |

---

## 6. Economia de XP

### 6.1 Fluxo Semanal Típico

```
Segunda:  Login (5) + Sessão (20) + Chat (5) = 30 XP
Terça:    Login (5) + Vídeo (15) + Diário (10) = 30 XP
Quarta:   Login (5) + Leitura (10) + Sessão (15) = 30 XP
Quinta:   Login (6) + Exercício (25) = 31 XP (streak 3d)
Sexta:    Login (6) + PR submetido (50) = 56 XP
Sábado:   Login (6) + Vídeo (15) + Diário (10) = 31 XP
Domingo:  Login (6) + Sessão (25) = 31 XP (streak 7d)

TOTAL SEMANAL: ~239 XP
```

### 6.2 Projeção de Progressão

| Perfil           | XP/Semana | Tempo para Aprendiz | Tempo para Contribuidor |
| ---------------- | --------- | ------------------- | ----------------------- |
| Casual (1h/dia)  | 100-150   | 1 semana            | 4-5 semanas             |
| Regular (2h/dia) | 200-300   | 3-4 dias            | 2-3 semanas             |
| Intenso (4h/dia) | 400-600   | 2 dias              | 1-2 semanas             |

### 6.3 Balanceamento

O sistema é balanceado para:

1. **Iniciantes** - Ganhos rápidos no início (onboarding, primeiros badges)
2. **Retenção** - Streak incentiva retorno diário
3. **Profundidade** - PRs e projetos dão mais XP que ações simples
4. **Variedade** - Múltiplas formas de ganhar XP

---

## 7. Celebrações e Feedback

### 7.1 Eventos de Celebração

```typescript
// store/celebration-store.ts
type CelebrationType =
  | 'badge' // Conquistou badge
  | 'level_up' // Subiu de nível
  | 'rank_up' // Mudou de rank
  | 'streak' // Milestone de streak
  | 'milestone' // Outro milestone
  | 'video' // Completou vídeo
```

### 7.2 Animações

| Evento   | Animação                 | Som         |
| -------- | ------------------------ | ----------- |
| +XP      | Toast com número         | Coin sound  |
| Level Up | Modal com confetti       | Fanfare     |
| Rank Up  | Modal especial           | Triumphant  |
| Badge    | Modal com badge bouncing | Achievement |

### 7.3 Feedback Visual

```
+----------------------------------+
|     ✨ SUBIU DE NÍVEL! ✨        |
|                                  |
|         NÍVEL 5                  |
|                                  |
|    [████████████████] 100%       |
|                                  |
|       +100 XP bônus              |
|                                  |
|        [ INCRÍVEL! ]             |
+----------------------------------+
```

---

## 8. Integração Técnica

### 8.1 Tabelas do Banco de Dados

```sql
-- agora_profiles
total_xp INTEGER DEFAULT 0
current_level INTEGER DEFAULT 1
current_rank TEXT DEFAULT 'novato'

-- agora_xp_transactions
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users
amount INTEGER NOT NULL
balance_after INTEGER NOT NULL
source_type TEXT
description TEXT
created_at TIMESTAMPTZ DEFAULT NOW()
```

### 8.2 Função addXp

```typescript
// hooks/use-agora.tsx:823-906
const addXp = useCallback(
  async (amount: number, sourceType: string, description: string) => {
    // 1. Calcular novo XP e nível
    const newXp = user.totalXp + amount
    const newLevel = Math.floor(newXp / 100) + 1

    // 2. Calcular novo rank
    let newRank = calculateRank(newXp)

    // 3. Atualizar perfil no Supabase
    await supabase.from('agora_profiles').update({
      total_xp: newXp,
      current_level: newLevel,
      current_rank: newRank,
    })

    // 4. Registrar transação
    await supabase.from('agora_xp_transactions').insert({
      user_id: user.id,
      amount,
      balance_after: newXp,
      source_type: sourceType,
      description,
    })

    // 5. Celebrar se necessário
    if (newLevel > oldLevel) {
      celebrateLevelUp(newLevel)
    }
    if (newRank !== oldRank) {
      celebrateRankUp(newRank)
    }
  },
  [user, supabase]
)
```

---

## 9. Métricas e Analytics

### 9.1 KPIs do Sistema de XP

| Métrica               | Descrição                      | Meta                          |
| --------------------- | ------------------------------ | ----------------------------- |
| XP Médio/Usuário      | Média de XP por usuário ativo  | 500+                          |
| Taxa de Level Up      | % usuários que sobem nível/mês | 80%                           |
| Distribuição de Ranks | Pirâmide saudável              | Novato>Aprendiz>...>Arquiteto |
| XP/Sessão             | Média de XP por sessão         | 25-35                         |

### 9.2 Rastreamento

```typescript
// lib/analytics/agora-tracker.ts
trackXpEarned(amount, source, userId)
trackLevelUp(oldLevel, newLevel, totalXp)
trackRankUp(oldRank, newRank, level)
```

---

## 10. Melhorias Propostas

### 10.1 Prioridade Alta

| Feature                   | Descrição                     | Impacto              |
| ------------------------- | ----------------------------- | -------------------- |
| XP por qualidade de PR    | Bônus baseado em complexidade | Motivação intrínseca |
| Decaimento de inatividade | Perda leve após 30d sem ação  | Retenção             |
| XP transferível           | Doar XP para ajudar colega    | Comunidade           |

### 10.2 Prioridade Média

| Feature                 | Descrição                   | Impacto                  |
| ----------------------- | --------------------------- | ------------------------ |
| XP sazonal              | Eventos com multiplicadores | Engajamento              |
| Desafios personalizados | Baseados no histórico       | Relevância               |
| XP por revisão espaçada | Incentivo a revisitar       | Retenção de conhecimento |

### 10.3 Prioridade Baixa

| Feature          | Descrição               | Impacto              |
| ---------------- | ----------------------- | -------------------- |
| Leilão de badges | Gastar XP em cosméticos | Economia virtual     |
| Apostas de XP    | Desafios competitivos   | Engajamento avançado |

---

## 11. Referências

- Chou, Y. (2015). Actionable Gamification. Octalysis Media.
- Deterding, S. et al. (2011). From Game Design Elements to Gamefulness.
- Hamari, J. et al. (2014). Does Gamification Work? CHI '14.

---

**Autor**: Anderson Henrique da Silva
**Última atualização**: 2025-12-09
**Código fonte**: `hooks/use-agora.tsx`, `store/celebration-store.ts`
