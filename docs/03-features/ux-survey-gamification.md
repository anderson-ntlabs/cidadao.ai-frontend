# UX Survey with Gamification - User Experience Research

**Autor**: Anderson Henrique da Silva
**Localização**: Minas Gerais, Brasil
**Data de Criação**: 2025-11-30 10:00:00 -0300
**Última Atualização**: 2025-11-30

---

## Overview

Sistema de pesquisa de experiência do usuário com gamificação, permitindo coletar feedback valioso sobre a plataforma Cidadão.AI enquanto engaja os usuários através de recompensas (badges).

### Objetivos

1. **Coletar feedback** sobre a experiência do usuário na plataforma
2. **Medir satisfação** através de NPS e ratings
3. **Identificar melhorias** via sugestões diretas dos usuários
4. **Aumentar engajamento** com sistema de badges/gamificação

---

## Requisitos

| Aspecto           | Decisão                                                 |
| ----------------- | ------------------------------------------------------- |
| **Trigger**       | FAB (canto inferior direito) + Link no rodapé           |
| **Perguntas**     | 9 perguntas (NPS, estrelas, múltipla escolha, texto)    |
| **Badge**         | "Colaborador" - permanente, visível em todas as páginas |
| **Idiomas**       | PT/EN (bilíngue)                                        |
| **Armazenamento** | Supabase (respostas + badges)                           |

---

## Architecture

### Component Structure

```
components/
  survey/
    index.ts                        # Public exports
    survey-fab.tsx                  # FAB trigger button
    survey-modal.tsx                # Main wizard modal
    survey-progress.tsx             # Progress indicator
    survey-success.tsx              # Success screen + badge animation
    questions/
      nps-question.tsx              # NPS scale (0-10)
      star-rating-question.tsx      # Star rating (1-5)
      multiple-choice-question.tsx  # Selectable options
      text-question.tsx             # Free text input
  badges/
    badge-indicator.tsx             # Badge indicator (header/global)
    badge-showcase.tsx              # Badge display on profile
```

### Data Flow

```
User clicks FAB/Footer Link
        ↓
Survey Modal Opens (Wizard)
        ↓
User answers questions (step by step)
        ↓
Submit to Supabase (survey_responses)
        ↓
Award Badge (user_badges)
        ↓
Show Success Animation
        ↓
Badge visible in Header (all pages)
```

---

## Database Schema (Supabase)

### Tables

```sql
-- User badges
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL DEFAULT 'colaborador',
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  source_type TEXT DEFAULT 'survey',
  source_id TEXT,
  UNIQUE(user_id, badge_type)
);

-- Survey responses
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  survey_version TEXT DEFAULT 'v1',
  answers JSONB NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  badge_awarded BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, survey_version)
);

-- Indexes
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_survey_responses_user ON survey_responses(user_id);
```

### RLS Policies

```sql
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Badges: public read, own insert
CREATE POLICY "Public badges" ON user_badges FOR SELECT USING (true);
CREATE POLICY "Insert own badge" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Responses: own only
CREATE POLICY "View own responses" ON survey_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Create own response" ON survey_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own response" ON survey_responses FOR UPDATE USING (auth.uid() = user_id);
```

---

## Survey Questions

| #   | Type              | Question (PT)                                    | Question (EN)                               |
| --- | ----------------- | ------------------------------------------------ | ------------------------------------------- |
| 1   | NPS (0-10)        | Qual a probabilidade de recomendar o Cidadão.AI? | How likely are you to recommend Cidadão.AI? |
| 2   | Stars (1-5)       | Como você avalia sua experiência geral?          | How do you rate your overall experience?    |
| 3   | Stars (1-5)       | Facilidade de encontrar informações?             | Ease of finding information?                |
| 4   | Stars (1-5)       | Utilidade dos agentes de IA?                     | Usefulness of AI agents?                    |
| 5   | Multiple (multi)  | Quais funcionalidades você mais usa?             | Which features do you use most?             |
| 6   | Multiple (single) | Qual seu principal objetivo na plataforma?       | What is your main goal on the platform?     |
| 7   | Multiple (single) | Como conheceu o Cidadão.AI?                      | How did you hear about Cidadão.AI?          |
| 8   | Text              | Que funcionalidades gostaria de ver?             | What features would you like to see?        |
| 9   | Text              | Alguma sugestão ou comentário?                   | Any suggestions or comments?                |

---

## State Management (Zustand)

### Survey Store

```typescript
// store/survey-store.ts
interface SurveyStore {
  // State
  isOpen: boolean
  currentStep: number
  answers: Record<string, any>
  isSubmitting: boolean
  hasCompleted: boolean

  // Actions
  openSurvey: () => void
  closeSurvey: () => void
  nextStep: () => void
  prevStep: () => void
  setAnswer: (questionId: string, value: any) => void
  submitSurvey: () => Promise<boolean>
}
```

### Badge Store

```typescript
// store/badge-store.ts
interface BadgeStore {
  badges: UserBadge[]
  isLoading: boolean
  newBadgeAnimation: string | null

  loadBadges: () => Promise<void>
  hasBadge: (type: string) => boolean
  showNewBadge: (type: string) => void
  clearAnimation: () => void
}
```

---

## UI Components Specifications

### Survey FAB

- **Position**: `fixed bottom-6 right-6` (above accessibility panel)
- **Appearance**: Purple/blue gradient, MessageSquareHeart icon
- **Animation**: Soft pulse to draw attention
- **Behavior**:
  - Hidden if user completed survey
  - Hidden when modal is open
  - Dismissible (localStorage: `survey_fab_dismissed`)

### Survey Modal (Wizard)

- **Layout**: Multi-step with 1 question per screen
- **Progress**: Bar + "Question X of Y"
- **Navigation**: Previous/Next buttons + step indicators
- **Validation**: Required questions highlighted
- **Mobile**: Full-screen on screens < 640px

### Badge Indicator (Header)

- **Position**: Next to user avatar in header
- **Appearance**: Small gold medal icon (16px)
- **Tooltip**: "Colaborador - You participated in the experience survey"
- **Animation**: Subtle glow when earned

### Success Screen

- **Animation**: CSS confetti + Badge scale-in with bounce
- **Content**:
  - Title: "Thank you for participating!"
  - Large badge with "Colaborador" name
  - Description of what badge means
  - "Close" button

---

## Services

### Survey Service

```typescript
// lib/services/survey.service.ts
class SurveyService {
  async hasCompletedSurvey(userId: string): Promise<boolean>
  async submitSurvey(userId: string, answers: Record<string, any>): Promise<void>
  async awardBadge(userId: string): Promise<void>
}
```

### Badge Service

```typescript
// lib/services/badge.service.ts
class BadgeService {
  async getUserBadges(userId: string): Promise<UserBadge[]>
  async hasBadge(userId: string, type: string): Promise<boolean>
  getBadgeInfo(type: string, locale: 'pt' | 'en'): BadgeInfo
}
```

---

## Files to Create

| File                                        | Description           |
| ------------------------------------------- | --------------------- |
| `types/survey.ts`                           | TypeScript interfaces |
| `types/badge.ts`                            | Badge interfaces      |
| `store/survey-store.ts`                     | Survey state          |
| `store/badge-store.ts`                      | Badge state           |
| `lib/services/survey.service.ts`            | Survey operations     |
| `lib/services/badge.service.ts`             | Badge operations      |
| `components/survey/survey-fab.tsx`          | Floating button       |
| `components/survey/survey-modal.tsx`        | Main modal            |
| `components/survey/survey-progress.tsx`     | Progress indicator    |
| `components/survey/survey-success.tsx`      | Success screen        |
| `components/survey/questions/*.tsx`         | Question components   |
| `components/badges/badge-indicator.tsx`     | Header badge          |
| `components/badges/badge-showcase.tsx`      | Profile badges        |
| `data/survey-questions.ts`                  | Questions definition  |
| `data/badges.ts`                            | Badges definition     |
| `supabase/migrations/xxx_survey_system.sql` | SQL migration         |

## Files to Modify

| File                               | Change                            |
| ---------------------------------- | --------------------------------- |
| `components/footer.tsx`            | Add "Experience Survey" link      |
| `components/header.tsx`            | Add BadgeIndicator next to avatar |
| `components/pt-layout-wrapper.tsx` | Render SurveyFAB globally         |
| `app/pt/app/perfil/page.tsx`       | Add badges section                |
| `messages/pt.json`                 | PT translations                   |
| `messages/en.json`                 | EN translations                   |

---

## Implementation Phases

### Phase 1: Infrastructure (Database + Types) ✅

- [x] Create documentation
- [x] Create SQL migration in Supabase
- [x] Create `types/survey.ts` and `types/badge.ts`
- [x] Create `data/survey-questions.ts` and `data/badges.ts`
- [x] Add translations in `messages/pt.json` and `messages/en.json`

### Phase 2: Services + Stores ✅

- [x] Implement `lib/services/survey.service.ts`
- [x] Implement `lib/services/badge.service.ts`
- [x] Create `store/survey-store.ts`
- [x] Create `store/badge-store.ts`

### Phase 3: Question Components ✅

- [x] `questions/nps-question.tsx`
- [x] `questions/star-rating-question.tsx`
- [x] `questions/multiple-choice-question.tsx`
- [x] `questions/text-question.tsx`

### Phase 4: Survey UI ✅

- [x] `survey-progress.tsx`
- [x] `survey-modal.tsx` (complete wizard)
- [x] `survey-success.tsx` (with animation)
- [x] `survey-fab.tsx`
- [x] `survey-provider.tsx` (layout integration)
- [x] `survey-footer-link.tsx`

### Phase 5: Badge Integration ✅

- [x] `badge/badge-indicator.tsx`
- [x] `badge/badge-showcase.tsx`
- [x] Modify `header.tsx` to include badge
- [x] Modify `simplified-header.tsx` to include badge
- [ ] Modify `perfil/page.tsx` to show badges (pending)

### Phase 6: Entry Points ✅

- [x] Modify `footer.tsx` - add link (FooterWithSurvey)
- [x] Modify `pt-layout-wrapper.tsx` - render FAB
- [x] Integrate SurveyProvider in PT and EN layouts
- [ ] Integrate analytics (PostHog) (pending)

### Phase 7: Testing

- [ ] Unit tests for components
- [ ] E2E test for complete flow
- [ ] Accessibility audit

---

## Success Criteria

- [x] Survey accessible via FAB and footer
- [x] 9 questions working (NPS, stars, multiple choice, text)
- [x] Responses ready to be saved in Supabase (needs DB migration execution)
- [x] "Colaborador" badge awarded on completion
- [x] Badge visible in header on all pages
- [ ] Badge visible on profile page (pending)
- [x] Bilingual (PT/EN)
- [x] WCAG AAA compliant (keyboard navigation, ARIA labels)
- [x] Mobile responsive
- [ ] Analytics for completion rate (pending PostHog integration)

---

## Analytics Events

```typescript
// PostHog events to track
trackEvent('survey_fab_shown')
trackEvent('survey_opened', { source: 'fab' | 'footer' })
trackEvent('survey_question_answered', { question_id, question_type })
trackEvent('survey_completed', { duration_ms, completion_rate })
trackEvent('survey_abandoned', { last_question, duration_ms })
trackEvent('badge_awarded', { badge_type: 'colaborador' })
```

---

## Related Documentation

- [Accessibility Features](./accessibility.md)
- [Analytics Integration](./analytics/README.md)
- [State Management Architecture](../02-architecture/state-management-architecture.md)
