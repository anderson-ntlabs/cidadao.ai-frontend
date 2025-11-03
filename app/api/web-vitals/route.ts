import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals API]', body)
    }

    // In production, you would send this to your analytics service
    // Example: Google Analytics, Vercel Analytics, custom backend
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GA_ID) {
      // Send to Google Analytics
      const _ga4Event = {
        client_id: 'web-vitals',
        events: [
          {
            name: 'web_vitals',
            params: {
              metric_name: body.name,
              metric_value: body.value,
              metric_rating: body.rating,
              metric_delta: body.delta,
              page_url: body.url,
            },
          },
        ],
      }

      // This would be your actual GA4 Measurement Protocol endpoint
      // await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.NEXT_PUBLIC_GA_ID}`, {
      //   method: 'POST',
      //   body: JSON.stringify(ga4Event)
      // });
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Web Vitals API Error]', error)
    return NextResponse.json({ error: 'Failed to process metrics' }, { status: 500 })
  }
}
