# Sistema de Trilhas e Módulos

> Documentação completa das trilhas de aprendizagem da Ágora Academy

---

## 1. Visão Geral

As trilhas de aprendizagem são percursos estruturados que guiam o estudante desde conceitos básicos até habilidades avançadas de desenvolvimento de software. Cada trilha é composta por módulos sequenciais que progridem em complexidade.

### 1.1 Princípios de Design das Trilhas

```
+------------------------------------------------------------------+
|                    PRINCÍPIOS DAS TRILHAS                         |
+------------------------------------------------------------------+
|                                                                    |
|  1. PROGRESSÃO     - Do simples ao complexo                       |
|  2. PRÁTICA        - Aprender fazendo (hands-on)                  |
|  3. RELEVÂNCIA     - Conectado ao projeto Cidadão.AI              |
|  4. FLEXIBILIDADE  - Múltiplos caminhos possíveis                 |
|  5. MENSURAÇÃO     - Progresso claro e verificável                |
|                                                                    |
+------------------------------------------------------------------+
```

---

## 2. Trilhas Disponíveis

### 2.1 Mapa de Trilhas

```
                        TRILHAS ÁGORA
                             |
         +-------------------+-------------------+
         |                   |                   |
    INTRODUÇÃO          CORE SKILLS        ESPECIALIZAÇÃO
    (Obrigatório)       (Escolher 1+)      (Opcional)
         |                   |                   |
    +----+----+      +------+------+     +------+------+
    |         |      |      |      |     |      |      |
   Git    Básico   Back   Front   IA   DevOps  Mobile  Data
   Setup   Dev     end    end    /ML

```

### 2.2 Trilha: Introdução ao Desenvolvimento

| Atributo      | Valor                              |
| ------------- | ---------------------------------- |
| ID            | `intro`                            |
| Duração       | 2-3 semanas                        |
| Pré-requisito | Nenhum                             |
| Obrigatória   | Sim (para todas as outras trilhas) |
| XP Total      | ~300 XP                            |

**Módulos**:

| #   | Módulo                     | Conteúdo                         | XP  |
| --- | -------------------------- | -------------------------------- | --- |
| 1   | Bem-vindo à Ágora          | Plataforma, missão, comunidade   | 20  |
| 2   | Configurando o Ambiente    | Git, GitHub, VS Code, Node.js    | 40  |
| 3   | Fundamentos de Programação | Variáveis, funções, estruturas   | 50  |
| 4   | Versionamento com Git      | Commits, branches, PRs           | 60  |
| 5   | Seu Primeiro PR            | Contribuição real no Cidadão.AI  | 80  |
| 6   | Boas Práticas              | Clean code, testes, documentação | 50  |

### 2.3 Trilha: Backend com Python/FastAPI

| Atributo      | Valor             |
| ------------- | ----------------- |
| ID            | `backend`         |
| Duração       | 4-6 semanas       |
| Pré-requisito | Trilha Introdução |
| XP Total      | ~600 XP           |

**Módulos**:

| #   | Módulo                   | Conteúdo                       | XP  |
| --- | ------------------------ | ------------------------------ | --- |
| 1   | Introdução ao Python     | Sintaxe, tipos, funções        | 50  |
| 2   | POO em Python            | Classes, herança, polimorfismo | 60  |
| 3   | FastAPI Básico           | Rotas, endpoints, validação    | 80  |
| 4   | Banco de Dados           | SQL, PostgreSQL, ORM           | 100 |
| 5   | Autenticação e Segurança | JWT, OAuth, CORS               | 90  |
| 6   | Testes Automatizados     | Pytest, TDD, mocks             | 80  |
| 7   | Deploy e CI/CD           | Docker, GitHub Actions         | 80  |
| 8   | Projeto Final            | Feature completa no Cidadão.AI | 60  |

### 2.4 Trilha: Frontend com React/Next.js

| Atributo      | Valor             |
| ------------- | ----------------- |
| ID            | `frontend`        |
| Duração       | 4-6 semanas       |
| Pré-requisito | Trilha Introdução |
| XP Total      | ~600 XP           |

**Módulos**:

| #   | Módulo                 | Conteúdo                       | XP  |
| --- | ---------------------- | ------------------------------ | --- |
| 1   | HTML/CSS Moderno       | Semântica, Flexbox, Grid       | 50  |
| 2   | JavaScript Essencial   | ES6+, async/await, DOM         | 60  |
| 3   | TypeScript Fundamentos | Tipos, interfaces, generics    | 70  |
| 4   | React Básico           | Componentes, props, state      | 80  |
| 5   | React Avançado         | Hooks, Context, performance    | 90  |
| 6   | Next.js                | SSR, App Router, API Routes    | 100 |
| 7   | Acessibilidade         | WCAG, ARIA, screen readers     | 70  |
| 8   | Projeto Final          | Feature completa no Cidadão.AI | 80  |

### 2.5 Trilha: IA e Machine Learning

| Atributo      | Valor          |
| ------------- | -------------- |
| ID            | `ai-ml`        |
| Duração       | 6-8 semanas    |
| Pré-requisito | Trilha Backend |
| XP Total      | ~800 XP        |

**Módulos**:

| #   | Módulo                   | Conteúdo                           | XP  |
| --- | ------------------------ | ---------------------------------- | --- |
| 1   | Fundamentos de IA        | Conceitos, história, aplicações    | 50  |
| 2   | Python para Data Science | NumPy, Pandas, visualização        | 70  |
| 3   | Machine Learning Básico  | Regressão, classificação           | 100 |
| 4   | Deep Learning            | Redes neurais, TensorFlow/PyTorch  | 120 |
| 5   | NLP e LLMs               | Processamento de texto, embeddings | 130 |
| 6   | Agentes Inteligentes     | LangChain, RAG, orquestração       | 150 |
| 7   | MLOps                    | Deploy de modelos, monitoramento   | 100 |
| 8   | Projeto Final            | Agente para o Cidadão.AI           | 80  |

### 2.6 Trilha: DevOps e Infraestrutura

| Atributo      | Valor          |
| ------------- | -------------- |
| ID            | `devops`       |
| Duração       | 4-5 semanas    |
| Pré-requisito | Trilha Backend |
| XP Total      | ~500 XP        |

**Módulos**:

| #   | Módulo              | Conteúdo                        | XP  |
| --- | ------------------- | ------------------------------- | --- |
| 1   | Linux Essencial     | Comandos, permissões, shell     | 50  |
| 2   | Docker              | Containers, Dockerfile, Compose | 80  |
| 3   | CI/CD               | GitHub Actions, pipelines       | 80  |
| 4   | Cloud Computing     | AWS/GCP/Azure básico            | 90  |
| 5   | Monitoramento       | Logs, métricas, alertas         | 70  |
| 6   | Segurança DevSecOps | Scanning, secrets, compliance   | 80  |
| 7   | Projeto Final       | Pipeline completo no Cidadão.AI | 50  |

---

## 3. Estrutura de um Módulo

### 3.1 Componentes do Módulo

```
MÓDULO
  |
  +-- Introdução (5 min)
  |     |-- Objetivos de aprendizagem
  |     |-- Pré-requisitos
  |     +-- Contexto no projeto
  |
  +-- Conteúdo Teórico (15-30 min)
  |     |-- Vídeo explicativo
  |     |-- Leitura complementar
  |     +-- Exemplos de código
  |
  +-- Prática Guiada (30-60 min)
  |     |-- Exercícios passo-a-passo
  |     |-- Sandbox interativo
  |     +-- Mentor IA disponível
  |
  +-- Desafio (30-60 min)
  |     |-- Issue real do Cidadão.AI
  |     |-- PR com code review
  |     +-- Feedback automatizado
  |
  +-- Avaliação
        |-- Quiz de verificação
        |-- Autoavaliação
        +-- Badge de conclusão
```

### 3.2 Tipos de Conteúdo

| Tipo      | Formato            | XP Base | Duração Típica |
| --------- | ------------------ | ------- | -------------- |
| Vídeo     | MP4, YouTube embed | 15      | 5-15 min       |
| Leitura   | Markdown           | 10      | 10-20 min      |
| Exercício | Código interativo  | 25      | 20-40 min      |
| Quiz      | Múltipla escolha   | 20      | 5-10 min       |
| Projeto   | PR no GitHub       | 50-100  | 1-4 horas      |

---

## 4. Sistema de Pré-requisitos

### 4.1 Grafo de Dependências

```
                    intro
                      |
         +------------+------------+
         |            |            |
      backend      frontend      (paralelo)
         |            |
         +-----+------+
               |
            ai-ml
               |
            devops (opcional)
```

### 4.2 Verificação de Pré-requisitos

```typescript
// hooks/use-agora.tsx (proposta)
interface TrackPrerequisites {
  trackId: string
  requiredTracks: string[]
  requiredBadges?: string[]
  requiredXp?: number
}

const TRACK_PREREQUISITES: TrackPrerequisites[] = [
  { trackId: 'intro', requiredTracks: [] },
  { trackId: 'backend', requiredTracks: ['intro'] },
  { trackId: 'frontend', requiredTracks: ['intro'] },
  { trackId: 'ai-ml', requiredTracks: ['backend'] },
  { trackId: 'devops', requiredTracks: ['backend'] },
]

function canStartTrack(userId: string, trackId: string): boolean {
  const prereqs = TRACK_PREREQUISITES.find((t) => t.trackId === trackId)
  const userProgress = getUserProgress(userId)

  return prereqs.requiredTracks.every((reqTrack) => userProgress.completedTracks.includes(reqTrack))
}
```

---

## 5. Progressão e Conclusão

### 5.1 Critérios de Conclusão de Módulo

| Critério             | Obrigatório | Descrição                           |
| -------------------- | ----------- | ----------------------------------- |
| Vídeo assistido      | Sim         | 90%+ do vídeo visualizado           |
| Leitura concluída    | Sim         | Marcado como lido                   |
| Exercícios completos | Sim         | Todos os exercícios passando        |
| Quiz aprovado        | Sim         | Nota ≥ 70%                          |
| PR aceito            | Não\*       | \*Obrigatório em módulos de projeto |

### 5.2 Critérios de Conclusão de Trilha

| Critério          | Requisito                     |
| ----------------- | ----------------------------- |
| Módulos completos | 100% dos módulos obrigatórios |
| XP mínimo         | 80% do XP total da trilha     |
| Projeto final     | PR aprovado no Cidadão.AI     |
| Badge de trilha   | Automaticamente concedido     |

### 5.3 Certificação

```
+------------------------------------------------------------------+
|                    CERTIFICADO DE CONCLUSÃO                       |
+------------------------------------------------------------------+
|                                                                    |
|  Certificamos que                                                  |
|                                                                    |
|                    [NOME DO ESTUDANTE]                             |
|                                                                    |
|  Completou com êxito a trilha                                      |
|                                                                    |
|              FRONTEND COM REACT/NEXT.JS                            |
|                                                                    |
|  Contribuindo com código real para o projeto Cidadão.AI            |
|                                                                    |
|  Competências desenvolvidas:                                       |
|  - React e Next.js                                                 |
|  - TypeScript                                                      |
|  - Acessibilidade Web                                              |
|  - Contribuição Open Source                                        |
|                                                                    |
|  XP Total: 580 | Badges: 12 | PRs: 3                               |
|                                                                    |
|  QR Code: [verificação]    Data: [data]                            |
|                                                                    |
+------------------------------------------------------------------+
```

---

## 6. Mentoria com IA

### 6.1 Mentores por Trilha

| Trilha     | Mentor IA     | Especialidade                    |
| ---------- | ------------- | -------------------------------- |
| Introdução | Santos-Dumont | Inovação, primeiros passos       |
| Backend    | Zumbi         | Robustez, segurança, performance |
| Frontend   | Lina Bo Bardi | Design, UX, acessibilidade       |
| IA/ML      | Abaporu       | Criatividade, orquestração       |
| DevOps     | Tiradentes    | Organização, processos, reports  |

### 6.2 Funcionalidades do Mentor

```typescript
interface MentorCapabilities {
  // Assistência contextual
  explainConcept(concept: string): Promise<string>
  reviewCode(code: string): Promise<CodeReview>
  suggestResources(topic: string): Promise<Resource[]>

  // Motivação
  encourageProgress(streak: number): Promise<string>
  celebrateAchievement(badge: Badge): Promise<string>

  // Suporte técnico
  debugError(error: Error): Promise<string>
  guideExercise(exerciseId: string): Promise<Hint[]>
}
```

---

## 7. Métricas de Trilhas

### 7.1 KPIs por Trilha

| Métrica                  | Meta      | Descrição                          |
| ------------------------ | --------- | ---------------------------------- |
| Taxa de início           | >80%      | Usuários que iniciam após cadastro |
| Taxa de conclusão        | >60%      | Usuários que finalizam a trilha    |
| Tempo médio de conclusão | ±30% prev | Desvio do tempo previsto           |
| NPS da trilha            | >50       | Satisfação dos concluintes         |
| PRs aceitos              | >90%      | Taxa de aprovação de projetos      |

### 7.2 Dashboard de Progresso

```
+------------------------------------------------------------------+
|                    MEU PROGRESSO                                   |
+------------------------------------------------------------------+
|                                                                    |
|  Trilha: Frontend com React/Next.js                                |
|                                                                    |
|  [████████████████░░░░░░░░] 65%                                    |
|                                                                    |
|  Módulos:                                                          |
|  ✅ HTML/CSS Moderno                                               |
|  ✅ JavaScript Essencial                                           |
|  ✅ TypeScript Fundamentos                                         |
|  ✅ React Básico                                                   |
|  🔄 React Avançado (em andamento)                                  |
|  🔒 Next.js                                                        |
|  🔒 Acessibilidade                                                 |
|  🔒 Projeto Final                                                  |
|                                                                    |
|  XP na trilha: 350/600                                             |
|  Tempo investido: 12h 30min                                        |
|  Próximo badge: "Mestre do Frontend"                               |
|                                                                    |
+------------------------------------------------------------------+
```

---

## 8. Implementação Técnica

### 8.1 Schema do Banco de Dados

```sql
-- Tabela de trilhas
CREATE TABLE agora_tracks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER,
  total_xp INTEGER,
  prerequisites TEXT[] DEFAULT '{}',
  is_required BOOLEAN DEFAULT FALSE,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de módulos
CREATE TABLE agora_modules (
  id TEXT PRIMARY KEY,
  track_id TEXT REFERENCES agora_tracks(id),
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER,
  xp_reward INTEGER,
  estimated_minutes INTEGER,
  content JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progresso do usuário
CREATE TABLE agora_track_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  track_id TEXT REFERENCES agora_tracks(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  current_module_id TEXT,
  modules_completed TEXT[] DEFAULT '{}',
  xp_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, track_id)
);

-- Progresso de módulo
CREATE TABLE agora_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  module_id TEXT REFERENCES agora_modules(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  quiz_score INTEGER,
  time_spent_minutes INTEGER,
  UNIQUE(user_id, module_id)
);
```

### 8.2 Hooks de Progresso

```typescript
// hooks/use-track-progress.ts (proposta)
export function useTrackProgress(trackId: string) {
  const [progress, setProgress] = useState<TrackProgress | null>(null)
  const { user } = useAgora()

  useEffect(() => {
    async function fetchProgress() {
      const { data } = await supabase
        .from('agora_track_progress')
        .select(
          `
          *,
          track:agora_tracks(*),
          module_progress:agora_module_progress(*)
        `
        )
        .eq('user_id', user.id)
        .eq('track_id', trackId)
        .single()

      setProgress(data)
    }

    if (user) fetchProgress()
  }, [user, trackId])

  const completeModule = async (moduleId: string, quizScore?: number) => {
    // Marcar módulo como completo
    await supabase.from('agora_module_progress').upsert({
      user_id: user.id,
      module_id: moduleId,
      completed_at: new Date().toISOString(),
      quiz_score: quizScore,
    })

    // Atualizar progresso da trilha
    const newCompleted = [...progress.modules_completed, moduleId]
    await supabase
      .from('agora_track_progress')
      .update({
        modules_completed: newCompleted,
        current_module_id: getNextModule(trackId, newCompleted),
      })
      .eq('id', progress.id)

    // Verificar conclusão da trilha
    if (isTrackComplete(trackId, newCompleted)) {
      await completeTrack(trackId)
    }
  }

  return { progress, completeModule }
}
```

---

## 9. Roadmap de Trilhas

### 9.1 Curto Prazo (Q1 2025)

| Item                       | Status       | Prioridade |
| -------------------------- | ------------ | ---------- |
| Trilha Introdução completa | Em progresso | Alta       |
| Trilha Backend (50%)       | Planejado    | Alta       |
| Trilha Frontend (50%)      | Planejado    | Alta       |
| Sistema de pré-requisitos  | A fazer      | Média      |

### 9.2 Médio Prazo (Q2-Q3 2025)

| Item                     | Status  | Prioridade |
| ------------------------ | ------- | ---------- |
| Trilha Backend completa  | A fazer | Alta       |
| Trilha Frontend completa | A fazer | Alta       |
| Trilha IA/ML (básica)    | A fazer | Média      |
| Sistema de certificação  | A fazer | Média      |

### 9.3 Longo Prazo (Q4 2025+)

| Item                   | Status  | Prioridade |
| ---------------------- | ------- | ---------- |
| Trilha DevOps          | A fazer | Baixa      |
| Trilha Mobile          | A fazer | Baixa      |
| Trilhas personalizadas | Ideação | Baixa      |
| Marketplace de módulos | Ideação | Baixa      |

---

## 10. Referências

- Kolb, D. A. (1984). Experiential Learning. Prentice-Hall.
- Bloom, B. S. (1956). Taxonomy of Educational Objectives. Longman.
- Sweller, J. (1988). Cognitive Load During Problem Solving. Cognitive Science.
- GitHub Skills. (2024). Learning Paths. GitHub Docs.

---

**Autor**: Anderson Henrique da Silva
**Última atualização**: 2025-12-09
**Código fonte**: `app/pt/agora/trilhas/`, `hooks/use-track-progress.ts` (proposta)
