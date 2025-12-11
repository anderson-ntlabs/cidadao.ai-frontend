/**
 * Ágora Tracks Hook
 *
 * Fetches learning tracks, modules, and videos from Supabase database.
 * Replaces hardcoded track data with dynamic database content.
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @since 2025-12-11
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AgoraTracks')

// ============================================
// Types
// ============================================

export interface TrackMentor {
  id: string
  name: string
  role: string
  image: string
  greeting?: string
  videoIntro?: string
  diaryEncouragement?: string
  chatInvitation?: string
}

export interface ModuleVideo {
  id: number
  moduleId: number
  style: 'academic' | 'didactic' | 'practical'
  title: string
  channel: string
  channelUrl?: string
  youtubeId: string
  duration: string
  description?: string
  validationStatus?: 'pending' | 'valid' | 'invalid' | 'unavailable'
}

export interface TrackModule {
  id: number
  trackId: string
  moduleNumber: number
  title: string
  description: string
  objectives: string[]
  xpReward: number
  diaryPrompt?: string
  chatPrompt?: string
  videos: ModuleVideo[]
  exercises: ModuleExercise[]
}

export interface ModuleExercise {
  id: number
  moduleId: number
  exerciseType: 'quiz' | 'coding' | 'reflection'
  question: string
  options?: string[]
  correctAnswer?: number
  minWords?: number
  xpReward: number
}

export interface Track {
  id: string
  name: string
  subtitle?: string
  description: string
  icon: string
  color: string
  gradient: string
  duration: string
  xpTotal: number
  certificateHours: number
  isIntro: boolean
  prerequisiteId?: string
  mentor: TrackMentor
  displayOrder: number
  isActive: boolean
  modules: TrackModule[]
}

export interface KidsTrack {
  id: string
  name: string
  description: string
  emoji: string
  color: string
  displayOrder: number
  isActive: boolean
  videos: KidsVideo[]
}

export interface KidsVideo {
  id: string
  trackId: string
  title: string
  description: string
  youtubeId: string
  duration: string
  thumbnail?: string
  displayOrder: number
  validationStatus?: 'pending' | 'valid' | 'invalid' | 'unavailable'
}

// ============================================
// Database fetch functions
// ============================================

async function fetchTracksFromDB(): Promise<Track[]> {
  const supabase = createClient()

  // Fetch all tracks
  const { data: tracksData, error: tracksError } = await supabase
    .from('agora_tracks')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (tracksError) {
    logger.error('Error fetching tracks:', tracksError)
    throw tracksError
  }

  if (!tracksData || tracksData.length === 0) {
    logger.warn('No tracks found in database')
    return []
  }

  // Fetch all modules
  const { data: modulesData, error: modulesError } = await supabase
    .from('agora_modules')
    .select('*')
    .eq('is_active', true)
    .order('track_id, module_number')

  if (modulesError) {
    logger.error('Error fetching modules:', modulesError)
    throw modulesError
  }

  // Fetch all videos (only valid ones)
  const { data: videosData, error: videosError } = await supabase
    .from('agora_module_videos')
    .select('*')
    .eq('is_active', true)
    .order('module_id, style')

  if (videosError) {
    logger.error('Error fetching videos:', videosError)
    throw videosError
  }

  // Fetch all exercises
  const { data: exercisesData, error: exercisesError } = await supabase
    .from('agora_exercises')
    .select('*')
    .eq('is_active', true)
    .order('module_id')

  if (exercisesError) {
    logger.error('Error fetching exercises:', exercisesError)
    throw exercisesError
  }

  // Build the track objects with nested data
  const tracks: Track[] = tracksData.map((track) => {
    const trackModules = (modulesData || [])
      .filter((m) => m.track_id === track.id)
      .map((module) => {
        const moduleVideos = (videosData || [])
          .filter((v) => v.module_id === module.id)
          .map((video) => ({
            id: video.id,
            moduleId: video.module_id,
            style: video.style as 'academic' | 'didactic' | 'practical',
            title: video.title,
            channel: video.channel,
            channelUrl: video.channel_url,
            youtubeId: video.youtube_id,
            duration: video.duration,
            description: video.description,
            validationStatus: video.validation_status,
          }))

        const moduleExercises = (exercisesData || [])
          .filter((e) => e.module_id === module.id)
          .map((exercise) => ({
            id: exercise.id,
            moduleId: exercise.module_id,
            exerciseType: exercise.exercise_type as 'quiz' | 'coding' | 'reflection',
            question: exercise.question,
            options: exercise.options,
            correctAnswer: exercise.correct_answer,
            minWords: exercise.min_words,
            xpReward: exercise.xp_reward,
          }))

        return {
          id: module.id,
          trackId: module.track_id,
          moduleNumber: module.module_number,
          title: module.title,
          description: module.description,
          objectives: module.objectives || [],
          xpReward: module.xp_reward,
          diaryPrompt: module.diary_prompt,
          chatPrompt: module.chat_prompt,
          videos: moduleVideos,
          exercises: moduleExercises,
        }
      })

    return {
      id: track.id,
      name: track.name,
      subtitle: track.subtitle,
      description: track.description,
      icon: track.icon,
      color: track.color,
      gradient: track.gradient,
      duration: track.duration,
      xpTotal: track.xp_total,
      certificateHours: track.certificate_hours,
      isIntro: track.is_intro,
      prerequisiteId: track.prerequisite_id,
      mentor: {
        id: track.mentor_id,
        name: track.mentor_name,
        role: track.mentor_role,
        image: track.mentor_image,
        greeting: track.mentor_greeting,
        videoIntro: track.mentor_video_intro,
        diaryEncouragement: track.mentor_diary_encouragement,
        chatInvitation: track.mentor_chat_invitation,
      },
      displayOrder: track.display_order,
      isActive: track.is_active,
      modules: trackModules,
    }
  })

  logger.info(`Loaded ${tracks.length} tracks with ${modulesData?.length || 0} modules`)
  return tracks
}

async function fetchKidsTracksFromDB(): Promise<KidsTrack[]> {
  const supabase = createClient()

  // Fetch kids tracks
  const { data: tracksData, error: tracksError } = await supabase
    .from('agora_kids_tracks')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (tracksError) {
    logger.error('Error fetching kids tracks:', tracksError)
    throw tracksError
  }

  if (!tracksData || tracksData.length === 0) {
    logger.warn('No kids tracks found in database')
    return []
  }

  // Fetch kids videos
  const { data: videosData, error: videosError } = await supabase
    .from('agora_kids_videos')
    .select('*')
    .eq('is_active', true)
    .order('track_id, display_order')

  if (videosError) {
    logger.error('Error fetching kids videos:', videosError)
    throw videosError
  }

  // Build kids track objects
  const kidsTracks: KidsTrack[] = tracksData.map((track) => {
    const trackVideos = (videosData || [])
      .filter((v) => v.track_id === track.id)
      .map((video) => ({
        id: video.id,
        trackId: video.track_id,
        title: video.title,
        description: video.description,
        youtubeId: video.youtube_id,
        duration: video.duration,
        thumbnail: video.thumbnail,
        displayOrder: video.display_order,
        validationStatus: video.validation_status,
      }))

    return {
      id: track.id,
      name: track.name,
      description: track.description,
      emoji: track.emoji,
      color: track.color,
      displayOrder: track.display_order,
      isActive: track.is_active,
      videos: trackVideos,
    }
  })

  logger.info(`Loaded ${kidsTracks.length} kids tracks with ${videosData?.length || 0} videos`)
  return kidsTracks
}

// ============================================
// Hook: useAgoraTracks
// ============================================

export interface UseAgoraTracksReturn {
  tracks: Track[]
  kidsTracks: KidsTrack[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  getTrack: (trackId: string) => Track | undefined
  getModule: (trackId: string, moduleNumber: number) => TrackModule | undefined
  getModuleVideos: (trackId: string, moduleNumber: number) => ModuleVideo[]
  getKidsTrack: (trackId: string) => KidsTrack | undefined
  getKidsVideo: (videoId: string) => KidsVideo | undefined
}

export function useAgoraTracks(): UseAgoraTracksReturn {
  const [tracks, setTracks] = useState<Track[]>([])
  const [kidsTracks, setKidsTracks] = useState<KidsTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [tracksResult, kidsResult] = await Promise.all([
        fetchTracksFromDB(),
        fetchKidsTracksFromDB(),
      ])

      setTracks(tracksResult)
      setKidsTracks(kidsResult)
    } catch (err) {
      logger.error('Error loading tracks:', err)
      setError(err instanceof Error ? err : new Error('Failed to load tracks'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Helper functions
  const getTrack = useCallback(
    (trackId: string) => {
      return tracks.find((t) => t.id === trackId)
    },
    [tracks]
  )

  const getModule = useCallback(
    (trackId: string, moduleNumber: number) => {
      const track = tracks.find((t) => t.id === trackId)
      return track?.modules.find((m) => m.moduleNumber === moduleNumber)
    },
    [tracks]
  )

  const getModuleVideos = useCallback(
    (trackId: string, moduleNumber: number) => {
      const module = getModule(trackId, moduleNumber)
      return module?.videos || []
    },
    [getModule]
  )

  const getKidsTrack = useCallback(
    (trackId: string) => {
      return kidsTracks.find((t) => t.id === trackId)
    },
    [kidsTracks]
  )

  const getKidsVideo = useCallback(
    (videoId: string) => {
      for (const track of kidsTracks) {
        const video = track.videos.find((v) => v.id === videoId)
        if (video) return video
      }
      return undefined
    },
    [kidsTracks]
  )

  return useMemo(
    () => ({
      tracks,
      kidsTracks,
      isLoading,
      error,
      refetch: fetchData,
      getTrack,
      getModule,
      getModuleVideos,
      getKidsTrack,
      getKidsVideo,
    }),
    [
      tracks,
      kidsTracks,
      isLoading,
      error,
      fetchData,
      getTrack,
      getModule,
      getModuleVideos,
      getKidsTrack,
      getKidsVideo,
    ]
  )
}

// ============================================
// Icon mapping helper
// ============================================

export const TRACK_ICONS: Record<string, string> = {
  GraduationCap: 'GraduationCap',
  Server: 'Server',
  Palette: 'Palette',
  Brain: 'Brain',
  Code: 'Code',
  BookOpen: 'BookOpen',
}

// ============================================
// Color mapping helper
// ============================================

export const TRACK_COLORS: Record<
  string,
  {
    gradient: string
    bgLight: string
    bgDark: string
    borderColor: string
    textColor: string
  }
> = {
  emerald: {
    gradient: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  purple: {
    gradient: 'from-purple-500 to-pink-500',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
  green: {
    gradient: 'from-green-500 to-emerald-500',
    bgLight: 'bg-green-50',
    bgDark: 'dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-600 dark:text-green-400',
  },
  orange: {
    gradient: 'from-orange-500 to-amber-500',
    bgLight: 'bg-orange-50',
    bgDark: 'dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-600 dark:text-orange-400',
  },
}

export default useAgoraTracks
