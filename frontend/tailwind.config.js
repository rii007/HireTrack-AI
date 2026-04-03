/** @type {import('tailwindcss').Config} */
export default {
  darkMode: false,
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#111827",
          deep: "#0F172A",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgb(99 102 241 / 0.15), 0 12px 40px -12px rgb(99 102 241 / 0.35)",
        "glow-sm": "0 0 0 1px rgb(99 102 241 / 0.12), 0 4px 20px -4px rgb(99 102 241 / 0.25)",
      },
      transitionDuration: {
        250: "250ms",
      },
    },
  },
  plugins: [],
};
