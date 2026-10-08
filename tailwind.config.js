/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          900: "#064e3b",
        },
        ink: { DEFAULT: "#102019", inverse: "#f3faf6" },
        muted: { DEFAULT: "#66776e", inverse: "#9bb0a6" },
        surface: { DEFAULT: "#f4f8f6", dark: "#07110d" },
        panel: { DEFAULT: "#ffffff", dark: "#111c17" },
        line: { DEFAULT: "#e3ebe7", dark: "#1d2b24" },
        danger: "#e11d48",
      },
      fontFamily: {
        vazir: ["Vazirmatn"],
        "vazir-medium": ["VazirmatnMedium"],
        "vazir-semibold": ["VazirmatnSemiBold"],
        "vazir-bold": ["VazirmatnBold"],
      },
      borderRadius: {
        card: "28px",
      },
    },
  },
  plugins: [],
};
