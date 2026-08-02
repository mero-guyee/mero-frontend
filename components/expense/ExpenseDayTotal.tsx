import { Expense } from '@/types';
import { formatDateLabel } from '@/utils/date';
import { Text, XStack, YStack } from 'tamagui';

export default function ExpenseDayTotal({
  date,
  dayExpenses,
}: {
  date: string;
  dayExpenses: Expense[];
}) {
  const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const mainCurrency = dayExpenses[0]?.currency || 'KRW';

  return (
    <YStack key={date}>
      <XStack
        alignItems="center"
        justifyContent="space-between"
        marginBottom="$2"
        paddingHorizontal="$1"
      >
        <Text color="$foreground">{formatDateLabel(date)}</Text>
      </XStack>
    </YStack>
  );
}
