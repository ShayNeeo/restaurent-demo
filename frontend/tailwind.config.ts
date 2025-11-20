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
          DEFAULT: "#B38E5A",
          accent: "#CC8866",
          light: "#F7F7F0",
          dark: "#2C2C2C"
        }
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        display: ["var(--font-forum)", "serif"]
      },
      boxShadow: {
        soft: "0 10px 30px rgba(179, 142, 90, 0.12)"
      },
      backgroundImage: {
        "hero-overlay":
          "linear-gradient(135deg, rgba(179, 142, 90, 0.85), rgba(44, 44, 44, 0.6))"
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }
    }
  },
  plugins: []
};

export default config;

