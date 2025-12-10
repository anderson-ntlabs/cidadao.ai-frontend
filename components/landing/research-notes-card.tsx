'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, ExternalLink } from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'

interface ResearchNotesCardProps {
  locale?: 'pt' | 'en'
}

const translations = {
  pt: {
    title: 'Notas',
    description: 'Rabiscos e ideias originais',
    modalTitle: 'Notas de Pesquisa do Criador',
    modalSubtitle: 'Os rabiscos, ideias e anotações originais que deram origem ao Cidadão.AI',
    download: 'Baixar PDF',
    openNew: 'Abrir em nova aba',
    loading: 'Carregando documento...',
  },
  en: {
    title: 'Notes',
    description: 'Original sketches and ideas',
    modalTitle: "Creator's Research Notes",
    modalSubtitle: 'The original sketches, ideas and notes that gave birth to Cidadão.AI',
    download: 'Download PDF',
    openNew: 'Open in new tab',
    loading: 'Loading document...',
  },
}

const PDF_PATH = '/docs/Anderson_Cidadao_AI_Notas%20de%20Pesquisa.pdf'

export function ResearchNotesCard({ locale = 'pt' }: ResearchNotesCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const t = translations[locale]

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    const handleModalClose = () => setIsOpen(false)

    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      window.addEventListener('modal-close', handleModalClose)
    }

    return () => {
      window.removeEventListener('keydown', handleEsc)
      window.removeEventListener('modal-close', handleModalClose)
    }
  }, [isOpen])

  return (
    <>
      {/* Card */}
      <button
        onClick={() => setIsOpen(true)}
        className="block w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-center group"
      >
        <div className="text-2xl mb-2">📝</div>
        <h4 className="text-sm font-bold flex items-center justify-center gap-1">{t.title}</h4>
      </button>

      {/* Modal */}
      <Modal open={isOpen} onOpenChange={setIsOpen}>
        <ModalContent size="full" className="h-[90vh]">
          <ModalHeader className="flex-shrink-0 pb-4 border-b">
            <div className="flex items-center justify-between pr-8">
              <div>
                <ModalTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <FileText className="w-6 h-6 text-green-600" />
                  {t.modalTitle}
                </ModalTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.modalSubtitle}</p>
              </div>

              {/* Action buttons */}
              <div className="hidden sm:flex items-center gap-2">
                <a
                  href={PDF_PATH}
                  download
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-4 h-4" />
                  {t.download}
                </a>
                <a
                  href={PDF_PATH}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                  {t.openNew}
                </a>
              </div>
            </div>
          </ModalHeader>

          {/* PDF Viewer */}
          <div className="flex-1 overflow-hidden mt-4 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
            <object
              data={`${PDF_PATH}#toolbar=1&navpanes=1&scrollbar=1`}
              type="application/pdf"
              className="w-full h-full rounded-lg"
              title={t.modalTitle}
            >
              {/* Fallback for browsers that can't display PDF */}
              <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  {locale === 'pt'
                    ? 'Seu navegador não suporta visualização de PDF embutido.'
                    : 'Your browser does not support embedded PDF viewing.'}
                </p>
                <div className="flex gap-3">
                  <a
                    href={PDF_PATH}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {t.download}
                  </a>
                  <a
                    href={PDF_PATH}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t.openNew}
                  </a>
                </div>
              </div>
            </object>
          </div>

          {/* Mobile action buttons */}
          <div className="flex sm:hidden items-center justify-center gap-3 mt-4 pt-4 border-t">
            <a
              href={PDF_PATH}
              download
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t.download}
            </a>
            <a
              href={PDF_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {t.openNew}
            </a>
          </div>
        </ModalContent>
      </Modal>
    </>
  )
}
