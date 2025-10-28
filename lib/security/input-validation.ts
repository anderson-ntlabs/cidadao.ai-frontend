/**
 * Input Validation & Sanitization
 *
 * Comprehensive input validation to prevent injection attacks
 */

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(input: string): string {
  if (!input) return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format and protocol
 */
export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars
    .replace(/\.{2,}/g, '.') // Prevent double dots
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
}

/**
 * Validate and sanitize investigation ID
 */
export function isValidInvestigationId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;

  // UUID v4 format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  // Custom session formats: maritaca_, session_, smart_, etc.
  const customSessionRegex = /^(maritaca|session|smart|chat)_[0-9]+(_[a-z0-9]+)?$/i;

  return uuidRegex.test(id) || customSessionRegex.test(id);
}

/**
 * Validate language code
 */
export function isValidLanguage(lang: string): lang is 'pt' | 'en' {
  return ['pt', 'en'].includes(lang);
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';

  return query
    .trim()
    .replace(/[<>]/g, '') // Remove HTML-like chars
    .replace(/['"]/g, '') // Remove quotes
    .substring(0, 200); // Limit length
}

/**
 * Validate CPF (Brazilian tax ID)
 */
export function isValidCPF(cpf: string): boolean {
  // Remove non-digits
  const digits = cpf.replace(/\D/g, '');

  // Check length
  if (digits.length !== 11) return false;

  // Check for known invalid CPFs
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i)) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;
  if (checkDigit !== parseInt(digits.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i)) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) checkDigit = 0;
  if (checkDigit !== parseInt(digits.charAt(10))) return false;

  return true;
}

/**
 * Validate CNPJ (Brazilian company ID)
 */
export function isValidCNPJ(cnpj: string): boolean {
  // Remove non-digits
  const digits = cnpj.replace(/\D/g, '');

  // Check length
  if (digits.length !== 14) return false;

  // Check for known invalid CNPJs
  if (/^(\d)\1{13}$/.test(digits)) return false;

  // Validate first check digit
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (checkDigit !== parseInt(digits.charAt(12))) return false;

  // Validate second check digit
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (checkDigit !== parseInt(digits.charAt(13))) return false;

  return true;
}

/**
 * Validate monetary amount
 */
export function isValidAmount(amount: string | number): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && isFinite(num) && num >= 0;
}

/**
 * Validate date string
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate date range
 */
export function isValidDateRange(start: string, end: string): boolean {
  if (!isValidDate(start) || !isValidDate(end)) return false;
  return new Date(start) <= new Date(end);
}

/**
 * Sanitize JSON input
 */
export function sanitizeJSON(input: string): string | null {
  try {
    // Parse and re-stringify to remove potentially malicious content
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed);
  } catch {
    return null;
  }
}

/**
 * Validate agent ID
 */
export function isValidAgentId(agentId: string): boolean {
  const validAgents = [
    'abaporu',
    'zumbi',
    'anita',
    'tiradentes',
    'dandara',
    'lampiao',
    'maria-quiteria',
    'senna',
    'nana',
    'bonifacio',
    'machado',
    'niemeyer',
    'drummond',
    'carolina',
    'pixinguinha',
    'portinari',
    'santos-dumont',
  ];

  return validAgents.includes(agentId.toLowerCase());
}

/**
 * Validate pagination parameters
 */
export function validatePagination(params: {
  page?: string | number;
  limit?: string | number;
}): {
  page: number;
  limit: number;
} {
  const page = Math.max(
    1,
    parseInt(String(params.page || 1), 10) || 1
  );
  const limit = Math.min(
    100,
    Math.max(1, parseInt(String(params.limit || 10), 10) || 10)
  );

  return { page, limit };
}

/**
 * Validate sort parameters
 */
export function validateSort(
  sort: string,
  allowedFields: string[]
): { field: string; order: 'asc' | 'desc' } {
  const [field, order] = sort.split(':');

  if (!allowedFields.includes(field)) {
    return { field: allowedFields[0], order: 'desc' };
  }

  return {
    field,
    order: order === 'asc' ? 'asc' : 'desc',
  };
}

/**
 * Comprehensive input validator
 */
export class InputValidator {
  private errors: Map<string, string> = new Map();

  /**
   * Add validation error
   */
  addError(field: string, message: string): void {
    this.errors.set(field, message);
  }

  /**
   * Check if validation passed
   */
  isValid(): boolean {
    return this.errors.size === 0;
  }

  /**
   * Get all errors
   */
  getErrors(): Record<string, string> {
    return Object.fromEntries(this.errors);
  }

  /**
   * Validate required field
   */
  required(field: string, value: any, fieldName?: string): this {
    if (value === null || value === undefined || value === '') {
      this.addError(
        field,
        `${fieldName || field} is required`
      );
    }
    return this;
  }

  /**
   * Validate string length
   */
  length(
    field: string,
    value: string,
    min?: number,
    max?: number
  ): this {
    if (min !== undefined && value.length < min) {
      this.addError(
        field,
        `${field} must be at least ${min} characters`
      );
    }
    if (max !== undefined && value.length > max) {
      this.addError(
        field,
        `${field} must be at most ${max} characters`
      );
    }
    return this;
  }

  /**
   * Validate email
   */
  email(field: string, value: string): this {
    if (value && !isValidEmail(value)) {
      this.addError(field, `${field} must be a valid email`);
    }
    return this;
  }

  /**
   * Validate URL
   */
  url(field: string, value: string): this {
    if (value && !isValidURL(value)) {
      this.addError(field, `${field} must be a valid URL`);
    }
    return this;
  }

  /**
   * Validate number range
   */
  range(field: string, value: number, min?: number, max?: number): this {
    if (min !== undefined && value < min) {
      this.addError(field, `${field} must be at least ${min}`);
    }
    if (max !== undefined && value > max) {
      this.addError(field, `${field} must be at most ${max}`);
    }
    return this;
  }

  /**
   * Custom validation
   */
  custom(
    field: string,
    validator: () => boolean,
    message: string
  ): this {
    if (!validator()) {
      this.addError(field, message);
    }
    return this;
  }
}
