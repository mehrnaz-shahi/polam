import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ReactNode, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewProps,
} from "react-native";
import { Transfer } from "@/src/db/database";
import { persianDate, toman } from "@/src/utils/format";

export function SurfaceCard({
  children,
  className = "",
  ...props
}: ViewProps & { children: ReactNode; className?: string }) {
  return (
    <View
      {...props}
      className={`rounded-card border border-line bg-panel p-5 dark:border-line-dark dark:bg-panel-dark ${className}`}
    >
      {children}
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  tone = "brand",
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: "brand" | "danger";
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      className={`min-h-14 flex-row items-center justify-center rounded-2xl px-5 active:opacity-80 ${
        tone === "danger" ? "bg-danger" : "bg-brand-600"
      } ${disabled ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={19} color="white" /> : null}
          <Text className={`${icon ? "mr-2" : ""} font-vazir-bold text-white`}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`h-11 w-11 items-center justify-center rounded-2xl border ${
        danger
          ? "border-rose-100 bg-rose-50 dark:border-rose-900 dark:bg-rose-950"
          : "border-line bg-panel dark:border-line-dark dark:bg-panel-dark"
      }`}
    >
      <Ionicons name={icon} size={20} color={danger ? "#e11d48" : "#66776e"} />
    </Pressable>
  );
}

export function Field({
  label,
  error,
  className = "",
  ...props
}: { label: string; error?: string } & TextInputProps) {
  return (
    <View className={`mb-4 ${className}`}>
      <Text className="mb-2 font-vazir-semibold text-sm text-ink dark:text-ink-inverse">
        {label}
      </Text>
      <TextInput
        placeholderTextColor="#8a9991"
        {...props}
        className={`min-h-14 rounded-2xl border bg-panel px-4 text-right font-vazir text-[15px] text-ink dark:bg-panel-dark dark:text-ink-inverse ${
          error ? "border-rose-400" : "border-line dark:border-line-dark"
        } ${props.multiline ? "py-4" : ""}`}
      />
      {error ? (
        <Text className="mt-1 font-vazir text-xs text-rose-500">{error}</Text>
      ) : null}
    </View>
  );
}

export function SearchField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View className="flex-row items-center rounded-2xl border border-line bg-panel px-4 dark:border-line-dark dark:bg-panel-dark">
      <Ionicons name="search-outline" size={20} color="#8a9991" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9aa59f"
        className="mr-2 h-14 flex-1 font-vazir text-right text-sm text-ink dark:text-ink-inverse"
      />
    </View>
  );
}

export function FilterChip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`min-h-10 flex-row items-center rounded-full border px-4 ${
        selected
          ? "border-brand-600 bg-brand-600"
          : "border-line bg-panel dark:border-line-dark dark:bg-panel-dark"
      }`}
    >
      {icon ? <Text className="ml-1">{icon}</Text> : null}
      <Text
        className={`font-vazir-semibold text-xs ${
          selected ? "text-white" : "text-ink dark:text-ink-inverse"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
    >
      {children}
    </ScrollView>
  );
}

export function SegmentedControl<T extends string>({
  value,
  items,
  onChange,
}: {
  value: T;
  items: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <View className="flex-row rounded-2xl border border-line bg-panel p-1 dark:border-line-dark dark:bg-panel-dark">
      {items.map((item) => (
        <Pressable
          key={item.value}
          onPress={() => onChange(item.value)}
          className={`min-h-11 flex-1 items-center justify-center rounded-xl ${
            value === item.value ? "bg-brand-100 dark:bg-brand-900" : ""
          }`}
        >
          <Text
            className={`font-vazir-semibold text-sm ${
              value === item.value
                ? "text-brand-700 dark:text-brand-200"
                : "text-muted"
            }`}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function EmptyState({
  title,
  description,
  icon = "receipt-outline",
}: {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <SurfaceCard className="items-center px-6 py-10">
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900">
        <Ionicons name={icon} size={26} color="#059669" />
      </View>
      <Text className="mt-4 text-center font-vazir-bold text-base text-ink dark:text-ink-inverse">
        {title}
      </Text>
      {description ? (
        <Text className="mt-2 text-center font-vazir text-sm leading-6 text-muted">
          {description}
        </Text>
      ) : null}
    </SurfaceCard>
  );
}

export type SelectItem = { id: string; title: string; icon?: string; meta?: string };

export function SelectionRow({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: SelectItem[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <View className="mb-5">
      <Text className="mb-2 font-vazir-semibold text-sm text-ink dark:text-ink-inverse">
        {label}
      </Text>
      <ChipRow>
        {items.map((item) => {
          const selected = value === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onChange(item.id)}
              className={`min-w-[116px] rounded-2xl border p-4 ${
                selected
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900"
                  : "border-line bg-panel dark:border-line-dark dark:bg-panel-dark"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-xl">{item.icon ?? "●"}</Text>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={18} color="#059669" />
                ) : null}
              </View>
              <Text
                numberOfLines={1}
                className="mt-3 font-vazir-semibold text-sm text-ink dark:text-ink-inverse"
              >
                {item.title}
              </Text>
              {item.meta ? (
                <Text numberOfLines={1} className="mt-1 font-vazir text-xs text-muted">
                  {item.meta}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </ChipRow>
    </View>
  );
}

export function AmountInput({
  value,
  onChangeText,
  autoFocus = false,
  label = "مبلغ به تومان",
}: {
  value: string;
  onChangeText: (value: string) => void;
  autoFocus?: boolean;
  label?: string;
}) {
  const amount = Number(value.replace(/[٬,\s]/g, ""));
  return (
    <SurfaceCard className="mb-6 border-brand-100 bg-brand-50 dark:border-brand-900 dark:bg-brand-900">
      <Text className="font-vazir-semibold text-sm text-brand-700 dark:text-brand-200">
        {label}
      </Text>
      <TextInput
        autoFocus={autoFocus}
        keyboardType="number-pad"
        value={value}
        onChangeText={onChangeText}
        placeholder="۰"
        placeholderTextColor="#86a397"
        className="mt-2 text-right font-vazir-bold text-4xl text-ink dark:text-ink-inverse"
      />
      <Text className="mt-2 font-vazir text-xs text-muted">
        {amount > 0 ? toman(amount * 10) : "مبلغ را وارد کنید"}
      </Text>
    </SurfaceCard>
  );
}

export function DateField({
  value,
  onChange,
  label = "تاریخ",
  placeholder = "همه",
}: {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <View className="mb-4">
      <Text className="mb-2 font-vazir-semibold text-sm text-ink dark:text-ink-inverse">
        {label}
      </Text>
      <Pressable
        onPress={() => setVisible(true)}
        className="min-h-14 flex-row items-center rounded-2xl border border-line bg-panel px-4 dark:border-line-dark dark:bg-panel-dark"
      >
        <Ionicons name="calendar-outline" size={20} color="#059669" />
        <Text className="mr-3 flex-1 font-vazir text-sm text-ink dark:text-ink-inverse">
          {value ? persianDate(value.toISOString()) : placeholder}
        </Text>
        <Ionicons name="chevron-back" size={17} color="#8a9991" />
      </Pressable>
      {visible ? (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          onChange={(_, date) => {
            setVisible(false);
            if (date) onChange(date);
          }}
        />
      ) : null}
    </View>
  );
}

export function MenuCard({
  title,
  description,
  icon,
  onPress,
  accent = "brand",
}: {
  title: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accent?: "brand" | "rose" | "blue";
}) {
  const color =
    accent === "rose" ? "#e11d48" : accent === "blue" ? "#2563eb" : "#059669";
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-card border border-line bg-panel p-5 active:opacity-80 dark:border-line-dark dark:bg-panel-dark"
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900">
        <Ionicons name={icon} size={23} color={color} />
      </View>
      <View className="mr-4 flex-1">
        <Text className="font-vazir-bold text-base text-ink dark:text-ink-inverse">
          {title}
        </Text>
        {description ? (
          <Text className="mt-1 font-vazir text-xs text-muted">{description}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-back" size={19} color="#8a9991" />
    </Pressable>
  );
}

export function StatCard({
  title,
  value,
  tone = "neutral",
}: {
  title: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}) {
  const color =
    tone === "positive"
      ? "text-brand-600"
      : tone === "negative"
        ? "text-rose-500"
        : "text-ink dark:text-ink-inverse";
  return (
    <SurfaceCard className="flex-1">
      <Text className="font-vazir text-xs text-muted">{title}</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        className={`mt-2 font-vazir-bold text-base ${color}`}
      >
        {value}
      </Text>
    </SurfaceCard>
  );
}

export function BalanceHero({
  balance,
  income,
  expense,
  incomeLabel,
  expenseLabel,
}: {
  balance: string;
  income: string;
  expense: string;
  incomeLabel: string;
  expenseLabel: string;
}) {
  return (
    <View className="overflow-hidden rounded-[32px] bg-brand-600 p-6">
      <View className="absolute -left-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
      <View className="absolute -bottom-12 -right-6 h-28 w-28 rounded-full bg-white/5" />
      <Text className="font-vazir text-sm text-white/80">موجودی کل</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        className="mt-2 font-vazir-bold text-3xl text-white"
      >
        {balance}
      </Text>
      <Text className="mt-1 font-vazir text-xs text-white/70">مانده حساب‌های فعال</Text>
      <View className="mt-7 flex-row gap-3">
        <View className="flex-1 rounded-2xl bg-white/10 p-3">
          <Text className="font-vazir text-xs text-white/70">{incomeLabel}</Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            className="mt-1 font-vazir-bold text-sm text-white"
          >
            {income}
          </Text>
        </View>
        <View className="flex-1 rounded-2xl bg-white/10 p-3">
          <Text className="font-vazir text-xs text-white/70">{expenseLabel}</Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            className="mt-1 font-vazir-bold text-sm text-white"
          >
            {expense}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function TransferRow({ item }: { item: Transfer }) {
  return (
    <View className="mt-4 flex-row items-center">
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950">
        <Ionicons name="swap-horizontal" size={18} color="#2563eb" />
      </View>
      <View className="mr-3 flex-1">
        <Text numberOfLines={1} className="font-vazir-semibold text-sm text-ink dark:text-ink-inverse">
          {item.source_name} ← {item.destination_name}
        </Text>
        <Text numberOfLines={1} className="mt-1 font-vazir text-xs text-muted">
          {item.note || "انتقال وجه"}
        </Text>
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        className="max-w-[36%] font-vazir-bold text-xs text-ink dark:text-ink-inverse"
      >
        {toman(item.amount)}
      </Text>
    </View>
  );
}
