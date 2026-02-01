import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Pressable, Modal, Alert } from 'react-native';
import { YStack, XStack, Text, Button, Input } from 'tamagui';
import { Plus, Edit2, Trash2, X } from '@tamagui/lucide-icons';
import { useTrips, useExpenses, useBudgets } from '../../../contexts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CURRENCY_SYMBOLS,
  CURRENCY_NAMES,
} from '../../../data/mockData';
import { Budget, Expense } from '../../../types';

export default function ExpenseViewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { trips, activeTrip } = useTrips();
  const { expenses } = useExpenses();
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudgets();

  const [viewMode, setViewMode] = useState<'expenses' | 'budget'>('expenses');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetForm, setBudgetForm] = useState({ currency: 'USD', amount: '' });

  const activeTripData = activeTrip ? trips.find((t) => t.id === activeTrip) : null;
  const filteredExpenses = expenses.filter((e) => !activeTrip || e.tripId === activeTrip);
  const filteredBudgets = budgets.filter((b) => !activeTrip || b.tripId === activeTrip);

  const expensesByCurrency = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      if (!acc[expense.currency]) {
        acc[expense.currency] = 0;
      }
      acc[expense.currency] += expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredExpenses]);

  const expensesByDate = useMemo(() => {
    return filteredExpenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .reduce((acc, expense) => {
        if (!acc[expense.date]) {
          acc[expense.date] = [];
        }
        acc[expense.date].push(expense);
        return acc;
      }, {} as Record<string, Expense[]>);
  }, [filteredExpenses]);

  const getCurrencySymbol = (currency: string) => {
    return CURRENCY_SYMBOLS[currency] || currency;
  };

  const handleOpenBudgetModal = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setBudgetForm({
        currency: budget.currency,
        amount: budget.amount.toString(),
      });
    } else {
      setEditingBudget(null);
      setBudgetForm({ currency: 'USD', amount: '' });
    }
    setShowBudgetModal(true);
  };

  const handleCloseBudgetModal = () => {
    setShowBudgetModal(false);
    setEditingBudget(null);
    setBudgetForm({ currency: 'USD', amount: '' });
  };

  const handleSaveBudget = () => {
    if (!activeTrip || !budgetForm.amount) return;

    const amount = parseFloat(budgetForm.amount);
    if (isNaN(amount) || amount <= 0) return;

    if (editingBudget) {
      updateBudget({
        ...editingBudget,
        currency: budgetForm.currency,
        amount,
      });
    } else {
      addBudget({
        tripId: activeTrip,
        currency: budgetForm.currency,
        amount,
      });
    }

    handleCloseBudgetModal();
  };

  const handleDeleteBudget = (budgetId: string) => {
    Alert.alert('예산 삭제', '이 예산을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => deleteBudget(budgetId),
      },
    ]);
  };

  const handleAddExpense = () => {
    router.push({
      pathname: '/expense/new',
      params: { tripId: activeTrip },
    });
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <YStack
        backgroundColor="$card"
        paddingTop={insets.top}
        paddingHorizontal="$4"
        paddingBottom="$3"
        borderBottomWidth={2}
        borderBottomColor="$primary"
        style={{ borderBottomColor: 'rgba(155, 196, 209, 0.25)' }}
      >
        <Text color="$foreground" fontSize={18} fontWeight="600">
          👛 지갑
        </Text>
        {activeTripData && (
          <Text color="$mutedForeground" fontSize={14} marginTop="$0.5">
            {activeTripData.title}
          </Text>
        )}

        {/* View Mode Tabs */}
        <XStack marginTop="$3" backgroundColor="$accent" borderRadius="$4" padding="$1" opacity={0.3}>
          <Button
            flex={1}
            height={40}
            borderRadius="$3"
            backgroundColor={viewMode === 'expenses' ? '$card' : 'transparent'}
            pressStyle={{ backgroundColor: viewMode === 'expenses' ? '$card' : '$muted' }}
            onPress={() => setViewMode('expenses')}
          >
            <Text color={viewMode === 'expenses' ? '$foreground' : '$mutedForeground'}>
              지출 내역
            </Text>
          </Button>
          <Button
            flex={1}
            height={40}
            borderRadius="$3"
            backgroundColor={viewMode === 'budget' ? '$card' : 'transparent'}
            pressStyle={{ backgroundColor: viewMode === 'budget' ? '$card' : '$muted' }}
            onPress={() => setViewMode('budget')}
          >
            <Text color={viewMode === 'budget' ? '$foreground' : '$mutedForeground'}>
              예산 관리
            </Text>
          </Button>
        </XStack>
      </YStack>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {viewMode === 'budget' ? (
          // Budget View
          <YStack gap="$4">
            <YStack>
              <Text color="$foreground" fontSize={16} fontWeight="600">
                예산 설정
              </Text>
              <Text color="$mutedForeground" fontSize={14} marginTop="$0.5">
                화폐별 예산을 관리하세요
              </Text>
            </YStack>

            {!activeTrip ? (
              <YStack
                backgroundColor="$card"
                borderRadius="$6"
                padding={40}
                alignItems="center"
                borderWidth={1}
                borderColor="$border"
              >
                <Text fontSize={48} marginBottom="$3">🎒</Text>
                <Text color="$mutedForeground">여행을 선택해주세요</Text>
              </YStack>
            ) : filteredBudgets.length === 0 ? (
              <YStack
                backgroundColor="$card"
                borderRadius="$6"
                padding={40}
                alignItems="center"
                borderWidth={1}
                borderColor="$border"
              >
                <Text fontSize={48} marginBottom="$3">💰</Text>
                <Text color="$foreground" marginBottom="$1">아직 예산이 없습니다</Text>
                <Text color="$mutedForeground" marginBottom="$6" textAlign="center">
                  화폐별로 예산을 설정하고 지출을 관리해보세요
                </Text>
                <Button
                  backgroundColor="$primary"
                  pressStyle={{ opacity: 0.8 }}
                  borderRadius="$3"
                  paddingHorizontal="$5"
                  paddingVertical="$3"
                  onPress={() => handleOpenBudgetModal()}
                >
                  <Text color="white" fontWeight="500">첫 예산 추가하기</Text>
                </Button>
              </YStack>
            ) : (
              <YStack gap="$3">
                {filteredBudgets.map((budget) => {
                  const spent = expensesByCurrency[budget.currency] || 0;
                  const percentage = (spent / budget.amount) * 100;
                  const isOverBudget = percentage > 100;

                  return (
                    <YStack
                      key={budget.id}
                      backgroundColor="$card"
                      borderRadius="$6"
                      padding="$5"
                      borderWidth={1}
                      borderColor="$border"
                    >
                      <XStack alignItems="flex-start" justifyContent="space-between" marginBottom="$4">
                        <XStack alignItems="center" gap="$3" flex={1}>
                          <YStack
                            width={48}
                            height={48}
                            backgroundColor="$accent"
                            borderRadius="$4"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text fontSize={20}>{getCurrencySymbol(budget.currency)}</Text>
                          </YStack>
                          <YStack>
                            <Text color="$foreground" fontWeight="500">
                              {CURRENCY_NAMES[budget.currency] || budget.currency}
                            </Text>
                            <Text color="$mutedForeground">
                              예산 {getCurrencySymbol(budget.currency)} {budget.amount.toLocaleString()}
                            </Text>
                          </YStack>
                        </XStack>
                        <XStack gap="$2">
                          <Pressable onPress={() => handleOpenBudgetModal(budget)}>
                            <YStack
                              width={36}
                              height={36}
                              alignItems="center"
                              justifyContent="center"
                              borderRadius="$3"
                            >
                              <Edit2 size={16} color="$mutedForeground" />
                            </YStack>
                          </Pressable>
                          <Pressable onPress={() => handleDeleteBudget(budget.id)}>
                            <YStack
                              width={36}
                              height={36}
                              alignItems="center"
                              justifyContent="center"
                              borderRadius="$3"
                            >
                              <Trash2 size={16} color="$mutedForeground" />
                            </YStack>
                          </Pressable>
                        </XStack>
                      </XStack>

                      {/* Progress Bar */}
                      <YStack gap="$2">
                        <XStack alignItems="center" justifyContent="space-between">
                          <Text color="$mutedForeground">사용 현황</Text>
                          <Text color="$mutedForeground">
                            {getCurrencySymbol(budget.currency)} {spent.toLocaleString()}
                          </Text>
                        </XStack>
                        <YStack
                          height={10}
                          backgroundColor="$muted"
                          borderRadius={5}
                          overflow="hidden"
                        >
                          <YStack
                            height="100%"
                            borderRadius={5}
                            backgroundColor={isOverBudget ? '$destructive' : '$primary'}
                            width={`${Math.min(percentage, 100)}%`}
                          />
                        </YStack>
                      </YStack>

                      {/* Budget Status */}
                      <XStack
                        alignItems="center"
                        justifyContent="space-between"
                        marginTop="$4"
                        paddingTop="$4"
                        borderTopWidth={1}
                        borderTopColor="$border"
                      >
                        <YStack
                          paddingHorizontal="$3"
                          paddingVertical="$1.5"
                          borderRadius={20}
                          backgroundColor={isOverBudget ? '$destructive' : '$accent'}
                          opacity={isOverBudget ? 0.2 : 0.4}
                        >
                          <Text color={isOverBudget ? '$destructive' : '$mutedForeground'}>
                            {percentage.toFixed(1)}%
                          </Text>
                        </YStack>
                        <Text color={isOverBudget ? '$destructive' : '$mutedForeground'}>
                          {isOverBudget
                            ? `${getCurrencySymbol(budget.currency)} ${(spent - budget.amount).toLocaleString()} 초과`
                            : `${getCurrencySymbol(budget.currency)} ${(budget.amount - spent).toLocaleString()} 남음`}
                        </Text>
                      </XStack>
                    </YStack>
                  );
                })}
              </YStack>
            )}
          </YStack>
        ) : (
          // Expenses View
          <YStack gap="$4">
            {/* Currency Summary */}
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
                            <Text color="$foreground" fontSize={12}>{currency}</Text>
                          </YStack>
                          <Text color="$mutedForeground" fontSize={14}>{percentage}%</Text>
                        </XStack>
                        <YStack height={8} backgroundColor="$secondary" borderRadius={4} overflow="hidden" marginBottom="$2">
                          <YStack
                            height="100%"
                            borderRadius={4}
                            backgroundColor={percentage >= 100 ? '$destructive' : '$primary'}
                            width={`${Math.min(percentage, 100)}%`}
                          />
                        </YStack>
                        <XStack alignItems="center" justifyContent="space-between">
                          <Text color="$mutedForeground">
                            ${amount.toLocaleString()} / ${remaining.toLocaleString()}
                          </Text>
                        </XStack>
                      </YStack>
                    );
                  })}
                </YStack>
              </YStack>
            )}

            {/* Recent Expenses */}
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
                  <Text fontSize={48} marginBottom="$3">🛍️</Text>
                  <Text color="$mutedForeground">아직 지출 내역이 없습니다</Text>
                </YStack>
              ) : (
                <YStack gap="$4">
                  {Object.entries(expensesByDate).map(([date, dayExpenses]) => {
                    const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
                    const mainCurrency = dayExpenses[0]?.currency || 'USD';

                    return (
                      <YStack key={date}>
                        <XStack alignItems="center" justifyContent="space-between" marginBottom="$2" paddingHorizontal="$1">
                          <Text color="$foreground">
                            📅 {new Date(date).toLocaleDateString('ko-KR', {
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
                            <XStack
                              key={expense.id}
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
                                  <Text fontSize={18}>{CATEGORY_ICONS[expense.category] || '📦'}</Text>
                                </YStack>
                                <YStack>
                                  <Text color="$foreground">{expense.memo}</Text>
                                  <Text color="$mutedForeground">{CATEGORY_LABELS[expense.category]}</Text>
                                </YStack>
                              </XStack>
                              <Text color="$foreground">
                                {getCurrencySymbol(expense.currency)} {expense.amount.toLocaleString()}
                              </Text>
                            </XStack>
                          ))}
                        </YStack>
                      </YStack>
                    );
                  })}
                </YStack>
              )}
            </YStack>
          </YStack>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      {activeTrip && (
        <Pressable
          onPress={viewMode === 'budget' ? () => handleOpenBudgetModal() : handleAddExpense}
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

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} transparent animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}
          onPress={handleCloseBudgetModal}
        >
          <Pressable style={{ width: '100%', maxWidth: 400 }} onPress={(e) => e.stopPropagation()}>
            <YStack backgroundColor="$card" borderRadius="$6" padding="$6">
              <XStack alignItems="center" justifyContent="space-between" marginBottom="$6">
                <Text color="$foreground" fontSize={18} fontWeight="600">
                  {editingBudget ? '예산 수정' : '예산 추가'}
                </Text>
                <Button
                  size="$3"
                  circular
                  backgroundColor="transparent"
                  pressStyle={{ backgroundColor: '$accent' }}
                  onPress={handleCloseBudgetModal}
                >
                  <X size={20} color="$mutedForeground" />
                </Button>
              </XStack>

              <YStack gap="$4">
                <YStack>
                  <Text color="$mutedForeground" marginBottom="$2">화폐</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <XStack gap="$2">
                      {Object.entries(CURRENCY_NAMES).map(([code, name]) => (
                        <Pressable key={code} onPress={() => setBudgetForm({ ...budgetForm, currency: code })}>
                          <YStack
                            paddingHorizontal="$3"
                            paddingVertical="$2"
                            borderRadius="$3"
                            backgroundColor={budgetForm.currency === code ? '$primary' : '$muted'}
                          >
                            <Text color={budgetForm.currency === code ? 'white' : '$foreground'}>
                              {getCurrencySymbol(code)} {code}
                            </Text>
                          </YStack>
                        </Pressable>
                      ))}
                    </XStack>
                  </ScrollView>
                </YStack>

                <YStack>
                  <Text color="$mutedForeground" marginBottom="$2">예산 금액</Text>
                  <XStack alignItems="center">
                    <Text color="$mutedForeground" marginRight="$2">
                      {getCurrencySymbol(budgetForm.currency)}
                    </Text>
                    <Input
                      flex={1}
                      backgroundColor="$muted"
                      borderWidth={2}
                      borderColor="$border"
                      borderRadius="$4"
                      paddingHorizontal="$4"
                      paddingVertical="$3"
                      placeholder="0"
                      placeholderTextColor="$mutedForeground"
                      value={budgetForm.amount}
                      onChangeText={(text) => setBudgetForm({ ...budgetForm, amount: text })}
                      keyboardType="numeric"
                      color="$foreground"
                    />
                  </XStack>
                </YStack>
              </YStack>

              <XStack gap="$3" marginTop="$6">
                <Button
                  flex={1}
                  backgroundColor="$muted"
                  pressStyle={{ backgroundColor: '$secondary' }}
                  borderRadius="$4"
                  height={48}
                  onPress={handleCloseBudgetModal}
                >
                  <Text color="$foreground">취소</Text>
                </Button>
                <Button
                  flex={1}
                  backgroundColor="$accent"
                  pressStyle={{ backgroundColor: '$accentHover' }}
                  borderRadius="$4"
                  height={48}
                  onPress={handleSaveBudget}
                >
                  <Text color="$foreground">{editingBudget ? '수정' : '추가'}</Text>
                </Button>
              </XStack>
            </YStack>
          </Pressable>
        </Pressable>
      </Modal>
    </YStack>
  );
}
