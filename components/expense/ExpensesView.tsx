import { Plus } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { useBudgets, useExpenses, useTrips } from '../../contexts';
import { CURRENCY_SYMBOLS } from '../../data/constants';
import { Expense } from '../../types';
import { ExpenseCard } from './ExpenseCard';

export function ExpensesView() {
  const router = useRouter();
  const { activeTrip } = useTrips();
  const { expenses } = useExpenses();
  const { budgets } = useBudgets();

  const filteredExpenses = expenses.filter((e) => !activeTrip || e.tripId === activeTrip);

  const expensesByCurrency = useMemo(() => {
    return filteredExpenses.reduce(
      (acc, expense) => {
        if (!acc[expense.currency]) acc[expense.currency] = 0;
        acc[expense.currency] += expense.amount;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [filteredExpenses]);

  const expensesByDate = useMemo(() => {
    return filteredExpenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .reduce(
        (acc, expense) => {
          if (!acc[expense.date]) acc[expense.date] = [];
          acc[expense.date].push(expense);
          return acc;
        },
        {} as Record<string, Expense[]>
      );
  }, [filteredExpenses]);

  const getCurrencySymbol = (currency: string) => CURRENCY_SYMBOLS[currency] || currency;

  const handleAddExpense = () => {
    router.push({ pathname: '/expense/new', params: { tripId: activeTrip } });
  };

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
                {Object.entries(expensesByCurrency).map(([currency, amount]) => {
                  const budget = budgets.find((b) => b.currency === currency);
                  const percentage =
                    budget && budget.amount > 0 ? Math.round((amount / budget.amount) * 100) : 0;
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
                          {getCurrencySymbol(currency)} {amount.toLocaleString()} /{' '}
                          {getCurrencySymbol(currency)} {remaining.toLocaleString()}
                        </Text>
                      </XStack>
                    </YStack>
                  );
                })}
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
            {filteredExpenses.length === 0 ? (
              <YStack alignItems="center" paddingVertical={32}>
                <Text fontSize={48} marginBottom="$3">
                  🛍️
                </Text>
                <Text color="$mutedForeground">아직 지출 내역이 없습니다</Text>
              </YStack>
            ) : (
              <YStack gap="$4">
                {Object.entries(expensesByDate).map(([date, dayExpenses]) => {
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
                        <Text color="$foreground">
                          📅{' '}
                          {new Date(date).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short',
                          })}
                        </Text>
                        <Text color="$mutedForeground">
                          {getCurrencySymbol(mainCurrency)} {dayTotal.toLocaleString()}
                        </Text>
                      </XStack>
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

      {activeTrip && (
        <Pressable
          onPress={handleAddExpense}
          style={{
            position: 'absolute',
            bottom: 100,
            right: 20,
            width: 56,
            height: 56,
            backgroundColor: '#C8DEE6',
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Plus size={24} color="#5C4033" />
        </Pressable>
      )}
    </YStack>
  );
}
