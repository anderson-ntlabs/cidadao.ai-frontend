# Features Propostas - Roadmap Completo

> Visão de produto para tornar a Ágora Academy um sistema PERFEITO

---

## 1. Visão Geral

Este documento apresenta todas as features propostas para evolução da Ágora Academy, organizadas por prioridade, impacto e complexidade.

### 1.1 Princípios de Priorização

```
                    ALTO IMPACTO
                         |
            Q2           |           Q1
      (Considerar)       |      (Prioridade)
                         |
    ALTA ----------------|---------------- BAIXA
    COMPLEXIDADE         |            COMPLEXIDADE
                         |
            Q3           |           Q4
        (Evitar)         |       (Quick Wins)
                         |
                    BAIXO IMPACTO
```

---

## 2. Features de Prioridade CRÍTICA

### 2.1 Sistema de Avaliação Formativa

**Status**: Não implementado
**Impacto**: Muito Alto
**Complexidade**: Média

#### Problema

Atualmente não há verificação real de aprendizado. Módulos são marcados como "completos" apenas por acesso.

#### Solução Proposta

```typescript
// Novo componente: QuizModule
interface Quiz {
  id: string
  moduleId: string
  questions: Question[]
  passingScore: number // 70%
  maxAttempts: number
  timeLimit?: number // minutos
}

interface Question {
  id: string
  type: 'multiple_choice' | 'true_false' | 'code_completion'
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation: string // Feedback para resposta errada
  difficulty: 'easy' | 'medium' | 'hard'
}
```

#### Implementação

```
Fase 1: Quiz básico (2 semanas)
- Múltipla escolha
- Verdadeiro/Falso
- 3-5 questões por módulo
- Feedback imediato

Fase 2: Quiz avançado (2 semanas)
- Completar código
- Arrastar e soltar
- Banco de questões randomizado

Fase 3: Analytics (1 semana)
- Dashboard de performance
- Identificação de lacunas
- Recomendações personalizadas
```

#### Métricas de Sucesso

- Taxa de aprovação no primeiro attempt: >60%
- Correlação quiz-projeto: r > 0.5
- Redução de abandono pós-módulo: -20%

---

### 2.2 Tutoria Inteligente Adaptativa

**Status**: Parcial (chat genérico)
**Impacto**: Muito Alto
**Complexidade**: Alta

#### Problema

Mentores IA atuais são chatbots genéricos. Não rastreiam progresso nem adaptam explicações.

#### Solução Proposta

```typescript
// Sistema de Student Model
interface StudentModel {
  userId: string

  // Conhecimento por conceito
  conceptMastery: Map<
    string,
    {
      level: 0 | 1 | 2 | 3 | 4 // Bloom's taxonomy
      confidence: number // 0-1
      lastAssessed: Date
      attempts: number
    }
  >

  // Estilo de aprendizagem
  learningStyle: {
    visual: number // 0-1
    auditory: number
    kinesthetic: number
  }

  // Histórico de dificuldades
  struggles: {
    concept: string
    frequency: number
    context: string[]
  }[]
}

// Tutor adaptativo
class AdaptiveTutor {
  async respond(message: string, student: StudentModel): Promise<Response> {
    // 1. Identificar conceito da pergunta
    const concept = await this.identifyConcept(message)

    // 2. Verificar nível do estudante
    const mastery = student.conceptMastery.get(concept)

    // 3. Adaptar resposta
    if (mastery?.level < 2) {
      return this.explainFromBasics(concept, student.learningStyle)
    } else {
      return this.explainAdvanced(concept)
    }

    // 4. Atualizar modelo
    await this.updateStudentModel(student, concept, message)
  }
}
```

#### Fluxo de Adaptação

```
Estudante pergunta sobre JWT
         |
         v
Verificar StudentModel
         |
    +----+----+
    |         |
    v         v
Nível 0-1   Nível 2+
    |         |
    v         v
Explicar    Explicar
desde       em nível
o básico    avançado
    |         |
    v         v
Incluir     Incluir
analogias   detalhes
e exemplos  técnicos
    |         |
    +----+----+
         |
         v
  Oferecer quiz
  de verificação
         |
         v
Atualizar StudentModel
```

#### Banco de Dados Adicional

```sql
CREATE TABLE student_models (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  concept_mastery JSONB DEFAULT '{}',
  learning_style JSONB DEFAULT '{"visual": 0.33, "auditory": 0.33, "kinesthetic": 0.33}',
  struggles JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE concept_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  concept_id TEXT NOT NULL,
  assessment_type TEXT, -- 'quiz', 'project', 'chat'
  score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2.3 Sistema de Exercícios Práticos

**Status**: Não implementado
**Impacto**: Alto
**Complexidade**: Média

#### Problema

Salto grande entre "assistir vídeo" e "projeto final". Falta prática guiada intermediária.

#### Solução Proposta

```typescript
// Tipos de exercício
type ExerciseType =
  | 'code_completion' // Completar código faltante
  | 'bug_fix' // Encontrar e corrigir bug
  | 'refactor' // Melhorar código existente
  | 'implement' // Implementar função/componente
  | 'debug' // Usar debugger para encontrar problema

interface Exercise {
  id: string
  moduleId: string
  type: ExerciseType
  difficulty: 'easy' | 'medium' | 'hard'

  // Conteúdo
  title: string
  description: string
  starterCode: string
  testCases: TestCase[]
  hints: string[]
  solution: string // Revelado após 3 tentativas

  // Gamificação
  xpReward: number
  timeBonus: boolean // XP extra se resolver rápido
}

interface TestCase {
  input: any
  expectedOutput: any
  isHidden: boolean // Alguns testes são surpresa
}
```

#### Interface de Exercício

```
+------------------------------------------------------------------+
|  Exercício: Implementar função de validação de CPF               |
+------------------------------------------------------------------+
|                                                                    |
|  Descrição:                                                       |
|  Implemente a função `validateCPF` que recebe uma string          |
|  e retorna true se for um CPF válido.                             |
|                                                                    |
|  +---------------------------+  +---------------------------+     |
|  | // Seu código             |  | Testes                    |     |
|  |                           |  |                           |     |
|  | function validateCPF(cpf) |  | [x] CPF válido            |     |
|  |   // TODO                 |  | [ ] CPF inválido          |     |
|  | }                         |  | [ ] CPF com máscara       |     |
|  |                           |  | [ ] String vazia          |     |
|  |                           |  | [?] Teste secreto         |     |
|  +---------------------------+  +---------------------------+     |
|                                                                    |
|  [ Dica (1/3) ]  [ Executar Testes ]  [ Submeter ]               |
|                                                                    |
|  Recompensa: 25 XP (+10 XP se resolver em < 5min)                 |
|                                                                    |
+------------------------------------------------------------------+
```

---

## 3. Features de Prioridade ALTA

### 3.1 Code Review entre Pares

**Status**: Não implementado
**Impacto**: Alto
**Complexidade**: Média

```typescript
interface CodeReview {
  id: string
  submissionId: string // PR ou exercício
  reviewerId: string
  authorId: string

  status: 'pending' | 'in_review' | 'approved' | 'changes_requested'

  comments: ReviewComment[]

  // Gamificação
  reviewerXp: number // XP para quem revisou
  authorXp: number // XP se aprovado
}

interface ReviewComment {
  lineNumber: number
  comment: string
  type: 'suggestion' | 'question' | 'praise' | 'issue'
}
```

**Benefícios Pedagógicos**:

- Aprendizagem social (Bandura)
- Pensamento crítico
- Exposição a diferentes abordagens
- Soft skills de comunicação

---

### 3.2 Portfólio Automático

**Status**: Parcial (apenas commits no GitHub)
**Impacto**: Alto
**Complexidade**: Baixa

```typescript
interface Portfolio {
  userId: string

  // Automático
  contributions: {
    type: 'pr' | 'issue' | 'review'
    url: string
    title: string
    date: Date
    status: 'merged' | 'open' | 'closed'
  }[]

  // Trilhas
  completedTracks: {
    trackId: string
    completedAt: Date
    certificateUrl: string
  }[]

  // Badges destacados
  featuredBadges: string[]

  // Stats
  stats: {
    totalXp: number
    rank: string
    streak: number
    prsAccepted: number
  }

  // Personalização
  bio: string
  socialLinks: Record<string, string>
}
```

**Página pública**: `/portfolio/{username}`

---

### 3.3 Sistema de Notificações Inteligentes

**Status**: Não implementado
**Impacto**: Alto
**Complexidade**: Média

```typescript
interface NotificationRule {
  id: string
  type: 'reminder' | 'achievement' | 'social' | 'deadline'

  // Condições
  trigger: {
    event: string
    conditions: Record<string, any>
  }

  // Ação
  channels: ('push' | 'email' | 'in_app')[]
  template: string

  // Personalização
  respectQuietHours: boolean
  maxFrequency: string // '1/day', '3/week'
}

// Exemplos de notificações
const notifications = [
  {
    type: 'reminder',
    trigger: { event: 'streak_at_risk', conditions: { hoursLeft: 4 } },
    template: '🔥 Seu streak de {streak} dias está em risco! Faça uma sessão rápida.',
  },
  {
    type: 'achievement',
    trigger: { event: 'badge_close', conditions: { progress: 0.9 } },
    template: '🏆 Você está a {remaining} de conquistar o badge {badgeName}!',
  },
  {
    type: 'social',
    trigger: { event: 'overtaken_in_ranking' },
    template: '📈 {userName} acabou de passar você no ranking! Hora de estudar?',
  },
  {
    type: 'spaced_repetition',
    trigger: { event: 'review_due', conditions: { concept: 'JWT' } },
    template: '🧠 Que tal revisar JWT? Faz 7 dias desde sua última interação.',
  },
]
```

---

### 3.4 Revisão Espaçada (Spaced Repetition)

**Status**: Não implementado
**Impacto**: Alto
**Complexidade**: Média

Baseado na curva de Ebbinghaus para retenção de longo prazo.

```typescript
interface SpacedRepetitionItem {
  userId: string
  conceptId: string

  // Algoritmo SM-2
  easeFactor: number // 1.3 - 2.5
  interval: number // dias até próxima revisão
  repetitions: number

  nextReview: Date
  lastReview: Date
}

// Algoritmo SM-2 simplificado
function calculateNextReview(item: SpacedRepetitionItem, quality: number): SpacedRepetitionItem {
  // quality: 0 (esqueceu) a 5 (perfeito)

  if (quality < 3) {
    // Reset
    return { ...item, repetitions: 0, interval: 1 }
  }

  const newEF = Math.max(1.3, item.easeFactor + (0.1 - (5 - quality) * 0.08))

  let newInterval: number
  if (item.repetitions === 0) newInterval = 1
  else if (item.repetitions === 1) newInterval = 6
  else newInterval = Math.round(item.interval * newEF)

  return {
    ...item,
    easeFactor: newEF,
    interval: newInterval,
    repetitions: item.repetitions + 1,
    nextReview: addDays(new Date(), newInterval),
    lastReview: new Date(),
  }
}
```

**Interface de Revisão**:

```
+----------------------------------+
|   📚 Revisão do Dia              |
+----------------------------------+
|                                  |
|   3 conceitos para revisar       |
|                                  |
|   1. JWT Authentication          |
|      Último: 7 dias atrás        |
|      [ Revisar ]                 |
|                                  |
|   2. React Hooks                 |
|      Último: 14 dias atrás       |
|      [ Revisar ]                 |
|                                  |
|   3. SQL Joins                   |
|      Último: 21 dias atrás       |
|      [ Revisar ]                 |
|                                  |
|   +15 XP por revisão completa    |
|                                  |
+----------------------------------+
```

---

## 4. Features de Prioridade MÉDIA

### 4.1 Modo Colaborativo / Pair Programming

```typescript
interface PairSession {
  id: string
  hostId: string
  guestId: string

  // Estado compartilhado
  sharedCode: string
  cursor: { line: number; column: number }
  chat: Message[]

  // Gamificação
  bothEarnXp: boolean // XP para ambos
}
```

### 4.2 Desafios Semanais Temáticos

```typescript
interface WeeklyChallenge {
  id: string
  week: string // '2025-W50'

  theme: string // 'Acessibilidade', 'Performance', 'Segurança'
  description: string

  tasks: {
    id: string
    description: string
    xpReward: number
    completed: boolean
  }[]

  leaderboard: { userId: string; score: number }[]
  prizes: { position: number; reward: string }[]
}
```

### 4.3 Mentoria Humana (Marketplace)

```typescript
interface MentoringSession {
  id: string
  mentorId: string
  menteeId: string

  scheduledAt: Date
  duration: number // minutos
  topic: string

  status: 'scheduled' | 'completed' | 'cancelled'
  rating: number // 1-5
  feedback: string
}

interface Mentor {
  userId: string
  expertise: string[]
  rate: 'free' | 'paid'
  availability: TimeSlot[]
  rating: number
  sessionsCompleted: number
}
```

### 4.4 Integração com LeetCode/HackerRank

```typescript
interface ExternalChallenge {
  platform: 'leetcode' | 'hackerrank' | 'codewars'
  problemId: string
  difficulty: string

  // Sincronização
  completedAt?: Date
  xpAwarded: number
}
```

---

## 5. Features de Prioridade BAIXA

### 5.1 Modo Offline (PWA Avançado)

- Cache de conteúdo de módulos
- Exercícios offline
- Sincronização ao reconectar

### 5.2 Gamificação Avançada

- Economia virtual (moedas para gastar)
- Loja de cosméticos (temas, avatares)
- Apostas de XP em desafios
- Seasons com reset parcial

### 5.3 Integração com IDE

- Extensão VS Code
- Notificações no editor
- Submit de código direto

### 5.4 IA Generativa para Conteúdo

- Geração de quizzes personalizados
- Explicações adaptadas
- Criação de exercícios on-demand

---

## 6. Roadmap Visual

```
2025 Q1 (Jan-Mar)
├── Sistema de Quizzes (MVP)
├── Exercícios básicos
└── Melhorias no chat IA

2025 Q2 (Abr-Jun)
├── Tutoria adaptativa (v1)
├── Code review entre pares
├── Portfólio público
└── Notificações inteligentes

2025 Q3 (Jul-Set)
├── Revisão espaçada
├── Desafios semanais
├── Tutoria adaptativa (v2)
└── Badges de competência

2025 Q4 (Out-Dez)
├── Mentoria humana
├── Modo colaborativo
├── Integração LeetCode
└── PWA avançado

2026 Q1+
├── Economia virtual
├── Extensão VS Code
├── IA generativa
└── Expansão internacional
```

---

## 7. Métricas de Sucesso por Feature

| Feature            | Métrica Principal | Meta         |
| ------------------ | ----------------- | ------------ |
| Quizzes            | Taxa de aprovação | >70%         |
| Tutoria adaptativa | Satisfação (NPS)  | >50          |
| Exercícios         | Conclusão         | >60%         |
| Code review        | Participação      | 30% usuários |
| Portfólio          | Visitas/usuário   | 10/mês       |
| Notificações       | Open rate         | >40%         |
| Revisão espaçada   | Retenção 30d      | +25%         |

---

## 8. Estimativas de Esforço

| Feature            | Devs | Semanas | Prioridade |
| ------------------ | ---- | ------- | ---------- |
| Quizzes MVP        | 2    | 3       | Crítica    |
| Exercícios básicos | 2    | 2       | Crítica    |
| Tutoria v1         | 3    | 6       | Crítica    |
| Code review        | 2    | 3       | Alta       |
| Portfólio          | 1    | 2       | Alta       |
| Notificações       | 1    | 2       | Alta       |
| Revisão espaçada   | 2    | 3       | Alta       |
| Desafios semanais  | 1    | 2       | Média      |
| Mentoria humana    | 2    | 4       | Média      |

---

## 9. Dependências Técnicas

```
Quizzes
  └── Banco de questões
      └── Exercícios
          └── Tutoria adaptativa
              └── Revisão espaçada

Code Review
  └── Sistema de matching
      └── Mentoria humana

Portfólio
  └── Integração GitHub melhorada
      └── Certificados verificáveis
```

---

## 10. Conclusão

Este roadmap representa uma visão ambiciosa mas realizável para transformar a Ágora Academy em uma plataforma de referência em EdTech. As prioridades foram definidas com base em:

1. **Impacto pedagógico** - Features que melhoram aprendizado real
2. **Retenção de usuários** - Features que trazem usuários de volta
3. **Diferenciação** - Features únicas no mercado
4. **Viabilidade técnica** - Complexidade vs. recursos disponíveis

A execução deve ser iterativa, com MVPs para validação antes de investimento completo.

---

**Autor**: Anderson Henrique da Silva
**Revisão**: Time de Produto
**Última atualização**: 2025-12-09
