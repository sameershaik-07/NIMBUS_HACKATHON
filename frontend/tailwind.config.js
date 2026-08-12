/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aws: {
          orange: '#FF9900',
          darkOrange: '#EC7211',
          squid: '#0B0F19',
          navy: '#131921',
          slate: '#1E293B'
        }
      }
    },
  },
  plugins: [],
}
