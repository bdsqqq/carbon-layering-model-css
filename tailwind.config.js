import { injectColorsAsCssVariables, baseScales } from "./src/colors";
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./public/index.html"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: "#000",
      white: "#fff",
    },
    extend: {
      colors: {
        ...baseScales,
      },
    },
  },
  plugins: [injectColorsAsCssVariables],
};
