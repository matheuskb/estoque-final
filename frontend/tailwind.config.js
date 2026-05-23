/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem", letterSpacing: "0.05em" }],
      },
      colors: {
        bg: {
          base:    "#0a0a0f",
          surface: "#111118",
          raised:  "#18181f",
          overlay: "#1e1e27",
          border:  "#2a2a35",
          muted:   "#3a3a48",
        },
        tx: {
          primary:   "#f0f0f5",
          secondary: "#9898a8",
          muted:     "#5a5a68",
          disabled:  "#3a3a48",
        },
        accent: {
          DEFAULT: "#7c6af7",
          hover:   "#9487fa",
          muted:   "rgba(124,106,247,0.12)",
          ring:    "rgba(124,106,247,0.25)",
        },
        ok:   { DEFAULT: "#22c55e", muted: "rgba(34,197,94,0.12)",  ring: "rgba(34,197,94,0.2)" },
        warn: { DEFAULT: "#f59e0b", muted: "rgba(245,158,11,0.12)", ring: "rgba(245,158,11,0.2)" },
        danger:{ DEFAULT: "#ef4444", muted: "rgba(239,68,68,0.12)", ring: "rgba(239,68,68,0.2)" },
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      boxShadow: {
        card:  "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        modal: "0 20px 60px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)",
      },
      animation: {
        "fade-in":  "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16,1,0.3,1)",
        "spin-slow":"spin 1s linear infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
