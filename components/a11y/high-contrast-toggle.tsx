'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui'

export function HighContrastToggle() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('highContrast') === 'true'
    setIsHighContrast(saved)
    if (saved) {
      document.documentElement.classList.add('high-contrast')
    }
  }, [])

  const toggleHighContrast = () => {
    const newValue = !isHighContrast
    setIsHighContrast(newValue)
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
    
    localStorage.setItem('highContrast', String(newValue))
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleHighContrast}
      aria-label={isHighContrast ? 'Desativar alto contraste' : 'Ativar alto contraste'}
      title={isHighContrast ? 'Desativar alto contraste' : 'Ativar alto contraste'}
    >
      {isHighContrast ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <Eye className="h-5 w-5" />
      )}
    </Button>
  )
}