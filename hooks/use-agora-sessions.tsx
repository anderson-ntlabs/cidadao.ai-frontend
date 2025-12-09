/**
 * Ágora Sessions Hook
 *
 * Manages study sessions and diary entries.
 * Separated from main auth for better code organization.
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @since 2025-12-09
 */

'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AgoraSessions')

// ============================================
// Types
// ============================================

export interface StudySession {
  id: string
  startedAt: string
  endedAt?: string
  durationMinutes: number
  xpEarned: number
  agentsUsed: string[]
  status: 'active' | 'completed' | 'abandoned'
}

export interface DiaryEntry {
  id: string
  content: string
  mood: 'great' | 'good' | 'neutral' | 'struggling'
  whatLearned: string
  whatStruggled: string
  nextSteps: string
  entryDate: string
  createdAt: string
}

export interface DiaryEntryInput {
  content: string
  mood: 'great' | 'good' | 'neutral' | 'struggling'
  whatLearned: string
  whatStruggled: string
  nextSteps: string
  entryDate: string
}

// ============================================
// Context & Hook Interface
// ============================================

export interface UseAgoraSessionsReturn {
  // State
  currentSession: StudySession | null
  sessions: StudySession[]
  diaryEntries: DiaryEntry[]
  totalSessions: number
  totalTimeMinutes: number
  isLoading: boolean

  // Actions
  startSession: () => Promise<void>
  endSession: (xpEarned?: number, agentsUsed?: string[]) => Promise<void>
  addDiaryEntry: (entry: DiaryEntryInput) => Promise<void>
  refreshSessions: () => Promise<void>
}

interface AgoraSessionsProviderProps {
  children: React.ReactNode
  userId: string | null
  onSessionEnd?: (durationMinutes: number) => Promise<void>
  onDiaryEntry?: () => Promise<void>
}

const AgoraSessionsContext = createContext<UseAgoraSessionsReturn | undefined>(undefined)

// ============================================
// Provider
// ============================================

export function AgoraSessionsProvider({
  children,
  userId,
  onSessionEnd,
  onDiaryEntry,
}: AgoraSessionsProviderProps) {
  const supabase = createClient()

  // State
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null)
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
  const [totalSessions, setTotalSessions] = useState(0)
  const [totalTimeMinutes, setTotalTimeMinutes] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Ref for current session ID
  const currentSessionIdRef = useRef<string | null>(null)

  // Load sessions data
  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load profile for totals
        const { data: profile } = await supabase
          .from('agora_profiles')
          .select('total_sessions, total_time_minutes')
          .eq('user_id', userId)
          .maybeSingle()

        if (profile) {
          setTotalSessions(profile.total_sessions || 0)
          setTotalTimeMinutes(profile.total_time_minutes || 0)
        }

        // Load sessions
        const { data: sessionsData } = await supabase
          .from('agora_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('started_at', { ascending: false })
          .limit(50)

        if (sessionsData) {
          const mappedSessions: StudySession[] = sessionsData.map((s) => ({
            id: s.id,
            startedAt: s.started_at,
            endedAt: s.ended_at || undefined,
            durationMinutes: s.duration_minutes || 0,
            xpEarned: s.xp_earned || 0,
            agentsUsed:
              (s.conversations as { agent_name: string }[])?.map((c) => c.agent_name) || [],
            status: s.status || 'completed',
          }))

          setSessions(mappedSessions)

          // Check for active session
          const activeSession = mappedSessions.find((s) => s.status === 'active')
          if (activeSession) {
            setCurrentSession(activeSession)
            currentSessionIdRef.current = activeSession.id
          }
        }

        // Load diary entries
        const { data: diaryData } = await supabase
          .from('agora_diary_entries')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (diaryData) {
          setDiaryEntries(
            diaryData.map((d) => ({
              id: d.id,
              content: d.content || '',
              mood: d.mood || 'neutral',
              whatLearned: d.what_learned || '',
              whatStruggled: d.what_struggled || '',
              nextSteps: d.next_steps || '',
              entryDate: d.entry_date || '',
              createdAt: d.created_at,
            }))
          )
        }
      } catch (error) {
        logger.error('Failed to load sessions data', { error })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [userId, supabase])

  // Start session
  const startSession = useCallback(async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('agora_sessions')
        .insert({
          user_id: userId,
          started_at: new Date().toISOString(),
          status: 'active',
        })
        .select()
        .single()

      if (error) throw error

      currentSessionIdRef.current = data.id
      setCurrentSession({
        id: data.id,
        startedAt: data.started_at,
        durationMinutes: 0,
        xpEarned: 0,
        agentsUsed: [],
        status: 'active',
      })

      logger.info('Session started', { sessionId: data.id })
    } catch (error) {
      logger.error('Failed to start session', { error })
    }
  }, [userId, supabase])

  // End session
  const endSession = useCallback(
    async (xpEarned = 0, agentsUsed: string[] = []) => {
      if (!userId || !currentSessionIdRef.current) return

      try {
        const sessionId = currentSessionIdRef.current
        const startedAt = currentSession?.startedAt || new Date().toISOString()
        const durationMinutes = Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000)

        await supabase
          .from('agora_sessions')
          .update({
            ended_at: new Date().toISOString(),
            duration_minutes: durationMinutes,
            xp_earned: xpEarned,
            conversations: agentsUsed.map((a) => ({ agent_name: a })),
            status: 'completed',
          })
          .eq('id', sessionId)

        // Update profile stats
        const newTotalSessions = totalSessions + 1
        const newTotalTime = totalTimeMinutes + durationMinutes

        await supabase
          .from('agora_profiles')
          .update({
            total_sessions: newTotalSessions,
            total_time_minutes: newTotalTime,
          })
          .eq('user_id', userId)

        setSessions((prev) => [
          {
            id: sessionId,
            startedAt,
            endedAt: new Date().toISOString(),
            durationMinutes,
            xpEarned,
            agentsUsed,
            status: 'completed',
          },
          ...prev.filter((s) => s.id !== sessionId),
        ])

        currentSessionIdRef.current = null
        setCurrentSession(null)
        setTotalSessions(newTotalSessions)
        setTotalTimeMinutes(newTotalTime)

        // Callback for XP award, etc.
        if (onSessionEnd) {
          await onSessionEnd(durationMinutes)
        }

        logger.info('Session ended', { sessionId, durationMinutes, xpEarned })
      } catch (error) {
        logger.error('Failed to end session', { error })
      }
    },
    [userId, currentSession, totalSessions, totalTimeMinutes, supabase, onSessionEnd]
  )

  // Add diary entry
  const addDiaryEntry = useCallback(
    async (entry: DiaryEntryInput) => {
      if (!userId) return

      try {
        const { data, error } = await supabase
          .from('agora_diary_entries')
          .insert({
            user_id: userId,
            session_id: currentSessionIdRef.current,
            content: entry.content,
            mood: entry.mood,
            what_learned: entry.whatLearned,
            what_struggled: entry.whatStruggled,
            next_steps: entry.nextSteps,
            entry_date: entry.entryDate,
          })
          .select()
          .single()

        if (error) throw error

        setDiaryEntries((prev) => [
          {
            id: data.id,
            content: data.content || '',
            mood: data.mood || 'neutral',
            whatLearned: data.what_learned || '',
            whatStruggled: data.what_struggled || '',
            nextSteps: data.next_steps || '',
            entryDate: data.entry_date || '',
            createdAt: data.created_at,
          },
          ...prev,
        ])

        // Callback for XP award
        if (onDiaryEntry) {
          await onDiaryEntry()
        }

        logger.info('Diary entry created', { entryId: data.id })
      } catch (error) {
        logger.error('Failed to create diary entry', { error })
      }
    },
    [userId, supabase, onDiaryEntry]
  )

  // Refresh sessions
  const refreshSessions = useCallback(async () => {
    if (!userId) return

    try {
      const { data: sessionsData } = await supabase
        .from('agora_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(50)

      if (sessionsData) {
        setSessions(
          sessionsData.map((s) => ({
            id: s.id,
            startedAt: s.started_at,
            endedAt: s.ended_at || undefined,
            durationMinutes: s.duration_minutes || 0,
            xpEarned: s.xp_earned || 0,
            agentsUsed:
              (s.conversations as { agent_name: string }[])?.map((c) => c.agent_name) || [],
            status: s.status || 'completed',
          }))
        )
      }
    } catch (error) {
      logger.error('Failed to refresh sessions', { error })
    }
  }, [userId, supabase])

  // Context value
  const contextValue = useMemo(
    (): UseAgoraSessionsReturn => ({
      currentSession,
      sessions,
      diaryEntries,
      totalSessions,
      totalTimeMinutes,
      isLoading,
      startSession,
      endSession,
      addDiaryEntry,
      refreshSessions,
    }),
    [
      currentSession,
      sessions,
      diaryEntries,
      totalSessions,
      totalTimeMinutes,
      isLoading,
      startSession,
      endSession,
      addDiaryEntry,
      refreshSessions,
    ]
  )

  return (
    <AgoraSessionsContext.Provider value={contextValue}>{children}</AgoraSessionsContext.Provider>
  )
}

// ============================================
// Hook
// ============================================

export function useAgoraSessions(): UseAgoraSessionsReturn {
  const context = useContext(AgoraSessionsContext)

  if (context === undefined) {
    throw new Error('useAgoraSessions must be used within an AgoraSessionsProvider')
  }

  return context
}
