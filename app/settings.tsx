import { Circle, CircleCheck, Moon, ShieldCheck, Smartphone, Sun, type LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { setTheme, Theme } from "@/src/db/database";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import { SurfaceCard } from "@/src/components/ui";
import { useAppStore } from "@/src/stores/app";
import { usePalette } from "@/src/theme/colors";

export default function Settings() {
  const router = useRouter();
  const { isWide } = useResponsive();
  const colors = usePalette();
  const selected = useAppStore((state) => state.preference);
  const setPreference = useAppStore((state) => state.setPreference);

  const choose = (value: Theme) => {
    setPreference(value);
    void setTheme(value);
  };

  const options: {
    value: Theme;
    label: string;
    description: string;
    icon: LucideIcon;
  }[] = [
    { value: "light", label: "روشن", description: "پس‌زمینه روشن و خوانا", icon: Sun },
    { value: "dark", label: "تاریک", description: "مناسب محیط‌های کم‌نور", icon: Moon },
    {
      value: "system",
      label: "مطابق سیستم",
      description: "هماهنگ با تنظیمات دستگاه",
      icon: Smartphone,
    },
  ];

  return (
    <Screen
      header={
        <ScreenHeader
          title="تنظیمات"
          subtitle="ظاهر و اطلاعات برنامه"
          onBack={() => router.back()}
        />
      }
    >
      <ScreenScroll>
        <Content>
          <View className={isWide ? "flex-row gap-6" : ""}>
            <View className={isWide ? "flex-1" : ""}>
              <Text className="mb-3 font-sans-semibold text-sm text-ink text-left">
                تم برنامه
              </Text>
              {options.map((option) => {
                const active = selected === option.value;
                const Icon = option.icon;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => choose(option.value)}
                    className={`mb-3 flex-row items-center rounded-2xl border p-4 ${
                      active
                        ? "border-brand-500 bg-accent-soft"
                        : "border-line bg-panel"
                    }`}
                  >
                    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-fill">
                      <Icon size={20} color={colors.primary} strokeWidth={1.75} />
                    </View>
                    <View className="ms-3 flex-1 items-start">
                      <Text className="font-sans-semibold text-sm text-ink text-left">
                        {option.label}
                      </Text>
                      <Text className="mt-1 font-sans text-xs text-muted text-left">
                        {option.description}
                      </Text>
                    </View>
                    {active ? (
                      <CircleCheck size={22} color={colors.primary} strokeWidth={1.75} />
                    ) : (
                      <Circle size={22} color={colors.textMuted} strokeWidth={1.75} />
                    )}
                  </Pressable>
                );
              })}
            </View>
            <SurfaceCard className={isWide ? "w-[42%] self-start" : "mt-5"}>
              <Text className="font-sans-bold text-base text-ink text-left">
                پولکی آفلاین
              </Text>
              <Text className="mt-2 font-sans text-xs leading-6 text-muted text-left">
                تمام داده‌های مالی در همین دستگاه نگهداری می‌شوند و Phase 1 بدون حساب کاربری و بدون
                اتصال به سرور کار می‌کند.
              </Text>
              <View className="mt-5 flex-row items-center">
                <ShieldCheck size={20} color={colors.primary} strokeWidth={1.75} />
                <Text className="mr-2 font-sans-semibold text-xs text-accent text-left">
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
