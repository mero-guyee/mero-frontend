import { ChevronDown, ChevronUp, Pencil, Trash2 } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { getCurrencyCode } from '../../data/constants';
import { Budget, Expense, Trip } from '../../types';
import { YCard } from '../ui/Card';
import { SyncStatusIndicator } from '../ui/SyncStatusIndicator';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

interface BudgetCardProps {
  budget: Budget;
  expenses: Expense[];
  trip?: Trip;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isNew?: boolean;
}

export function BudgetCard({
  budget,
  expenses,
  trip,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  isNew = false,
}: BudgetCardProps) {
  const currencyExpenses = expenses.filter((e) => e.currency === budget.currency);
  const spent = currencyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const percentage = (spent / budget.amount) * 100;
  const isOverBudget = percentage > 100;
  const remaining = budget.amount - spent;

  const getDailyRecommended = (): number | null => {
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

  const getCategoryBreakdown = () => {
    const byCategory = new Map<
      string,
      { id: string; name: string; color?: string; amount: number }
    >();
    currencyExpenses.forEach((e) => {
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

  const dailyRecommended = getDailyRecommended();
  const todayMarkerPercent = getTodayMarkerPercent();
  const categoryBreakdown = getCategoryBreakdown();

  return (
    <YCard padding="$5" position="relative">
      <YStack gap="$2" marginBottom="$4">
        <XStack alignItems="center" justifyContent="space-between">
          <Text color="$foreground" fontSize={20} fontWeight="700" flex={1} paddingRight="$2">
            {isOverBudget
              ? `${getCurrencyCode(budget.currency)} ${(spent - budget.amount).toLocaleString()} 초과했어요`
              : `${getCurrencyCode(budget.currency)} ${remaining.toLocaleString()} 남았어요`}
          </Text>
          <XStack gap="$3">
            <Pressable onPress={onEdit}>
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
            <Pressable onPress={onDelete}>
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
        <SyncStatusIndicator id={budget.id} status={budget.syncStatus} showSyncBadge={isNew} />
      </YStack>

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

      <Pressable onPress={() => categoryBreakdown.length > 0 && onToggleExpand()}>
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
            <YStack gap="$2" paddingTop="$2" borderTopWidth={1} borderTopColor="$border">
              {categoryBreakdown.map((category) => (
                <XStack key={category.id} alignItems="center" justifyContent="space-between">
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
                    {getCurrencyCode(budget.currency)} {category.amount.toLocaleString()}
                  </Text>
                </XStack>
              ))}
            </YStack>
          )}
        </YStack>
      </Pressable>
    </YCard>
  );
}
