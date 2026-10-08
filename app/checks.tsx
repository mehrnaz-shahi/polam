import { useCallback, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { addCheck, listAccounts, listChecks, updateCheckStatus } from "@/src/db/database";
import { parseAmount, persianDate, toman } from "@/src/utils/format";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import {
  DateField,
  EmptyState,
  Field,
  PrimaryButton,
  SegmentedControl,
  SelectionRow,
  SurfaceCard,
} from "@/src/components/ui";

const asRial = (value: string) => Math.round(parseAmount(value) * 10);
const STATUSES = [
  { id: "deposited", label: "واریز" },
  { id: "cleared", label: "وصول" },
  { id: "bounced", label: "برگشت" },
  { id: "cancelled", label: "باطل" },
];

export default function Checks() {
  const router = useRouter();
  const { isWide } = useResponsive();
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listChecks>>>([]);
  const [accounts, setAccounts] = useState<Awaited<ReturnType<typeof listAccounts>>>([]);
  const [type, setType] = useState<"issued" | "received">("issued");
  const [number, setNumber] = useState("");
  const [bank, setBank] = useState("");
  const [person, setPerson] = useState("");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [due, setDue] = useState<Date | null>(new Date());
  const load = useCallback(async () => {
    const [checks, accountRows] = await Promise.all([listChecks(), listAccounts()]);
    setRows(checks);
    setAccounts(accountRows);
    setAccountId((current) => current || accountRows[0]?.id || "");
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const save = async () => {
    if (!number.trim() || !person.trim() || asRial(amount) <= 0 || !accountId || !due) {
      Alert.alert("اطلاعات ناقص", "شماره، شخص، مبلغ، حساب و سررسید را وارد کنید.");
      return;
    }
    await addCheck({
      type,
      checkNumber: number.trim(),
      bank: bank.trim() || "—",
      amount: asRial(amount),
      person: person.trim(),
      issueDate: new Date().toISOString(),
      dueDate: due.toISOString(),
      accountId,
      note: "",
    });
    setNumber("");
    setBank("");
    setPerson("");
    setAmount("");
    load();
  };

  const form = (
    <SurfaceCard>
      <Text className="font-sans-bold text-base text-ink text-left">چک جدید</Text>
      <View className="mt-4">
        <SegmentedControl
          value={type}
          onChange={setType}
          items={[
            { value: "issued", label: "صادره" },
            { value: "received", label: "دریافتی" },
          ]}
        />
        <View className="mt-4">
          <Field label="شماره چک" value={number} onChangeText={setNumber} placeholder="۱۲۳۴۵۶" />
          <Field label="بانک" value={bank} onChangeText={setBank} placeholder="نام بانک" />
          <Field label="شخص یا شرکت" value={person} onChangeText={setPerson} placeholder="نام طرف حساب" />
          <Field label="مبلغ (تومان)" value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="۰" />
          {accounts.length ? (
            <SelectionRow
              label="حساب"
              value={accountId}
              onChange={setAccountId}
              items={accounts.map((account) => ({
                id: account.id,
                title: account.name,
                icon: "💳",
                meta: toman(account.balance),
              }))}
            />
          ) : (
            <Text className="mb-4 font-sans text-sm text-muted text-left">اول یک حساب بسازید.</Text>
          )}
          <DateField label="سررسید" value={due} onChange={setDue} />
          <PrimaryButton title="ثبت چک" onPress={save} icon="checkmark" />
        </View>
      </View>
    </SurfaceCard>
  );

  return (
    <Screen
      header={
        <ScreenHeader title="چک‌ها" subtitle="چک‌های صادره و دریافتی" onBack={() => router.back()} />
      }
    >
      <ScreenScroll keyboard>
        <Content>
          <View className={isWide ? "flex-row gap-6" : ""}>
            <View className={isWide ? "flex-1" : ""}>
              {rows.length ? (
                rows.map((item) => (
                  <SurfaceCard key={item.id} className="mb-3">
                    <Text className="font-sans-bold text-base text-ink text-left">
                      {item.check_number} · {item.person}
                    </Text>
                    <Text className="mt-1 font-sans text-xs text-muted text-left">
                      {item.type === "issued" ? "صادره" : "دریافتی"} · {toman(item.amount)} · سررسید{" "}
                      {persianDate(item.due_date)}
                    </Text>
                    <Text className="mt-1 font-sans text-xs text-muted text-left">
                      وضعیت: {STATUSES.find((status) => status.id === item.status)?.label ?? "در انتظار"}
                    </Text>
                    <View className="mt-3 flex-row flex-wrap gap-2">
                      {STATUSES.map((status) => (
                        <Pressable
                          key={status.id}
                          onPress={() => updateCheckStatus(item.id, status.id).then(load)}
                          className={`rounded-xl px-3 py-2 ${
                            item.status === status.id ? "bg-accent-soft" : "bg-fill"
                          }`}
                        >
                          <Text className="font-sans-semibold text-xs text-ink text-left">{status.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </SurfaceCard>
                ))
              ) : (
                <EmptyState title="چکی ثبت نشده" description="چک صادره یا دریافتی را اضافه کنید." icon="clipboard" />
              )}
            </View>
            <View className={isWide ? "w-[38%]" : "mt-3"}>{form}</View>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
