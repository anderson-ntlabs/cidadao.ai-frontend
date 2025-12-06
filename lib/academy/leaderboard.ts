/**
 * Academy Leaderboard Service
 *
 * Fetches leaderboard data from Supabase with fallback to demo mode
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 */

import { createClient } from '@/lib/supabase/client'

export interface LeaderboardEntry {
  id: string
  user_id: string
  full_name: string
  avatar_url: string | null
  total_xp: number
  current_level: number
  current_rank: string
  current_streak: number
  total_time_minutes: number
  rank_position?: number
}

export type SortBy = 'xp' | 'time' | 'streak'

/**
 * Fetch leaderboard from Supabase
 */
export async function fetchLeaderboard(
  sortBy: SortBy = 'xp',
  limit: number = 50
): Promise<{ data: LeaderboardEntry[] | null; error: Error | null }> {
  try {
    const supabase = createClient()

    // Try to use the RPC function first
    const { data, error } = await supabase.rpc('get_academy_leaderboard', {
      sort_by: sortBy,
      limit_count: limit,
    })

    if (error) {
      // Fallback to direct query if RPC doesn't exist
      const sortColumn =
        sortBy === 'xp' ? 'total_xp' : sortBy === 'time' ? 'total_time_minutes' : 'current_streak'

      const { data: fallbackData, error: fallbackError } = await supabase
        .from('academy_profiles')
        .select(
          'id, user_id, full_name, avatar_url, total_xp, current_level, current_rank, current_streak, total_time_minutes'
        )
        .eq('is_active', true)
        .order(sortColumn, { ascending: false })
        .limit(limit)

      if (fallbackError) {
        return { data: null, error: new Error(fallbackError.message) }
      }

      // Add rank_position manually
      const withPosition = (fallbackData || []).map((entry, index) => ({
        ...entry,
        rank_position: index + 1,
      }))

      return { data: withPosition as LeaderboardEntry[], error: null }
    }

    return { data: data as LeaderboardEntry[], error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error'),
    }
  }
}

/**
 * Fetch current user's rank
 */
export async function fetchUserRank(
  userId: string,
  sortBy: SortBy = 'xp'
): Promise<{ rank: number | null; error: Error | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.rpc('get_user_rank', {
      p_user_id: userId,
      sort_by: sortBy,
    })

    if (error) {
      return { rank: null, error: new Error(error.message) }
    }

    return { rank: data as number, error: null }
  } catch (err) {
    return {
      rank: null,
      error: err instanceof Error ? err : new Error('Unknown error'),
    }
  }
}

/**
 * Mock leaderboard data for demo mode
 */
export const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: '1',
    user_id: 'user-1',
    full_name: 'Ana Carolina Silva',
    avatar_url: 'https://ui-avatars.com/api/?name=Ana+Silva&background=16a34a&color=fff',
    total_xp: 2450,
    current_level: 25,
    current_rank: 'mentor',
    current_streak: 15,
    total_time_minutes: 1200,
    rank_position: 1,
  },
  {
    id: '2',
    user_id: 'user-2',
    full_name: 'Pedro Henrique Costa',
    avatar_url: 'https://ui-avatars.com/api/?name=Pedro+Costa&background=2563eb&color=fff',
    total_xp: 1890,
    current_level: 19,
    current_rank: 'contribuidor',
    current_streak: 12,
    total_time_minutes: 980,
    rank_position: 2,
  },
  {
    id: '3',
    user_id: 'user-3',
    full_name: 'Mariana Oliveira',
    avatar_url: 'https://ui-avatars.com/api/?name=Mariana+Oliveira&background=7c3aed&color=fff',
    total_xp: 1560,
    current_level: 16,
    current_rank: 'contribuidor',
    current_streak: 8,
    total_time_minutes: 750,
    rank_position: 3,
  },
  {
    id: '4',
    user_id: 'user-4',
    full_name: 'Lucas Santos',
    avatar_url: 'https://ui-avatars.com/api/?name=Lucas+Santos&background=dc2626&color=fff',
    total_xp: 1120,
    current_level: 12,
    current_rank: 'contribuidor',
    current_streak: 5,
    total_time_minutes: 620,
    rank_position: 4,
  },
  {
    id: '5',
    user_id: 'user-5',
    full_name: 'Julia Ferreira',
    avatar_url: 'https://ui-avatars.com/api/?name=Julia+Ferreira&background=ea580c&color=fff',
    total_xp: 890,
    current_level: 9,
    current_rank: 'contribuidor',
    current_streak: 3,
    total_time_minutes: 480,
    rank_position: 5,
  },
  {
    id: '6',
    user_id: 'user-6',
    full_name: 'Gabriel Rodrigues',
    avatar_url: 'https://ui-avatars.com/api/?name=Gabriel+Rodrigues&background=0891b2&color=fff',
    total_xp: 650,
    current_level: 7,
    current_rank: 'contribuidor',
    current_streak: 4,
    total_time_minutes: 320,
    rank_position: 6,
  },
  {
    id: '7',
    user_id: 'user-7',
    full_name: 'Beatriz Lima',
    avatar_url: 'https://ui-avatars.com/api/?name=Beatriz+Lima&background=db2777&color=fff',
    total_xp: 420,
    current_level: 5,
    current_rank: 'aprendiz',
    current_streak: 2,
    total_time_minutes: 210,
    rank_position: 7,
  },
  {
    id: '8',
    user_id: 'user-8',
    full_name: 'Rafael Almeida',
    avatar_url: 'https://ui-avatars.com/api/?name=Rafael+Almeida&background=4f46e5&color=fff',
    total_xp: 280,
    current_level: 3,
    current_rank: 'aprendiz',
    current_streak: 1,
    total_time_minutes: 140,
    rank_position: 8,
  },
]
