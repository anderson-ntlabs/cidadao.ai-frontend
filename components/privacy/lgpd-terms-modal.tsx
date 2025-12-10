/**
 * LGPD Terms Modal
 *
 * Gamified modal for understanding data privacy and LGPD compliance.
 * Features interactive modules, quizzes, and progress tracking.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-10
 */

'use client'

import { useState, useCallback } from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'
import {
  Shield,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Download,
  Lock,
  Eye,
  Trash2,
  FileText,
  Sparkles,
  ExternalLink,
  Check,
} from 'lucide-react'

interface LGPDTermsModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept?: () => void
  userName?: string
}

// LGPD Module definitions
const LGPD_MODULES = [
  {
    id: 'intro',
    title: 'O que é a LGPD?',
    icon: BookOpen,
    color: 'bg-blue-500',
    description: 'Lei Geral de Proteção de Dados',
    badge: 'Conhecedor LGPD',
    badgeEmoji: '📚',
  },
  {
    id: 'rights',
    title: 'Seus Direitos',
    icon: Shield,
    color: 'bg-green-500',
    description: 'Conheça o que você pode exigir',
    badge: 'Defensor de Direitos',
    badgeEmoji: '🛡️',
  },
  {
    id: 'usage',
    title: 'Como usamos seus dados',
    icon: Eye,
    color: 'bg-purple-500',
    description: 'Transparência total',
    badge: 'Mestre da Privacidade',
    badgeEmoji: '👑',
  },
  {
    id: 'consent',
    title: 'Aceite dos Termos',
    icon: FileText,
    color: 'bg-tarsila-verde',
    description: 'Conclusão da jornada',
    badge: 'Cidadão Consciente',
    badgeEmoji: '✅',
  },
]

// Quiz questions for each module
const QUIZ_QUESTIONS: Record<string, { question: string; options: string[]; correct: number }[]> = {
  intro: [
    {
      question: 'O que significa a sigla LGPD?',
      options: [
        'Lei Geral de Proteção de Dados',
        'Lei Grande de Privacidade Digital',
        'Legislação Governamental de Proteção Digital',
      ],
      correct: 0,
    },
    {
      question: 'Quando a LGPD entrou em vigor no Brasil?',
      options: ['2018', '2020', '2022'],
      correct: 1,
    },
  ],
  rights: [
    {
      question: 'Você pode solicitar a exclusão dos seus dados pessoais?',
      options: [
        'Sim, é um direito garantido pela LGPD',
        'Não, os dados são da empresa',
        'Apenas dados financeiros',
      ],
      correct: 0,
    },
    {
      question: 'Qual desses é um direito seu segundo a LGPD?',
      options: [
        'Saber quais dados são coletados',
        'Cobrar pela exclusão de dados',
        'Impedir qualquer coleta de dados',
      ],
      correct: 0,
    },
  ],
  usage: [
    {
      question: 'O Cidadão.AI vende seus dados para terceiros?',
      options: ['Nunca', 'Apenas para parceiros', 'Sim, é nosso modelo de negócio'],
      correct: 0,
    },
    {
      question: 'Seus dados de conversa com a IA são...',
      options: [
        'Anonimizados para melhorar o serviço',
        'Compartilhados publicamente',
        'Vendidos para anunciantes',
      ],
      correct: 0,
    },
  ],
}

// Content for each module
const MODULE_CONTENT: Record<string, React.ReactNode> = {
  intro: (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-300">
        A <strong>Lei Geral de Proteção de Dados (LGPD)</strong> é a legislação brasileira que
        regula o tratamento de dados pessoais. Ela foi inspirada no GDPR europeu e entrou em vigor
        em 2020.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { emoji: '🔒', title: 'Segurança', desc: 'Seus dados devem ser protegidos' },
          { emoji: '🎯', title: 'Finalidade', desc: 'Uso apenas para o que foi autorizado' },
          { emoji: '🗑️', title: 'Exclusão', desc: 'Você pode pedir para apagar seus dados' },
        ].map((item) => (
          <div
            key={item.title}
            className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center"
          >
            <span className="text-2xl">{item.emoji}</span>
            <h4 className="font-semibold text-sm mt-1">{item.title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  ),
  rights: (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-300">
        A LGPD garante diversos direitos aos titulares de dados. Conheça os principais:
      </p>
      <div className="space-y-2">
        {[
          { icon: Eye, title: 'Acesso', desc: 'Ver todos os dados que temos sobre você' },
          {
            icon: FileText,
            title: 'Correção',
            desc: 'Corrigir dados incorretos ou desatualizados',
          },
          { icon: Trash2, title: 'Exclusão', desc: 'Solicitar a remoção dos seus dados' },
          { icon: Lock, title: 'Portabilidade', desc: 'Transferir seus dados para outro serviço' },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20"
          >
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">{item.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  usage: (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-300">
        No Cidadão.AI, somos <strong>100% transparentes</strong> sobre como usamos seus dados:
      </p>
      <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 space-y-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Dados de Conta</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Email e nome são usados apenas para identificação e comunicação
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Conversas com IA</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Podem ser usadas de forma anonimizada para melhorar os agentes
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Pesquisa Acadêmica</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Dados agregados e anonimizados podem ser usados para pesquisa
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="w-5 h-5 flex items-center justify-center text-red-500">✕</span>
          <div>
            <h4 className="font-semibold text-sm text-red-600 dark:text-red-400">Nunca vendemos</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Seus dados NUNCA são vendidos para terceiros ou anunciantes
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
}

export function LGPDTermsModal({ isOpen, onClose, onAccept, userName }: LGPDTermsModalProps) {
  const [currentModule, setCurrentModule] = useState(0)
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [acceptedTerms, setAcceptedTerms] = useState({
    lgpd: false,
    research: false,
    communications: false,
  })

  const module = LGPD_MODULES[currentModule]
  const isLastModule = currentModule === LGPD_MODULES.length - 1
  const allModulesCompleted = completedModules.length >= LGPD_MODULES.length - 1 // Excluding consent module
  const canAccept = acceptedTerms.lgpd && allModulesCompleted

  const handleQuizAnswer = useCallback(
    (answerIndex: number) => {
      const questions = QUIZ_QUESTIONS[module.id]
      if (!questions) return

      const newAnswers = [...quizAnswers, answerIndex]
      setQuizAnswers(newAnswers)

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        // Quiz completed
        const allCorrect = newAnswers.every((a, i) => a === questions[i].correct)
        if (allCorrect || newAnswers.length >= questions.length) {
          setCompletedModules([...completedModules, module.id])
          setShowQuiz(false)
          setQuizAnswers([])
          setCurrentQuestion(0)
          if (currentModule < LGPD_MODULES.length - 1) {
            setCurrentModule(currentModule + 1)
          }
        }
      }
    },
    [module.id, quizAnswers, currentQuestion, completedModules, currentModule]
  )

  const handleNextModule = useCallback(() => {
    const questions = QUIZ_QUESTIONS[module.id]
    if (questions && !completedModules.includes(module.id)) {
      setShowQuiz(true)
    } else if (currentModule < LGPD_MODULES.length - 1) {
      setCurrentModule(currentModule + 1)
    }
  }, [module.id, completedModules, currentModule])

  const handlePrevModule = useCallback(() => {
    if (currentModule > 0) {
      setCurrentModule(currentModule - 1)
      setShowQuiz(false)
    }
  }, [currentModule])

  const handleAccept = useCallback(() => {
    if (canAccept) {
      onAccept?.()
      onClose()
    }
  }, [canAccept, onAccept, onClose])

  const handleDownloadPDF = useCallback(() => {
    // TODO: Generate and download PDF with terms
    alert('Download do PDF será implementado com integração Gov.br')
  }, [])

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="sr-only">Entenda seus dados</ModalTitle>
        </ModalHeader>

        <div className="space-y-6 p-6">
          {/* Header with progress */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tarsila-verde/10 mb-4">
              <Shield className="w-5 h-5 text-tarsila-verde" />
              <span className="text-sm font-medium text-tarsila-verde">Entenda seus dados</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {showQuiz ? 'Quiz: ' : ''}
              {module.title}
            </h2>
            {userName && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {userName}, conheça como protegemos seus dados
              </p>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            {LGPD_MODULES.map((m, index) => (
              <div key={m.id} className="flex-1 flex items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    index < currentModule || completedModules.includes(m.id)
                      ? 'bg-tarsila-verde text-white'
                      : index === currentModule
                        ? 'bg-tarsila-verde/20 text-tarsila-verde border-2 border-tarsila-verde'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  )}
                >
                  {completedModules.includes(m.id) ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                {index < LGPD_MODULES.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-1 mx-1 rounded',
                      index < currentModule ? 'bg-tarsila-verde' : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="min-h-[300px]">
            {showQuiz ? (
              // Quiz view
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Pergunta {currentQuestion + 1} de {QUIZ_QUESTIONS[module.id]?.length || 0}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {QUIZ_QUESTIONS[module.id]?.[currentQuestion]?.question}
                  </h3>
                  <div className="space-y-2">
                    {QUIZ_QUESTIONS[module.id]?.[currentQuestion]?.options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuizAnswer(i)}
                        className="w-full p-4 text-left rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-tarsila-verde hover:bg-tarsila-verde/5 transition-all"
                      >
                        <span className="font-medium">{String.fromCharCode(65 + i)}.</span> {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : isLastModule ? (
              // Consent view
              <div className="space-y-4">
                <GlassCard className="p-4">
                  <div className="space-y-4">
                    {/* Badges earned */}
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {LGPD_MODULES.slice(0, -1).map((m) => (
                        <div
                          key={m.id}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm flex items-center gap-1',
                            completedModules.includes(m.id)
                              ? 'bg-tarsila-verde/20 text-tarsila-verde'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                          )}
                        >
                          <span>{m.badgeEmoji}</span>
                          <span>{m.badge}</span>
                        </div>
                      ))}
                    </div>

                    {/* Consent checkboxes */}
                    <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedTerms.lgpd}
                        onChange={(e) =>
                          setAcceptedTerms({ ...acceptedTerms, lgpd: e.target.checked })
                        }
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-tarsila-verde focus:ring-tarsila-verde"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Aceito os Termos de Uso e Política de Privacidade *
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Declaro que li e compreendi como meus dados serão tratados
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedTerms.research}
                        onChange={(e) =>
                          setAcceptedTerms({ ...acceptedTerms, research: e.target.checked })
                        }
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-tarsila-verde focus:ring-tarsila-verde"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Autorizo uso para pesquisa acadêmica (opcional)
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Dados anonimizados podem ser usados em pesquisas sobre IA e governo
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedTerms.communications}
                        onChange={(e) =>
                          setAcceptedTerms({ ...acceptedTerms, communications: e.target.checked })
                        }
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-tarsila-verde focus:ring-tarsila-verde"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Receber comunicações (opcional)
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Novidades sobre o Cidadão.AI e transparência pública
                        </p>
                      </div>
                    </label>
                  </div>
                </GlassCard>

                {/* Download PDF button */}
                <Button variant="secondary" className="w-full" onClick={handleDownloadPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Termos em PDF
                </Button>

                {/* Gov.br signature info */}
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Em breve: assinatura eletrônica via Gov.br
                  </p>
                </div>
              </div>
            ) : (
              // Module content view
              <div className="space-y-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    module.color
                  )}
                >
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                {MODULE_CONTENT[module.id]}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={handlePrevModule}
              disabled={currentModule === 0 || showQuiz}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>

            {isLastModule ? (
              <Button
                onClick={handleAccept}
                disabled={!canAccept}
                className="bg-tarsila-verde hover:bg-tarsila-verde/90"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Aceitar e Continuar
              </Button>
            ) : (
              <Button onClick={handleNextModule}>
                {QUIZ_QUESTIONS[module.id] && !completedModules.includes(module.id)
                  ? 'Fazer Quiz'
                  : 'Próximo'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {/* External links */}
          <div className="flex justify-center gap-4 text-xs">
            <a
              href="/pt/termos"
              target="_blank"
              className="text-gray-500 hover:text-tarsila-verde flex items-center gap-1"
            >
              Termos completos <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="/pt/privacidade"
              target="_blank"
              className="text-gray-500 hover:text-tarsila-verde flex items-center gap-1"
            >
              Política de Privacidade <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}

export default LGPDTermsModal
