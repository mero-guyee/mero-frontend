import CategoryPicker from '@/components/expense/CategoryPicker';
import CurrencyPicker from '@/components/expense/CurrencyPicker';
import LocationPicker from '@/components/location/LocationPicker';
import SubmitButton from '@/components/ui/button/SubmitButton';
import DatePickerInput from '@/components/ui/DatePickerInput';
import FadeWrapper from '@/components/ui/FadeWrapper';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { inputStyle } from '@/components/ui/Input';
import { formatGeocode } from '@/utils/location/location';
import { MapPin } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { Input } from '../../../components/ui';
import { useExpenses, useTrips } from '../../../contexts';

export default function ExpenseFormScreen() {
  const { expenseId, tripId, footprintId } = useLocalSearchParams<{
    expenseId?: string;
    tripId?: string;
    footprintId?: string;
  }>();
  const router = useRouter();
  const { activeTrip } = useTrips();
  const { expenses, categories, addExpense, updateExpense } = useExpenses();

  const isEdit = !!expenseId;
  const expense = isEdit ? expenses.find((e) => e.id === expenseId) : undefined;
  const effectiveTripId = tripId || activeTrip || '';

  const [amount, setAmount] = useState(expense?.amount?.toString() ?? '');
  const [currency, setCurrency] = useState(expense?.currency ?? 'KRW');
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? categories[0]?.id ?? '');
  const [date, setDate] = useState(expense?.date ?? new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(expense?.description ?? '');
  const [location, setLocation] = useState(expense?.location ?? '');
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  if (isEdit && !expense) {
    return (
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
        <Text color="$mutedForeground">경비를 찾을 수 없습니다.</Text>
      </YStack>
    );
  }

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
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('오류', '금액을 입력해주세요.');
      return;
    }
    if (!categoryId) {
      Alert.alert('오류', '카테고리를 선택해주세요.');
      return;
    }

    if (isEdit && expense) {
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
    } else {
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
        router.push(`/(main)/footprint/${footprintId}`);
      } else {
        router.push(`/(main)/expense?created=${created.id}`);
      }
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <BackActionHeader label={isEdit ? '경비 수정' : '경비 추가'} onBack={() => router.back()}>
        <SubmitButton onPress={handleSubmit} />
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
                발자국 날짜로 자동 설정됨
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
