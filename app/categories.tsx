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
import { Content, nudgeFocusedField, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import { usePalette } from "@/src/theme/colors";
import {
  ChipRow,
  EmptyState,
  Field,
  FilterChip,
  PrimaryButton,
  SegmentedControl,
  SurfaceCard,
} from "@/src/components/ui";

function takeIcon(value: string) {
  const icons = Array.from(value.replace(/\s/g, ""));
  return icons.length ? icons[icons.length - 1] : "";
}

export default function Categories() {
  const router = useRouter();
  const colors = usePalette();
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
    const nextIcon = icon.trim() || "✨";
    if (editing) await updateCategory(editing, name.trim(), nextIcon);
    else await addCategory({ name: name.trim(), type, icon: nextIcon, parentId: parent });
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
      <Text className="font-sans-bold text-base text-ink text-left">
        {editing ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
      </Text>
      <Text className="mb-2 mt-4 font-sans text-xs text-muted text-left">دسته اصلی (اختیاری)</Text>
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
      <View className="mt-4 flex-row items-end gap-3">
        <View className="items-center">
          <Text className="mb-2 font-sans-semibold text-sm text-ink text-left">آیکون</Text>
          <View className="h-14 w-14 items-center justify-center rounded-2xl border border-line bg-panel">
            <TextInput
              value={icon}
              onChangeText={(value) => setIcon(takeIcon(value))}
              placeholder="✨"
              placeholderTextColor={colors.textMuted}
              selectTextOnFocus
              accessibilityLabel="آیکون"
              onFocus={nudgeFocusedField}
              underlineColorAndroid="transparent"
              className="w-full font-sans text-xl text-ink"
              style={{
                textAlign: "center",
                textAlignVertical: "center",
                paddingVertical: 0,
                paddingHorizontal: 0,
                margin: 0,
                includeFontPadding: false,
              }}
            />
          </View>
        </View>
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
          <Text className="font-sans-semibold text-sm text-muted text-left">انصراف</Text>
        </Pressable>
      ) : null}
    </SurfaceCard>
  );

  return (
    <Screen
      header={
        <>
          <ScreenHeader
            title="دسته‌بندی‌ها"
            subtitle="سازمان‌دهی هزینه‌ها و درآمدها"
            onBack={() => router.back()}
          />
          <View className="mb-4">
            <SegmentedControl
              value={type}
              items={[
                { value: "expense", label: "هزینه‌ها" },
                { value: "income", label: "درآمدها" },
              ]}
              onChange={setType}
            />
          </View>
        </>
      }
    >
      <ScreenScroll keyboard>
        <Content>
          <View className={isWide ? "flex-row gap-6" : ""}>
            <View className={isWide ? "flex-1" : ""}>
              {visible.length ? (
                visible.map((item) => (
                  <SurfaceCard key={item.id} className="mb-3 flex-row items-center p-4">
                    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft">
                      <Text className="text-xl">{item.icon}</Text>
                    </View>
                    <Text className="ms-3 flex-1 font-sans-semibold text-sm text-ink text-left">
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
                          <Text className="font-sans-semibold text-xs text-accent text-left">ویرایش</Text>
                        </Pressable>
                        <Pressable onPress={() => archive(item)}>
                          <Text className="font-sans-semibold text-xs text-error text-left">بایگانی</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Text className="font-sans text-xs text-muted text-left">پیش‌فرض</Text>
                    )}
                  </SurfaceCard>
                ))
              ) : (
                <EmptyState
                  title="دسته‌ای وجود ندارد"
                  description="یک دسته‌بندی جدید بسازید."
                  icon="puzzle"
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
