import { CategoryIcon } from '@/components/expense/CategoryIcon';
import { PressableXCard } from '@/components/ui/Card';
import { SyncIndicator } from '@/components/ui/SyncIndicator';
import { SyncingResultBadge } from '@/components/ui/SyncingResultBadge';
import { useSyncContext } from '@/contexts';
import { useRouter } from 'expo-router';
import { Text, XStack, YStack } from 'tamagui';
import { getCurrencyCode } from '../../data/constants';
import { Expense } from '../../types';

interface ExpenseCardProps {
  expense: Expense;
  showSyncBadge?: boolean;
}

export function ExpenseCard({ expense, showSyncBadge = false }: ExpenseCardProps) {
  const router = useRouter();
  const { isSyncing } = useSyncContext();

  return (
    <PressableXCard
      onPress={() =>
        router.push({ pathname: '/expense/detail', params: { expenseId: expense.id } })
      }
      padding="$4"
      alignItems="flex-start"
      justifyContent="space-between"
      position="relative"
    >
      {showSyncBadge && <SyncingResultBadge id={expense.id} />}
      <XStack alignItems="flex-start" gap="$3">
        <YStack
          width={44}
          height={44}
          backgroundColor="$accent"
          borderRadius="$3"
          alignItems="center"
          justifyContent="center"
        >
          <CategoryIcon name={expense.categoryName!} size={18} />
        </YStack>
        <YStack gap="$1">
          <Text color="$mutedForeground">{expense.categoryName}</Text>
          <Text color="$foreground">{expense.description || '-'}</Text>
        </YStack>
      </XStack>
      <XStack alignItems="center" gap="$2">
        <SyncIndicator status={expense.syncStatus} syncing={isSyncing(expense.id)} />
        <Text color="$foreground">
          {getCurrencyCode(expense.currency)} {expense.amount.toLocaleString()}
        </Text>
      </XStack>
    </PressableXCard>
  );
}
