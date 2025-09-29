export interface TourEvent {
  event: string;
  data?: Record<string, any>;
  timestamp: number;
  elapsed_time?: number;
}

export interface TourSession {
  id: string;
  startTime: number;
  endTime?: number;
  mode: 'quick' | 'complete';
  completed: boolean;
  stepsViewed: number[];
  interactions: string[];
  exitPoint?: string;
  timeSpent?: number;
}

export class TourAnalytics {
  private startTime: number = 0;
  private events: TourEvent[] = [];
  private currentSession: TourSession | null = null;

  startSession(mode: 'quick' | 'complete'): string {
    const sessionId = `tour-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = Date.now();
    
    this.currentSession = {
      id: sessionId,
      startTime: this.startTime,
      mode,
      completed: false,
      stepsViewed: [],
      interactions: []
    };

    return sessionId;
  }

  track(event: string, data?: Record<string, any>) {
    const tourEvent: TourEvent = {
      event,
      data,
      timestamp: Date.now(),
      elapsed_time: this.startTime ? Date.now() - this.startTime : undefined
    };

    this.events.push(tourEvent);

    // Send to analytics service (Google Analytics, etc.)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', `tour_${event}`, {
        ...data,
        elapsed_time: tourEvent.elapsed_time
      });
    }

    // Update session data
    if (this.currentSession) {
      if (event === 'step_viewed' && data?.step !== undefined) {
        this.currentSession.stepsViewed.push(data.step);
      }
      if (event === 'interaction' && data?.type) {
        this.currentSession.interactions.push(data.type);
      }
      if (event === 'tour_completed') {
        this.completeSession(true);
      }
      if (event === 'tour_exited' && data?.exitPoint) {
        this.completeSession(false, data.exitPoint);
      }
    }
  }

  completeSession(completed: boolean, exitPoint?: string) {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.completed = completed;
    this.currentSession.exitPoint = exitPoint;
    this.currentSession.timeSpent = this.currentSession.endTime - this.currentSession.startTime;

    // Save session to localStorage or send to backend
    this.saveSession(this.currentSession);
  }

  private saveSession(session: TourSession) {
    const sessions = this.getSavedSessions();
    sessions.push(session);
    
    // Keep only last 10 sessions
    if (sessions.length > 10) {
      sessions.shift();
    }

    localStorage.setItem('tour-sessions', JSON.stringify(sessions));
  }

  getSavedSessions(): TourSession[] {
    try {
      const saved = localStorage.getItem('tour-sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  getMetrics() {
    const sessions = this.getSavedSessions();
    
    return {
      completion_rate: this.calculateCompletionRate(sessions),
      average_time_spent: this.calculateAverageTime(sessions),
      most_common_exit_point: this.findCommonExitPoint(sessions),
      total_sessions: sessions.length,
      quick_mode_preference: this.calculateModePreference(sessions, 'quick'),
      complete_mode_preference: this.calculateModePreference(sessions, 'complete')
    };
  }

  private calculateCompletionRate(sessions: TourSession[]): number {
    if (sessions.length === 0) return 0;
    const completed = sessions.filter(s => s.completed).length;
    return (completed / sessions.length) * 100;
  }

  private calculateAverageTime(sessions: TourSession[]): number {
    if (sessions.length === 0) return 0;
    const totalTime = sessions.reduce((acc, s) => acc + (s.timeSpent || 0), 0);
    return Math.round(totalTime / sessions.length / 1000); // in seconds
  }

  private findCommonExitPoint(sessions: TourSession[]): string | null {
    const exitPoints = sessions
      .filter(s => !s.completed && s.exitPoint)
      .map(s => s.exitPoint!);
    
    if (exitPoints.length === 0) return null;

    const counts: Record<string, number> = {};
    exitPoints.forEach(point => {
      counts[point] = (counts[point] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || null;
  }

  private calculateModePreference(sessions: TourSession[], mode: 'quick' | 'complete'): number {
    if (sessions.length === 0) return 0;
    const modeCount = sessions.filter(s => s.mode === mode).length;
    return (modeCount / sessions.length) * 100;
  }

  // Check if metrics indicate need for tour improvement
  needsImprovement(): boolean {
    const metrics = this.getMetrics();
    return (
      metrics.completion_rate < 60 ||
      metrics.average_time_spent > 300 || // More than 5 minutes
      metrics.total_sessions > 5 && metrics.completion_rate < 80
    );
  }
}