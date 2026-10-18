/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        ink: "#0b0b0c",
        surface: "#161618",
        "surface-2": "#1c1c1f",
        line: "rgba(255,255,255,0.07)",
        ember: "#ff6a1f",
        protein: "#ff3b6b",
        carbs: "#2dd4bf",
        fat: "#facc15",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        glow: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.5s ease both",
        glow: "glow 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
