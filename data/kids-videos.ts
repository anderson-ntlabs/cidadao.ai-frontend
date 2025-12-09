/**
 * Kids Videos Data
 *
 * Curated YouTube videos for children learning programming.
 * Main source: Canal "Programação Descomplicada" and similar educational channels.
 *
 * Playlist reference: https://www.youtube.com/watch?v=tRcr4vtV-4o
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

import { KidsVideo } from '@/components/kids/kids-video-card'

/**
 * Trilha de Programação para Crianças
 *
 * Videos organized in learning sequence:
 * 1. Introduction to programming concepts
 * 2. Computational thinking
 * 3. Algorithms basics
 * 4. Scratch projects
 * 5. Logic and problem solving
 * 6. Variables and data
 * 7. Loops and repetition
 * 8. Conditionals
 * 9. Animations
 * 10. Complete project
 */
export const KIDS_VIDEOS: KidsVideo[] = [
  // Módulo 1: Introdução
  {
    id: 'intro-programacao',
    title: 'O que é Programação?',
    description:
      'Descubra o que os programadores fazem e como eles criam jogos, apps e sites! Uma introdução divertida ao mundo da programação.',
    youtubeId: 'tRcr4vtV-4o',
    duration: '10:30',
    thumbnail: '',
    order: 1,
  },
  {
    id: 'pensamento-computacional',
    title: 'Pensamento Computacional',
    description:
      'Aprenda a pensar como um computador! Dividir problemas grandes em pedacinhos pequenos é o segredo dos programadores.',
    youtubeId: 'oDsY_cKufMk',
    duration: '8:45',
    thumbnail: '',
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
    thumbnail: '',
    order: 3,
  },
  {
    id: 'sequencias-logicas',
    title: 'Sequências Lógicas',
    description:
      'Aprenda a colocar as coisas na ordem certa! Sequências são super importantes na programação.',
    youtubeId: 'vKwNP3b6kYk',
    duration: '9:15',
    thumbnail: '',
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
    thumbnail: '',
    order: 5,
  },
  {
    id: 'scratch-movimentos',
    title: 'Movendo Personagens no Scratch',
    description:
      'Faça seus personagens andarem, pularem e dançarem! Aprenda os blocos de movimento do Scratch.',
    youtubeId: 'hSgLSbQ_a9E',
    duration: '12:00',
    thumbnail: '',
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
    thumbnail: '',
    order: 7,
  },
  {
    id: 'variaveis-explicadas',
    title: 'O que são Variáveis?',
    description:
      'Variáveis são como caixinhas mágicas que guardam informações! Aprenda a usar esse superpoder.',
    youtubeId: 'KNUbPRj9TGM',
    duration: '9:00',
    thumbnail: '',
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
    thumbnail: '',
    order: 9,
  },
  {
    id: 'condicionais',
    title: 'Se... Então: Tomando Decisões',
    description:
      'Ensine o computador a tomar decisões! Se acontecer isso, faça aquilo. A lógica das condições.',
    youtubeId: 'Rw0pZS4Wn8A',
    duration: '10:00',
    thumbnail: '',
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
    thumbnail: '',
    order: 11,
  },
  {
    id: 'jogo-completo',
    title: 'Projeto Final: Seu Primeiro Jogo',
    description:
      'Chegou a hora! Use tudo que aprendeu para criar um jogo completo do zero. Você consegue!',
    youtubeId: 'N2RTjWQvn_8',
    duration: '20:00',
    thumbnail: '',
    order: 12,
  },
]

/**
 * Get video by ID
 */
export function getKidsVideoById(id: string): KidsVideo | undefined {
  return KIDS_VIDEOS.find((video) => video.id === id)
}

/**
 * Get videos by order range
 */
export function getKidsVideosByRange(start: number, end: number): KidsVideo[] {
  return KIDS_VIDEOS.filter((video) => video.order >= start && video.order <= end)
}

/**
 * Get next video in sequence
 */
export function getNextKidsVideo(currentId: string): KidsVideo | undefined {
  const currentVideo = getKidsVideoById(currentId)
  if (!currentVideo) return undefined

  return KIDS_VIDEOS.find((video) => video.order === currentVideo.order + 1)
}

/**
 * Get previous video in sequence
 */
export function getPreviousKidsVideo(currentId: string): KidsVideo | undefined {
  const currentVideo = getKidsVideoById(currentId)
  if (!currentVideo) return undefined

  return KIDS_VIDEOS.find((video) => video.order === currentVideo.order - 1)
}

/**
 * Get videos by module
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

  return getKidsVideosByRange(range[0], range[1])
}

/**
 * Module names for display
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
 * Total number of videos
 */
export const TOTAL_KIDS_VIDEOS = KIDS_VIDEOS.length
