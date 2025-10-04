/**
 * Tests for Edge Geographic Detector
 */

import { describe, it, expect } from 'vitest';
import {
  detectRegion,
  getBackendUrlForRegion,
  calculateDistance,
  findNearestRegion,
  getRegionDisplayName,
  type Region
} from './geo-detector';

describe('detectRegion', () => {
  it('should detect region from Vercel headers', () => {
    const request = new Request('https://app.cidadao.ai', {
      headers: {
        'x-vercel-ip-region': 'iad1',
        'x-vercel-ip-country': 'US',
        'x-vercel-ip-city': 'Washington',
        'x-vercel-ip-latitude': '38.9072',
        'x-vercel-ip-longitude': '-77.0369'
      }
    });

    const result = detectRegion(request);

    expect(result.region).toBe('us-east');
    expect(result.country).toBe('US');
    expect(result.city).toBe('Washington');
    expect(result.latitude).toBe(38.9072);
    expect(result.longitude).toBe(-77.0369);
    expect(result.confidence).toBe(1.0);
  });

  it('should handle missing Vercel headers with unknown region', () => {
    const request = new Request('https://app.cidadao.ai');

    const result = detectRegion(request);

    expect(result.region).toBe('unknown');
    expect(result.country).toBeUndefined();
    expect(result.city).toBeUndefined();
    expect(result.latitude).toBeUndefined();
    expect(result.longitude).toBeUndefined();
    expect(result.confidence).toBe(0.5);
  });

  it('should decode URI-encoded city names', () => {
    const request = new Request('https://app.cidadao.ai', {
      headers: {
        'x-vercel-ip-region': 'fra1',
        'x-vercel-ip-city': 'S%C3%A3o%20Paulo'
      }
    });

    const result = detectRegion(request);

    expect(result.city).toBe('São Paulo');
  });

  it('should handle European regions', () => {
    const request = new Request('https://app.cidadao.ai', {
      headers: {
        'x-vercel-ip-region': 'fra1',
        'x-vercel-ip-country': 'DE'
      }
    });

    const result = detectRegion(request);

    expect(result.region).toBe('eu-west');
    expect(result.country).toBe('DE');
  });

  it('should handle APAC regions', () => {
    const request = new Request('https://app.cidadao.ai', {
      headers: {
        'x-vercel-ip-region': 'sin1',
        'x-vercel-ip-country': 'SG'
      }
    });

    const result = detectRegion(request);

    expect(result.region).toBe('ap-south');
    expect(result.country).toBe('SG');
  });
});

describe('getBackendUrlForRegion', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return region-specific URL when available', () => {
    process.env.NEXT_PUBLIC_API_URL_US = 'https://us.api.cidadao.ai';
    process.env.NEXT_PUBLIC_API_URL = 'https://api.cidadao.ai';

    const url = getBackendUrlForRegion('us-east');

    expect(url).toBe('https://us.api.cidadao.ai');
  });

  it('should fallback to main API URL when region URL not set', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.cidadao.ai';

    const url = getBackendUrlForRegion('eu-west');

    expect(url).toBe('https://api.cidadao.ai');
  });

  it('should return main URL for unknown region', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.cidadao.ai';

    const url = getBackendUrlForRegion('unknown');

    expect(url).toBe('https://api.cidadao.ai');
  });
});

describe('calculateDistance', () => {
  it('should calculate distance between Washington DC and Frankfurt', () => {
    // Washington DC
    const lat1 = 38.9072;
    const lon1 = -77.0369;

    // Frankfurt
    const lat2 = 50.1109;
    const lon2 = 8.6821;

    const distance = calculateDistance(lat1, lon1, lat2, lon2);

    // Expected distance is approximately 6,500 km
    expect(distance).toBeGreaterThan(6400);
    expect(distance).toBeLessThan(6600);
  });

  it('should calculate distance between Singapore and Tokyo', () => {
    // Singapore
    const lat1 = 1.3521;
    const lon1 = 103.8198;

    // Tokyo
    const lat2 = 35.6762;
    const lon2 = 139.6503;

    const distance = calculateDistance(lat1, lon1, lat2, lon2);

    // Expected distance is approximately 5,300 km
    expect(distance).toBeGreaterThan(5200);
    expect(distance).toBeLessThan(5400);
  });

  it('should return zero for same coordinates', () => {
    const distance = calculateDistance(38.9072, -77.0369, 38.9072, -77.0369);

    expect(distance).toBe(0);
  });

  it('should handle antipodal points', () => {
    // Test with points on opposite sides of Earth
    const distance = calculateDistance(0, 0, 0, 180);

    // Half Earth's circumference is approximately 20,000 km
    expect(distance).toBeGreaterThan(19000);
    expect(distance).toBeLessThan(21000);
  });
});

describe('findNearestRegion', () => {
  it('should find us-east as nearest for New York coordinates', () => {
    // New York
    const lat = 40.7128;
    const lon = -74.0060;

    const region = findNearestRegion(lat, lon);

    expect(region).toBe('us-east');
  });

  it('should find eu-west as nearest for London coordinates', () => {
    // London
    const lat = 51.5074;
    const lon = -0.1278;

    const region = findNearestRegion(lat, lon);

    expect(region).toBe('eu-west');
  });

  it('should find ap-south as nearest for Singapore coordinates', () => {
    // Singapore
    const lat = 1.3521;
    const lon = 103.8198;

    const region = findNearestRegion(lat, lon);

    expect(region).toBe('ap-south');
  });

  it('should find ap-south as nearest for Sydney coordinates', () => {
    // Sydney
    const lat = -33.8688;
    const lon = 151.2093;

    const region = findNearestRegion(lat, lon);

    expect(region).toBe('ap-south');
  });

  it('should find us-east as nearest for São Paulo coordinates', () => {
    // São Paulo (closer to US East than EU or APAC)
    const lat = -23.5505;
    const lon = -46.6333;

    const region = findNearestRegion(lat, lon);

    expect(region).toBe('us-east');
  });
});

describe('getRegionDisplayName', () => {
  it('should return display name for us-east', () => {
    expect(getRegionDisplayName('us-east')).toBe('United States (East)');
  });

  it('should return display name for eu-west', () => {
    expect(getRegionDisplayName('eu-west')).toBe('Europe (West)');
  });

  it('should return display name for ap-south', () => {
    expect(getRegionDisplayName('ap-south')).toBe('Asia Pacific (South)');
  });

  it('should return display name for unknown', () => {
    expect(getRegionDisplayName('unknown')).toBe('Unknown Region');
  });
});
