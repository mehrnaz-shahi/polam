import { isRunningInExpoGo, requireNativeModule } from "expo";
import { Platform } from "react-native";

export type BankSms = {
  id: string;
  address: string;
  body: string;
  date: number;
};

type SmsModule = {
  readInbox(limit: number): Promise<BankSms[]>;
  addListener(event: "onSms", listener: (message: BankSms) => void): { remove(): void };
};

export function canListenForSms() {
  return Platform.OS === "android" && !isRunningInExpoGo();
}

export function smsModule(): SmsModule | null {
  if (!canListenForSms()) return null;
  try {
    return requireNativeModule<SmsModule>("PolamSms");
  } catch {
    return null;
  }
}
