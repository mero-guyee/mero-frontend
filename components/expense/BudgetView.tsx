import { paddingHorizontalGeneral } from '@/constants/theme';
import { Backpack, Edit3, Plus, Trash2, Wallet } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sheet, Text, XStack, YStack } from 'tamagui';
import { useBudgets, useExpenses, useSyncContext, useTrips } from '../../contexts';
import { CURRENCY_NAMES, CURRENCY_SYMBOLS } from '../../data/constants';
import { Budget } from '../../types';
import { EmptyState, FilledButton, Input } from '../ui';
import FloatingActionButton from '../ui/button/FloatingActionButton';
import { YCard } from '../ui/Card';
import { inputStyle } from '../ui/Input';
import { SyncIndicator } from '../ui/SyncIndicator';
import { SyncingResultBadge } from '../ui/SyncingResultBadge';
import CurrencyPicker from './CurrencyPicker';

export function BudgetView() {
  const { activeTrip } = useTrips();
  const { expenses } = useExpenses();
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudgets();
  const { isSyncing } = useSyncContext();

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetForm, setBudgetForm] = useState({ currency: 'KRW', amount: '' });
  const [createdId, setCreatedId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const filteredBudgets = budgets.filter((b) => !activeTrip || b.tripId === activeTrip);
  const filteredExpenses = expenses.filter((e) => !activeTrip || e.tripId === activeTrip);

  const expensesByCurrency = filteredExpenses.reduce(
    (acc, expense) => {
      if (!acc[expense.currency]) acc[expense.currency] = 0;
      acc[expense.currency] += expense.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const getCurrencySymbol = (currency: string) => CURRENCY_SYMBOLS[currency] || currency;

  const handleOpenBudgetModal = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setBudgetForm({ currency: budget.currency, amount: budget.amount.toString() });
    } else {
      setEditingBudget(null);
      setBudgetForm({ currency: 'KRW', amount: '' });
    }
    setShowBudgetModal(true);
  };

  const handleCloseBudgetModal = () => {
    setShowBudgetModal(false);
    setEditingBudget(null);
    setBudgetForm({ currency: 'USD', amount: '' });
  };

  const handleSaveBudget = async () => {
    if (!activeTrip || !budgetForm.amount) return;
    const amount = parseFloat(budgetForm.amount);
    if (isNaN(amount) || amount <= 0) return;

    if (editingBudget) {
      updateBudget({ ...editingBudget, currency: budgetForm.currency, amount });
    } else {
      const created = await addBudget({
        tripId: activeTrip,
        currency: budgetForm.currency,
        amount,
      });
      setCreatedId(created.id);
    }
    handleCloseBudgetModal();
  };

  const handleDeleteBudget = (budgetId: string) => {
    Alert.alert('예산 삭제', '이 예산을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => deleteBudget(budgetId) },
    ]);
  };

  return (
    <YStack flex={1}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: paddingHorizontalGeneral, paddingBottom: 100 }}
      >
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
            <YCard>
              <EmptyState
                icon={<Backpack size={32} color="$mutedForeground" />}
                title="여행을 선택해주세요"
                flex={0}
                paddingVertical="$8"
              />
            </YCard>
          ) : filteredBudgets.length === 0 ? (
            <EmptyState
              icon={<Wallet size={32} color="$mutedForeground" />}
              title="아직 예산이 없어요"
              description="화폐별로 예산을 설정하고 지출을 관리해보세요"
              flex={0}
              paddingVertical="$8"
            />
          ) : (
            <YStack gap="$3">
              {filteredBudgets.map((budget) => {
                const spent = expensesByCurrency[budget.currency] || 0;
                const percentage = (spent / budget.amount) * 100;
                const isOverBudget = percentage > 100;

                return (
                  <YCard key={budget.id} padding="$5" position="relative">
                    {budget.id === createdId && <SyncingResultBadge id={budget.id} />}
                    <XStack
                      alignItems="flex-start"
                      justifyContent="space-between"
                      marginBottom="$4"
                    >
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
                          <XStack alignItems="center" gap="$2">
                            <Text color="$foreground" fontWeight="500">
                              {CURRENCY_NAMES[budget.currency] || budget.currency}
                            </Text>
                            <SyncIndicator
                              status={budget.syncStatus}
                              syncing={isSyncing(budget.id)}
                            />
                          </XStack>
                          <Text color="$mutedForeground">
                            예산 {getCurrencySymbol(budget.currency)}{' '}
                            {budget.amount.toLocaleString()}
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
                            <Edit3 size={16} color="$mutedForeground" />
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
                  </YCard>
                );
              })}
            </YStack>
          )}
        </YStack>
      </ScrollView>

      {activeTrip && (
        <FloatingActionButton onPress={() => handleOpenBudgetModal()}>
          <XStack alignItems="center" gap="$2">
            <Plus />
            <Text>예산 추가</Text>
          </XStack>
        </FloatingActionButton>
      )}

      <Sheet
        modal
        open={showBudgetModal}
        onOpenChange={(open: boolean) => !open && handleCloseBudgetModal()}
        snapPointsMode="fit"
        dismissOnSnapToBottom
      >
        <Sheet.Overlay
          animation="lazy"
          bg="rgba(0,0,0,0.6)"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Handle />
        <Sheet.Frame padding="$5" gap="$4" paddingBottom={insets.bottom || 8}>
          <Text color="$foreground" fontSize={18} fontWeight="600">
            {editingBudget ? '예산 수정' : '예산 추가'}
          </Text>

          <YStack>
            <Text color="$mutedForeground" marginBottom="$2">
              예산 금액
            </Text>
            <XStack {...inputStyle} alignItems="center" paddingHorizontal="$0">
              <Input
                flex={1}
                placeholder="0"
                placeholderTextColor="$placeholderForeground"
                value={budgetForm.amount}
                onChangeText={(text) => setBudgetForm({ ...budgetForm, amount: text })}
                keyboardType="numeric"
                color="$foreground"
                borderWidth={0}
                height={44}
                focusStyle={{ borderWidth: 0 }}
              />
              <CurrencyPicker
                value={budgetForm.currency}
                onChange={(currency) => setBudgetForm({ ...budgetForm, currency })}
              />
            </XStack>
          </YStack>

          <XStack gap="$3">
            <FilledButton
              flex={1}
              backgroundColor="$muted"
              pressStyle={{ backgroundColor: '$secondary' }}
              onPress={handleCloseBudgetModal}
            >
              <Text color="$foreground">취소</Text>
            </FilledButton>
            <FilledButton flex={1} onPress={handleSaveBudget}>
              <Text color="$foreground">{editingBudget ? '수정' : '추가'}</Text>
            </FilledButton>
          </XStack>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}
