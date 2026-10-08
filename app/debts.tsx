import { useCallback, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { addDebt, deleteDebt, listDebts, payDebt } from "@/src/db/database";
import { parseAmount, toman } from "@/src/utils/format";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import { EmptyState, Field, PrimaryButton, SegmentedControl, SurfaceCard } from "@/src/components/ui";

const asRial = (value: string) => Math.round(parseAmount(value) * 10);

export default function Debts() {
  const router = useRouter();
  const { isWide } = useResponsive();
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listDebts>>>([]);
  const [person, setPerson] = useState("");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"owe" | "owed">("owe");
  const [payments, setPayments] = useState<Record<string, string>>({});
  const load = useCallback(() => listDebts().then(setRows), []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const save = async () => {
    if (!person.trim() || asRial(amount) <= 0) {
      Alert.alert("اطلاعات ناقص", "نام و مبلغ را وارد کنید.");
      return;
    }
    await addDebt({ direction, person: person.trim(), principal: asRial(amount), note: "" });
    setPerson("");
    setAmount("");
    load();
  };

  const pay = async (id: string, remaining: number) => {
    const value = asRial(payments[id] || "");
    const amountToPay = value > 0 ? value : remaining;
    if (amountToPay <= 0) return;
    await payDebt(id, amountToPay);
    setPayments((current) => ({ ...current, [id]: "" }));
    load();
  };

  const form = (
    <SurfaceCard>
      <Text className="font-sans-bold text-base text-ink text-left">ثبت بدهی یا طلب</Text>
      <View className="mt-4">
        <SegmentedControl
          value={direction}
          onChange={setDirection}
          items={[
            { value: "owe", label: "من بدهکارم" },
            { value: "owed", label: "طلب دارم" },
          ]}
        />
        <View className="mt-4">
          <Field label="نام شخص" value={person} onChangeText={setPerson} placeholder="مثلاً علی" />
          <Field
            label="مبلغ (تومان)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            placeholder="۰"
          />
          <PrimaryButton title="ثبت" onPress={save} icon="checkmark" />
        </View>
      </View>
    </SurfaceCard>
  );

  return (
    <Screen
      header={
        <ScreenHeader
          title="بدهی و طلب"
          subtitle="طلب‌ها و بدهی‌های شخصی"
          onBack={() => router.back()}
        />
      }
    >
      <ScreenScroll keyboard>
        <Content>
          <View className={isWide ? "flex-row gap-6" : ""}>
            <View className={isWide ? "flex-1" : ""}>
              {rows.length ? (
                rows.map((item) => (
                  <SurfaceCard key={item.id} className="mb-3">
                    <Text className="font-sans-bold text-base text-ink text-left">{item.person}</Text>
                    <Text className="mt-1 font-sans text-xs text-muted text-left">
                      {item.direction === "owe" ? "بدهکارم" : "طلب دارم"} · مانده {toman(item.remaining)}
                    </Text>
                    {item.status !== "paid" ? (
                      <View className="mt-4">
                        <Field
                          label="مبلغ پرداخت (تومان)"
                          value={payments[item.id] || ""}
                          onChangeText={(value) => setPayments((current) => ({ ...current, [item.id]: value }))}
                          keyboardType="number-pad"
                          placeholder="خالی یعنی کل مانده"
                        />
                        <PrimaryButton title="ثبت پرداخت" onPress={() => pay(item.id, item.remaining)} icon="checkmark" />
                      </View>
                    ) : (
                      <Text className="mt-3 font-sans-semibold text-xs text-success text-left">تسویه شده</Text>
                    )}
                    <Pressable
                      onPress={() =>
                        Alert.alert("حذف", `مورد «${item.person}» حذف شود؟`, [
                          { text: "انصراف", style: "cancel" },
                          {
                            text: "حذف",
                            style: "destructive",
                            onPress: () => deleteDebt(item.id).then(load),
                          },
                        ])
                      }
                      className="mt-3 items-center py-2"
                    >
                      <Text className="font-sans-semibold text-xs text-error text-left">حذف</Text>
                    </Pressable>
                  </SurfaceCard>
                ))
              ) : (
                <EmptyState title="موردی ثبت نشده" description="یک بدهی یا طلب اضافه کنید." icon="handshake" />
              )}
            </View>
            <View className={isWide ? "w-[38%]" : "mt-3"}>{form}</View>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
