/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ⚠️ Forest scale unchanged — stays forest green for backgrounds.
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
        // ⚠️ Class name kept as "gold" for compatibility.
        // Text tones darkened toward Midnight Blue.
        // Button color (400) kept readable on the dark forest green background.
        gold: {
          50:  '#DCE5EE',   // deeper pale blue (was #E5EDF5)
          100: '#BACCDE',   // deeper (was #C7D6E4)
          200: '#8FA8C4',   // ⬇️ darker light blue (was #9DB8D2)
          300: '#5E7DA1',   // ⬇️ darker mid blue — "Completed" text (was #6E90B0)
          400: '#3E5D80',   // ⬇️ slightly deeper button blue (was #4A6B8E)
          500: '#365270',   // mid-tone deepened (was #3E5C7C)
          600: '#2E4863',   // deeper (was #33506E)
          700: '#263F58',   // rich navy (was #294463)
          800: '#1F3348',   // client's shadow range (was #263646)
          900: '#18273A',   // near-black navy (was #1A2733)
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
        // Adjusted glow to match the deeper blue
        'glow-gold': '0 0 0 1px rgba(62,93,128,0.5), 0 8px 30px rgba(62,93,128,0.3)',
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
        // Pulse now matches the new deeper blue
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(62,93,128,0.6)' },
          '50%': { boxShadow: '0 0 0 8px rgba(62,93,128,0)' },
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