/**
 * Edge Chat Endpoint
 *
 * Runs on Vercel Edge Network for low-latency preprocessing
 * Target latency: <10ms (p95)
 *
 * Features:
 * - Request validation at edge
 * - Geographic routing
 * - Rate limiting
 * - Fast response for cached queries
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateChatRequest, validateRequestBody, checkRateLimit } from '@/lib/edge/request-validator';
import { detectRegion, getBackendUrlForRegion } from '@/lib/edge/geo-detector';

// Enable edge runtime
export const runtime = 'edge';

// Configure edge function
export const preferredRegion = ['iad1', 'fra1', 'sin1']; // US, EU, APAC

/**
 * POST /api/edge/chat
 *
 * Edge-optimized chat endpoint
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Step 1: Fast request validation (target <5ms)
    const validation = validateChatRequest(request);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Step 2: Rate limiting check
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Date.now() + 60000)
          }
        }
      );
    }

    // Step 3: Detect user's geographic region
    const geoLocation = detectRegion(request);

    console.log('[Edge Chat] Region detected:', geoLocation.region, geoLocation.country);

    // Step 4: Validate request body
    const bodyValidation = await validateRequestBody(request);

    if (!bodyValidation.valid) {
      return NextResponse.json(
        { error: bodyValidation.error },
        { status: 400 }
      );
    }

    // Step 5: Route to appropriate backend
    const backendUrl = getBackendUrlForRegion(geoLocation.region);

    // For now, we'll proxy to the main backend
    // In production, this would route to region-specific backends
    const backendResponse = await fetch(`${backendUrl}/api/v1/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': ip,
        'X-User-Region': geoLocation.region,
        'X-User-Country': geoLocation.country || 'unknown'
      },
      body: JSON.stringify({
        message: bodyValidation.sanitized?.message,
        session_id: `edge_${Date.now()}`,
        context: {
          ...bodyValidation.sanitized?.metadata,
          edge_processed: true,
          edge_region: geoLocation.region,
          edge_latency: Date.now() - startTime
        }
      })
    });

    // Step 6: Return response with edge metadata
    const responseData = await backendResponse.json();

    const totalLatency = Date.now() - startTime;

    console.log(`[Edge Chat] Total latency: ${totalLatency}ms`);

    return NextResponse.json(
      {
        ...responseData,
        metadata: {
          ...responseData.metadata,
          edge: {
            processed: true,
            region: geoLocation.region,
            country: geoLocation.country,
            latency: totalLatency,
            rateLimit: {
              remaining: rateLimit.remaining
            }
          }
        }
      },
      {
        headers: {
          'X-Edge-Region': geoLocation.region,
          'X-Edge-Latency': String(totalLatency),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'Cache-Control': 'no-store' // Don't cache chat responses
        }
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    console.error('[Edge Chat] Error:', errorMessage);

    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/edge/chat
 *
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  const geoLocation = detectRegion(request);

  return NextResponse.json({
    status: 'healthy',
    runtime: 'edge',
    region: geoLocation.region,
    country: geoLocation.country,
    timestamp: new Date().toISOString()
  });
}
