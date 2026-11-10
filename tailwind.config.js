/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFBF7',
          100: '#FAF4E8',
          200: '#F3E5C8',
          300: '#EAD2A1',
          400: '#DFBD74',
          500: '#D4A343',
          600: '#B88628',
          700: '#92661E',
          800: '#724F1A',
          900: '#563C15',
          metallic: '#C5A059',
          light: '#F8F3EA',
          champagne: '#E6D3B3',
        },
        charcoal: {
          50: '#F6F7F9',
          100: '#EDEFF2',
          200: '#D8DCE2',
          300: '#B7BFCC',
          400: '#8E9BB0',
          500: '#697893',
          600: '#4F5D77',
          700: '#3D475C',
          800: '#2A3140',
          850: '#1F2430',
          900: '#141821',
          950: '#0C0E14',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FCFAF7',
          200: '#F7F3EC',
          300: '#EFE9DE',
          400: '#E0D6C3',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 20px -3px rgba(212, 163, 67, 0.25)',
        'gold-sm': '0 2px 10px -2px rgba(212, 163, 67, 0.2)',
        'luxury': '0 10px 30px -5px rgba(20, 24, 33, 0.08)',
      }
    },
  },
  plugins: [],
}
