/**
 * Tests for useSanitizer hook and withSanitizedProps HOC
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { render } from '@testing-library/react'
import React from 'react'
import { useSanitizer, withSanitizedProps } from '../use-sanitizer'

// Mock the sanitizer module
vi.mock('@/lib/security/sanitizer', () => ({
  sanitizer: {
    sanitizeHtml: vi.fn((html: string) => `sanitized_html:${html}`),
    sanitizeChatMessage: vi.fn((msg: string) => `sanitized_chat:${msg}`),
    sanitizeInput: vi.fn((input: string) => `sanitized_input:${input}`),
    sanitizeFilename: vi.fn((filename: string) => `sanitized_filename:${filename}`),
    sanitizeUrl: vi.fn((url: string) => `sanitized_url:${url}`),
    escapeHtml: vi.fn((html: string) => `escaped_html:${html}`),
    sanitizeJson: vi.fn((json: string) => `sanitized_json:${json}`),
  },
}))

describe('useSanitizer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Hook Returns', () => {
    it('returns sanitizeHtml function', () => {
      const { result } = renderHook(() => useSanitizer())

      expect(result.current.sanitizeHtml).toBeDefined()
      expect(typeof result.current.sanitizeHtml).toBe('function')
    })

    it('returns sanitizeChatMessage function', () => {
      const { result } = renderHook(() => useSanitizer())

      expect(result.current.sanitizeChatMessage).toBeDefined()
      expect(typeof result.current.sanitizeChatMessage).toBe('function')
    })

    it('returns sanitizeInput function', () => {
      const { result } = renderHook(() => useSanitizer())

      expect(result.current.sanitizeInput).toBeDefined()
      expect(typeof result.current.sanitizeInput).toBe('function')
    })

    it('returns sanitizeFilename function', () => {
      const { result } = renderHook(() => useSanitizer())

      expect(result.current.sanitizeFilename).toBeDefined()
      expect(typeof result.current.sanitizeFilename).toBe('function')
    })

    it('returns sanitizeUrl function', () => {
      const { result } = renderHook(() => useSanitizer())

      expect(result.current.sanitizeUrl).toBeDefined()
      expect(typeof result.current.sanitizeUrl).toBe('function')
    })

    it('returns escapeHtml function', () => {
      const { result } = renderHook(() => useSanitizer())

      expect(result.current.escapeHtml).toBeDefined()
      expect(typeof result.current.escapeHtml).toBe('function')
    })

    it('returns sanitizeJson function', () => {
      const { result } = renderHook(() => useSanitizer())

      expect(result.current.sanitizeJson).toBeDefined()
      expect(typeof result.current.sanitizeJson).toBe('function')
    })
  })

  describe('Function Calls', () => {
    it('sanitizeHtml calls sanitizer.sanitizeHtml', () => {
      const { result } = renderHook(() => useSanitizer())

      const output = result.current.sanitizeHtml('<div>test</div>')

      expect(output).toBe('sanitized_html:<div>test</div>')
    })

    it('sanitizeChatMessage calls sanitizer.sanitizeChatMessage', () => {
      const { result } = renderHook(() => useSanitizer())

      const output = result.current.sanitizeChatMessage('Hello world')

      expect(output).toBe('sanitized_chat:Hello world')
    })

    it('sanitizeInput calls sanitizer.sanitizeInput', () => {
      const { result } = renderHook(() => useSanitizer())

      const output = result.current.sanitizeInput('user input')

      expect(output).toBe('sanitized_input:user input')
    })

    it('sanitizeFilename calls sanitizer.sanitizeFilename', () => {
      const { result } = renderHook(() => useSanitizer())

      const output = result.current.sanitizeFilename('file.txt')

      expect(output).toBe('sanitized_filename:file.txt')
    })

    it('sanitizeUrl calls sanitizer.sanitizeUrl', () => {
      const { result } = renderHook(() => useSanitizer())

      const output = result.current.sanitizeUrl('https://example.com')

      expect(output).toBe('sanitized_url:https://example.com')
    })

    it('escapeHtml calls sanitizer.escapeHtml', () => {
      const { result } = renderHook(() => useSanitizer())

      const output = result.current.escapeHtml('<script>alert("xss")</script>')

      expect(output).toBe('escaped_html:<script>alert("xss")</script>')
    })

    it('sanitizeJson calls sanitizer.sanitizeJson', () => {
      const { result } = renderHook(() => useSanitizer())

      const output = result.current.sanitizeJson('{"key": "value"}')

      expect(output).toBe('sanitized_json:{"key": "value"}')
    })
  })

  describe('Memoization', () => {
    it('returns stable function references', () => {
      const { result, rerender } = renderHook(() => useSanitizer())

      const firstRender = result.current

      rerender()

      expect(result.current.sanitizeHtml).toBe(firstRender.sanitizeHtml)
      expect(result.current.sanitizeInput).toBe(firstRender.sanitizeInput)
    })
  })
})

describe('withSanitizedProps', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  interface TestProps {
    name: string
    value: string
    count: number
  }

  const TestComponent: React.FC<TestProps> = ({ name, value, count }) => {
    return React.createElement(
      'div',
      { 'data-testid': 'test-component' },
      `name:${name}, value:${value}, count:${count}`
    )
  }

  it('sanitizes specified string props', () => {
    const SanitizedComponent = withSanitizedProps(TestComponent, ['name', 'value'])

    const { getByTestId } = render(
      React.createElement(SanitizedComponent, {
        name: 'test-name',
        value: 'test-value',
        count: 42,
      })
    )

    const component = getByTestId('test-component')
    expect(component.textContent).toContain('sanitized_input:test-name')
    expect(component.textContent).toContain('sanitized_input:test-value')
    expect(component.textContent).toContain('count:42')
  })

  it('does not sanitize non-string props', () => {
    const SanitizedComponent = withSanitizedProps(TestComponent, ['count'] as any)

    const { getByTestId } = render(
      React.createElement(SanitizedComponent, {
        name: 'test-name',
        value: 'test-value',
        count: 42,
      })
    )

    const component = getByTestId('test-component')
    // count is not a string, so it should not be sanitized
    expect(component.textContent).toContain('count:42')
  })

  it('only sanitizes props in the sanitize list', () => {
    const SanitizedComponent = withSanitizedProps(TestComponent, ['name'])

    const { getByTestId } = render(
      React.createElement(SanitizedComponent, {
        name: 'test-name',
        value: 'test-value',
        count: 42,
      })
    )

    const component = getByTestId('test-component')
    expect(component.textContent).toContain('sanitized_input:test-name')
    expect(component.textContent).toContain('value:test-value')
  })
})
