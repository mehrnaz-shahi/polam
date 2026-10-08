import { useCallback, useState } from "react";
import { RefreshControl, Text, View, Pressable } from "react-native";
import { ArrowLeftRight, Minus, Plus, type LucideIcon } from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { listTransactions, totals, Transaction } from "@/src/db/database";
import { toman, monthName } from "@/src/utils/format";
import { TransactionRow } from "@/src/components/TransactionRow";
import { Content, Screen, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import { DoodleIcon } from "@/src/components/icons/DoodleIcon";
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
            <View className="flex-1 flex items-start">
              <Text className="font-sans text-sm text-muted text-left">سلام، خوش آمدید</Text>
              <Text className="mt-1 font-sans-bold text-2xl text-ink text-left">
                وضعیت مالی شما
              </Text>
            </View>
            <DoodleIcon name="wallet" size={52} />
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
              <View className="mt-5 flex-row">
                <Quick label="هزینه" icon={Minus} onPress={() => router.push("/expense")} />
                <Quick label="درآمد" icon={Plus} onPress={() => router.push("/income")} />
                <Quick
                  label="انتقال"
                  icon={ArrowLeftRight}
                  onPress={() => router.push("/transfer")}
                />
              </View>
            </View>
            <View className={isWide ? "flex-1" : "mt-8"}>
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="font-sans-bold text-lg text-ink text-left">فعالیت اخیر</Text>
                <Pressable onPress={() => router.push("/transactions")}>
                  <Text className="font-sans-semibold text-sm text-accent text-left">مشاهده همه</Text>
                </Pressable>
              </View>
              {items.length ? (
                <View className="rounded-[28px] border border-line bg-panel px-4">
                  {items.map((item, index) => (
                    <View key={item.id}>
                      {index > 0 ? <View className="h-px bg-line" /> : null}
                      <TransactionRow
                        grouped
                        item={item}
                        onPress={() => router.push(`/transaction/${item.id}`)}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <EmptyState
                  title="هنوز تراکنشی ثبت نشده"
                  description="اولین درآمد یا هزینه خود را ثبت کنید."
                  icon="piggy"
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
  icon: Icon,
  onPress,
}: {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
}) {
  const colors = usePalette();
  return (
    <Pressable onPress={onPress} className="flex-1 items-center active:opacity-70">
      <View className="h-14 w-14 items-center justify-center rounded-full border border-line bg-panel">
        <Icon size={22} color={colors.primary} strokeWidth={1.75} />
      </View>
      <Text className="mt-2 font-sans-semibold text-xs text-ink text-left">{label}</Text>
    </Pressable>
  );
}
