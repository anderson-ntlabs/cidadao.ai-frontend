/**
 * FAQSection Component - English Version
 *
 * Frequently Asked Questions with accordion interaction.
 * Helps users find answers without navigating away.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-11-25
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

export function FAQSectionEN() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: 'Is it really free?',
      answer:
        'Yes! 100% free and open source. Cidadao.AI is an academic project (undergraduate thesis) focused on public good. It will always be free for any Brazilian citizen.',
    },
    {
      question: 'Do I need to be a developer to use it?',
      answer:
        'No! The interface is designed for anyone. You chat with the AIs in natural Portuguese, like sending a WhatsApp message.',
    },
    {
      question: 'Is my personal data safe?',
      answer:
        'Yes! We use OAuth (Google/GitHub login), so we dont store passwords. Were 100% LGPD compliant. Your browsing and query data are private.',
    },
    {
      question: 'How do you detect irregularities?',
      answer:
        'We use 17 specialized AI agents that analyze contracts, bids, and public spending. They apply anomaly detection algorithms, pattern analysis, and data cross-referencing.',
    },
    {
      question: 'Does it work in all regions of Brazil?',
      answer:
        'All of Brazil! Were connected to the Federal Government Transparency Portal. In the future, we plan to integrate state and municipal portals.',
    },
    {
      question: 'Can I export reports?',
      answer:
        'Yes! You can export investigations in PDF or CSV, perfect for sharing with journalists, prosecutors, or social media.',
    },
    {
      question: 'What are the "Brazilian Agents"?',
      answer:
        'They are 17 artificial intelligences, each inspired by a Brazilian hero (Zumbi, Anita Garibaldi, etc.). Each agent has a specialty: detecting anomalies, analyzing patterns, generating reports, etc.',
    },
    {
      question: 'How can I contribute to the project?',
      answer:
        'The code is 100% open source on GitHub! You can contribute code, report bugs, suggest features, or even donate for infrastructure.',
    },
  ]

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-base">Everything you need to know</p>
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
        <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">Still have questions?</p>
        <a
          href="https://github.com/anderson-ufrj/cidadao.ai-backend/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
        >
          Open an issue on GitHub
          <span>-&gt;</span>
        </a>
      </div>
    </div>
  )
}
