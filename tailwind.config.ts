import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":       { backgroundPosition: "100% 50%" },
        },
        "orb-move": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%":       { transform: "translate(30px, -30px) scale(1.05)" },
          "66%":       { transform: "translate(-20px, 20px) scale(0.95)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124,58,237,0.3), 0 0 60px rgba(124,58,237,0.1)" },
          "50%":       { boxShadow: "0 0 40px rgba(124,58,237,0.6), 0 0 100px rgba(124,58,237,0.2)" },
        },
        "scan-line": {
          "0%":   { transform: "translateY(-100%)", opacity: "0" },
          "10%":  { opacity: "1" },
          "90%":  { opacity: "1" },
          "100%": { transform: "translateY(100vh)", opacity: "0" },
        },
      },
      animation: {
        "gradient-x":  "gradient-x 4s ease infinite",
        "orb-move":    "orb-move 8s ease-in-out infinite",
        "fade-up":     "fade-up 0.6s ease-out forwards",
        "fade-in":     "fade-in 0.4s ease-out forwards",
        "pulse-glow":  "pulse-glow 2s ease-in-out infinite",
        "scan-line":   "scan-line 6s linear infinite",
      },
      backgroundSize: {
        "200%": "200% 200%",
      },
    },
  },
  plugins: [],
};

export default config;
