import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { faNumber, persianDate } from "@/src/utils/format";

const faYear = (year: number) => new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(year);
import { PERSIAN_MONTHS, PERSIAN_WEEKDAYS, persianParts, persianWeeks } from "@/src/utils/jalali";

export function JalaliDatePicker({
  value,
  onConfirm,
  onClose,
  beginningYear = 1399,
}: {
  value: Date;
  onConfirm: (date: Date) => void;
  onClose: () => void;
  beginningYear?: number;
}) {
  const initial = persianParts(value);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [selected, setSelected] = useState(value);
  const [menu, setMenu] = useState<"month" | "year" | null>(null);
  const currentYear = persianParts(new Date()).year;
  const years = useMemo(() => {
    const end = Math.max(currentYear + 2, year);
    const list: number[] = [];
    for (let next = beginningYear; next <= end; next++) list.push(next);
    return list;
  }, [beginningYear, currentYear, year]);
  const weeks = useMemo(() => persianWeeks(year, month, selected), [year, month, selected]);
  const weekday = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long" }).format(selected);

  const choose = (date: Date) => {
    const parts = persianParts(date);
    setSelected(date);
    setYear(parts.year);
    setMonth(parts.month);
  };

  return (
    <View>
      <View className="flex-row gap-3">
        <Pressable
          onPress={() => setMenu((current) => (current === "month" ? null : "month"))}
          className="min-h-14 flex-1 flex-row items-center justify-between rounded-2xl border border-line bg-panel px-4"
        >
          <Text className="font-sans-semibold text-sm text-ink text-left">{PERSIAN_MONTHS[month - 1]}</Text>
          <Text className="font-sans text-xs text-muted text-left">ماه</Text>
        </Pressable>
        <Pressable
          onPress={() => setMenu((current) => (current === "year" ? null : "year"))}
          className="min-h-14 flex-1 flex-row items-center justify-between rounded-2xl border border-line bg-panel px-4"
        >
          <Text className="font-sans-semibold text-sm text-ink text-left">{faYear(year)}</Text>
          <Text className="font-sans text-xs text-muted text-left">سال</Text>
        </Pressable>
      </View>

      {menu === "month" ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ gap: 8 }}>
          {PERSIAN_MONTHS.map((name, index) => (
            <Pressable
              key={name}
              onPress={() => {
                setMonth(index + 1);
                setMenu(null);
              }}
              className={`min-h-10 items-center justify-center rounded-full border px-4 ${
                month === index + 1 ? "border-brand-600 bg-brand-600" : "border-line bg-panel"
              }`}
            >
              <Text className={`font-sans-semibold text-xs text-left ${month === index + 1 ? "text-white" : "text-ink"}`}>
                {name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {menu === "year" ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ gap: 8 }}>
          {years.map((item) => (
            <Pressable
              key={item}
              onPress={() => {
                setYear(item);
                setMenu(null);
              }}
              className={`min-h-10 items-center justify-center rounded-full border px-4 ${
                year === item ? "border-brand-600 bg-brand-600" : "border-line bg-panel"
              }`}
            >
              <Text className={`font-sans-semibold text-xs text-left ${year === item ? "text-white" : "text-ink"}`}>
                {faYear(item)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <View className="mb-1 mt-4 flex-row">
        {PERSIAN_WEEKDAYS.map((day) => (
          <Text key={day} className="flex-1 text-center font-sans text-xs text-muted">
            {day}
          </Text>
        ))}
      </View>

      {weeks.map((week, index) => (
        <View key={index} className="my-1 flex-row">
          {week.map((cell) => (
            <Pressable
              key={cell.key}
              onPress={() => choose(cell.date)}
              className="flex-1 items-center justify-center"
            >
              <View
                className={`items-center justify-center overflow-hidden ${
                  cell.isSelected ? "bg-brand-700" : cell.isToday ? "border border-brand-500" : ""
                } ${cell.isOutOfMonth ? "opacity-30" : ""}`}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              >
                <Text
                  className={`text-center font-sans text-sm ${
                    cell.isSelected ? "text-white" : "text-ink"
                  }`}
                >
                  {faNumber(cell.day)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ))}

      <View className="mt-3 flex-row items-center justify-between rounded-2xl bg-accent-soft px-4 py-3">
        <Text className="font-sans-semibold text-sm text-accent-strong text-left">{weekday}</Text>
        <Text className="font-sans text-sm text-accent-strong text-left">{persianDate(selected.toISOString())}</Text>
      </View>

      <View className="mt-4 flex-row gap-3">
        <Pressable
          onPress={() => onConfirm(selected)}
          className="min-h-14 flex-1 items-center justify-center rounded-2xl bg-brand-600"
        >
          <Text className="font-sans-bold text-white text-left">تأیید</Text>
        </Pressable>
        <Pressable
          onPress={onClose}
          className="min-h-14 flex-1 items-center justify-center rounded-2xl border border-line bg-panel"
        >
          <Text className="font-sans-bold text-ink text-left">بستن</Text>
        </Pressable>
      </View>
    </View>
  );
}
