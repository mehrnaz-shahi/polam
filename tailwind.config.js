/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F0F9F8",
          100: "#DDF1EF",
          200: "#C5E5E2",
          300: "#ACD9D5",
          400: "#94CEC9",
          500: "#82C4C0",
          600: "#62AAA5",
          700: "#4B8D88",
          800: "#376F6B",
          900: "#285450",
        },

        accent: {
          DEFAULT: "var(--color-accent)",
          strong: "var(--color-accent-strong)",
          soft: "var(--color-accent-soft)",
        },

        success: {
          DEFAULT: "#10B981",
          soft: "var(--color-success-soft)",
        },

        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
        },

        error: {
          DEFAULT: "var(--color-error)",
          soft: "var(--color-error-soft)",
        },

        danger: "#EF4444",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        faint: "var(--color-faint)",
        surface: "var(--color-surface)",
        panel: "var(--color-panel)",
        fill: "var(--color-fill)",

        line: {
          DEFAULT: "var(--color-line)",
          strong: "var(--color-line-strong)",
        },
      },

      fontFamily: {
        sans: ["Estedad"],
        "sans-medium": ["EstedadMedium"],
        "sans-semibold": ["EstedadSemiBold"],
        "sans-bold": ["EstedadBold"],
      },

      borderRadius: {
        card: "16px",
      },
    },
  },

  plugins: [],
};
