/**
 * Blur placeholder data URLs for images
 *
 * These base64-encoded tiny images are used as blur placeholders
 * while the full images load, improving perceived performance.
 *
 * Generated using: https://blurha.sh or https://plaiceholder.co
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-11-11
 */

// Generic blur placeholders (1x1 solid colors based on image dominant color)
export const blurDataUrls = {
  // Hero background (Operários) - warm brown tone
  'operarios.png':
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',

  // Tarsila Antropofagia - vibrant colors
  'images/Tarsila_Antropofagia.jpg':
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',

  // Agent avatars - neutral gray
  'agents/default':
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8c+ZMPQAGfgKBP3jq6AAAAABJRU5ErkJggg==',
} as const

/**
 * Get blur data URL for an image
 * @param imagePath - Path to the image
 * @returns Base64 blur data URL or undefined
 */
export function getBlurDataUrl(imagePath: string): string | undefined {
  return blurDataUrls[imagePath as keyof typeof blurDataUrls]
}

/**
 * Shimmer effect for loading state
 * Can be used as placeholder while images load
 */
export const shimmerDataUrl =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJnIj4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iI2YzZjNmMyIgb2Zmc2V0PSIyMCUiIC8+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNlOGU4ZTgiIG9mZnNldD0iNTAlIiAvPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjZjNmM2YzIiBvZmZzZXQ9IjcwJSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI3MDAiIGhlaWdodD0iNDc1IiBmaWxsPSIjZjNmM2YzIiAvPgogIDxyZWN0IGlkPSJyIiB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgZmlsbD0idXJsKCNnKSIgLz4KICA8YW5pbWF0ZSB4bGluazpocmVmPSIjciIgYXR0cmlidXRlTmFtZT0ieCIgZnJvbT0iLTcwMCIgdG89IjcwMCIgZHVyPSIxcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiICAvPgo8L3N2Zz4='
