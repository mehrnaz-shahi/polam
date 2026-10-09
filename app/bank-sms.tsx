import { useCallback, useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Account,
  BankSender,
  SmsImport,
  addBankSender,
  deleteBankSender,
  listAccounts,
  listBankSenders,
  listSmsReviews,
} from "@/src/db/database";
import { persianDate, toman } from "@/src/utils/format";
import { canListenForSms } from "@/src/utils/smsNative";
import { requestSmsPermission, smsPermissionGranted, syncBankSms } from "@/src/utils/smsSync";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import { EmptyState, Field, PrimaryButton, SelectionRow, SurfaceCard } from "@/src/components/ui";

export default function BankSmsScreen() {
  const router = useRouter();
  const { isWide } = useResponsive();
  const listening = canListenForSms();
  const [senders, setSenders] = useState<BankSender[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [reviews, setReviews] = useState<SmsImport[]>([]);
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [allowed, setAllowed] = useState(false);

  const load = useCallback(async () => {
    const [senderRows, accountRows, reviewRows, granted] = await Promise.all([
      listBankSenders(),
      listAccounts(),
      listSmsReviews(),
      smsPermissionGranted(),
    ]);
    setSenders(senderRows);
    setAccounts(accountRows);
    setReviews(reviewRows);
    setAllowed(granted);
    setAccountId((current) => current || accountRows[0]?.id || "");
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const save = async () => {
    const senderName = name.trim();
    if (!senderName || !accountId) {
      Alert.alert("اطلاعات ناقص", "نام فرستنده و حساب را وارد کنید.");
      return;
    }
    if (senders.some((item) => item.name.trim().toLowerCase() === senderName.toLowerCase())) {
      Alert.alert("نام تکراری", "این فرستنده قبلاً ثبت شده است.");
      return;
    }
    await addBankSender({ name: senderName, accountId });
    setName("");
    await syncBankSms();
    load();
  };

  const allow = async () => {
    const granted = await requestSmsPermission();
    setAllowed(granted);
    if (granted) {
      await syncBankSms();
      load();
    }
  };

  const form = (
    <SurfaceCard>
      <Text className="font-sans-bold text-base text-ink text-left">فرستنده جدید</Text>
      <View className="mt-4">
        <Field
          label="نام فرستنده پیامک"
          value={name}
          onChangeText={setName}
          placeholder="مثلاً Bank Mellat"
        />
        {accounts.length ? (
          <SelectionRow
            label="حساب"
            value={accountId}
            onChange={setAccountId}
            items={accounts.map((account) => ({
              id: account.id,
              title: account.name,
              icon: "💳",
              meta: toman(account.balance),
            }))}
          />
        ) : (
          <Text className="mb-4 font-sans text-sm text-muted text-left">اول یک حساب بسازید.</Text>
        )}
        <PrimaryButton title="افزودن فرستنده" onPress={save} icon="checkmark" />
      </View>
    </SurfaceCard>
  );

  return (
    <Screen
      header={
        <ScreenHeader
          title="پیامک بانک"
          subtitle="ثبت خودکار تراکنش از پیامک"
          onBack={() => router.back()}
        />
      }
    >
      <ScreenScroll keyboard>
        <Content>
          {!listening ? (
            <SurfaceCard className="mb-4">
              <Text className="font-sans text-sm leading-6 text-ink text-left">
                {Platform.OS === "ios"
                  ? "خواندن پیامک در iOS ممکن نیست."
                  : "شنیدن پیامک در Expo Go ممکن نیست. بعد از ساخت نسخه اندروید با npx expo run:android فعال می‌شود."}
              </Text>
            </SurfaceCard>
          ) : null}
          {listening && !allowed ? (
            <View className="mb-4">
              <PrimaryButton title="اجازه دسترسی به پیامک" onPress={allow} icon="checkmark" />
            </View>
          ) : null}
          <View className={isWide ? "flex-row gap-6" : ""}>
            <View className={isWide ? "flex-1" : ""}>
              {senders.length ? (
                senders.map((sender) => (
                  <SurfaceCard key={sender.id} className="mb-3">
                    <Text className="font-sans-bold text-base text-ink text-left">{sender.name}</Text>
                    <Text className="mt-1 font-sans text-xs text-muted text-left">
                      حساب {sender.account_name}
                    </Text>
                    <Pressable
                      onPress={() =>
                        Alert.alert("حذف فرستنده", `«${sender.name}» حذف شود؟`, [
                          { text: "انصراف", style: "cancel" },
                          {
                            text: "حذف",
                            style: "destructive",
                            onPress: () => deleteBankSender(sender.id).then(load),
                          },
                        ])
                      }
                      className="mt-3 items-center py-2"
                    >
                      <Text className="font-sans-semibold text-xs text-error text-left">حذف</Text>
                    </Pressable>
                  </SurfaceCard>
                ))
              ) : (
                <EmptyState
                  title="فرستنده‌ای ثبت نشده"
                  description="نام فرستنده پیامک بانک را اضافه کنید."
                  icon="bank"
                />
              )}
              {reviews.length ? (
                <View className="mt-2">
                  <Text className="mb-3 font-sans-semibold text-sm text-ink text-left">نیاز به بررسی</Text>
                  {reviews.map((item) => (
                    <SurfaceCard key={item.id} className="mb-3">
                      <Text className="font-sans-semibold text-sm text-ink text-left">{item.sender}</Text>
                      <Text className="mt-1 font-sans text-xs text-muted text-left">
                        {persianDate(item.received_at)}
                      </Text>
                      <Text className="mt-2 font-sans text-sm leading-6 text-ink text-left">{item.body}</Text>
                    </SurfaceCard>
                  ))}
                </View>
              ) : null}
            </View>
            <View className={isWide ? "w-[38%]" : "mt-3"}>{form}</View>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
