/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ⭐ Exact Court Green Palette (#395838 as core)
        forest: {
          950: '#0b130b',
          900: '#142013',
          800: '#20311f',
          700: '#2d442c',
          600: '#344e33',
          500: '#395838', // ⭐ Exact green
          400: '#4e734c',
          300: '#6d936b',
          200: '#9db89c',
          100: '#cfe0ce',
          50:  '#eef4ee',
        },

        'brand-green': {
          50:  '#eef4ee',
          100: '#cfe0ce',
          200: '#9db89c',
          300: '#6d936b',
          400: '#4e734c',
          500: '#395838', // ⭐ Exact green
          600: '#344e33',
          700: '#2d442c',
          800: '#20311f',
          900: '#142013',
          950: '#0b130b',
        },

        // ⭐ Exact Court Blue Palette (#0e4174 as core)
        'brand-blue': {
          50:  '#edf5fc',
          100: '#d7e7f9',
          200: '#b4d4f4',
          300: '#83b8eb',
          400: '#4c95de',
          500: '#0e4174', // ⭐ Exact blue (#0e4174)
          600: '#0b3662',
          700: '#092c50',
          800: '#07223f',
          900: '#05182d',
          950: '#030f1d',
        },

        gold: {
  50:  '#edf5fc',
  100: '#d7e7f9',
  200: '#b4d4f4',
  300: '#83b8eb',
  400: '#0e4174', // ⭐ Swapped from #4e6e96 to your exact blue
  500: '#0b3662',
  600: '#092c50',
  700: '#07223f',
  800: '#05182d',
  900: '#030f1d',
},
        accentGreen: {
  300: '#527b50', // Lighter tint for hover states
  400: '#395838', // ⭐ YOUR EXACT COURT GREEN (targeted by text-accentGreen-400)
  500: '#2a4229', // Darker shade for active/focus states
},
        cream: {
          DEFAULT: '#F5F0E8',
          dark: '#E8E0D2',
          muted: '#B8B0A0',
        },
        charcoal: '#1A1A1A',
        success: '#2ECC71',
        error: '#E74C3C',
        warning: '#F39C12',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'Inter', 'sans-serif'],
      },
      boxShadow: {
  'glow-gold': '0 0 0 1px rgba(14,65,116,0.6), 0 8px 30px rgba(14,65,116,0.35)',
  'card': '0 4px 24px rgba(0,0,0,0.25)',
  'card-lg': '0 12px 40px rgba(0,0,0,0.35)',
},
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
    },
  },
  plugins: [],
};