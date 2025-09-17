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