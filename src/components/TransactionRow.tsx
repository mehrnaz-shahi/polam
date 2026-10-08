import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { Transaction } from "@/src/db/database";
import { rial, shortDate } from "@/src/utils/format";
import { usePalette } from "@/src/theme/colors";

export function TransactionRow({
  item,
  onPress,
  onLongPress,
}: {
  item: Transaction;
  onPress?: () => void;
  onLongPress?: () => void;
}) {
  const colors = usePalette();
  const income = item.type === "income";
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole={onPress ? "button" : undefined}
      className="mb-3 flex-row items-center rounded-2xl border border-line bg-panel p-4 active:opacity-80"
    >
      <View
        className={`h-12 w-12 items-center justify-center rounded-2xl ${
          income ? "bg-success-soft" : "bg-error-soft"
        }`}
      >
        <Text className="text-xl">{item.category_icon}</Text>
      </View>
      <View className="mr-3 flex-1">
        <Text numberOfLines={1} className="font-sans-semibold text-[15px] text-ink">
          {item.category_name}
        </Text>
        <Text numberOfLines={1} className="mt-1 font-sans text-xs text-muted">
          {item.note || item.account_name} • {shortDate(item.date)}
        </Text>
      </View>
      <View className="max-w-[42%] items-end">
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          className={`font-num-bold text-sm ${income ? "text-success" : "text-error"}`}
        >
          {income ? "+" : "−"} {rial(item.amount / 10)} تومان
        </Text>
        {onPress ? (
          <Ionicons
            name="chevron-back"
            size={14}
            color={colors.textMuted}
            style={{ marginTop: 6 }}
          />
        ) : null}
      </View>
    </Pressable>
  );
}
