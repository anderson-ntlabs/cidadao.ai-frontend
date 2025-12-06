'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAcademyDemo } from '@/hooks/use-academy-demo'
import { jsPDF } from 'jspdf'

interface InternshipContractModalProps {
  isOpen: boolean
  onClose?: () => void
  redirectToOnboarding?: boolean
}

const CONTRACT_VERSION = 'v2.0-2025'

export function InternshipContractModal({
  isOpen,
  onClose,
  redirectToOnboarding = true,
}: InternshipContractModalProps) {
  const router = useRouter()
  const { user, acceptInternshipContract } = useAcademyDemo()
  const [isAccepting, setIsAccepting] = useState(false)
  const [checkboxes, setCheckboxes] = useState({
    telemetry: false,
    dataCollection: false,
    reportGeneration: false,
    lgpdConsent: false,
    termsAccept: false,
  })

  const allChecked = Object.values(checkboxes).every(Boolean)
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const generateContractPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - 2 * margin
    let yPos = 20

    // Helper function to add wrapped text
    const addWrappedText = (text: string, fontSize: number, isBold = false) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      const lines = doc.splitTextToSize(text, contentWidth)

      // Check if we need a new page
      if (yPos + lines.length * (fontSize * 0.5) > 280) {
        doc.addPage()
        yPos = 20
      }

      doc.text(lines, margin, yPos)
      yPos += lines.length * (fontSize * 0.5) + 5
    }

    // Header
    doc.setFillColor(22, 163, 74) // green-600
    doc.rect(0, 0, pageWidth, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('TERMOS DE USO - ACADEMY CIDADAO.AI', pageWidth / 2, 20, {
      align: 'center',
    })
    doc.setFontSize(12)
    doc.text('Plataforma Educacional de IA para Transparência Pública', pageWidth / 2, 32, {
      align: 'center',
    })

    yPos = 55
    doc.setTextColor(0, 0, 0)

    // Contract ID
    const contractId = `ACAD-${Date.now().toString(36).toUpperCase()}`
    addWrappedText(`Termo No: ${contractId}`, 10, true)
    addWrappedText(`Data de Aceite: ${currentDate}`, 10)
    addWrappedText(`Versão do Termo: ${CONTRACT_VERSION}`, 10)
    yPos += 5

    // User Info
    addWrappedText('1. IDENTIFICAÇÃO DO USUÁRIO', 14, true)
    addWrappedText(`Nome: ${user.name}`, 11)
    addWrappedText(`Email: ${user.email}`, 11)
    yPos += 5

    // Object
    addWrappedText('2. OBJETO', 14, true)
    addWrappedText(
      'O presente termo estabelece as condições para utilização da Academy Cidadão.AI, ' +
        'plataforma educacional aberta voltada ao aprendizado de Inteligência Artificial ' +
        'aplicada à transparência pública.',
      11
    )
    yPos += 5

    // Data Collection
    addWrappedText('3. COLETA E TRATAMENTO DE DADOS', 14, true)
    addWrappedText('3.1. Dados Coletados:', 12, true)
    addWrappedText('- Nome e email', 11)
    addWrappedText('- Endereço IP e informações do navegador', 11)
    addWrappedText('- Tempo de sessão e métricas de interação', 11)
    addWrappedText('- Progresso de aprendizado e avaliações', 11)
    addWrappedText('- Conversas com agentes de IA (para fins educacionais)', 11)
    yPos += 3

    addWrappedText('3.2. Finalidades do Tratamento:', 12, true)
    addWrappedText('- Emissão de certificado de conclusão', 11)
    addWrappedText('- Pesquisa acadêmica sobre educação em IA (dados anonimizados)', 11)
    addWrappedText('- Melhoria contínua da plataforma educacional', 11)
    addWrappedText('- Geração de relatório de progresso e métricas de engajamento', 11)
    yPos += 5

    // Legal Basis
    addWrappedText('4. FUNDAMENTAÇÃO LEGAL', 14, true)
    addWrappedText(
      'O tratamento de dados pessoais nesta plataforma fundamenta-se nas seguintes bases legais da ' +
        'Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD):',
      11
    )
    yPos += 3
    addWrappedText('Art. 7º, I - Consentimento do titular (presente termo)', 11)
    addWrappedText('Art. 7º, IV - Realização de estudos por órgão de pesquisa', 11)
    addWrappedText('Art. 7º, IX - Interesses legítimos do controlador (educação)', 11)
    yPos += 5

    // Telemetry
    addWrappedText('5. TELEMETRIA E MÉTRICAS', 14, true)
    addWrappedText('O(A) usuário(a) declara estar CIENTE e CONCORDAR que:', 11, true)
    addWrappedText(
      '5.1. O progresso será acompanhado através de dados de telemetria ' +
        'coletados durante as sessões de estudo na plataforma.',
      11
    )
    addWrappedText(
      '5.2. As métricas de tempo de estudo, interações com agentes de IA, e progresso nas atividades ' +
        'serão utilizadas para gerar relatórios de aprendizado.',
      11
    )
    addWrappedText(
      '5.3. O sistema de gamificação (XP, níveis, badges) serve como indicador de engajamento.',
      11
    )
    yPos += 5

    // Rights
    addWrappedText('6. DIREITOS DO TITULAR DOS DADOS', 14, true)
    addWrappedText('Conforme a LGPD (Art. 18), o(a) usuário(a) possui os seguintes direitos:', 11)
    addWrappedText('- Confirmação e acesso aos dados coletados', 11)
    addWrappedText('- Correção de dados incompletos ou desatualizados', 11)
    addWrappedText('- Anonimização, bloqueio ou eliminação de dados desnecessários', 11)
    addWrappedText('- Portabilidade dos dados', 11)
    addWrappedText('- Revogação do consentimento a qualquer momento', 11)
    yPos += 3
    addWrappedText(
      'Para exercer estes direitos, o titular pode contatar através do ' +
        'email: contato@cidadao.ai',
      11
    )
    yPos += 5

    // New page for signature
    doc.addPage()
    yPos = 20

    // Declaration
    addWrappedText('7. DECLARAÇÃO DE ACEITE', 14, true)
    addWrappedText(`Eu, ${user.name}, DECLARO que:`, 11)
    yPos += 3
    addWrappedText('[X] Li e compreendi integralmente estes Termos de Uso', 11)
    addWrappedText(
      '[X] Autorizo a coleta e tratamento dos meus dados pessoais para as finalidades descritas',
      11
    )
    addWrappedText('[X] Concordo com a geração de relatórios baseados em telemetria', 11)
    addWrappedText('[X] Estou ciente dos meus direitos como titular de dados pessoais', 11)
    addWrappedText('[X] Aceito participar da plataforma Academy Cidadão.AI', 11)
    yPos += 10

    // Signature area
    doc.setDrawColor(0)
    doc.line(margin, yPos + 20, margin + 80, yPos + 20)
    doc.setFontSize(10)
    doc.text(user.name, margin, yPos + 28)
    doc.text('Usuário(a)', margin, yPos + 35)

    yPos += 50

    // Digital signature info
    addWrappedText('8. ASSINATURA DIGITAL', 14, true)
    addWrappedText(`Data/Hora do Aceite: ${new Date().toLocaleString('pt-BR')}`, 11)
    addWrappedText(`IP do Dispositivo: ${user.lastIpAddress || 'Coletado no aceite'}`, 11)
    addWrappedText(`User Agent: ${navigator.userAgent.substring(0, 80)}...`, 10)
    addWrappedText(`Hash do Termo: ${contractId}-${Date.now().toString(16)}`, 10)
    yPos += 10

    // Footer
    doc.setFillColor(22, 163, 74)
    doc.rect(0, 277, pageWidth, 20, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.text(
      'Academy Cidadão.AI - Transparência Pública com Inteligência Artificial',
      pageWidth / 2,
      285,
      {
        align: 'center',
      }
    )
    doc.text('Plataforma Educacional Aberta | ' + CONTRACT_VERSION, pageWidth / 2, 292, {
      align: 'center',
    })

    return { pdf: doc, contractId }
  }

  const handleAccept = async () => {
    if (!allChecked) return

    setIsAccepting(true)
    try {
      // Get IP address
      let ipAddress: string | undefined
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        ipAddress = data.ip
      } catch {
        ipAddress = '127.0.0.1' // Demo fallback
      }

      // Generate and download PDF
      const { pdf, contractId } = generateContractPDF()
      pdf.save(`termos-uso-academy-${contractId}.pdf`)

      // Save acceptance
      await acceptInternshipContract(ipAddress, navigator.userAgent, contractId)

      // Redirect to onboarding or close modal
      if (redirectToOnboarding) {
        router.push('/pt/academy/onboarding')
      } else {
        onClose?.()
      }
    } catch (error) {
      console.error('Failed to accept terms:', error)
    } finally {
      setIsAccepting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Termos de Uso</h2>
              <p className="text-green-100">Academy Cidadão.AI - Plataforma Educacional</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="font-medium text-lg">
              Olá, <span className="text-green-600 dark:text-green-400">{user.name}</span>!
            </p>

            <p>
              Bem-vindo à <strong>Academy Cidadão.AI</strong>! Para iniciar sua jornada de
              aprendizado, é necessário aceitar os termos abaixo. Este documento estabelece as
              condições para coleta de dados e uso da plataforma.
            </p>

            {/* Legal basis */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                <span>⚖️</span> Fundamentação Legal
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>
                  <strong>Lei 13.709/2018 (LGPD)</strong> - Lei Geral de Proteção de Dados
                </li>
                <li>
                  <strong>Art. 7º, I da LGPD</strong> - Consentimento do titular
                </li>
                <li>
                  <strong>Art. 7º, IV da LGPD</strong> - Pesquisa por órgão de pesquisa
                </li>
              </ul>
            </div>

            {/* What is Academy */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h3 className="font-bold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                <span>🎓</span> O que é a Academy Cidadão.AI?
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Uma <strong>plataforma educacional aberta e gratuita</strong> para aprender sobre
                Inteligência Artificial aplicada à transparência pública. Aprenda com mentores IA,
                ganhe XP, conquiste badges e obtenha seu certificado!
              </p>
            </div>

            {/* Telemetry explanation */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                <span>📊</span> Métricas e Progresso
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Seu progresso será acompanhado através de <strong>dados de telemetria</strong>:
                tempo de estudo, interações com o mentor IA, vídeos assistidos e métricas de
                engajamento (XP, badges). Isso permite gerar seu certificado e relatório de
                aprendizado.
              </p>
            </div>

            {/* Data collected */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Dados coletados:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Nome e email</li>
                <li>Tempo de sessão e métricas de interação</li>
                <li>Progresso de aprendizado (vídeos, leituras, conversas)</li>
                <li>Diário de aprendizado (reflexões voluntárias)</li>
                <li>Sistema de gamificação (XP, níveis, badges)</li>
                <li>IP e informações do navegador (para segurança)</li>
              </ul>
            </div>

            {/* Purposes */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Finalidades:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>Certificado de conclusão</strong> com métricas de desempenho
                </li>
                <li>
                  <strong>Relatório de progresso</strong> com suas conquistas
                </li>
                <li>
                  <strong>Pesquisa acadêmica</strong> sobre educação em IA (dados anonimizados)
                </li>
                <li>Melhoria contínua da plataforma educacional</li>
              </ul>
            </div>

            {/* Rights */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">
                Seus direitos (Art. 18 da LGPD):
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Você pode solicitar <strong>acesso, correção, anonimização ou exclusão</strong> de
                seus dados a qualquer momento. Contato: <strong>contato@cidadao.ai</strong>
              </p>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="mt-6 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.telemetry}
                onChange={(e) => setCheckboxes({ ...checkboxes, telemetry: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                <strong>Autorizo a coleta de telemetria</strong> (tempo de estudo, interações,
                progresso) para acompanhamento do meu aprendizado.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.dataCollection}
                onChange={(e) => setCheckboxes({ ...checkboxes, dataCollection: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                <strong>Autorizo o tratamento dos meus dados pessoais</strong> conforme a LGPD (Lei
                13.709/2018) para as finalidades educacionais descritas.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.reportGeneration}
                onChange={(e) =>
                  setCheckboxes({ ...checkboxes, reportGeneration: e.target.checked })
                }
                className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                <strong>Concordo com a geração de relatórios</strong> baseados nos dados de
                telemetria e métricas de engajamento coletados.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.lgpdConsent}
                onChange={(e) => setCheckboxes({ ...checkboxes, lgpdConsent: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                <strong>Estou ciente dos meus direitos</strong> como titular de dados pessoais
                conforme Art. 18 da LGPD e sei como exercê-los.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.termsAccept}
                onChange={(e) => setCheckboxes({ ...checkboxes, termsAccept: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                <strong>Aceito participar da plataforma Academy Cidadão.AI</strong> e concordo com
                estes Termos de Uso.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>
                Versão do termo: {CONTRACT_VERSION} | Data: {currentDate}
              </p>
              <p className="text-green-600 dark:text-green-400 font-medium mt-1">
                Um PDF dos termos será baixado automaticamente.
              </p>
            </div>
            <button
              onClick={handleAccept}
              disabled={!allChecked || isAccepting}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white transition-all ${
                allChecked
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isAccepting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Gerando termos...
                </span>
              ) : (
                'Aceitar e Baixar Termos (PDF)'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
