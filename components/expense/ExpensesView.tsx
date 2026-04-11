import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Text, YStack } from 'tamagui';
import { useExpenses, useTrips } from '../../contexts';
import { Expense } from '../../types';
import { ExpenseCard } from './ExpenseCard';
import ExpenseDayTotal from './ExpenseDayTotal';
import ExpenseTotalByCurrency from './ExpenseTotalByCurrency';

export function ExpensesView() {
  const router = useRouter();
  const { activeTrip } = useTrips();
  const { expenses } = useExpenses();

  const expensesByCurrency = useMemo(() => {
    const initalValue = {} as Record<string, number>;
    return expenses.reduce((acc, currentExpense) => {
      const { currency, amount } = currentExpense;
      if (!acc[currency]) {
        acc[currency] = 0;
      }
      acc[currency] += amount;
      return acc;
    }, initalValue);
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

  return (
    <YStack flex={1}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <YStack gap="$4">
          {Object.keys(expensesByCurrency).length > 0 && (
            <YStack
              backgroundColor="$card"
              borderRadius="$6"
              padding="$5"
              borderWidth={1}
              borderColor="$border"
            >
              <Text color="$foreground" fontSize={16} fontWeight="600" marginBottom="$1">
                화폐별 총액
              </Text>
              <Text color="$mutedForeground" fontSize={14} marginBottom="$4">
                사용한 화폐별 총 지출
              </Text>
              <YStack gap="$3">
                {Object.entries(expensesByCurrency).map(([currency, amount]) => (
                  <ExpenseTotalByCurrency key={currency} currency={currency} amount={amount} />
                ))}
              </YStack>
            </YStack>
          )}

          <YStack
            backgroundColor="$card"
            borderRadius="$6"
            padding="$5"
            borderWidth={1}
            borderColor="$border"
          >
            <Text color="$foreground" fontSize={16} fontWeight="600" marginBottom="$1">
              지출 내역
            </Text>
            <Text color="$mutedForeground" fontSize={14} marginBottom="$4">
              날짜별 지출 목록
            </Text>
            {expenses.length === 0 ? (
              <YStack alignItems="center" paddingVertical={32}>
                <Text fontSize={48} marginBottom="$3">
                  🛍️
                </Text>
                <Text color="$mutedForeground">아직 지출 내역이 없습니다</Text>
              </YStack>
            ) : (
              <YStack gap="$4">
                {Object.entries(expensesByDate).map(([date, dayExpenses]) => {
                  return (
                    <YStack key={date}>
                      <ExpenseDayTotal date={date} dayExpenses={dayExpenses} />
                      <YStack gap="$2">
                        {dayExpenses.map((expense) => (
                          <ExpenseCard key={expense.id} expense={expense} />
                        ))}
                      </YStack>
                    </YStack>
                  );
                })}
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
