/**
 * Kids Mode Toggle Component
 *
 * Toggle button for parents to enable Kids mode.
 * Shows in parent's dashboard, opens setup modal.
 *
 * @author Anderson Henrique da Silva
 * @since 2025-12-09
 */

'use client'

import { useState } from 'react'
import { useKids } from '@/hooks/use-kids'
import { Button } from '@/components/ui/button'
import { Baby, Sparkles, ArrowRight } from 'lucide-react'
import { KidsSetupModal } from './kids-setup-modal'

interface KidsModeToggleProps {
  lang?: 'pt' | 'en'
}

export function KidsModeToggle({ lang = 'pt' }: KidsModeToggleProps) {
  const { isKidsMode, childName, disableKidsMode } = useKids()
  const [showSetupModal, setShowSetupModal] = useState(false)

  const handleToggle = () => {
    if (isKidsMode) {
      // Disable kids mode
      disableKidsMode()
    } else {
      // Show setup modal
      setShowSetupModal(true)
    }
  }

  if (isKidsMode) {
    return (
      <div className="kids-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-kids-coral flex items-center justify-center">
            <Baby className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">
              {lang === 'pt' ? 'Modo Kids Ativo' : 'Kids Mode Active'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {childName
                ? `${lang === 'pt' ? 'Criança: ' : 'Child: '}${childName}`
                : lang === 'pt'
                  ? 'Área Kids ativada'
                  : 'Kids Area activated'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleToggle} className="flex-1">
            {lang === 'pt' ? 'Desativar' : 'Disable'}
          </Button>
          <Button asChild className="flex-1 bg-kids-coral hover:bg-kids-coral/90">
            <a href={`/${lang}/agora/kids`}>
              {lang === 'pt' ? 'Acessar Área Kids' : 'Go to Kids Area'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={handleToggle}
        className="kids-card w-full p-6 text-left hover:shadow-xl transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-kids-coral to-kids-turquoise flex items-center justify-center">
                <Baby className="h-7 w-7 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-kids-yellow" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {lang === 'pt' ? 'Ativar Área Kids' : 'Enable Kids Area'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {lang === 'pt'
                  ? 'Aprendizado seguro e divertido para crianças'
                  : 'Safe and fun learning for children'}
              </p>
            </div>
          </div>
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
        </div>
      </button>

      <KidsSetupModal open={showSetupModal} onOpenChange={setShowSetupModal} lang={lang} />
    </>
  )
}

export default KidsModeToggle
