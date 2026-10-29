/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        nu: {
          900: '#0E2915',
          800: '#143D1F',
          700: '#1E4D2B',
          600: '#28663A',
          500: '#35824B',
          400: '#53A16A',
          200: '#B8D9C0',
          100: '#D0E1D4',
          50: '#EBF3ED'
        },
        amberNu: {
          500: '#D97706',
          600: '#B45309',
          100: '#FEF3C7',
          50: '#FFFBEB'
        }
      },
      boxShadow: {
        'nu': '0 4px 20px -2px rgba(20, 61, 31, 0.08), 0 2px 6px -2px rgba(20, 61, 31, 0.04)',
        'nu-lg': '0 10px 25px -3px rgba(20, 61, 31, 0.12), 0 4px 10px -4px rgba(20, 61, 31, 0.07)'
      }
    },
  },
  plugins: [],
}
