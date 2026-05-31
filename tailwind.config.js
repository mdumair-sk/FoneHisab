/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        primary:  '#00FFB2',
        bg:       '#0D0D0D',
        surface:  '#1A1A1A',
        border:   '#2A2A2A',
        'app-text': '#E0E0E0',
      },
    },
  },
  plugins: [],
};
