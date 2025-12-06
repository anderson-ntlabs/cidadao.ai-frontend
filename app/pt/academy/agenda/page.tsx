/**
 * Academy Agenda Page
 *
 * Study calendar with FullCalendar integration:
 * - View study sessions, readings, and video deadlines
 * - Create and manage study events
 * - Optional Google Calendar export
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-06
 */

'use client'

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAcademyDemo } from '@/hooks/use-academy-demo'
import { useAcademyAuth } from '@/hooks/use-academy-auth'
import { AcademyHeader, AcademySidebar } from '@/components/academy'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { cn } from '@/lib/utils'
import {
  Calendar,
  Plus,
  Clock,
  BookOpen,
  Video,
  MessageSquare,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Trash2,
} from 'lucide-react'

// Dynamic import for FullCalendar (SSR not supported)
const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false })

// Storage keys
const STORAGE_EVENTS_KEY = 'academy_agenda_events'

// Event types
type EventType = 'study' | 'reading' | 'video' | 'chat' | 'deadline'

interface AcademyEvent {
  id: string
  title: string
  start: string
  end?: string
  type: EventType
  description?: string
  xpReward?: number
  completed?: boolean
  url?: string
}

// FullCalendar event types
interface CalendarEventInput {
  id: string
  title: string
  start: string
  end?: string
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: {
    type: EventType
    completed?: boolean
  }
}

// Event type configuration
const eventTypeConfig: Record<EventType, { color: string; icon: typeof Calendar; label: string }> =
  {
    study: { color: '#16a34a', icon: Clock, label: 'Sessao de Estudo' },
    reading: { color: '#2563eb', icon: BookOpen, label: 'Leitura' },
    video: { color: '#9333ea', icon: Video, label: 'Video' },
    chat: { color: '#ea580c', icon: MessageSquare, label: 'Chat com Mentor' },
    deadline: { color: '#dc2626', icon: GraduationCap, label: 'Prazo' },
  }

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">Carregando agenda...</p>
      </div>
    </div>
  )
}

// Inner component
function AcademyAgendaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemoMode = searchParams.get('demo') === 'true'

  // Auth hooks
  const realAuth = useAcademyAuth()
  const demoAuth = useAcademyDemo()

  // Determine which auth to use
  const isRealAuth = !isDemoMode && realAuth.isAuthenticated
  const isLoading = isDemoMode ? demoAuth.isLoading : realAuth.isLoading

  // Get user data
  const user = useMemo(() => {
    if (isDemoMode) {
      return demoAuth.user
    }
    if (realAuth.isAuthenticated && realAuth.user) {
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(realAuth.user.name)}&background=16a34a&color=fff`
      return {
        ...demoAuth.user,
        id: realAuth.user.id,
        name: realAuth.user.name,
        email: realAuth.user.email,
        avatar: realAuth.user.avatar || defaultAvatar,
        totalXp: realAuth.user.totalXp,
        currentLevel: realAuth.user.currentLevel,
        currentRank: realAuth.user.currentRank,
        currentStreak: realAuth.user.currentStreak,
        totalTimeMinutes: realAuth.user.totalTimeMinutes,
        totalSessions: realAuth.user.totalSessions,
      }
    }
    return demoAuth.user
  }, [isDemoMode, realAuth.isAuthenticated, realAuth.user, demoAuth.user])

  const { resetDemo } = demoAuth

  // State
  const [events, setEvents] = useState<AcademyEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<AcademyEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [calendarPlugins, setCalendarPlugins] = useState<any[]>([])

  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'study' as EventType,
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    xpReward: 10,
  })

  // Load plugins on client side
  useEffect(() => {
    const loadPlugins = async () => {
      const [dayGrid, timeGrid, interaction, list] = await Promise.all([
        import('@fullcalendar/daygrid'),
        import('@fullcalendar/timegrid'),
        import('@fullcalendar/interaction'),
        import('@fullcalendar/list'),
      ])
      setCalendarPlugins([dayGrid.default, timeGrid.default, interaction.default, list.default])
    }
    loadPlugins()
  }, [])

  // Load events from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_EVENTS_KEY)
      if (stored) {
        try {
          setEvents(JSON.parse(stored) as AcademyEvent[])
        } catch {
          setEvents([])
        }
      } else {
        // Add sample events for demo
        const sampleEvents: AcademyEvent[] = [
          {
            id: '1',
            title: 'Sessao de Estudo - Python',
            start: new Date().toISOString().split('T')[0] + 'T09:00:00',
            end: new Date().toISOString().split('T')[0] + 'T11:00:00',
            type: 'study',
            description: 'Estudar conceitos basicos de Python',
            xpReward: 20,
          },
          {
            id: '2',
            title: 'Leitura - Clean Code',
            start: new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T14:00:00',
            type: 'reading',
            description: 'Capitulo 3 - Funcoes',
            xpReward: 15,
          },
          {
            id: '3',
            title: 'Video - React Hooks',
            start: new Date(Date.now() + 172800000).toISOString().split('T')[0] + 'T10:00:00',
            type: 'video',
            description: 'Rocketseat - useEffect e useCallback',
            xpReward: 10,
            url: 'https://youtube.com',
          },
        ]
        setEvents(sampleEvents)
        localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(sampleEvents))
      }
    }
  }, [])

  // Save events to localStorage
  const saveEvents = useCallback((newEvents: AcademyEvent[]) => {
    setEvents(newEvents)
    localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(newEvents))
  }, [])

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isDemoMode && !realAuth.isLoading && !realAuth.isAuthenticated) {
      router.replace('/pt/academy/login')
    }
  }, [isDemoMode, realAuth.isLoading, realAuth.isAuthenticated, router])

  // Handle logout
  const handleLogout = async () => {
    if (isRealAuth) {
      await realAuth.logout()
    } else {
      resetDemo()
      window.location.href = '/pt/academy'
    }
  }

  // Handle event click
  const handleEventClick = (info: { event: { id: string } }) => {
    const event = events.find((e) => e.id === info.event.id)
    if (event) {
      setSelectedEvent(event)
      setShowEventModal(true)
    }
  }

  // Handle date click
  const handleDateClick = (info: { dateStr: string }) => {
    setSelectedDate(info.dateStr)
    setShowCreateModal(true)
  }

  // Create new event
  const handleCreateEvent = () => {
    if (!newEvent.title || !selectedDate) return

    const event: AcademyEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      start: `${selectedDate}T${newEvent.startTime}:00`,
      end: `${selectedDate}T${newEvent.endTime}:00`,
      type: newEvent.type,
      description: newEvent.description,
      xpReward: newEvent.xpReward,
    }

    saveEvents([...events, event])
    setShowCreateModal(false)
    setNewEvent({
      title: '',
      type: 'study',
      description: '',
      startTime: '09:00',
      endTime: '10:00',
      xpReward: 10,
    })
  }

  // Delete event
  const handleDeleteEvent = (eventId: string) => {
    saveEvents(events.filter((e) => e.id !== eventId))
    setShowEventModal(false)
    setSelectedEvent(null)
  }

  // Mark event as completed
  const handleCompleteEvent = (eventId: string) => {
    const updated = events.map((e) => (e.id === eventId ? { ...e, completed: true } : e))
    saveEvents(updated)
    setShowEventModal(false)
    setSelectedEvent(null)
    // Award XP (in real implementation, call API)
    const event = events.find((e) => e.id === eventId)
    if (event?.xpReward) {
      demoAuth.addXp(event.xpReward, 'agenda', `Completou: ${event.title}`)
    }
  }

  // Generate Google Calendar link
  const generateGoogleCalendarLink = (event: AcademyEvent) => {
    const startDate = new Date(event.start).toISOString().replace(/-|:|\.\d+/g, '')
    const endDate = event.end
      ? new Date(event.end).toISOString().replace(/-|:|\.\d+/g, '')
      : new Date(new Date(event.start).getTime() + 3600000).toISOString().replace(/-|:|\.\d+/g, '')

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startDate}/${endDate}`,
      details: event.description || '',
      sf: 'true',
    })

    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  // Convert events to FullCalendar format
  const calendarEvents: CalendarEventInput[] = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    backgroundColor: event.completed ? '#9ca3af' : eventTypeConfig[event.type].color,
    borderColor: event.completed ? '#9ca3af' : eventTypeConfig[event.type].color,
    textColor: '#ffffff',
    extendedProps: {
      type: event.type,
      completed: event.completed,
    },
  }))

  if (isLoading) {
    return <LoadingFallback />
  }

  if (!isDemoMode && !realAuth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AcademyHeader user={user} onLogout={handleLogout} isDemoMode={isDemoMode} />

      <div className="flex flex-1">
        <AcademySidebar user={user} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Agenda de Estudos
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Organize suas sessoes de estudo e acompanhe seu progresso
                </p>
              </div>

              <Button
                variant="primary"
                onClick={() => {
                  setSelectedDate(new Date().toISOString().split('T')[0])
                  setShowCreateModal(true)
                }}
              >
                <Plus className="w-4 h-4" />
                Novo Evento
              </Button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-6">
              {Object.entries(eventTypeConfig).map(([type, config]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{config.label}</span>
                </div>
              ))}
            </div>

            {/* Calendar */}
            <Card variant="elevated" padding="lg">
              <div className="min-h-[600px]">
                {calendarPlugins.length > 0 ? (
                  <FullCalendar
                    plugins={calendarPlugins}
                    initialView="dayGridMonth"
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,listWeek',
                    }}
                    locale="pt-br"
                    buttonText={{
                      today: 'Hoje',
                      month: 'Mes',
                      week: 'Semana',
                      list: 'Lista',
                    }}
                    events={calendarEvents}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={3}
                    weekends={true}
                    height="auto"
                    eventClassNames="cursor-pointer"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[600px]">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">Carregando calendario...</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Card variant="filled" padding="md" className="bg-green-50 dark:bg-green-900/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {events.filter((e) => e.type === 'study').length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sessoes de Estudo</p>
                </div>
              </Card>
              <Card variant="filled" padding="md" className="bg-blue-50 dark:bg-blue-900/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {events.filter((e) => e.type === 'reading').length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Leituras</p>
                </div>
              </Card>
              <Card variant="filled" padding="md" className="bg-purple-50 dark:bg-purple-900/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {events.filter((e) => e.type === 'video').length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Videos</p>
                </div>
              </Card>
              <Card variant="filled" padding="md" className="bg-yellow-50 dark:bg-yellow-900/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {events.filter((e) => e.completed).length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completados</p>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Event Details Modal */}
      <Modal
        open={showEventModal}
        onOpenChange={(open) => {
          setShowEventModal(open)
          if (!open) setSelectedEvent(null)
        }}
      >
        <ModalContent size="default">
          <ModalHeader>
            <ModalTitle>{selectedEvent?.title || 'Evento'}</ModalTitle>
          </ModalHeader>
          {selectedEvent && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: eventTypeConfig[selectedEvent.type].color }}
                >
                  {(() => {
                    const Icon = eventTypeConfig[selectedEvent.type].icon
                    return <Icon className="w-5 h-5 text-white" />
                  })()}
                </div>
                <div>
                  <Badge
                    variant="default"
                    style={{
                      borderColor: eventTypeConfig[selectedEvent.type].color,
                      color: eventTypeConfig[selectedEvent.type].color,
                      backgroundColor: 'transparent',
                      border: '1px solid',
                    }}
                  >
                    {eventTypeConfig[selectedEvent.type].label}
                  </Badge>
                  {selectedEvent.completed && (
                    <Badge variant="success" className="ml-2">
                      Completado
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  {new Date(selectedEvent.start).toLocaleString('pt-BR', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </p>
                {selectedEvent.description && (
                  <p className="text-gray-700 dark:text-gray-300">{selectedEvent.description}</p>
                )}
                {selectedEvent.xpReward && (
                  <p className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                    <Sparkles className="w-4 h-4" />+{selectedEvent.xpReward} XP ao completar
                  </p>
                )}
              </div>

              <ModalFooter className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {!selectedEvent.completed && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleCompleteEvent(selectedEvent.id)}
                  >
                    <Sparkles className="w-4 h-4" />
                    Marcar Completo
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(generateGoogleCalendarLink(selectedEvent), '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                  Google Calendar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>

      {/* Create Event Modal */}
      <Modal open={showCreateModal} onOpenChange={setShowCreateModal}>
        <ModalContent size="lg">
          <ModalHeader>
            <ModalTitle>Novo Evento</ModalTitle>
          </ModalHeader>
          <div className="space-y-4 mt-4 overflow-y-auto max-h-[60vh]">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Titulo
              </label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Estudar React Hooks"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(eventTypeConfig).map(([type, config]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewEvent({ ...newEvent, type: type as EventType })}
                    className={cn(
                      'p-2 rounded-xl border-2 transition-all text-sm',
                      newEvent.type === type
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    <config.icon className="w-4 h-4 mx-auto mb-1" style={{ color: config.color }} />
                    <span className="text-xs">{config.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Inicio
                </label>
                <input
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fim
                </label>
                <input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descricao (opcional)
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                rows={3}
                placeholder="Detalhes do evento..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                XP ao completar
              </label>
              <input
                type="number"
                value={newEvent.xpReward}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, xpReward: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                min="0"
                max="100"
              />
            </div>
          </div>

          <ModalFooter className="flex justify-end gap-2 pt-4 mt-4">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCreateEvent} disabled={!newEvent.title}>
              <Plus className="w-4 h-4" />
              Criar Evento
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

// Main export with Suspense boundary
export default function AcademyAgendaPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcademyAgendaContent />
    </Suspense>
  )
}
