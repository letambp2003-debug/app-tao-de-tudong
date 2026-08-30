/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9ecff",
          200: "#bce0ff",
          300: "#8eccff",
          400: "#59afff",
          500: "#258cfb",
          600: "#1a70eb",
          700: "#1457c7",
          800: "#16479f",
          900: "#173c7e",
          950: "#10254d"
        }
      }
    },
  },
  plugins: [],
}
