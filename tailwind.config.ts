import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2970FF",
          "500": "#2970FF",
          "600": "#2363e5",
        },
        "primary-blue": {
          DEFAULT: "#2970FF",
          "500": "#2970FF",
          "600": "#2363e5",
        },
        "smooth-white": "#F4F4F4",
        "blue-gray": "#414651",
        "gray": "#71717A",
        "muted-gray": "#A0A0A0"
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: "#2970FF",
              "500": "#2970FF",
              "600": "#2363e5",
            },
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: "#2970FF",
              "500": "#2970FF",
              "600": "#2363e5",
            },
          },
        },
      },
    }),
  ],
};

export default config;
