/**
 * Tests for Mobile Touch Utilities
 *
 * @author Anderson Henrique da Silva
 * @location Minas Gerais, Brasil
 * @date 2025-12-14
 */

import { describe, it, expect } from 'vitest'
import {
  touchFeedback,
  tapTarget,
  scrollBehavior,
  safeArea,
  mobileAnimation,
  gestureHint,
  withTouchFeedback,
  withTapTarget,
  mobileTouchClasses,
} from './mobile-touch'

describe('Mobile Touch Utilities', () => {
  describe('touchFeedback', () => {
    it('should have button feedback class', () => {
      expect(touchFeedback.button).toContain('active:scale-95')
      expect(touchFeedback.button).toContain('touch-manipulation')
    })

    it('should have card feedback class', () => {
      expect(touchFeedback.card).toContain('active:scale-[0.98]')
    })

    it('should have icon feedback class', () => {
      expect(touchFeedback.icon).toContain('active:scale-95')
    })

    it('should have listItem feedback class', () => {
      expect(touchFeedback.listItem).toContain('active:scale-[0.99]')
      expect(touchFeedback.listItem).toContain('active:bg-gray-100')
    })

    it('should have link feedback class', () => {
      expect(touchFeedback.link).toContain('active:opacity-70')
    })

    it('should have fab feedback class', () => {
      expect(touchFeedback.fab).toContain('active:scale-97')
    })

    it('should have minimal feedback class', () => {
      expect(touchFeedback.minimal).toContain('touch-manipulation')
    })

    it('should include tap highlight removal for all types', () => {
      Object.values(touchFeedback).forEach((value) => {
        expect(value).toContain('-webkit-tap-highlight-color:transparent')
      })
    })
  })

  describe('tapTarget', () => {
    it('should have small target size (44px)', () => {
      expect(tapTarget.small).toContain('min-h-[44px]')
      expect(tapTarget.small).toContain('min-w-[44px]')
    })

    it('should have medium target size (48px)', () => {
      expect(tapTarget.medium).toContain('min-h-[48px]')
      expect(tapTarget.medium).toContain('min-w-[48px]')
    })

    it('should have large target size (56px)', () => {
      expect(tapTarget.large).toContain('min-h-[56px]')
      expect(tapTarget.large).toContain('min-w-[56px]')
    })

    it('should have xlarge target size (64px)', () => {
      expect(tapTarget.xlarge).toContain('min-h-[64px]')
      expect(tapTarget.xlarge).toContain('min-w-[64px]')
    })
  })

  describe('scrollBehavior', () => {
    it('should have momentum scrolling class', () => {
      expect(scrollBehavior.momentum).toContain('overflow-y-auto')
      expect(scrollBehavior.momentum).toContain('-webkit-overflow-scrolling:touch')
    })

    it('should have no overscroll class', () => {
      expect(scrollBehavior.noOverscroll).toBe('overscroll-none')
    })

    it('should have snap class', () => {
      expect(scrollBehavior.snap).toContain('snap-x')
      expect(scrollBehavior.snap).toContain('snap-mandatory')
    })
  })

  describe('safeArea', () => {
    it('should have top safe area padding', () => {
      expect(safeArea.top).toContain('env(safe-area-inset-top)')
    })

    it('should have bottom safe area padding', () => {
      expect(safeArea.bottom).toContain('env(safe-area-inset-bottom)')
    })

    it('should have left safe area padding', () => {
      expect(safeArea.left).toContain('env(safe-area-inset-left)')
    })

    it('should have right safe area padding', () => {
      expect(safeArea.right).toContain('env(safe-area-inset-right)')
    })

    it('should have all safe areas', () => {
      expect(safeArea.all).toContain('env(safe-area-inset-top)')
      expect(safeArea.all).toContain('env(safe-area-inset-bottom)')
    })
  })

  describe('mobileAnimation', () => {
    it('should have fast animation (150ms)', () => {
      expect(mobileAnimation.fast).toContain('duration-150')
    })

    it('should have normal animation (300ms)', () => {
      expect(mobileAnimation.normal).toContain('duration-300')
    })

    it('should have slow animation (500ms)', () => {
      expect(mobileAnimation.slow).toContain('duration-500')
    })

    it('should have spring animation', () => {
      expect(mobileAnimation.spring).toContain('cubic-bezier')
    })

    it('should have hardware accelerated class', () => {
      expect(mobileAnimation.hwAccelerated).toContain('transform-gpu')
      expect(mobileAnimation.hwAccelerated).toContain('will-change-transform')
    })
  })

  describe('gestureHint', () => {
    it('should have swipeable hint', () => {
      expect(gestureHint.swipeable).toContain('cursor-grab')
      expect(gestureHint.swipeable).toContain('active:cursor-grabbing')
    })

    it('should have draggable hint', () => {
      expect(gestureHint.draggable).toBe('cursor-move')
    })

    it('should have horizontal scroll hint', () => {
      expect(gestureHint.horizontalScroll).toContain('overflow-x-auto')
      expect(gestureHint.horizontalScroll).toContain('snap-x')
    })
  })

  describe('withTouchFeedback', () => {
    it('should return feedback class for button type', () => {
      const result = withTouchFeedback('button')

      expect(result).toContain('active:scale-95')
    })

    it('should combine feedback with custom classes', () => {
      const result = withTouchFeedback('button', 'bg-blue-500')

      expect(result).toContain('active:scale-95')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle undefined custom classes', () => {
      const result = withTouchFeedback('card', undefined)

      expect(result).toContain('active:scale-[0.98]')
    })

    it('should work with all feedback types', () => {
      const types: (keyof typeof touchFeedback)[] = [
        'button',
        'card',
        'icon',
        'listItem',
        'link',
        'fab',
        'minimal',
      ]

      types.forEach((type) => {
        const result = withTouchFeedback(type)
        expect(result).toBeTruthy()
      })
    })
  })

  describe('withTapTarget', () => {
    it('should return target class for small size', () => {
      const result = withTapTarget('small')

      expect(result).toContain('min-h-[44px]')
    })

    it('should combine target with custom classes', () => {
      const result = withTapTarget('medium', 'rounded-full')

      expect(result).toContain('min-h-[48px]')
      expect(result).toContain('rounded-full')
    })

    it('should handle undefined custom classes', () => {
      const result = withTapTarget('large', undefined)

      expect(result).toContain('min-h-[56px]')
    })

    it('should work with all target sizes', () => {
      const sizes: (keyof typeof tapTarget)[] = ['small', 'medium', 'large', 'xlarge']

      sizes.forEach((size) => {
        const result = withTapTarget(size)
        expect(result).toBeTruthy()
      })
    })
  })

  describe('mobileTouchClasses', () => {
    it('should return feedback class only', () => {
      const result = mobileTouchClasses({ feedback: 'button' })

      expect(result).toContain('active:scale-95')
    })

    it('should combine feedback and tap target', () => {
      const result = mobileTouchClasses({
        feedback: 'button',
        tapTarget: 'medium',
      })

      expect(result).toContain('active:scale-95')
      expect(result).toContain('min-h-[48px]')
    })

    it('should combine all options', () => {
      const result = mobileTouchClasses({
        feedback: 'card',
        tapTarget: 'large',
        custom: 'bg-white rounded-lg',
      })

      expect(result).toContain('active:scale-[0.98]')
      expect(result).toContain('min-h-[56px]')
      expect(result).toContain('bg-white')
      expect(result).toContain('rounded-lg')
    })

    it('should handle missing optional properties', () => {
      const result = mobileTouchClasses({ feedback: 'link' })

      expect(result).toContain('active:opacity-70')
    })

    it('should work with all feedback types', () => {
      const types: (keyof typeof touchFeedback)[] = ['button', 'card', 'icon', 'listItem', 'link']

      types.forEach((feedback) => {
        const result = mobileTouchClasses({ feedback })
        expect(result).toBeTruthy()
      })
    })
  })
})
