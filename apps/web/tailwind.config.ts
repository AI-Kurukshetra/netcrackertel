import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        mist: "#f4f7fb",
        cyan: "#5eead4",
        coral: "#f97316",
        storm: "#0f172a"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(34,211,238,0.18), transparent 30%), radial-gradient(circle at top right, rgba(249,115,22,0.12), transparent 24%), linear-gradient(180deg, rgba(7,17,31,0.92), rgba(7,17,31,1))"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(2, 6, 23, 0.14)"
      }
    }
  },
  plugins: []
} satisfies Config;
