/**
 * Geographic Detection for Edge Functions
 *
 * Detects user's geographic region from request headers
 * Used for intelligent routing and caching
 */

export type Region = 'us-east' | 'eu-west' | 'ap-south' | 'unknown';

export interface GeoLocation {
  region: Region;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  confidence: number;
}

/**
 * Detect user's region from Vercel headers
 * Vercel provides geo information in request headers
 */
export function detectRegion(request: Request): GeoLocation {
  const headers = request.headers;

  // Vercel geo headers
  // https://vercel.com/docs/edge-network/headers#request-headers
  const vercelRegion = headers.get('x-vercel-ip-region');
  const vercelCountry = headers.get('x-vercel-ip-country');
  const vercelCity = headers.get('x-vercel-ip-city');
  const vercelLatitude = headers.get('x-vercel-ip-latitude');
  const vercelLongitude = headers.get('x-vercel-ip-longitude');

  // Map Vercel regions to our regions
  const region = mapVercelRegion(vercelRegion);

  return {
    region,
    country: vercelCountry || undefined,
    city: vercelCity ? decodeURIComponent(vercelCity) : undefined,
    latitude: vercelLatitude ? parseFloat(vercelLatitude) : undefined,
    longitude: vercelLongitude ? parseFloat(vercelLongitude) : undefined,
    confidence: vercelRegion ? 1.0 : 0.5
  };
}

/**
 * Map Vercel region codes to our simplified regions
 */
function mapVercelRegion(vercelRegion: string | null): Region {
  if (!vercelRegion) return 'unknown';

  // Vercel region codes: https://vercel.com/docs/edge-network/regions
  const regionMap: Record<string, Region> = {
    // US regions
    'iad1': 'us-east',  // Washington, D.C., USA
    'dfw1': 'us-east',  // Dallas, USA
    'sfo1': 'us-east',  // San Francisco, USA
    'pdx1': 'us-east',  // Portland, USA

    // EU regions
    'fra1': 'eu-west',  // Frankfurt, Germany
    'lhr1': 'eu-west',  // London, UK
    'ams1': 'eu-west',  // Amsterdam, Netherlands
    'cdg1': 'eu-west',  // Paris, France

    // APAC regions
    'sin1': 'ap-south', // Singapore
    'hkg1': 'ap-south', // Hong Kong
    'syd1': 'ap-south', // Sydney, Australia
    'icn1': 'ap-south', // Seoul, South Korea
    'nrt1': 'ap-south', // Tokyo, Japan
  };

  return regionMap[vercelRegion] || 'unknown';
}

/**
 * Get backend URL for region
 * Routes to nearest backend instance
 */
export function getBackendUrlForRegion(region: Region): string {
  const backendUrls: Record<Region, string> = {
    'us-east': process.env.NEXT_PUBLIC_API_URL_US || process.env.NEXT_PUBLIC_API_URL || '',
    'eu-west': process.env.NEXT_PUBLIC_API_URL_EU || process.env.NEXT_PUBLIC_API_URL || '',
    'ap-south': process.env.NEXT_PUBLIC_API_URL_AP || process.env.NEXT_PUBLIC_API_URL || '',
    'unknown': process.env.NEXT_PUBLIC_API_URL || ''
  };

  return backendUrls[region];
}

/**
 * Calculate distance between two points (Haversine formula)
 * Used for finding nearest backend
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find nearest region to user
 * Fallback method if Vercel headers not available
 */
export function findNearestRegion(
  userLat: number,
  userLon: number
): Region {
  const regionCoordinates: Record<Region, { lat: number; lon: number }> = {
    'us-east': { lat: 38.9072, lon: -77.0369 },  // Washington DC
    'eu-west': { lat: 50.1109, lon: 8.6821 },    // Frankfurt
    'ap-south': { lat: 1.3521, lon: 103.8198 },  // Singapore
    'unknown': { lat: 0, lon: 0 }
  };

  let nearestRegion: Region = 'unknown';
  let minDistance = Infinity;

  Object.entries(regionCoordinates).forEach(([region, coords]) => {
    if (region === 'unknown') return;

    const distance = calculateDistance(
      userLat,
      userLon,
      coords.lat,
      coords.lon
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestRegion = region as Region;
    }
  });

  return nearestRegion;
}

/**
 * Get region name for display
 */
export function getRegionDisplayName(region: Region): string {
  const displayNames: Record<Region, string> = {
    'us-east': 'United States (East)',
    'eu-west': 'Europe (West)',
    'ap-south': 'Asia Pacific (South)',
    'unknown': 'Unknown Region'
  };

  return displayNames[region];
}
