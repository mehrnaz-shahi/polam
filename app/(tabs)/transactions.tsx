import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  deleteTransaction,
  listAccounts,
  listCategories,
  listTransactions,
  listTransfers,
  Account,
  Category,
  Transaction,
  Transfer,
} from "@/src/db/database";
import { TransactionRow } from "@/src/components/TransactionRow";
import { Content, Screen, ScreenHeader, useResponsive } from "@/src/components/layout/Screen";
import { usePalette } from "@/src/theme/colors";
import { TAB_BAR_CLEARANCE } from "@/src/components/layout/FloatingTabBar";
import {
  ChipRow,
  DateField,
  EmptyState,
  FilterChip,
  SearchField,
  SurfaceCard,
  TransferRow,
} from "@/src/components/ui";

export default function Transactions() {
  const router = useRouter();
  const { isWide } = useResponsive();
  const colors = usePalette();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [type, setType] = useState<"all" | "expense" | "income">("all");
  const [account, setAccount] = useState("");
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [rows, tr] = await Promise.all([
      listTransactions(q, {
        type: type === "all" ? undefined : type,
        accountId: account || undefined,
        categoryId: category || undefined,
        from: from?.toISOString(),
        to: to
          ? new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59).toISOString()
          : undefined,
      }),
      listTransfers(),
    ]);
    setItems(rows);
    setTransfers(tr);
  }, [q, type, account, category, from, to]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([listAccounts(), listCategories()]).then(([a, c]) => {
        setAccounts(a);
        setCats(c);
      });
      load();
    }, [load]),
  );

  const activeFilters = useMemo(
    () => [type !== "all", Boolean(account), Boolean(category), Boolean(from), Boolean(to)].filter(Boolean).length,
    [type, account, category, from, to],
  );

  const remove = (x: Transaction) =>
    Alert.alert("حذف تراکنش", "آیا از حذف این تراکنش مطمئن هستید؟", [
      { text: "انصراف", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          await deleteTransaction(x.id);
          load();
        },
      },
    ]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filters = (
    <SurfaceCard className={isWide ? "p-4" : "mt-3 p-4"}>
      <ChipRow>
        <FilterChip label="همه" selected={type === "all"} onPress={() => setType("all")} />
        <FilterChip label="هزینه" selected={type === "expense"} onPress={() => setType("expense")} />
        <FilterChip label="درآمد" selected={type === "income"} onPress={() => setType("income")} />
        {cats
          .filter((c) => type === "all" || c.type === type)
          .map((c) => (
            <FilterChip
              key={c.id}
              label={c.name}
              icon={c.icon}
              selected={category === c.id}
              onPress={() => setCategory(category === c.id ? "" : c.id)}
            />
          ))}
      </ChipRow>
      <View className="mt-3">
        <ChipRow>
          {accounts.map((a) => (
            <FilterChip
              key={a.id}
              label={a.name}
              selected={account === a.id}
              onPress={() => setAccount(account === a.id ? "" : a.id)}
            />
          ))}
        </ChipRow>
      </View>
      <View className="mt-4 flex-row gap-2">
        <View className="flex-1">
          <DateField label="از تاریخ" value={from} onChange={setFrom} />
        </View>
        <View className="flex-1">
          <DateField label="تا تاریخ" value={to} onChange={setTo} />
        </View>
      </View>
      {activeFilters ? (
        <Pressable
          onPress={() => {
            setType("all");
            setAccount("");
            setCategory("");
            setFrom(null);
            setTo(null);
          }}
          className="mt-2 items-center py-2"
        >
          <Text className="font-vazir-semibold text-xs text-muted">پاک کردن فیلترها</Text>
        </Pressable>
      ) : null}
    </SurfaceCard>
  );

  return (
    <Screen>
      <Content className="flex-1 pt-4">
        <ScreenHeader
          title="تراکنش‌ها"
          subtitle={`${items.length} تراکنش در این نما`}
          trailing={
            isWide ? undefined : (
              <Pressable
                onPress={() => setShowFilters((value) => !value)}
                className={`h-11 w-11 items-center justify-center rounded-2xl border ${
                  showFilters || activeFilters
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900"
                    : "border-line bg-panel dark:border-line-dark dark:bg-panel-dark"
                }`}
              >
                <Ionicons name="options-outline" size={21} color={colors.primary} />
              </Pressable>
            )
          }
        />
        <SearchField
          value={q}
          onChangeText={setQ}
          placeholder="جستجو در یادداشت، حساب یا دسته‌بندی..."
        />
        <View className={`mt-4 flex-1 ${isWide ? "flex-row gap-5" : ""}`}>
          {isWide ? <View className="w-[34%]">{filters}</View> : showFilters ? filters : null}
          <View className={isWide ? "flex-1" : "flex-1"}>
            <FlatList
              className={isWide ? "" : "mt-4"}
              data={items}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              refreshing={refreshing}
              onRefresh={refresh}
              contentContainerStyle={{ paddingBottom: TAB_BAR_CLEARANCE, flexGrow: 1 }}
              renderItem={({ item }) => (
                <TransactionRow
                  item={item}
                  onLongPress={() => remove(item)}
                  onPress={() => router.push(`/transaction/${item.id}`)}
                />
              )}
              ListEmptyComponent={
                <EmptyState
                  title="تراکنشی پیدا نشد"
                  description="فیلترها یا عبارت جستجو را تغییر دهید."
                />
              }
              ListFooterComponent={
                transfers.length > 0 ? (
                  <SurfaceCard className="mt-3">
                    <Text className="font-vazir-bold text-base text-ink dark:text-ink-inverse">
                      انتقال‌های اخیر
                    </Text>
                    {transfers.slice(0, 5).map((t) => (
                      <TransferRow key={t.id} item={t} />
                    ))}
                  </SurfaceCard>
                ) : null
              }
            />
          </View>
        </View>
      </Content>
    </Screen>
  );
}
