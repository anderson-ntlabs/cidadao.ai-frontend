'use client'

import { Menu, X } from 'lucide-react'
import { Button } from '../ui/button'
import { NotificationDropdown } from '../ui/notification-dropdown'
import { ThemeToggle } from '../theme-toggle'
import { LanguageSelector } from '../language-selector'

interface HeaderActionsProps {
  locale: 'pt' | 'en'
  isPublicPage: boolean
  isLandingPage: boolean
  isMenuOpen: boolean
  onMenuToggle: () => void
  showMobileMenu: boolean
}

export function HeaderActions({
  locale,
  isPublicPage,
  isLandingPage,
  isMenuOpen,
  onMenuToggle,
  showMobileMenu,
}: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Language Selector - Only show on public pages */}
      {isPublicPage && <LanguageSelector />}

      {/* Notifications - Only show if not on landing page */}
      {!isLandingPage && <NotificationDropdown locale={locale} />}

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Mobile Menu Button */}
      {showMobileMenu && (
        <Button
          data-testid="mobile-menu-trigger"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      )}
    </div>
  )
}
