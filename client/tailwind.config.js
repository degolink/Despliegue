/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#071424',
          lowest: '#030f1e',
          low: '#101c2c',
          container: '#142031',
          high: '#1f2b3c',
          highest: '#2a3547',
          bright: '#2e3a4b',
        },
        'on-surface': {
          DEFAULT: '#d7e3fa',
          variant: '#d2c1d7',
        },
        outline: {
          DEFAULT: '#9b8ba1',
          variant: '#4f4255',
        },
        primary: {
          DEFAULT: '#e5b5ff',
          container: '#b026ff',
          dark: '#9200db',
          'on': '#4e0078',
        },
        secondary: {
          DEFAULT: '#ffb1c3',
          container: '#ff4b89',
        },
        tertiary: {
          DEFAULT: '#00daf3',
          container: '#008190',
        },
        danger: {
          DEFAULT: '#ffb4ab',
          container: '#93000a',
        },
      },
      fontFamily: {
        sans: ['Cinzel', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}