import { paddingHorizontalGeneral } from '@/constants/theme';
import { getCurrencySymbol } from '@/data/utils';
import { Plus, Wallet } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { EmptyState } from '../ui';
import { useExpenses, useTrips } from '../../contexts';
import { Expense } from '../../types';
import FloatingActionButton from '../ui/button/FloatingActionButton';
import { ExpenseCard } from './ExpenseCard';
import ExpenseDayTotal from './ExpenseDayTotal';

export function ExpensesView({ createdId }: { createdId?: string }) {
  const router = useRouter();
  const { activeTrip } = useTrips();
  const { expenses } = useExpenses();

  const expensesByCurrency = useMemo(() => {
    const totals = {} as Record<string, number>;
    const counts = {} as Record<string, number>;
    expenses.forEach(({ currency, amount }) => {
      totals[currency] = (totals[currency] || 0) + amount;
      counts[currency] = (counts[currency] || 0) + 1;
    });
    return Object.entries(totals)
      .sort(([a], [b]) => (counts[b] || 0) - (counts[a] || 0))
      .map(([currency, amount]) => ({ currency, amount }));
  }, [expenses]);

  const expensesByDate = useMemo(() => {
    return expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .reduce(
        (acc, expense) => {
          if (!acc[expense.date]) acc[expense.date] = [];
          acc[expense.date].push(expense);
          return acc;
        },
        {} as Record<string, Expense[]>
      );
  }, [expenses]);

  const handleAddExpense = () => {
    router.push({ pathname: '/expense/edit', params: { tripId: activeTrip } });
  };

  return (
    <YStack flex={1} position="relative">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: paddingHorizontalGeneral, paddingBottom: 100 }}
      >
        <YStack gap="$6" paddingTop="$4">
          {expensesByCurrency.length > 0 && (
            <YStack gap="$1">
              <XStack alignItems="center" gap="$2">
                <Text color="$mutedForeground" fontSize={13}>
                  총 지출
                </Text>
              </XStack>
              {expensesByCurrency.map(({ currency, amount }) => (
                <Text key={currency} color="$foreground" fontSize={30} fontWeight="700">
                  {getCurrencySymbol(currency)} {amount.toLocaleString()}
                </Text>
              ))}
            </YStack>
          )}

          {expenses.length === 0 ? (
            <EmptyState
              icon={<Wallet size={32} color="$mutedForeground" />}
              title="아직 지출 내역이 없어요"
              description="여행 중 사용한 금액을 기록해보세요"
              flex={0}
              paddingVertical="$8"
            />
          ) : (
            <YStack gap="$4">
              {Object.entries(expensesByDate).map(([date, dayExpenses]) => (
                <YStack key={date}>
                  <ExpenseDayTotal date={date} dayExpenses={dayExpenses} />
                  <YStack gap="$2">
                    {dayExpenses.map((expense) => (
                      <ExpenseCard
                        key={expense.id}
                        expense={expense}
                        showSyncBadge={
                          expense.id === createdId &&
                          (expense.syncStatus === 'pending' || expense.syncStatus === 'synced')
                        }
                      />
                    ))}
                  </YStack>
                </YStack>
              ))}
            </YStack>
          )}
        </YStack>
      </ScrollView>
      <FloatingActionButton onPress={() => handleAddExpense()}>
        <XStack alignItems="center" gap="$2">
          <Plus />
          <Text>지출 내역 추가</Text>
        </XStack>
      </FloatingActionButton>
    </YStack>
  );
}
