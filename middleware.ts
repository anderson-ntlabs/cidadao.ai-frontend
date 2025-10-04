import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { detectRegion } from '@/lib/edge/geo-detector'

export async function middleware(request: NextRequest) {
  // Edge optimization: Add geo headers
  const geoLocation = detectRegion(request);

  // Update session (Supabase auth)
  const response = await updateSession(request);

  // Add custom geo headers to response
  response.headers.set('X-User-Region', geoLocation.region);
  if (geoLocation.country) {
    response.headers.set('X-User-Country', geoLocation.country);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}