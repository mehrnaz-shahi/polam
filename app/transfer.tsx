import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { addTransfer, listAccounts, Account } from "@/src/db/database";
import { toman } from "@/src/utils/format";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import {
  AmountInput,
  DateField,
  Field,
  PrimaryButton,
  SelectionRow,
  SurfaceCard,
} from "@/src/components/ui";

export default function Transfer() {
  const router = useRouter();
  const { isWide } = useResponsive();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    listAccounts().then((a) => {
      setAccounts(a);
      setFrom(a[0]?.id ?? "");
      setTo(a[1]?.id ?? "");
    });
  }, []);
  const save = async () => {
    const n = Number(amount.replace(/[٬,\s]/g, ""));
    if (!n) {
      setError("مبلغ را وارد کنید");
      return;
    }
    if (!from || !to) {
      setError("هر دو حساب را انتخاب کنید");
      return;
    }
    if (from === to) {
      setError("حساب مبدا و مقصد باید متفاوت باشند");
      return;
    }
    const source = accounts.find((a) => a.id === from);
    if ((source?.balance ?? 0) < n * 10) {
      setError("موجودی حساب مبدا کافی نیست");
      return;
    }
    setSaving(true);
    try {
      await addTransfer({
        source: from,
        destination: to,
        amount: n * 10,
        date: date.toISOString(),
        note: note.trim(),
      });
      router.back();
    } catch {
      Alert.alert("خطا", "انتقال انجام نشد");
    } finally {
      setSaving(false);
    }
  };

  const options = accounts.map((account) => ({
    id: account.id,
    title: account.name,
    icon: "💳",
    meta: toman(account.balance),
  }));

  return (
    <Screen>
      <ScreenScroll keyboard>
        <Content className="pt-4">
          <ScreenHeader
            title="انتقال وجه"
            subtitle="جابجایی امن بین حساب‌های شما"
            onBack={() => router.back()}
          />
          <View className={isWide ? "flex-row gap-6" : ""}>
            <View className={isWide ? "w-[38%]" : ""}>
              <AmountInput value={amount} onChangeText={setAmount} />
              {isWide ? (
                <SurfaceCard>
                  <Text className="font-vazir-bold text-base text-ink dark:text-ink-inverse">
                    انتقال داخلی
                  </Text>
                  <Text className="mt-2 font-vazir text-sm leading-7 text-muted">
                    انتقال بین حساب‌ها روی درآمد و هزینه ماهانه اثری ندارد.
                  </Text>
                </SurfaceCard>
              ) : null}
            </View>
            <View className={isWide ? "flex-1" : ""}>
              <SelectionRow label="از حساب" items={options} value={from} onChange={setFrom} />
              <SelectionRow label="به حساب" items={options} value={to} onChange={setTo} />
              <DateField value={date} onChange={(next) => next && setDate(next)} />
              <Field
                label="یادداشت (اختیاری)"
                value={note}
                onChangeText={setNote}
                placeholder="مثلاً انتقال به حساب پس‌انداز"
              />
              {error ? (
                <Text className="mb-3 font-vazir text-sm text-error">{error}</Text>
              ) : null}
              <PrimaryButton
                title="انتقال وجه"
                icon="swap-horizontal"
                loading={saving}
                onPress={save}
              />
            </View>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
