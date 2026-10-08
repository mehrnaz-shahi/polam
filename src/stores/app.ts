import { Appearance } from "react-native";
import { create } from "zustand";
import type { Theme } from "@/src/db/database";

export type Scheme = "light" | "dark";

type State = {
  preference: Theme;
  scheme: Scheme;
  ready: boolean;
  hydrate: (preference: Theme) => void;
  setPreference: (preference: Theme) => void;
  applySystem: (scheme: Scheme) => void;
};

const systemScheme = (): Scheme => (Appearance.getColorScheme() === "dark" ? "dark" : "light");

const resolve = (preference: Theme, system: Scheme): Scheme =>
  preference === "system" ? system : preference;

export const useAppStore = create<State>((set, get) => ({
  preference: "system",
  scheme: systemScheme(),
  ready: false,
  hydrate: (preference) =>
    set({ preference, scheme: resolve(preference, systemScheme()), ready: true }),
  setPreference: (preference) =>
    set({ preference, scheme: resolve(preference, systemScheme()), ready: true }),
  applySystem: (scheme) => {
    if (get().preference === "system") set({ scheme });
  },
}));
