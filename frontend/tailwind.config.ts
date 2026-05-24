import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#FF5A36",
          red: "#FF3B30",
        },
        veda: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          500: "#5b4fe8",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#1e1b4b",
        },
        surface: {
          DEFAULT: "#f8f9fc", // Backwards compatibility
          main: "#f3f4f6", // Background for main area
          sidebar: "#ffffff", // Background for sidebar
          card: "#ffffff", // Background for cards
        },
        ink: {
          DEFAULT: "#1a1d26", // Backwards compatibility
          main: "#111827", // Main text
          muted: "#6b7280", // Muted text
          dark: "#1c1c1e", // Dark button background
        },
        muted: "#6b7280", // Backwards compatibility
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-dm)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.04)",
        dropdown: "0 4px 20px rgba(0, 0, 0, 0.08)",
        fab: "0 4px 12px rgba(0, 0, 0, 0.15)",
        sidebar: "1px 0 10px rgba(0, 0, 0, 0.03)",
      },
    },
  },
  plugins: [],
};

export default config;
