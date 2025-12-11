/**
 * Kids Contract Modal
 *
 * Terms of use modal for Kids area with PDF generation and digital signature.
 * Based on the Agora InternshipContractModal but adapted for parental consent.
 *
 * DRAFT - Requires legal review before production use.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import { useState } from 'react'
// jsPDF is loaded dynamically when generating PDF to reduce bundle
import { Baby, Shield, FileText, Download, Loader2 } from 'lucide-react'

interface KidsContractModalProps {
  isOpen: boolean
  onAccept: (contractId: string) => void
  onClose?: () => void
  parentName: string
  parentEmail: string
  childName: string
}

const CONTRACT_VERSION = 'KIDS-v1.0-2025'

export function KidsContractModal({
  isOpen,
  onAccept,
  onClose,
  parentName,
  parentEmail,
  childName,
}: KidsContractModalProps) {
  const [isAccepting, setIsAccepting] = useState(false)
  const [checkboxes, setCheckboxes] = useState({
    parentalConsent: false,
    dataCollection: false,
    noGamification: false,
    aiInteraction: false,
    rightsAwareness: false,
    termsAccept: false,
  })

  const allChecked = Object.values(checkboxes).every(Boolean)
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const generateContractPDF = async () => {
    // Lazy load jsPDF only when user clicks download
    const { jsPDF } = await import('jspdf')
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

    // Header - Kids theme colors (coral/turquoise)
    doc.setFillColor(255, 107, 107) // kids-coral
    doc.rect(0, 0, pageWidth, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('TERMOS DE USO - AREA KIDS', pageWidth / 2, 20, {
      align: 'center',
    })
    doc.setFontSize(12)
    doc.text('Cidadao.AI - Agora Academy', pageWidth / 2, 32, {
      align: 'center',
    })

    yPos = 55
    doc.setTextColor(0, 0, 0)

    // Contract ID
    const contractId = `KIDS-${Date.now().toString(36).toUpperCase()}`
    addWrappedText(`Termo No: ${contractId}`, 10, true)
    addWrappedText(`Data de Aceite: ${currentDate}`, 10)
    addWrappedText(`Versao do Termo: ${CONTRACT_VERSION}`, 10)
    yPos += 5

    // Parent Info
    addWrappedText('1. IDENTIFICACAO DO RESPONSAVEL', 14, true)
    addWrappedText(`Nome do Pai/Responsavel: ${parentName}`, 11)
    addWrappedText(`Email: ${parentEmail}`, 11)
    addWrappedText(`Nome da Crianca: ${childName}`, 11)
    yPos += 5

    // Object
    addWrappedText('2. OBJETO', 14, true)
    addWrappedText(
      'O presente termo estabelece as condicoes para utilizacao da Área Kids do Cidadao.AI, ' +
        'ambiente educacional projetado para crianças de 6 a 12 anos aprenderem conceitos básicos ' +
        'de programacao e tecnologia de forma ludica e segura.',
      11
    )
    yPos += 5

    // Parental Consent
    addWrappedText('3. CONSENTIMENTO PARENTAL', 14, true)
    addWrappedText(
      '3.1. Este termo constitui o consentimento parental expresso e informado para que a criança ' +
        'identificada acima utilize a Área Kids, conforme exigido pela LGPD (Art. 14) e pelo ' +
        'Estatuto da Crianca e do Adolescente (ECA).',
      11
    )
    addWrappedText(
      '3.2. O pai/responsavel declara ser o representante legal da criança e estar ' +
        'plenamente ciente das funcionalidades e conteudos disponibilizados na plataforma.',
      11
    )
    yPos += 5

    // Data Collection
    addWrappedText('4. COLETA E TRATAMENTO DE DADOS', 14, true)
    addWrappedText('4.1. Dados Coletados:', 12, true)
    addWrappedText('- Nome da criança (para personalização)', 11)
    addWrappedText('- Avatar escolhido', 11)
    addWrappedText('- Videos assistidos e tempo de visualizacao', 11)
    addWrappedText('- Interacoes com os mentores de IA', 11)
    addWrappedText('- Duracao das sessoes de uso', 11)
    yPos += 3

    addWrappedText('4.2. Dados NAO Coletados:', 12, true)
    addWrappedText('- Dados sensíveis da criança', 11)
    addWrappedText('- Localizacao geográfica', 11)
    addWrappedText('- Fotos ou imagens da criança', 11)
    addWrappedText('- Informações de contato da criança', 11)
    yPos += 3

    addWrappedText('4.3. Finalidades do Tratamento:', 12, true)
    addWrappedText('- Personalizar a experiencia de aprendizado', 11)
    addWrappedText('- Gerar relatórios de progresso para os pais', 11)
    addWrappedText('- Melhorar o conteudo educacional oferecido', 11)
    yPos += 5

    // No Gamification
    addWrappedText('5. AUSENCIA DE GAMIFICACAO', 14, true)
    addWrappedText(
      'A Área Kids NAO possui sistema de pontos (XP), badges, rankings ou qualquer mecanismo ' +
        'de gamificação competitiva, visando preservar o bem-estar psicológico da criança e ' +
        'evitar dinamicas potencialmente viciantes.',
      11
    )
    yPos += 5

    // AI Interaction
    addWrappedText('6. INTERACAO COM MENTORES DE IA', 14, true)
    addWrappedText(
      '6.1. A Área Kids disponibiliza dois mentores de IA: Monteiro Lobato e Tarsila do Amaral, ' +
        'configurados especificamente para interações educativas e apropriadas para crianças.',
      11
    )
    addWrappedText(
      '6.2. Os mentores sao programados para recusar discussoes sobre temas inadequados ' +
        'e redirecionar conversas para assuntos educacionais.',
      11
    )
    addWrappedText(
      '6.3. Todas as interações sao registradas e disponibilizadas no dashboard parental.',
      11
    )
    yPos += 5

    // New page for legal basis and rights
    doc.addPage()
    yPos = 20

    // Legal Basis
    addWrappedText('7. FUNDAMENTACAO LEGAL', 14, true)
    addWrappedText(
      'O tratamento de dados pessoais de crianças nesta plataforma fundamenta-se em:',
      11
    )
    yPos += 3
    addWrappedText('- Lei 13.709/2018 (LGPD) - Art. 14 (tratamento de dados de crianças)', 11)
    addWrappedText('- Lei 8.069/1990 (ECA) - Estatuto da Crianca e do Adolescente', 11)
    addWrappedText(
      '- COPPA (Children Online Privacy Protection Act) - diretrizes internacionais',
      11
    )
    yPos += 5

    // Rights
    addWrappedText('8. DIREITOS DO RESPONSAVEL', 14, true)
    addWrappedText('Conforme a LGPD (Art. 18), o pai/responsavel possui os seguintes direitos:', 11)
    addWrappedText('- Acesso a todos os dados coletados sobre a criança', 11)
    addWrappedText('- Correcao de dados incompletos ou desatualizados', 11)
    addWrappedText('- Exclusao completa do perfil e dados associados', 11)
    addWrappedText('- Portabilidade dos dados em formato legivel', 11)
    addWrappedText('- Revogacao do consentimento a qualquer momento', 11)
    yPos += 3
    addWrappedText('Para exercer estes direitos: privacidade@cidadao.ai', 11)
    yPos += 5

    // Parental Code
    addWrappedText('9. CODIGO DE ACESSO PARENTAL', 14, true)
    addWrappedText(
      '9.1. Após aceitar estes termos, um código único de 6 caracteres será gerado.',
      11
    )
    addWrappedText(
      '9.2. Este código é a UNICA forma de acessar o dashboard parental com relatórios de uso.',
      11
    )
    addWrappedText(
      '9.3. O código será exibido apenas uma vez. O sistema não armazena nem recupera ' +
        'códigos perdidos por razões de segurança.',
      11
    )
    addWrappedText(
      '9.4. O pai/responsavel é inteiramente responsavel por guardar o código com segurança.',
      11
    )
    yPos += 10

    // Declaration
    addWrappedText('10. DECLARACAO DE ACEITE', 14, true)
    addWrappedText(`Eu, ${parentName}, na qualidade de pai/responsavel legal, DECLARO que:`, 11)
    yPos += 3
    addWrappedText('[X] Sou o representante legal da criança identificada neste termo', 11)
    addWrappedText('[X] Li e compreendi integralmente estes Termos de Uso', 11)
    addWrappedText('[X] Autorizo a coleta e tratamento dos dados conforme descrito', 11)
    addWrappedText('[X] Estou ciente de que a Área Kids não possui gamificação', 11)
    addWrappedText('[X] Compreendo que os mentores sao personagens de IA', 11)
    addWrappedText('[X] Estou ciente dos meus direitos e sei como exerce-los', 11)
    addWrappedText('[X] Aceito a responsabilidade de guardar o código de acesso parental', 11)
    yPos += 10

    // Signature area
    doc.setDrawColor(0)
    doc.line(margin, yPos + 20, margin + 80, yPos + 20)
    doc.setFontSize(10)
    doc.text(parentName, margin, yPos + 28)
    doc.text('Pai/Responsavel Legal', margin, yPos + 35)

    // Digital signature info
    yPos += 50
    addWrappedText('11. ASSINATURA DIGITAL', 14, true)
    addWrappedText(`Data/Hora do Aceite: ${new Date().toLocaleString('pt-BR')}`, 11)
    addWrappedText(`IP do Dispositivo: Coletado no aceite`, 11)
    addWrappedText(`Hash do Termo: ${contractId}-${Date.now().toString(16)}`, 10)

    // Footer
    doc.setFillColor(255, 107, 107) // kids-coral
    doc.rect(0, 277, pageWidth, 20, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.text('Área Kids - Cidadao.AI - Agora Academy', pageWidth / 2, 285, {
      align: 'center',
    })
    doc.text(
      'Ambiente Educacional Seguro para Criancas | ' + CONTRACT_VERSION,
      pageWidth / 2,
      292,
      {
        align: 'center',
      }
    )

    return { pdf: doc, contractId }
  }

  const handleAccept = async () => {
    if (!allChecked) return

    setIsAccepting(true)
    try {
      // Generate and download PDF
      const { pdf, contractId } = await generateContractPDF()
      pdf.save(`termos-area-kids-${contractId}.pdf`)

      // Trigger callback with contract ID
      onAccept(contractId)
    } catch (error) {
      console.error('Failed to generate contract:', error)
    } finally {
      setIsAccepting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-kids-coral to-kids-turquoise p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Baby className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Termos de Uso - Área Kids</h2>
              <p className="text-white/80">Consentimento Parental Obrigatorio</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="font-medium text-lg">
              Ola, <span className="text-kids-coral">{parentName}</span>!
            </p>

            <p>
              Para que <strong className="text-kids-turquoise">{childName}</strong> possa utilizar a{' '}
              <strong>Área Kids</strong>, e necessario seu consentimento como pai/responsavel legal.
              Este documento estabelece as condicoes de uso e tratamento de dados.
            </p>

            {/* Legal basis */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Fundamentacao Legal
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>
                  <strong>LGPD Art. 14</strong> - Tratamento de dados de crianças
                </li>
                <li>
                  <strong>ECA</strong> - Estatuto da Crianca e do Adolescente
                </li>
                <li>
                  <strong>COPPA</strong> - Diretrizes internacionais de privacidade infantil
                </li>
              </ul>
            </div>

            {/* What is Kids Área */}
            <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-700 rounded-lg p-4">
              <h3 className="font-bold text-pink-800 dark:text-pink-200 mb-2 flex items-center gap-2">
                <Baby className="w-5 h-5" /> O que é a Área Kids?
              </h3>
              <p className="text-sm text-pink-700 dark:text-pink-300">
                Um ambiente educacional <strong>seguro e lúdico</strong> para crianças de 6-12 anos
                aprenderem programacao com mentores de IA (Monteiro Lobato e Tarsila do Amaral) e
                videos curados.
              </p>
            </div>

            {/* No gamification */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">
                Sem Gamificacao Competitiva
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                A Área Kids <strong>NAO possui</strong> sistema de pontos (XP), badges, rankings ou
                mecanismos competitivos. Isso protege o bem-estar psicológico da criança.
              </p>
            </div>

            {/* Data collected */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Dados coletados:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Nome da criança (para personalização)</li>
                <li>Avatar escolhido</li>
                <li>Videos assistidos e tempo de visualizacao</li>
                <li>Interacoes com os mentores de IA</li>
                <li>Duracao das sessoes</li>
              </ul>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mt-4">
                Dados NAO coletados:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-700 dark:text-green-400">
                <li>Dados sensíveis</li>
                <li>Localizacao</li>
                <li>Fotos ou imagens</li>
                <li>Informações de contato da criança</li>
              </ul>
            </div>

            {/* Parental Code Warning */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Codigo de Acesso Parental
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Após aceitar, você recebera um <strong>código único de 6 caracteres</strong>. Este
                código é mostrado <strong>apenas uma vez</strong> e é a única forma de acessar os
                relatórios de uso. <strong>Anote-o com cuidado!</strong>
              </p>
            </div>

            {/* Rights */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
              <h3 className="font-bold text-purple-800 dark:text-purple-200 mb-2">
                Seus direitos (Art. 18 da LGPD):
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Voce pode solicitar <strong>acesso, correcao, ou exclusao</strong> dos dados a
                qualquer momento. Contato: <strong>privacidade@cidadao.ai</strong>
              </p>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="mt-6 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.parentalConsent}
                onChange={(e) =>
                  setCheckboxes({ ...checkboxes, parentalConsent: e.target.checked })
                }
                className="mt-1 w-5 h-5 rounded border-gray-300 text-kids-coral focus:ring-kids-coral"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                <strong>Declaro ser o pai/responsavel legal</strong> da criança identificada e estar
                autorizado a fornecer este consentimento.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.dataCollection}
                onChange={(e) => setCheckboxes({ ...checkboxes, dataCollection: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-kids-coral focus:ring-kids-coral"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                <strong>Autorizo a coleta e tratamento dos dados</strong> conforme descrito, em
                conformidade com a LGPD e ECA.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.noGamification}
                onChange={(e) => setCheckboxes({ ...checkboxes, noGamification: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-kids-coral focus:ring-kids-coral"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                <strong>Estou ciente de que a Área Kids não possui gamificação</strong> competitiva
                (XP, badges, rankings).
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.aiInteraction}
                onChange={(e) => setCheckboxes({ ...checkboxes, aiInteraction: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-kids-coral focus:ring-kids-coral"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                <strong>Compreendo que os mentores sao personagens de IA</strong> e que as
                interações serao registradas para revisao parental.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.rightsAwareness}
                onChange={(e) =>
                  setCheckboxes({ ...checkboxes, rightsAwareness: e.target.checked })
                }
                className="mt-1 w-5 h-5 rounded border-gray-300 text-kids-coral focus:ring-kids-coral"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                <strong>Estou ciente dos meus direitos</strong> como responsavel pelos dados da
                criança e sei como exerce-los.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checkboxes.termsAccept}
                onChange={(e) => setCheckboxes({ ...checkboxes, termsAccept: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-kids-coral focus:ring-kids-coral"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                <strong>Aceito os Termos de Uso da Área Kids</strong> e assumo a responsabilidade de
                guardar o código de acesso parental.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>
                Versao do termo: {CONTRACT_VERSION} | Data: {currentDate}
              </p>
              <p className="text-kids-coral font-medium mt-1 flex items-center gap-1">
                <Download className="w-3 h-3" />
                Um PDF dos termos será baixado automaticamente.
              </p>
            </div>
            <div className="flex gap-3">
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleAccept}
                disabled={!allChecked || isAccepting}
                className={`px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 ${
                  allChecked
                    ? 'bg-gradient-to-r from-kids-coral to-kids-turquoise hover:opacity-90 shadow-lg hover:shadow-xl'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando termos...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Aceitar e Baixar PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KidsContractModal
