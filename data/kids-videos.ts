/**
 * Kids Videos Data
 *
 * Curated YouTube videos for children learning programming.
 * Content from educational channels in Brazilian Portuguese.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

import { KidsVideo } from '@/components/kids/kids-video-card'

/**
 * Curated programming videos for children
 * All videos are from trusted Brazilian educational channels
 */
export const KIDS_VIDEOS: KidsVideo[] = [
  {
    id: 'intro-programacao',
    title: 'O que é Programação?',
    description: 'Descubra o que os programadores fazem e como eles criam jogos, apps e sites!',
    youtubeId: 'tRcr4vtV-4o',
    duration: '10:30',
    thumbnail: '',
    order: 1,
  },
  {
    id: 'pensamento-computacional',
    title: 'Pensamento Computacional para Crianças',
    description: 'Aprenda a pensar como um computador e resolver problemas de forma criativa!',
    youtubeId: 'oDsY_cKufMk',
    duration: '8:45',
    thumbnail: '',
    order: 2,
  },
  {
    id: 'algoritmos-basicos',
    title: 'Algoritmos: Receitas para o Computador',
    description: 'O que são algoritmos? Aprenda fazendo uma receita de bolo!',
    youtubeId: 'Aw3yHB5EYlY',
    duration: '7:20',
    thumbnail: '',
    order: 3,
  },
  {
    id: 'scratch-primeiro-projeto',
    title: 'Meu Primeiro Projeto no Scratch',
    description: 'Crie seu primeiro jogo usando Scratch, a linguagem de programação visual!',
    youtubeId: '7oBJz-mPwYs',
    duration: '15:00',
    thumbnail: '',
    order: 4,
  },
  {
    id: 'logica-programacao',
    title: 'Lógica de Programação com Jogos',
    description: 'Aprenda lógica de programação jogando e se divertindo!',
    youtubeId: '9kq3iyLz7xQ',
    duration: '12:15',
    thumbnail: '',
    order: 5,
  },
  {
    id: 'variaveis-explicadas',
    title: 'O que são Variáveis?',
    description: 'Variáveis são como caixinhas mágicas que guardam informações!',
    youtubeId: 'KNUbPRj9TGM',
    duration: '9:00',
    thumbnail: '',
    order: 6,
  },
  {
    id: 'loops-repeticao',
    title: 'Loops: Fazendo o Computador Repetir',
    description: 'Aprenda a fazer o computador repetir ações automaticamente!',
    youtubeId: 'pTB0EiLXUC8',
    duration: '11:30',
    thumbnail: '',
    order: 7,
  },
  {
    id: 'condicionais',
    title: 'Se... Então: Tomando Decisões',
    description: 'Ensine o computador a tomar decisões usando condicionais!',
    youtubeId: 'Rw0pZS4Wn8A',
    duration: '10:00',
    thumbnail: '',
    order: 8,
  },
  {
    id: 'animacoes-scratch',
    title: 'Criando Animações no Scratch',
    description: 'Faça seus personagens dançarem e se moverem na tela!',
    youtubeId: 'hSgLSbQ_a9E',
    duration: '14:00',
    thumbnail: '',
    order: 9,
  },
  {
    id: 'jogo-completo',
    title: 'Criando um Jogo Completo',
    description: 'Projeto final: crie um jogo de pegar objetos do início ao fim!',
    youtubeId: 'N2RTjWQvn_8',
    duration: '20:00',
    thumbnail: '',
    order: 10,
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
 * Total number of videos
 */
export const TOTAL_KIDS_VIDEOS = KIDS_VIDEOS.length
