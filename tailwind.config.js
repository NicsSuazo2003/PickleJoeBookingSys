/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#0D1A0D',
          900: '#1A2E1A',
          800: '#243024',
          700: '#2A3A2A',
          600: '#324232',
          500: '#3A4A3A',
          400: '#4D5C4D',
          300: '#6B7A6B',
          200: '#A3B0A3',
          100: '#D4DBD4',
        },
        gold: {
          50: '#FBF6E8',
          100: '#F5EBD0',
          200: '#EAD79E',
          300: '#DEC36E',
          400: '#D4AF37',
          500: '#C9A94E',
          600: '#B8A060',
          700: '#9A8240',
          800: '#7C6932',
          900: '#5E4F26',
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
        'glow-gold': '0 0 0 1px rgba(201,169,78,0.4), 0 8px 30px rgba(201,169,78,0.15)',
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
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(212,175,55,0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'pulse-gold': 'pulse-gold 2s infinite',
      },
    },
  },
  plugins: [],
};
