import { useColorScheme } from "nativewind";

export const palette = {
  primary: "#4F46E5",
  primaryLight: "#6366F1",
  primaryDark: "#3730A3",
  success: "#10B981",
  successLight: "#D1FAE5",
  successDark: "#047857",
  background: "#F9FAFB",
  surface: "#FFFFFF",
  surfaceSecondary: "#F3F4F6",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",
  error: "#EF4444",
  errorLight: "#FEE2E2",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  onPrimary: "#FFFFFF",
} as const;

export const darkPalette = {
  primary: "#6366F1",
  primaryLight: "#818CF8",
  primaryDark: "#4F46E5",
  success: "#10B981",
  successLight: "#064E3B",
  successDark: "#6EE7B7",
  background: "#111827",
  surface: "#1F2937",
  surfaceSecondary: "#0F172A",
  textPrimary: "#F9FAFB",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",
  border: "#374151",
  borderStrong: "#4B5563",
  error: "#F87171",
  errorLight: "#3F1D1D",
  warning: "#FBBF24",
  warningLight: "#78350F",
  onPrimary: "#FFFFFF",
} as const;

export type AppPalette = { [K in keyof typeof palette]: string };

export function usePalette(): AppPalette {
  const { colorScheme } = useColorScheme();
  return colorScheme === "dark" ? darkPalette : palette;
}
