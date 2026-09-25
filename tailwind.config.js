/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // True Court Infield Acrylic Blue (Calibrated to real court photo)
        court: {
          950: '#0c1827', // Deepest surface shadow
          900: '#14253a', // Court base in low light
          800: '#193350', // Court in indirect evening light
          700: '#1e3f66', // Deep court angle
          600: '#224870', // ⭐ EXACT COURT INFIELD BLUE (True daylight match)
          500: '#2b5888', // Court directly under dome lights
          400: '#3d72a8', // Crisp accent / border tone
          300: '#6497cb', // Primary text highlight (Readable on dark green)
          200: '#9ec1e5', // Light UI text / active badges
          100: '#d1e3f5', // Pill backgrounds / subtle glow
          50:  '#f0f6fc',
        },

        // Court Outfield Acrylic Green
        forest: {
          950: '#0b130b',
          900: '#131e13',
          800: '#1e2e1e',
          700: '#283c27',
          600: '#324a31',
          500: '#3e583c', // ⭐ EXACT COURT OUTFIELD GREEN
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
          DEFAULT: '#F4F6F2', // Crisp line paint
          dark: '#E2E6DF',
          muted: '#9FA99D',
        },
        charcoal: '#111411',
        success: '#2ECC71',
        error: '#E74C3C',
        warning: '#F39C12',
      },

      boxShadow: {
        // Matches the authentic deep-blue surface glow
        'glow-court': '0 0 0 1px rgba(61, 114, 168, 0.6), 0 8px 25px rgba(34, 72, 112, 0.5)',
        'glow-accent': '0 0 0 1px rgba(232, 93, 38, 0.5), 0 8px 24px rgba(232, 93, 38, 0.25)',
      },
    },
  },
  plugins: [],
};