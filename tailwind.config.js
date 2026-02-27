/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pri: '#0A7163',
        'pri-light': '#0D9B87',
        'pri-dark': '#065a4e',
        amber: '#F59E0B',
        danger: '#EF4444',
        surface: '#0f1117',
        'surface-2': '#181d27',
        'surface-3': '#1e2535',
        border: '#2a3145',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
