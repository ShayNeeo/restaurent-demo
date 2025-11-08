import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#6b0b0a",
          accent: "#8c3231",
          light: "#f7f5e7",
          dark: "#3f0505"
        }
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
        display: ["var(--font-kaushan)", "cursive"]
      },
      boxShadow: {
        soft: "0 10px 30px rgba(107, 11, 10, 0.12)"
      },
      backgroundImage: {
        "hero-overlay":
          "linear-gradient(135deg, rgba(107, 11, 10, 0.85), rgba(63, 5, 5, 0.6))"
      }
    }
  },
  plugins: []
};

export default config;

