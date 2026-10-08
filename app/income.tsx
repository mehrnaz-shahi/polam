import { useRouter } from "expo-router";
import { addTransaction } from "@/src/db/database";
import { TransactionForm } from "@/src/components/finance/TransactionForm";

export default function Income() {
  const router = useRouter();
  return (
    <TransactionForm
      type="income"
      title="ثبت درآمد"
      onSubmit={async (input) => {
        await addTransaction(input);
        router.back();
      }}
    />
  );
}
