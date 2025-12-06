'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AcademyDemo')

/**
 * Academy Demo Mode Hook
 *
 * MVP mode - no real auth, all data in localStorage
 * Allows anyone to explore the Academy without authentication
 */

const STORAGE_KEY = 'academy_demo_user'
const STORAGE_XP_KEY = 'academy_demo_xp_transactions'
const STORAGE_DIARY_KEY = 'academy_demo_diary'
const STORAGE_SESSIONS_KEY = 'academy_demo_sessions'
const STORAGE_LGPD_KEY = 'academy_demo_lgpd_consent'
const STORAGE_CONTRACT_KEY = 'academy_demo_internship_contract'
const STORAGE_BADGES_KEY = 'academy_demo_badges'
const STORAGE_ONBOARDING_KEY = 'academy_demo_onboarding'

export type AcademyTrack = 'backend' | 'frontend' | 'ia' | 'devops'

export interface AcademyDemoUser {
  id: string
  name: string
  email: string
  avatar: string
  totalXp: number
  currentLevel: number
  currentRank: string
  tracks: AcademyTrack[] // User can have multiple tracks
  currentStreak: number
  longestStreak: number
  totalSessions: number
  totalTimeMinutes: number
  hasAcceptedLgpd: boolean
  hasAcceptedInternshipContract: boolean
  hasCompletedOnboarding: boolean
  lastIpAddress?: string
  enrolledAt: string
}

// GitHub contribution tracking
export interface GitHubContribution {
  username: string
  hasForked: boolean
  forkUrl?: string
  commitCount: number
  lastCommitDate?: string
  lastChecked: string
}

// Onboarding progress
export interface OnboardingData {
  currentStep: number
  completedSteps: number[]
  selectedTracks: AcademyTrack[] // User can select multiple tracks
  github: GitHubContribution | null
  completedAt?: string
}

export interface XpTransaction {
  id: string
  amount: number
  balanceAfter: number
  sourceType: string
  description: string
  createdAt: string
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

export interface StudySession {
  id: string
  startedAt: string
  endedAt?: string
  durationMinutes: number
  xpEarned: number
  agentsUsed: string[]
}

// LGPD consent record
export interface LgpdConsent {
  acceptedAt: string
  ipAddress?: string
  userAgent: string
  version: string
}

// Terms of Use record (renamed from internship contract for democratization)
export interface InternshipContract {
  contractId: string
  acceptedAt: string
  ipAddress?: string
  userAgent: string
  version: string
  pdfGenerated: boolean
  consents: {
    telemetry: boolean
    dataCollection: boolean
    reportGeneration: boolean
    lgpdConsent: boolean
    termsAccept: boolean
  }
}

// Academy badge for demo mode
export interface AcademyBadge {
  id: string
  type: 'japaguri' | 'pioneiro' | 'dedicado' | 'explorador'
  name: string
  description: string
  emoji: string
  earnedAt: string
  criteria: string
}

// Default demo user - starts without terms acceptance
const DEFAULT_DEMO_USER: AcademyDemoUser = {
  id: 'demo-user-001',
  name: 'Estudante Demo',
  email: 'demo@cidadao.ai',
  avatar: 'https://ui-avatars.com/api/?name=Estudante+Demo&background=16a34a&color=fff&size=128',
  totalXp: 0,
  currentLevel: 1,
  currentRank: 'novato',
  tracks: [], // User selects tracks during onboarding
  currentStreak: 0,
  longestStreak: 0,
  totalSessions: 0,
  totalTimeMinutes: 0,
  hasAcceptedLgpd: false,
  hasAcceptedInternshipContract: false, // Must accept terms on first access
  hasCompletedOnboarding: false, // Must complete onboarding after terms acceptance
  enrolledAt: new Date().toISOString(),
}

// Calculate rank from XP
function calculateRank(xp: number): string {
  if (xp >= 5000) return 'arquiteto'
  if (xp >= 2000) return 'mentor'
  if (xp >= 500) return 'contribuidor'
  if (xp >= 100) return 'aprendiz'
  return 'novato'
}

// Calculate level from XP
function calculateLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / 100) + 1)
}

// GitHub repos by track for fork verification
export const TRACK_REPOS: Record<string, { owner: string; repo: string }> = {
  backend: { owner: 'anderson-ufrj', repo: 'cidadao.ai-backend' },
  frontend: { owner: 'anderson-ufrj', repo: 'cidadao.ai-frontend' },
  ia: { owner: 'anderson-ufrj', repo: 'cidadao.ai-ml' },
  devops: { owner: 'anderson-ufrj', repo: 'cidadao.ai-infra' },
}

interface AcademyDemoContextType {
  user: AcademyDemoUser
  isAuthenticated: boolean
  isLoading: boolean
  xpTransactions: XpTransaction[]
  diaryEntries: DiaryEntry[]
  sessions: StudySession[]
  currentSession: StudySession | null
  lgpdConsent: LgpdConsent | null
  internshipContract: InternshipContract | null
  badges: AcademyBadge[]
  onboarding: OnboardingData | null

  // Actions
  updateProfile: (updates: Partial<AcademyDemoUser>) => void
  addXp: (amount: number, sourceType: string, description: string) => void
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => void
  startSession: () => void
  endSession: (xpEarned?: number, agentsUsed?: string[]) => void
  acceptLgpdConsent: (ipAddress?: string, userAgent?: string) => Promise<void>
  acceptInternshipContract: (
    ipAddress?: string,
    userAgent?: string,
    contractId?: string
  ) => Promise<void>
  checkAndAwardBadges: () => void
  resetDemo: () => void

  // Onboarding actions
  initOnboarding: () => void
  updateOnboarding: (updates: Partial<OnboardingData>) => void
  toggleTrack: (track: AcademyTrack) => void // Toggle track selection (add/remove)
  confirmTracks: () => void // Confirm track selection and move to next step
  setGitHubUsername: (username: string) => Promise<void>
  verifyGitHubFork: () => Promise<{ success: boolean; message: string }>
  completeOnboarding: () => void
}

const AcademyDemoContext = createContext<AcademyDemoContextType | undefined>(undefined)

export function AcademyDemoProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AcademyDemoUser>(DEFAULT_DEMO_USER)
  const [isLoading, setIsLoading] = useState(true)
  const [xpTransactions, setXpTransactions] = useState<XpTransaction[]>([])
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null)
  const [lgpdConsent, setLgpdConsent] = useState<LgpdConsent | null>(null)
  const [internshipContract, setInternshipContract] = useState<InternshipContract | null>(null)
  const [badges, setBadges] = useState<AcademyBadge[]>([])
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY)
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }

      const savedXp = localStorage.getItem(STORAGE_XP_KEY)
      if (savedXp) {
        setXpTransactions(JSON.parse(savedXp))
      }

      const savedDiary = localStorage.getItem(STORAGE_DIARY_KEY)
      if (savedDiary) {
        setDiaryEntries(JSON.parse(savedDiary))
      }

      const savedSessions = localStorage.getItem(STORAGE_SESSIONS_KEY)
      if (savedSessions) {
        setSessions(JSON.parse(savedSessions))
      }

      const savedLgpd = localStorage.getItem(STORAGE_LGPD_KEY)
      if (savedLgpd) {
        setLgpdConsent(JSON.parse(savedLgpd))
      }

      const savedContract = localStorage.getItem(STORAGE_CONTRACT_KEY)
      if (savedContract) {
        setInternshipContract(JSON.parse(savedContract))
      }

      const savedBadges = localStorage.getItem(STORAGE_BADGES_KEY)
      if (savedBadges) {
        setBadges(JSON.parse(savedBadges))
      }

      const savedOnboarding = localStorage.getItem(STORAGE_ONBOARDING_KEY)
      if (savedOnboarding) {
        setOnboarding(JSON.parse(savedOnboarding))
      }

      logger.info('Demo mode loaded from localStorage')
    } catch (error) {
      logger.error('Failed to load demo data', { error })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save user to localStorage when changed
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    }
  }, [user, isLoading])

  // Save XP transactions
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_XP_KEY, JSON.stringify(xpTransactions))
    }
  }, [xpTransactions, isLoading])

  // Save diary entries
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_DIARY_KEY, JSON.stringify(diaryEntries))
    }
  }, [diaryEntries, isLoading])

  // Save sessions
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions))
    }
  }, [sessions, isLoading])

  // Save badges
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_BADGES_KEY, JSON.stringify(badges))
    }
  }, [badges, isLoading])

  // Save onboarding
  useEffect(() => {
    if (!isLoading && onboarding) {
      localStorage.setItem(STORAGE_ONBOARDING_KEY, JSON.stringify(onboarding))
    }
  }, [onboarding, isLoading])

  const updateProfile = useCallback((updates: Partial<AcademyDemoUser>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates }
      // Recalculate rank and level if XP changed
      if (updates.totalXp !== undefined) {
        updated.currentRank = calculateRank(updated.totalXp)
        updated.currentLevel = calculateLevel(updated.totalXp)
      }
      return updated
    })
    logger.debug('Profile updated', { updates })
  }, [])

  const addXp = useCallback(
    (amount: number, sourceType: string, description: string) => {
      const newBalance = user.totalXp + amount
      const transaction: XpTransaction = {
        id: `xp_${Date.now()}`,
        amount,
        balanceAfter: newBalance,
        sourceType,
        description,
        createdAt: new Date().toISOString(),
      }

      setXpTransactions((prev) => [transaction, ...prev])
      updateProfile({ totalXp: newBalance })

      logger.info('XP added', { amount, sourceType, newBalance })
    },
    [user.totalXp, updateProfile]
  )

  const addDiaryEntry = useCallback(
    (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => {
      const newEntry: DiaryEntry = {
        ...entry,
        id: `diary_${Date.now()}`,
        createdAt: new Date().toISOString(),
      }

      setDiaryEntries((prev) => [newEntry, ...prev])

      // Award XP for diary entry
      addXp(10, 'diary', 'Entrada no diário de aprendizado')

      logger.info('Diary entry added', { entryId: newEntry.id })
    },
    [addXp]
  )

  const startSession = useCallback(() => {
    const session: StudySession = {
      id: `session_${Date.now()}`,
      startedAt: new Date().toISOString(),
      durationMinutes: 0,
      xpEarned: 0,
      agentsUsed: [],
    }

    setCurrentSession(session)
    logger.info('Session started', { sessionId: session.id })
  }, [])

  const endSession = useCallback(
    (xpEarned = 0, agentsUsed: string[] = []) => {
      if (!currentSession) return

      const endedAt = new Date().toISOString()
      const durationMs = new Date(endedAt).getTime() - new Date(currentSession.startedAt).getTime()
      const durationMinutes = Math.round(durationMs / 60000)

      const completedSession: StudySession = {
        ...currentSession,
        endedAt,
        durationMinutes,
        xpEarned,
        agentsUsed,
      }

      setSessions((prev) => [completedSession, ...prev])
      setCurrentSession(null)

      // Update user stats
      updateProfile({
        totalSessions: user.totalSessions + 1,
        totalTimeMinutes: user.totalTimeMinutes + durationMinutes,
      })

      logger.info('Session ended', { sessionId: completedSession.id, durationMinutes })
    },
    [currentSession, user.totalSessions, user.totalTimeMinutes, updateProfile]
  )

  const acceptLgpdConsent = useCallback(
    async (ipAddress?: string, userAgent?: string) => {
      const consent: LgpdConsent = {
        acceptedAt: new Date().toISOString(),
        ipAddress,
        userAgent: userAgent || navigator.userAgent,
        version: 'v1.0-demo',
      }

      setLgpdConsent(consent)
      localStorage.setItem(STORAGE_LGPD_KEY, JSON.stringify(consent))

      // Update user to mark LGPD as accepted
      updateProfile({ hasAcceptedLgpd: true })

      // Award XP for accepting (first-time bonus)
      addXp(50, 'lgpd_consent', 'Bonus de boas-vindas - Aceite do termo LGPD')

      logger.info('LGPD consent accepted', { ipAddress })
    },
    [updateProfile, addXp]
  )

  const acceptInternshipContract = useCallback(
    async (ipAddress?: string, userAgent?: string, contractId?: string) => {
      const contract: InternshipContract = {
        contractId: contractId || `ACAD-${Date.now().toString(36).toUpperCase()}`,
        acceptedAt: new Date().toISOString(),
        ipAddress,
        userAgent: userAgent || navigator.userAgent,
        version: 'v2.0-2025',
        pdfGenerated: true,
        consents: {
          telemetry: true,
          dataCollection: true,
          reportGeneration: true,
          lgpdConsent: true,
          termsAccept: true,
        },
      }

      setInternshipContract(contract)
      localStorage.setItem(STORAGE_CONTRACT_KEY, JSON.stringify(contract))

      // Update user to mark terms as accepted and save IP
      updateProfile({
        hasAcceptedLgpd: true,
        hasAcceptedInternshipContract: true,
        lastIpAddress: ipAddress,
      })

      // Award XP for accepting terms (welcome bonus)
      addXp(100, 'terms_accept', 'Bônus de boas-vindas - Aceite dos Termos de Uso')

      logger.info('Terms of Use accepted', { contractId: contract.contractId, ipAddress })
    },
    [updateProfile, addXp]
  )

  // Check and award badges based on user activity
  const checkAndAwardBadges = useCallback(() => {
    const newBadges: AcademyBadge[] = [...badges]
    let badgesAwarded = false

    // Japaguri badge - for assiduous students
    // Criteria: 3+ streak days OR 5+ sessions OR 3+ diary entries
    const hasJapaguri = badges.some((b) => b.type === 'japaguri')
    const qualifiesForJapaguri =
      user.currentStreak >= 3 || sessions.length >= 5 || diaryEntries.length >= 3

    if (!hasJapaguri && qualifiesForJapaguri) {
      const japaguriBadge: AcademyBadge = {
        id: `badge_japaguri_${Date.now()}`,
        type: 'japaguri',
        name: 'Japaguri',
        description:
          'Estudante assíduo que mistura dedicação com consistência, como o prato coreano que combina dois sabores!',
        emoji: '🍜',
        earnedAt: new Date().toISOString(),
        criteria:
          user.currentStreak >= 3
            ? `${user.currentStreak} dias seguidos de estudo`
            : sessions.length >= 5
              ? `${sessions.length} sessões de estudo`
              : `${diaryEntries.length} entradas no diário`,
      }
      newBadges.push(japaguriBadge)
      badgesAwarded = true

      // Award bonus XP for earning badge
      addXp(50, 'badge', 'Badge Japaguri conquistado!')

      logger.info('Japaguri badge awarded', { criteria: japaguriBadge.criteria })
    }

    // Pioneiro badge - for early adopters (first terms acceptance)
    const hasPioneiro = badges.some((b) => b.type === 'pioneiro')
    if (!hasPioneiro && user.hasAcceptedInternshipContract) {
      const pioneiroBadge: AcademyBadge = {
        id: `badge_pioneiro_${Date.now()}`,
        type: 'pioneiro',
        name: 'Pioneiro',
        description: 'Um dos primeiros a embarcar na jornada da Academy!',
        emoji: '🚀',
        earnedAt: new Date().toISOString(),
        criteria: 'Aceitou os Termos de Uso',
      }
      newBadges.push(pioneiroBadge)
      badgesAwarded = true
      addXp(25, 'badge', 'Badge Pioneiro conquistado!')
      logger.info('Pioneiro badge awarded')
    }

    // Explorador badge - for users who tried different agents
    const hasExplorador = badges.some((b) => b.type === 'explorador')
    const uniqueAgentsUsed = new Set(sessions.flatMap((s) => s.agentsUsed || [])).size
    if (!hasExplorador && uniqueAgentsUsed >= 3) {
      const exploradorBadge: AcademyBadge = {
        id: `badge_explorador_${Date.now()}`,
        type: 'explorador',
        name: 'Explorador',
        description: 'Curiosidade é a chave! Conversou com vários agentes diferentes.',
        emoji: '🧭',
        earnedAt: new Date().toISOString(),
        criteria: `Interagiu com ${uniqueAgentsUsed} agentes diferentes`,
      }
      newBadges.push(exploradorBadge)
      badgesAwarded = true
      addXp(30, 'badge', 'Badge Explorador conquistado!')
      logger.info('Explorador badge awarded')
    }

    // Dedicado badge - for dedicated students with long streaks or many sessions
    // Criteria: 7+ streak days OR 10+ sessions
    const hasDedicado = badges.some((b) => b.type === 'dedicado')
    const qualifiesForDedicado = user.currentStreak >= 7 || sessions.length >= 10

    if (!hasDedicado && qualifiesForDedicado) {
      const dedicadoBadge: AcademyBadge = {
        id: `badge_dedicado_${Date.now()}`,
        type: 'dedicado',
        name: 'Dedicado',
        description: 'Comprometimento exemplar! Sua dedicação aos estudos é inspiradora.',
        emoji: '⭐',
        earnedAt: new Date().toISOString(),
        criteria:
          user.currentStreak >= 7
            ? `${user.currentStreak} dias seguidos de estudo`
            : `${sessions.length} sessões de estudo completadas`,
      }
      newBadges.push(dedicadoBadge)
      badgesAwarded = true
      addXp(75, 'badge', 'Badge Dedicado conquistado!')
      logger.info('Dedicado badge awarded', { criteria: dedicadoBadge.criteria })
    }

    if (badgesAwarded) {
      setBadges(newBadges)
    }
  }, [badges, user, sessions, diaryEntries, addXp])

  // Initialize onboarding for new users (after contract acceptance)
  const initOnboarding = useCallback(() => {
    const initialOnboarding: OnboardingData = {
      currentStep: 1,
      completedSteps: [],
      selectedTracks: [],
      github: null,
    }
    setOnboarding(initialOnboarding)
    logger.info('Onboarding initialized')
  }, [])

  // Update onboarding progress
  const updateOnboarding = useCallback((updates: Partial<OnboardingData>) => {
    setOnboarding((prev) => {
      if (!prev) return null
      return { ...prev, ...updates }
    })
  }, [])

  // Toggle track selection (add/remove from selectedTracks)
  const toggleTrack = useCallback((track: AcademyTrack) => {
    setOnboarding((prev) => {
      if (!prev) return null
      const isSelected = prev.selectedTracks.includes(track)
      const newTracks = isSelected
        ? prev.selectedTracks.filter((t) => t !== track)
        : [...prev.selectedTracks, track]
      return {
        ...prev,
        selectedTracks: newTracks,
      }
    })
    logger.info('Track toggled', { track })
  }, [])

  // Confirm track selection and move to next step
  const confirmTracks = useCallback(() => {
    if (!onboarding?.selectedTracks.length) {
      logger.warn('No tracks selected')
      return
    }
    setOnboarding((prev) => {
      if (!prev) return null
      const completedSteps = prev.completedSteps.includes(2)
        ? prev.completedSteps
        : [...prev.completedSteps, 2]
      return {
        ...prev,
        currentStep: 3,
        completedSteps,
      }
    })
    updateProfile({ tracks: onboarding.selectedTracks })
    const trackNames = onboarding.selectedTracks.map((t) => t.toUpperCase()).join(', ')
    addXp(
      25 * onboarding.selectedTracks.length,
      'onboarding',
      `Trilhas selecionadas: ${trackNames}`
    )
    logger.info('Tracks confirmed', { tracks: onboarding.selectedTracks })
  }, [onboarding, updateProfile, addXp])

  // Set GitHub username and check for fork
  const setGitHubUsername = useCallback(async (username: string) => {
    const github: GitHubContribution = {
      username,
      hasForked: false,
      commitCount: 0,
      lastChecked: new Date().toISOString(),
    }
    setOnboarding((prev) => {
      if (!prev) return null
      const completedSteps = prev.completedSteps.includes(3)
        ? prev.completedSteps
        : [...prev.completedSteps, 3]
      return {
        ...prev,
        github,
        currentStep: 4,
        completedSteps,
      }
    })
    logger.info('GitHub username set', { username })
  }, [])

  // Verify GitHub fork - MOCKED for demo mode
  // TODO: Re-enable real verification when organization is created
  const verifyGitHubFork = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!onboarding?.github?.username || !onboarding?.selectedTracks.length) {
      return { success: false, message: 'Usuário GitHub ou trilhas não definidos' }
    }

    const { username } = onboarding.github
    // Use first track for fork verification (primary track)
    const primaryTrack = onboarding.selectedTracks[0]
    const trackRepo = TRACK_REPOS[primaryTrack]

    // MOCK: Simulate successful fork verification
    // This allows users to complete onboarding without requiring actual fork
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay

    // Update GitHub contribution data with mocked values
    setOnboarding((prev) => {
      if (!prev) return null
      const completedSteps = prev.completedSteps.includes(4)
        ? prev.completedSteps
        : [...prev.completedSteps, 4]
      return {
        ...prev,
        github: {
          username,
          hasForked: true,
          forkUrl: `https://github.com/${username}/${trackRepo.repo}`,
          commitCount: 0,
          lastCommitDate: undefined,
          lastChecked: new Date().toISOString(),
        },
        currentStep: 5,
        completedSteps,
      }
    })

    addXp(50, 'onboarding', 'Fork do repositório verificado!')
    logger.info('GitHub fork verified (MOCKED)', { username, repo: trackRepo.repo })

    return { success: true, message: 'Fork verificado com sucesso!' }
  }, [onboarding, addXp])

  // Complete onboarding
  const completeOnboarding = useCallback(() => {
    setOnboarding((prev) => {
      if (!prev) return null
      const completedSteps = prev.completedSteps.includes(5)
        ? prev.completedSteps
        : [...prev.completedSteps, 5]
      return {
        ...prev,
        currentStep: 5,
        completedSteps,
        completedAt: new Date().toISOString(),
      }
    })
    updateProfile({ hasCompletedOnboarding: true })
    addXp(100, 'onboarding', 'Onboarding concluído! Bem-vindo à Academy!')
    logger.info('Onboarding completed')
  }, [updateProfile, addXp])

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_XP_KEY)
    localStorage.removeItem(STORAGE_DIARY_KEY)
    localStorage.removeItem(STORAGE_SESSIONS_KEY)
    localStorage.removeItem(STORAGE_LGPD_KEY)
    localStorage.removeItem(STORAGE_CONTRACT_KEY)
    localStorage.removeItem(STORAGE_BADGES_KEY)
    localStorage.removeItem(STORAGE_ONBOARDING_KEY)

    setUser({ ...DEFAULT_DEMO_USER, hasCompletedOnboarding: false })
    setXpTransactions([])
    setDiaryEntries([])
    setSessions([])
    setCurrentSession(null)
    setLgpdConsent(null)
    setInternshipContract(null)
    setBadges([])
    setOnboarding(null)

    logger.info('Demo reset to default state')
  }, [])

  return (
    <AcademyDemoContext.Provider
      value={{
        user,
        isAuthenticated: true, // Always authenticated in demo mode
        isLoading,
        xpTransactions,
        diaryEntries,
        sessions,
        currentSession,
        lgpdConsent,
        internshipContract,
        badges,
        onboarding,
        updateProfile,
        addXp,
        addDiaryEntry,
        startSession,
        endSession,
        acceptLgpdConsent,
        acceptInternshipContract,
        checkAndAwardBadges,
        resetDemo,
        initOnboarding,
        updateOnboarding,
        toggleTrack,
        confirmTracks,
        setGitHubUsername,
        verifyGitHubFork,
        completeOnboarding,
      }}
    >
      {children}
    </AcademyDemoContext.Provider>
  )
}

export function useAcademyDemo() {
  const context = useContext(AcademyDemoContext)
  if (context === undefined) {
    throw new Error('useAcademyDemo must be used within an AcademyDemoProvider')
  }
  return context
}

// Re-export for compatibility
export { DEFAULT_DEMO_USER }
