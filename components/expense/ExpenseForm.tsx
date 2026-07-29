import CategoryPicker from '@/components/expense/CategoryPicker';
import CurrencyPicker from '@/components/expense/CurrencyPicker';
import LocationPicker from '@/components/location/LocationPicker';
import SubmitButton from '@/components/ui/button/SubmitButton';
import DatePickerInput from '@/components/ui/DatePickerInput';
import FadeWrapper from '@/components/ui/FadeWrapper';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { inputStyle } from '@/components/ui/Input';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { formatGeocode } from '@/utils/location/location';
import { MapPin } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { Text, XStack, YStack } from 'tamagui';
import { Input } from '../../components/ui';
import { useExpenses, useTrips } from '../../contexts';
import { Expense } from '../../types';

type ExpenseFormProps =
  | { mode: 'edit'; expense: Expense; tripId?: never; footprintId?: never }
  | { mode: 'new'; expense?: never; tripId?: string; footprintId?: string };

export default function ExpenseForm({ mode, expense, tripId, footprintId }: ExpenseFormProps) {
  const isEdit = mode === 'edit';
  const router = useRouter();
  const { activeTrip } = useTrips();
  const { categories, addExpense, updateExpense } = useExpenses();
  const effectiveTripId = tripId || activeTrip || '';

  const [amount, setAmount] = useState(expense?.amount?.toString() ?? '');
  const [currency, setCurrency] = useState(expense?.currency ?? 'KRW');
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? categories[0]?.id ?? '');
  const [date, setDate] = useState(expense?.date ?? new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(expense?.description ?? '');
  const [location, setLocation] = useState(expense?.location ?? '');
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  const isDirty =
    amount !== (expense?.amount?.toString() ?? '') ||
    currency !== (expense?.currency ?? 'KRW') ||
    categoryId !== (expense?.categoryId ?? categories[0]?.id ?? '') ||
    date !== (expense?.date ?? new Date().toISOString().split('T')[0]) ||
    description !== (expense?.description ?? '') ||
    location !== (expense?.location ?? '');

  const { confirmLeave, markSaved } = useUnsavedChangesGuard(isDirty);

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
      setLocation(searchedPlaceName || geocodedPlaceName);
    });
  };

  const handleSubmit = async () => {
    markSaved();

    if (isEdit) {
      updateExpense({
        ...expense,
        date,
        categoryId,
        amount: parseFloat(amount),
        currency,
        description: description.trim() || undefined,
        location: location.trim() || undefined,
      });
      router.back();
      return;
    }

    try {
      const created = await addExpense({
        tripId: effectiveTripId,
        footprintId,
        date,
        categoryId,
        amount: parseFloat(amount),
        currency,
        description: description.trim() || undefined,
        location: location.trim() || undefined,
      });
      if (footprintId) {
        router.back();
      } else {
        router.dismissTo({ pathname: '/(main)/expense', params: { created: created.id } });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '경비를 저장하는 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <BackActionHeader onBack={() => confirmLeave(() => router.back())}>
        <SubmitButton
          onPress={handleSubmit}
          disabled={!amount || parseFloat(amount) <= 0 || !categoryId}
          opacity={amount && parseFloat(amount) > 0 && categoryId ? 1 : 0.5}
        />
      </BackActionHeader>

      <FadeWrapper>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
          {/* Amount and Currency */}
          <YStack marginBottom="$6">
            <Text color="$foreground" marginBottom="$2" fontWeight="500">
              금액
            </Text>
            <XStack {...inputStyle} alignItems="center" paddingHorizontal="$0">
              <Input
                flex={1}
                placeholder="0"
                placeholderTextColor="$placeholderForeground"
                value={amount}
                onChangeText={setAmount}
                keyboardType="number-pad"
                color="$foreground"
                borderWidth={0}
                height={44}
                focusStyle={{ borderWidth: 0 }}
                autoFocus
              />
              <CurrencyPicker value={currency} onChange={setCurrency} />
            </XStack>
          </YStack>
          {/* Category */}
          <YStack marginBottom="$6">
            <Text color="$foreground" marginBottom="$3" fontWeight="500">
              카테고리
            </Text>
            <CategoryPicker categories={categories} value={categoryId} onChange={setCategoryId} />
          </YStack>
          {/* Date */}
          <YStack marginBottom="$6">
            <Text color="$foreground" marginBottom="$2" fontWeight="500">
              날짜
            </Text>
            <DatePickerInput value={date} onChange={setDate} />
            {!isEdit && footprintId && (
              <Text color="$mutedForeground" marginTop="$1" fontSize={14}>
                일지 날짜로 자동 설정됨
              </Text>
            )}
          </YStack>

          {/* Description */}
          <YStack marginBottom="$6">
            <Text color="$foreground" marginBottom="$2" fontWeight="500">
              설명
            </Text>
            <Input
              placeholder="맛있게 먹었으니 0원"
              placeholderTextColor="$placeholderForeground"
              value={description}
              onChangeText={setDescription}
            />
          </YStack>

          {/* Location */}
          <YStack marginBottom="$6">
            <Text color="$foreground" marginBottom="$2" fontWeight="500">
              장소
            </Text>
            <Pressable onPress={() => setLocationPickerOpen(true)}>
              <XStack {...inputStyle} alignItems="center" justifyContent="space-between">
                <Text color={location ? '$foreground' : '$placeholderForeground'}>
                  {location || '예: 마추픽추'}
                </Text>
                <MapPin size={18} color="$mutedForeground" />
              </XStack>
            </Pressable>
            <LocationPicker
              visible={locationPickerOpen}
              onClose={() => setLocationPickerOpen(false)}
              onConfirm={handleLocationConfirm}
            />
          </YStack>
        </ScrollView>
      </FadeWrapper>
    </YStack>
  );
}
