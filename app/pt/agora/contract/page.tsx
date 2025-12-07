'use client'

/**
 * Agora Contract Page
 *
 * Terms of use and LGPD consent page for Agora Academy.
 * Users must accept before accessing the platform.
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-07
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAgora } from '@/hooks/use-agora'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  FileText,
  Shield,
  CheckCircle2,
  Download,
  GraduationCap,
  Scale,
  Database,
  BarChart3,
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { jsPDF } from 'jspdf'

const CONTRACT_VERSION = 'v2.0-2025'

export default function AgoraContractPage() {
  const router = useRouter()
  const { user, isLoading, isDemoMode, acceptLgpdConsent, acceptInternshipContract } = useAgora()
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

  // Check if user has already accepted
  const hasAccepted = user?.hasAcceptedLgpd && user?.hasAcceptedInternshipContract

  // Redirect if already accepted
  useEffect(() => {
    if (hasAccepted && !isLoading) {
      router.push('/pt/agora')
    }
  }, [hasAccepted, isLoading, router])

  const generateContractPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - 2 * margin
    let yPos = 20

    const addWrappedText = (text: string, fontSize: number, isBold = false) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      const lines = doc.splitTextToSize(text, contentWidth)

      if (yPos + lines.length * (fontSize * 0.5) > 280) {
        doc.addPage()
        yPos = 20
      }

      doc.text(lines, margin, yPos)
      yPos += lines.length * (fontSize * 0.5) + 5
    }

    // Header
    doc.setFillColor(22, 163, 74)
    doc.rect(0, 0, pageWidth, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('TERMOS DE USO - AGORA CIDADAO.AI', pageWidth / 2, 20, { align: 'center' })
    doc.setFontSize(12)
    doc.text('Plataforma Educacional de IA para Transparencia Publica', pageWidth / 2, 32, {
      align: 'center',
    })

    yPos = 55
    doc.setTextColor(0, 0, 0)

    const contractId = `AGORA-${Date.now().toString(36).toUpperCase()}`
    addWrappedText(`Termo No: ${contractId}`, 10, true)
    addWrappedText(`Data de Aceite: ${currentDate}`, 10)
    addWrappedText(`Versao do Termo: ${CONTRACT_VERSION}`, 10)
    yPos += 5

    addWrappedText('1. IDENTIFICACAO DO USUARIO', 14, true)
    addWrappedText(`Nome: ${user?.name || 'Usuario'}`, 11)
    addWrappedText(`Email: ${user?.email || 'email@exemplo.com'}`, 11)
    yPos += 5

    addWrappedText('2. OBJETO', 14, true)
    addWrappedText(
      'O presente termo estabelece as condicoes para utilizacao da Agora Cidadao.AI, ' +
        'plataforma educacional aberta voltada ao aprendizado de Inteligencia Artificial ' +
        'aplicada a transparencia publica.',
      11
    )
    yPos += 5

    addWrappedText('3. COLETA E TRATAMENTO DE DADOS', 14, true)
    addWrappedText('3.1. Dados Coletados:', 12, true)
    addWrappedText('- Nome e email', 11)
    addWrappedText('- Endereco IP e informacoes do navegador', 11)
    addWrappedText('- Tempo de sessao e metricas de interacao', 11)
    addWrappedText('- Progresso de aprendizado e avaliacoes', 11)
    addWrappedText('- Conversas com agentes de IA (para fins educacionais)', 11)
    yPos += 3

    addWrappedText('3.2. Finalidades do Tratamento:', 12, true)
    addWrappedText('- Emissao de certificado de conclusao', 11)
    addWrappedText('- Pesquisa academica sobre educacao em IA (dados anonimizados)', 11)
    addWrappedText('- Melhoria continua da plataforma educacional', 11)
    addWrappedText('- Geracao de relatorio de progresso e metricas de engajamento', 11)
    yPos += 5

    addWrappedText('4. FUNDAMENTACAO LEGAL', 14, true)
    addWrappedText(
      'O tratamento de dados pessoais nesta plataforma fundamenta-se nas seguintes bases legais da ' +
        'Lei Geral de Protecao de Dados (Lei no 13.709/2018 - LGPD):',
      11
    )
    yPos += 3
    addWrappedText('Art. 7o, I - Consentimento do titular (presente termo)', 11)
    addWrappedText('Art. 7o, IV - Realizacao de estudos por orgao de pesquisa', 11)
    addWrappedText('Art. 7o, IX - Interesses legitimos do controlador (educacao)', 11)
    yPos += 5

    addWrappedText('5. DIREITOS DO TITULAR DOS DADOS', 14, true)
    addWrappedText('Conforme a LGPD (Art. 18), o(a) usuario(a) possui os seguintes direitos:', 11)
    addWrappedText('- Confirmacao e acesso aos dados coletados', 11)
    addWrappedText('- Correcao de dados incompletos ou desatualizados', 11)
    addWrappedText('- Anonimizacao, bloqueio ou eliminacao de dados desnecessarios', 11)
    addWrappedText('- Portabilidade dos dados', 11)
    addWrappedText('- Revogacao do consentimento a qualquer momento', 11)
    yPos += 3
    addWrappedText('Para exercer estes direitos, contate: contato@cidadao.ai', 11)

    doc.addPage()
    yPos = 20

    addWrappedText('6. DECLARACAO DE ACEITE', 14, true)
    addWrappedText(`Eu, ${user?.name || 'Usuario'}, DECLARO que:`, 11)
    yPos += 3
    addWrappedText('[X] Li e compreendi integralmente estes Termos de Uso', 11)
    addWrappedText(
      '[X] Autorizo a coleta e tratamento dos meus dados pessoais para as finalidades descritas',
      11
    )
    addWrappedText('[X] Concordo com a geracao de relatorios baseados em telemetria', 11)
    addWrappedText('[X] Estou ciente dos meus direitos como titular de dados pessoais', 11)
    addWrappedText('[X] Aceito participar da plataforma Agora Cidadao.AI', 11)
    yPos += 10

    doc.setDrawColor(0)
    doc.line(margin, yPos + 20, margin + 80, yPos + 20)
    doc.setFontSize(10)
    doc.text(user?.name || 'Usuario', margin, yPos + 28)
    doc.text('Usuario(a)', margin, yPos + 35)

    yPos += 50

    addWrappedText('7. ASSINATURA DIGITAL', 14, true)
    addWrappedText(`Data/Hora do Aceite: ${new Date().toLocaleString('pt-BR')}`, 11)
    addWrappedText(`Hash do Termo: ${contractId}-${Date.now().toString(16)}`, 10)

    doc.setFillColor(22, 163, 74)
    doc.rect(0, 277, pageWidth, 20, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.text(
      'Agora Cidadao.AI - Transparencia Publica com Inteligencia Artificial',
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
      let ipAddress: string | undefined
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        ipAddress = data.ip
      } catch {
        ipAddress = '127.0.0.1'
      }

      const { pdf, contractId } = generateContractPDF()
      pdf.save(`termos-uso-agora-${contractId}.pdf`)

      await acceptLgpdConsent(ipAddress, navigator.userAgent)
      await acceptInternshipContract(ipAddress, navigator.userAgent, contractId)

      router.push('/pt/agora/onboarding')
    } catch (error) {
      console.error('Failed to accept terms:', error)
    } finally {
      setIsAccepting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Carregando termos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/pt/agora/login"
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h1 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                  Termos de Uso
                </h1>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Agora Cidadao.AI - Plataforma Educacional
              </p>
            </div>
            <Badge variant="secondary" size="default">
              {CONTRACT_VERSION}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Bem-vindo(a), {user?.name?.split(' ')[0] || 'Estudante'}!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Para iniciar sua jornada na <strong>Agora Cidadao.AI</strong>, e necessario aceitar
                os termos de uso abaixo. Este documento estabelece as condicoes para coleta de dados
                e uso da plataforma educacional.
              </p>
            </div>
          </div>
        </Card>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Legal Basis */}
          <Card
            variant="outlined"
            padding="md"
            className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200 text-base">
                <Scale className="w-5 h-5" />
                Fundamentacao Legal
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>
                  <strong>Lei 13.709/2018 (LGPD)</strong>
                </li>
                <li>Art. 7o, I - Consentimento</li>
                <li>Art. 7o, IV - Pesquisa academica</li>
              </ul>
            </CardContent>
          </Card>

          {/* What is Agora */}
          <Card
            variant="outlined"
            padding="md"
            className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200 text-base">
                <GraduationCap className="w-5 h-5" />O que e a Agora?
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-green-700 dark:text-green-300">
                Plataforma <strong>educacional aberta e gratuita</strong> para aprender IA aplicada
                a transparencia publica. Mentores IA, XP, badges e certificado!
              </p>
            </CardContent>
          </Card>

          {/* Telemetry */}
          <Card
            variant="outlined"
            padding="md"
            className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-base">
                <BarChart3 className="w-5 h-5" />
                Metricas e Progresso
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Seu progresso sera acompanhado por <strong>telemetria</strong>: tempo de estudo,
                interacoes com mentores, videos e XP. Isso permite gerar seu certificado.
              </p>
            </CardContent>
          </Card>

          {/* Rights */}
          <Card
            variant="outlined"
            padding="md"
            className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/20"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200 text-base">
                <Shield className="w-5 h-5" />
                Seus Direitos (LGPD)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Voce pode solicitar <strong>acesso, correcao ou exclusao</strong> de seus dados a
                qualquer momento via <strong>contato@cidadao.ai</strong>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Details */}
        <Card variant="filled" padding="md" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-gray-500" />
                Dados Coletados
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Nome e email
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Tempo de sessao e metricas de interacao
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Progresso de aprendizado
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Sistema de gamificacao (XP, niveis, badges)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  IP e navegador (seguranca)
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-500" />
                Finalidades
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Certificado de conclusao
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Relatorio de progresso
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Pesquisa academica (anonimizado)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Melhoria da plataforma
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Checkboxes */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Declaracao de Aceite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={checkboxes.telemetry}
                  onChange={(e) => setCheckboxes({ ...checkboxes, telemetry: e.target.checked })}
                  className="mt-0.5 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Autorizo a coleta de telemetria</strong> (tempo de estudo, interacoes,
                  progresso) para acompanhamento do meu aprendizado.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={checkboxes.dataCollection}
                  onChange={(e) =>
                    setCheckboxes({ ...checkboxes, dataCollection: e.target.checked })
                  }
                  className="mt-0.5 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Autorizo o tratamento dos meus dados pessoais</strong> conforme a LGPD
                  (Lei 13.709/2018) para as finalidades educacionais descritas.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={checkboxes.reportGeneration}
                  onChange={(e) =>
                    setCheckboxes({ ...checkboxes, reportGeneration: e.target.checked })
                  }
                  className="mt-0.5 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Concordo com a geracao de relatorios</strong> baseados nos dados de
                  telemetria e metricas de engajamento coletados.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={checkboxes.lgpdConsent}
                  onChange={(e) => setCheckboxes({ ...checkboxes, lgpdConsent: e.target.checked })}
                  className="mt-0.5 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Estou ciente dos meus direitos</strong> como titular de dados pessoais
                  conforme Art. 18 da LGPD e sei como exerce-los.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={checkboxes.termsAccept}
                  onChange={(e) => setCheckboxes({ ...checkboxes, termsAccept: e.target.checked })}
                  className="mt-0.5 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Aceito participar da plataforma Agora Cidadao.AI</strong> e concordo com
                  estes Termos de Uso.
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              Versao: {CONTRACT_VERSION} | Data: {currentDate}
            </p>
            <p className="text-green-600 dark:text-green-400 font-medium mt-1 flex items-center gap-1">
              <Download className="w-4 h-4" />
              Um PDF dos termos sera baixado automaticamente
            </p>
          </div>
          <Button
            onClick={handleAccept}
            disabled={!allChecked || isAccepting}
            loading={isAccepting}
            size="lg"
            className={cn(
              'w-full sm:w-auto',
              allChecked
                ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
                : ''
            )}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            {isAccepting ? 'Gerando termos...' : 'Aceitar e Continuar'}
          </Button>
        </div>

        {/* Contact */}
        <Card variant="filled" padding="sm" className="mt-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Mail className="w-4 h-4" />
            <span>
              Duvidas? Entre em contato: <strong>contato@cidadao.ai</strong>
            </span>
          </div>
        </Card>
      </main>
    </div>
  )
}
