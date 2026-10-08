import { useCallback, useState } from "react";
import { RefreshControl, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { listTransactions, totals, Transaction } from "@/src/db/database";
import { toman, monthName } from "@/src/utils/format";
import { TransactionRow } from "@/src/components/TransactionRow";
import { Content, Screen, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import { BalanceHero, EmptyState } from "@/src/components/ui";
import { usePalette } from "@/src/theme/colors";

export default function Home() {
  const router = useRouter();
  const { isWide } = useResponsive();
  const colors = usePalette();
  const [data, setData] = useState({ balance: 0, income: 0, expense: 0 });
  const [items, setItems] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setData(await totals());
    setItems((await listTransactions()).slice(0, 5));
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

  return (
    <Screen>
      <ScreenScroll
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
      >
        <Content className="pb-36 pt-4">
          <View className="mb-6 flex-row items-center">
            <View className="flex-1">
              <Text className="font-vazir text-sm text-muted">سلام، خوش آمدید</Text>
              <Text className="mt-1 font-vazir-bold text-2xl text-ink dark:text-ink-inverse">
                وضعیت مالی شما
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-900">
              <Ionicons name="wallet-outline" size={24} color={colors.primary} />
            </View>
          </View>
          <View className={isWide ? "flex-row gap-6" : ""}>
            <View className={isWide ? "w-[42%]" : ""}>
              <BalanceHero
                balance={toman(data.balance)}
                income={`+ ${toman(data.income)}`}
                expense={`− ${toman(data.expense)}`}
                incomeLabel={`درآمد ${monthName()}`}
                expenseLabel={`هزینه ${monthName()}`}
              />
              <View className="mt-4 flex-row gap-3">
                <Quick label="هزینه" icon="remove" onPress={() => router.push("/expense")} />
                <Quick label="درآمد" icon="add" onPress={() => router.push("/income")} />
                <Quick
                  label="انتقال"
                  icon="swap-horizontal"
                  onPress={() => router.push("/transfer")}
                />
              </View>
            </View>
            <View className={isWide ? "flex-1" : "mt-8"}>
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="font-vazir-bold text-lg text-ink dark:text-ink-inverse">
                  تراکنش‌های اخیر
                </Text>
                <Pressable onPress={() => router.push("/transactions")}>
                  <Text className="font-vazir-semibold text-sm text-brand-600">مشاهده همه</Text>
                </Pressable>
              </View>
              {items.length ? (
                items.map((item) => (
                  <TransactionRow
                    key={item.id}
                    item={item}
                    onPress={() => router.push(`/transaction/${item.id}`)}
                  />
                ))
              ) : (
                <EmptyState
                  title="هنوز تراکنشی ثبت نشده"
                  description="اولین درآمد یا هزینه خود را ثبت کنید."
                />
              )}
            </View>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}

function Quick({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const colors = usePalette();
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center rounded-2xl border border-line bg-panel p-4 active:opacity-70 dark:border-line-dark dark:bg-panel-dark"
    >
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text className="mt-2 font-vazir-semibold text-xs text-ink dark:text-ink-inverse">
        {label}
      </Text>
    </Pressable>
  );
}
