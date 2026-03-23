import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vintage / Earthy palette dla thrift store
        cream: {
          50: "#FEFDFB",
          100: "#FDF9F3",
          200: "#F9F1E4",
          300: "#F3E5D0",
          400: "#E8D4B5",
          500: "#D9BE94",
        },
        espresso: {
          50: "#F7F5F4",
          100: "#E8E4E1",
          200: "#D1C9C3",
          300: "#B5A99F",
          400: "#8B7B6E",
          500: "#6B5B4E",
          600: "#5A4A3E",
          700: "#4A3C32",
          800: "#3D3129",
          900: "#2E2520",
          950: "#1A1512",
        },
        sage: {
          50: "#F6F7F5",
          100: "#E8EBE5",
          200: "#D3D9CC",
          300: "#B5C0A9",
          400: "#96A585",
          500: "#7A8B68",
          600: "#607052",
          700: "#4C5942",
          800: "#3F4937",
          900: "#363E30",
        },
        rust: {
          50: "#FDF6F3",
          100: "#FCEBE4",
          200: "#F9D5C8",
          300: "#F4B6A0",
          400: "#EC8D6D",
          500: "#E26B45",
          600: "#CF5030",
          700: "#AD4028",
          800: "#8E3625",
          900: "#753123",
        },
        ink: {
          50: "#F6F6F7",
          100: "#E2E3E5",
          200: "#C5C7CB",
          300: "#A0A4AA",
          400: "#7B8089",
          500: "#61656D",
          600: "#4D5058",
          700: "#414348",
          800: "#393A3F",
          900: "#323337",
          950: "#1C1D1F",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-lg": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "display-sm": ["1.875rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-up": "fadeUp 0.5s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
