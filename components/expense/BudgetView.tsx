import { paddingHorizontalGeneral } from '@/constants/theme';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import {
  Backpack,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
  Wallet,
} from '@tamagui/lucide-icons';
import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { Text, XStack, YStack } from 'tamagui';
import { useAppModal, useBudgets, useExpenses, useSyncContext, useTrips } from '../../contexts';
import { CURRENCIES, getCurrencyCode } from '../../data/constants';
import { Budget } from '../../types';
import { EmptyState, FilledButton, Input } from '../ui';
import AppBottomSheet from '../ui/AppBottomSheet';
import FloatingActionButton from '../ui/button/FloatingActionButton';
import { YCard } from '../ui/Card';
import { inputStyle } from '../ui/Input';
import { SyncIndicator } from '../ui/SyncIndicator';
import { SyncingResultBadge } from '../ui/SyncingResultBadge';
import CurrencyPicker from './CurrencyPicker';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export function BudgetView() {
  const { activeTrip, getTripById } = useTrips();
  const { expenses } = useExpenses();
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudgets();
  const { isSyncing } = useSyncContext();
  const isKeyboardVisible = useKeyboardVisible();
  const { showConfirm } = useAppModal();

  const filteredBudgets = budgets.filter((b) => !activeTrip || b.tripId === activeTrip);
  const filteredExpenses = expenses.filter((e) => !activeTrip || e.tripId === activeTrip);
  const trip = activeTrip ? getTripById(activeTrip) : undefined;

  const getDefaultCurrency = (): string => {
    const usedCurrencies = filteredBudgets.map((b) => b.currency);
    return CURRENCIES.find((c) => !usedCurrencies.includes(c.code))?.code || CURRENCIES[0].code;
  };

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetForm, setBudgetForm] = useState({ currency: getDefaultCurrency(), amount: '' });
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [expandedBudgetIds, setExpandedBudgetIds] = useState<Set<string>>(new Set());

  const toggleBudgetExpanded = (budgetId: string) => {
    setExpandedBudgetIds((prev) => {
      const next = new Set(prev);
      if (next.has(budgetId)) next.delete(budgetId);
      else next.add(budgetId);
      return next;
    });
  };

  const usedCurrencies = filteredBudgets
    .filter((b) => b.id !== editingBudget?.id)
    .map((b) => b.currency);

  const expensesByCurrency = filteredExpenses.reduce(
    (acc, expense) => {
      if (!acc[expense.currency]) acc[expense.currency] = 0;
      acc[expense.currency] += expense.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const getCategoryBreakdown = (currency: string) => {
    const byCategory = new Map<
      string,
      { id: string; name: string; color?: string; amount: number }
    >();
    filteredExpenses
      .filter((e) => e.currency === currency)
      .forEach((e) => {
        const existing = byCategory.get(e.categoryId);
        if (existing) {
          existing.amount += e.amount;
        } else {
          byCategory.set(e.categoryId, {
            id: e.categoryId,
            name: e.categoryName || '기타',
            color: e.categoryColor,
            amount: e.amount,
          });
        }
      });
    return Array.from(byCategory.values()).sort((a, b) => b.amount - a.amount);
  };

  const getDailyRecommended = (remaining: number): number | null => {
    if (!trip || remaining <= 0) return null;
    const today = startOfDay(new Date());
    const end = startOfDay(new Date(trip.endDate));
    const remainingDays = Math.floor((end.getTime() - today.getTime()) / MS_PER_DAY) + 1;
    if (remainingDays <= 0) return null;
    return Math.round(remaining / remainingDays);
  };

  const getTodayMarkerPercent = (): number | null => {
    if (!trip) return null;
    const start = startOfDay(new Date(trip.startDate)).getTime();
    const end = startOfDay(new Date(trip.endDate)).getTime();
    const today = startOfDay(new Date()).getTime();
    if (end <= start || today < start || today > end) return null;
    return ((today - start) / (end - start)) * 100;
  };

  const handleOpenBudgetModal = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setBudgetForm({ currency: budget.currency, amount: budget.amount.toString() });
    } else {
      setEditingBudget(null);
      setBudgetForm({ currency: getDefaultCurrency(), amount: '' });
    }
    setShowBudgetModal(true);
  };

  const handleCloseBudgetModal = () => {
    setShowBudgetModal(false);
    setEditingBudget(null);
    setBudgetForm({ currency: getDefaultCurrency(), amount: '' });
  };

  const handleSaveBudget = async () => {
    if (!budgetForm.amount) return;
    const amount = parseFloat(budgetForm.amount);
    if (isNaN(amount) || amount <= 0) return;

    if (editingBudget) {
      updateBudget({ ...editingBudget, currency: budgetForm.currency, amount });
      handleCloseBudgetModal();
      return;
    }

    try {
      const created = await addBudget({
        tripId: activeTrip!,
        currency: budgetForm.currency,
        amount,
      });
      setCreatedId(created.id);
      handleCloseBudgetModal();
    } catch {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '예산을 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    const confirmed = await showConfirm('예산 삭제', '이 예산을 삭제하시겠습니까?', {
      confirmText: '삭제',
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteBudget(budgetId);
    } catch {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '예산을 삭제하는 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    }
  };

  return (
    <YStack flex={1}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: paddingHorizontalGeneral, paddingBottom: 100 }}
      >
        <YStack gap="$4">
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
                const remaining = budget.amount - spent;
                const dailyRecommended = getDailyRecommended(remaining);
                const todayMarkerPercent = getTodayMarkerPercent();
                const categoryBreakdown = getCategoryBreakdown(budget.currency);
                const isExpanded = expandedBudgetIds.has(budget.id);

                return (
                  <YCard key={budget.id} padding="$5" position="relative">
                    {budget.id === createdId && <SyncingResultBadge id={budget.id} />}

                    <XStack alignItems="center" justifyContent="space-between" marginBottom="$4">
                      <XStack alignItems="center" gap="$2" flex={1}>
                        <Text color="$foreground" fontSize={20} fontWeight="700">
                          {isOverBudget
                            ? `${getCurrencyCode(budget.currency)} ${(spent - budget.amount).toLocaleString()} 초과했어요`
                            : `${getCurrencyCode(budget.currency)} ${remaining.toLocaleString()} 남았어요`}
                        </Text>
                        <SyncIndicator status={budget.syncStatus} syncing={isSyncing(budget.id)} />
                      </XStack>
                      <XStack gap="$3">
                        <Pressable onPress={() => handleOpenBudgetModal(budget)}>
                          <YStack
                            width={32}
                            height={32}
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="$3"
                          >
                            <Pencil size={16} color="$foreground" />
                          </YStack>
                        </Pressable>
                        <Pressable onPress={() => handleDeleteBudget(budget.id)}>
                          <YStack
                            width={32}
                            height={32}
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="$3"
                          >
                            <Trash2 size={16} color="$destructiveText" />
                          </YStack>
                        </Pressable>
                      </XStack>
                    </XStack>

                    <YStack
                      height={14}
                      backgroundColor="$muted"
                      borderRadius={7}
                      overflow="hidden"
                      position="relative"
                      marginBottom="$2"
                    >
                      <YStack
                        height="100%"
                        borderRadius={7}
                        backgroundColor={isOverBudget ? '$destructive' : '$accentStrong'}
                        width={`${Math.min(percentage, 100)}%`}
                      />
                      {todayMarkerPercent !== null && (
                        <YStack
                          position="absolute"
                          top={0}
                          bottom={0}
                          left={`${todayMarkerPercent}%`}
                          width={2}
                          backgroundColor="$foreground"
                          opacity={0.4}
                        />
                      )}
                    </YStack>
                    <XStack alignItems="center" justifyContent="space-between" marginBottom="$4">
                      <Text color="$mutedForeground" fontSize={13}>
                        사용 {getCurrencyCode(budget.currency)} {spent.toLocaleString()}
                      </Text>
                      <Text color="$mutedForeground" fontSize={13}>
                        총 예산 {getCurrencyCode(budget.currency)} {budget.amount.toLocaleString()}
                      </Text>
                    </XStack>

                    {dailyRecommended !== null && (
                      <XStack
                        alignItems="center"
                        justifyContent="space-between"
                        paddingVertical="$3"
                        borderTopWidth={1}
                        borderTopColor="$border"
                        marginBottom="$3"
                      >
                        <Text color="$mutedForeground">하루 권장 예산</Text>
                        <Text color="$foreground" fontWeight="600">
                          {getCurrencyCode(budget.currency)} {dailyRecommended.toLocaleString()}
                        </Text>
                      </XStack>
                    )}

                    <Pressable
                      onPress={() =>
                        categoryBreakdown.length > 0 && toggleBudgetExpanded(budget.id)
                      }
                    >
                      <YStack backgroundColor="$muted" borderRadius="$4" padding="$4" gap="$3">
                        <XStack alignItems="center" justifyContent="space-between">
                          <Text color="$foreground" fontWeight="600">
                            사용한 예산
                          </Text>
                          <XStack alignItems="center" gap="$1">
                            <Text color="$foreground" fontWeight="600">
                              {getCurrencyCode(budget.currency)} {spent.toLocaleString()}
                            </Text>
                            {categoryBreakdown.length > 0 &&
                              (isExpanded ? (
                                <ChevronUp size={16} color="$mutedForeground" />
                              ) : (
                                <ChevronDown size={16} color="$mutedForeground" />
                              ))}
                          </XStack>
                        </XStack>
                        {isExpanded && categoryBreakdown.length > 0 && (
                          <YStack
                            gap="$2"
                            paddingTop="$2"
                            borderTopWidth={1}
                            borderTopColor="$border"
                          >
                            {categoryBreakdown.map((category) => (
                              <XStack
                                key={category.id}
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <XStack alignItems="center" gap="$2">
                                  <YStack
                                    width={8}
                                    height={8}
                                    borderRadius={4}
                                    backgroundColor={category.color || '$mutedForeground'}
                                  />
                                  <Text color="$mutedForeground">{category.name}</Text>
                                </XStack>
                                <Text color="$foreground">
                                  {getCurrencyCode(budget.currency)}{' '}
                                  {category.amount.toLocaleString()}
                                </Text>
                              </XStack>
                            ))}
                          </YStack>
                        )}
                      </YStack>
                    </Pressable>
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

      <AppBottomSheet
        open={showBudgetModal}
        onOpenChange={(open: boolean) => !open && handleCloseBudgetModal()}
        dismissOnOverlayPress={!isKeyboardVisible}
        frameProps={{ padding: '$5', gap: '$4' }}
      >
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
              disabledCurrencies={usedCurrencies}
            />
          </XStack>
        </YStack>

        <XStack gap="$3">
          <FilledButton
            flex={1}
            backgroundColor="$muted"
            pressStyle={{ backgroundColor: '$mutedPress' }}
            onPress={handleCloseBudgetModal}
          >
            <Text color="$foreground">취소</Text>
          </FilledButton>
          <FilledButton
            flex={1}
            onPress={handleSaveBudget}
            disabled={
              !budgetForm.amount ||
              isNaN(parseFloat(budgetForm.amount)) ||
              parseFloat(budgetForm.amount) <= 0
            }
            opacity={
              budgetForm.amount &&
              !isNaN(parseFloat(budgetForm.amount)) &&
              parseFloat(budgetForm.amount) > 0
                ? 1
                : 0.5
            }
          >
            <Text color="$foreground">{editingBudget ? '수정' : '추가'}</Text>
          </FilledButton>
        </XStack>
      </AppBottomSheet>
    </YStack>
  );
}
