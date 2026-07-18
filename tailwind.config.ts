import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F8F7F4",
        card: "#FFFFFF",
        ink: "#111111",
        muted: "#777777",
        border: "rgba(0,0,0,0.05)",
        olive: {
          DEFAULT: "#5F786A",
          dark: "#4E6459",
        },
        sage: "#A7B6A8",
        success: "#58A56C",
        warning: "#C7A85B",
        error: "#D06A6A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: ["34px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        section: ["22px", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        body: ["15px", { lineHeight: "1.6" }],
        caption: ["13px", { lineHeight: "1.5" }],
      },
      borderRadius: {
        card: "28px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 15px 45px rgba(0,0,0,0.06)",
        soft: "0 8px 24px rgba(0,0,0,0.05)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.06)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease forwards",
        "pulse-glow": "pulseGlow 2.6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
