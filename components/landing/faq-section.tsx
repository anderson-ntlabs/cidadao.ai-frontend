/**
 * FAQSection Component
 *
 * Frequently Asked Questions with accordion interaction.
 * Helps users find answers without navigating away.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-11-18
 */

'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-6 text-left hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors rounded-lg"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 pr-8">
          {question}
        </span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform duration-300 flex-shrink-0',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">{answer}</div>
      </div>
    </div>
  )
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: 'É realmente grátis?',
      answer:
        'Sim! 100% gratuito e open source. O Cidadão.AI é um projeto acadêmico (TCC) com foco no bem público. Sempre será grátis para qualquer cidadão brasileiro.',
    },
    {
      question: 'Preciso ser desenvolvedor para usar?',
      answer:
        'Não! A interface foi projetada para qualquer pessoa. Você conversa com as IAs em português natural, como se estivesse enviando uma mensagem no WhatsApp.',
    },
    {
      question: 'Meus dados pessoais estão seguros?',
      answer:
        'Sim! Usamos OAuth (login com Google/GitHub), então não armazenamos senhas. Somos 100% compatíveis com a LGPD. Seus dados de navegação e consultas são privados.',
    },
    {
      question: 'Como vocês detectam irregularidades?',
      answer:
        'Usamos 17 agentes de IA especializados que analisam contratos, licitações e gastos públicos. Eles aplicam algoritmos de detecção de anomalias, análise de padrões e cruzamento de dados.',
    },
    {
      question: 'Funciona em qual região do Brasil?',
      answer:
        'Todo o Brasil! Estamos conectados ao Portal da Transparência do Governo Federal. No futuro, planejamos integrar portais estaduais e municipais.',
    },
    {
      question: 'Posso exportar os relatórios?',
      answer:
        'Sim! Você pode exportar investigações em PDF ou CSV, perfeito para compartilhar com jornalistas, MPs ou redes sociais.',
    },
    {
      question: 'O que são os "Agentes Brasileiros"?',
      answer:
        'São 17 inteligências artificiais, cada uma inspirada em um herói brasileiro (Zumbi, Anita Garibaldi, etc.). Cada agente tem uma especialidade: detectar anomalias, analisar padrões, gerar relatórios, etc.',
    },
    {
      question: 'Como posso contribuir com o projeto?',
      answer:
        'O código é 100% open source no GitHub! Você pode contribuir com código, reportar bugs, sugerir features ou até mesmo fazer doações para infraestrutura.',
    },
  ]

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Perguntas Frequentes
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-base">Tudo o que você precisa saber</p>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl overflow-hidden">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>

      {/* Still have questions? */}
      <div className="text-center mt-6">
        <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">Ainda tem dúvidas?</p>
        <a
          href="https://github.com/anderson-ufrj/cidadao.ai-backend/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
        >
          Abra uma issue no GitHub
          <span>→</span>
        </a>
      </div>
    </div>
  )
}
