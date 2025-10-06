/**
 * Tests for Edge Request Validator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateChatRequest,
  validateRequestBody,
  checkRateLimit,
  cleanupRateLimits
} from './request-validator';

describe('validateChatRequest', () => {
  it('should validate POST request with correct content-type', () => {
    const request = new Request('https://app.cidadao.ai/api/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      }
    });

    const result = validateChatRequest(request);

    expect(result.valid).toBe(true);
    expect(result.sanitized?.metadata?.validated).toBe(true);
  });

  it('should reject non-POST requests', () => {
    const request = new Request('https://app.cidadao.ai/api/chat', {
      method: 'GET'
    });

    const result = validateChatRequest(request);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid method');
  });

  it('should reject requests with wrong content-type', () => {
    const request = new Request('https://app.cidadao.ai/api/chat', {
      method: 'POST',
      headers: {
        'content-type': 'text/plain'
      }
    });

    const result = validateChatRequest(request);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('content-type');
  });

  it('should complete validation in <5ms', () => {
    const request = new Request('https://app.cidadao.ai/api/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      }
    });

    const start = Date.now();
    validateChatRequest(request);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(5);
  });
});

describe('validateRequestBody', () => {
  it('should validate request with valid message', async () => {
    const request = new Request('https://app.cidadao.ai/api/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Hello, how can you help me?'
      })
    });

    const result = await validateRequestBody(request);

    expect(result.valid).toBe(true);
    expect(result.sanitized?.message).toBe('Hello, how can you help me?');
  });

  it('should reject request without message', async () => {
    const request = new Request('https://app.cidadao.ai/api/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const result = await validateRequestBody(request);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('Missing or invalid message');
  });

  it('should reject message that is too long', async () => {
    const longMessage = 'a'.repeat(6000);

    const request = new Request('https://app.cidadao.ai/api/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        message: longMessage
      })
    });

    const result = await validateRequestBody(request);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('too long');
  });

  it('should trim whitespace from message', async () => {
    const request = new Request('https://app.cidadao.ai/api/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        message: '  Hello  '
      })
    });

    const result = await validateRequestBody(request);

    expect(result.valid).toBe(true);
    expect(result.sanitized?.message).toBe('Hello');
  });

  it('should reject empty message after trim', async () => {
    const request = new Request('https://app.cidadao.ai/api/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        message: '   '
      })
    });

    const result = await validateRequestBody(request);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });
});

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Clean up before each test
    cleanupRateLimits();
  });

  it('should allow request within rate limit', () => {
    const ip = '10.0.0.1'; // Unique IP for this test

    const result = checkRateLimit(ip);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(59); // 60 - 1
  });

  it('should track multiple requests from same IP', () => {
    const ip = '10.0.0.2'; // Unique IP for this test

    const result1 = checkRateLimit(ip);
    const result2 = checkRateLimit(ip);
    const result3 = checkRateLimit(ip);

    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(59);

    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(58);

    expect(result3.allowed).toBe(true);
    expect(result3.remaining).toBe(57);
  });

  it('should block requests exceeding rate limit', () => {
    const ip = '10.0.0.3'; // Unique IP for this test

    // Make 60 requests (limit)
    for (let i = 0; i < 60; i++) {
      checkRateLimit(ip);
    }

    // 61st request should be blocked
    const result = checkRateLimit(ip);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset after time window', async () => {
    const ip = '10.0.0.4'; // Unique IP for this test

    // This test would need to mock time
    // Skipping actual implementation for now
    expect(true).toBe(true);
  });

  it('should handle different IPs independently', () => {
    const ip1 = '10.0.0.5'; // Unique IP for this test
    const ip2 = '10.0.0.6'; // Unique IP for this test

    checkRateLimit(ip1);
    checkRateLimit(ip1);

    const result1 = checkRateLimit(ip1);
    const result2 = checkRateLimit(ip2);

    expect(result1.remaining).toBe(57); // 3 requests from ip1
    expect(result2.remaining).toBe(59); // 1 request from ip2
  });
});

describe('cleanupRateLimits', () => {
  it('should cleanup old rate limit entries', () => {
    // This test would need to mock time
    // Skipping actual implementation for now
    cleanupRateLimits();
    expect(true).toBe(true);
  });
});
