import { useBudgets } from '@/contexts';
import { getCurrencySymbol } from '@/data/utils';
import { Text, XStack, YStack } from 'tamagui';

export default function ExpenseTotalByCurrency({
  currency,
  amount,
}: {
  currency: string;
  amount: number;
}) {
  const { getBudgetByCurrency } = useBudgets();
  const budget = getBudgetByCurrency(currency);
  const percentage = budget && budget.amount > 0 ? Math.round((amount / budget.amount) * 100) : 0;
  const remaining = budget ? budget.amount - amount : 0;

  return (
    <YStack key={currency} backgroundColor="$muted" borderRadius="$4" padding="$4">
      <XStack alignItems="center" justifyContent="space-between" marginBottom="$1">
        <YStack
          paddingHorizontal="$2"
          paddingVertical="$1"
          backgroundColor="$accent"
          borderRadius="$2"
          opacity={0.4}
        >
          <Text color="$foreground" fontSize={12}>
            {currency}
          </Text>
        </YStack>
        <Text color="$mutedForeground" fontSize={14}>
          {percentage}%
        </Text>
      </XStack>
      <YStack
        height={8}
        backgroundColor="$secondary"
        borderRadius={4}
        overflow="hidden"
        marginBottom="$2"
      >
        <YStack
          height="100%"
          borderRadius={4}
          backgroundColor={percentage >= 100 ? '$destructive' : '$primary'}
          width={`${Math.min(percentage, 100)}%`}
        />
      </YStack>
      <XStack alignItems="center" justifyContent="space-between">
        <Text color="$mutedForeground">
          {getCurrencySymbol(currency)} {amount.toLocaleString()} / {getCurrencySymbol(currency)}{' '}
          {remaining.toLocaleString()}
        </Text>
      </XStack>
    </YStack>
  );
}
