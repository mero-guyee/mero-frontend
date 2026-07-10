import ExpenseForm from '@/components/expense/ExpenseForm';
import { useLocalSearchParams } from 'expo-router';
import { Text, YStack } from 'tamagui';
import { useExpenses } from '../../../contexts';

export default function ExpenseEditScreen() {
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const { expenses } = useExpenses();
  const expense = expenses.find((e) => e.id === expenseId);

  if (!expense) {
    return (
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
        <Text color="$mutedForeground">경비를 찾을 수 없습니다.</Text>
      </YStack>
    );
  }

  return <ExpenseForm mode="edit" expense={expense} />;
}
