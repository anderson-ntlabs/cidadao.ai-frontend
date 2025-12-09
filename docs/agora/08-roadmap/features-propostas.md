# Features Propostas - Roadmap Completo

> Visao de produto para tornar a Agora Academy um sistema PERFEITO

---

## 1. Visao Geral

Este documento apresenta todas as features propostas para evolucao da Agora Academy, organizadas por prioridade, impacto e complexidade.

### 1.1 Principios de Priorizacao

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

## 2. Features de Prioridade CRITICA

### 2.1 Sistema de Avaliacao Formativa

**Status**: Nao implementado
**Impacto**: Muito Alto
**Complexidade**: Media

#### Problema

Atualmente nao ha verificacao real de aprendizado. Modulos sao marcados como "completos" apenas por acesso.

#### Solucao Proposta

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

#### Implementacao

```
Fase 1: Quiz basico (2 semanas)
- Multipla escolha
- Verdadeiro/Falso
- 3-5 questoes por modulo
- Feedback imediato

Fase 2: Quiz avancado (2 semanas)
- Completar codigo
- Arrastar e soltar
- Banco de questoes randomizado

Fase 3: Analytics (1 semana)
- Dashboard de performance
- Identificacao de lacunas
- Recomendacoes personalizadas
```

#### Metricas de Sucesso

- Taxa de aprovacao no primeiro attempt: >60%
- Correlacao quiz-projeto: r > 0.5
- Reducao de abandono pos-modulo: -20%

---

### 2.2 Tutoria Inteligente Adaptativa

**Status**: Parcial (chat generico)
**Impacto**: Muito Alto
**Complexidade**: Alta

#### Problema

Mentores IA atuais sao chatbots genericos. Nao rastreiam progresso nem adaptam explicacoes.

#### Solucao Proposta

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

  // Historico de dificuldades
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

    // 2. Verificar nivel do estudante
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

#### Fluxo de Adaptacao

```
Estudante pergunta sobre JWT
         |
         v
Verificar StudentModel
         |
    +----+----+
    |         |
    v         v
Nivel 0-1   Nivel 2+
    |         |
    v         v
Explicar    Explicar
desde       em nivel
o basico    avancado
    |         |
    v         v
Incluir     Incluir
analogias   detalhes
e exemplos  tecnicos
    |         |
    +----+----+
         |
         v
  Oferecer quiz
  de verificacao
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

### 2.3 Sistema de Exercicios Praticos

**Status**: Nao implementado
**Impacto**: Alto
**Complexidade**: Media

#### Problema

Salto grande entre "assistir video" e "projeto final". Falta pratica guiada intermediaria.

#### Solucao Proposta

```typescript
// Tipos de exercicio
type ExerciseType =
  | 'code_completion' // Completar codigo faltante
  | 'bug_fix' // Encontrar e corrigir bug
  | 'refactor' // Melhorar codigo existente
  | 'implement' // Implementar funcao/componente
  | 'debug' // Usar debugger para encontrar problema

interface Exercise {
  id: string
  moduleId: string
  type: ExerciseType
  difficulty: 'easy' | 'medium' | 'hard'

  // Conteudo
  title: string
  description: string
  starterCode: string
  testCases: TestCase[]
  hints: string[]
  solution: string // Revelado apos 3 tentativas

  // Gamificacao
  xpReward: number
  timeBonus: boolean // XP extra se resolver rapido
}

interface TestCase {
  input: any
  expectedOutput: any
  isHidden: boolean // Alguns testes sao surpresa
}
```

#### Interface de Exercicio

```
+------------------------------------------------------------------+
|  Exercicio: Implementar funcao de validacao de CPF               |
+------------------------------------------------------------------+
|                                                                    |
|  Descricao:                                                       |
|  Implemente a funcao `validateCPF` que recebe uma string          |
|  e retorna true se for um CPF valido.                             |
|                                                                    |
|  +---------------------------+  +---------------------------+     |
|  | // Seu codigo             |  | Testes                    |     |
|  |                           |  |                           |     |
|  | function validateCPF(cpf) |  | [x] CPF valido            |     |
|  |   // TODO                 |  | [ ] CPF invalido          |     |
|  | }                         |  | [ ] CPF com mascara       |     |
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

**Status**: Nao implementado
**Impacto**: Alto
**Complexidade**: Media

```typescript
interface CodeReview {
  id: string
  submissionId: string // PR ou exercicio
  reviewerId: string
  authorId: string

  status: 'pending' | 'in_review' | 'approved' | 'changes_requested'

  comments: ReviewComment[]

  // Gamificacao
  reviewerXp: number // XP para quem revisou
  authorXp: number // XP se aprovado
}

interface ReviewComment {
  lineNumber: number
  comment: string
  type: 'suggestion' | 'question' | 'praise' | 'issue'
}
```

**Beneficios Pedagogicos**:

- Aprendizagem social (Bandura)
- Pensamento critico
- Exposicao a diferentes abordagens
- Soft skills de comunicacao

---

### 3.2 Portfolio Automatico

**Status**: Parcial (apenas commits no GitHub)
**Impacto**: Alto
**Complexidade**: Baixa

```typescript
interface Portfolio {
  userId: string

  // Automatico
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

  // Personalizacao
  bio: string
  socialLinks: Record<string, string>
}
```

**Pagina publica**: `/portfolio/{username}`

---

### 3.3 Sistema de Notificacoes Inteligentes

**Status**: Nao implementado
**Impacto**: Alto
**Complexidade**: Media

```typescript
interface NotificationRule {
  id: string
  type: 'reminder' | 'achievement' | 'social' | 'deadline'

  // Condicoes
  trigger: {
    event: string
    conditions: Record<string, any>
  }

  // Acao
  channels: ('push' | 'email' | 'in_app')[]
  template: string

  // Personalizacao
  respectQuietHours: boolean
  maxFrequency: string // '1/day', '3/week'
}

// Exemplos de notificacoes
const notifications = [
  {
    type: 'reminder',
    trigger: { event: 'streak_at_risk', conditions: { hoursLeft: 4 } },
    template: '🔥 Seu streak de {streak} dias esta em risco! Faca uma sessao rapida.',
  },
  {
    type: 'achievement',
    trigger: { event: 'badge_close', conditions: { progress: 0.9 } },
    template: '🏆 Voce esta a {remaining} de conquistar o badge {badgeName}!',
  },
  {
    type: 'social',
    trigger: { event: 'overtaken_in_ranking' },
    template: '📈 {userName} acabou de passar voce no ranking! Hora de estudar?',
  },
  {
    type: 'spaced_repetition',
    trigger: { event: 'review_due', conditions: { concept: 'JWT' } },
    template: '🧠 Que tal revisar JWT? Faz 7 dias desde sua ultima interacao.',
  },
]
```

---

### 3.4 Revisao Espacada (Spaced Repetition)

**Status**: Nao implementado
**Impacto**: Alto
**Complexidade**: Media

Baseado na curva de Ebbinghaus para retencao de longo prazo.

```typescript
interface SpacedRepetitionItem {
  userId: string
  conceptId: string

  // Algoritmo SM-2
  easeFactor: number // 1.3 - 2.5
  interval: number // dias ate proxima revisao
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

**Interface de Revisao**:

```
+----------------------------------+
|   📚 Revisao do Dia              |
+----------------------------------+
|                                  |
|   3 conceitos para revisar       |
|                                  |
|   1. JWT Authentication          |
|      Ultimo: 7 dias atras        |
|      [ Revisar ]                 |
|                                  |
|   2. React Hooks                 |
|      Ultimo: 14 dias atras       |
|      [ Revisar ]                 |
|                                  |
|   3. SQL Joins                   |
|      Ultimo: 21 dias atras       |
|      [ Revisar ]                 |
|                                  |
|   +15 XP por revisao completa    |
|                                  |
+----------------------------------+
```

---

## 4. Features de Prioridade MEDIA

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

  // Gamificacao
  bothEarnXp: boolean // XP para ambos
}
```

### 4.2 Desafios Semanais Tematicos

```typescript
interface WeeklyChallenge {
  id: string
  week: string // '2025-W50'

  theme: string // 'Acessibilidade', 'Performance', 'Seguranca'
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

### 4.4 Integracao com LeetCode/HackerRank

```typescript
interface ExternalChallenge {
  platform: 'leetcode' | 'hackerrank' | 'codewars'
  problemId: string
  difficulty: string

  // Sincronizacao
  completedAt?: Date
  xpAwarded: number
}
```

---

## 5. Features de Prioridade BAIXA

### 5.1 Modo Offline (PWA Avancado)

- Cache de conteudo de modulos
- Exercicios offline
- Sincronizacao ao reconectar

### 5.2 Gamificacao Avancada

- Economia virtual (moedas para gastar)
- Loja de cosmeticos (temas, avatares)
- Apostas de XP em desafios
- Seasons com reset parcial

### 5.3 Integracao com IDE

- Extensao VS Code
- Notificacoes no editor
- Submit de codigo direto

### 5.4 IA Generativa para Conteudo

- Geracao de quizzes personalizados
- Explicacoes adaptadas
- Criacao de exercicios on-demand

---

## 6. Roadmap Visual

```
2025 Q1 (Jan-Mar)
├── Sistema de Quizzes (MVP)
├── Exercicios basicos
└── Melhorias no chat IA

2025 Q2 (Abr-Jun)
├── Tutoria adaptativa (v1)
├── Code review entre pares
├── Portfolio publico
└── Notificacoes inteligentes

2025 Q3 (Jul-Set)
├── Revisao espacada
├── Desafios semanais
├── Tutoria adaptativa (v2)
└── Badges de competencia

2025 Q4 (Out-Dez)
├── Mentoria humana
├── Modo colaborativo
├── Integracao LeetCode
└── PWA avancado

2026 Q1+
├── Economia virtual
├── Extensao VS Code
├── IA generativa
└── Expansao internacional
```

---

## 7. Metricas de Sucesso por Feature

| Feature            | Metrica Principal | Meta         |
| ------------------ | ----------------- | ------------ |
| Quizzes            | Taxa de aprovacao | >70%         |
| Tutoria adaptativa | Satisfacao (NPS)  | >50          |
| Exercicios         | Conclusao         | >60%         |
| Code review        | Participacao      | 30% usuarios |
| Portfolio          | Visitas/usuario   | 10/mes       |
| Notificacoes       | Open rate         | >40%         |
| Revisao espacada   | Retencao 30d      | +25%         |

---

## 8. Estimativas de Esforco

| Feature            | Devs | Semanas | Prioridade |
| ------------------ | ---- | ------- | ---------- |
| Quizzes MVP        | 2    | 3       | Critica    |
| Exercicios basicos | 2    | 2       | Critica    |
| Tutoria v1         | 3    | 6       | Critica    |
| Code review        | 2    | 3       | Alta       |
| Portfolio          | 1    | 2       | Alta       |
| Notificacoes       | 1    | 2       | Alta       |
| Revisao espacada   | 2    | 3       | Alta       |
| Desafios semanais  | 1    | 2       | Media      |
| Mentoria humana    | 2    | 4       | Media      |

---

## 9. Dependencias Tecnicas

```
Quizzes
  └── Banco de questoes
      └── Exercicios
          └── Tutoria adaptativa
              └── Revisao espacada

Code Review
  └── Sistema de matching
      └── Mentoria humana

Portfolio
  └── Integracao GitHub melhorada
      └── Certificados verificaveis
```

---

## 10. Conclusao

Este roadmap representa uma visao ambiciosa mas realizavel para transformar a Agora Academy em uma plataforma de referencia em EdTech. As prioridades foram definidas com base em:

1. **Impacto pedagogico** - Features que melhoram aprendizado real
2. **Retencao de usuarios** - Features que trazem usuarios de volta
3. **Diferenciacao** - Features unicas no mercado
4. **Viabilidade tecnica** - Complexidade vs. recursos disponiveis

A execucao deve ser iterativa, com MVPs para validacao antes de investimento completo.

---

**Autor**: Anderson Henrique da Silva
**Revisao**: Time de Produto
**Ultima atualizacao**: 2025-12-09
