/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2ff',
          100: '#e0e7ff',
          600: '#1e3a6e',
          700: '#162d57',
          800: '#0e1f3d',
          900: '#0a1628',
        },
        gold: {
          300: '#f0d878',
          400: '#e8c66a',
          500: '#d4a843',
          600: '#c9a84c',
          700: '#b8942a',
        },
      },
      fontFamily: {
        sans: ['Noto Sans Thai', 'Noto Sans', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom, #0c0722 0%, #1c0c40 22%, #341460 40%, #5a1a5a 58%, #8c2840 74%, #b84020 88%, #8c3015 100%)',
      },
    },
  },
  plugins: [],
};
