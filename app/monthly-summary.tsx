import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { monthlySummary } from "@/src/db/database";
import { faNumber, monthName, toman } from "@/src/utils/format";
import { Content, Screen, ScreenHeader, ScreenScroll } from "@/src/components/layout/Screen";
import { SurfaceCard } from "@/src/components/ui";

export default function MonthlySummary() {
  const router = useRouter();
  const [offset, setOffset] = useState(0);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof monthlySummary>> | null>(null);

  const load = useCallback(() => monthlySummary(offset).then(setSummary), [offset]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const label = summary ? monthName(summary.monthStart) : "";
  const rows = summary
    ? [
        ["درآمد", toman(summary.income)],
        ["هزینه", toman(summary.expense)],
        ["خالص", toman(summary.net)],
        ["بزرگ‌ترین تراکنش", toman(summary.largestTransaction)],
        ["تعداد تراکنش", faNumber(summary.transactionCount)],
      ]
    : [];

  return (
    <Screen
      header={
        <ScreenHeader
          title="خلاصه ماهانه"
          subtitle={label || "در حال محاسبه"}
          onBack={() => router.back()}
        />
      }
    >
      <ScreenScroll>
        <Content>
          <View className="mb-4 flex-row gap-2">
            <Pressable onPress={() => setOffset((value) => value + 1)} className="min-h-14 flex-1 items-center justify-center rounded-2xl border border-line bg-panel">
              <Text className="font-sans-semibold text-sm text-ink text-left">ماه قبل</Text>
            </Pressable>
            <Pressable onPress={() => setOffset(0)} className="min-h-14 flex-1 items-center justify-center rounded-2xl bg-brand-600">
              <Text className="font-sans-semibold text-sm text-white text-left">ماه جاری</Text>
            </Pressable>
          </View>
          {rows.map(([title, value]) => (
            <SurfaceCard key={title} className="mb-3">
              <Text className="font-sans text-xs text-muted text-left">{title}</Text>
              <Text className="mt-2 font-sans-bold text-lg text-ink text-left">{value}</Text>
            </SurfaceCard>
          ))}
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
