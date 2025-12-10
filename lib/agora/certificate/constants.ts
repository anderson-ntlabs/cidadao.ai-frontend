/**
 * Certificate Module Constants
 *
 * Shared constants for certificate and report generation.
 *
 * Author: Anderson Henrique da Silva
 * Created: 2025-12-10
 */

/**
 * localStorage keys for progress tracking
 */
export const STORAGE_KEYS = {
  VIDEO_PROGRESS: 'agora_demo_video_progress',
  READING_PROGRESS: 'agora_demo_reading_progress',
} as const

/**
 * Video durations in seconds
 */
export const VIDEO_DURATIONS = {
  /** Required videos (IDs 1, 2, 3) */
  REQUIRED: [720, 2100, 7200] as const,
  /** All available videos */
  ALL: [
    720, 2100, 7200, 2400, 3000, 1800, 2400, 4500, 3000, 2400, 2400, 7200, 1200, 3600, 2700,
  ] as const,
} as const

/**
 * IDs of required content for certificate
 */
export const REQUIRED_CONTENT_IDS = {
  VIDEOS: ['1', '2', '3'] as string[],
  READINGS: ['1', '2'] as string[],
} as const

/**
 * PDF color palette (RGB tuples)
 */
export const PDF_COLORS = {
  // Primary greens
  GREEN_800: [22, 101, 52] as const,
  GREEN_600: [22, 163, 74] as const,
  GREEN_500: [34, 197, 94] as const,
  GREEN_200: [187, 247, 208] as const,
  GREEN_50: [240, 253, 244] as const,

  // Blues
  BLUE_800: [30, 64, 175] as const,
  BLUE_600: [37, 99, 235] as const,
  BLUE_500: [59, 130, 246] as const,
  BLUE_300: [147, 197, 253] as const,
  BLUE_50: [239, 246, 255] as const,

  // Purples
  PURPLE_800: [107, 33, 168] as const,
  PURPLE_500: [168, 85, 247] as const,
  PURPLE_200: [233, 213, 255] as const,
  PURPLE_50: [250, 245, 255] as const,

  // Oranges
  ORANGE_500: [249, 115, 22] as const,

  // Pinks
  PINK_500: [236, 72, 153] as const,

  // Yellows
  YELLOW_500: [255, 193, 7] as const,

  // Grays
  GRAY_800: [31, 41, 55] as const,
  GRAY_700: [55, 65, 81] as const,
  GRAY_600: [75, 85, 99] as const,
  GRAY_500: [107, 114, 128] as const,
  GRAY_400: [156, 163, 175] as const,
  GRAY_300: [203, 213, 225] as const,
  GRAY_200: [229, 231, 235] as const,
  GRAY_100: [243, 244, 246] as const,
  GRAY_50: [248, 250, 252] as const,

  // Background
  WHITE: [255, 255, 255] as const,
  LIGHT_BG: [250, 252, 255] as const,
} as const

/**
 * PDF styling configuration
 */
export const PDF_STYLES = {
  MARGIN: 20,
  HEADER_HEIGHT: 40,
  BAR_HEIGHT: 18,
  BAR_SPACING: 38,
  BORDER_RADIUS: {
    SMALL: 2,
    MEDIUM: 3,
    LARGE: 5,
  },
  LINE_WIDTH: {
    THIN: 0.3,
    NORMAL: 0.5,
    MEDIUM: 0.8,
    THICK: 1,
    HEAVY: 1.5,
    EXTRA: 2,
    BORDER: 3,
  },
  FONT_SIZE: {
    TINY: 7,
    SMALL: 8,
    CAPTION: 9,
    BODY: 10,
    SUBHEADING: 11,
    HEADING: 12,
    TITLE: 16,
    LARGE_TITLE: 18,
    DISPLAY: 20,
    HERO: 22,
    HUGE: 24,
    MASSIVE: 26,
    NAME: 30,
  },
} as const

/**
 * UI color class mappings
 */
export const UI_COLOR_CLASSES: Record<string, string> = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
}
