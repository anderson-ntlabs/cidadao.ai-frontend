# Sistema de Avaliação

> Proposta de sistema de avaliação formativa e somativa para a Ágora Academy

---

## 1. Visão Geral

O sistema de avaliação da Ágora Academy é fundamentado em princípios de avaliação autêntica, priorizando a demonstração de competências através de produção real de código sobre métodos tradicionais de prova.

### 1.1 Princípios da Avaliação

```
+------------------------------------------------------------------+
|                    PRINCÍPIOS DE AVALIAÇÃO                        |
+------------------------------------------------------------------+
|                                                                    |
|  1. AUTÊNTICA     - Avalia produção real, não simulações          |
|  2. FORMATIVA     - Feedback contínuo para melhoria               |
|  3. TRANSPARENTE  - Critérios claros e públicos                   |
|  4. MÚLTIPLA      - Várias formas de demonstrar competência       |
|  5. INCLUSIVA     - Respeita diferentes estilos de aprendizagem   |
|                                                                    |
+------------------------------------------------------------------+
```

### 1.2 Tipos de Avaliação

| Tipo        | Propósito                          | Frequência       |
| ----------- | ---------------------------------- | ---------------- |
| Diagnóstica | Identificar conhecimentos prévios  | Início de trilha |
| Formativa   | Orientar aprendizagem em curso     | Contínua         |
| Somativa    | Certificar competências adquiridas | Final de módulo  |
| Por Pares   | Desenvolver pensamento crítico     | Durante PRs      |

---

## 2. Instrumentos de Avaliação

### 2.1 Quizzes de Verificação

**Objetivo**: Verificar compreensão de conceitos fundamentais.

| Característica    | Especificação                          |
| ----------------- | -------------------------------------- |
| Formato           | Múltipla escolha, V/F, correspondência |
| Questões por quiz | 5-10 questões                          |
| Tempo limite      | 10-15 minutos                          |
| Tentativas        | Ilimitadas (melhor nota)               |
| Nota mínima       | 70% para aprovação                     |
| XP concedido      | 20-30 XP                               |

**Estrutura de Questão**:

```typescript
interface QuizQuestion {
  id: string
  moduleId: string
  type: 'multiple_choice' | 'true_false' | 'matching'
  question: string
  options: string[]
  correctAnswer: number | number[]
  explanation: string // Mostrado após resposta
  difficulty: 'easy' | 'medium' | 'hard'
  bloomLevel: 'remember' | 'understand' | 'apply' | 'analyze'
}
```

### 2.2 Exercícios de Código

**Objetivo**: Aplicar conhecimentos em problemas práticos.

| Característica | Especificação                          |
| -------------- | -------------------------------------- |
| Ambiente       | Sandbox integrado ou repositório local |
| Validação      | Testes automatizados                   |
| Feedback       | Imediato (passar/falhar + dicas)       |
| Tentativas     | Ilimitadas                             |
| XP concedido   | 25-50 XP por exercício                 |

**Níveis de Exercício**:

```
NÍVEL 1: GUIADO
+----------------------------------+
| Código parcialmente escrito      |
| Comentários indicam o que fazer  |
| Testes simples pré-definidos     |
+----------------------------------+

NÍVEL 2: ESTRUTURADO
+----------------------------------+
| Estrutura definida               |
| Você implementa as funções       |
| Testes mais complexos            |
+----------------------------------+

NÍVEL 3: ABERTO
+----------------------------------+
| Apenas especificação             |
| Liberdade de implementação       |
| Testes de comportamento          |
+----------------------------------+
```

### 2.3 Code Review (Avaliação por Pares)

**Objetivo**: Desenvolver habilidades de análise crítica e colaboração.

| Aspecto          | Critério                                   |
| ---------------- | ------------------------------------------ |
| Quem avalia      | Outros estudantes + mentor IA              |
| O que avaliar    | PRs de exercícios e projetos               |
| Critérios        | Checklist padronizado + comentários livres |
| XP por review    | 10-20 XP (revisor)                         |
| XP por PR aceito | 50-100 XP (autor)                          |

**Rubrica de Code Review**:

```
+------------------------------------------------------------------+
|                    CHECKLIST DE CODE REVIEW                       |
+------------------------------------------------------------------+
|                                                                    |
|  FUNCIONALIDADE                                                    |
|  [ ] O código resolve o problema proposto?                        |
|  [ ] Casos de borda são tratados?                                 |
|  [ ] Não introduz bugs ou regressões?                             |
|                                                                    |
|  QUALIDADE                                                         |
|  [ ] Código é legível e bem formatado?                            |
|  [ ] Nomes de variáveis/funções são descritivos?                  |
|  [ ] Não há duplicação desnecessária?                             |
|                                                                    |
|  BOAS PRÁTICAS                                                     |
|  [ ] Segue os padrões do projeto?                                 |
|  [ ] Tem testes adequados?                                        |
|  [ ] Documentação onde necessário?                                |
|                                                                    |
|  SEGURANÇA                                                         |
|  [ ] Não expõe dados sensíveis?                                   |
|  [ ] Valida inputs corretamente?                                  |
|  [ ] Não introduz vulnerabilidades conhecidas?                    |
|                                                                    |
+------------------------------------------------------------------+
```

### 2.4 Projetos Práticos

**Objetivo**: Demonstrar competência integrada em cenário real.

| Tipo           | Descrição                                  | XP      |
| -------------- | ------------------------------------------ | ------- |
| Projeto Guiado | Issue simples com instruções detalhadas    | 50-80   |
| Projeto Aberto | Issue complexa com liberdade de solução    | 80-150  |
| Projeto Final  | Feature completa com múltiplos componentes | 150-300 |

**Critérios de Avaliação de Projeto**:

| Dimensão            | Peso | Descrição                            |
| ------------------- | ---- | ------------------------------------ |
| Funcionalidade      | 40%  | Resolve o problema corretamente      |
| Qualidade de código | 25%  | Clean code, legibilidade, manutenção |
| Testes              | 15%  | Cobertura e qualidade dos testes     |
| Documentação        | 10%  | README, comentários, commits         |
| Colaboração         | 10%  | Resposta a feedback, comunicação     |

---

## 3. Sistema de Feedback

### 3.1 Feedback Automatizado

```typescript
interface AutomatedFeedback {
  // Feedback de quiz
  quizFeedback: {
    correct: boolean
    explanation: string
    relatedResources: string[]
  }

  // Feedback de código
  codeFeedback: {
    testsPass: boolean
    testResults: TestResult[]
    lintErrors: LintError[]
    suggestions: string[]
    performanceMetrics?: PerformanceResult
  }

  // Feedback de PR
  prFeedback: {
    checksPass: boolean
    codeQualityScore: number
    securityIssues: SecurityIssue[]
    aiReviewComments: ReviewComment[]
  }
}
```

### 3.2 Feedback do Mentor IA

O mentor IA fornece feedback personalizado baseado no contexto:

```typescript
async function getMentorFeedback(
  submission: Submission,
  studentHistory: StudentHistory
): Promise<MentorFeedback> {
  const context = {
    currentModule: submission.moduleId,
    previousAttempts: studentHistory.attempts,
    commonMistakes: studentHistory.mistakes,
    learningStyle: studentHistory.preferredStyle,
  }

  return await mentorAI.generateFeedback(submission, context)
}
```

**Tipos de Feedback do Mentor**:

| Situação             | Tipo de Feedback                      |
| -------------------- | ------------------------------------- |
| Primeira tentativa   | Encorajador, dicas conceituais        |
| Múltiplas tentativas | Mais específico, exemplos de código   |
| Erro comum           | Explicação detalhada, recursos extras |
| Sucesso              | Celebração, desafio extra opcional    |
| Excelência           | Reconhecimento, sugestão de mentoria  |

### 3.3 Feedback Humano

| Fonte                | Quando                        | Formato            |
| -------------------- | ----------------------------- | ------------------ |
| Code review de pares | PRs de projeto                | Comentários GitHub |
| Mentor humano        | Casos complexos, certificação | Reunião/chat       |
| Comunidade           | Dúvidas no fórum/Discord      | Texto assíncrono   |

---

## 4. Rubricas de Avaliação

### 4.1 Rubrica Geral de Competências

| Nível        | Descrição                                     | XP Mult |
| ------------ | --------------------------------------------- | ------- |
| Iniciante    | Compreende conceitos básicos com apoio        | 0.5x    |
| Em Progresso | Aplica conhecimentos em situações familiares  | 0.75x   |
| Proficiente  | Resolve problemas novos de forma independente | 1.0x    |
| Avançado     | Otimiza soluções e ajuda outros               | 1.25x   |
| Expert       | Contribui para o conhecimento coletivo        | 1.5x    |

### 4.2 Rubrica de Código

```
+------------------------------------------------------------------+
|                    RUBRICA DE QUALIDADE DE CÓDIGO                 |
+------------------------------------------------------------------+

NÍVEL 1 - INICIANTE (1-2 pontos)
- Código funciona mas com problemas significativos
- Nomes pouco descritivos
- Estrutura desorganizada
- Sem tratamento de erros

NÍVEL 2 - EM PROGRESSO (3-4 pontos)
- Código funciona corretamente
- Nomes razoáveis
- Alguma organização
- Tratamento básico de erros

NÍVEL 3 - PROFICIENTE (5-6 pontos)
- Código limpo e bem organizado
- Nomes descritivos e consistentes
- Boa separação de responsabilidades
- Tratamento adequado de erros

NÍVEL 4 - AVANÇADO (7-8 pontos)
- Código elegante e eficiente
- Padrões de design apropriados
- Documentação clara
- Testes abrangentes

NÍVEL 5 - EXPERT (9-10 pontos)
- Código exemplar, serve de referência
- Otimizado para performance
- Extensível e manutenível
- Contribuição significativa ao projeto
```

### 4.3 Rubrica de Colaboração

| Dimensão          | Excelente                      | Bom                    | Regular                | Precisa Melhorar            |
| ----------------- | ------------------------------ | ---------------------- | ---------------------- | --------------------------- |
| Comunicação       | Clara, respeitosa, construtiva | Adequada na maioria    | Ocasionalmente confusa | Frequentemente problemática |
| Receptividade     | Aceita feedback positivamente  | Geralmente receptivo   | Às vezes defensivo     | Resistente a mudanças       |
| Contribuição      | Ativa e significativa          | Regular e útil         | Esporádica             | Mínima                      |
| Código de conduta | Modelo para outros             | Segue consistentemente | Segue parcialmente     | Violações frequentes        |

---

## 5. Progressão e Certificação

### 5.1 Critérios de Certificação

| Requisito                  | Especificação                 |
| -------------------------- | ----------------------------- |
| Módulos completos          | 100% da trilha                |
| Média de quizzes           | ≥ 70%                         |
| Projeto final aprovado     | PR merged no Cidadão.AI       |
| Code reviews realizados    | Mínimo 3 reviews              |
| Participação na comunidade | Mínimo 5 interações positivas |

### 5.2 Níveis de Certificação

```
CERTIFICADO BÁSICO
- Trilha Introdução completa
- Demonstra fundamentos de programação
- Contribuiu com código ao projeto

CERTIFICADO ESPECIALISTA
- Trilha de especialização completa
- Projeto final de alta qualidade
- Histórico de colaboração positiva

CERTIFICADO DE MÉRITO
- Múltiplas trilhas completas
- Contribuições significativas
- Mentoria de outros estudantes
- Reconhecimento da comunidade
```

### 5.3 Validação de Certificado

```typescript
interface Certificate {
  id: string
  studentId: string
  studentName: string
  trackId: string
  trackName: string
  issuedAt: Date
  validationCode: string // Hash único
  achievements: {
    totalXp: number
    prsAccepted: number
    badgesEarned: string[]
    quizAverage: number
  }
  qrCode: string // URL de verificação
}

// Endpoint de verificação pública
// GET /api/certificates/verify/:validationCode
```

---

## 6. Implementação Técnica

### 6.1 Schema do Banco de Dados

```sql
-- Submissões de quiz
CREATE TABLE agora_quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  quiz_id TEXT NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER,
  max_score INTEGER,
  percentage DECIMAL(5,2),
  time_spent_seconds INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissões de exercício
CREATE TABLE agora_exercise_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  exercise_id TEXT NOT NULL,
  code TEXT,
  tests_passed INTEGER,
  total_tests INTEGER,
  feedback JSONB,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Avaliações de projeto
CREATE TABLE agora_project_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  project_id TEXT NOT NULL,
  pr_url TEXT,
  evaluator_type TEXT,  -- 'peer', 'mentor', 'ai'
  evaluator_id TEXT,
  scores JSONB,
  comments TEXT,
  overall_score DECIMAL(3,2),
  evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificados
CREATE TABLE agora_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  track_id TEXT NOT NULL,
  validation_code TEXT UNIQUE NOT NULL,
  achievements JSONB NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  UNIQUE(user_id, track_id)
);
```

### 6.2 Serviço de Avaliação

```typescript
// services/evaluation.service.ts (proposta)
class EvaluationService {
  async submitQuiz(userId: string, quizId: string, answers: QuizAnswer[]): Promise<QuizResult> {
    // 1. Buscar quiz e respostas corretas
    const quiz = await this.getQuiz(quizId)

    // 2. Calcular pontuação
    const { score, maxScore, details } = this.gradeQuiz(quiz, answers)

    // 3. Persistir submissão
    await this.saveQuizSubmission(userId, quizId, {
      answers,
      score,
      maxScore,
      percentage: (score / maxScore) * 100,
    })

    // 4. Conceder XP se aprovado
    if (score / maxScore >= 0.7) {
      await this.agoraService.addXp(userId, quiz.xpReward, 'quiz', `Quiz ${quizId}`)
    }

    // 5. Retornar resultado com feedback
    return {
      score,
      maxScore,
      passed: score / maxScore >= 0.7,
      feedback: this.generateQuizFeedback(quiz, answers, details),
    }
  }

  async evaluateCode(
    userId: string,
    exerciseId: string,
    code: string
  ): Promise<CodeEvaluationResult> {
    // 1. Executar testes
    const testResults = await this.runTests(exerciseId, code)

    // 2. Análise estática
    const lintResults = await this.runLinter(code)

    // 3. Feedback do mentor IA
    const aiFeedback = await this.mentorService.reviewCode(code, exerciseId)

    // 4. Persistir e retornar
    return {
      testsPassed: testResults.passed,
      totalTests: testResults.total,
      lintErrors: lintResults.errors,
      aiFeedback,
      suggestions: this.generateSuggestions(testResults, lintResults),
    }
  }
}
```

---

## 7. Boas Práticas de Avaliação

### 7.1 Para Criadores de Conteúdo

- Alinhar avaliações aos objetivos de aprendizagem
- Usar taxonomia de Bloom para variar níveis cognitivos
- Incluir exemplos e contra-exemplos
- Testar questões antes de publicar
- Revisar itens com baixo índice de discriminação

### 7.2 Para Estudantes

- Revisar feedback antes de nova tentativa
- Usar recursos sugeridos pelo mentor
- Participar ativamente de code reviews
- Buscar ajuda quando necessário
- Refletir sobre o processo de aprendizagem

### 7.3 Para a Plataforma

- Monitorar métricas de dificuldade
- Identificar questões problemáticas
- Calibrar XP e tempo esperado
- Garantir acessibilidade das avaliações
- Prevenir cola e fraude

---

## 8. Referências

- Wiggins, G. & McTighe, J. (2005). Understanding by Design. ASCD.
- Anderson, L. W. & Krathwohl, D. R. (2001). A Taxonomy for Learning, Teaching, and Assessing. Longman.
- Black, P. & Wiliam, D. (1998). Assessment and Classroom Learning. Assessment in Education.
- Sadler, D. R. (1989). Formative Assessment and the Design of Instructional Systems. Instructional Science.

---

**Autor**: Anderson Henrique da Silva
**Última atualização**: 2025-12-09
**Status**: Proposta (não implementado)
