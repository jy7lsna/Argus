/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0c",
        surface: "#111114",
        border: "rgba(255, 255, 255, 0.08)",
        primary: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
        },
        secondary: "#a855f7",
        text: {
          primary: "#ffffff",
          secondary: "#94a3b8",
        },
        risk: {
          critical: "#ef4444",
          high: "#f97316",
          medium: "#eab308",
          low: "#22c55e",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
