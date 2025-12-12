/**
 * Input Validation Tests
 *
 * Comprehensive tests for input validation and sanitization functions
 */

import { describe, it, expect } from 'vitest'
import {
  sanitizeHTML,
  isValidEmail,
  isValidURL,
  sanitizeFilename,
  isValidInvestigationId,
  isValidLanguage,
  sanitizeSearchQuery,
  isValidCPF,
  isValidCNPJ,
  isValidAmount,
  isValidDate,
  isValidDateRange,
  sanitizeJSON,
  isValidAgentId,
  validatePagination,
  validateSort,
  InputValidator,
} from './input-validation'

describe('Input Validation', () => {
  describe('sanitizeHTML', () => {
    it('should escape HTML special characters', () => {
      expect(sanitizeHTML('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      )
    })

    it('should escape ampersands', () => {
      expect(sanitizeHTML('foo & bar')).toBe('foo &amp; bar')
    })

    it('should escape quotes', () => {
      expect(sanitizeHTML('say "hello"')).toBe('say &quot;hello&quot;')
      expect(sanitizeHTML("it's")).toBe('it&#x27;s')
    })

    it('should return empty string for empty input', () => {
      expect(sanitizeHTML('')).toBe('')
    })

    it('should handle null/undefined', () => {
      expect(sanitizeHTML(null as any)).toBe('')
      expect(sanitizeHTML(undefined as any)).toBe('')
    })
  })

  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@gmail.com')).toBe(true)
    })

    it('should return false for invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('invalid@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('user @domain.com')).toBe(false)
    })
  })

  describe('isValidURL', () => {
    it('should return true for valid http/https URLs', () => {
      expect(isValidURL('https://example.com')).toBe(true)
      expect(isValidURL('http://localhost:3000')).toBe(true)
      expect(isValidURL('https://api.example.com/path?query=1')).toBe(true)
    })

    it('should return false for non-http protocols', () => {
      expect(isValidURL('ftp://example.com')).toBe(false)
      expect(isValidURL('javascript:alert(1)')).toBe(false)
      expect(isValidURL('file:///etc/passwd')).toBe(false)
    })

    it('should return false for invalid URLs', () => {
      expect(isValidURL('not a url')).toBe(false)
      expect(isValidURL('')).toBe(false)
    })
  })

  describe('sanitizeFilename', () => {
    it('should remove special characters', () => {
      expect(sanitizeFilename('file<>:"/\\|?*.txt')).toBe('file_________.txt')
    })

    it('should prevent path traversal', () => {
      // Dots are preserved but leading dots are removed
      expect(sanitizeFilename('../../../etc/passwd')).toBe('_._._etc_passwd')
    })

    it('should remove double dots', () => {
      expect(sanitizeFilename('file..txt')).toBe('file.txt')
    })

    it('should remove leading dots', () => {
      expect(sanitizeFilename('.hidden')).toBe('hidden')
    })

    it('should limit length to 255 characters', () => {
      const longName = 'a'.repeat(300)
      expect(sanitizeFilename(longName).length).toBe(255)
    })

    it('should return empty string for empty input', () => {
      expect(sanitizeFilename('')).toBe('')
    })
  })

  describe('isValidInvestigationId', () => {
    it('should return true for valid UUIDs', () => {
      expect(isValidInvestigationId('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
      expect(isValidInvestigationId('6ba7b810-9dad-41d4-80b4-00c04fd430c8')).toBe(true)
    })

    it('should return true for custom session formats', () => {
      expect(isValidInvestigationId('maritaca_1234567890')).toBe(true)
      expect(isValidInvestigationId('session_1234567890_abc')).toBe(true)
      expect(isValidInvestigationId('smart_1234567890')).toBe(true)
      expect(isValidInvestigationId('chat_1234567890')).toBe(true)
    })

    it('should return false for invalid IDs', () => {
      expect(isValidInvestigationId('invalid')).toBe(false)
      expect(isValidInvestigationId('')).toBe(false)
      expect(isValidInvestigationId(null as any)).toBe(false)
      expect(isValidInvestigationId(undefined as any)).toBe(false)
    })
  })

  describe('isValidLanguage', () => {
    it('should return true for supported languages', () => {
      expect(isValidLanguage('pt')).toBe(true)
      expect(isValidLanguage('en')).toBe(true)
    })

    it('should return false for unsupported languages', () => {
      expect(isValidLanguage('es')).toBe(false)
      expect(isValidLanguage('fr')).toBe(false)
      expect(isValidLanguage('')).toBe(false)
    })
  })

  describe('sanitizeSearchQuery', () => {
    it('should remove HTML-like characters', () => {
      // Only < and > are removed, / is preserved
      expect(sanitizeSearchQuery('<script>alert(1)</script>')).toBe('scriptalert(1)/script')
    })

    it('should remove quotes', () => {
      expect(sanitizeSearchQuery('search "term"')).toBe('search term')
      expect(sanitizeSearchQuery("search 'term'")).toBe('search term')
    })

    it('should trim whitespace', () => {
      expect(sanitizeSearchQuery('  search  ')).toBe('search')
    })

    it('should limit length to 200 characters', () => {
      const longQuery = 'a'.repeat(300)
      expect(sanitizeSearchQuery(longQuery).length).toBe(200)
    })

    it('should return empty string for empty input', () => {
      expect(sanitizeSearchQuery('')).toBe('')
    })
  })

  describe('isValidCPF', () => {
    it('should return true for valid CPFs', () => {
      // Valid CPF numbers (generated for testing)
      expect(isValidCPF('529.982.247-25')).toBe(true)
      expect(isValidCPF('52998224725')).toBe(true)
    })

    it('should return false for invalid CPFs', () => {
      expect(isValidCPF('111.111.111-11')).toBe(false) // All same digits
      expect(isValidCPF('123.456.789-00')).toBe(false) // Invalid check digits
      expect(isValidCPF('123')).toBe(false) // Too short
    })
  })

  describe('isValidCNPJ', () => {
    it('should return true for valid CNPJs', () => {
      // Valid CNPJ numbers (generated for testing)
      expect(isValidCNPJ('11.222.333/0001-81')).toBe(true)
      expect(isValidCNPJ('11222333000181')).toBe(true)
    })

    it('should return false for invalid CNPJs', () => {
      expect(isValidCNPJ('11.111.111/1111-11')).toBe(false) // All same digits
      expect(isValidCNPJ('12.345.678/0001-00')).toBe(false) // Invalid check digits
      expect(isValidCNPJ('123')).toBe(false) // Too short
    })
  })

  describe('isValidAmount', () => {
    it('should return true for valid amounts', () => {
      expect(isValidAmount(100)).toBe(true)
      expect(isValidAmount('100.50')).toBe(true)
      expect(isValidAmount(0)).toBe(true)
    })

    it('should return false for invalid amounts', () => {
      expect(isValidAmount(-100)).toBe(false) // Negative
      expect(isValidAmount('not a number')).toBe(false)
      expect(isValidAmount(Infinity)).toBe(false)
      expect(isValidAmount(NaN)).toBe(false)
    })
  })

  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(isValidDate('2024-01-15')).toBe(true)
      expect(isValidDate('2024-12-31T23:59:59')).toBe(true)
    })

    it('should return false for invalid dates', () => {
      expect(isValidDate('invalid')).toBe(false)
      expect(isValidDate('')).toBe(false)
    })
  })

  describe('isValidDateRange', () => {
    it('should return true for valid date ranges', () => {
      expect(isValidDateRange('2024-01-01', '2024-12-31')).toBe(true)
      expect(isValidDateRange('2024-01-01', '2024-01-01')).toBe(true) // Same date
    })

    it('should return false for invalid date ranges', () => {
      expect(isValidDateRange('2024-12-31', '2024-01-01')).toBe(false) // End before start
      expect(isValidDateRange('invalid', '2024-01-01')).toBe(false)
      expect(isValidDateRange('2024-01-01', 'invalid')).toBe(false)
    })
  })

  describe('sanitizeJSON', () => {
    it('should return sanitized JSON string', () => {
      expect(sanitizeJSON('{"key": "value"}')).toBe('{"key":"value"}')
    })

    it('should return null for invalid JSON', () => {
      expect(sanitizeJSON('not json')).toBeNull()
      expect(sanitizeJSON('{invalid}')).toBeNull()
    })
  })

  describe('isValidAgentId', () => {
    it('should return true for valid agent IDs', () => {
      expect(isValidAgentId('abaporu')).toBe(true)
      expect(isValidAgentId('zumbi')).toBe(true)
      expect(isValidAgentId('tiradentes')).toBe(true)
      expect(isValidAgentId('ABAPORU')).toBe(true) // Case insensitive
    })

    it('should return false for invalid agent IDs', () => {
      expect(isValidAgentId('invalid_agent')).toBe(false)
      expect(isValidAgentId('')).toBe(false)
      expect(isValidAgentId('gpt-4')).toBe(false)
    })
  })

  describe('validatePagination', () => {
    it('should return default values for empty params', () => {
      expect(validatePagination({})).toEqual({ page: 1, limit: 10 })
    })

    it('should parse string values', () => {
      expect(validatePagination({ page: '5', limit: '20' })).toEqual({ page: 5, limit: 20 })
    })

    it('should enforce minimum values', () => {
      // Page enforces min of 1, but limit defaults to 10 for invalid values
      expect(validatePagination({ page: -1, limit: -1 })).toEqual({ page: 1, limit: 1 })
      // limit: 0 parses to 0, then Math.max(1, 0) = 1, then Math.min(100, 1) = 1
      // Actually, parseInt('0') = 0, which is falsy, so falls back to default 10
      expect(validatePagination({ page: 0, limit: 0 })).toEqual({ page: 1, limit: 10 })
    })

    it('should enforce maximum limit', () => {
      expect(validatePagination({ page: 1, limit: 500 })).toEqual({ page: 1, limit: 100 })
    })

    it('should handle invalid values', () => {
      expect(validatePagination({ page: 'invalid', limit: 'invalid' })).toEqual({
        page: 1,
        limit: 10,
      })
    })
  })

  describe('validateSort', () => {
    const allowedFields = ['name', 'date', 'value']

    it('should return valid sort parameters', () => {
      expect(validateSort('name:asc', allowedFields)).toEqual({ field: 'name', order: 'asc' })
      expect(validateSort('date:desc', allowedFields)).toEqual({ field: 'date', order: 'desc' })
    })

    it('should default to desc order', () => {
      expect(validateSort('name', allowedFields)).toEqual({ field: 'name', order: 'desc' })
      expect(validateSort('name:invalid', allowedFields)).toEqual({ field: 'name', order: 'desc' })
    })

    it('should fallback to first allowed field for invalid field', () => {
      expect(validateSort('invalid:asc', allowedFields)).toEqual({ field: 'name', order: 'desc' })
    })
  })

  describe('InputValidator', () => {
    describe('required', () => {
      it('should add error for empty values', () => {
        const validator = new InputValidator()
        validator.required('field', '', 'Field')

        expect(validator.isValid()).toBe(false)
        expect(validator.getErrors().field).toBe('Field is required')
      })

      it('should add error for null/undefined', () => {
        const validator = new InputValidator()
        validator.required('field1', null, 'Field1')
        validator.required('field2', undefined, 'Field2')

        expect(validator.isValid()).toBe(false)
        expect(Object.keys(validator.getErrors()).length).toBe(2)
      })

      it('should not add error for valid values', () => {
        const validator = new InputValidator()
        validator.required('field', 'value')

        expect(validator.isValid()).toBe(true)
      })
    })

    describe('length', () => {
      it('should validate minimum length', () => {
        const validator = new InputValidator()
        validator.length('field', 'ab', 3)

        expect(validator.isValid()).toBe(false)
        expect(validator.getErrors().field).toContain('at least 3')
      })

      it('should validate maximum length', () => {
        const validator = new InputValidator()
        validator.length('field', 'abcdef', undefined, 5)

        expect(validator.isValid()).toBe(false)
        expect(validator.getErrors().field).toContain('at most 5')
      })

      it('should pass for valid length', () => {
        const validator = new InputValidator()
        validator.length('field', 'abcd', 2, 10)

        expect(validator.isValid()).toBe(true)
      })
    })

    describe('email', () => {
      it('should validate email format', () => {
        const validator = new InputValidator()
        validator.email('email', 'invalid')

        expect(validator.isValid()).toBe(false)
        expect(validator.getErrors().email).toContain('valid email')
      })

      it('should pass for valid email', () => {
        const validator = new InputValidator()
        validator.email('email', 'test@example.com')

        expect(validator.isValid()).toBe(true)
      })

      it('should skip validation for empty value', () => {
        const validator = new InputValidator()
        validator.email('email', '')

        expect(validator.isValid()).toBe(true)
      })
    })

    describe('url', () => {
      it('should validate URL format', () => {
        const validator = new InputValidator()
        validator.url('url', 'not-a-url')

        expect(validator.isValid()).toBe(false)
        expect(validator.getErrors().url).toContain('valid URL')
      })

      it('should pass for valid URL', () => {
        const validator = new InputValidator()
        validator.url('url', 'https://example.com')

        expect(validator.isValid()).toBe(true)
      })
    })

    describe('range', () => {
      it('should validate minimum value', () => {
        const validator = new InputValidator()
        validator.range('value', 5, 10)

        expect(validator.isValid()).toBe(false)
        expect(validator.getErrors().value).toContain('at least 10')
      })

      it('should validate maximum value', () => {
        const validator = new InputValidator()
        validator.range('value', 100, undefined, 50)

        expect(validator.isValid()).toBe(false)
        expect(validator.getErrors().value).toContain('at most 50')
      })

      it('should pass for valid range', () => {
        const validator = new InputValidator()
        validator.range('value', 25, 10, 50)

        expect(validator.isValid()).toBe(true)
      })
    })

    describe('custom', () => {
      it('should add error when validator returns false', () => {
        const validator = new InputValidator()
        validator.custom('field', () => false, 'Custom error')

        expect(validator.isValid()).toBe(false)
        expect(validator.getErrors().field).toBe('Custom error')
      })

      it('should pass when validator returns true', () => {
        const validator = new InputValidator()
        validator.custom('field', () => true, 'Custom error')

        expect(validator.isValid()).toBe(true)
      })
    })

    describe('chaining', () => {
      it('should support method chaining', () => {
        const validator = new InputValidator()
          .required('name', 'John')
          .length('name', 'John', 1, 50)
          .email('email', 'john@example.com')

        expect(validator.isValid()).toBe(true)
      })

      it('should accumulate multiple errors', () => {
        const validator = new InputValidator()
          .required('name', '')
          .email('email', 'invalid')
          .range('age', -5, 0)

        expect(validator.isValid()).toBe(false)
        expect(Object.keys(validator.getErrors()).length).toBe(3)
      })
    })
  })
})
