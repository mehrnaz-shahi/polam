import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsive } from "@/src/components/layout/Screen";

function Icon({
  name,
  active,
  size,
}: {
  name: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  size: number;
}) {
  return <Ionicons name={name} size={size} color={active ? "#059669" : "#8a9991"} />;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { isTablet } = useResponsive();
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === "dark";
  const iconSize = isTablet ? 24 : 22;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: (isTablet ? 72 : 66) + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          borderTopWidth: 1,
          borderTopColor: dark ? "#1d2b24" : "#e3ebe7",
          elevation: 8,
          shadowColor: "#102019",
          shadowOpacity: dark ? 0.2 : 0.06,
          shadowRadius: 16,
          backgroundColor: dark ? "#111c17" : "#fff",
        },
        tabBarActiveTintColor: "#059669",
        tabBarInactiveTintColor: "#8a9991",
        tabBarLabelStyle: {
          fontFamily: "VazirmatnMedium",
          fontSize: isTablet ? 12 : 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "خانه",
          tabBarIcon: ({ focused }) => (
            <Icon name={focused ? "home" : "home-outline"} active={focused} size={iconSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "تراکنش‌ها",
          tabBarIcon: ({ focused }) => (
            <Icon name={focused ? "receipt" : "receipt-outline"} active={focused} size={iconSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarIcon: () => (
            <View
              className={`-mt-5 items-center justify-center rounded-[20px] border-4 bg-brand-600 shadow-lg ${
                isTablet ? "h-16 w-16" : "h-14 w-14"
              } ${dark ? "border-panel-dark" : "border-white"}`}
            >
              <Ionicons name="add" size={isTablet ? 32 : 30} color="white" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "تحلیل",
          tabBarIcon: ({ focused }) => (
            <Icon name={focused ? "pie-chart" : "pie-chart-outline"} active={focused} size={iconSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "بیشتر",
          tabBarIcon: ({ focused }) => (
            <Icon name={focused ? "grid" : "grid-outline"} active={focused} size={iconSize} />
          ),
        }}
      />
    </Tabs>
  );
}
