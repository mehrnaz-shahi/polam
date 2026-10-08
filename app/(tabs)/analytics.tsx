import { useCallback, useState } from "react";
import { RefreshControl, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { categoryTotals, totals } from "@/src/db/database";
import { toman, monthName } from "@/src/utils/format";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import { EmptyState, StatCard, SurfaceCard } from "@/src/components/ui";

export default function Analytics() {
  const { isWide } = useResponsive();
  const [data, setData] = useState({ balance: 0, income: 0, expense: 0 });
  const [cats, setCats] = useState<
    { category_name: string; category_icon: string; amount: number }[]
  >([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [t, c] = await Promise.all([totals(), categoryTotals()]);
    setData(t);
    setCats(c);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const max = cats[0]?.amount || 1;
  const net = data.income - data.expense;

  return (
    <Screen>
      <ScreenScroll
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#059669" />
        }
      >
        <Content className="pt-4">
          <ScreenHeader title="تحلیل مالی" subtitle={`خلاصه عملکرد در ${monthName()}`} />
          <View className={isWide ? "flex-row gap-6" : ""}>
            <View className={isWide ? "w-[38%]" : ""}>
              <View className="flex-row gap-3">
                <StatCard title="درآمد ماه" value={toman(data.income)} tone="positive" />
                <StatCard title="هزینه ماه" value={toman(data.expense)} tone="negative" />
              </View>
              <SurfaceCard className="mt-3">
                <Text className="font-vazir-bold text-base text-ink dark:text-ink-inverse">
                  خالص جریان نقدی
                </Text>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  className={`mt-2 font-vazir-bold text-2xl ${
                    net >= 0 ? "text-brand-600" : "text-rose-500"
                  }`}
                >
                  {net >= 0 ? "+" : "−"} {toman(Math.abs(net))}
                </Text>
                <Text className="mt-2 font-vazir text-xs text-muted">
                  موجودی کل: {toman(data.balance)}
                </Text>
              </SurfaceCard>
            </View>
            <View className={isWide ? "flex-1" : "mt-6"}>
              {cats.length ? (
                <SurfaceCard>
                  <Text className="font-vazir-bold text-base text-ink dark:text-ink-inverse">
                    هزینه بر اساس دسته‌بندی
                  </Text>
                  {cats.slice(0, 8).map((c) => (
                    <View key={c.category_name} className="mt-5">
                      <View className="flex-row items-center">
                        <Text className="text-lg">{c.category_icon}</Text>
                        <Text className="mr-2 flex-1 font-vazir text-sm text-ink dark:text-ink-inverse">
                          {c.category_name}
                        </Text>
                        <Text
                          numberOfLines={1}
                          className="max-w-[40%] font-vazir-bold text-xs text-ink dark:text-ink-inverse"
                        >
                          {toman(c.amount)}
                        </Text>
                      </View>
                      <View className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <View
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${Math.max(8, (c.amount / max) * 100)}%` }}
                        />
                      </View>
                    </View>
                  ))}
                </SurfaceCard>
              ) : (
                <EmptyState
                  title="داده‌ای برای نمایش نیست"
                  description="پس از ثبت هزینه، نمودار اینجا نمایش داده می‌شود."
                  icon="pie-chart-outline"
                />
              )}
            </View>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
