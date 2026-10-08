import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { getTheme, setTheme, Theme } from "@/src/db/database";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import { SurfaceCard } from "@/src/components/ui";

export default function Settings() {
  const router = useRouter();
  const { setColorScheme } = useColorScheme();
  const { isWide } = useResponsive();
  const [selected, setSelected] = useState<Theme>("system");

  useEffect(() => {
    getTheme().then(setSelected);
  }, []);

  const choose = async (value: Theme) => {
    setSelected(value);
    setColorScheme(value);
    await setTheme(value);
  };

  const options: {
    value: Theme;
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { value: "light", label: "روشن", description: "پس‌زمینه روشن و خوانا", icon: "sunny-outline" },
    { value: "dark", label: "تاریک", description: "مناسب محیط‌های کم‌نور", icon: "moon-outline" },
    {
      value: "system",
      label: "مطابق سیستم",
      description: "هماهنگ با تنظیمات دستگاه",
      icon: "phone-portrait-outline",
    },
  ];

  return (
    <Screen>
      <ScreenScroll>
        <Content className="pt-4">
          <ScreenHeader
            title="تنظیمات"
            subtitle="ظاهر و اطلاعات برنامه"
            onBack={() => router.back()}
          />
          <View className={isWide ? "flex-row gap-6" : ""}>
            <View className={isWide ? "flex-1" : ""}>
              <Text className="mb-3 font-vazir-semibold text-sm text-ink dark:text-ink-inverse">
                ظاهر برنامه
              </Text>
              {options.map((option) => {
                const active = selected === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => choose(option.value)}
                    className={`mb-3 flex-row items-center rounded-2xl border p-4 ${
                      active
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-900"
                        : "border-line bg-panel dark:border-line-dark dark:bg-panel-dark"
                    }`}
                  >
                    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white dark:bg-slate-800">
                      <Ionicons name={option.icon} size={21} color="#059669" />
                    </View>
                    <View className="mr-3 flex-1">
                      <Text className="font-vazir-semibold text-sm text-ink dark:text-ink-inverse">
                        {option.label}
                      </Text>
                      <Text className="mt-1 font-vazir text-xs text-muted">
                        {option.description}
                      </Text>
                    </View>
                    <Ionicons
                      name={active ? "checkmark-circle" : "ellipse-outline"}
                      size={22}
                      color={active ? "#059669" : "#8a9991"}
                    />
                  </Pressable>
                );
              })}
            </View>
            <SurfaceCard className={isWide ? "w-[42%] self-start" : "mt-5"}>
              <Text className="font-vazir-bold text-base text-ink dark:text-ink-inverse">
                پولکی آفلاین
              </Text>
              <Text className="mt-2 font-vazir text-xs leading-6 text-muted">
                تمام داده‌های مالی در همین دستگاه نگهداری می‌شوند و Phase 1 بدون حساب کاربری و بدون
                اتصال به سرور کار می‌کند.
              </Text>
              <View className="mt-5 flex-row items-center">
                <Ionicons name="shield-checkmark-outline" size={20} color="#059669" />
                <Text className="mr-2 font-vazir-semibold text-xs text-brand-600">
                  داده‌های شما خصوصی می‌مانند
                </Text>
              </View>
            </SurfaceCard>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
