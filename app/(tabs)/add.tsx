import { useRouter } from "expo-router";
import { View } from "react-native";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import { MenuCard } from "@/src/components/ui";

export default function Add() {
  const router = useRouter();
  const { isWide } = useResponsive();
  return (
    <Screen>
      <ScreenScroll contentContainerClassName="flex-grow justify-center">
        <Content className="py-8">
          <ScreenHeader title="ثبت تراکنش" subtitle="چه چیزی می‌خواهید ثبت کنید؟" />
          <View className={isWide ? "flex-row gap-4" : "gap-3"}>
            <View className={isWide ? "flex-1" : ""}>
              <MenuCard
                title="ثبت هزینه"
                description="خریدها و پرداخت‌های روزانه"
                icon="arrow-up-circle-outline"
                accent="rose"
                onPress={() => router.push("/expense")}
              />
            </View>
            <View className={isWide ? "flex-1" : ""}>
              <MenuCard
                title="ثبت درآمد"
                description="حقوق، فروش و سایر دریافتی‌ها"
                icon="arrow-down-circle-outline"
                onPress={() => router.push("/income")}
              />
            </View>
            <View className={isWide ? "flex-1" : ""}>
              <MenuCard
                title="انتقال بین حساب‌ها"
                description="جابجایی موجودی بدون هزینه"
                icon="swap-horizontal-outline"
                accent="blue"
                onPress={() => router.push("/transfer")}
              />
            </View>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
