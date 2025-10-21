# 🎯 VLibras Integration & UX/UI Enhancement Roadmap
## Cidadão.AI Frontend - 2025

---

## 📊 Executive Summary

This document outlines the strategic roadmap for integrating VLibras (Brazilian Sign Language accessibility) and comprehensive UX/UI improvements for the Cidadão.AI platform. The roadmap balances academic requirements with production-ready standards while enhancing the Brazilian cultural identity.

**Current Status:** Production-ready design with strong accessibility foundations
**Target:** World-class accessibility + Enhanced Brazilian identity
**Timeline:** 4 Sprints (6-week cycles)

---

## 🌊 Current User Journey Analysis

### **Landing Page → Login → Authenticated System**

```
┌─────────────────┐
│  Landing Page   │ ← User enters site (public)
│   /pt or /en    │    - Hero section with CTA
└────────┬────────┘    - Features showcase
         │             - Trust indicators
         │             - Spotify playlist section
         ▼
┌─────────────────┐
│  Login Page     │ ← User clicks "Acessar o Sistema"
│   /pt/login     │    - Supabase Auth UI
└────────┬────────┘    - Email/Password + OAuth (Google, GitHub)
         │             - Branded left panel with features
         │             - Responsive design
         ▼
┌─────────────────┐
│   Auth Check    │ ← Automatic redirect based on auth status
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Home Page     │ ← First authenticated screen
│  /pt/home       │    - Feature cards (Dashboard, Chat, Investigations)
└────────┬────────┘    - Quick actions
         │             - Recent activity
         │
         ├──────────────────┬──────────────────┬─────────────────┐
         ▼                  ▼                  ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Dashboard   │  │     Chat     │  │Investigações │  │   Profile    │
│ /dashboard   │  │    /chat     │  │/investigacoes│  │   /perfil    │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🎨 Current Design Strengths

### ✅ **What's Working Well:**

1. **Visual Identity**
   - Strong Brazilian theme (Operários by Tarsila do Amaral background)
   - Consistent color palette (Green, Yellow, Blue - Brazilian colors)
   - Glass morphism effects with backdrop-blur
   - Smooth animations and transitions

2. **Accessibility Foundations**
   - Skip links for keyboard navigation
   - ARIA labels throughout components
   - High contrast toggle
   - Screen reader announcer component
   - Semantic HTML structure

3. **Responsive Design**
   - Mobile-first approach
   - Adaptive layouts for all screens
   - Hamburger menu for mobile
   - Touch-friendly UI elements

4. **Performance**
   - PWA support with offline capabilities
   - Next.js 15 with App Router
   - Image optimization (AVIF/WebP)
   - Code splitting and lazy loading

5. **Authentication Flow**
   - Branded Supabase Auth UI
   - Clear value proposition on login page
   - Automatic redirect logic
   - OAuth integration (Google, GitHub)

---

## 🚧 Identified Pain Points & Opportunities

### **🔴 Critical Issues:**

1. **VLibras Absence**
   - No Brazilian Sign Language support
   - Missing government accessibility compliance (Gov.br standards)
   - Excludes deaf community from transparency platform

2. **Accessibility Gaps**
   - No consolidated accessibility panel
   - Font size control not implemented
   - Screen reader testing incomplete
   - WCAG 2.1 AA compliance not fully verified

### **🟡 UX Improvements Needed:**

1. **Onboarding Experience**
   - No guided tour for new users
   - Complex features need contextual help
   - First-time user experience unclear

2. **Information Architecture**
   - Dashboard metrics could be more intuitive
   - Chat interface needs UX refinement
   - Navigation could be more discoverable

3. **Brazilian Identity**
   - Cultural elements present but could be stronger
   - Agent personalities need more visual representation
   - Storytelling opportunities missed

### **🟢 Enhancement Opportunities:**

1. **Engagement**
   - Gamification potential (badges for investigations)
   - Social sharing features
   - Community building elements

2. **Educational Content**
   - Transparency education for citizens
   - How-to guides and tutorials
   - Data literacy resources

---

## 🗓️ VLibras Integration Roadmap

### **Sprint 1: Foundation (Weeks 1-6)**

#### **Phase 1.1: Research & Planning**
- [ ] Review Gov.br VLibras implementation guidelines
- [ ] Study WCAG 2.1 Level AA requirements for sign language
- [ ] Analyze competitor implementations (gov.br sites)
- [ ] Define accessibility KPIs and metrics

#### **Phase 1.2: Technical Setup**
- [ ] Install `@djpfs/react-vlibras` package
- [ ] Configure CSP headers for VLibras scripts
- [ ] Create environment variable `NEXT_PUBLIC_ENABLE_VLIBRAS`
- [ ] Set up VLibras staging environment

#### **Phase 1.3: Core Implementation**
```typescript
// components/a11y/vlibras-widget.tsx
'use client'

import { useEffect } from 'react'
import VLibras from '@djpfs/react-vlibras'

interface VLibrasWidgetProps {
  locale: 'pt' | 'en'
  forceOnload?: boolean
}

export function VLibrasWidget({ locale, forceOnload = true }: VLibrasWidgetProps) {
  // Only render for Portuguese (LIBRAS is Brazilian Sign Language)
  if (locale !== 'pt') return null

  return (
    <div className="vlibras-container">
      <VLibras forceOnload={forceOnload} />
    </div>
  )
}
```

#### **Phase 1.4: Layout Integration**
- [ ] Add VLibrasWidget to `app/pt/layout.tsx`
- [ ] Ensure z-index doesn't conflict with modals
- [ ] Test positioning on all breakpoints
- [ ] Verify keyboard accessibility

**Deliverables:**
- ✅ VLibras widget functional on all PT pages
- ✅ Documentation in CLAUDE.md
- ✅ CSP configuration updated
- ✅ Basic testing completed

---

### **Sprint 2: Accessibility Panel (Weeks 7-12)**

#### **Phase 2.1: Unified Accessibility Controls**
```typescript
// components/a11y/accessibility-panel.tsx
'use client'

import { useState } from 'react'
import { Eye, Type, Volume2, Languages, Settings } from 'lucide-react'
import { HighContrastToggle } from './high-contrast-toggle'
import { FontSizeControl } from './font-size-control'
import { VLibrasToggle } from './vlibras-toggle'

export function AccessibilityPanel({ locale }: { locale: 'pt' | 'en' }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full
                   bg-green-600 hover:bg-green-700 text-white shadow-xl
                   transition-all duration-300 hover:scale-110"
        aria-label={locale === 'pt' ? 'Abrir Painel de Acessibilidade' : 'Open Accessibility Panel'}
      >
        <Settings className="w-6 h-6 mx-auto" />
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 z-40 w-80 bg-white/95 dark:bg-gray-900/95
                        backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200
                        dark:border-gray-700 p-6 space-y-4">
          <h3 className="font-bold text-lg mb-4">
            {locale === 'pt' ? 'Acessibilidade' : 'Accessibility'}
          </h3>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium">
                {locale === 'pt' ? 'Alto Contraste' : 'High Contrast'}
              </span>
            </div>
            <HighContrastToggle />
          </div>

          {/* Font Size */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium">
                {locale === 'pt' ? 'Tamanho da Fonte' : 'Font Size'}
              </span>
            </div>
            <FontSizeControl locale={locale} />
          </div>

          {/* VLibras */}
          {locale === 'pt' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Languages className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium">VLibras (LIBRAS)</span>
              </div>
              <VLibrasToggle />
            </div>
          )}

          {/* Screen Reader Help */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="text-sm text-green-600 hover:text-green-700 font-medium">
              {locale === 'pt' ? 'Guia de Acessibilidade' : 'Accessibility Guide'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
```

#### **Phase 2.2: Font Size Control**
```typescript
// components/a11y/font-size-control.tsx
'use client'

import { useState, useEffect } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'

type FontSize = 'small' | 'normal' | 'large' | 'xlarge'

export function FontSizeControl({ locale }: { locale: 'pt' | 'en' }) {
  const [fontSize, setFontSize] = useState<FontSize>('normal')

  useEffect(() => {
    const saved = localStorage.getItem('fontSize') as FontSize
    if (saved) setFontSize(saved)
  }, [])

  const applyFontSize = (size: FontSize) => {
    const root = document.documentElement
    const sizeMap = {
      small: '14px',
      normal: '16px',
      large: '18px',
      xlarge: '20px'
    }
    root.style.fontSize = sizeMap[size]
    setFontSize(size)
    localStorage.setItem('fontSize', size)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          const sizes: FontSize[] = ['small', 'normal', 'large', 'xlarge']
          const currentIndex = sizes.indexOf(fontSize)
          if (currentIndex > 0) applyFontSize(sizes[currentIndex - 1])
        }}
        disabled={fontSize === 'small'}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
        aria-label={locale === 'pt' ? 'Diminuir fonte' : 'Decrease font'}
      >
        <Minus className="w-4 h-4" />
      </button>

      <span className="text-sm w-16 text-center font-medium">
        {fontSize === 'normal' ? 'Aa' : fontSize === 'large' ? 'Aa+' : fontSize === 'xlarge' ? 'Aa++' : 'Aa-'}
      </span>

      <button
        onClick={() => {
          const sizes: FontSize[] = ['small', 'normal', 'large', 'xlarge']
          const currentIndex = sizes.indexOf(fontSize)
          if (currentIndex < sizes.length - 1) applyFontSize(sizes[currentIndex + 1])
        }}
        disabled={fontSize === 'xlarge'}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
        aria-label={locale === 'pt' ? 'Aumentar fonte' : 'Increase font'}
      >
        <Plus className="w-4 h-4" />
      </button>

      <button
        onClick={() => applyFontSize('normal')}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        aria-label={locale === 'pt' ? 'Resetar fonte' : 'Reset font'}
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  )
}
```

**Deliverables:**
- ✅ Unified accessibility panel component
- ✅ Font size control with persistence
- ✅ Keyboard shortcuts (Alt+A to open panel)
- ✅ Mobile-responsive panel design
- ✅ User testing with accessibility tools

---

### **Sprint 3: UX Enhancement (Weeks 13-18)**

#### **Phase 3.1: Onboarding Experience**
- [ ] Create interactive tour with `react-joyride`
- [ ] First-time user welcome modal
- [ ] Contextual tooltips for complex features
- [ ] Progressive disclosure for advanced features

#### **Phase 3.2: Information Architecture**
```
Improved Navigation Structure:
├── Landing Page (Public)
│   ├── Hero with clear value prop
│   ├── How it Works (3-step visual guide)
│   ├── Agent Showcase (visual cards)
│   ├── Trust Indicators
│   └── CTA (Acessar Sistema)
│
├── Login/Signup (Public)
│   ├── Branded left panel
│   ├── Social proof
│   └── Quick benefits list
│
└── Authenticated Area
    ├── Home (Dashboard Overview)
    │   ├── Quick Stats (Cards)
    │   ├── Recent Investigations
    │   ├── Suggested Actions
    │   └── Agent Status
    │
    ├── Chat (Multi-Agent Interface)
    │   ├── Agent Selector (visual)
    │   ├── Conversation History
    │   ├── Suggested Prompts
    │   └── Export Options
    │
    ├── Investigações (Investigation Manager)
    │   ├── Active Investigations
    │   ├── Filters & Search
    │   ├── Visualization Tools
    │   └── Export Reports
    │
    └── Profile & Settings
        ├── User Preferences
        ├── Accessibility Settings
        ├── Notification Controls
        └── Data Export
```

#### **Phase 3.3: Enhanced Brazilian Identity**

**Visual Elements:**
1. **Agent Avatar System**
   - Custom illustrations for all 17 agents
   - Brazilian cultural references in design
   - Animated avatars for chat interactions
   - Agent personality cards

2. **Cultural Storytelling**
   - Hero stories for each agent (modal/page)
   - Historical context about their namesakes
   - Educational content about Brazilian heroes
   - Connection to transparency mission

3. **Visual Language**
   - Brazilian modernist art inspiration
   - Color palette from Brazilian nature
   - Typography inspired by Brazilian design
   - Iconography with local context

**Example Agent Card:**
```typescript
// components/agents/agent-card.tsx
export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl
                    bg-gradient-to-br from-white/90 to-gray-50/90
                    dark:from-gray-900/90 dark:to-gray-800/90
                    backdrop-blur-lg p-6 hover:shadow-2xl
                    transition-all duration-500 hover:scale-105">

      {/* Agent Avatar */}
      <div className="relative w-24 h-24 mx-auto mb-4">
        <Image
          src={agent.avatar}
          alt={agent.name}
          fill
          className="rounded-full object-cover ring-4 ring-green-500/20
                     group-hover:ring-green-500/40 transition-all"
        />
        <div className="absolute -bottom-2 -right-2 w-8 h-8
                        bg-green-500 rounded-full flex items-center
                        justify-center text-white text-xs font-bold">
          {agent.status === 'active' ? '✓' : '○'}
        </div>
      </div>

      {/* Agent Info */}
      <h3 className="text-xl font-bold text-center mb-2">
        {agent.name}
      </h3>
      <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-4">
        {agent.role}
      </p>

      {/* Specialties */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {agent.specialties.map(specialty => (
          <span key={specialty}
                className="px-3 py-1 bg-green-100 dark:bg-green-900/30
                           text-green-700 dark:text-green-300
                           rounded-full text-xs font-medium">
            {specialty}
          </span>
        ))}
      </div>

      {/* CTA */}
      <button className="w-full py-2 bg-gradient-to-r from-green-600 to-blue-600
                         text-white rounded-lg font-medium
                         hover:shadow-lg transition-all">
        Conversar com {agent.name.split(' ')[0]}
      </button>
    </div>
  )
}
```

**Deliverables:**
- ✅ Interactive onboarding tour
- ✅ Enhanced navigation UX
- ✅ Visual agent identity system
- ✅ Cultural storytelling components
- ✅ User testing with Brazilian citizens

---

### **Sprint 4: Testing & Refinement (Weeks 19-24)**

#### **Phase 4.1: Comprehensive Testing**

**Accessibility Testing:**
- [ ] WCAG 2.1 AA automated testing (Lighthouse, axe)
- [ ] Manual screen reader testing (NVDA, JAWS)
- [ ] Keyboard navigation testing
- [ ] VLibras functionality testing with deaf users
- [ ] Color contrast verification
- [ ] Focus management validation

**UX Testing:**
- [ ] User testing sessions (5-10 participants)
- [ ] Task completion rate measurement
- [ ] Time-on-task analysis
- [ ] System Usability Scale (SUS) survey
- [ ] A/B testing for key flows
- [ ] Heatmap analysis (Hotjar/Microsoft Clarity)

**Performance Testing:**
- [ ] Core Web Vitals optimization
- [ ] Lighthouse score >90 on all pages
- [ ] VLibras load time impact assessment
- [ ] Mobile performance testing
- [ ] Accessibility panel performance

#### **Phase 4.2: Documentation**

**User Documentation:**
```markdown
# Guia de Acessibilidade - Cidadão.AI

## VLibras (LIBRAS)

O Cidadão.AI oferece tradução automática para Língua Brasileira de Sinais
(LIBRAS) através do VLibras, ferramenta oficial do Governo Federal.

### Como Usar:
1. No canto inferior direito, clique no ícone VLibras
2. Selecione o avatar de sua preferência (Guga, Ícaro ou Hozana)
3. O avatar traduzirá automaticamente o conteúdo da página
4. Para pausar, clique no botão de pausa no widget

### Atalhos de Teclado:
- Alt + A: Abrir painel de acessibilidade
- Alt + V: Ativar/desativar VLibras
- Alt + H: Aumentar contraste
- Alt + +: Aumentar fonte
- Alt + -: Diminuir fonte

## Suporte
Para questões de acessibilidade, entre em contato:
📧 acessibilidade@cidadao.ai
📞 0800-XXX-XXXX (Atendimento em LIBRAS disponível)
```

**Technical Documentation:**
- [ ] Update CLAUDE.md with VLibras setup
- [ ] Create accessibility testing guide
- [ ] Document keyboard shortcuts
- [ ] Add troubleshooting section
- [ ] Create contributor guidelines for accessibility

#### **Phase 4.3: Launch Preparation**

**Pre-Launch Checklist:**
- [ ] VLibras working on all pages
- [ ] Accessibility panel functional
- [ ] WCAG 2.1 AA compliant
- [ ] Performance benchmarks met
- [ ] User documentation complete
- [ ] Support team trained
- [ ] Monitoring/analytics configured
- [ ] Rollback plan prepared

**Deliverables:**
- ✅ Full accessibility compliance report
- ✅ User testing insights document
- ✅ Performance optimization report
- ✅ Complete user documentation
- ✅ Launch-ready system

---

## 🎓 Academic vs Production Requirements

### **For Academic Work (TCC/Thesis):**

**Current Status: ✅ Excellent**

The current implementation is **highly suitable** for academic purposes:

✅ **Technical Depth:**
- Multi-agent AI architecture
- Real-time data processing
- Advanced caching strategies
- Performance optimization

✅ **Innovation:**
- Brazilian cultural AI agents
- Government transparency focus
- Novel application of LLMs
- Social impact mission

✅ **Documentation:**
- Comprehensive technical docs
- Well-commented code
- Architecture diagrams available
- Clear project structure

**Academic Enhancements:**
```markdown
Recommended Additions for Academic Rigor:

1. Methodology Section
   - Design Science Research approach
   - User-centered design process
   - Iterative development cycles
   - Evaluation metrics

2. Literature Review Integration
   - Related work in AI transparency
   - Government data accessibility
   - Multi-agent systems
   - Brazilian e-government initiatives

3. Evaluation Framework
   - Quantitative metrics (usage, performance)
   - Qualitative feedback (user interviews)
   - Comparative analysis (vs existing solutions)
   - Impact assessment (social value)

4. Future Work Section
   - Scalability challenges
   - Enhanced ML models
   - Additional data sources
   - Community features
```

### **For Production Deployment:**

**Current Status: 🟡 Good, Needs Enhancement**

**Production Readiness Checklist:**

🟢 **Already Production-Ready:**
- Authentication system (Supabase)
- Backend API integration
- PWA functionality
- Responsive design
- Error handling

🟡 **Needs Enhancement:**
- [ ] Comprehensive error boundaries
- [ ] Advanced monitoring (Sentry configured, needs tuning)
- [ ] Load testing results
- [ ] Security audit
- [ ] LGPD compliance documentation
- [ ] Disaster recovery plan

🔴 **Critical for Production:**
- [ ] VLibras integration (accessibility requirement)
- [ ] Complete test coverage
- [ ] Performance optimization
- [ ] Scalability testing
- [ ] Legal compliance review

---

## 📈 Success Metrics

### **Accessibility Metrics:**
- [ ] VLibras activation rate: Target >5% of PT users
- [ ] Accessibility panel usage: Target >10% of users
- [ ] WCAG 2.1 AA compliance: 100% (Lighthouse audit)
- [ ] Keyboard navigation success: 100% task completion
- [ ] Screen reader compatibility: Full support

### **UX Metrics:**
- [ ] Onboarding completion rate: >80%
- [ ] Task success rate: >90%
- [ ] System Usability Scale (SUS): >75 (Good)
- [ ] Time to first investigation: <3 minutes
- [ ] User retention (7-day): >40%

### **Performance Metrics:**
- [ ] First Contentful Paint (FCP): <1.8s
- [ ] Largest Contentful Paint (LCP): <2.5s
- [ ] Cumulative Layout Shift (CLS): <0.1
- [ ] Time to Interactive (TTI): <3.5s
- [ ] Lighthouse Score: >90

### **Engagement Metrics:**
- [ ] Daily Active Users (DAU): Track growth
- [ ] Investigations created per user: Avg >2
- [ ] Chat sessions per user: Avg >5
- [ ] Pages per session: Avg >4
- [ ] Bounce rate: <40%

---

## 🔧 Implementation Priority Matrix

### **Priority 1: Must Have (Sprint 1)**
1. ✅ VLibras integration (government compliance)
2. ✅ Accessibility panel foundation
3. ✅ WCAG 2.1 AA critical fixes
4. ✅ Font size control

### **Priority 2: Should Have (Sprint 2)**
1. ✅ Unified accessibility panel
2. ✅ Keyboard shortcuts
3. ✅ Screen reader optimization
4. ✅ Enhanced agent visual identity

### **Priority 3: Nice to Have (Sprint 3)**
1. ✅ Interactive onboarding
2. ✅ Cultural storytelling
3. ✅ Advanced animations
4. ✅ Gamification elements

### **Priority 4: Future Enhancements (Sprint 4+)**
1. ✅ Community features
2. ✅ Social sharing
3. ✅ Educational content
4. ✅ Multilingual sign language support

---

## 💡 Recommended Next Steps

### **Immediate Actions (This Week):**

1. **VLibras Setup**
   ```bash
   npm install @djpfs/react-vlibras
   ```
   - Create VLibrasWidget component
   - Add to PT layout
   - Test basic functionality

2. **Accessibility Audit**
   ```bash
   npm run build
   npx lighthouse http://localhost:3000 --only-categories=accessibility
   ```
   - Run automated accessibility checks
   - Document issues found
   - Prioritize fixes

3. **User Journey Mapping**
   - Create detailed flow diagrams
   - Identify friction points
   - Plan UX improvements

### **This Month:**

1. Complete Sprint 1 deliverables
2. Conduct initial user testing
3. Implement critical accessibility fixes
4. Document progress for academic work

### **This Quarter:**

1. Complete all 4 sprints
2. Achieve WCAG 2.1 AA compliance
3. Launch VLibras integration
4. Conduct comprehensive user testing

---

## 🎯 Final Recommendations

### **For Academic Excellence:**

The current system is **excellent** for academic purposes. Key points:

1. **Strong Technical Foundation** - Multi-agent architecture, real-time processing
2. **Social Impact** - Government transparency, citizen empowerment
3. **Innovation** - Brazilian cultural AI agents, novel UX approach
4. **Documentation** - Comprehensive, well-structured

**Recommendation:** Proceed with current design, add academic rigor through:
- Methodology documentation
- Evaluation framework
- Literature review integration
- Impact assessment

### **For Production Deployment:**

The system needs **strategic enhancements** for production:

1. **Critical:** VLibras integration (accessibility compliance)
2. **Important:** Security audit, load testing
3. **Nice-to-have:** Advanced monitoring, disaster recovery

**Recommendation:** Follow the 4-sprint roadmap, prioritizing accessibility and performance.

### **For Enhanced Brazilian Identity:**

The cultural theme is present but can be **significantly strengthened**:

1. **Visual Identity:** Custom agent illustrations, Brazilian design patterns
2. **Storytelling:** Agent background stories, educational content
3. **Cultural Connection:** Local references, community building

**Recommendation:** Invest in visual design and storytelling to create a unique, culturally-grounded experience.

---

## 📚 Resources & References

### **VLibras Resources:**
- Official Guide: https://vlibras.gov.br/files/Dev_VLibras_Plugin_Widget.pdf
- Gov.br Standards: https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/vlibras
- React Library: https://www.npmjs.com/package/@djpfs/react-vlibras

### **Accessibility Standards:**
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- Gov.br eMAG: https://emag.governoeletronico.gov.br/
- ARIA Practices: https://www.w3.org/WAI/ARIA/apg/

### **UX Best Practices:**
- Nielsen Norman Group: https://www.nngroup.com/
- Gov.br Design System: https://www.gov.br/ds/
- Material Design: https://m3.material.io/

---

**Document Version:** 1.0
**Last Updated:** 2025-10-21
**Author:** Technical Team - Cidadão.AI
**Next Review:** Sprint 1 Completion (Week 6)