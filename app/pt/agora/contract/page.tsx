'use client'

/**
 * Agora Contract Page - Full Legal Agreement
 *
 * Complete terms of use and LGPD consent document.
 * Displays full contract text before signing, similar to academic contracts.
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-07
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAgora } from '@/hooks/use-agora'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Download,
  GraduationCap,
  Printer,
  ArrowRight,
  ScrollText,
} from 'lucide-react'
// jsPDF is loaded dynamically when needed to reduce initial bundle

const CONTRACT_VERSION = 'v2.0-2025'
const CONTRACT_NUMBER_PREFIX = 'AGORA'

export default function AgoraContractPage() {
  const router = useRouter()
  const { user, isLoading, acceptLgpdConsent, acceptInternshipContract } = useAgora()
  const [isAccepting, setIsAccepting] = useState(false)
  const [hasReadContract, setHasReadContract] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const contractRef = useRef<HTMLDivElement>(null)

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const contractNumber = `${CONTRACT_NUMBER_PREFIX}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`

  // Check if user has already accepted (view mode)
  const hasAccepted = user?.hasAcceptedLgpd && user?.hasAcceptedInternshipContract

  // No redirect - allow revisiting to view signed contract

  // Track scroll to bottom of contract
  useEffect(() => {
    const handleScroll = () => {
      if (contractRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contractRef.current
        // Consider read when scrolled past 90%
        if (scrollTop + clientHeight >= scrollHeight * 0.9) {
          setHasReadContract(true)
        }
      }
    }

    const container = contractRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const generateContractPDF = async () => {
    // Lazy load jsPDF only when user clicks download
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15
    const contentWidth = pageWidth - 2 * margin
    let yPos = 15

    const addLine = () => {
      yPos += 2
      doc.setDrawColor(200)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 5
    }

    const addText = (
      text: string,
      fontSize: number,
      isBold = false,
      align: 'left' | 'center' | 'right' = 'left'
    ) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      const lines = doc.splitTextToSize(text, contentWidth)

      if (yPos + lines.length * (fontSize * 0.4) > 280) {
        doc.addPage()
        yPos = 15
      }

      if (align === 'center') {
        doc.text(lines, pageWidth / 2, yPos, { align: 'center' })
      } else if (align === 'right') {
        doc.text(lines, pageWidth - margin, yPos, { align: 'right' })
      } else {
        doc.text(lines, margin, yPos)
      }
      yPos += lines.length * (fontSize * 0.4) + 3
    }

    // Header
    doc.setFillColor(22, 101, 52) // green-800
    doc.rect(0, 0, pageWidth, 25, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('CIDADAO.AI', pageWidth / 2, 10, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(
      'Plataforma Educacional de Inteligencia Artificial para Transparencia Publica',
      pageWidth / 2,
      17,
      { align: 'center' }
    )

    yPos = 35
    doc.setTextColor(0, 0, 0)

    // Title
    addText('TERMO DE COMPROMISSO DE PARTICIPAÇÃO', 14, true, 'center')
    addText(`Nº ${contractNumber}`, 10, false, 'center')
    yPos += 3
    addText(
      '(Instrumento jurídico de acordo com a Lei Federal nº 13.709/2018 - LGPD)',
      9,
      false,
      'center'
    )
    addLine()

    // Platform Info
    addText('PLATAFORMA EDUCACIONAL', 11, true)
    addText('NOME: Ágora Cidadão.AI - Plataforma Educacional de IA', 10)
    addText('ENDEREÇO: Plataforma 100% online', 10)
    addText('CONTATO: contato@cidadao.ai', 10)
    addText('RESPONSÁVEL: Anderson Henrique da Silva', 10)
    addText('PROJETO: Cidadão.AI - Transparência Pública com Inteligência Artificial', 10)
    addLine()

    // User Info
    addText('PARTICIPANTE', 11, true)
    addText(`NOME: ${user?.name || 'Usuário'}`, 10)
    addText(`EMAIL: ${user?.email || 'email@exemplo.com'}`, 10)
    addText(`GITHUB: ${user?.githubUsername || 'N/A'}`, 10)
    addText(`DATA DE CADASTRO: ${currentDate}`, 10)
    addLine()

    // Clauses
    addText(
      'Celebram entre si este TERMO DE COMPROMISSO DE PARTICIPAÇÃO, ajustando as seguintes cláusulas:',
      10
    )
    yPos += 3

    addText('CLÁUSULA PRIMEIRA: DO OBJETO', 11, true)
    addText(
      'Este instrumento tem por objetivo estabelecer as condições para participação na plataforma educacional Ágora Cidadão.AI, definindo os direitos e deveres do PARTICIPANTE e da PLATAFORMA, bem como as condições para coleta e tratamento de dados pessoais.',
      10
    )
    yPos += 2

    addText('CLÁUSULA SEGUNDA: DA FINALIDADE', 11, true)
    addText(
      'A Ágora Cidadão.AI é uma plataforma educacional aberta e gratuita que visa capacitar cidadãos no uso de Inteligência Artificial aplicada à transparência pública. O programa inclui:',
      10
    )
    addText('a) Trilhas de aprendizado em Backend, Frontend, IA/ML e DevOps;', 10)
    addText('b) Mentores virtuais baseados em IA (Santos-Dumont, Lina Bo Bardi);', 10)
    addText('c) Sistema de gamificação com XP, níveis e badges;', 10)
    addText('d) Certificado de conclusão ao final do programa.', 10)
    yPos += 2

    addText('CLÁUSULA TERCEIRA: DA VIGÊNCIA', 11, true)
    addText(
      `a) Este Termo de Compromisso entra em vigor na data de aceite (${currentDate}) e permanecerá válido enquanto o PARTICIPANTE mantiver cadastro ativo na plataforma.`,
      10
    )
    addText(
      'b) O PARTICIPANTE pode solicitar o cancelamento a qualquer momento, sem penalidades.',
      10
    )
    addText(
      'c) A PLATAFORMA reserva-se o direito de descontinuar o serviço com aviso prévio de 30 dias.',
      10
    )

    doc.addPage()
    yPos = 15

    addText('CLÁUSULA QUARTA: DA COLETA DE DADOS (LGPD)', 11, true)
    addText(
      'Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), a PLATAFORMA coletará os seguintes dados:',
      10
    )
    addText('a) Dados de identificação: nome, email, foto de perfil (via OAuth);', 10)
    addText('b) Dados de navegação: endereço IP, tipo de navegador, sistema operacional;', 10)
    addText(
      'c) Dados de aprendizado: progresso nas trilhas, tempo de estudo, interações com mentores;',
      10
    )
    addText(
      'd) Dados de gamificação: pontos XP, nível, badges conquistados, posição no ranking.',
      10
    )
    yPos += 2

    addText('CLÁUSULA QUINTA: DAS FINALIDADES DO TRATAMENTO', 11, true)
    addText('Os dados coletados serão utilizados exclusivamente para:', 10)
    addText('a) Personalização da experiência de aprendizado;', 10)
    addText('b) Emissão de certificado de conclusão;', 10)
    addText('c) Geração de relatórios de progresso para o próprio PARTICIPANTE;', 10)
    addText('d) Pesquisa acadêmica sobre educação em IA (dados anonimizados);', 10)
    addText('e) Melhoria contínua da plataforma educacional.', 10)
    yPos += 2

    addText('CLÁUSULA SEXTA: DOS DIREITOS DO TITULAR (Art. 18 da LGPD)', 11, true)
    addText('O PARTICIPANTE possui os seguintes direitos sobre seus dados pessoais:', 10)
    addText('a) Confirmação da existência de tratamento;', 10)
    addText('b) Acesso aos dados coletados;', 10)
    addText('c) Correção de dados incompletos, inexatos ou desatualizados;', 10)
    addText('d) Anonimização, bloqueio ou eliminação de dados desnecessários;', 10)
    addText('e) Portabilidade dos dados;', 10)
    addText('f) Eliminação dos dados tratados com consentimento;', 10)
    addText('g) Revogação do consentimento a qualquer momento.', 10)
    addText('Para exercer estes direitos, o PARTICIPANTE deve contatar: contato@cidadao.ai', 10)
    yPos += 2

    addText('CLÁUSULA SÉTIMA: DAS OBRIGAÇÕES DA PLATAFORMA', 11, true)
    addText('a) Fornecer acesso gratuito a todas as trilhas de aprendizado;', 10)
    addText('b) Disponibilizar mentores virtuais para auxílio no aprendizado;', 10)
    addText('c) Emitir certificado de conclusão mediante cumprimento dos requisitos;', 10)
    addText('d) Proteger os dados pessoais do PARTICIPANTE conforme a LGPD;', 10)
    addText('e) Notificar o PARTICIPANTE em caso de incidente de segurança.', 10)

    doc.addPage()
    yPos = 15

    addText('CLÁUSULA OITAVA: DAS OBRIGAÇÕES DO PARTICIPANTE', 11, true)
    addText('a) Fornecer informações verdadeiras no momento do cadastro;', 10)
    addText('b) Manter a confidencialidade de suas credenciais de acesso;', 10)
    addText('c) Utilizar a plataforma de forma ética e respeitosa;', 10)
    addText('d) Não compartilhar conteúdo do programa sem autorização;', 10)
    addText('e) Reportar bugs ou vulnerabilidades encontradas.', 10)
    yPos += 2

    addText('CLÁUSULA NONA: DA PROPRIEDADE INTELECTUAL', 11, true)
    addText('a) Todo conteúdo produzido pela PLATAFORMA é protegido por direitos autorais;', 10)
    addText(
      'b) O PARTICIPANTE mantém a propriedade de projetos desenvolvidos durante o programa;',
      10
    )
    addText(
      'c) A PLATAFORMA pode utilizar projetos do PARTICIPANTE como showcase, mediante autorização.',
      10
    )
    yPos += 2

    addText('CLÁUSULA DÉCIMA: DA RESCISÃO', 11, true)
    addText('Este Termo será rescindido nas seguintes situações:', 10)
    addText('a) Por solicitação do PARTICIPANTE;', 10)
    addText('b) Por descumprimento das obrigações aqui estabelecidas;', 10)
    addText('c) Por inatividade superior a 12 meses;', 10)
    addText('d) Por descontinuação da plataforma.', 10)
    yPos += 2

    addText('CLÁUSULA DÉCIMA PRIMEIRA: DO FORO', 11, true)
    addText(
      'Fica eleito o foro da Comarca de Belo Horizonte/MG para dirimir quaisquer controvérsias oriundas deste instrumento.',
      10
    )
    yPos += 5

    // Signatures
    addLine()
    addText('DECLARAÇÃO DE ACEITE', 11, true, 'center')
    yPos += 3
    addText(
      `Eu, ${user?.name || 'Usuário'}, declaro que li integralmente este Termo de Compromisso, compreendi todas as cláusulas e concordo com os termos aqui estabelecidos.`,
      10
    )
    yPos += 10

    addText(`Local e Data: Brasil, ${currentDate}`, 10)
    yPos += 15

    // Signature line
    doc.line(margin, yPos, margin + 80, yPos)
    yPos += 5
    addText(user?.name || 'Usuário', 10)
    addText('PARTICIPANTE', 9)
    yPos += 10

    addText(`Versão do Termo: ${CONTRACT_VERSION}`, 9)
    addText(`Número do Contrato: ${contractNumber}`, 9)
    addText(`Hash de Verificação: ${contractNumber}-${Date.now().toString(16).toUpperCase()}`, 9)

    // Footer
    doc.setFillColor(22, 101, 52)
    doc.rect(0, 282, pageWidth, 15, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.text(
      'Ágora Cidadão.AI - Transparência Pública com Inteligência Artificial',
      pageWidth / 2,
      288,
      { align: 'center' }
    )
    doc.text('contato@cidadao.ai | github.com/anderson-ufrj/cidadao.ai', pageWidth / 2, 293, {
      align: 'center',
    })

    return { pdf: doc, contractNumber }
  }

  const handleAccept = async () => {
    if (!acceptTerms || !hasReadContract) return

    setIsAccepting(true)
    try {
      let ipAddress: string | undefined
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        ipAddress = data.ip
      } catch {
        ipAddress = '127.0.0.1'
      }

      const { pdf, contractNumber: contractId } = await generateContractPDF()
      pdf.save(`termo-compromisso-agora-${contractId}.pdf`)

      await acceptLgpdConsent(ipAddress, navigator.userAgent)
      await acceptInternshipContract(ipAddress, navigator.userAgent, contractId)

      router.push('/pt/agora/onboarding')
    } catch (error) {
      console.error('Failed to accept terms:', error)
    } finally {
      setIsAccepting(false)
    }
  }

  const handlePrint = async () => {
    const { pdf } = await generateContractPDF()
    window.open(pdf.output('bloburl'), '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Carregando termo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-8">
      {/* Header */}
      <header className="bg-green-800 text-white py-4 print:bg-green-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={hasAccepted ? '/pt/agora' : '/pt/agora/login'}
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-6 h-6" />
                  <span className="font-bold text-lg">CIDADAO.AI</span>
                </div>
                <p className="text-sm text-green-200">
                  Plataforma Educacional de IA para Transparência Pública
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handlePrint()}
                className="text-white hover:bg-white/10"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Badge className="bg-white/20 text-white">{CONTRACT_VERSION}</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Contract Document */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          {/* Document Header */}
          <div className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 p-6 text-center">
            <ScrollText className="w-12 h-12 mx-auto mb-3 text-green-600 dark:text-green-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              TERMO DE COMPROMISSO DE PARTICIPAÇÃO
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">Nº {contractNumber}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              (Instrumento jurídico de acordo com a Lei Federal nº 13.709/2018 - LGPD)
            </p>
          </div>

          {/* Scrollable Contract Content */}
          <div
            ref={contractRef}
            className="h-[60vh] overflow-y-auto p-6 md:p-8 text-gray-700 dark:text-gray-300 contract-content"
          >
            {/* Platform Info */}
            <section className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h2 className="font-bold text-green-800 dark:text-green-200 mb-2">
                PLATAFORMA EDUCACIONAL
              </h2>
              <div className="text-sm space-y-1">
                <p>
                  <strong>NOME:</strong> Ágora Cidadão.AI - Plataforma Educacional de IA
                </p>
                <p>
                  <strong>ENDEREÇO:</strong> Plataforma 100% online
                </p>
                <p>
                  <strong>CONTATO:</strong> contato@cidadao.ai
                </p>
                <p>
                  <strong>RESPONSÁVEL:</strong> Anderson Henrique da Silva
                </p>
                <p>
                  <strong>PROJETO:</strong> Cidadão.AI - Transparência Pública com Inteligência
                  Artificial
                </p>
              </div>
            </section>

            {/* User Info */}
            <section className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h2 className="font-bold text-blue-800 dark:text-blue-200 mb-2">PARTICIPANTE</h2>
              <div className="text-sm space-y-1">
                <p>
                  <strong>NOME:</strong> {user?.name || 'Usuário'}
                </p>
                <p>
                  <strong>EMAIL:</strong> {user?.email || 'email@exemplo.com'}
                </p>
                <p>
                  <strong>GITHUB:</strong> {user?.githubUsername || 'N/A'}
                </p>
                <p>
                  <strong>DATA DE CADASTRO:</strong> {currentDate}
                </p>
              </div>
            </section>

            <p className="mb-6 text-center italic">
              Celebram entre si este TERMO DE COMPROMISSO DE PARTICIPAÇÃO, ajustando as seguintes
              cláusulas:
            </p>

            {/* Clauses */}
            <div className="space-y-6">
              <section>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  CLÁUSULA PRIMEIRA: DO OBJETO
                </h3>
                <p className="text-justify">
                  Este instrumento tem por objetivo estabelecer as condições para participação na
                  plataforma educacional Ágora Cidadão.AI, definindo os direitos e deveres do
                  PARTICIPANTE e da PLATAFORMA, bem como as condições para coleta e tratamento de
                  dados pessoais conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                </p>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  CLÁUSULA SEGUNDA: DA FINALIDADE
                </h3>
                <p className="text-justify mb-2">
                  A Ágora Cidadão.AI é uma plataforma educacional aberta e gratuita que visa
                  capacitar cidadãos no uso de Inteligência Artificial aplicada à transparência
                  pública. O programa inclui:
                </p>
                <ul className="list-[lower-alpha] list-inside space-y-1 ml-4">
                  <li>Trilhas de aprendizado em Backend, Frontend, IA/ML e DevOps;</li>
                  <li>Mentores virtuais baseados em IA (Santos-Dumont, Lina Bo Bardi);</li>
                  <li>Sistema de gamificação com XP, níveis e badges;</li>
                  <li>Certificado de conclusão ao final do programa.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  CLÁUSULA TERCEIRA: DA VIGÊNCIA
                </h3>
                <ul className="list-[lower-alpha] list-inside space-y-1 ml-4">
                  <li>
                    Este Termo de Compromisso entra em vigor na data de aceite ({currentDate}) e
                    permanecerá válido enquanto o PARTICIPANTE mantiver cadastro ativo na
                    plataforma.
                  </li>
                  <li>
                    O PARTICIPANTE pode solicitar o cancelamento a qualquer momento, sem
                    penalidades.
                  </li>
                  <li>
                    A PLATAFORMA reserva-se o direito de descontinuar o serviço com aviso prévio de
                    30 dias.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  CLÁUSULA QUARTA: DA COLETA DE DADOS (LGPD)
                </h3>
                <p className="mb-2">
                  Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), a
                  PLATAFORMA coletará os seguintes dados:
                </p>
                <ul className="list-[lower-alpha] list-inside space-y-1 ml-4">
                  <li>
                    <strong>Dados de identificação:</strong> nome, email, foto de perfil (via
                    OAuth);
                  </li>
                  <li>
                    <strong>Dados de navegação:</strong> endereço IP, tipo de navegador, sistema
                    operacional;
                  </li>
                  <li>
                    <strong>Dados de aprendizado:</strong> progresso nas trilhas, tempo de estudo,
                    interações com mentores;
                  </li>
                  <li>
                    <strong>Dados de gamificação:</strong> pontos XP, nível, badges conquistados,
                    posição no ranking.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  CLÁUSULA QUINTA: DAS FINALIDADES DO TRATAMENTO
                </h3>
                <p className="mb-2">Os dados coletados serão utilizados exclusivamente para:</p>
                <ul className="list-[lower-alpha] list-inside space-y-1 ml-4">
                  <li>Personalização da experiência de aprendizado;</li>
                  <li>Emissão de certificado de conclusão;</li>
                  <li>Geração de relatórios de progresso para o próprio PARTICIPANTE;</li>
                  <li>Pesquisa acadêmica sobre educação em IA (dados anonimizados);</li>
                  <li>Melhoria contínua da plataforma educacional.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  CLÁUSULA SEXTA: DOS DIREITOS DO TITULAR (Art. 18 da LGPD)
                </h3>
                <p className="mb-2">
                  O PARTICIPANTE possui os seguintes direitos sobre seus dados pessoais:
                </p>
                <ul className="list-[lower-alpha] list-inside space-y-1 ml-4">
                  <li>Confirmação da existência de tratamento;</li>
                  <li>Acesso aos dados coletados;</li>
                  <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
                  <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
                  <li>Portabilidade dos dados;</li>
                  <li>Eliminação dos dados tratados com consentimento;</li>
                  <li>Revogação do consentimento a qualquer momento.</li>
                </ul>
                <p className="mt-2 text-sm bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                  <strong>Para exercer estes direitos:</strong> contato@cidadao.ai
                </p>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  CLÁUSULA SÉTIMA: DAS OBRIGAÇÕES DA PLATAFORMA
                </h3>
                <ul className="list-[lower-alpha] list-inside space-y-1 ml-4">
                  <li>Fornecer acesso gratuito a todas as trilhas de aprendizado;</li>
                  <li>Disponibilizar mentores virtuais para auxílio no aprendizado;</li>
                  <li>Emitir certificado de conclusão mediante cumprimento dos requisitos;</li>
                  <li>Proteger os dados pessoais do PARTICIPANTE conforme a LGPD;</li>
                  <li>Notificar o PARTICIPANTE em caso de incidente de segurança;</li>
                  <li>Manter a plataforma disponível e funcional.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  CLÁUSULA OITAVA: DAS OBRIGAÇÕES DO PARTICIPANTE
                </h3>
                <ul className="list-[lower-alpha] list-inside space-y-1 ml-4">
                  <li>Fornecer informações verdadeiras no momento do cadastro;</li>
                  <li>Manter a confidencialidade de suas credenciais de acesso;</li>
                  <li>Utilizar a plataforma de forma ética e respeitosa;</li>
                  <li>Não compartilhar conteúdo do programa sem autorização;</li>
                  <li>Reportar bugs ou vulnerabilidades encontradas;</li>
                  <li>Respeitar os direitos autorais dos conteúdos disponibilizados.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  CLÁUSULA NONA: DA PROPRIEDADE INTELECTUAL
                </h3>
                <ul className="list-[lower-alpha] list-inside space-y-1 ml-4">
                  <li>
                    Todo conteúdo produzido pela PLATAFORMA é protegido por direitos autorais;
                  </li>
                  <li>
                    O PARTICIPANTE mantém a propriedade de projetos desenvolvidos durante o
                    programa;
                  </li>
                  <li>
                    A PLATAFORMA pode utilizar projetos do PARTICIPANTE como showcase, mediante
                    autorização prévia.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  CLÁUSULA DÉCIMA: DA RESCISÃO
                </h3>
                <p className="mb-2">Este Termo será rescindido nas seguintes situações:</p>
                <ul className="list-[lower-alpha] list-inside space-y-1 ml-4">
                  <li>Por solicitação do PARTICIPANTE;</li>
                  <li>Por descumprimento das obrigações aqui estabelecidas;</li>
                  <li>Por inatividade superior a 12 meses;</li>
                  <li>Por descontinuação da plataforma.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  CLÁUSULA DÉCIMA PRIMEIRA: DO FORO
                </h3>
                <p className="text-justify">
                  Fica eleito o foro da Comarca de Belo Horizonte/MG para dirimir quaisquer
                  controvérsias oriundas deste instrumento, com renúncia expressa a qualquer outro,
                  por mais privilegiado que seja.
                </p>
              </section>

              {/* Signature Section */}
              <section className="mt-8 pt-6 border-t-2 border-gray-300 dark:border-gray-600">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-center">
                  DECLARAÇÃO DE ACEITE
                </h3>
                <p className="text-justify mb-6">
                  E por estarem de inteiro e comum acordo com as condições e com o texto deste Termo
                  de Compromisso, o PARTICIPANTE declara que leu integralmente este documento,
                  compreendeu todas as cláusulas e concorda com os termos aqui estabelecidos.
                </p>

                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Local e Data: Brasil, {currentDate}
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="w-64 border-t-2 border-gray-400 dark:border-gray-500 mb-2"></div>
                    <p className="font-semibold">{user?.name || 'Usuário'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">PARTICIPANTE</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Scroll Indicator */}
          {!hasReadContract && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800 px-6 py-3 text-center">
              <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center justify-center gap-2">
                <ArrowRight
                  className="w-4 h-4 animate-bounce"
                  style={{ transform: 'rotate(90deg)' }}
                />
                Role até o final do documento para continuar
              </p>
            </div>
          )}

          {/* Accept Section */}
          <div className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="max-w-2xl mx-auto">
              {hasAccepted ? (
                // View mode - already signed
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                    <span className="text-xl font-semibold text-green-600 dark:text-green-400">
                      Contrato Assinado
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Você já assinou este termo de compromisso. Pode baixar uma cópia a qualquer
                    momento.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <Button
                      variant="secondary"
                      onClick={() => void handlePrint()}
                      leftIcon={<Printer className="w-4 h-4" />}
                    >
                      Visualizar PDF
                    </Button>
                    <Button
                      onClick={() => {
                        void (async () => {
                          const { pdf, contractNumber: contractId } = await generateContractPDF()
                          pdf.save(`termo-compromisso-agora-${contractId}.pdf`)
                        })()
                      }}
                      leftIcon={<Download className="w-4 h-4" />}
                    >
                      Baixar PDF
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => router.push('/pt/agora')}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Voltar ao Dashboard
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Versão: {CONTRACT_VERSION}
                  </p>
                </div>
              ) : (
                // Sign mode - needs signature
                <>
                  <label
                    className={cn(
                      'flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                      acceptTerms
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400',
                      !hasReadContract && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => hasReadContract && setAcceptTerms(e.target.checked)}
                      disabled={!hasReadContract}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Declaro que li integralmente este Termo de Compromisso</strong>,
                      compreendi todas as cláusulas e concordo com os termos aqui estabelecidos,
                      incluindo a coleta e tratamento dos meus dados pessoais conforme a LGPD.
                    </span>
                  </label>

                  <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                      <p>Versão: {CONTRACT_VERSION}</p>
                      <p className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1 mt-1">
                        <Download className="w-4 h-4" />
                        PDF será baixado automaticamente
                      </p>
                    </div>
                    <Button
                      onClick={() => void handleAccept()}
                      disabled={!acceptTerms || !hasReadContract || isAccepting}
                      loading={isAccepting}
                      size="lg"
                      className={cn(
                        'w-full sm:w-auto min-w-[200px]',
                        acceptTerms && hasReadContract
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                          : ''
                      )}
                      rightIcon={<CheckCircle2 className="w-5 h-5" />}
                    >
                      {isAccepting ? 'Processando...' : 'Assinar e Continuar'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
