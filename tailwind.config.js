/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Body default — Inter (loaded via Google Fonts in index.html)
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        // Used everywhere as `font-display` in JSX — Oswald
        display: ['Oswald', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Optional brand font — Michroma
        brand: ['Michroma', 'Oswald', 'Inter', 'sans-serif'],
        // Booking codes, ref numbers
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },

      colors: {
        // True Court Infield Acrylic Blue
        court: {
          950: '#0c1827',
          900: '#14253a',
          800: '#193350',
          700: '#1e3f66',
          600: '#224870',
          500: '#2b5888',
          400: '#3d72a8',
          300: '#6497cb',
          200: '#9ec1e5',
          100: '#d1e3f5',
          50:  '#f0f6fc',
        },

        'brand-blue': {
          950: '#0c1827',
          900: '#14253a',
          800: '#193350',
          700: '#1e3f66',
          600: '#224870',
          500: '#2b5888',
          400: '#3d72a8',
          300: '#6497cb',
          200: '#9ec1e5',
          100: '#d1e3f5',
          50:  '#f0f6fc',
        },

        // Court Outfield Acrylic Green
        forest: {
          950: '#0b130b',
          900: '#131e13',
          800: '#1e2e1e',
          700: '#283c27',
          600: '#324a31',
          500: '#3e583c',
          400: '#537250',
          300: '#739570',
          200: '#a2bfa0',
          100: '#d0dfcf',
          50:  '#f1f5f0',
        },

        // Paddle Grip Highlight
        accent: {
          DEFAULT: '#E85D26',
          light: '#F58245',
          dark: '#C44412',
          muted: '#E85D2620',
        },

        // Court White Boundary Lines
        cream: {
          DEFAULT: '#F4F6F2',
          dark: '#E2E6DF',
          muted: '#9FA99D',
        },
        charcoal: '#111411',
        success: '#2ECC71',
        error: '#E74C3C',
        warning: '#F39C12',
      },

      boxShadow: {
        'glow-court':
          '0 0 0 1px rgba(61, 114, 168, 0.6), 0 8px 25px rgba(34, 72, 112, 0.5)',
        'glow-accent':
          '0 0 0 1px rgba(232, 93, 38, 0.5), 0 8px 24px rgba(232, 93, 38, 0.25)',
      },
    },
  },
  plugins: [],
};