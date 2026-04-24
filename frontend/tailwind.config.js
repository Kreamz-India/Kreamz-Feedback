/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      colors: {
        kreamz: {
          pink:    "#e91e8c",
          dark:    "#c2185b",
          deeper:  "#ad1457",
          light:   "#ffd6e8",
          teal:    "#26c6da",
        },
      },
    },
  },
  plugins: [],
};
