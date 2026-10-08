/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F4F1FF",
          100: "#E9E3FF",
          200: "#D6CCFF",
          300: "#C0B2FF",
          400: "#AA98FF",
          500: "#8B72FF",
          600: "#7C5CFF",
          700: "#6848E8",
          800: "#5639C7",
          900: "#422C9E",
        },

        success: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
          dark: "#047857",
          muted: "#064E3B",
        },

        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
        },

        error: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
          muted: "#3F1D1D",
        },

        danger: "#EF4444",

        ink: {
          DEFAULT: "#111827",
          inverse: "#F9FAFB",
        },

        muted: {
          DEFAULT: "#6B7280",
          inverse: "#9CA3AF",
        },

        faint: "#9CA3AF",

        surface: {
          DEFAULT: "#F9FAFB",
          dark: "#111827",
        },

        panel: {
          DEFAULT: "#FFFFFF",
          dark: "#1F2937",
        },

        fill: {
          DEFAULT: "#F3F4F6",
          dark: "#0F172A",
        },

        line: {
          DEFAULT: "#E5E7EB",
          dark: "#374151",
          strong: "#D1D5DB",
        },
      },

      fontFamily: {
        vazir: ["Vazirmatn"],
        "vazir-medium": ["VazirmatnMedium"],
        "vazir-semibold": ["VazirmatnSemiBold"],
        "vazir-bold": ["VazirmatnBold"],
      },

      borderRadius: {
        card: "16px",
      },
    },
  },

  plugins: [],
};