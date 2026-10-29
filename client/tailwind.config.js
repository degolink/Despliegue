/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fondo azul noche / pizarra oscuro: tarjetas de #161B22 a #0D1117
        surface: {
          DEFAULT: '#0D1117',
          lowest: '#090C10',
          low: '#11161D',
          container: '#161B22',
          high: '#1F2630',
          highest: '#2A323D',
          bright: '#30363D',
        },
        'on-surface': {
          DEFAULT: '#E6EDF3',
          variant: '#B1BAC4',
        },
        outline: {
          DEFAULT: '#8B949E',
          variant: '#30363D',
        },
        // Rojo carmesí: acción principal (+ Carrito). Texto de acento en amarillo oro.
        primary: {
          DEFAULT: '#FACC15',
          container: '#DC2626',
          dark: '#B91C1C',
          'on': '#450A0A',
        },
        // Amarillo oro / fuego: precios y badges. Verde ácido: afinidad.
        secondary: {
          DEFAULT: '#F59E0B',
          container: '#84CC16',
        },
        // Verde ácido / toxic: detalles especiales y hover
        tertiary: {
          DEFAULT: '#A3E635',
          container: '#84CC16',
        },
        // Gris metal oscuro / cadenas: acción secundaria (Historia)
        metal: {
          DEFAULT: '#334155',
          border: '#64748B',
          hover: '#475569',
        },
        danger: {
          DEFAULT: '#ffb4ab',
          container: '#93000a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        arcade: ['"Karmatic Arcade"', 'Bangers', 'sans-serif'],
        comic: ['Bangers', 'Inter', 'sans-serif'],
        marker: ['"Permanent Marker"', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}