import { CategoryIcon } from '@/components/expense/CategoryIcon';
import CategoryPicker from '@/components/expense/CategoryPicker';
import LocationPicker from '@/components/location/LocationPicker';
import { Input } from '@/components/ui';
import { IconButton } from '@/components/ui/button/BaseButton';
import { YCard } from '@/components/ui/Card';
import DatePickerInput from '@/components/ui/DatePickerInput';
import FadeWrapper from '@/components/ui/FadeWrapper';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { formatGeocode } from '@/utils/location/location';
import { ChevronRight, Trash2 } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable } from 'react-native';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { useExpenses } from '../../../contexts';
import { CURRENCY_SYMBOLS } from '../../../data/constants';

const plainInputStyle = {
  borderWidth: 0,
  backgroundColor: '$transparent',
  height: 24,
  paddingHorizontal: '$0',
  paddingVertical: '$0',
  focusStyle: { borderWidth: 0 },
} as const;

function FieldRow({
  label,
  value,
  placeholder,
  onPress,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <XStack alignItems="center" justifyContent="space-between">
        <Text color="$mutedForeground" fontSize={13} fontWeight="500">
          {label}
        </Text>
        <XStack alignItems="center" gap="$1">
          <Text color={value ? '$foreground' : '$placeholderForeground'} fontSize={16}>
            {value || placeholder}
          </Text>
          <ChevronRight size={18} color="$mutedForeground" />
        </XStack>
      </XStack>
    </Pressable>
  );
}

export default function ExpenseDetailScreen() {
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const router = useRouter();
  const { expenses, categories, updateExpense, deleteExpense } = useExpenses();

  const expense = expenses.find((e) => e.id === expenseId);

  const [tempAmount, setTempAmount] = useState(expense?.amount?.toString() ?? '');
  const [tempCurrency] = useState(expense?.currency ?? 'KRW');
  const [tempDescription, setTempDescription] = useState(expense?.description ?? '');
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  const getCurrencySymbol = (currency: string) => CURRENCY_SYMBOLS[currency] || currency;

  if (!expense) {
    return (
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
        <Text color="$mutedForeground">경비를 찾을 수 없습니다.</Text>
      </YStack>
    );
  }

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

  const handleAmountBlur = () => {
    if (!tempAmount || parseFloat(tempAmount) <= 0) {
      setTempAmount(expense.amount.toString());
      return;
    }
    if (parseFloat(tempAmount) !== expense.amount) {
      updateExpense({ ...expense, amount: parseFloat(tempAmount) });
    }
  };

  const handleDescriptionBlur = () => {
    const trimmed = tempDescription.trim();
    if (trimmed !== (expense.description ?? '')) {
      updateExpense({ ...expense, description: trimmed || undefined });
    }
  };

  const handleLocationConfirm = ({
    latitude,
    longitude,
    placeName: searchedPlaceName,
  }: {
    latitude: number;
    longitude: number;
    placeName?: string;
  }) => {
    formatGeocode(latitude, longitude).then(({ placeName: geocodedPlaceName }) => {
      updateExpense({ ...expense, location: searchedPlaceName || geocodedPlaceName });
    });
  };

  return (
    <YStack flex={1} backgroundColor="$background" px={4}>
      <BackActionHeader onBack={() => router.back()} label="상세 내역">
        <IconButton onPress={handleDelete}>
          <Trash2 size="$6.5" color="$destructive" />
        </IconButton>
      </BackActionHeader>

      {/* Content */}
      <FadeWrapper>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <YCard backgroundColor="$card" padding="$5" gap="$5">
            {/* Amount & Currency */}
            <XStack alignItems="center" justifyContent="space-between" gap="$2">
              <Text color="$mutedForeground" fontSize={13} fontWeight="500">
                금액
              </Text>
              <XStack alignItems="center" gap="$1" flex={1} justifyContent="flex-end">
                <Text color="$foreground" fontSize={16}>
                  {getCurrencySymbol(tempCurrency)}
                </Text>
                <Input
                  {...plainInputStyle}
                  color="$foreground"
                  fontSize={16}
                  textAlign="right"
                  value={tempAmount}
                  onChangeText={setTempAmount}
                  onBlur={handleAmountBlur}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="$placeholderForeground"
                />
              </XStack>
            </XStack>
            {/* Category */}
            <CategoryPicker
              categories={categories}
              value={expense.categoryId}
              onChange={(categoryId) => updateExpense({ ...expense, categoryId })}
              renderTrigger={(onPress) => {
                const selected = categories.find((c) => c.id === expense.categoryId);
                return (
                  <Pressable onPress={onPress}>
                    <XStack alignItems="center" justifyContent="space-between">
                      <Text color="$mutedForeground" fontSize={13} fontWeight="500">
                        카테고리
                      </Text>
                      <XStack alignItems="center" gap="$1">
                        {selected && <CategoryIcon name={selected.name} size={16} />}
                        <Text color="$foreground" fontSize={16}>
                          {selected?.name ?? '선택'}
                        </Text>
                        <ChevronRight size={18} color="$mutedForeground" />
                      </XStack>
                    </XStack>
                  </Pressable>
                );
              }}
            />

            {/* Date */}
            <DatePickerInput
              value={expense.date}
              onChange={(date) => updateExpense({ ...expense, date })}
              renderTrigger={(onPress) => (
                <FieldRow label="날짜" value={expense.date} onPress={onPress} />
              )}
            />

            {/* Description */}
            <XStack alignItems="center" justifyContent="space-between" gap="$2">
              <Text color="$mutedForeground" fontSize={13} fontWeight="500">
                설명
              </Text>
              <Input
                {...plainInputStyle}
                flex={1}
                color="$foreground"
                fontSize={16}
                textAlign="right"
                value={tempDescription}
                onChangeText={setTempDescription}
                onBlur={handleDescriptionBlur}
                placeholder="맛있게 먹었으니 0원"
                placeholderTextColor="$placeholderForeground"
              />
            </XStack>

            {/* Location */}
            <FieldRow
              label="장소"
              value={expense.location}
              placeholder="예: 마추픽추"
              onPress={() => setLocationPickerOpen(true)}
            />
          </YCard>
        </ScrollView>
      </FadeWrapper>

      <LocationPicker
        visible={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        onConfirm={handleLocationConfirm}
      />
    </YStack>
  );
}
