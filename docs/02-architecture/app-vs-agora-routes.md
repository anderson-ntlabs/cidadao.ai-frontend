# Routing Architecture: /app vs /agora

This document explains the architectural difference between the two main authenticated areas of Cidadao.AI.

## Overview

The application has two distinct authenticated areas serving different purposes:

| Feature           | `/pt/app/*`                             | `/pt/agora/*`                    |
| ----------------- | --------------------------------------- | -------------------------------- |
| **Purpose**       | Government transparency investigations  | Learning & gamification platform |
| **Target User**   | Citizens, journalists, researchers      | Interns, students, trainees      |
| **Auth Provider** | Supabase OAuth                          | Supabase OAuth + Demo mode       |
| **Main Features** | Chat, investigations, anomaly detection | Courses, XP system, badges       |

## /pt/app/\* - Cidadao.AI Core

The main transparency platform for citizens to investigate government spending.

### Routes

```
/pt/app/
├── page.tsx              # Dashboard home
├── layout.tsx            # App layout (no header)
├── chat/                 # AI chat interface
│   ├── page.tsx          # Multi-agent chat
│   └── layout.tsx        # Chat-specific layout
├── dashboard/            # Statistics & overview
├── investigacoes/        # Investigation management
│   ├── page.tsx          # List investigations
│   ├── nova/             # Create new investigation
│   └── [id]/             # View specific investigation
├── mapa/                 # Geospatial visualization
├── perfil/               # User profile
├── configuracoes/        # Settings
├── notificacoes/         # Notifications
├── atividades/           # Activity log
└── ajuda/                # Help & support
```

### Features

- **AI Chat**: Multi-agent system with 17 Brazilian-themed agents
- **Investigations**: Track and analyze government contracts
- **Dashboard**: Anomaly detection statistics, trends
- **Map**: Geographic visualization of spending patterns
- **Export**: PDF/CSV export of findings

### Authentication

- Requires Supabase OAuth login
- No demo mode available
- Session managed via middleware

## /pt/agora/\* - Agora Academy

Gamified learning platform for civic education and transparency training.

### Routes

```
/pt/agora/
├── page.tsx              # Academy dashboard
├── layout.tsx            # Agora layout with providers
├── login/                # Agora-specific login
├── onboarding/           # New user onboarding flow
├── chat/                 # Learning-focused chat
├── trilhas/              # Learning tracks
│   ├── page.tsx          # Track listing
│   └── [trackId]/
│       └── [moduleId]/   # Specific module content
├── ranking/              # Leaderboards
├── perfil/               # User profile with XP/badges
├── diario/               # Learning diary/journal
├── leituras/             # Reading materials
├── videos/               # Video content
├── atividades/           # Learning activities
├── configuracoes/        # Settings
├── contract/             # Internship contract
└── ajuda/                # Help & support
```

### Features

- **XP System**: Earn experience points for activities
- **Badges**: Achievement system with 20+ badges
- **Learning Tracks**: Structured courses on transparency
- **Leaderboards**: Competition between users
- **Learning Diary**: Personal notes and reflections
- **Demo Mode**: Try without OAuth (localStorage-based)

### Authentication

- Supports Supabase OAuth (real mode)
- Demo mode available via `?demo=true` URL parameter
- Unified provider pattern: `AgoraAuthProvider` + `AgoraDemoProvider`

```tsx
// Layout provider hierarchy
<AgoraAuthProvider>
  {' '}
  {/* Real auth */}
  <AgoraDemoProvider>
    {' '}
    {/* Demo fallback */}
    <UnifiedAgoraProvider>
      {' '}
      {/* Auto-selects mode */}
      {children}
    </UnifiedAgoraProvider>
  </AgoraDemoProvider>
</AgoraAuthProvider>
```

## Why Two Separate Areas?

### 1. Different User Journeys

- **App users**: Want to investigate immediately, need production-ready tools
- **Agora users**: Learning the platform, need guided experience

### 2. Different Data Models

- **App**: Real investigations, government data, anomaly reports
- **Agora**: XP, badges, learning progress, course completions

### 3. Demo Mode Requirement

- **App**: Always requires real authentication (data sensitivity)
- **Agora**: Demo mode allows exploration without commitment

### 4. Future Scalability

Keeping areas separate allows:

- Independent deployment cycles
- Different caching strategies
- Separate analytics tracking
- A/B testing per platform

## Header Logic

The `components/pt-layout-wrapper.tsx` handles header visibility:

```tsx
const isAppRoute = pathname.startsWith('/pt/app/')
const isAgoraRoute = pathname.startsWith('/pt/agora/')
const isLoginPage = pathname.includes('/login')
const isLandingPage = pathname === '/pt' || pathname === '/en'

// No header for authenticated app routes
if (isAppRoute) return <>{children}</>

// Agora has its own header
if (isAgoraRoute) return <>{children}</>

// SimplifiedHeader for landing/login
if (isLoginPage || isLandingPage) return <SimplifiedHeader>...

// Full header for public content pages
return <Header>...
```

## Migration Considerations

### Consolidation (Not Recommended)

Merging `/app` and `/agora` would require:

- Complex routing logic
- Mixed authentication requirements
- Larger bundle size
- Confused user experience

### Current Architecture (Recommended)

Keeping them separate provides:

- Clear separation of concerns
- Smaller route-specific bundles
- Independent feature development
- Cleaner analytics

## Related Documentation

- [Authentication Guide](/docs/03-features/authentication.md)
- [Agora Gamification](/docs/agora/gamification.md)
- [Chat Architecture](/docs/02-architecture/chat-system.md)

---

**Last Updated**: December 2025
**Author**: Anderson Henrique da Silva
