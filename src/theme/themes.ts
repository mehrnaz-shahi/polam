import { vars } from "nativewind";

const light = {
  "--color-surface": "#F9FAFB",
  "--color-panel": "#FFFFFF",
  "--color-fill": "#F3F4F6",
  "--color-line": "#E5E7EB",
  "--color-line-strong": "#D1D5DB",
  "--color-ink": "#111827",
  "--color-muted": "#6B7280",
  "--color-faint": "#9CA3AF",
  "--color-accent": "#4B8D88",
  "--color-accent-strong": "#376F6B",
  "--color-accent-soft": "#F0F9F8",
  "--color-success-soft": "#D1FAE5",
  "--color-error": "#EF4444",
  "--color-error-soft": "#FEE2E2",
};

const dark = {
  "--color-surface": "#111827",
  "--color-panel": "#1F2937",
  "--color-fill": "#0F172A",
  "--color-line": "#374151",
  "--color-line-strong": "#4B5563",
  "--color-ink": "#F9FAFB",
  "--color-muted": "#9CA3AF",
  "--color-faint": "#6B7280",
  "--color-accent": "#ACD9D5",
  "--color-accent-strong": "#DDF1EF",
  "--color-accent-soft": "#285450",
  "--color-success-soft": "#064E3B",
  "--color-error": "#F87171",
  "--color-error-soft": "#3F1D1D",
};

export const themes = {
  light: vars(light),
  dark: vars(dark),
};
