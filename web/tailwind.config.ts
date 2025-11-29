import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Logo-inspired color palette
        'brand-yellow': {
          50: '#fffaeb',
          100: '#fff3c6',
          200: '#ffe588',
          300: '#ffd54a',
          400: '#ffce33', // Primary logo yellow
          500: '#ffb100', // Logo gradient yellow
          600: '#e69500',
          700: '#cc7a00',
          800: '#a35f00',
          900: '#7a4700',
        },
        'brand-purple': {
          50: '#f5e6ff',
          100: '#e1c2ff',
          200: '#c799ff',
          300: '#a366ff',
          400: '#8b5cf6',
          500: '#6b21a8', // Primary logo purple
          600: '#4c1d95', // Logo gradient purple
          700: '#3d1775',
          800: '#2e1156',
          900: '#1f0b37',
        },
        'brand-orange': {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      fontFamily: {
        comic: ["var(--font-comic)", "'Comic Sans MS'", "cursive"],
      },
      animation: {
        wiggle: "wiggle 1s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "bounce-slow": "bounce 2s infinite",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
