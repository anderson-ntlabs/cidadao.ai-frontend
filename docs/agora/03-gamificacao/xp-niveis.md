# Sistema de XP e Niveis

> Documentacao completa do sistema de progressao da Agora Academy

---

## 1. Visao Geral

O sistema de XP (Experience Points) e o mecanismo central de progressao na Agora Academy. Ele quantifica o engajamento e aprendizado do estudante, desbloqueando niveis, ranks e recompensas.

### 1.1 Principios do Sistema

```
+------------------------------------------------------------------+
|                    PRINCIPIOS DE DESIGN                          |
+------------------------------------------------------------------+
|                                                                    |
|  1. JUSTO        - Mesmas regras para todos                       |
|  2. TRANSPARENTE - Formulas publicas e claras                     |
|  3. MOTIVADOR    - Recompensas frequentes e significativas        |
|  4. BALANCEADO   - Nem facil demais, nem impossivel               |
|  5. PEDAGOGICO   - XP alinhado a objetivos de aprendizagem        |
|                                                                    |
+------------------------------------------------------------------+
```

---

## 2. Fontes de XP

### 2.1 Tabela Completa de Fontes

| Categoria      | Acao                   | XP Base  | Multiplicador  | XP Max |
| -------------- | ---------------------- | -------- | -------------- | ------ |
| **Diario**     | Login diario           | 5        | Streak (1x-2x) | 10     |
| **Sessao**     | Iniciar sessao         | 5        | -              | 5      |
| **Sessao**     | Completar sessao       | 10       | Duracao        | 50     |
| **Chat**       | 5 mensagens com mentor | 5        | -              | 5      |
| **Diario**     | Entrada no diario      | 10       | -              | 10     |
| **Modulo**     | Completar video        | 15       | -              | 15     |
| **Modulo**     | Completar leitura      | 10       | -              | 10     |
| **Modulo**     | Completar quiz         | 20       | Acertos        | 30     |
| **Modulo**     | Completar exercicio    | 25       | -              | 25     |
| **Projeto**    | PR submetido           | 50       | -              | 50     |
| **Projeto**    | PR aprovado            | 100      | Complexidade   | 300    |
| **Badge**      | Conquistar badge       | Variavel | -              | 15-300 |
| **Desafio**    | Diario completado      | 15-20    | -              | 20     |
| **Desafio**    | Semanal completado     | 75-150   | -              | 150    |
| **Milestone**  | Completar trilha       | 500      | -              | 500    |
| **Onboarding** | Completar onboarding   | 50       | -              | 50     |
| **Termos**     | Aceitar termos         | 100      | -              | 100    |

### 2.2 Formulas de Calculo

#### Login Diario com Streak

```typescript
// hooks/use-agora.tsx:326-349
const STREAK_MULTIPLIERS = {
  3: 1.1, // 10% bonus apos 3 dias
  7: 1.25, // 25% bonus apos 7 dias
  14: 1.5, // 50% bonus apos 14 dias
  30: 2.0, // 100% bonus apos 30 dias
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

// Calculo final
const bonusAmount = Math.round(DAILY_LOGIN_BONUS * getStreakMultiplier(streak))
```

#### Sessao de Estudo

```typescript
// XP por sessao = base + (minutos / 10) * 2
// Minimo: 5 XP (iniciar)
// Maximo: 50 XP (sessao de 2h+)

const sessionXp = Math.min(50, 5 + Math.floor(durationMinutes / 10) * 2)
```

---

## 3. Sistema de Niveis

### 3.1 Formula de Nivel

```typescript
// hooks/use-agora.tsx:829
const newLevel = Math.floor(newXp / 100) + 1
```

**Tabela de Progressao**:

| Nivel | XP Minimo | XP Maximo | XP para Proximo |
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

### 3.2 Visualizacao de Progresso

```
Nivel 5: [████████░░] 80%
         400/500 XP

Proxima recompensa em: 100 XP
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

| Rank         | XP Minimo | Cor     | Icone | Beneficios        |
| ------------ | --------- | ------- | ----- | ----------------- |
| Novato       | 0         | Cinza   | -     | Acesso basico     |
| Aprendiz     | 100       | Verde   | 🌱    | Badge "Curioso"   |
| Contribuidor | 500       | Azul    | ⚡    | Badge "Estudioso" |
| Mentor       | 2000      | Roxo    | 🎓    | Badge "Mestre"    |
| Arquiteto    | 5000      | Dourado | 👑    | Badge "Iluminado" |

### 4.3 Codigo de Calculo

```typescript
// hooks/use-agora.tsx:830-834
let newRank = 'novato'
if (newXp >= 5000) newRank = 'arquiteto'
else if (newXp >= 2000) newRank = 'mentor'
else if (newXp >= 500) newRank = 'contribuidor'
else if (newXp >= 100) newRank = 'aprendiz'
```

---

## 5. Multiplicadores e Bonus

### 5.1 Streak Bonus

| Dias de Streak | Multiplicador | Bonus no Login |
| -------------- | ------------- | -------------- |
| 1-2            | 1.0x          | 5 XP           |
| 3-6            | 1.1x          | 5-6 XP         |
| 7-13           | 1.25x         | 6-7 XP         |
| 14-29          | 1.5x          | 7-8 XP         |
| 30+            | 2.0x          | 10 XP          |

### 5.2 Bonus de Milestone

| Milestone       | XP Bonus | Descricao              |
| --------------- | -------- | ---------------------- |
| Primeira sessao | 20       | Badge "Primeiro Passo" |
| Trilha completa | 500      | Bonus de conclusao     |
| 100 sessoes     | 250      | Badge "Centuriao"      |
| 30 dias streak  | 200      | Badge "Lenda"          |

### 5.3 Bonus Proposto (Roadmap)

| Tipo             | Bonus                      | Status   |
| ---------------- | -------------------------- | -------- |
| Revisao espacada | +50% em quizzes de revisao | Proposto |
| Ajudar colega    | +25 XP por resposta util   | Proposto |
| Code review      | +50 XP por review aceito   | Proposto |
| Primeiro PR      | +100 XP bonus unico        | Proposto |

---

## 6. Economia de XP

### 6.1 Fluxo Semanal Tipico

```
Segunda:  Login (5) + Sessao (20) + Chat (5) = 30 XP
Terca:    Login (5) + Video (15) + Diario (10) = 30 XP
Quarta:   Login (5) + Leitura (10) + Sessao (15) = 30 XP
Quinta:   Login (6) + Exercicio (25) = 31 XP (streak 3d)
Sexta:    Login (6) + PR submetido (50) = 56 XP
Sabado:   Login (6) + Video (15) + Diario (10) = 31 XP
Domingo:  Login (6) + Sessao (25) = 31 XP (streak 7d)

TOTAL SEMANAL: ~239 XP
```

### 6.2 Projecao de Progressao

| Perfil           | XP/Semana | Tempo para Aprendiz | Tempo para Contribuidor |
| ---------------- | --------- | ------------------- | ----------------------- |
| Casual (1h/dia)  | 100-150   | 1 semana            | 4-5 semanas             |
| Regular (2h/dia) | 200-300   | 3-4 dias            | 2-3 semanas             |
| Intenso (4h/dia) | 400-600   | 2 dias              | 1-2 semanas             |

### 6.3 Balanceamento

O sistema e balanceado para:

1. **Iniciantes** - Ganhos rapidos no inicio (onboarding, primeiros badges)
2. **Retencao** - Streak incentiva retorno diario
3. **Profundidade** - PRs e projetos dao mais XP que acoes simples
4. **Variedade** - Multiplas formas de ganhar XP

---

## 7. Celebracoes e Feedback

### 7.1 Eventos de Celebracao

```typescript
// store/celebration-store.ts
type CelebrationType =
  | 'badge' // Conquistou badge
  | 'level_up' // Subiu de nivel
  | 'rank_up' // Mudou de rank
  | 'streak' // Milestone de streak
  | 'milestone' // Outro milestone
  | 'video' // Completou video
```

### 7.2 Animacoes

| Evento   | Animacao                 | Som         |
| -------- | ------------------------ | ----------- |
| +XP      | Toast com numero         | Coin sound  |
| Level Up | Modal com confetti       | Fanfare     |
| Rank Up  | Modal especial           | Triumphant  |
| Badge    | Modal com badge bouncing | Achievement |

### 7.3 Feedback Visual

```
+----------------------------------+
|     ✨ SUBIU DE NIVEL! ✨        |
|                                  |
|         NIVEL 5                  |
|                                  |
|    [████████████████] 100%       |
|                                  |
|       +100 XP bonus              |
|                                  |
|        [ INCRIVEL! ]             |
+----------------------------------+
```

---

## 8. Integracao Tecnica

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

### 8.2 Funcao addXp

```typescript
// hooks/use-agora.tsx:823-906
const addXp = useCallback(
  async (amount: number, sourceType: string, description: string) => {
    // 1. Calcular novo XP e nivel
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

    // 4. Registrar transacao
    await supabase.from('agora_xp_transactions').insert({
      user_id: user.id,
      amount,
      balance_after: newXp,
      source_type: sourceType,
      description,
    })

    // 5. Celebrar se necessario
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

## 9. Metricas e Analytics

### 9.1 KPIs do Sistema de XP

| Metrica               | Descricao                      | Meta                          |
| --------------------- | ------------------------------ | ----------------------------- |
| XP Medio/Usuario      | Media de XP por usuario ativo  | 500+                          |
| Taxa de Level Up      | % usuarios que sobem nivel/mes | 80%                           |
| Distribuicao de Ranks | Piramide saudavel              | Novato>Aprendiz>...>Arquiteto |
| XP/Sessao             | Media de XP por sessao         | 25-35                         |

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

| Feature                   | Descricao                     | Impacto              |
| ------------------------- | ----------------------------- | -------------------- |
| XP por qualidade de PR    | Bonus baseado em complexidade | Motivacao intrinseca |
| Decaimento de inatividade | Perda leve apos 30d sem acao  | Retencao             |
| XP transferivel           | Doar XP para ajudar colega    | Comunidade           |

### 10.2 Prioridade Media

| Feature                 | Descricao                   | Impacto                  |
| ----------------------- | --------------------------- | ------------------------ |
| XP sazonal              | Eventos com multiplicadores | Engajamento              |
| Desafios personalizados | Baseados no historico       | Relevancia               |
| XP por revisao espacada | Incentivo a revisitar       | Retencao de conhecimento |

### 10.3 Prioridade Baixa

| Feature          | Descricao               | Impacto              |
| ---------------- | ----------------------- | -------------------- |
| Leilao de badges | Gastar XP em cosmeticos | Economia virtual     |
| Apostas de XP    | Desafios competitivos   | Engajamento avancado |

---

## 11. Referencias

- Chou, Y. (2015). Actionable Gamification. Octalysis Media.
- Deterding, S. et al. (2011). From Game Design Elements to Gamefulness.
- Hamari, J. et al. (2014). Does Gamification Work? CHI '14.

---

**Autor**: Anderson Henrique da Silva
**Ultima atualizacao**: 2025-12-09
**Codigo fonte**: `hooks/use-agora.tsx`, `store/celebration-store.ts`
