import { AppState, PermissionsAndroid, Platform } from "react-native";
import {
  BankSender,
  addTransaction,
  beginSmsImport,
  ensureSmsCategory,
  listBankSenders,
  markSmsImported,
} from "@/src/db/database";
import { parseBankSms, senderMatches, smsFingerprint } from "@/src/utils/smsParse";
import { BankSms, canListenForSms, smsModule } from "@/src/utils/smsNative";

let syncing = false;
let pending = false;

export async function smsPermissionGranted() {
  if (Platform.OS !== "android") return false;
  const read = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
  const receive = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);
  return read && receive;
}

export async function requestSmsPermission() {
  if (Platform.OS !== "android") return false;
  const result = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.READ_SMS,
    PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
  ]);
  return (
    result[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED &&
    result[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === PermissionsAndroid.RESULTS.GRANTED
  );
}

async function importMessage(message: BankSms, senders: BankSender[]) {
  const sender = senders.find((item) => senderMatches(message.address, item.name));
  if (!sender) return;
  const fingerprint = smsFingerprint(message.address, message.date, message.body);
  const fresh = await beginSmsImport({
    fingerprint,
    sender: message.address,
    body: message.body,
    receivedAt: new Date(message.date).toISOString(),
  });
  if (!fresh) return;
  const parsed = parseBankSms(message.body);
  if (!parsed.ok) return;
  const categoryId = await ensureSmsCategory(parsed.type);
  const transactionId = await addTransaction({
    type: parsed.type,
    amount: parsed.amount,
    accountId: sender.account_id,
    categoryId,
    date: new Date(message.date).toISOString(),
    note: parsed.note,
  });
  await markSmsImported(fingerprint, transactionId);
}

export async function syncBankSms() {
  const native = smsModule();
  if (!native) return;
  if (syncing) {
    pending = true;
    return;
  }
  if (!(await smsPermissionGranted())) return;
  syncing = true;
  try {
    const senders = await listBankSenders();
    if (!senders.length) return;
    const inbox = await native.readInbox(80);
    for (const message of inbox) await importMessage(message, senders);
  } finally {
    syncing = false;
    if (pending) {
      pending = false;
      void syncBankSms();
    }
  }
}

export function startBankSmsListener() {
  if (!canListenForSms()) return () => undefined;
  const native = smsModule();
  void syncBankSms();
  const appState = AppState.addEventListener("change", (state) => {
    if (state === "active") void syncBankSms();
  });
  const subscription = native?.addListener("onSms", () => {
    void syncBankSms();
    setTimeout(() => void syncBankSms(), 1500);
  });
  return () => {
    appState.remove();
    subscription?.remove();
  };
}
