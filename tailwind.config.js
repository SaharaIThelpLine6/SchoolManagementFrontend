/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'lato': '"Lato", serif',
        'SolaimanLipi':'SolaimanLipi, serif',
        'noto':'"Noto Serif Bengali", serif'
      },
      boxShadow: {
        'sub_menu': '0 0 9px -4px rgba(0,0,0,0.6)',
      },
      colors: {
        'theme-offwhite': '#ededed',
      }
    },
  },
  plugins: [],
}

