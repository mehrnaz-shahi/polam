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
import { DoodleIcon, DoodleName } from "@/src/components/icons/DoodleIcon";
import { parseAmount, persianDate, toman } from "@/src/utils/format";
import { nudgeFocusedField } from "@/src/components/layout/Screen";
import { usePalette } from "@/src/theme/colors";

export function SurfaceCard({
  children,
  className = "",
  ...props
}: ViewProps & { children: ReactNode; className?: string }) {
  return (
    <View
      {...props}
      className={`rounded-card border border-line bg-panel p-4 ${className}`}
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
          <Text className={`${icon ? "mr-2" : ""} font-sans-bold text-white`}>
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
  const colors = usePalette();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`h-11 w-11 items-center justify-center rounded-2xl border ${
        danger ? "border-error-soft bg-error-soft" : "border-line bg-panel"
      }`}
    >
      <Ionicons
        name={icon}
        size={20}
        color={danger ? colors.error : colors.textSecondary}
      />
    </Pressable>
  );
}

const inputText = {
  fontFamily: "Estedad",
  paddingVertical: 0,
  paddingHorizontal: 0,
  margin: 0,
  textAlign: "right" as const,
  includeFontPadding: false,
};

export function Input({
  className = "",
  multiline,
  invalid,
  style,
  onFocus,
  ...props
}: TextInputProps & { invalid?: boolean }) {
  const colors = usePalette();
  return (
    <View
      className={`${multiline ? "min-h-14 py-3" : "h-14 justify-center"} rounded-2xl border bg-panel px-4 ${
        invalid ? "border-error" : "border-line"
      } ${className}`}
    >
      <TextInput
        multiline={multiline}
        placeholderTextColor={colors.textMuted}
        underlineColorAndroid="transparent"
        textAlignVertical={multiline ? "top" : "center"}
        {...props}
        onFocus={(event) => {
          onFocus?.(event);
          nudgeFocusedField();
        }}
        className="font-sans text-[15px] text-ink"
        style={[inputText, style]}
      />
    </View>
  );
}

export function Field({
  label,
  error,
  className = "",
  ...props
}: { label: string; error?: string } & TextInputProps) {
  return (
    <View className={className || "mb-4"}>
      <Text className="mb-2 font-sans-semibold text-sm text-ink text-left">{label}</Text>
      <Input invalid={Boolean(error)} multiline={props.multiline} {...props} />
      {error ? (
        <Text className="mt-1 font-sans text-xs text-error">{error}</Text>
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
  const colors = usePalette();
  return (
    <View className="h-14 flex-row items-center rounded-2xl border border-line bg-panel px-4">
      <Ionicons name="search-outline" size={20} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        underlineColorAndroid="transparent"
        className="ms-2 flex-1 font-sans text-sm text-ink"
        style={inputText}
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
        selected ? "border-brand-600 bg-brand-600" : "border-line bg-panel"
      }`}
    >
      {icon ? <Text className="ml-1">{icon}</Text> : null}
      <Text
        className={`font-sans-semibold text-xs ${
          selected ? "text-white" : "text-ink"
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
    <View className="flex-row rounded-2xl border border-line bg-panel p-1">
      {items.map((item) => (
        <Pressable
          key={item.value}
          onPress={() => onChange(item.value)}
          className={`min-h-11 flex-1 items-center justify-center rounded-xl ${
            value === item.value ? "bg-accent-soft" : ""
          }`}
        >
          <Text
            className={`font-sans-semibold text-sm ${
              value === item.value ? "text-accent-strong" : "text-muted"
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
  icon = "clipboard",
}: {
  title: string;
  description?: string;
  icon?: DoodleName;
}) {
  return (
    <SurfaceCard className="items-center px-6 py-10">
      <DoodleIcon name={icon} size={84} />
      <Text className="mt-4 text-center font-sans-bold text-base text-ink">
        {title}
      </Text>
      {description ? (
        <Text className="mt-2 text-center font-sans text-sm leading-6 text-muted">
          {description}
        </Text>
      ) : null}
    </SurfaceCard>
  );
}

export type SelectItem = {
  id: string;
  title: string;
  icon?: string;
  meta?: string;
};

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
  const colors = usePalette();
  return (
    <View className="mb-5">
      <Text className="mb-2 font-sans-semibold text-sm text-ink text-left">{label}</Text>
      <ChipRow>
        {items.map((item) => {
          const selected = value === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onChange(item.id)}
              className={`min-w-[116px] rounded-2xl border p-4 ${
                selected
                  ? "border-brand-500 bg-accent-soft"
                  : "border-line bg-panel"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-xl">{item.icon ?? "●"}</Text>
                {selected ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colors.primary}
                  />
                ) : null}
              </View>
              <Text
                numberOfLines={1}
                className="mt-3 font-sans-semibold text-sm text-ink text-left"
              >
                {item.title}
              </Text>
              {item.meta ? (
                <Text
                  numberOfLines={1}
                  className="mt-1 font-sans text-xs text-muted text-left"
                >
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
  const colors = usePalette();
  const amount = parseAmount(value);
  return (
    <SurfaceCard className="mb-6 border-accent-soft bg-accent-soft">
      <Text className="font-sans-semibold text-sm text-accent-strong text-left">
        {label}
      </Text>
      <TextInput
        autoFocus={autoFocus}
        keyboardType="number-pad"
        value={value}
        onChangeText={onChangeText}
        placeholder="۰"
        placeholderTextColor={colors.textMuted}
        onFocus={nudgeFocusedField}
        underlineColorAndroid="transparent"
        style={{
          marginTop: 8,
          color: colors.textPrimary,
          fontFamily: "Vazirmatn-Bold",
          fontSize: 36,
          fontWeight: "400",
          paddingVertical: 0,
          marginBottom: 0,
          includeFontPadding: false,
          textAlign: "right",
          textAlignVertical: "center",
          lineHeight: 54,
        }}
      />
      <Text className="mt-2 font-sans text-xs text-muted text-left">
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
  const colors = usePalette();
  const [visible, setVisible] = useState(false);
  return (
    <View className="mb-4 items-start">
      <Text className="mb-2 font-sans-semibold text-sm text-ink">{label}</Text>
      <Pressable
        onPress={() => setVisible(true)}
        className="min-h-14 flex-row items-center rounded-2xl border border-line bg-panel px-4"
      >
        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        <Text className="ms-3 flex-1 font-sans text-sm text-ink text-left">
          {value ? persianDate(value.toISOString()) : placeholder}
        </Text>
        <Ionicons name="chevron-back" size={17} color={colors.textMuted} />
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
}: {
  title: string;
  description?: string;
  icon: DoodleName;
  onPress: () => void;
}) {
  const colors = usePalette();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-card border border-line bg-panel p-4 active:opacity-80"
    >
      <DoodleIcon name={icon} size={44} />
      <View className="mr-4 flex-1 items-start">
        <Text className="font-sans-bold text-base text-ink">{title}</Text>
        {description ? (
          <Text className="mt-1 font-sans text-xs text-muted">
            {description}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-back" size={19} color={colors.textMuted} />
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
      ? "text-success"
      : tone === "negative"
        ? "text-error"
        : "text-ink";
  return (
    <SurfaceCard className="flex-1 items-start">
      <Text className="font-sans text-xs text-muted">{title}</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        className={`mt-2 font-sans-bold text-base ${color}`}
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
    <View className="overflow-hidden rounded-3xl bg-brand-600 p-5 flex-col items-start">
      <View className="absolute -start-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
      <View className="absolute -bottom-12 -end-6 h-28 w-28 rounded-full bg-white/5" />
      <Text className="font-sans text-sm text-white/80">موجودی کل</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        className="mt-2 font-sans-bold text-3xl text-white"
      >
        {balance}
      </Text>
      <Text className="mt-1 font-sans text-xs text-white/70">
        مانده حساب‌های فعال
      </Text>
      <View className="mt-7 flex-row gap-3">
        <View className="flex-1 rounded-2xl bg-white/10 p-3 items-start">
          <Text className="font-sans text-xs text-white/70">{incomeLabel}</Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            className="mt-1 font-sans-bold text-sm text-white"
          >
            {income}
          </Text>
        </View>
        <View className="flex-1 rounded-2xl bg-white/10 p-3 items-start">
          <Text className="font-sans text-xs text-white/70">
            {expenseLabel}
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            className="mt-1 font-sans-bold text-sm text-white"
          >
            {expense}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function TransferRow({ item }: { item: Transfer }) {
  const colors = usePalette();
  return (
    <View className="mt-4 flex-row items-center">
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft">
        <Ionicons name="swap-horizontal" size={18} color={colors.primary} />
      </View>
      <View className="mr-3 flex-1">
        <Text numberOfLines={1} className="font-sans-semibold text-sm text-ink">
          {item.source_name} ← {item.destination_name}
        </Text>
        <Text numberOfLines={1} className="mt-1 font-sans text-xs text-muted">
          {item.note || "انتقال وجه"}
        </Text>
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        className="max-w-[36%] font-sans-bold text-xs text-ink"
      >
        {toman(item.amount)}
      </Text>
    </View>
  );
}
