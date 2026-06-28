import { CategoryIcon } from '@/components/expense/CategoryIcon';
import { SyncIndicator } from '@/components/ui/SyncIndicator';
import { SyncingResultBadge } from '@/components/ui/SyncingResultBadge';
import { useSyncContext } from '@/contexts';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { CURRENCY_SYMBOLS } from '../../data/constants';
import { Expense } from '../../types';

interface ExpenseCardProps {
  expense: Expense;
  showSyncBadge?: boolean;
}

export function ExpenseCard({ expense, showSyncBadge = false }: ExpenseCardProps) {
  const router = useRouter();
  const { isSyncing } = useSyncContext();
  const getCurrencySymbol = (currency: string) => CURRENCY_SYMBOLS[currency] || currency;

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/expense/detail', params: { expenseId: expense.id } })
      }
    >
      <XStack
        backgroundColor="$muted"
        borderRadius="$4"
        padding="$4"
        alignItems="center"
        justifyContent="space-between"
        position="relative"
      >
        {showSyncBadge && <SyncingResultBadge id={expense.id} />}
        <XStack alignItems="center" gap="$3">
          <YStack
            width={44}
            height={44}
            backgroundColor="$accent"
            borderRadius="$3"
            alignItems="center"
            justifyContent="center"
          >
            <CategoryIcon name={expense.categoryIcon ?? 'package'} size={18} />
          </YStack>
          <YStack>
            <Text color="$foreground">{expense.description}</Text>
            <Text color="$mutedForeground">{expense.categoryName}</Text>
          </YStack>
        </XStack>
        <XStack alignItems="center" gap="$2">
          <SyncIndicator status={expense.syncStatus} syncing={isSyncing(expense.id)} />
          <Text color="$foreground">
            {getCurrencySymbol(expense.currency)} {expense.amount.toLocaleString()}
          </Text>
        </XStack>
      </XStack>
    </Pressable>
  );
}
