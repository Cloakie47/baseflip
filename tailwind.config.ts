import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "base-blue": "var(--base-blue)",
        "base-blue-2": "var(--base-blue-2)",
        "bg-deep": "var(--bg-deep)",
        "bg-panel": "var(--bg-panel)",
        ink: "var(--ink)",
        "ink-dim": "var(--ink-dim)",
        win: "var(--win)",
        lose: "var(--lose)",
        btc: "var(--btc)",
        eth: "var(--eth)",
        gold: "var(--gold)",
      },
      boxShadow: {
        glow: "0 0 24px rgba(0, 82, 255, 0.35)",
        "glow-win": "0 0 32px rgba(44, 214, 115, 0.45)",
        "glow-lose": "0 0 32px rgba(255, 77, 94, 0.45)",
      },
      keyframes: {
        bob: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shake: {
          "0%,100%": { transform: "translate(0,0)" },
          "20%": { transform: "translate(-6px, 2px)" },
          "40%": { transform: "translate(6px, -2px)" },
          "60%": { transform: "translate(-4px, 3px)" },
          "80%": { transform: "translate(4px, -3px)" },
        },
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        drop: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(16px) scale(0.85)", opacity: "0.4" },
        },
        confetti: {
          "0%": { transform: "translate(0,0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translate(var(--cx), var(--cy)) rotate(var(--cr))", opacity: "0" },
        },
        twinkle: {
          "0%,100%": { opacity: "0.2" },
          "50%": { opacity: "0.9" },
        },
      },
      animation: {
        bob: "bob 2.6s ease-in-out infinite",
        shake: "shake 0.25s ease-in-out 2",
        pop: "pop 0.5s cubic-bezier(.16,1.36,.5,1) forwards",
        drop: "drop 0.45s ease-in forwards",
        confetti: "confetti 1.1s ease-out forwards",
        twinkle: "twinkle 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
