import { useCallback, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  addCategory,
  archiveCategory,
  listCategories,
  Category,
  updateCategory,
} from "@/src/db/database";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import {
  ChipRow,
  EmptyState,
  Field,
  FilterChip,
  PrimaryButton,
  SegmentedControl,
  SurfaceCard,
} from "@/src/components/ui";

export default function Categories() {
  const router = useRouter();
  const { isWide } = useResponsive();
  const [items, setItems] = useState<Category[]>([]);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✨");
  const [editing, setEditing] = useState<string | null>(null);
  const [parent, setParent] = useState<string | null>(null);
  const load = useCallback(() => listCategories().then(setItems), []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const visible = items.filter((item) => item.type === type);

  const save = async () => {
    if (!name.trim()) return;
    if (editing) await updateCategory(editing, name.trim(), icon);
    else await addCategory({ name: name.trim(), type, icon, parentId: parent });
    setName("");
    setIcon("✨");
    setParent(null);
    setEditing(null);
    load();
  };

  const archive = (item: Category) =>
    Alert.alert("بایگانی دسته‌بندی", `«${item.name}» بایگانی شود؟`, [
      { text: "انصراف", style: "cancel" },
      { text: "بایگانی", style: "destructive", onPress: () => archiveCategory(item.id).then(load) },
    ]);

  const form = (
    <SurfaceCard>
      <Text className="font-vazir-bold text-base text-ink dark:text-ink-inverse">
        {editing ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
      </Text>
      <Text className="mb-2 mt-4 font-vazir text-xs text-muted">دسته اصلی (اختیاری)</Text>
      <ChipRow>
        <FilterChip label="بدون والد" selected={!parent} onPress={() => setParent(null)} />
        {items
          .filter((item) => item.type === type && !item.parent_id && item.id !== editing)
          .map((item) => (
            <FilterChip
              key={item.id}
              label={item.name}
              icon={item.icon}
              selected={parent === item.id}
              onPress={() => setParent(item.id)}
            />
          ))}
      </ChipRow>
      <View className="mt-4 flex-row gap-2">
        <TextInput
          value={icon}
          onChangeText={setIcon}
          className="h-14 w-16 rounded-2xl border border-line bg-panel text-center text-xl dark:border-line-dark dark:bg-panel-dark dark:text-ink-inverse"
        />
        <View className="flex-1">
          <Field
            label="نام دسته‌بندی"
            value={name}
            onChangeText={setName}
            placeholder="نام دسته‌بندی"
            className="mb-0"
          />
        </View>
      </View>
      <View className="mt-4">
        <PrimaryButton title={editing ? "ذخیره" : "افزودن دسته‌بندی"} onPress={save} icon="checkmark" />
      </View>
      {editing ? (
        <Pressable
          onPress={() => {
            setEditing(null);
            setName("");
            setIcon("✨");
            setParent(null);
          }}
          className="mt-3 items-center py-2"
        >
          <Text className="font-vazir-semibold text-sm text-muted">انصراف</Text>
        </Pressable>
      ) : null}
    </SurfaceCard>
  );

  return (
    <Screen>
      <ScreenScroll keyboard>
        <Content className="pt-4">
          <ScreenHeader
            title="دسته‌بندی‌ها"
            subtitle="سازمان‌دهی هزینه‌ها و درآمدها"
            onBack={() => router.back()}
          />
          <SegmentedControl
            value={type}
            items={[
              { value: "expense", label: "هزینه‌ها" },
              { value: "income", label: "درآمدها" },
            ]}
            onChange={setType}
          />
          <View className={`mt-5 ${isWide ? "flex-row gap-6" : ""}`}>
            <View className={isWide ? "flex-1" : ""}>
              {visible.length ? (
                visible.map((item) => (
                  <SurfaceCard key={item.id} className="mb-3 flex-row items-center p-4">
                    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900">
                      <Text className="text-xl">{item.icon}</Text>
                    </View>
                    <Text className="mr-3 flex-1 font-vazir-semibold text-sm text-ink dark:text-ink-inverse">
                      {item.name}
                    </Text>
                    {!item.is_default ? (
                      <View className="flex-row gap-3">
                        <Pressable
                          onPress={() => {
                            setEditing(item.id);
                            setName(item.name);
                            setIcon(item.icon);
                          }}
                        >
                          <Text className="font-vazir-semibold text-xs text-brand-600">ویرایش</Text>
                        </Pressable>
                        <Pressable onPress={() => archive(item)}>
                          <Text className="font-vazir-semibold text-xs text-rose-500">بایگانی</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Text className="font-vazir text-xs text-muted">پیش‌فرض</Text>
                    )}
                  </SurfaceCard>
                ))
              ) : (
                <EmptyState
                  title="دسته‌ای وجود ندارد"
                  description="یک دسته‌بندی جدید بسازید."
                  icon="grid-outline"
                />
              )}
            </View>
            <View className={isWide ? "w-[40%]" : "mt-3"}>{form}</View>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
