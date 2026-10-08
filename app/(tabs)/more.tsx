import { useRouter } from "expo-router";
import { View } from "react-native";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import { MenuCard } from "@/src/components/ui";

export default function More() {
  const router = useRouter();
  const { isWide } = useResponsive();
  return (
    <Screen header={<ScreenHeader title="بیشتر" subtitle="مدیریت و شخصی‌سازی پولکی" />}>
      <ScreenScroll>
        <Content className="pb-36">
          <View className={isWide ? "flex-row flex-wrap gap-4" : "gap-3"}>
            <View className={isWide ? "w-[48%]" : ""}>
              <MenuCard
                title="حساب‌ها"
                description="موجودی‌ها و کیف پول‌ها"
                icon="wallet"
                onPress={() => router.push("/accounts")}
              />
            </View>
            <View className={isWide ? "w-[48%]" : ""}>
              <MenuCard
                title="دسته‌بندی‌ها"
                description="مدیریت هزینه و درآمد"
                icon="cash"
                onPress={() => router.push("/categories")}
              />
            </View>
            <View className={isWide ? "w-[48%]" : ""}>
              <MenuCard
                title="بودجه‌ها"
                description="سقف هزینه هر ماه"
                icon="pie"
                onPress={() => router.push("/budgets")}
              />
            </View>
            <View className={isWide ? "w-[48%]" : ""}>
              <MenuCard
                title="بدهی و طلب"
                description="طلب‌ها و بدهی‌های شخصی"
                icon="handshake"
                onPress={() => router.push("/debts")}
              />
            </View>
            <View className={isWide ? "w-[48%]" : ""}>
              <MenuCard
                title="وام‌ها"
                description="مانده اصل و اقساط وام"
                icon="bank"
                onPress={() => router.push("/loans")}
              />
            </View>
            <View className={isWide ? "w-[48%]" : ""}>
              <MenuCard
                title="اقساط"
                description="پرداخت‌های دوره‌ای"
                icon="calendar"
                onPress={() => router.push("/installments")}
              />
            </View>
            <View className={isWide ? "w-[48%]" : ""}>
              <MenuCard
                title="چک‌ها"
                description="چک‌های صادره و دریافتی"
                icon="clipboard"
                onPress={() => router.push("/checks")}
              />
            </View>
            <View className={isWide ? "w-[48%]" : ""}>
              <MenuCard
                title="یادآوری‌ها"
                description="هشدار محلی روی دستگاه"
                icon="bulb"
                onPress={() => router.push("/reminders")}
              />
            </View>
            <View className={isWide ? "w-[48%]" : ""}>
              <MenuCard
                title="خلاصه ماهانه"
                description="درآمد، هزینه و بزرگ‌ترین تراکنش"
                icon="bars"
                onPress={() => router.push("/monthly-summary")}
              />
            </View>
            <View className={isWide ? "w-[48%]" : ""}>
              <MenuCard
                title="مقایسه ماه‌ها"
                description="این ماه در برابر ماه قبل"
                icon="scales"
                onPress={() => router.push("/comparison")}
              />
            </View>
            <View className={isWide ? "w-[48%]" : ""}>
              <MenuCard
                title="تنظیمات"
                description="ظاهر و اطلاعات برنامه"
                icon="puzzle"
                onPress={() => router.push("/settings")}
              />
            </View>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
