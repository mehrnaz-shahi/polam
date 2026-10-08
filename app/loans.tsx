import { useCallback, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { addLoan, listLoans, payLoan } from "@/src/db/database";
import { faNumber, parseAmount, toman } from "@/src/utils/format";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import { EmptyState, Field, PrimaryButton, SurfaceCard } from "@/src/components/ui";

const asRial = (value: string) => Math.round(parseAmount(value) * 10);

export default function Loans() {
  const router = useRouter();
  const { isWide } = useResponsive();
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listLoans>>>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [installment, setInstallment] = useState("");
  const [count, setCount] = useState("");
  const load = useCallback(() => listLoans().then(setRows), []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const save = async () => {
    const principal = asRial(amount);
    const installmentAmount = asRial(installment);
    const remainingInstallments = Math.round(parseAmount(count));
    if (!title.trim() || principal <= 0 || installmentAmount <= 0 || remainingInstallments <= 0) {
      Alert.alert("اطلاعات ناقص", "عنوان، مبلغ وام، مبلغ قسط و تعداد اقساط را وارد کنید.");
      return;
    }
    await addLoan({
      title: title.trim(),
      amount: principal,
      interest: 0,
      startDate: new Date().toISOString(),
      frequency: "monthly",
      installmentAmount,
      remainingInstallments,
    });
    setTitle("");
    setAmount("");
    setInstallment("");
    setCount("");
    load();
  };

  const form = (
    <SurfaceCard>
      <Text className="font-sans-bold text-base text-ink text-left">وام جدید</Text>
      <View className="mt-4">
        <Field label="عنوان" value={title} onChangeText={setTitle} placeholder="مثلاً وام مسکن" />
        <Field label="مبلغ وام (تومان)" value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="۰" />
        <Field
          label="مبلغ هر قسط (تومان)"
          value={installment}
          onChangeText={setInstallment}
          keyboardType="number-pad"
          placeholder="۰"
        />
        <Field label="تعداد اقساط" value={count} onChangeText={setCount} keyboardType="number-pad" placeholder="۱۲" />
        <PrimaryButton title="ثبت وام" onPress={save} icon="checkmark" />
      </View>
    </SurfaceCard>
  );

  return (
    <Screen
      header={
        <ScreenHeader title="وام‌ها" subtitle="مانده اصل و اقساط وام" onBack={() => router.back()} />
      }
    >
      <ScreenScroll keyboard>
        <Content>
          <View className={isWide ? "flex-row gap-6" : ""}>
            <View className={isWide ? "flex-1" : ""}>
              {rows.length ? (
                rows.map((loan) => {
                  const done = loan.remaining_principal <= 0 || loan.remaining_installments <= 0;
                  return (
                    <SurfaceCard key={loan.id} className="mb-3">
                      <Text className="font-sans-bold text-base text-ink text-left">{loan.title}</Text>
                      <Text className="mt-1 font-sans text-xs text-muted text-left">
                        اصل باقی‌مانده {toman(loan.remaining_principal)}
                      </Text>
                      <Text className="mt-1 font-sans text-xs text-muted text-left">
                        {faNumber(loan.remaining_installments)} قسط باقی مانده · هر قسط {toman(loan.installment_amount)}
                      </Text>
                      {done ? (
                        <Text className="mt-3 font-sans-semibold text-xs text-success text-left">تسویه شده</Text>
                      ) : (
                        <Pressable
                          onPress={() => payLoan(loan.id, loan.installment_amount).then(load)}
                          className="mt-4 items-center rounded-2xl bg-accent-soft py-3"
                        >
                          <Text className="font-sans-semibold text-sm text-accent-strong text-left">ثبت یک قسط</Text>
                        </Pressable>
                      )}
                    </SurfaceCard>
                  );
                })
              ) : (
                <EmptyState title="وامی ثبت نشده" description="جزئیات وام را وارد کنید." icon="bank" />
              )}
            </View>
            <View className={isWide ? "w-[38%]" : "mt-3"}>{form}</View>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
