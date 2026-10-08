const formatter = new Intl.DateTimeFormat("en-US-u-ca-persian", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

export const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export const PERSIAN_WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export type PersianParts = { year: number; month: number; day: number };

export function persianParts(date: Date): PersianParts {
  const parts = formatter.formatToParts(date);
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: read("year"), month: read("month"), day: read("day") };
}

export function dateFromPersian(year: number, month: number, day: number) {
  const cursor = new Date(year + 621, 2, 21, 12, 0, 0, 0);
  cursor.setDate(cursor.getDate() + (month - 1) * 30 + (day - 1));
  for (let i = 0; i < 500; i++) {
    const current = persianParts(cursor);
    if (current.year === year && current.month === month && current.day === day) return cursor;
    const ahead =
      current.year < year ||
      (current.year === year && current.month < month) ||
      (current.year === year && current.month === month && current.day < day);
    cursor.setDate(cursor.getDate() + (ahead ? 1 : -1));
  }
  return cursor;
}

export type CalendarCell = {
  key: string;
  day: number;
  date: Date;
  isOutOfMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
};

export function persianWeeks(year: number, month: number, selected: Date) {
  const first = dateFromPersian(year, month, 1);
  const lead = (first.getDay() + 1) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - lead);
  const today = persianParts(new Date());
  const picked = persianParts(selected);
  const weeks: CalendarCell[][] = [];

  for (let week = 0; week < 6; week++) {
    const row: CalendarCell[] = [];
    for (let column = 0; column < 7; column++) {
      const date = new Date(start);
      date.setDate(start.getDate() + week * 7 + column);
      const parts = persianParts(date);
      row.push({
        key: `${parts.year}-${parts.month}-${parts.day}`,
        day: parts.day,
        date,
        isOutOfMonth: parts.year !== year || parts.month !== month,
        isToday: parts.year === today.year && parts.month === today.month && parts.day === today.day,
        isSelected: parts.year === picked.year && parts.month === picked.month && parts.day === picked.day,
      });
    }
    weeks.push(row);
  }

  if (weeks[5].every((cell) => cell.isOutOfMonth)) weeks.pop();
  return weeks;
}
