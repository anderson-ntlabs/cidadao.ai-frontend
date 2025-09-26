import DOMPurify from 'dompurify'

// Configure DOMPurify options
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
}

// Strict config for chat messages
const CHAT_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
  ALLOWED_ATTR: [],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
}

export class Sanitizer {
  private purify: typeof DOMPurify | null = null

  constructor() {
    // Initialize DOMPurify only in browser environment
    if (typeof window !== 'undefined') {
      this.purify = DOMPurify
    }
  }

  /**
   * Sanitize HTML content for display
   */
  sanitizeHtml(dirty: string, config = DOMPURIFY_CONFIG): string {
    if (!this.purify) {
      // Server-side: strip all HTML
      return this.stripHtml(dirty)
    }
    
    return this.purify.sanitize(dirty, config)
  }

  /**
   * Sanitize chat message content
   */
  sanitizeChatMessage(message: string): string {
    if (!this.purify) {
      return this.stripHtml(message)
    }
    
    // Use stricter config for chat
    return this.purify.sanitize(message, CHAT_CONFIG)
  }

  /**
   * Sanitize user input for forms
   */
  sanitizeInput(input: string): string {
    if (!input) return ''
    
    // Remove all HTML tags
    const stripped = this.stripHtml(input)
    
    // Remove potentially dangerous characters
    return stripped
      .replace(/[<>\"']/g, '') // Remove HTML-like characters
      .trim()
  }

  /**
   * Sanitize filename for uploads
   */
  sanitizeFilename(filename: string): string {
    if (!filename) return 'file'
    
    // Get file extension
    const parts = filename.split('.')
    const extension = parts.length > 1 ? `.${parts.pop()}` : ''
    const name = parts.join('.')
    
    // Sanitize name part
    const sanitized = name
      .replace(/[^a-zA-Z0-9-_]/g, '_') // Replace special chars with underscore
      .replace(/_+/g, '_') // Remove multiple underscores
      .substring(0, 100) // Limit length
    
    return sanitized + extension
  }

  /**
   * Sanitize URL
   */
  sanitizeUrl(url: string): string {
    if (!url) return ''
    
    try {
      const parsed = new URL(url)
      
      // Only allow http(s) protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return ''
      }
      
      return parsed.toString()
    } catch {
      return ''
    }
  }

  /**
   * Strip all HTML tags (fallback for server-side)
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, '') // Remove HTML entities
      .trim()
  }

  /**
   * Escape HTML for safe display
   */
  escapeHtml(unsafe: string): string {
    if (!unsafe) return ''
    
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  /**
   * Validate and sanitize JSON
   */
  sanitizeJson(jsonString: string): object | null {
    try {
      const parsed = JSON.parse(jsonString)
      
      // Remove any potentially dangerous keys
      const sanitized = this.deepSanitizeObject(parsed)
      
      return sanitized
    } catch {
      return null
    }
  }

  /**
   * Deep sanitize object (remove dangerous keys)
   */
  private deepSanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepSanitizeObject(item))
    }

    const sanitized: any = {}
    const dangerousKeys = ['__proto__', 'constructor', 'prototype']

    for (const key in obj) {
      if (obj.hasOwnProperty(key) && !dangerousKeys.includes(key)) {
        sanitized[key] = this.deepSanitizeObject(obj[key])
      }
    }

    return sanitized
  }
}

// Export singleton instance
export const sanitizer = new Sanitizer()