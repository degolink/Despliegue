/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Dark Luxury inspirada en Hot Toys / Sideshow Collectibles
        noir: {
          950: '#07090C', // Jet black profundo de fondo
          900: '#0C0F14', // Fondo de tarjetas / hero
          850: '#11151C', // Contenedor elevado
          800: '#171C25', // Superficie intermedia
          700: '#222936', // Bordes sutiles
          600: '#323B4C', // Bordes interactivos
        },
        gold: {
          50: '#FCF9F0',
          100: '#F7F0D8',
          200: '#EEDDA9',
          300: '#E4C777',
          400: '#DAB24B',
          500: '#C89B2B', // Acento dorado premium
          600: '#A97C1F',
          700: '#835C19',
          800: '#644419',
          900: '#4D3416',
        },
        platinum: {
          100: '#FFFFFF',
          200: '#F0F2F5',
          300: '#DCE0E6',
          400: '#B6BDC7',
          500: '#8C94A0',
        },
        crimson: {
          500: '#E11D48',
          600: '#BE123C',
          700: '#9F1239',
        },
      },
      fontFamily: {
        serif: ['Cinzel', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'luxury-shimmer': 'linear-gradient(110deg, transparent 25%, rgba(200, 155, 43, 0.12) 50%, transparent 75%)',
        'noir-sheen': 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%)',
      },
      boxShadow: {
        'luxury-sm': '0 2px 10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'luxury': '0 10px 30px -5px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'luxury-hover': '0 20px 45px -10px rgba(0, 0, 0, 0.9), 0 0 25px -5px rgba(200, 155, 43, 0.25)',
        'gold-glow': '0 0 30px rgba(200, 155, 43, 0.35)',
      },
      letterSpacing: {
        'widest-luxury': '0.25em',
        'ultra': '0.35em',
      },
    },
  },
  plugins: [],
}
