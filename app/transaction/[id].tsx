import { useEffect, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  deleteTransaction,
  getTransaction,
  updateTransaction,
  Transaction,
} from "@/src/db/database";
import { TransactionForm } from "@/src/components/finance/TransactionForm";
import { Screen } from "@/src/components/layout/Screen";

export default function TransactionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!id) return;
    getTransaction(id).then((row) => setTransaction(row ?? null));
  }, [id]);

  if (!transaction) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator color="#059669" />
      </Screen>
    );
  }

  const remove = () =>
    Alert.alert("حذف تراکنش", "این تراکنش حذف شود؟", [
      { text: "انصراف", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          await deleteTransaction(transaction.id);
          router.back();
        },
      },
    ]);

  return (
    <TransactionForm
      type={transaction.type}
      title="ویرایش تراکنش"
      transaction={transaction}
      onDelete={remove}
      onSubmit={async (input) => {
        await updateTransaction(transaction.id, input);
        router.back();
      }}
    />
  );
}
