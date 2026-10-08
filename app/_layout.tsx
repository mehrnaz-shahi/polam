import "../global.css";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { I18nManager } from "react-native";
import { useFonts } from "expo-font";
import {
  Vazirmatn_400Regular,
  Vazirmatn_500Medium,
  Vazirmatn_600SemiBold,
  Vazirmatn_700Bold,
} from "@expo-google-fonts/vazirmatn";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getDb, getTheme } from "@/src/db/database";
import { useColorScheme } from "nativewind";

SplashScreen.preventAutoHideAsync();
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function RootLayout() {
  const [loaded] = useFonts({
    Vazirmatn: Vazirmatn_400Regular,
    VazirmatnMedium: Vazirmatn_500Medium,
    VazirmatnSemiBold: Vazirmatn_600SemiBold,
    VazirmatnBold: Vazirmatn_700Bold,
  });
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    if (!loaded) return;
    getDb().then(async () => {
      setColorScheme(await getTheme());
      await SplashScreen.hideAsync();
    });
  }, [loaded, setColorScheme]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme === "dark" ? "#07110d" : "#f4f8f6",
          },
          animation: "slide_from_left",
        }}
      />
    </SafeAreaProvider>
  );
}
