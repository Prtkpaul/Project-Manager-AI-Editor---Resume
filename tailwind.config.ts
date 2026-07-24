import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0B1620",
          800: "#101F2C",
          700: "#16283A",
          600: "#1F3A52",
          500: "#2C4F6E",
        },
        mist: {
          400: "#5D7288",
          300: "#93A4B8",
          200: "#C4D0DC",
          100: "#E8EDF2",
        },
        signal: {
          teal: "#17B3A3",
          amber: "#F2A93B",
          coral: "#EF6461",
        },
        paper: {
          DEFAULT: "#FFFFFF",
          line: "#E3E7ED",
          soft: "#F6F8FA",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(11, 22, 32, 0.06), 0 8px 24px rgba(11, 22, 32, 0.06)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "24px 24px",
      },
    },
  },
  plugins: [],
};

export default config;
