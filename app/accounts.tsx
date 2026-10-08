import { useCallback, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  addAccount,
  listAccounts,
  Account,
  setAccountArchived,
  updateAccount,
} from "@/src/db/database";
import { toman } from "@/src/utils/format";
import { Content, Screen, ScreenHeader, ScreenScroll, useResponsive } from "@/src/components/layout/Screen";
import { DoodleIcon } from "@/src/components/icons/DoodleIcon";
import { EmptyState, Field, PrimaryButton, SurfaceCard } from "@/src/components/ui";

export default function Accounts() {
  const router = useRouter();
  const { isWide } = useResponsive();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const load = useCallback(() => listAccounts(true).then(setAccounts), []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const save = async () => {
    if (!name.trim()) return;
    if (editing) {
      await updateAccount(editing, { name: name.trim() });
      setEditing(null);
    } else {
      await addAccount({
        name: name.trim(),
        type: "wallet",
        balance: Math.round(Number(balance.replace(/[٬,\s]/g, "") || 0) * 10),
      });
    }
    setName("");
    setBalance("");
    load();
  };

  const edit = (account: Account) => {
    setEditing(account.id);
    setName(account.name);
    setBalance("");
  };

  const toggleArchive = (account: Account) =>
    Alert.alert(
      account.is_archived ? "فعال‌سازی حساب" : "بایگانی حساب",
      `حساب «${account.name}» ${account.is_archived ? "فعال" : "بایگانی"} شود؟`,
      [
        { text: "انصراف", style: "cancel" },
        {
          text: "تأیید",
          onPress: () => setAccountArchived(account.id, !Boolean(account.is_archived)).then(load),
        },
      ],
    );

  const form = (
    <SurfaceCard>
      <Text className="font-sans-bold text-base text-ink text-left">
        {editing ? "ویرایش حساب" : "افزودن حساب"}
      </Text>
      <View className="mt-4">
        <Field label="نام حساب" value={name} onChangeText={setName} placeholder="مثلاً کیف پول" />
        {!editing ? (
          <Field
            label="موجودی اولیه"
            value={balance}
            onChangeText={setBalance}
            keyboardType="number-pad"
            placeholder="مبلغ به تومان"
          />
        ) : null}
        <PrimaryButton
          title={editing ? "ذخیره تغییرات" : "افزودن حساب"}
          onPress={save}
          icon="checkmark"
        />
        {editing ? (
          <Pressable
            onPress={() => {
              setEditing(null);
              setName("");
              setBalance("");
            }}
            className="mt-3 items-center py-2"
          >
            <Text className="font-sans-semibold text-sm text-muted text-left">انصراف</Text>
          </Pressable>
        ) : null}
      </View>
    </SurfaceCard>
  );

  return (
    <Screen
      header={
        <ScreenHeader
          title="حساب‌ها"
          subtitle="مدیریت موجودی و کیف پول‌ها"
          onBack={() => router.back()}
        />
      }
    >
      <ScreenScroll keyboard>
        <Content>
          <View className={isWide ? "flex-row gap-6" : ""}>
            <View className={isWide ? "flex-1" : ""}>
              {accounts.length ? (
                accounts.map((account) => (
                  <SurfaceCard
                    key={account.id}
                    className={`mb-3 ${account.is_archived ? "opacity-50" : ""}`}
                  >
                    <View className="flex-row items-center">
                      <DoodleIcon name="wallet" size={40} />
                      <View className="mr-3 flex-1 items-start">
                        <Text className="font-sans-bold text-base text-ink text-left">
                          {account.name}
                        </Text>
                        <Text className="mt-1 font-sans text-xs text-muted text-left">
                          {account.is_archived ? "بایگانی‌شده" : "حساب فعال"}
                        </Text>
                      </View>
                      <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        className="max-w-[40%] font-sans-bold text-lg text-success text-left"
                      >
                        {toman(account.balance)}
                      </Text>
                    </View>
                    <View className="mt-4 flex-row gap-2">
                      <Pressable
                        onPress={() => edit(account)}
                        className="rounded-xl bg-fill px-4 py-2"
                      >
                        <Text className="font-sans-semibold text-xs text-ink text-left">
                          ویرایش
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => toggleArchive(account)}
                        className="rounded-xl bg-fill px-4 py-2"
                      >
                        <Text className="font-sans-semibold text-xs text-muted text-left">
                          {account.is_archived ? "فعال‌سازی" : "بایگانی"}
                        </Text>
                      </Pressable>
                    </View>
                  </SurfaceCard>
                ))
              ) : (
                <EmptyState
                  title="حسابی وجود ندارد"
                  description="یک حساب برای شروع ثبت تراکنش بسازید."
                  icon="wallet"
                />
              )}
            </View>
            <View className={isWide ? "w-[38%]" : "mt-3"}>{form}</View>
          </View>
        </Content>
      </ScreenScroll>
    </Screen>
  );
}
