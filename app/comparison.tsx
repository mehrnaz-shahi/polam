import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { monthlySummary } from "@/src/db/database";
import { faNumber, monthName, toman } from "@/src/utils/format";
import { Content, Screen, ScreenHeader, ScreenScroll } from "@/src/components/layout/Screen";
import { SurfaceCard } from "@/src/components/ui";

const change = (current: number, previous: number) =>
  previous === 0 ? 0 : Math.round(((current - previous) * 100) / previous);

export default function Comparison() {
  const router = useRouter();
  const [current, setCurrent] = useState<Awaited<ReturnType<typeof monthlySummary>> | null>(null);
  const [previous, setPrevious] = useState<Awaited<ReturnType<typeof monthlySummary>> | null>(null);

  const load = useCallback(async () => {
    const [now, before] = await Promise.all([monthlySummary(0), monthlySummary(1)]);
    setCurrent(now);
    setPrevious(before);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const rows = current && previous
    ? [
        { name: "درآمد", now: current.income, before: previous.income, upIsGood: true },
        { name: "هزینه", now: current.expense, before: previous.expense, upIsGood: false },
        { name: "خالص", now: current.net, before: previous.net, upIsGood: true },
      ]
    : [];

  return (
    <Screen
      header={
        <ScreenHeader
          title="مقایسه ماه‌ها"
          subtitle={
            current && previous
              ? `${monthName(current.monthStart)} و ${monthName(previous.monthStart)}`
              : "در حال محاسبه"
          }
          onBack={() => router.back()}
        />
      }
    >
      <ScreenScroll>
        <Content>
          {rows.map((row) => {
            const delta = change(row.now, row.before);
            const positive = delta > 0 ? row.upIsGood : delta < 0 ? !row.upIsGood : true;
            return (
              <SurfaceCard key={row.name} className="mb-3">
                <Text className="font-sans-bold text-base text-ink text-left">{row.name}</Text>
                <Text className="mt-2 font-sans text-sm text-ink text-left">این ماه: {toman(row.now)}</Text>
                <Text className="mt-1 font-sans text-sm text-muted text-left">ماه قبل: {toman(row.before)}</Text>
                <Text className={`mt-2 font-sans-semibold text-sm text-left ${positive ? "text-success" : "text-error"}`}>
                  {delta > 0 ? "+" : ""}
                  {faNumber(delta)}٪ تغییر
                </Text>
              </SurfaceCard>
            );
          })}
          {!rows.length ? <View /> : null}
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
