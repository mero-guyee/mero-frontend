import { paddingHorizontalGeneral } from '@/constants/theme';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import { Backpack, Plus, Wallet } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { Text, XStack, YStack } from 'tamagui';
import { useAppModal, useBudgets, useExpenses, useTrips } from '../../contexts';
import { CURRENCIES } from '../../data/constants';
import { Budget } from '../../types';
import { EmptyState, FilledButton, Input } from '../ui';
import AppBottomSheet from '../ui/AppBottomSheet';
import FloatingActionButton from '../ui/button/FloatingActionButton';
import { YCard } from '../ui/Card';
import { inputStyle } from '../ui/Input';
import { BudgetCard } from './BudgetCard';
import CurrencyPicker from './CurrencyPicker';

export function BudgetView() {
  const { activeTrip, getTripById } = useTrips();
  const { expenses } = useExpenses();
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudgets();
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
              {filteredBudgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  expenses={filteredExpenses}
                  trip={trip}
                  isExpanded={expandedBudgetIds.has(budget.id)}
                  onToggleExpand={() => toggleBudgetExpanded(budget.id)}
                  onEdit={() => handleOpenBudgetModal(budget)}
                  onDelete={() => handleDeleteBudget(budget.id)}
                  isNew={budget.id === createdId}
                />
              ))}
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
