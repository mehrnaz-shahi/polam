import { Tabs } from "expo-router";
import { FloatingTabBar } from "@/src/components/layout/FloatingTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: 0,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "خانه" }} />
      <Tabs.Screen name="transactions" options={{ title: "تراکنش‌ها" }} />
      <Tabs.Screen name="add" options={{ title: "ثبت" }} />
      <Tabs.Screen name="analytics" options={{ title: "تحلیل" }} />
      <Tabs.Screen name="more" options={{ title: "بیشتر" }} />
    </Tabs>
  );
}
