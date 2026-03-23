import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { CURRENCY_SYMBOLS } from '../../data/constants';
import { Expense } from '../../types';

interface ExpenseCardProps {
  expense: Expense;
}

export function ExpenseCard({ expense }: ExpenseCardProps) {
  const router = useRouter();
  const getCurrencySymbol = (currency: string) => CURRENCY_SYMBOLS[currency] || currency;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/expense/detail', params: { expenseId: expense.id } })}
    >
      <XStack
        backgroundColor="$muted"
        borderRadius="$4"
        padding="$4"
        alignItems="center"
        justifyContent="space-between"
      >
        <XStack alignItems="center" gap="$3">
          <YStack
            width={44}
            height={44}
            backgroundColor="$accent"
            borderRadius="$3"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={18}>{expense.categoryIcon || '📦'}</Text>
          </YStack>
          <YStack>
            <Text color="$foreground">{expense.description}</Text>
            <Text color="$mutedForeground">{expense.categoryName}</Text>
          </YStack>
        </XStack>
        <Text color="$foreground">
          {getCurrencySymbol(expense.currency)} {expense.amount.toLocaleString()}
        </Text>
      </XStack>
    </Pressable>
  );
}
