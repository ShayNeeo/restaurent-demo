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
          DEFAULT: "#017048", // Primary - Deep Forest Green
          accent: "#B08D55", // Secondary - Toasted Gold / Muted Bronze
          light: "#FDFBF7", // Background - Rice Paper / Warm Off-White
          dark: "#2C3330", // Text Body - Charcoal Green
          highlight: "#E85D38" // Highlight - Chili Oil (for CTAs)
        },
        mai: {
          cream: "#FDFBF7", // The warm background (updated)
          peach: "#B08D55", // The hero gradient color (updated to secondary)
          dark: "#2C3330", // The text color (updated)
          gray: "#8A8A8A",
          pill: "#FDFBF7" // Updated to match background
        }
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        display: ["var(--font-forum)", "serif"]
      },
      boxShadow: {
        soft: "0 10px 30px rgba(1, 112, 72, 0.12)"
      },
      backgroundImage: {
        "hero-overlay":
          "linear-gradient(135deg, rgba(1, 112, 72, 0.85), rgba(44, 51, 48, 0.6))"
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }
    }
  },
  plugins: []
};

export default config;

