import "../global.css";
import { reloadAppAsync } from "expo";
import { LocaleProvider, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Appearance, I18nManager, Platform, Settings, View } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { InteractiveSplash } from "@/src/components/layout/InteractiveSplash";
import { getDb, getTheme } from "@/src/db/database";
import { useAppStore } from "@/src/stores/app";
import { darkPalette, palette } from "@/src/theme/colors";
import { themes } from "@/src/theme/themes";

SplashScreen.preventAutoHideAsync();
I18nManager.allowRTL(true);
I18nManager.swapLeftAndRightInRTL(true);
I18nManager.forceRTL(true);

// Expo Go reads iOS layout direction when the native surface is created.
// forceRTL is stored immediately, but that surface stays LTR until it is created again.
if (Platform.OS === "ios" && !I18nManager.isRTL) {
  const tries = Number(Settings.get("poolaki_ios_rtl") ?? 0);
  if (tries < 1) {
    Settings.set({ poolaki_ios_rtl: tries + 1 });
    void reloadAppAsync("Enable RTL layout").catch(() => {});
  }
} else if (Platform.OS === "ios" && I18nManager.isRTL) {
  Settings.set({ poolaki_ios_rtl: 0 });
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Estedad: require("../assets/fonts/Estedad-Regular.ttf"),
    EstedadMedium: require("../assets/fonts/Estedad-Medium.ttf"),
    EstedadSemiBold: require("../assets/fonts/Estedad-SemiBold.ttf"),
    EstedadBold: require("../assets/fonts/Estedad-Bold.ttf"),
    "Estedad-Bold": require("../assets/fonts/Estedad-Bold.ttf"),
    VazirmatnBold: require("../assets/fonts/Vazirmatn-Bold.ttf"),
    "Vazirmatn-Bold": require("../assets/fonts/Vazirmatn-Bold.ttf"),
  });
  const scheme = useAppStore((state) => state.scheme);
  const ready = useAppStore((state) => state.ready);
  const hydrate = useAppStore((state) => state.hydrate);
  const applySystem = useAppStore((state) => state.applySystem);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      applySystem(colorScheme === "dark" ? "dark" : "light");
    });
    return () => subscription.remove();
  }, [applySystem]);

  useEffect(() => {
    if (!loaded) return;
    let active = true;
    (async () => {
      try {
        await getDb();
        const preference = await getTheme();
        if (active) hydrate(preference);
      } catch {
        if (active) hydrate("system");
      }
    })();
    return () => {
      active = false;
    };
  }, [loaded, hydrate]);

  if (!loaded || !ready) return null;

  const colors = scheme === "dark" ? darkPalette : palette;

  return (
    <SafeAreaProvider>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <LocaleProvider direction="rtl">
        <View style={[{ flex: 1, direction: "rtl" }, themes[scheme]]}>
          <View className="flex-1 bg-surface" style={{ direction: "rtl" }}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background, direction: "rtl" },
                animation: "slide_from_left",
              }}
            />
          </View>
          {/* {showSplash ? <InteractiveSplash onDone={() => setShowSplash(false)} /> : null} */}
        </View>
      </LocaleProvider>
    </SafeAreaProvider>
  );
}
