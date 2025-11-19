/**
 * CSP Report Endpoint
 *
 * Receives and logs Content Security Policy violation reports
 */

import { NextRequest, NextResponse } from 'next/server'
import { captureMessage } from '@/lib/monitoring/sentry.config'
import { createLogger } from '@/lib/logger'

const logger = createLogger('CSPReport')

export const runtime = 'edge'

interface CSPReport {
  'csp-report': {
    'document-uri': string
    referrer?: string
    'violated-directive': string
    'effective-directive': string
    'original-policy': string
    disposition: string
    'blocked-uri': string
    'line-number'?: number
    'column-number'?: number
    'source-file'?: string
    'status-code'?: number
    'script-sample'?: string
  }
}

/**
 * POST /api/security/csp-report
 *
 * Receive CSP violation reports
 */
export async function POST(request: NextRequest): Promise<NextResponse<{ error: string } | null>> {
  try {
    const report = (await request.json()) as CSPReport
    const violation = report['csp-report']

    // Log violation to console in development
    if (process.env.NODE_ENV === 'development') {
      logger.warn('CSP Violation', {
        directive: violation['violated-directive'],
        blockedUri: violation['blocked-uri'],
        sourceFile: violation['source-file'],
        lineNumber: violation['line-number'],
      })
    }

    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      captureMessage(`CSP Violation: ${violation['violated-directive']}`, 'warning', {
        csp: {
          directive: violation['violated-directive'],
          blockedUri: violation['blocked-uri'],
          documentUri: violation['document-uri'],
          sourceFile: violation['source-file'],
          lineNumber: violation['line-number'],
        },
      })
    }

    // Return 204 No Content (standard for CSP reports)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    logger.error('Error processing CSP report', error)

    // Return 400 for malformed reports
    return NextResponse.json({ error: 'Invalid CSP report format' }, { status: 400 })
  }
}
