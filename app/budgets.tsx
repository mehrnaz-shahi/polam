import { useCallback, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { addBudget, budgetUsage, deleteBudget } from "@/src/db/database";
import { parseAmount, toman } from "@/src/utils/format";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import { EmptyState, Field, PrimaryButton, SurfaceCard } from "@/src/components/ui";

const asRial = (value: string) => Math.round(parseAmount(value) * 10);

export default function Budgets() {
  const router = useRouter();
  const { isWide } = useResponsive();
  const [rows, setRows] = useState<Awaited<ReturnType<typeof budgetUsage>>>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const load = useCallback(() => budgetUsage().then(setRows), []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const save = async () => {
    if (!name.trim() || asRial(amount) <= 0) {
      Alert.alert("اطلاعات ناقص", "نام و مبلغ بودجه را وارد کنید.");
      return;
    }
    await addBudget({ name: name.trim(), amount: asRial(amount), startDate: new Date().toISOString() });
    setName("");
    setAmount("");
    load();
  };

  const form = (
    <SurfaceCard>
      <Text className="font-sans-bold text-base text-ink text-left">بودجه جدید</Text>
      <View className="mt-4">
        <Field label="عنوان" value={name} onChangeText={setName} placeholder="مثلاً خرید ماهانه" />
        <Field
          label="سقف ماهانه (تومان)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="number-pad"
          placeholder="۰"
        />
        <PrimaryButton title="افزودن بودجه" onPress={save} icon="checkmark" />
      </View>
    </SurfaceCard>
  );

  return (
    <Screen
      header={
        <ScreenHeader
          title="بودجه‌ها"
          subtitle="سقف هزینه هر ماه"
          onBack={() => router.back()}
        />
      }
    >
      <ScreenScroll keyboard>
        <Content>
          <View className={isWide ? "flex-row gap-6" : ""}>
            <View className={isWide ? "flex-1" : ""}>
              {rows.length ? (
                rows.map((budget) => (
                  <SurfaceCard key={budget.id} className="mb-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="flex-1 font-sans-bold text-base text-ink text-left">{budget.name}</Text>
                      <Pressable
                        onPress={() =>
                          Alert.alert("حذف بودجه", `بودجه «${budget.name}» حذف شود؟`, [
                            { text: "انصراف", style: "cancel" },
                            {
                              text: "حذف",
                              style: "destructive",
                              onPress: () => deleteBudget(budget.id).then(load),
                            },
                          ])
                        }
                      >
                        <Text className="font-sans-semibold text-xs text-error text-left">حذف</Text>
                      </Pressable>
                    </View>
                    <Text className="mt-2 font-sans text-xs text-muted text-left">
                      مصرف {toman(budget.used)} از {toman(budget.amount)}
                    </Text>
                    <View className="mt-3 h-2 overflow-hidden rounded-full bg-fill">
                      <View
                        className={`h-full rounded-full ${budget.remaining < 0 ? "bg-error" : "bg-brand-500"}`}
                        style={{ width: `${Math.min(100, budget.percent)}%` }}
                      />
                    </View>
                    <Text
                      className={`mt-2 font-sans-semibold text-xs text-left ${
                        budget.remaining < 0 ? "text-error" : "text-ink"
                      }`}
                    >
                      {budget.remaining < 0 ? "از بودجه عبور کرده‌اید" : "مانده"}: {toman(Math.abs(budget.remaining))}
                    </Text>
                  </SurfaceCard>
                ))
              ) : (
                <EmptyState title="بودجه‌ای ثبت نشده" description="یک سقف ماهانه اضافه کنید." icon="pie" />
              )}
            </View>
            <View className={isWide ? "w-[38%]" : "mt-3"}>{form}</View>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
