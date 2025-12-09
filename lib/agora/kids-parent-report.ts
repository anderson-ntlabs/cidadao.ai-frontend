/**
 * Kids Parent Report Generator
 *
 * Generates detailed PDF report for parents with:
 * - Child's progress and achievements
 * - Activity timeline
 * - Time spent learning
 * - Recommendations
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-09
 */

import { jsPDF } from 'jspdf'
import type {
  KidsTelemetryData,
  KidsCertificateLevel,
  KidsMilestone,
} from './kids-certificate-requirements'
import { getDailyActivitySummary } from '@/lib/analytics/kids-tracker'

interface ParentReportData {
  childName: string
  parentName: string
  parentEmail: string
  telemetry: KidsTelemetryData
  currentLevel: KidsCertificateLevel | null
  milestones: KidsMilestone[]
}

/**
 * Generate comprehensive PDF report for parents
 */
export function generateKidsParentReport(data: ParentReportData): jsPDF {
  const { childName, parentName, parentEmail, telemetry, currentLevel, milestones } = data
  const doc = new jsPDF('portrait')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let currentY = margin

  const addNewPage = () => {
    doc.addPage()
    currentY = margin
  }

  const checkPageBreak = (neededSpace: number) => {
    if (currentY + neededSpace > pageHeight - margin) {
      addNewPage()
    }
  }

  // ===== COVER PAGE =====
  // Header decoration
  doc.setFillColor(255, 107, 107) // Coral
  doc.rect(0, 0, pageWidth, 50, 'F')
  doc.setFillColor(78, 205, 196) // Turquoise
  doc.rect(0, 50, pageWidth, 8, 'F')

  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('RELATORIO DE PROGRESSO', pageWidth / 2, 30, { align: 'center' })
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Agora Kids - Cidadao.AI', pageWidth / 2, 42, { align: 'center' })

  currentY = 75

  // Child info card
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 60, 5, 5, 'F')
  doc.setDrawColor(78, 205, 196)
  doc.setLineWidth(2)
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 60, 5, 5)

  doc.setTextColor(78, 205, 196)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('CRIANCA', margin + 10, currentY + 15)

  doc.setTextColor(31, 41, 55)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(childName, margin + 10, currentY + 35)

  if (currentLevel) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`${currentLevel.emoji} ${currentLevel.label}`, margin + 10, currentY + 50)
  }

  currentY += 75

  // Parent info
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text(`Responsavel: ${parentName}`, margin, currentY)
  doc.text(`Email: ${parentEmail}`, margin, currentY + 12)

  currentY += 30

  // Summary stats
  doc.setFillColor(255, 107, 107, 20)
  doc.roundedRect(margin, currentY, (pageWidth - margin * 2 - 10) / 3, 50, 3, 3, 'F')
  doc.setFillColor(78, 205, 196, 20)
  doc.roundedRect(
    margin + (pageWidth - margin * 2 - 10) / 3 + 5,
    currentY,
    (pageWidth - margin * 2 - 10) / 3,
    50,
    3,
    3,
    'F'
  )
  doc.setFillColor(255, 230, 109, 20)
  doc.roundedRect(
    margin + ((pageWidth - margin * 2 - 10) / 3 + 5) * 2,
    currentY,
    (pageWidth - margin * 2 - 10) / 3,
    50,
    3,
    3,
    'F'
  )

  const statWidth = (pageWidth - margin * 2 - 10) / 3
  const stats = [
    {
      label: 'Videos Assistidos',
      value: telemetry.videosWatched.toString(),
      color: [255, 107, 107],
    },
    { label: 'Conversas', value: telemetry.mentorConversations.toString(), color: [78, 205, 196] },
    { label: 'Dias Ativos', value: telemetry.daysActive.toString(), color: [255, 230, 109] },
  ]

  stats.forEach((stat, index) => {
    const x = margin + index * (statWidth + 5) + statWidth / 2
    doc.setTextColor(stat.color[0], stat.color[1], stat.color[2])
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text(stat.value, x, currentY + 28, { align: 'center' })
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.text(stat.label, x, currentY + 42, { align: 'center' })
  })

  currentY += 65

  // Time summary
  const hours = Math.floor(telemetry.totalTimeMinutes / 60)
  const minutes = telemetry.totalTimeMinutes % 60
  const timeText = hours > 0 ? `${hours}h ${minutes}min` : `${minutes} minutos`

  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 35, 3, 3, 'F')

  doc.setFontSize(11)
  doc.setTextColor(75, 85, 99)
  doc.text('Tempo total de estudo:', margin + 10, currentY + 15)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(78, 205, 196)
  doc.text(timeText, margin + 10, currentY + 28)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  doc.text(`em ${telemetry.totalSessions} sessoes`, pageWidth - margin - 10, currentY + 22, {
    align: 'right',
  })

  currentY += 50

  // Report date
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  doc.setFontSize(10)
  doc.setTextColor(156, 163, 175)
  doc.text(`Relatorio gerado em ${currentDate}`, pageWidth / 2, pageHeight - 20, {
    align: 'center',
  })

  // ===== PAGE 2: MILESTONES =====
  addNewPage()

  // Header
  doc.setFillColor(78, 205, 196)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('CONQUISTAS E MARCOS', pageWidth / 2, 25, { align: 'center' })

  currentY = 55

  // Milestones list
  const completedMilestones = milestones.filter((m) => m.isCompleted)
  const pendingMilestones = milestones.filter((m) => !m.isCompleted)

  if (completedMilestones.length > 0) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(34, 197, 94)
    doc.text(`Conquistados (${completedMilestones.length})`, margin, currentY)
    currentY += 10

    completedMilestones.forEach((milestone) => {
      checkPageBreak(20)

      doc.setFillColor(240, 253, 244)
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 18, 2, 2, 'F')

      doc.setFontSize(14)
      doc.text(milestone.icon, margin + 8, currentY + 12)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(34, 197, 94)
      doc.text(milestone.label, margin + 25, currentY + 8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 114, 128)
      doc.text(milestone.description, margin + 25, currentY + 15)

      currentY += 22
    })
  }

  if (pendingMilestones.length > 0) {
    currentY += 10
    checkPageBreak(30)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(156, 163, 175)
    doc.text(`Proximos desafios (${pendingMilestones.length})`, margin, currentY)
    currentY += 10

    pendingMilestones.slice(0, 5).forEach((milestone) => {
      checkPageBreak(20)

      doc.setFillColor(248, 250, 252)
      doc.roundedRect(margin, currentY, pageWidth - margin * 2, 18, 2, 2, 'F')

      doc.setFontSize(14)
      doc.setTextColor(156, 163, 175)
      doc.text(milestone.icon, margin + 8, currentY + 12)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(milestone.label, margin + 25, currentY + 8)
      doc.setFont('helvetica', 'normal')
      doc.text(milestone.description, margin + 25, currentY + 15)

      currentY += 22
    })
  }

  // ===== PAGE 3: DAILY ACTIVITY =====
  addNewPage()

  // Header
  doc.setFillColor(255, 107, 107)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('ATIVIDADE DIARIA', pageWidth / 2, 25, { align: 'center' })

  currentY = 55

  // Get daily activity
  const dailyActivity = getDailyActivitySummary()

  if (dailyActivity.length === 0) {
    doc.setFontSize(12)
    doc.setTextColor(156, 163, 175)
    doc.text('Nenhuma atividade registrada ainda.', pageWidth / 2, currentY + 20, {
      align: 'center',
    })
  } else {
    // Table header
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 14, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(75, 85, 99)
    doc.text('DATA', margin + 8, currentY + 10)
    doc.text('TEMPO', margin + 50, currentY + 10)
    doc.text('VIDEOS', margin + 95, currentY + 10)
    doc.text('CONVERSAS', pageWidth - margin - 8, currentY + 10, { align: 'right' })
    currentY += 18

    // Table rows
    doc.setFont('helvetica', 'normal')
    const recentDays = dailyActivity.slice(-14).reverse()

    recentDays.forEach((day, index) => {
      checkPageBreak(14)

      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252)
        doc.rect(margin, currentY, pageWidth - margin * 2, 12, 'F')
      }

      const dateStr = new Date(day.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
      const timeStr =
        day.minutes >= 60
          ? `${Math.floor(day.minutes / 60)}h ${day.minutes % 60}m`
          : `${day.minutes}m`

      doc.setTextColor(75, 85, 99)
      doc.setFontSize(9)
      doc.text(dateStr, margin + 8, currentY + 8)
      doc.setTextColor(78, 205, 196)
      doc.setFont('helvetica', 'bold')
      doc.text(timeStr, margin + 50, currentY + 8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(75, 85, 99)
      doc.text(day.videosWatched.toString(), margin + 95, currentY + 8)
      doc.text(day.chatMessages.toString(), pageWidth - margin - 8, currentY + 8, {
        align: 'right',
      })

      currentY += 12
    })
  }

  // ===== PAGE 4: RECOMMENDATIONS =====
  addNewPage()

  // Header
  doc.setFillColor(255, 230, 109)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(75, 85, 99)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('RECOMENDACOES', pageWidth / 2, 25, { align: 'center' })

  currentY = 55

  // Recommendations based on activity
  const recommendations = generateRecommendations(telemetry, currentLevel)

  recommendations.forEach((rec) => {
    checkPageBreak(50)

    doc.setFillColor(248, 250, 252)
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 40, 3, 3, 'F')

    doc.setFontSize(20)
    doc.text(rec.icon, margin + 10, currentY + 25)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(31, 41, 55)
    doc.text(rec.title, margin + 35, currentY + 15)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    const descLines = doc.splitTextToSize(rec.description, pageWidth - margin * 2 - 45)
    doc.text(descLines, margin + 35, currentY + 25)

    currentY += 48
  })

  // Footer note
  currentY += 10
  doc.setFillColor(78, 205, 196, 20)
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 40, 3, 3, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(78, 205, 196)
  doc.text('Nota para os Pais', margin + 10, currentY + 15)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(75, 85, 99)
  doc.setFontSize(9)
  const noteText =
    'Este relatorio foi gerado automaticamente com base nas atividades registradas na plataforma Agora Kids. Incentive seu filho(a) a continuar explorando e aprendendo!'
  const noteLines = doc.splitTextToSize(noteText, pageWidth - margin * 2 - 20)
  doc.text(noteLines, margin + 10, currentY + 25)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(156, 163, 175)
  doc.text('Agora Kids - Cidadao.AI - LGPD/ECA Compliant', pageWidth / 2, pageHeight - 10, {
    align: 'center',
  })

  return doc
}

interface Recommendation {
  icon: string
  title: string
  description: string
}

function generateRecommendations(
  telemetry: KidsTelemetryData,
  currentLevel: KidsCertificateLevel | null
): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Based on videos watched
  if (telemetry.videosWatched < 5) {
    recommendations.push({
      icon: '🎬',
      title: 'Explore mais videos',
      description:
        'Sua crianca assistiu poucos videos. Incentive-a a explorar diferentes topicos na trilha de videos.',
    })
  } else {
    recommendations.push({
      icon: '🎬',
      title: 'Otimo progresso em videos!',
      description:
        'Sua crianca esta assistindo os videos regularmente. Continue incentivando essa pratica.',
    })
  }

  // Based on chat interactions
  if (telemetry.mentorConversations < 10) {
    recommendations.push({
      icon: '💬',
      title: 'Converse com os mentores',
      description:
        'Os mentores Lobato e Tarsila estao disponiveis para ajudar. Incentive sua crianca a fazer perguntas!',
    })
  } else {
    recommendations.push({
      icon: '💬',
      title: 'Excelente interacao!',
      description:
        'Sua crianca esta conversando bastante com os mentores. Isso demonstra curiosidade e engajamento.',
    })
  }

  // Based on consistency
  if (telemetry.daysActive < 7) {
    recommendations.push({
      icon: '📅',
      title: 'Estabeleca uma rotina',
      description:
        'Estudar um pouquinho todos os dias e melhor do que estudar muito em um unico dia. Tente criar uma rotina.',
    })
  } else {
    recommendations.push({
      icon: '📅',
      title: 'Consistencia e a chave!',
      description:
        'Parabens pela consistencia! Manter uma rotina regular de estudos e muito importante.',
    })
  }

  // Based on time spent
  const avgMinutesPerDay =
    telemetry.daysActive > 0 ? telemetry.totalTimeMinutes / telemetry.daysActive : 0
  if (avgMinutesPerDay < 15) {
    recommendations.push({
      icon: '⏱️',
      title: 'Aumente o tempo de estudo',
      description:
        'Sessoes de 15-30 minutos sao ideais para criancas. Tente estabelecer um horario fixo de estudo.',
    })
  } else if (avgMinutesPerDay > 60) {
    recommendations.push({
      icon: '⏱️',
      title: 'Equilibrio e importante',
      description:
        'Sua crianca esta estudando bastante! Lembre-se de equilibrar com atividades fisicas e brincadeiras.',
    })
  }

  // Based on level
  if (!currentLevel) {
    recommendations.push({
      icon: '🌟',
      title: 'Primeiro certificado chegando!',
      description:
        'Sua crianca esta proxima de conquistar o primeiro certificado Cidadaozinho. Continue incentivando!',
    })
  } else if (currentLevel.id === 'explorer') {
    recommendations.push({
      icon: '🎨',
      title: 'Proximo nivel: Criador',
      description: 'O proximo passo e o certificado Criador! Continue acompanhando o progresso.',
    })
  } else if (currentLevel.id === 'creator') {
    recommendations.push({
      icon: '🏆',
      title: 'Rumo ao nivel Mestre!',
      description:
        'Sua crianca ja e uma Criadora! O proximo e ultimo nivel e o Mestre. Estamos na reta final!',
    })
  }

  return recommendations
}
