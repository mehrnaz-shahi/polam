import { Pressable, View } from "react-native";
import { ChartPie, House, LayoutGrid, Plus, Receipt, type LucideIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePalette } from "@/src/theme/colors";

type TabRoute = { key: string; name: string };
type FloatingTabBarProps = {
  state: { index: number; routes: TabRoute[] };
  navigation: {
    emit: (event: {
      type: "tabPress";
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

const ICONS: Record<string, LucideIcon> = {
  index: House,
  transactions: Receipt,
  analytics: ChartPie,
  more: LayoutGrid,
};

const LABELS: Record<string, string> = {
  index: "خانه",
  transactions: "تراکنش‌ها",
  analytics: "تحلیل",
  more: "بیشتر",
};

export const TAB_BAR_CLEARANCE = 128;

export function FloatingTabBar({ state, navigation }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = usePalette();
  const addIndex = state.routes.findIndex((route) => route.name === "add");
  const sides = state.routes.filter((route) => route.name !== "add");
  const left = sides.slice(0, 2);
  const right = sides.slice(2);

  const open = (name: string, key: string, focused: boolean) => {
    const event = navigation.emit({
      type: "tabPress",
      target: key,
      canPreventDefault: true,
    });
    if (!focused && !event.defaultPrevented) navigation.navigate(name);
  };

  const renderTab = (route: (typeof state.routes)[number]) => {
    const index = state.routes.findIndex((item) => item.key === route.key);
    const focused = state.index === index;
    const Icon = ICONS[route.name] ?? House;
    return (
      <Pressable
        key={route.key}
        accessibilityRole="button"
        accessibilityLabel={LABELS[route.name] ?? route.name}
        accessibilityState={focused ? { selected: true } : {}}
        onPress={() => open(route.name, route.key, focused)}
        className="h-16 flex-1 items-center justify-center"
      >
        <Icon
          size={22}
          color={focused ? colors.primary : colors.textMuted}
          strokeWidth={1.75}
        />
        <View
          className="mt-1.5 h-1 w-1 rounded-full"
          style={{ backgroundColor: focused ? colors.primary : "transparent" }}
        />
      </Pressable>
    );
  };

  const addFocused = state.index === addIndex;
  const addRoute = state.routes[addIndex];

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 20,
        right: 20,
        bottom: Math.max(insets.bottom, 14),
      }}
    >
      <View
        className="h-[68px] flex-row items-center rounded-full border border-line bg-panel"
        style={{
          shadowColor: colors.textPrimary,
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        }}
      >
        {left.map(renderTab)}
        <View className="w-[76px]" />
        {right.map(renderTab)}
      </View>
      <View
        pointerEvents="none"
        className="absolute bg-surface"
        style={{
          top: -4,
          left: "50%",
          marginLeft: -43,
          width: 86,
          height: 36,
          borderBottomLeftRadius: 43,
          borderBottomRightRadius: 43,
        }}
      />
      {addRoute ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="ثبت"
          accessibilityState={addFocused ? { selected: true } : {}}
          onPress={() => open(addRoute.name, addRoute.key, addFocused)}
          className="absolute h-[58px] w-[58px] items-center justify-center rounded-full bg-brand-600"
          style={{
            top: -26,
            left: "50%",
            marginLeft: -29,
            shadowColor: colors.primary,
            shadowOpacity: 0.32,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 10,
          }}
        >
          <Plus size={26} color={colors.onPrimary} strokeWidth={2.25} />
        </Pressable>
      ) : null}
    </View>
  );
}
