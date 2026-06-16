import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Poppins"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Saira Condensed"', '"Poppins"', "ui-sans-serif", "sans-serif"],
      },
      colors: {
        // Blend Mode coral (#DF533C) on near-black slate.
        brand: {
          50: "#fdf4f2",
          100: "#fbe5e0",
          200: "#f6c8be",
          300: "#eda493",
          400: "#e67e64",
          500: "#df533c",
          600: "#cb4530",
          700: "#a83621",
          800: "#882d1d",
        },
        ink: {
          900: "#111827",
          800: "#1f2937",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
