/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#1e3a5f",
          600: "#2d4a6f",
          700: "#0f1f3a",
        },
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-out",
        fadeInUp: "fadeInUp 0.5s ease-out",
        slideUp: "slideUp 0.3s ease-out",
        slideInRight: "slideInRight 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(0, 0, 0, 0.08)",
        card: "0 2px 8px -2px rgba(0, 0, 0, 0.06), 0 8px 24px -8px rgba(0, 0, 0, 0.08)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
