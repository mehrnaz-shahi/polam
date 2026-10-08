import { useEffect, useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { z } from "zod";
import {
  Account,
  Category,
  Transaction,
  listAccounts,
  listCategories,
} from "@/src/db/database";
import { toman } from "@/src/utils/format";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "../layout/Screen";
import {
  AmountInput,
  DateField,
  Field,
  IconButton,
  PrimaryButton,
  SelectionRow,
  SurfaceCard,
} from "../ui";

const schema = z.object({
  amount: z.number().positive("مبلغ باید بیشتر از صفر باشد"),
  accountId: z.string().min(1, "حساب را انتخاب کنید"),
  categoryId: z.string().min(1, "دسته‌بندی را انتخاب کنید"),
});

export type TransactionInput = {
  type: "expense" | "income";
  amount: number;
  accountId: string;
  categoryId: string;
  date: string;
  note: string;
};

export function TransactionForm({
  type,
  title,
  transaction,
  onSubmit,
  onDelete,
}: {
  type: "expense" | "income";
  title: string;
  transaction?: Transaction;
  onSubmit: (input: TransactionInput) => Promise<void>;
  onDelete?: () => void;
}) {
  const router = useRouter();
  const { isWide } = useResponsive();
  const [amount, setAmount] = useState(
    transaction ? String(Math.round(transaction.amount / 10)) : "",
  );
  const [note, setNote] = useState(transaction?.note ?? "");
  const [date, setDate] = useState(
    transaction ? new Date(transaction.date) : new Date(),
  );
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accountId, setAccountId] = useState(transaction?.account_id ?? "");
  const [categoryId, setCategoryId] = useState(transaction?.category_id ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const parsed = useMemo(
    () => Number(amount.replace(/[٬,\s]/g, "")),
    [amount],
  );

  useEffect(() => {
    Promise.all([listAccounts(), listCategories(type)]).then(
      ([accountRows, categoryRows]) => {
        setAccounts(accountRows);
        setCategories(categoryRows);
        setAccountId((current) => current || accountRows[0]?.id || "");
        setCategoryId((current) => current || categoryRows[0]?.id || "");
      },
    );
  }, [type]);

  const save = async () => {
    const result = schema.safeParse({ amount: parsed, accountId, categoryId });
    if (!result.success) {
      setError(result.error.issues[0]?.message || "اطلاعات را کامل کنید");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        type,
        amount: Math.round(parsed * 10),
        accountId,
        categoryId,
        date: date.toISOString(),
        note: note.trim(),
      });
    } catch {
      Alert.alert("خطا", "ذخیره تراکنش انجام نشد.");
    } finally {
      setSaving(false);
    }
  };

  const form = (
    <>
      <SelectionRow
        label="دسته‌بندی"
        items={categories.map((item) => ({
          id: item.id,
          title: item.name,
          icon: item.icon,
        }))}
        value={categoryId}
        onChange={setCategoryId}
      />
      <SelectionRow
        label="حساب"
        items={accounts.map((item) => ({
          id: item.id,
          title: item.name,
          icon: "💳",
          meta: toman(item.balance),
        }))}
        value={accountId}
        onChange={setAccountId}
      />
      <DateField value={date} onChange={(next) => next && setDate(next)} />
      <Field
        label="یادداشت (اختیاری)"
        value={note}
        onChangeText={setNote}
        placeholder="مثلاً خرید روزانه"
        multiline
      />
      {error ? (
        <Text className="mb-3 font-sans text-sm text-error">{error}</Text>
      ) : null}
      <PrimaryButton
        title={transaction ? "ذخیره تغییرات" : type === "expense" ? "ثبت هزینه" : "ثبت درآمد"}
        onPress={save}
        loading={saving}
        icon="checkmark"
      />
    </>
  );

  return (
    <Screen>
      <ScreenScroll keyboard>
        <Content className="pt-4">
          <ScreenHeader
            title={title}
            subtitle={transaction ? "جزئیات را ویرایش کنید" : "اطلاعات تراکنش را وارد کنید"}
            onBack={() => router.back()}
            trailing={
              onDelete ? (
                <IconButton
                  icon="trash-outline"
                  label="حذف تراکنش"
                  danger
                  onPress={onDelete}
                />
              ) : undefined
            }
          />
          <View className={isWide ? "flex-row gap-6" : ""}>
            <View className={isWide ? "w-[38%]" : ""}>
              <AmountInput
                value={amount}
                onChangeText={setAmount}
                autoFocus={!transaction}
              />
              {isWide ? (
                <SurfaceCard>
                  <Text className="font-sans-bold text-base text-ink">
                    ثبت دقیق، تصمیم بهتر
                  </Text>
                  <Text className="mt-2 font-sans text-sm leading-7 text-muted">
                    دسته‌بندی و حساب درست، گزارش‌های ماهانه شما را دقیق‌تر می‌کند.
                  </Text>
                </SurfaceCard>
              ) : null}
            </View>
            <View className={isWide ? "flex-1" : ""}>{form}</View>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
