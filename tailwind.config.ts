import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Jordnære, naturlige toner med grønn aksent
        sand: {
          50: "#faf8f3",
          100: "#f3efe4",
          200: "#e7dec8",
          300: "#d6c9a8",
        },
        bark: {
          700: "#4a4137",
          800: "#352f28",
          900: "#221e19",
        },
        moss: {
          50: "#f0f5ee",
          100: "#dce8d6",
          200: "#bcd4b0",
          400: "#7da46b",
          500: "#5f8a4e",
          600: "#4a6e3c",
          700: "#3b5731",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
