'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
} from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Dynamically import react-pdf to avoid SSR issues with DOMMatrix
const Document = dynamic(() => import('react-pdf').then((mod) => mod.Document), { ssr: false })
const Page = dynamic(() => import('react-pdf').then((mod) => mod.Page), { ssr: false })

// Configure PDF.js worker to use local file (avoids CSP issues with unpkg.com)
if (typeof window !== 'undefined') {
  import('react-pdf').then((pdfModule) => {
    pdfModule.pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  })
}

interface ResearchNotesCardProps {
  locale?: 'pt' | 'en'
  autoOpen?: boolean
}

const translations = {
  pt: {
    title: 'Notas',
    modalTitle: 'Notas de Pesquisa do Criador',
    modalSubtitle: 'Os rabiscos, ideias e anotações originais que deram origem ao Cidadão.AI',
    download: 'Baixar PDF',
    loading: 'Carregando...',
    page: 'Página',
    of: 'de',
    error: 'Erro ao carregar PDF',
    retry: 'Tentar novamente',
  },
  en: {
    title: 'Notes',
    modalTitle: "Creator's Research Notes",
    modalSubtitle: 'The original sketches, ideas and notes that gave birth to Cidadão.AI',
    download: 'Download PDF',
    loading: 'Loading...',
    page: 'Page',
    of: 'of',
    error: 'Error loading PDF',
    retry: 'Try again',
  },
}

const PDF_PATH = '/docs/notas-de-pesquisa.pdf'

export function ResearchNotesCard({ locale = 'pt', autoOpen = false }: ResearchNotesCardProps) {
  const [isOpen, setIsOpen] = useState(autoOpen)
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPageNumber(1)
      setScale(1.0)
      setError(null)
      setIsLoading(true)
    }
  }, [isOpen])

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setIsLoading(false)
    setError(null)
  }, [])

  const onDocumentLoadError = useCallback(() => {
    setError(t.error)
    setIsLoading(false)
  }, [t.error])

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1))
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages))
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.5))
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5))

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

              {/* Download button */}
              <a
                href={PDF_PATH}
                download
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-4 h-4" />
                {t.download}
              </a>
            </div>
          </ModalHeader>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 py-3 border-b bg-gray-50 dark:bg-gray-800/50">
            {/* Pagination */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[100px] text-center">
                {t.page} {pageNumber} {t.of} {numPages || '?'}
              </span>
              <button
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom */}
            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                disabled={scale <= 0.5}
                className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[50px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                disabled={scale >= 2.5}
                className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile download */}
            <a
              href={PDF_PATH}
              download
              className="sm:hidden p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              aria-label={t.download}
            >
              <Download className="w-4 h-4" />
            </a>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-900 flex justify-center">
            {error ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
                <button
                  onClick={() => {
                    setError(null)
                    setIsLoading(true)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {t.retry}
                </button>
              </div>
            ) : (
              <Document
                file={PDF_PATH}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center h-full gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                    <span className="text-gray-600 dark:text-gray-400">{t.loading}</span>
                  </div>
                }
                className="py-4"
              >
                {!isLoading && (
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    className="shadow-xl"
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                )}
              </Document>
            )}
          </div>
        </ModalContent>
      </Modal>
    </>
  )
}
