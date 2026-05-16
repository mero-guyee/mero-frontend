import { YCard } from '@/components/ui/Card';
import FadeWrapper from '@/components/ui/FadeWrapper';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import MoreEditDelete from '@/components/ui/MoreEditDelete';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { ScrollView, Text, YStack } from 'tamagui';
import { useExpenses } from '../../../contexts';
import { CURRENCY_SYMBOLS } from '../../../data/constants';

export default function ExpenseDetailScreen() {
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const router = useRouter();
  const { expenses, categories, deleteExpense } = useExpenses();

  const expense = expenses.find((e) => e.id === expenseId);
  const category = categories.find((c) => c.id === expense?.categoryId);
  const getCurrencySymbol = (currency: string) => CURRENCY_SYMBOLS[currency] || currency;

  if (!expense) {
    return (
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
        <Text color="$mutedForeground">경비를 찾을 수 없습니다.</Text>
      </YStack>
    );
  }

  const handleEdit = () => {
    router.push({ pathname: '/expense/edit', params: { expenseId: expense.id } });
  };

  const handleDelete = () => {
    Alert.alert('경비 삭제', '이 경비를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteExpense(expense.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <YStack flex={1} backgroundColor="$background" px={4}>
      <BackActionHeader onBack={() => router.back()} label="경비 상세">
        <MoreEditDelete onEdit={handleEdit} onDelete={handleDelete} />
      </BackActionHeader>

      {/* Content */}
      <FadeWrapper>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <YCard backgroundColor="$card" padding="$5" gap="$5">
            {/* Date */}
            <YStack gap="$1">
              <Text color="$mutedForeground" fontSize={13} fontWeight="500">
                날짜
              </Text>
              <Text color="$foreground" fontSize={16}>
                {expense.date}
              </Text>
            </YStack>

            {/* Amount & Currency */}
            <YStack gap="$1">
              <Text color="$mutedForeground" fontSize={13} fontWeight="500">
                금액
              </Text>
              <Text color="$foreground" fontSize={16}>
                {getCurrencySymbol(expense.currency)} {expense.amount.toLocaleString()} (
                {expense.currency})
              </Text>
            </YStack>

            {/* Category */}
            <YStack gap="$2">
              <Text color="$mutedForeground" fontSize={13} fontWeight="500">
                카테고리
              </Text>
              {category && (
                <YCard
                  alignSelf="flex-start"
                  padding="$3"
                  borderRadius="$4"
                  backgroundColor="$accent"
                  alignItems="center"
                  gap="$1"
                  aspectRatio={1}
                  opacity={0.8}
                >
                  <Text fontSize={20}>{category.icon}</Text>
                  <Text color="$foreground" fontSize={12} textAlign="center">
                    {category.name}
                  </Text>
                </YCard>
              )}
            </YStack>

            {/* Description */}
            {expense.description && (
              <YStack gap="$1">
                <Text color="$mutedForeground" fontSize={13} fontWeight="500">
                  설명
                </Text>
                <Text color="$foreground" fontSize={16}>
                  {expense.description}
                </Text>
              </YStack>
            )}

            {/* Location */}
            {expense.location && (
              <YStack gap="$1">
                <Text color="$mutedForeground" fontSize={13} fontWeight="500">
                  장소
                </Text>
                <Text color="$foreground" fontSize={16}>
                  {expense.location}
                </Text>
              </YStack>
            )}
          </YCard>
        </ScrollView>
      </FadeWrapper>
    </YStack>
  );
}
