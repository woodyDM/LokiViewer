import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Theme colors (CSS variables, swapped via .dark class)
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-tertiary": "var(--bg-tertiary)",
        "bg-elevated": "var(--bg-elevated)",
        border: "var(--border)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",

        // Log levels (functional, theme-independent)
        "log-debug": "#6c6c6c",
        "log-info": "#4c9aff",
        "log-warn": "#e5a93d",
        "log-error": "#e5534b",
        "log-fatal": "#da3633",

        // Status
        success: "#3fb950",
        warning: "#e5a93d",
        danger: "#e5534b",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Cascadia Code"', "Consolas", "monospace"],
      },
      fontSize: {
        "log-sm": ["12px", "16px"],
        "log-base": ["13px", "20px"],
      },
    },
  },
  plugins: [],
} satisfies Config;
