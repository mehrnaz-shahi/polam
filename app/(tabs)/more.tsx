import { useRouter } from "expo-router";
import { View } from "react-native";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import { MenuCard } from "@/src/components/ui";

export default function More() {
  const router = useRouter();
  const { isWide } = useResponsive();
  return (
    <Screen>
      <ScreenScroll>
        <Content className="pt-4">
          <ScreenHeader title="بیشتر" subtitle="مدیریت و شخصی‌سازی پولکی" />
          <View className={isWide ? "flex-row flex-wrap gap-4" : "gap-3"}>
            <View className={isWide ? "w-[48%]" : ""}>
              <MenuCard
                title="حساب‌ها"
                description="موجودی‌ها و کیف پول‌ها"
                icon="wallet-outline"
                onPress={() => router.push("/accounts")}
              />
            </View>
            <View className={isWide ? "w-[48%]" : ""}>
              <MenuCard
                title="دسته‌بندی‌ها"
                description="مدیریت هزینه و درآمد"
                icon="grid-outline"
                onPress={() => router.push("/categories")}
              />
            </View>
            <View className={isWide ? "w-[48%]" : ""}>
              <MenuCard
                title="تنظیمات"
                description="ظاهر و اطلاعات برنامه"
                icon="settings-outline"
                onPress={() => router.push("/settings")}
              />
            </View>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
