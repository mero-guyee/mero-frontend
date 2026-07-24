import ExpenseDetail from '@/components/expense/ExpenseDetail';
import { useLocalSearchParams } from 'expo-router';

export default function ExpenseDetailScreen() {
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  return <ExpenseDetail expenseId={expenseId} />;
}
