import { IconButton } from '@/components/ui/button/BaseButton';
import { ArrowLeft, MoreVertical } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { CircularButton } from '../../../components/ui';
import { useExpenses } from '../../../contexts';
import { CURRENCY_SYMBOLS } from '../../../data/constants';

export default function ExpenseDetailScreen() {
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { expenses, categories, deleteExpense } = useExpenses();
  const [menuVisible, setMenuVisible] = useState(false);

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
    setMenuVisible(false);
    router.push({ pathname: '/expense/edit', params: { expenseId: expense.id } });
  };

  const handleDelete = () => {
    setMenuVisible(false);
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
      {/* Header */}
      <YStack backgroundColor="$card" borderBottomWidth={2} borderBottomColor="$border">
        <XStack
          paddingTop={insets.top}
          paddingHorizontal="$4"
          paddingBottom="$3"
          alignItems="center"
          justifyContent="space-between"
        >
          <IconButton onPress={() => router.back()}>
            <ArrowLeft size={20} color="$foreground" />
          </IconButton>
          <Text color="$foreground" fontSize={16} fontWeight="500">
            경비 상세
          </Text>
          <CircularButton onPress={() => setMenuVisible((v) => !v)}>
            <MoreVertical size={20} color="$foreground" />
          </CircularButton>
          <Modal
            visible={menuVisible}
            transparent
            animationType="none"
            onRequestClose={() => setMenuVisible(false)}
          >
            <Pressable style={{ flex: 1 }} onPress={() => setMenuVisible(false)}>
              <YStack
                position="absolute"
                top={insets.top + 52}
                right={16}
                backgroundColor="$card"
                borderRadius="$4"
                borderWidth={1}
                borderColor="$border"
                overflow="hidden"
              >
                <Pressable onPress={handleEdit}>
                  <YStack paddingHorizontal="$4" paddingVertical="$3">
                    <Text color="$foreground" fontSize={14}>
                      수정
                    </Text>
                  </YStack>
                </Pressable>
                <YStack height={1} backgroundColor="$border" />
                <Pressable onPress={handleDelete}>
                  <YStack paddingHorizontal="$4" paddingVertical="$3">
                    <Text color="$destructive" fontSize={14}>
                      삭제
                    </Text>
                  </YStack>
                </Pressable>
              </YStack>
            </Pressable>
          </Modal>
        </XStack>
      </YStack>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <YStack backgroundColor="$card" borderRadius="$6" borderWidth={1} borderColor="$border">
          <YStack padding="$5" gap="$5">
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
                <YStack
                  alignSelf="flex-start"
                  padding="$3"
                  borderRadius="$4"
                  borderWidth={2}
                  borderColor="$primary"
                  backgroundColor="$accent"
                  alignItems="center"
                  gap="$1"
                  opacity={0.8}
                >
                  <Text fontSize={20}>{category.icon}</Text>
                  <Text color="$foreground" fontSize={12} textAlign="center">
                    {category.name}
                  </Text>
                </YStack>
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
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
