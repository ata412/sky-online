/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
  ],
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
          950: '#060d1a',
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
        sans: [
          'var(--font-noto-sans-thai)',
          'var(--font-noto-sans-lao)',
          'var(--font-noto-sans-myanmar)',
          'var(--font-noto-sans-sc)',
          'var(--font-noto-sans)',
          'system-ui',
          'sans-serif',
        ],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom, #0c0722 0%, #1c0c40 22%, #341460 40%, #5a1a5a 58%, #8c2840 74%, #b84020 88%, #8c3015 100%)',
      },
    },
  },
  plugins: [],
};
