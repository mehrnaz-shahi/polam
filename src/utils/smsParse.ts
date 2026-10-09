import { toEnglishDigits } from "@/src/utils/format";

const EXPENSE_WORDS = ["برداشت", "خرید", "پرداخت", "کسر"];
const INCOME_WORDS = ["واریز", "دریافت"];

export type ParsedSms =
  | { ok: true; type: "expense" | "income"; amount: number; note: string }
  | { ok: false };

function normalize(body: string) {
  return toEnglishDigits(body)
    .replace(/\u200c/g, " ")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک");
}

function direction(text: string): "expense" | "income" | null {
  const expense = EXPENSE_WORDS.some((word) => text.includes(word));
  const income = INCOME_WORDS.some((word) => text.includes(word));
  if (expense === income) return null;
  return income ? "income" : "expense";
}

function amountAfterLabel(text: string) {
  const match = text.match(/مبلغ\s*[:：]?\s*([0-9][0-9,،٬.\s]*)\s*(ریال|تومان)?/);
  if (!match) return null;
  const digits = match[1].replace(/\D/g, "");
  const value = Number(digits);
  if (!Number.isFinite(value) || value <= 0) return null;
  return match[2] === "تومان" ? Math.round(value * 10) : Math.round(value);
}

export function parseBankSms(body: string): ParsedSms {
  const text = normalize(body);
  const type = direction(text);
  const amount = amountAfterLabel(text);
  if (!type || !amount) return { ok: false };
  return { ok: true, type, amount, note: body.trim().slice(0, 200) };
}

export function smsFingerprint(address: string, date: number, body: string) {
  return `${address.trim()}|${date}|${body}`;
}

export function senderMatches(address: string, name: string) {
  const left = address.trim().toLowerCase();
  const right = name.trim().toLowerCase();
  if (!left || !right) return false;
  return left.includes(right) || right.includes(left);
}
