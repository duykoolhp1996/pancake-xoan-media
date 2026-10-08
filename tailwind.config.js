/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pancake: {
          blue: '#0084FF',
          dark: '#18191A',
          gray: '#F0F2F5',
        }
      }
    },
  },
  plugins: [],
}
