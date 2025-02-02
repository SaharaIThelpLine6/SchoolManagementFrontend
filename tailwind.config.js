/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    animation: true,
  },
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'lato': '"Lato", serif',
        'SolaimanLipi': 'SolaimanLipiNormal, serif',
        'noto': '"Noto Serif Bengali", serif'
      },
      boxShadow: {
        'sub_menu': '0 0 15px -5px rgba(0, 0, 0, 0.2)',
      },
      colors: {
        'theme-offwhite': '#ededed',
        'theme-dark': '#121212',
        'theme-color': '#0B7ED3',
        'theme-secondary': '#0b7ed333'
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPositionX: "180%" },
          "100%": { backgroundPositionX: "-20%" },
        },
      },
      animation: {
        shimmer: "shimmer 1s ease-in-out infinite",
        "pulse-custom": "pulse-custom 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
}

