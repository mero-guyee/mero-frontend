import { CategoryIcon } from '@/components/expense/CategoryIcon';
import CategoryPicker from '@/components/expense/CategoryPicker';
import CurrencyPicker from '@/components/expense/CurrencyPicker';
import LocationPicker from '@/components/location/LocationPicker';
import { Input } from '@/components/ui';
import { IconButton } from '@/components/ui/button/BaseButton';
import { YCard } from '@/components/ui/Card';
import DatePickerInput from '@/components/ui/DatePickerInput';
import FadeWrapper from '@/components/ui/FadeWrapper';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { formatGeocode } from '@/utils/location/location';
import { ChevronRight, Link2Off, Pencil, Trash2 } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { ComponentRef, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import Toast from 'react-native-toast-message';
import { ScrollView, Stack, Text, XStack, YStack } from 'tamagui';
import { useAppModal, useExpenses, useFootprints } from '../../contexts';

const plainInputStyle = {
  borderWidth: 0,
  backgroundColor: 'transparent',
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

export default function ExpenseDetail({ expenseId }: { expenseId: string }) {
  const router = useRouter();
  const { expenses, categories, updateExpense, deleteExpense } = useExpenses();
  const { footprints } = useFootprints();
  const { showConfirm } = useAppModal();

  const expense = expenses.find((e) => e.id === expenseId);
  const linkedFootprint = footprints.find((f) => f.id === expense?.footprintId);

  const [tempAmount, setTempAmount] = useState(expense?.amount?.toString() ?? '');
  const [tempDescription, setTempDescription] = useState(expense?.description ?? '');
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const descriptionInputRef = useRef<ComponentRef<typeof Input>>(null);

  if (!expense) {
    return (
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
        <Text color="$mutedForeground">경비를 찾을 수 없습니다.</Text>
      </YStack>
    );
  }

  const handleDelete = async () => {
    const confirmed = await showConfirm('경비 삭제', '이 경비를 삭제하시겠습니까?', {
      confirmText: '삭제',
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteExpense(expense.id);
      router.back();
    } catch {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '경비를 삭제하는 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    }
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

  const handleNavigateToFootprint = () => {
    if (linkedFootprint) router.push(`/(main)/footprint/${linkedFootprint.id}`);
  };

  const handleUnlinkFootprint = async () => {
    const confirmed = await showConfirm(
      '일지 연결 해제',
      '이 경비와 일지의 연결을 해제하시겠습니까?',
      {
        confirmText: '연결 해제',
        destructive: true,
      }
    );
    if (!confirmed) return;
    updateExpense({ ...expense, footprintId: undefined });
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
          <Trash2 size="$6.5" color="$destructiveText" />
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
              <XStack alignItems="center" gap="$0.5" flex={1} justifyContent="flex-end">
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
                <Stack style={{ marginRight: -9 }}>
                  <CurrencyPicker
                    value={expense.currency}
                    onChange={(currency) => updateExpense({ ...expense, currency })}
                  />
                </Stack>
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
                ref={descriptionInputRef}
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
              <Pressable onPress={() => descriptionInputRef.current?.focus()} hitSlop={8}>
                <Pencil size={14} color="$mutedForeground" />
              </Pressable>
            </XStack>

            {/* Location */}
            <FieldRow
              label="장소"
              value={expense.location}
              placeholder="예: 마추픽추"
              onPress={() => setLocationPickerOpen(true)}
            />

            {/* Linked Footprint */}
            {linkedFootprint && (
              <XStack alignItems="center" justifyContent="space-between">
                <Text color="$mutedForeground" fontSize={13} fontWeight="500">
                  일지
                </Text>
                <XStack alignItems="center" gap="$2">
                  <Pressable onPress={handleNavigateToFootprint}>
                    <Text color="$foreground" fontSize={16}>
                      {linkedFootprint.title}
                    </Text>
                  </Pressable>
                  <Pressable onPress={handleUnlinkFootprint} hitSlop={8}>
                    <Link2Off size={16} color="$destructiveText" />
                  </Pressable>
                  <Pressable onPress={handleNavigateToFootprint} hitSlop={8}>
                    <ChevronRight size={18} color="$mutedForeground" />
                  </Pressable>
                </XStack>
              </XStack>
            )}
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
