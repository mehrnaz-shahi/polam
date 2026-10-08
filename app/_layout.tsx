import "../global.css";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Appearance, I18nManager, View } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getDb, getTheme } from "@/src/db/database";
import { useAppStore } from "@/src/stores/app";
import { darkPalette, palette } from "@/src/theme/colors";
import { themes } from "@/src/theme/themes";

SplashScreen.preventAutoHideAsync();
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function RootLayout() {
  const [loaded] = useFonts({
    Estedad: require("../assets/fonts/Estedad-Regular.ttf"),
    EstedadMedium: require("../assets/fonts/Estedad-Medium.ttf"),
    EstedadSemiBold: require("../assets/fonts/Estedad-SemiBold.ttf"),
    EstedadBold: require("../assets/fonts/Estedad-Bold.ttf"),
  });
  const scheme = useAppStore((state) => state.scheme);
  const ready = useAppStore((state) => state.ready);
  const hydrate = useAppStore((state) => state.hydrate);
  const applySystem = useAppStore((state) => state.applySystem);

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
      } finally {
        if (active) await SplashScreen.hideAsync();
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
      <View style={[{ flex: 1 }, themes[scheme]]}>
        <View className="flex-1 bg-surface">
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: "slide_from_left",
            }}
          />
        </View>
      </View>
    </SafeAreaProvider>
  );
}
