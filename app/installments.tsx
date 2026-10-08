import { useCallback, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { addInstallment, listInstallments, payInstallment } from "@/src/db/database";
import { faNumber, parseAmount, toman } from "@/src/utils/format";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import { EmptyState, Field, PrimaryButton, SurfaceCard } from "@/src/components/ui";

const asRial = (value: string) => Math.round(parseAmount(value) * 10);

export default function Installments() {
  const router = useRouter();
  const { isWide } = useResponsive();
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listInstallments>>>([]);
  const [title, setTitle] = useState("");
  const [total, setTotal] = useState("");
  const [count, setCount] = useState("");
  const [payment, setPayment] = useState("");
  const load = useCallback(() => listInstallments().then(setRows), []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const save = async () => {
    const totalAmount = asRial(total);
    const parts = Math.round(parseAmount(count));
    if (!title.trim() || totalAmount <= 0 || parts <= 0) {
      Alert.alert("اطلاعات ناقص", "عنوان، مبلغ کل و تعداد اقساط را وارد کنید.");
      return;
    }
    const paymentAmount = asRial(payment) || Math.round(totalAmount / parts);
    await addInstallment({
      title: title.trim(),
      totalAmount,
      count: parts,
      paymentAmount,
      dueDate: new Date().toISOString(),
      startDate: new Date().toISOString(),
      reminder: false,
    });
    setTitle("");
    setTotal("");
    setCount("");
    setPayment("");
    load();
  };

  const form = (
    <SurfaceCard>
      <Text className="font-sans-bold text-base text-ink text-left">قسط جدید</Text>
      <View className="mt-4">
        <Field label="عنوان" value={title} onChangeText={setTitle} placeholder="مثلاً خرید لوازم" />
        <Field label="مبلغ کل (تومان)" value={total} onChangeText={setTotal} keyboardType="number-pad" placeholder="۰" />
        <Field label="تعداد اقساط" value={count} onChangeText={setCount} keyboardType="number-pad" placeholder="۶" />
        <Field
          label="مبلغ هر قسط (تومان)"
          value={payment}
          onChangeText={setPayment}
          keyboardType="number-pad"
          placeholder="خالی یعنی تقسیم مساوی"
        />
        <PrimaryButton title="ثبت" onPress={save} icon="checkmark" />
      </View>
    </SurfaceCard>
  );

  return (
    <Screen
      header={
        <ScreenHeader title="اقساط" subtitle="پرداخت‌های دوره‌ای" onBack={() => router.back()} />
      }
    >
      <ScreenScroll keyboard>
        <Content>
          <View className={isWide ? "flex-row gap-6" : ""}>
            <View className={isWide ? "flex-1" : ""}>
              {rows.length ? (
                rows.map((item) => {
                  const done = item.paid_count >= item.count;
                  return (
                    <SurfaceCard key={item.id} className="mb-3">
                      <Text className="font-sans-bold text-base text-ink text-left">{item.title}</Text>
                      <Text className="mt-1 font-sans text-xs text-muted text-left">
                        {faNumber(item.paid_count)} از {faNumber(item.count)} قسط · هر قسط {toman(item.payment_amount)}
                      </Text>
                      {done ? (
                        <Text className="mt-3 font-sans-semibold text-xs text-success text-left">تمام شد</Text>
                      ) : (
                        <Pressable
                          onPress={() => payInstallment(item.id).then(load)}
                          className="mt-4 items-center rounded-2xl bg-accent-soft py-3"
                        >
                          <Text className="font-sans-semibold text-sm text-accent-strong text-left">پرداخت قسط</Text>
                        </Pressable>
                      )}
                    </SurfaceCard>
                  );
                })
              ) : (
                <EmptyState title="قسطی ثبت نشده" description="یک برنامه پرداخت اضافه کنید." icon="calendar" />
              )}
            </View>
            <View className={isWide ? "w-[38%]" : "mt-3"}>{form}</View>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
