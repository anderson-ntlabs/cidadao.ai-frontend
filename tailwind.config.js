/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        // Brazil gradient tokens - standardized across the app
        'gradient-brazil': 'linear-gradient(90deg, #16a34a 0%, #eab308 50%, #2563eb 100%)',
        'gradient-brazil-reverse': 'linear-gradient(90deg, #2563eb 0%, #eab308 50%, #16a34a 100%)',
        'gradient-brazil-vertical':
          'linear-gradient(180deg, #16a34a 0%, #eab308 50%, #2563eb 100%)',
        'gradient-brazil-subtle':
          'linear-gradient(90deg, rgba(22,163,74,0.1) 0%, rgba(234,179,8,0.1) 50%, rgba(37,99,235,0.1) 100%)',
        'gradient-brazil-dark': 'linear-gradient(90deg, #15803d 0%, #ca8a04 50%, #1d4ed8 100%)',
        // Simplified two-color gradients (most common usage)
        'gradient-green-blue': 'linear-gradient(90deg, #16a34a 0%, #2563eb 100%)',
        'gradient-green-blue-dark': 'linear-gradient(90deg, #15803d 0%, #1d4ed8 100%)',
      },
      colors: {
        // Existing shadcn/ui colors
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        // New Design System v2 colors
        brand: {
          green: {
            500: 'var(--cidadao-green-500)',
            600: 'var(--cidadao-green-600)',
            700: 'var(--cidadao-green-700)',
          },
          blue: {
            500: 'var(--cidadao-blue-500)',
            600: 'var(--cidadao-blue-600)',
            700: 'var(--cidadao-blue-700)',
          },
          yellow: {
            500: 'var(--cidadao-yellow-500)',
            600: 'var(--cidadao-yellow-600)',
          },
          purple: {
            600: 'var(--cidadao-purple-600)',
          },
          red: {
            600: 'var(--cidadao-red-600)',
          },
        },
        // Tarsila do Amaral palette (Brazilian Modernism)
        tarsila: {
          amarelo: 'hsl(var(--tarsila-amarelo))',
          ocre: 'hsl(var(--tarsila-ocre))',
          terra: 'hsl(var(--tarsila-terra))',
          verde: 'hsl(var(--tarsila-verde))',
          azul: 'hsl(var(--tarsila-azul))',
          laranja: 'hsl(var(--tarsila-laranja))',
          rosa: 'hsl(var(--tarsila-rosa))',
          creme: 'hsl(var(--tarsila-creme))',
        },
        // Academy (Ágora) theme colors
        academy: {
          bg: 'hsl(var(--academy-bg))',
          'bg-secondary': 'hsl(var(--academy-bg-secondary))',
          card: 'hsl(var(--academy-card))',
          'card-hover': 'hsl(var(--academy-card-hover))',
          border: 'hsl(var(--academy-border))',
          text: 'hsl(var(--academy-text))',
          'text-muted': 'hsl(var(--academy-text-muted))',
          accent: 'hsl(var(--academy-accent))',
          'accent-hover': 'hsl(var(--academy-accent-hover))',
          success: 'hsl(var(--academy-success))',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      spacing: {
        0: '0px',
        px: '1px',
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        3.5: '14px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        11: '44px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
        28: '112px',
        32: '128px',
        36: '144px',
        40: '160px',
        44: '176px',
        48: '192px',
        52: '208px',
        56: '224px',
        60: '240px',
        64: '256px',
        72: '288px',
        80: '320px',
        96: '384px',
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      keyframes: {
        'slide-in-from-bottom-5': {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'fade-out': {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        indeterminate: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },
      animation: {
        in: 'slide-in-from-bottom-5 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'slide-in-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-right': 'slide-in-from-right 0.3s ease-out',
        'slide-in-left': 'slide-in-from-left 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },
      // Mobile Design Tokens
      // Touch targets (WCAG AAA compliance)
      minHeight: {
        'touch-sm': '44px', // WCAG AAA minimum (small devices)
        'touch-md': '48px', // iOS HIG recommended
        'touch-lg': '56px', // Material Design recommended
        'touch-xl': '64px', // Large FABs and prominent actions
      },
      minWidth: {
        'touch-sm': '44px',
        'touch-md': '48px',
        'touch-lg': '56px',
        'touch-xl': '64px',
      },
      // Mobile transitions
      transitionDuration: {
        fast: '150ms', // Immediate feedback
        normal: '300ms', // Standard animations
        slow: '500ms', // Complex animations
      },
      transitionTimingFunction: {
        'mobile-ease': 'cubic-bezier(0.4, 0, 0.2, 1)', // Material ease
        'mobile-ease-in': 'cubic-bezier(0.4, 0, 1, 1)', // Accelerate
        'mobile-ease-out': 'cubic-bezier(0, 0, 0.2, 1)', // Decelerate
        'mobile-spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Spring effect
      },
      // Safe area insets (for notched devices)
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      margin: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Mobile-specific z-index layers
      zIndex: {
        'mobile-nav': '40', // Bottom navigation
        'mobile-sheet': '50', // Action sheets / Bottom sheets
        'mobile-drawer': '50', // Side drawers
        'mobile-modal': '60', // Full-screen modals
        'mobile-toast': '70', // Toast notifications
        'mobile-tooltip': '80', // Tooltips
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
