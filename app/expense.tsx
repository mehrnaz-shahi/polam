import { useRouter } from "expo-router";
import { addTransaction } from "@/src/db/database";
import { TransactionForm } from "@/src/components/finance/TransactionForm";

export default function Expense() {
  const router = useRouter();
  return (
    <TransactionForm
      type="expense"
      title="ثبت هزینه"
      onSubmit={async (input) => {
        await addTransaction(input);
        router.back();
      }}
    />
  );
}
