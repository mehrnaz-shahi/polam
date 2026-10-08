import { useCallback, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { addReminder, deleteReminder, listReminders } from "@/src/db/database";
import { persianDate } from "@/src/utils/format";
import { cancelLocalReminder, scheduleLocalReminder } from "@/src/utils/notifications";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import { DateField, EmptyState, Field, PrimaryButton, SurfaceCard } from "@/src/components/ui";

export default function Reminders() {
  const router = useRouter();
  const { isWide } = useResponsive();
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listReminders>>>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | null>(new Date());
  const load = useCallback(() => listReminders().then(setRows), []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const save = async () => {
    if (!title.trim() || !date) {
      Alert.alert("اطلاعات ناقص", "عنوان و تاریخ یادآوری را وارد کنید.");
      return;
    }
    const due = new Date(date);
    due.setHours(9, 0, 0, 0);
    const notificationId = await scheduleLocalReminder(title.trim(), "یادآوری مالی پولکی", due);
    await addReminder({
      title: title.trim(),
      type: "custom",
      dueAt: due.toISOString(),
      notificationId,
    });
    if (!notificationId) {
      Alert.alert("یادآوری ذخیره شد", "زمان‌بندی اعلان روی این دستگاه انجام نشد.");
    }
    setTitle("");
    setDate(new Date());
    load();
  };

  const form = (
    <SurfaceCard>
      <Text className="font-sans-bold text-base text-ink text-left">یادآوری جدید</Text>
      <View className="mt-4">
        <Field label="عنوان" value={title} onChangeText={setTitle} placeholder="مثلاً پرداخت قبض" />
        <DateField label="تاریخ" value={date} onChange={setDate} />
        <PrimaryButton title="ثبت یادآوری" onPress={save} icon="checkmark" />
      </View>
    </SurfaceCard>
  );

  return (
    <Screen
      header={
        <ScreenHeader
          title="یادآوری‌ها"
          subtitle="ساعت ۹ صبح روز انتخاب‌شده"
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
                    <Text className="font-sans-bold text-base text-ink text-left">{item.title}</Text>
                    <Text className="mt-1 font-sans text-xs text-muted text-left">{persianDate(item.due_at)}</Text>
                    <Pressable
                      onPress={async () => {
                        if (item.notification_id) await cancelLocalReminder(item.notification_id);
                        await deleteReminder(item.id);
                        load();
                      }}
                      className="mt-3 items-center py-2"
                    >
                      <Text className="font-sans-semibold text-xs text-error text-left">حذف</Text>
                    </Pressable>
                  </SurfaceCard>
                ))
              ) : (
                <EmptyState title="یادآوری ندارید" description="یک تاریخ برای یادآوری انتخاب کنید." icon="calendar" />
              )}
            </View>
            <View className={isWide ? "w-[38%]" : "mt-3"}>{form}</View>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
