/**
 * Survey Questions Definition
 *
 * UX Survey questions for Cidadao.AI platform
 * @author Anderson Henrique da Silva
 * @date 2025-11-30
 */

import type { SurveyQuestion } from '@/types/survey'

export const SURVEY_VERSION = 'v1'

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  // Question 1: NPS
  {
    id: 'nps',
    type: 'nps',
    question_pt:
      'Em uma escala de 0 a 10, qual a probabilidade de você recomendar o Cidadão.AI para um amigo ou colega?',
    question_en:
      'On a scale of 0 to 10, how likely are you to recommend Cidadão.AI to a friend or colleague?',
    required: true,
    min: 0,
    max: 10,
  },

  // Question 2: Overall Experience
  {
    id: 'overall_experience',
    type: 'stars',
    question_pt: 'Como você avalia sua experiência geral com a plataforma?',
    question_en: 'How do you rate your overall experience with the platform?',
    required: true,
    min: 1,
    max: 5,
  },

  // Question 3: Ease of Finding Information
  {
    id: 'ease_of_use',
    type: 'stars',
    question_pt: 'Qual a facilidade de encontrar as informações que você procura?',
    question_en: 'How easy is it to find the information you are looking for?',
    required: true,
    min: 1,
    max: 5,
  },

  // Question 4: AI Agents Usefulness
  {
    id: 'agents_usefulness',
    type: 'stars',
    question_pt: 'Quão úteis são os agentes de IA para suas consultas?',
    question_en: 'How useful are the AI agents for your queries?',
    required: true,
    min: 1,
    max: 5,
  },

  // Question 5: Most Used Features (Multiple)
  {
    id: 'most_used_features',
    type: 'multiple_multi',
    question_pt: 'Quais funcionalidades você mais utiliza? (selecione todas que se aplicam)',
    question_en: 'Which features do you use most? (select all that apply)',
    required: true,
    options: [
      {
        value: 'chat',
        label_pt: 'Chat com agentes de IA',
        label_en: 'Chat with AI agents',
      },
      {
        value: 'investigations',
        label_pt: 'Investigações de transparência',
        label_en: 'Transparency investigations',
      },
      {
        value: 'dashboard',
        label_pt: 'Dashboard de métricas',
        label_en: 'Metrics dashboard',
      },
      {
        value: 'contracts',
        label_pt: 'Consulta de contratos',
        label_en: 'Contract queries',
      },
      {
        value: 'exports',
        label_pt: 'Exportação de dados',
        label_en: 'Data exports',
      },
      {
        value: 'other',
        label_pt: 'Outras',
        label_en: 'Other',
      },
    ],
  },

  // Question 6: Primary Goal (Single)
  {
    id: 'primary_goal',
    type: 'multiple_single',
    question_pt: 'Qual é o seu principal objetivo ao usar o Cidadão.AI?',
    question_en: 'What is your main goal when using Cidadão.AI?',
    required: true,
    options: [
      {
        value: 'research',
        label_pt: 'Pesquisa acadêmica ou jornalística',
        label_en: 'Academic or journalistic research',
      },
      {
        value: 'civic_monitoring',
        label_pt: 'Monitoramento cívico/cidadania',
        label_en: 'Civic monitoring/citizenship',
      },
      {
        value: 'professional',
        label_pt: 'Uso profissional (advogado, contador, etc.)',
        label_en: 'Professional use (lawyer, accountant, etc.)',
      },
      {
        value: 'curiosity',
        label_pt: 'Curiosidade sobre dados públicos',
        label_en: 'Curiosity about public data',
      },
      {
        value: 'other',
        label_pt: 'Outro',
        label_en: 'Other',
      },
    ],
  },

  // Question 7: How Did You Hear About Us (Single)
  {
    id: 'discovery_source',
    type: 'multiple_single',
    question_pt: 'Como você conheceu o Cidadão.AI?',
    question_en: 'How did you hear about Cidadão.AI?',
    required: true,
    options: [
      {
        value: 'social_media',
        label_pt: 'Redes sociais',
        label_en: 'Social media',
      },
      {
        value: 'search_engine',
        label_pt: 'Busca no Google/outros',
        label_en: 'Google/other search',
      },
      {
        value: 'recommendation',
        label_pt: 'Indicação de amigo/colega',
        label_en: 'Friend/colleague recommendation',
      },
      {
        value: 'news_article',
        label_pt: 'Matéria ou artigo',
        label_en: 'News article',
      },
      {
        value: 'academic',
        label_pt: 'Ambiente acadêmico',
        label_en: 'Academic environment',
      },
      {
        value: 'other',
        label_pt: 'Outro',
        label_en: 'Other',
      },
    ],
  },

  // Question 8: Desired Features (Text)
  {
    id: 'desired_features',
    type: 'text',
    question_pt: 'Que funcionalidades você gostaria de ver no Cidadão.AI?',
    question_en: 'What features would you like to see in Cidadão.AI?',
    required: false,
    placeholder_pt: 'Compartilhe suas ideias para melhorar a plataforma...',
    placeholder_en: 'Share your ideas to improve the platform...',
    maxLength: 1000,
  },

  // Question 9: Additional Feedback (Text)
  {
    id: 'additional_feedback',
    type: 'text',
    question_pt: 'Alguma sugestão ou comentário adicional?',
    question_en: 'Any additional suggestions or comments?',
    required: false,
    placeholder_pt: 'Sua opinião é muito importante para nós...',
    placeholder_en: 'Your opinion is very important to us...',
    maxLength: 1000,
  },
]

// Helper to get question by ID
export function getQuestionById(id: string): SurveyQuestion | undefined {
  return SURVEY_QUESTIONS.find((q) => q.id === id)
}

// Helper to get questions by type
export function getQuestionsByType(type: SurveyQuestion['type']): SurveyQuestion[] {
  return SURVEY_QUESTIONS.filter((q) => q.type === type)
}

// Total number of steps (questions)
export const TOTAL_SURVEY_STEPS = SURVEY_QUESTIONS.length
