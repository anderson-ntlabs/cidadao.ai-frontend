/**
 * Analytics Tracking API Route
 *
 * Receives usability events from the frontend and stores them in Supabase
 * for research purposes.
 *
 * Privacy: Only stores anonymized data with user consent
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface AnalyticsEvent {
  event_type: string
  event_category: string
  has_research_consent?: boolean
  session_id?: string
  page_path?: string
  element_clicked?: string
  agent_used?: string
  interaction_type?: string
  duration_ms?: number
  time_on_page?: number
  steps_taken?: number
  device_type?: string
  screen_width?: number
  screen_height?: number
  is_demo_mode?: boolean
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const event = (await request.json()) as AnalyticsEvent

    // Validate required fields
    if (!event.event_type || !event.event_category) {
      return NextResponse.json(
        { error: 'Missing required fields: event_type, event_category' },
        { status: 400 }
      )
    }

    // Only store if user has research consent
    if (!event.has_research_consent) {
      return NextResponse.json(
        { success: true, message: 'Event not stored (no consent)' },
        { status: 200 }
      )
    }

    // Get Supabase client
    const supabase = await createClient()

    // Get authenticated user (if any)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Hash user ID for anonymization
    let userHash = null
    if (user?.id) {
      userHash = await hashString(user.id)
    }

    // Get browser info from headers
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const browser = extractBrowser(userAgent)

    // Prepare event data
    const eventData = {
      // Event identification
      event_type: event.event_type,
      event_category: event.event_category,

      // Anonymized user data
      session_id: event.session_id,
      user_hash: userHash,

      // Event data
      page_path: event.page_path,
      element_clicked: event.element_clicked,
      agent_used: event.agent_used,
      interaction_type: event.interaction_type,

      // Performance metrics
      duration_ms: event.duration_ms,
      time_on_page: event.time_on_page,
      steps_taken: event.steps_taken,

      // Context
      device_type: event.device_type,
      browser: browser,
      screen_width: event.screen_width,
      screen_height: event.screen_height,

      // Flags
      is_demo_mode: event.is_demo_mode || false,
      is_authenticated: !!user,
      has_research_consent: true,

      // Timestamp
      created_at: new Date().toISOString(),
    }

    // Insert into Supabase
    const { error: insertError } = await supabase.from('usability_events').insert([eventData])

    if (insertError) {
      console.error('[Analytics API] Supabase insert error:', insertError)
      return NextResponse.json({ error: 'Failed to store event' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully',
    })
  } catch (error) {
    console.error('[Analytics API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Hash string using SHA-256 (for user ID anonymization)
 */
async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Extract browser name from User-Agent
 */
function extractBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Edge')) return 'Edge'
  if (userAgent.includes('Opera')) return 'Opera'
  return 'Other'
}

// Allow only POST requests
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
