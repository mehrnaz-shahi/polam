import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Circle, G, Svg } from "react-native-svg";
import { BarChart, LineChart, ProgressChart } from "react-native-chart-kit";
import { AreaChart } from "react-native-chart-kit/v2";
import { accountExpenseTotals, categoryTotals, dailyFlow, monthlyFlow, totals } from "@/src/db/database";
import { faNumber, toman, monthName } from "@/src/utils/format";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import { EmptyState, SurfaceCard } from "@/src/components/ui";
import { usePalette } from "@/src/theme/colors";
import { useAppStore } from "@/src/stores/app";

const SLICE = ["#285450", "#4B8D88", "#62AAA5", "#82C4C0", "#94CEC9", "#376F6B"];

type CategoryTotal = { category_name: string; category_icon: string; amount: number };
type DayFlow = { date: string; income: number; expense: number };
type MonthFlow = { label: string; start: string; end: string; income: number; expense: number };
type AccountExpense = { account_name: string; amount: number };

const dayLabel = (iso: string) =>
  new Intl.DateTimeFormat("fa-IR-u-ca-persian", { day: "numeric" }).format(new Date(iso));

const compact = (tomanValue: number) => {
  const value = Math.abs(tomanValue);
  if (value >= 1_000_000) return `${faNumber(Math.round(value / 1_000_000))}م`;
  if (value >= 1_000) return `${faNumber(Math.round(value / 1_000))}ه`;
  return faNumber(value);
};

export default function Analytics() {
  const { isWide } = useResponsive();
  const colors = usePalette();
  const scheme = useAppStore((state) => state.scheme);
  const [data, setData] = useState({ balance: 0, income: 0, expense: 0 });
  const [cats, setCats] = useState<CategoryTotal[]>([]);
  const [days, setDays] = useState<DayFlow[]>([]);
  const [months, setMonths] = useState<MonthFlow[]>([]);
  const [monthIndex, setMonthIndex] = useState(0);
  const [accounts, setAccounts] = useState<AccountExpense[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [plotWidth, setPlotWidth] = useState(0);
  const [dayTip, setDayTip] = useState<number | null>(null);
  const [monthTip, setMonthTip] = useState<number | null>(null);
  const [sliceTip, setSliceTip] = useState<string | null>(null);
  const [accountTip, setAccountTip] = useState<number | null>(null);

  const load = useCallback(async (index?: number) => {
    const monthRows = await monthlyFlow();
    const nextIndex = Math.min(index ?? monthRows.length - 1, monthRows.length - 1);
    const month = monthRows[nextIndex];
    if (!month) return;
    const [t, c, flow, accountRows] = await Promise.all([
      totals(month.start, month.end),
      categoryTotals(month.start, month.end),
      dailyFlow(month.start, month.end),
      accountExpenseTotals(month.start, month.end),
    ]);
    setMonths(monthRows);
    setMonthIndex(nextIndex);
    setData(t);
    setCats(c);
    setDays(flow);
    setAccounts(accountRows);
    setDayTip(null);
    setSliceTip(null);
    setAccountTip(null);
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

  const month = months[monthIndex];
  const monthLabel = month?.label ?? monthName();
  const net = data.income - data.expense;
  const hasFlow = days.some((day) => day.income > 0 || day.expense > 0);
  const expenseTotal = cats.reduce((sum, item) => sum + item.amount, 0);
  const top = cats.slice(0, 5);
  const other = cats.slice(5).reduce((sum, item) => sum + item.amount, 0);
  const slices = other
    ? [...top, { category_name: "سایر", category_icon: "•", amount: other }]
    : top;
  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(75, 141, 136, ${opacity})`,
    labelColor: () => colors.textMuted,
    propsForLabels: { fontFamily: "Estedad", fontSize: 10 },
    propsForBackgroundLines: { stroke: colors.border },
    formatYLabel: (label: string) => compact(Number(label)),
  };
  const hasMonths = months.some((month) => month.income > 0 || month.expense > 0);
  const spentShare = data.income > 0 ? data.expense / data.income : 0;
  const chartWidth = Math.max(160, plotWidth - 32);

  return (
    <Screen header={<ScreenHeader title="تحلیل مالی" subtitle={`خلاصه عملکرد در ${monthLabel}`} />}>
      <ScreenScroll
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
      >
        <Content className="pb-36">
          <View className="overflow-hidden rounded-[28px] bg-accent-soft p-5">
            <Text className="font-sans text-sm text-muted text-left">موجودی کل</Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              className="mt-2 py-2 font-sans-bold text-3xl text-ink text-left"
            >
              {toman(data.balance)}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4"
            contentContainerStyle={{ gap: 8 }}
          >
            {months.map((item, index) => {
              const selected = index === monthIndex;
              return (
                <Pressable
                  key={item.start}
                  onPress={() => load(index)}
                  className={`rounded-full border px-4 py-2 ${
                    selected ? "border-brand-600 bg-brand-600" : "border-line bg-panel"
                  }`}
                >
                  <Text
                    className={`font-sans-semibold text-sm text-left ${
                      selected ? "text-white" : "text-ink"
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View className={`mt-4 ${isWide ? "flex-row gap-6" : ""}`}>
            <View className={`gap-3 ${isWide ? "w-[38%]" : ""}`}>
              <View className="flex-row gap-3">
                <InsightTile title="درآمد" value={toman(data.income)} tint="bg-success-soft" />
                <InsightTile title="هزینه" value={toman(data.expense)} tint="bg-error-soft" />
              </View>
              <View className="flex-row gap-3">
                <InsightTile
                  title="خالص"
                  value={`${net >= 0 ? "+" : "−"} ${toman(Math.abs(net))}`}
                  tint="bg-accent-soft"
                />
                <InsightTile title="موجودی" value={toman(data.balance)} tint="bg-fill" />
              </View>
            </View>
            <View className={isWide ? "flex-1 gap-4" : "mt-4 gap-4"}>
              <SurfaceCard onLayout={(event) => setPlotWidth(event.nativeEvent.layout.width)}>
                <Text className="font-sans-bold text-base text-ink text-left">روزهای {monthLabel}</Text>
                <View className="mt-3 flex-row gap-4">
                  <LegendDot color={colors.success} label="درآمد" />
                  <LegendDot color={colors.error} label="هزینه" />
                </View>
                {hasFlow && plotWidth > 0 ? (
                  <View className="mt-2" style={{ direction: "ltr" }}>
                    <AreaChart
                      data={days.map((day) => ({
                        label: dayLabel(day.date),
                        income: day.income / 10,
                        expense: day.expense / 10,
                      }))}
                      xKey="label"
                      series={[
                        { yKey: "income", label: "درآمد", color: colors.success },
                        { yKey: "expense", label: "هزینه", color: colors.error },
                      ]}
                      curve="monotone"
                      width={chartWidth}
                      height={220}
                      scrollable
                      visiblePoints={8}
                      theme={scheme}
                      yDomain={{ min: 0, includeZero: true }}
                      formatYLabel={(value) => compact(value)}
                      tooltip
                      legend={false}
                      interaction={{
                        mode: "tap",
                        onSelect: (event) => setDayTip(event.index),
                      }}
                    />
                  </View>
                ) : (
                  <Text className="mt-4 font-sans text-sm text-muted text-left">
                    در {monthLabel} تراکنشی ثبت نشده است.
                  </Text>
                )}
                {dayTip != null && days[dayTip] ? (
                  <ChartTip
                    title={dayLabel(days[dayTip].date)}
                    lines={[
                      { label: "درآمد", value: toman(days[dayTip].income) },
                      { label: "هزینه", value: toman(days[dayTip].expense) },
                    ]}
                  />
                ) : hasFlow ? (
                  <Text className="mt-3 font-sans text-xs text-muted text-left">نقطه نمودار را لمس کنید.</Text>
                ) : null}
              </SurfaceCard>
              {slices.length ? (
                <SurfaceCard>
                  <Text className="font-sans-bold text-base text-ink text-left">سهم هزینه‌ها</Text>
                  <View className="mt-2 items-center">
                    <View className="items-center justify-center">
                      <Donut
                        selected={sliceTip}
                        onSelect={setSliceTip}
                        slices={slices.map((item, index) => ({
                          key: item.category_name,
                          amount: item.amount,
                          color: SLICE[index % SLICE.length],
                        }))}
                      />
                      <View className="absolute items-center px-8" pointerEvents="none">
                        <Text className="font-sans text-xs text-muted text-left">
                          {sliceTip ?? "مجموع"}
                        </Text>
                        <Text
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          className="font-sans-bold text-xs text-ink text-left"
                        >
                          {toman(
                            sliceTip
                              ? (slices.find((item) => item.category_name === sliceTip)?.amount ?? expenseTotal)
                              : expenseTotal,
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {slices.map((item, index) => (
                    <View key={item.category_name} className="mt-4 flex-row items-center">
                      <View
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: SLICE[index % SLICE.length] }}
                      />
                      <Text className="mr-2 text-base">{item.category_icon}</Text>
                      <Text className="flex-1 font-sans text-sm text-ink text-left">
                        {item.category_name}
                      </Text>
                      <Text className="font-sans-bold text-xs text-ink text-left">
                        {toman(item.amount)}
                      </Text>
                    </View>
                  ))}
                </SurfaceCard>
              ) : (
                <EmptyState
                  title="داده‌ای برای نمایش نیست"
                  description="پس از ثبت هزینه، نمودار سهم دسته‌ها اینجا نمایش داده می‌شود."
                  icon="pie"
                />
              )}
              <SurfaceCard>
                <Text className="font-sans-bold text-base text-ink text-left">شش ماه اخیر</Text>
                <View className="mt-3 flex-row gap-4">
                  <LegendDot color={colors.success} label="درآمد" />
                  <LegendDot color={colors.error} label="هزینه" />
                </View>
                {hasMonths && plotWidth > 0 ? (
                  <View className="mt-2" style={{ direction: "ltr" }}>
                    <LineChart
                      data={{
                        labels: months.map((month) => month.label),
                        datasets: [
                          {
                            data: months.map((month) => month.income / 10),
                            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                            strokeWidth: 2,
                          },
                          {
                            data: months.map((month) => month.expense / 10),
                            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                            strokeWidth: 2,
                          },
                        ],
                      }}
                      width={chartWidth}
                      height={200}
                      chartConfig={chartConfig}
                      bezier
                      fromZero
                      withOuterLines={false}
                      formatYLabel={(label) => compact(Number(label))}
                      onDataPointClick={({ index }) => {
                        setMonthTip(index);
                        load(index);
                      }}
                      style={{ borderRadius: 16 }}
                    />
                  </View>
                ) : (
                  <Text className="mt-4 font-sans text-sm text-muted text-left">
                    در شش ماه گذشته تراکنشی ثبت نشده است.
                  </Text>
                )}
                {monthTip != null && months[monthTip] ? (
                  <ChartTip
                    title={months[monthTip].label}
                    lines={[
                      { label: "درآمد", value: toman(months[monthTip].income) },
                      { label: "هزینه", value: toman(months[monthTip].expense) },
                    ]}
                  />
                ) : hasMonths ? (
                  <Text className="mt-3 font-sans text-xs text-muted text-left">نقطه نمودار را لمس کنید.</Text>
                ) : null}
              </SurfaceCard>
              <SurfaceCard>
                <Text className="font-sans-bold text-base text-ink text-left">هزینه هر حساب</Text>
                {accounts.length > 1 && plotWidth > 0 ? (
                  <View className="mt-2" style={{ direction: "ltr" }}>
                    <View>
                      <BarChart
                        data={{
                          labels: accounts.map((account) => account.account_name),
                          datasets: [{ data: accounts.map((account) => account.amount / 10) }],
                        }}
                        width={chartWidth}
                        height={200}
                        fromZero
                        yAxisLabel=""
                        yAxisSuffix=""
                        withInnerLines={false}
                        chartConfig={chartConfig}
                        style={{ borderRadius: 16, paddingRight: 64 }}
                      />
                      <View
                        style={{
                          position: "absolute",
                          left: 64,
                          right: 0,
                          top: 0,
                          bottom: 28,
                          flexDirection: "row",
                        }}
                      >
                        {accounts.map((account, index) => (
                          <Pressable
                            key={account.account_name}
                            style={{ flex: 1 }}
                            accessibilityRole="button"
                            accessibilityLabel={account.account_name}
                            onPress={() => setAccountTip(index)}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                ) : null}
                {accounts.length > 1 && accountTip != null && accounts[accountTip] ? (
                  <ChartTip
                    title={accounts[accountTip].account_name}
                    lines={[{ label: "هزینه", value: toman(accounts[accountTip].amount) }]}
                  />
                ) : accounts.length > 1 ? (
                  <Text className="mt-3 font-sans text-xs text-muted text-left">ستون نمودار را لمس کنید.</Text>
                ) : (
                  <Text className="mt-4 font-sans text-sm text-muted text-left">
                    {accounts.length === 1
                      ? `همه هزینه‌های این ماه از حساب ${accounts[0].account_name} بوده است.`
                      : "این ماه هزینه‌ای روی چند حساب ثبت نشده است."}
                  </Text>
                )}
              </SurfaceCard>
              <SurfaceCard>
                <Text className="font-sans-bold text-base text-ink text-left">سهم خرج از درآمد</Text>
                {data.income > 0 && plotWidth > 0 ? (
                  <View className="mt-2 items-center" style={{ direction: "ltr" }}>
                    <ProgressChart
                      data={{ data: [Math.min(1, spentShare)] }}
                      width={chartWidth}
                      height={140}
                      strokeWidth={14}
                      radius={46}
                      hideLegend
                      chartConfig={chartConfig}
                    />
                    <Text className="font-sans text-sm text-ink text-left">
                      {faNumber(Math.round(spentShare * 100))}٪ از درآمد {monthLabel} خرج شده است.
                    </Text>
                  </View>
                ) : (
                  <Text className="mt-4 font-sans text-sm text-muted text-left">
                    با ثبت درآمد، سهم خرج از درآمد اینجا نمایش داده می‌شود.
                  </Text>
                )}
              </SurfaceCard>
            </View>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}

function Donut({
  slices,
  selected,
  onSelect,
  size = 180,
  thickness = 28,
}: {
  slices: { key: string; amount: number; color: string }[];
  selected: string | null;
  onSelect: (key: string) => void;
  size?: number;
  thickness?: number;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.amount, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let cursor = 0;
  return (
    <Svg width={size} height={size}>
      <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
        {slices.map((slice) => {
          const length = (slice.amount / total) * circumference;
          const dash = `${length} ${circumference - length}`;
          const offset = cursor;
          cursor += length;
          return (
            <Circle
              key={slice.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={slice.color}
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeOpacity={selected && selected !== slice.key ? 0.35 : 1}
              fill="none"
              onPress={() => onSelect(slice.key)}
            />
          );
        })}
      </G>
    </Svg>
  );
}

function ChartTip({ title, lines }: { title: string; lines: { label: string; value: string }[] }) {
  return (
    <View className="mt-3 self-start rounded-2xl bg-fill px-3 py-2">
      <Text className="font-sans-semibold text-sm text-ink text-left">{title}</Text>
      {lines.map((line) => (
        <Text key={line.label} className="mt-1 font-sans text-xs text-muted text-left">
          {line.label}: {line.value}
        </Text>
      ))}
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center">
      <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <Text className="mr-2 font-sans text-xs text-muted text-left">{label}</Text>
    </View>
  );
}

function InsightTile({ title, value, tint }: { title: string; value: string; tint: string }) {
  return (
    <View className={`flex-1 rounded-[24px] p-4 ${tint}`}>
      <Text className="font-sans text-xs text-muted text-left">{title}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit className="mt-2 font-sans-bold text-base text-ink text-left">
        {value}
      </Text>
    </View>
  );
}
