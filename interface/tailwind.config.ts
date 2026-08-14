import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EBEBEB",
        ink: "#0F0F0D",
        signal: "#ED1804",
        peach: "#EDA78E",
        olive: "#435217",
        muted: "#696968",
        line: "#CFCFCA"
      },
      boxShadow: {
        "hard-sm": "4px 4px 0 #0F0F0D",
        "hard-md": "8px 8px 0 #0F0F0D"
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-120%)" },
          "100%": { transform: "translateY(520%)" }
        }
      },
      animation: {
        scan: "scan 5s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
