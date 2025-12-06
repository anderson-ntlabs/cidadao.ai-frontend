export type InternTrack = 'ui-ux' | 'frontend' | 'backend' | 'data' | 'design' | 'devops' | 'mobile'

export interface Agent {
  id: string
  name: string
  role: {
    pt: string
    en: string
  }
  description: {
    pt: string
    en: string
  }
  image: string
  wikipedia?: string
  /** Tracks where this agent is available (undefined = available to all) */
  tracks?: InternTrack[]
}

export interface ProjectLink {
  title: {
    pt: string
    en: string
  }
  url: string
  description: {
    pt: string
    en: string
  }
  category: 'repository' | 'application' | 'documentation' | 'status' | 'api'
}
