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
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'-apple-system',
  				'sans-serif'
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		spacing: {
  			'0': '0px',
  			'px': '1px',
  			'0.5': '2px',
  			'1': '4px',
  			'1.5': '6px',
  			'2': '8px',
  			'2.5': '10px',
  			'3': '12px',
  			'3.5': '14px',
  			'4': '16px',
  			'5': '20px',
  			'6': '24px',
  			'7': '28px',
  			'8': '32px',
  			'9': '36px',
  			'10': '40px',
  			'11': '44px',
  			'12': '48px',
  			'14': '56px',
  			'16': '64px',
  			'20': '80px',
  			'24': '96px',
  			'28': '112px',
  			'32': '128px',
  			'36': '144px',
  			'40': '160px',
  			'44': '176px',
  			'48': '192px',
  			'52': '208px',
  			'56': '224px',
  			'60': '240px',
  			'64': '256px',
  			'72': '288px',
  			'80': '320px',
  			'96': '384px',
  		},
  		fontSize: {
  			'xs': ['0.75rem', { lineHeight: '1rem' }],
  			'sm': ['0.875rem', { lineHeight: '1.25rem' }],
  			'base': ['1rem', { lineHeight: '1.5rem' }],
  			'lg': ['1.125rem', { lineHeight: '1.75rem' }],
  			'xl': ['1.25rem', { lineHeight: '1.75rem' }],
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
  			}
  		},
  		animation: {
  			'in': 'slide-in-from-bottom-5 0.3s ease-out',
  			'fade-in': 'fade-in 0.3s ease-out',
  			'fade-out': 'fade-out 0.3s ease-out',
  			'slide-in-top': 'slide-in-from-top 0.3s ease-out',
  			'slide-in-right': 'slide-in-from-right 0.3s ease-out',
  			'slide-in-left': 'slide-in-from-left 0.3s ease-out',
  			'scale-in': 'scale-in 0.3s ease-out',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

