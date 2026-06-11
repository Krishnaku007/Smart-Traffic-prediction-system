import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      colors: {
        traffic: {
          low: "#18b27a",
          medium: "#f2b72d",
          high: "#e3394f",
        },
      },
      boxShadow: {
        glass: "0 12px 32px rgba(8, 23, 32, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
