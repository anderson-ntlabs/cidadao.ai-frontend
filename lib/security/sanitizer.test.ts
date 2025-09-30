import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((input, config) => `sanitized:${input}`),
  },
}));

import { Sanitizer, sanitizer } from './sanitizer';
import DOMPurify from 'dompurify';

describe('Sanitizer', () => {
  let sanitizerInstance: Sanitizer;
  
  beforeEach(() => {
    vi.clearAllMocks();
    sanitizerInstance = new Sanitizer();
  });
  
  describe('constructor', () => {
    it('should initialize with DOMPurify in browser environment', () => {
      // Mock window
      global.window = {} as any;
      
      const browserSanitizer = new Sanitizer();
      expect(browserSanitizer['purify']).toBeTruthy();
      
      // Cleanup
      delete (global as any).window;
    });
    
    it('should initialize without DOMPurify in server environment', () => {
      // Ensure no window
      delete (global as any).window;
      
      const serverSanitizer = new Sanitizer();
      expect(serverSanitizer['purify']).toBeNull();
    });
  });
  
  describe('sanitizeHtml', () => {
    it('should use DOMPurify when available', () => {
      global.window = {} as any;
      const browserSanitizer = new Sanitizer();
      
      const result = browserSanitizer.sanitizeHtml('<p>Hello</p>');
      
      expect(DOMPurify.sanitize).toHaveBeenCalledWith('<p>Hello</p>', {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
      });
      expect(result).toBe('sanitized:<p>Hello</p>');
      
      delete (global as any).window;
    });
    
    it('should strip HTML when DOMPurify not available', () => {
      delete (global as any).window;
      const serverSanitizer = new Sanitizer();
      
      const result = serverSanitizer.sanitizeHtml('<p>Hello <b>World</b></p>');
      
      expect(result).toBe('Hello World');
    });
    
    it('should use custom config when provided', () => {
      global.window = {} as any;
      const browserSanitizer = new Sanitizer();
      const customConfig = { ALLOWED_TAGS: ['div'] };
      
      browserSanitizer.sanitizeHtml('<div>Test</div>', customConfig);
      
      expect(DOMPurify.sanitize).toHaveBeenCalledWith('<div>Test</div>', customConfig);
      
      delete (global as any).window;
    });
  });
  
  describe('sanitizeChatMessage', () => {
    it('should use stricter chat config with DOMPurify', () => {
      global.window = {} as any;
      const browserSanitizer = new Sanitizer();
      
      const result = browserSanitizer.sanitizeChatMessage('<p>Hello <script>alert(1)</script></p>');
      
      expect(DOMPurify.sanitize).toHaveBeenCalledWith('<p>Hello <script>alert(1)</script></p>', {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
        ALLOWED_ATTR: [],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
      });
      expect(result).toBe('sanitized:<p>Hello <script>alert(1)</script></p>');
      
      delete (global as any).window;
    });
    
    it('should strip HTML when DOMPurify not available', () => {
      delete (global as any).window;
      const serverSanitizer = new Sanitizer();
      
      const result = serverSanitizer.sanitizeChatMessage('<b>Bold</b> text');
      
      expect(result).toBe('Bold text');
    });
  });
  
  describe('sanitizeInput', () => {
    it('should return empty string for falsy input', () => {
      expect(sanitizerInstance.sanitizeInput('')).toBe('');
      expect(sanitizerInstance.sanitizeInput(null as any)).toBe('');
      expect(sanitizerInstance.sanitizeInput(undefined as any)).toBe('');
    });
    
    it('should strip HTML and dangerous characters', () => {
      const input = '<script>alert("XSS")</script>Normal text';
      const result = sanitizerInstance.sanitizeInput(input);
      
      expect(result).toBe('alert(XSS)Normal text');
    });
    
    it('should remove quotes and angle brackets', () => {
      const input = 'Test <tag> with "quotes" and \'apostrophes\'';
      const result = sanitizerInstance.sanitizeInput(input);
      
      expect(result).toBe('Test  with quotes and apostrophes');
    });
    
    it('should trim whitespace', () => {
      const input = '  Test with spaces  ';
      const result = sanitizerInstance.sanitizeInput(input);
      
      expect(result).toBe('Test with spaces');
    });
  });
  
  describe('sanitizeFilename', () => {
    it('should return default for empty filename', () => {
      expect(sanitizerInstance.sanitizeFilename('')).toBe('file');
      expect(sanitizerInstance.sanitizeFilename(null as any)).toBe('file');
    });
    
    it('should preserve file extension', () => {
      const result = sanitizerInstance.sanitizeFilename('my file.txt');
      expect(result).toBe('my_file.txt');
    });
    
    it('should handle multiple dots in filename', () => {
      const result = sanitizerInstance.sanitizeFilename('my.file.name.txt');
      expect(result).toBe('my_file_name.txt');
    });
    
    it('should handle filename without extension', () => {
      const result = sanitizerInstance.sanitizeFilename('myfile');
      expect(result).toBe('myfile');
    });
    
    it('should replace special characters with underscore', () => {
      const result = sanitizerInstance.sanitizeFilename('file@#$%^&*.txt');
      expect(result).toBe('file_.txt');
    });
    
    it('should remove multiple consecutive underscores', () => {
      const result = sanitizerInstance.sanitizeFilename('file___name.txt');
      expect(result).toBe('file_name.txt');
    });
    
    it('should limit filename length to 100 characters', () => {
      const longName = 'a'.repeat(150);
      const result = sanitizerInstance.sanitizeFilename(longName + '.txt');
      
      expect(result).toBe('a'.repeat(100) + '.txt');
    });
  });
  
  describe('sanitizeUrl', () => {
    it('should return empty string for falsy input', () => {
      expect(sanitizerInstance.sanitizeUrl('')).toBe('');
      expect(sanitizerInstance.sanitizeUrl(null as any)).toBe('');
    });
    
    it('should allow http URLs', () => {
      const url = 'http://example.com/path?query=value';
      const result = sanitizerInstance.sanitizeUrl(url);
      
      expect(result).toBe(url);
    });
    
    it('should allow https URLs', () => {
      const url = 'https://example.com/path';
      const result = sanitizerInstance.sanitizeUrl(url);
      
      expect(result).toBe(url);
    });
    
    it('should reject non-http protocols', () => {
      expect(sanitizerInstance.sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(sanitizerInstance.sanitizeUrl('file:///etc/passwd')).toBe('');
      expect(sanitizerInstance.sanitizeUrl('ftp://example.com')).toBe('');
    });
    
    it('should return empty string for invalid URLs', () => {
      expect(sanitizerInstance.sanitizeUrl('not a url')).toBe('');
      expect(sanitizerInstance.sanitizeUrl('http://')).toBe('');
    });
  });
  
  describe('escapeHtml', () => {
    it('should return empty string for falsy input', () => {
      expect(sanitizerInstance.escapeHtml('')).toBe('');
      expect(sanitizerInstance.escapeHtml(null as any)).toBe('');
    });
    
    it('should escape HTML entities', () => {
      const input = '<script>alert("XSS")</script>';
      const result = sanitizerInstance.escapeHtml(input);
      
      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });
    
    it('should escape ampersands', () => {
      expect(sanitizerInstance.escapeHtml('A & B')).toBe('A &amp; B');
    });
    
    it('should escape single quotes', () => {
      expect(sanitizerInstance.escapeHtml("It's a test")).toBe('It&#039;s a test');
    });
    
    it('should handle multiple escapes', () => {
      const input = '<p class="test" data-value=\'A&B\'>';
      const result = sanitizerInstance.escapeHtml(input);
      
      expect(result).toBe('&lt;p class=&quot;test&quot; data-value=&#039;A&amp;B&#039;&gt;');
    });
  });
  
  describe('sanitizeJson', () => {
    it('should parse valid JSON', () => {
      const json = '{"name": "test", "value": 123}';
      const result = sanitizerInstance.sanitizeJson(json);
      
      expect(result).toEqual({ name: 'test', value: 123 });
    });
    
    it('should return null for invalid JSON', () => {
      expect(sanitizerInstance.sanitizeJson('not json')).toBeNull();
      expect(sanitizerInstance.sanitizeJson('{invalid}')).toBeNull();
    });
    
    it('should remove dangerous keys', () => {
      const json = '{"name": "test", "__proto__": "bad", "constructor": "bad", "prototype": "bad"}';
      const result = sanitizerInstance.sanitizeJson(json);
      
      expect(result).toEqual({ name: 'test' });
    });
    
    it('should handle nested objects', () => {
      const json = '{"data": {"__proto__": "bad", "safe": "value"}}';
      const result = sanitizerInstance.sanitizeJson(json);
      
      expect(result).toEqual({ data: { safe: 'value' } });
    });
    
    it('should handle arrays', () => {
      const json = '[{"name": "test"}, {"__proto__": "bad", "value": 123}]';
      const result = sanitizerInstance.sanitizeJson(json);
      
      expect(result).toEqual([{ name: 'test' }, { value: 123 }]);
    });
  });
  
  describe('stripHtml', () => {
    it('should remove HTML tags', () => {
      // Access private method through instance
      const stripHtml = sanitizerInstance['stripHtml'].bind(sanitizerInstance);
      
      expect(stripHtml('<p>Hello <b>World</b></p>')).toBe('Hello World');
      expect(stripHtml('<script>alert(1)</script>Text')).toBe('alert(1)Text');
    });
    
    it('should remove HTML entities', () => {
      const stripHtml = sanitizerInstance['stripHtml'].bind(sanitizerInstance);
      
      expect(stripHtml('&lt;div&gt;')).toBe('div');
      expect(stripHtml('Hello &amp; World')).toBe('Hello  World');
    });
    
    it('should trim result', () => {
      const stripHtml = sanitizerInstance['stripHtml'].bind(sanitizerInstance);
      
      expect(stripHtml('  <p>Text</p>  ')).toBe('Text');
    });
  });
  
  describe('deepSanitizeObject', () => {
    it('should handle non-object values', () => {
      const deepSanitize = sanitizerInstance['deepSanitizeObject'].bind(sanitizerInstance);
      
      expect(deepSanitize('string')).toBe('string');
      expect(deepSanitize(123)).toBe(123);
      expect(deepSanitize(true)).toBe(true);
      expect(deepSanitize(null)).toBe(null);
    });
    
    it('should handle arrays', () => {
      const deepSanitize = sanitizerInstance['deepSanitizeObject'].bind(sanitizerInstance);
      
      const input = [1, { name: 'test', __proto__: 'bad' }, 'string'];
      const result = deepSanitize(input);
      
      expect(result).toEqual([1, { name: 'test' }, 'string']);
    });
    
    it('should handle nested objects', () => {
      const deepSanitize = sanitizerInstance['deepSanitizeObject'].bind(sanitizerInstance);
      
      const input = {
        level1: {
          level2: {
            safe: 'value',
            __proto__: 'bad',
          },
          constructor: 'bad',
        },
        prototype: 'bad',
      };
      
      const result = deepSanitize(input);
      
      expect(result).toEqual({
        level1: {
          level2: {
            safe: 'value',
          },
        },
      });
    });
    
    it('should preserve hasOwnProperty check', () => {
      const deepSanitize = sanitizerInstance['deepSanitizeObject'].bind(sanitizerInstance);
      
      const obj = Object.create({ inherited: 'value' });
      obj.own = 'property';
      
      const result = deepSanitize(obj);
      
      expect(result).toEqual({ own: 'property' });
      expect(result.inherited).toBeUndefined();
    });
  });
  
  describe('singleton instance', () => {
    it('should export a singleton sanitizer instance', () => {
      expect(sanitizer).toBeInstanceOf(Sanitizer);
    });
  });
});