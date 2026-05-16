import CurrencyPicker from '@/components/expense/CurrencyPicker';
import SubmitButton from '@/components/ui/button/SubmitButton';
import FadeWrapper from '@/components/ui/FadeWrapper';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { inputStyle } from '@/components/ui/Input';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { Input } from '../../../components/ui';
import { useExpenses, useTrips } from '../../../contexts';

export default function ExpenseFormScreen() {
  const { tripId, footprintId } = useLocalSearchParams<{ tripId?: string; footprintId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeTrip } = useTrips();
  const { categories, addExpense } = useExpenses();

  const effectiveTripId = tripId || activeTrip || '';

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('KRW');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('오류', '금액을 입력해주세요.');
      return;
    }
    if (!categoryId) {
      Alert.alert('오류', '카테고리를 선택해주세요.');
      return;
    }

    addExpense({
      tripId: effectiveTripId,
      footprintId,
      date,
      categoryId,
      amount: parseFloat(amount),
      currency,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
    });

    router.back();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <BackActionHeader label="경비 추가" onBack={() => router.back()}>
        <SubmitButton onPress={handleSubmit} />
      </BackActionHeader>

      <FadeWrapper>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
          {/* Date */}
          <YStack marginBottom="$6">
            <Text color="$foreground" marginBottom="$2" fontWeight="500">
              날짜
            </Text>
            <Pressable onPress={() => setShowDatePicker(true)}>
              <XStack {...inputStyle} minHeight={48} alignItems="center">
                <Text color="$foreground">{date}</Text>
              </XStack>
            </Pressable>
            {footprintId && (
              <Text color="$mutedForeground" marginTop="$1" fontSize={14}>
                발자국 날짜로 자동 설정됨
              </Text>
            )}
          </YStack>

          {showDatePicker && (
            <DateTimePicker
              value={date ? new Date(date) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* Amount and Currency */}
          <YStack marginBottom="$6">
            <Text color="$foreground" marginBottom="$2" fontWeight="500">
              금액
            </Text>
            <XStack {...inputStyle} alignItems="center" paddingHorizontal="$0">
              <Input
                flex={1}
                placeholder="0"
                placeholderTextColor="$mutedForeground"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                color="$foreground"
                borderWidth={0}
                height={44}
                focusStyle={{ borderWidth: 0 }}
              />
              <CurrencyPicker value={currency} onChange={setCurrency} />
            </XStack>
          </YStack>

          {/* Category */}
          <YStack marginBottom="$6">
            <Text color="$foreground" marginBottom="$3" fontWeight="500">
              카테고리
            </Text>
            <XStack flexWrap="wrap" gap="$3">
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategoryId(cat.id)}
                  style={{ width: '22%' }}
                >
                  <YStack
                    padding="$3"
                    borderRadius="$4"
                    backgroundColor={categoryId === cat.id ? '$accent' : '$muted'}
                    alignItems="center"
                    gap="$1"
                    boxShadow="0 1px 4px rgba(0,0,0,0.08)"
                    opacity={categoryId === cat.id ? 0.8 : 1}
                  >
                    <Text fontSize={20}>{cat.icon}</Text>
                    <Text color="$foreground" fontSize={12} textAlign="center" numberOfLines={1}>
                      {cat.name}
                    </Text>
                  </YStack>
                </Pressable>
              ))}
            </XStack>
          </YStack>

          {/* Description */}
          <YStack marginBottom="$6">
            <Text color="$foreground" marginBottom="$2" fontWeight="500">
              설명
            </Text>
            <Input
              placeholder="예: 점심 식사"
              placeholderTextColor="$mutedForeground"
              value={description}
              onChangeText={setDescription}
            />
          </YStack>

          {/* Location */}
          <YStack marginBottom="$6">
            <Text color="$foreground" marginBottom="$2" fontWeight="500">
              장소
            </Text>
            <Input
              placeholder="예: 마추픽추"
              placeholderTextColor="$mutedForeground"
              value={location}
              onChangeText={setLocation}
            />
          </YStack>
        </ScrollView>
      </FadeWrapper>
    </YStack>
  );
}
