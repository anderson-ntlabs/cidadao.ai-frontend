/**
 * Kids Videos Data
 *
 * Curated YouTube videos for children organized in learning tracks.
 *
 * Tracks:
 * 1. Programação para Crianças - Scratch and coding basics
 * 2. Por que Aprender a Programar? - Motivation and benefits
 * 3. História da Computação - Evolution of computers
 *
 * Sources: Smile and Learn, Manual do Mundo, Code.org, Khan Academy
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 * @updated 2025-12-09 - Added new tracks: Why Learn Programming + History of Computing
 */

import { KidsVideo } from '@/components/kids/kids-video-card'

// Helper to generate YouTube thumbnail URL
const ytThumb = (videoId: string) => `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`

/**
 * Track Types
 */
export type KidsTrackId = 'programacao' | 'porque-programar' | 'historia-computacao'

export interface KidsTrack {
  id: KidsTrackId
  name: string
  description: string
  emoji: string
  color: string
  videos: KidsVideo[]
}

/**
 * ====================================
 * TRILHA 1: Programação para Crianças
 * ====================================
 * Scratch and coding basics
 */
const PROGRAMACAO_VIDEOS: KidsVideo[] = [
  // Módulo 1: Introdução
  {
    id: 'intro-programacao',
    title: 'O que é Programação?',
    description:
      'Descubra o que os programadores fazem e como eles criam jogos, apps e sites! Uma introdução divertida ao mundo da programação.',
    youtubeId: 'tRcr4vtV-4o',
    duration: '10:30',
    thumbnail: ytThumb('tRcr4vtV-4o'),
    order: 1,
  },
  {
    id: 'pensamento-computacional',
    title: 'Pensamento Computacional',
    description:
      'Aprenda a pensar como um computador! Dividir problemas grandes em pedacinhos pequenos é o segredo dos programadores.',
    youtubeId: 'oDsY_cKufMk',
    duration: '8:45',
    thumbnail: ytThumb('oDsY_cKufMk'),
    order: 2,
  },
  // Módulo 2: Algoritmos
  {
    id: 'algoritmos-basicos',
    title: 'Algoritmos: Receitas para o Computador',
    description:
      'O que são algoritmos? É como fazer uma receita de bolo! Passo a passo, o computador segue suas instruções.',
    youtubeId: 'Aw3yHB5EYlY',
    duration: '7:20',
    thumbnail: ytThumb('Aw3yHB5EYlY'),
    order: 3,
  },
  {
    id: 'sequencias-logicas',
    title: 'Sequências Lógicas',
    description:
      'Aprenda a colocar as coisas na ordem certa! Sequências são super importantes na programação.',
    youtubeId: 'vKwNP3b6kYk',
    duration: '9:15',
    thumbnail: ytThumb('vKwNP3b6kYk'),
    order: 4,
  },
  // Módulo 3: Scratch
  {
    id: 'scratch-primeiro-projeto',
    title: 'Meu Primeiro Projeto no Scratch',
    description:
      'Hora de colocar a mão na massa! Vamos criar seu primeiro programa usando Scratch, a linguagem visual do MIT.',
    youtubeId: '7oBJz-mPwYs',
    duration: '15:00',
    thumbnail: ytThumb('7oBJz-mPwYs'),
    order: 5,
  },
  {
    id: 'scratch-movimentos',
    title: 'Movendo Personagens no Scratch',
    description:
      'Faça seus personagens andarem, pularem e dançarem! Aprenda os blocos de movimento do Scratch.',
    youtubeId: 'hSgLSbQ_a9E',
    duration: '12:00',
    thumbnail: ytThumb('hSgLSbQ_a9E'),
    order: 6,
  },
  // Módulo 4: Lógica
  {
    id: 'logica-programacao',
    title: 'Lógica de Programação com Jogos',
    description:
      'Aprenda lógica jogando! Desafios divertidos que vão treinar seu cérebro de programador.',
    youtubeId: '9kq3iyLz7xQ',
    duration: '12:15',
    thumbnail: ytThumb('9kq3iyLz7xQ'),
    order: 7,
  },
  {
    id: 'variaveis-explicadas',
    title: 'O que são Variáveis?',
    description:
      'Variáveis são como caixinhas mágicas que guardam informações! Aprenda a usar esse superpoder.',
    youtubeId: 'KNUbPRj9TGM',
    duration: '9:00',
    thumbnail: ytThumb('KNUbPRj9TGM'),
    order: 8,
  },
  // Módulo 5: Estruturas
  {
    id: 'loops-repeticao',
    title: 'Loops: Fazendo o Computador Repetir',
    description:
      'Por que fazer 100 vezes se o computador pode repetir sozinho? Aprenda o poder dos loops!',
    youtubeId: 'pTB0EiLXUC8',
    duration: '11:30',
    thumbnail: ytThumb('pTB0EiLXUC8'),
    order: 9,
  },
  {
    id: 'condicionais',
    title: 'Se... Então: Tomando Decisões',
    description:
      'Ensine o computador a tomar decisões! Se acontecer isso, faça aquilo. A lógica das condições.',
    youtubeId: 'Rw0pZS4Wn8A',
    duration: '10:00',
    thumbnail: ytThumb('Rw0pZS4Wn8A'),
    order: 10,
  },
  // Módulo 6: Projetos
  {
    id: 'animacoes-scratch',
    title: 'Criando Animações no Scratch',
    description:
      'Transforme suas ideias em animações! Faça personagens falarem, dançarem e contarem histórias.',
    youtubeId: 'JfGJRJf0jZI',
    duration: '14:00',
    thumbnail: ytThumb('JfGJRJf0jZI'),
    order: 11,
  },
  {
    id: 'jogo-completo',
    title: 'Projeto Final: Seu Primeiro Jogo',
    description:
      'Chegou a hora! Use tudo que aprendeu para criar um jogo completo do zero. Você consegue!',
    youtubeId: 'N2RTjWQvn_8',
    duration: '20:00',
    thumbnail: ytThumb('N2RTjWQvn_8'),
    order: 12,
  },
]

/**
 * ==========================================
 * TRILHA 2: Por que Aprender a Programar?
 * ==========================================
 * Motivation, benefits, and inspiration for kids
 * Videos from: Smile and Learn, Code.org, educational channels
 */
const PORQUE_PROGRAMAR_VIDEOS: KidsVideo[] = [
  {
    id: 'porque-aprender-codigo',
    title: 'Por que Aprender a Programar?',
    description: 'Descubra por que programação é um superpoder! Crie jogos, apps e muito mais.',
    youtubeId: 'nKIu9yen5nc', // Code.org - What Most Schools Don't Teach (legendado)
    duration: '5:44',
    thumbnail: ytThumb('nKIu9yen5nc'),
    order: 1,
  },
  {
    id: 'criancas-programadoras',
    title: 'Crianças que Programam',
    description: 'Conheça crianças incríveis que já criam seus próprios jogos e aplicativos!',
    youtubeId: 'OK405CFHgEQ', // Smile and Learn - Tecnologia para crianças
    duration: '4:30',
    thumbnail: ytThumb('OK405CFHgEQ'),
    order: 2,
  },
  {
    id: 'profissoes-futuro',
    title: 'Profissões do Futuro',
    description: 'Que profissões vão existir quando você crescer? A tecnologia vai estar em todas!',
    youtubeId: '6-1MtfkWqQI', // Smile and Learn - Profissões
    duration: '6:15',
    thumbnail: ytThumb('6-1MtfkWqQI'),
    order: 3,
  },
  {
    id: 'criatividade-tecnologia',
    title: 'Criatividade e Tecnologia',
    description: 'Programar é ser criativo! Transforme suas ideias em realidade com código.',
    youtubeId: 'fc5w4GsGfso', // Smile and Learn - Criatividade
    duration: '5:00',
    thumbnail: ytThumb('fc5w4GsGfso'),
    order: 4,
  },
  {
    id: 'resolver-problemas',
    title: 'Aprendendo a Resolver Problemas',
    description:
      'Programadores são super-heróis que resolvem problemas! Aprenda como pensar assim.',
    youtubeId: 'F_lByE6hPSE', // Smile and Learn - Resolução de problemas
    duration: '4:45',
    thumbnail: ytThumb('F_lByE6hPSE'),
    order: 5,
  },
  {
    id: 'hora-do-codigo',
    title: 'A Hora do Código',
    description:
      'Milhões de crianças no mundo todo aprendem a programar em uma hora! Você também pode.',
    youtubeId: 'FC5FbmsH4fw', // Hour of Code promotional
    duration: '3:24',
    thumbnail: ytThumb('FC5FbmsH4fw'),
    order: 6,
  },
]

/**
 * ==========================================
 * TRILHA 3: História da Computação
 * ==========================================
 * Evolution of computers from abacus to modern tech
 * Videos from: Smile and Learn, educational channels
 */
const HISTORIA_COMPUTACAO_VIDEOS: KidsVideo[] = [
  {
    id: 'historia-computador',
    title: 'A História do Computador',
    description:
      'Do ábaco ao computador! Viaje no tempo e descubra como surgiram essas máquinas incríveis.',
    youtubeId: 'F3qWg1JBPZg', // Smile and Learn - História do computador
    duration: '6:30',
    thumbnail: ytThumb('F3qWg1JBPZg'),
    order: 1,
  },
  {
    id: 'abaco-calculadora',
    title: 'Do Ábaco à Calculadora',
    description:
      'Há milhares de anos, as pessoas já queriam calcular! Conheça o ábaco e as primeiras máquinas.',
    youtubeId: 'PvLaPKPzq2I', // História das calculadoras
    duration: '5:45',
    thumbnail: ytThumb('PvLaPKPzq2I'),
    order: 2,
  },
  {
    id: 'primeiros-computadores',
    title: 'Os Primeiros Computadores',
    description:
      'O ENIAC era do tamanho de uma sala! Descubra como eram os computadores gigantes de antigamente.',
    youtubeId: 'HLmcJJnVPxs', // Computadores antigos
    duration: '7:00',
    thumbnail: ytThumb('HLmcJJnVPxs'),
    order: 3,
  },
  {
    id: 'evolucao-tecnologia',
    title: 'A Evolução da Tecnologia',
    description:
      'De válvulas a microchips! Veja como a tecnologia ficou cada vez menor e mais poderosa.',
    youtubeId: 'Rj5Qdfge3U4', // Smile and Learn - Tecnologia
    duration: '5:30',
    thumbnail: ytThumb('Rj5Qdfge3U4'),
    order: 4,
  },
  {
    id: 'internet-criancas',
    title: 'Como Surgiu a Internet?',
    description: 'A internet conecta o mundo todo! Descubra como essa rede incrível foi criada.',
    youtubeId: '21eFwbb48sE', // Smile and Learn - Internet
    duration: '6:00',
    thumbnail: ytThumb('21eFwbb48sE'),
    order: 5,
  },
  {
    id: 'robos-inteligencia-artificial',
    title: 'Robôs e Inteligência Artificial',
    description: 'Robôs que pensam? Conheça a inteligência artificial e o futuro da tecnologia!',
    youtubeId: 'a0_lo_GDcFw', // Smile and Learn - IA para crianças
    duration: '5:15',
    thumbnail: ytThumb('a0_lo_GDcFw'),
    order: 6,
  },
]

/**
 * All tracks definition
 */
export const KIDS_TRACKS: KidsTrack[] = [
  {
    id: 'programacao',
    name: 'Programação para Crianças',
    description: 'Aprenda a programar com Scratch e crie seus próprios jogos!',
    emoji: '💻',
    color: 'kids-coral',
    videos: PROGRAMACAO_VIDEOS,
  },
  {
    id: 'porque-programar',
    name: 'Por que Aprender a Programar?',
    description: 'Descubra os superpoderes que a programação pode te dar!',
    emoji: '🚀',
    color: 'kids-turquoise',
    videos: PORQUE_PROGRAMAR_VIDEOS,
  },
  {
    id: 'historia-computacao',
    name: 'História da Computação',
    description: 'Viaje no tempo e conheça a evolução dos computadores!',
    emoji: '🕰️',
    color: 'kids-purple',
    videos: HISTORIA_COMPUTACAO_VIDEOS,
  },
]

/**
 * Legacy export - all videos from all tracks
 * Maintains backward compatibility
 */
export const KIDS_VIDEOS: KidsVideo[] = KIDS_TRACKS.flatMap((track) => track.videos)

/**
 * Get track by ID
 */
export function getKidsTrackById(trackId: KidsTrackId): KidsTrack | undefined {
  return KIDS_TRACKS.find((track) => track.id === trackId)
}

/**
 * Get video by ID (searches all tracks)
 */
export function getKidsVideoById(id: string): KidsVideo | undefined {
  for (const track of KIDS_TRACKS) {
    const video = track.videos.find((v) => v.id === id)
    if (video) return video
  }
  return undefined
}

/**
 * Get video with track info
 */
export function getKidsVideoWithTrack(
  id: string
): { video: KidsVideo; track: KidsTrack } | undefined {
  for (const track of KIDS_TRACKS) {
    const video = track.videos.find((v) => v.id === id)
    if (video) return { video, track }
  }
  return undefined
}

/**
 * Get videos by order range within a specific track
 */
export function getKidsVideosByRange(
  trackId: KidsTrackId,
  start: number,
  end: number
): KidsVideo[] {
  const track = getKidsTrackById(trackId)
  if (!track) return []
  return track.videos.filter((video) => video.order >= start && video.order <= end)
}

/**
 * Get next video in sequence within the same track
 */
export function getNextKidsVideo(currentId: string): KidsVideo | undefined {
  const result = getKidsVideoWithTrack(currentId)
  if (!result) return undefined

  const { video, track } = result
  return track.videos.find((v) => v.order === video.order + 1)
}

/**
 * Get previous video in sequence within the same track
 */
export function getPreviousKidsVideo(currentId: string): KidsVideo | undefined {
  const result = getKidsVideoWithTrack(currentId)
  if (!result) return undefined

  const { video, track } = result
  return track.videos.find((v) => v.order === video.order - 1)
}

/**
 * Get videos by module (legacy - only for programacao track)
 */
export function getKidsVideosByModule(module: number): KidsVideo[] {
  const moduleRanges: Record<number, [number, number]> = {
    1: [1, 2], // Introdução
    2: [3, 4], // Algoritmos
    3: [5, 6], // Scratch
    4: [7, 8], // Lógica
    5: [9, 10], // Estruturas
    6: [11, 12], // Projetos
  }

  const range = moduleRanges[module]
  if (!range) return []

  return getKidsVideosByRange('programacao', range[0], range[1])
}

/**
 * Module names for display (legacy - programacao track)
 */
export const KIDS_MODULES = [
  { id: 1, name: 'Introdução', emoji: '🌟', videos: [1, 2] },
  { id: 2, name: 'Algoritmos', emoji: '📝', videos: [3, 4] },
  { id: 3, name: 'Scratch', emoji: '🐱', videos: [5, 6] },
  { id: 4, name: 'Lógica', emoji: '🧠', videos: [7, 8] },
  { id: 5, name: 'Estruturas', emoji: '🔄', videos: [9, 10] },
  { id: 6, name: 'Projetos', emoji: '🎮', videos: [11, 12] },
]

/**
 * Total number of videos across all tracks
 */
export const TOTAL_KIDS_VIDEOS = KIDS_VIDEOS.length

/**
 * Get total videos per track
 */
export function getTrackVideoCount(trackId: KidsTrackId): number {
  const track = getKidsTrackById(trackId)
  return track?.videos.length || 0
}
