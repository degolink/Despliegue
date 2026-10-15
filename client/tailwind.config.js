/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mythic: {
          dark: '#0B0F19',
          card: '#131B2E',
          border: '#23304B',
          gold: '#F59E0B',
          'gold-light': '#FBBF24',
          'gold-dark': '#D97706',
          ruby: '#E11D48',
          accent: '#38BDF8',
        }
      },
      fontFamily: {
        sans: ['Cinzel', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

