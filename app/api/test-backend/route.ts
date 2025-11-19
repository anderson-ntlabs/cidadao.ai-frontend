import { NextResponse } from 'next/server'

interface TestResult {
  url: string
  endpoint: string
  status?: number
  ok?: boolean
  error?: string
}

interface SuccessResponse {
  success: true
  workingUrl: string
  results: TestResult[]
}

interface ErrorResponse {
  success: false
  message: string
  results: TestResult[]
}

export async function GET(): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  const possibleUrls = [
    'https://cidadao-api-production.up.railway.app',
    'https://neuralthinker-cidadaoaibackend.hf.space',
    'https://neural-thinker.cidadao-ai-backend.hf.space',
    'https://neural-thinker-cidadaoai-backend.hf.space',
  ]

  const results: TestResult[] = []

  for (const url of possibleUrls) {
    try {
      // Test health endpoint
      const healthResponse = await fetch(`${url}/health`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })

      results.push({
        url,
        endpoint: '/health',
        status: healthResponse.status,
        ok: healthResponse.ok,
      })

      // Test docs endpoint
      const docsResponse = await fetch(`${url}/docs`, {
        method: 'GET',
        headers: {
          Accept: 'text/html',
        },
      })

      results.push({
        url,
        endpoint: '/docs',
        status: docsResponse.status,
        ok: docsResponse.ok,
      })

      // If we found a working URL, save it
      if (healthResponse.ok || docsResponse.ok) {
        return NextResponse.json({
          success: true,
          workingUrl: url,
          results,
        })
      }
    } catch (error) {
      results.push({
        url,
        endpoint: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    success: false,
    message: 'No working backend URL found',
    results,
  })
}
