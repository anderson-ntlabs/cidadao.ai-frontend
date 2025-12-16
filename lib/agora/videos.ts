/**
 * Agora Videos Service
 *
 * Fetches videos from Supabase with proper error handling
 * and fallback to demo mode
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-16
 */

import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

export interface VideoItem {
  id: string
  title: string
  description: string
  youtube_id: string
  thumbnail_url: string
  duration: string
  duration_seconds: number
  category: string
  track_id: string
  difficulty: string
  order_index: number
  channel: string
  style: string
  is_required: boolean
  validation_status: string
}

// YouTube thumbnail helper
const ytThumb = (videoId: string) => `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

// Convert duration string (e.g., "15min", "1h30min") to seconds
function durationToSeconds(duration: string): number {
  let seconds = 0
  const hourMatch = duration.match(/(\d+)\s*h/)
  const minMatch = duration.match(/(\d+)\s*min/)
  const secMatch = duration.match(/(\d+)\s*s/)

  if (hourMatch) seconds += parseInt(hourMatch[1]) * 3600
  if (minMatch) seconds += parseInt(minMatch[1]) * 60
  if (secMatch) seconds += parseInt(secMatch[1])

  // If just a number, assume minutes
  if (!hourMatch && !minMatch && !secMatch) {
    const numMatch = duration.match(/(\d+)/)
    if (numMatch) seconds = parseInt(numMatch[1]) * 60
  }

  return seconds
}

// Map track to category
function trackToCategory(trackId: string): string {
  const categoryMap: Record<string, string> = {
    introducao: 'onboarding',
    backend: 'backend',
    frontend: 'frontend',
    ia: 'ia',
    devops: 'devops',
  }
  return categoryMap[trackId] || 'all'
}

// Map style to difficulty
function styleToDifficulty(style: string): string {
  const difficultyMap: Record<string, string> = {
    academic: 'advanced',
    didactic: 'intermediate',
    practical: 'beginner',
  }
  return difficultyMap[style] || 'intermediate'
}

/**
 * Fetch all videos from Supabase
 */
export async function fetchVideos(): Promise<{
  data: VideoItem[] | null
  error: Error | null
}> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('agora_module_videos')
      .select(
        `
        id,
        title,
        description,
        youtube_id,
        duration,
        channel,
        style,
        validation_status,
        module:agora_modules!inner (
          module_number,
          track_id,
          track:agora_tracks!inner (
            id,
            name
          )
        )
      `
      )
      .eq('is_active', true)
      .eq('validation_status', 'valid')
      .order('id')

    if (error) {
      logger.error('Error fetching videos:', error)
      return { data: null, error: new Error(error.message) }
    }

    if (!data || data.length === 0) {
      return { data: null, error: new Error('No videos found') }
    }

    // Transform data to VideoItem format
    const videos: VideoItem[] = data.map((video: any, index: number) => ({
      id: String(video.id),
      title: video.title,
      description: video.description || '',
      youtube_id: video.youtube_id,
      thumbnail_url: ytThumb(video.youtube_id),
      duration: video.duration,
      duration_seconds: durationToSeconds(video.duration),
      category: trackToCategory(video.module?.track_id || ''),
      track_id: video.module?.track_id || '',
      difficulty: styleToDifficulty(video.style),
      order_index: index + 1,
      channel: video.channel || '',
      style: video.style,
      is_required: video.module?.module_number === 1, // First module videos are required
      validation_status: video.validation_status,
    }))

    return { data: videos, error: null }
  } catch (err) {
    logger.error('Error fetching videos:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error'),
    }
  }
}

/**
 * Fallback demo videos when database is unavailable
 */
export const demoVideos: VideoItem[] = [
  {
    id: '1',
    title: 'Introducao a Algoritmos',
    description: 'Curso em Video - Aprenda conceitos basicos de algoritmos',
    youtube_id: '8mei6uVttho',
    thumbnail_url: ytThumb('8mei6uVttho'),
    duration: '15min',
    duration_seconds: 900,
    category: 'onboarding',
    track_id: 'introducao',
    difficulty: 'beginner',
    order_index: 1,
    channel: 'Curso em Video',
    style: 'didactic',
    is_required: true,
    validation_status: 'valid',
  },
  {
    id: '2',
    title: 'Primeiro Algoritmo',
    description: 'Curso em Video - Como criar seu primeiro algoritmo',
    youtube_id: 'M2Af7gkbbro',
    thumbnail_url: ytThumb('M2Af7gkbbro'),
    duration: '12min',
    duration_seconds: 720,
    category: 'onboarding',
    track_id: 'introducao',
    difficulty: 'beginner',
    order_index: 2,
    channel: 'Curso em Video',
    style: 'practical',
    is_required: true,
    validation_status: 'valid',
  },
  {
    id: '3',
    title: 'Evolucao dos Computadores',
    description: 'UNIVESP - Historia e evolucao da computacao',
    youtube_id: 'zu5QvPHGU3Q',
    thumbnail_url: ytThumb('zu5QvPHGU3Q'),
    duration: '25min',
    duration_seconds: 1500,
    category: 'onboarding',
    track_id: 'introducao',
    difficulty: 'beginner',
    order_index: 3,
    channel: 'UNIVESP',
    style: 'academic',
    is_required: false,
    validation_status: 'valid',
  },
  {
    id: '4',
    title: 'Organizacao de Computadores',
    description: 'UNIVESP - Elementos da organizacao de computadores',
    youtube_id: 'qQpXmzJHm8I',
    thumbnail_url: ytThumb('qQpXmzJHm8I'),
    duration: '25min',
    duration_seconds: 1500,
    category: 'backend',
    track_id: 'backend',
    difficulty: 'intermediate',
    order_index: 4,
    channel: 'UNIVESP',
    style: 'academic',
    is_required: false,
    validation_status: 'valid',
  },
  {
    id: '5',
    title: 'Hardware de Computadores',
    description: 'UNIVESP - Componentes de hardware',
    youtube_id: 'hjYehF3lFdQ',
    thumbnail_url: ytThumb('hjYehF3lFdQ'),
    duration: '25min',
    duration_seconds: 1500,
    category: 'backend',
    track_id: 'backend',
    difficulty: 'intermediate',
    order_index: 5,
    channel: 'UNIVESP',
    style: 'academic',
    is_required: false,
    validation_status: 'valid',
  },
  {
    id: '6',
    title: 'Sistemas Operacionais',
    description: 'UNIVESP - Introducao aos sistemas operacionais',
    youtube_id: 'WruRR-8aPF0',
    thumbnail_url: ytThumb('WruRR-8aPF0'),
    duration: '25min',
    duration_seconds: 1500,
    category: 'devops',
    track_id: 'devops',
    difficulty: 'intermediate',
    order_index: 6,
    channel: 'UNIVESP',
    style: 'academic',
    is_required: false,
    validation_status: 'valid',
  },
  {
    id: '7',
    title: 'Estruturas de Repeticao',
    description: 'Curso em Video - Loops e estruturas de repeticao em programacao',
    youtube_id: 'U5PnCt58Q68',
    thumbnail_url: ytThumb('U5PnCt58Q68'),
    duration: '25min',
    duration_seconds: 1500,
    category: 'backend',
    track_id: 'backend',
    difficulty: 'intermediate',
    order_index: 7,
    channel: 'Curso em Video',
    style: 'didactic',
    is_required: false,
    validation_status: 'valid',
  },
  {
    id: '8',
    title: 'Estruturas de Repeticao 2',
    description: 'Curso em Video - Mais sobre loops e estruturas de repeticao',
    youtube_id: 'fP49L1i_-HU',
    thumbnail_url: ytThumb('fP49L1i_-HU'),
    duration: '25min',
    duration_seconds: 1500,
    category: 'backend',
    track_id: 'backend',
    difficulty: 'intermediate',
    order_index: 8,
    channel: 'Curso em Video',
    style: 'didactic',
    is_required: false,
    validation_status: 'valid',
  },
]
