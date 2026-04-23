/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
        accent: colors.amber,
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 20px -8px rgba(0,0,0,0.05)',
        'card-dark': '0 4px 20px -8px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
