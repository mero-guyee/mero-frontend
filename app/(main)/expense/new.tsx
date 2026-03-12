import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { CircularButton, FilledButton, Input } from '../../../components/ui';
import { useExpenses, useTrips } from '../../../contexts';

const CURRENCIES = ['KRW', 'USD', 'EUR', 'JPY', 'GBP', 'CNY', 'THB', 'VND', 'PEN', 'BRL'];

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

    const selectedCategory = categories.find((c) => c.id === categoryId);

    addExpense({
      tripId: effectiveTripId,
      footprintId,
      date,
      categoryId,
      categoryName: selectedCategory?.name,
      categoryIcon: selectedCategory?.icon,
      categoryColor: selectedCategory?.color,
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
      <XStack
        backgroundColor="$card"
        paddingTop={insets.top}
        paddingHorizontal="$4"
        paddingBottom="$3"
        alignItems="center"
        justifyContent="space-between"
        borderBottomWidth={2}
        borderBottomColor="$primary"
        style={{ borderBottomColor: 'rgba(155, 196, 209, 0.25)' }}
      >
        <CircularButton onPress={() => router.back()}>
          <ArrowLeft size={20} color="$foreground" />
        </CircularButton>
        <Text color="$foreground" fontSize={16} fontWeight="500">
          경비 추가
        </Text>
        <FilledButton paddingHorizontal="$4" paddingVertical="$2" onPress={handleSubmit}>
          <Text color="$foreground" fontWeight="500">
            저장
          </Text>
        </FilledButton>
      </XStack>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        {/* Date */}
        <YStack marginBottom="$6">
          <Text color="$foreground" marginBottom="$2" fontWeight="500">
            날짜
          </Text>
          <Pressable onPress={() => setShowDatePicker(true)}>
            <XStack
              backgroundColor="$muted"
              borderWidth={2}
              borderColor="$border"
              borderRadius="$4"
              paddingHorizontal="$4"
              paddingVertical="$3"
              minHeight={48}
              alignItems="center"
            >
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
        <XStack gap="$3" marginBottom="$6">
          <YStack flex={1}>
            <Text color="$foreground" marginBottom="$2" fontWeight="500">
              금액
            </Text>
            <Input
              backgroundColor="$muted"
              borderWidth={2}
              borderColor="$border"
              borderRadius="$4"
              paddingHorizontal="$4"
              paddingVertical="$3"
              placeholder="0"
              placeholderTextColor="$mutedForeground"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              color="$foreground"
            />
          </YStack>
          <YStack width={120}>
            <Text color="$foreground" marginBottom="$2" fontWeight="500">
              통화
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{
                backgroundColor: '#F5EFE0',
                borderRadius: 16,
                borderWidth: 2,
                borderColor: 'rgba(155, 196, 209, 0.2)',
                height: 48,
              }}
              contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 8 }}
            >
              <XStack gap="$1">
                {CURRENCIES.map((curr) => (
                  <Pressable key={curr} onPress={() => setCurrency(curr)}>
                    <YStack
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius="$2"
                      backgroundColor={currency === curr ? '$primary' : 'transparent'}
                    >
                      <Text
                        color={currency === curr ? 'white' : '$foreground'}
                        fontSize={12}
                      >
                        {curr}
                      </Text>
                    </YStack>
                  </Pressable>
                ))}
              </XStack>
            </ScrollView>
          </YStack>
        </XStack>

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
                  borderWidth={2}
                  borderColor={categoryId === cat.id ? '$primary' : '$border'}
                  backgroundColor={categoryId === cat.id ? '$accent' : '$muted'}
                  alignItems="center"
                  gap="$1"
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
            backgroundColor="$muted"
            borderWidth={2}
            borderColor="$border"
            borderRadius="$4"
            paddingHorizontal="$4"
            paddingVertical="$3"
            placeholder="예: 점심 식사"
            placeholderTextColor="$mutedForeground"
            value={description}
            onChangeText={setDescription}
            color="$foreground"
          />
        </YStack>

        {/* Location */}
        <YStack marginBottom="$6">
          <Text color="$foreground" marginBottom="$2" fontWeight="500">
            장소
          </Text>
          <Input
            backgroundColor="$muted"
            borderWidth={2}
            borderColor="$border"
            borderRadius="$4"
            paddingHorizontal="$4"
            paddingVertical="$3"
            placeholder="예: 마추픽추"
            placeholderTextColor="$mutedForeground"
            value={location}
            onChangeText={setLocation}
            color="$foreground"
          />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
