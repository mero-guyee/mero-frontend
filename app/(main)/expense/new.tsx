import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Alert, Pressable, Platform } from 'react-native';
import { YStack, XStack, Text, Button, Input } from 'tamagui';
import { ArrowLeft } from '@tamagui/lucide-icons';
import { useTrips, useExpenses } from '../../../contexts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

const CATEGORIES = [
  { value: 'food', label: '식비', icon: '🍽️' },
  { value: 'accommodation', label: '숙박', icon: '🏨' },
  { value: 'transport', label: '교통', icon: '🚌' },
  { value: 'activity', label: '관광', icon: '🎭' },
  { value: 'shopping', label: '쇼핑', icon: '🛍️' },
  { value: 'cafe', label: '카페', icon: '☕' },
  { value: 'bar', label: '술집', icon: '🍺' },
  { value: 'other', label: '기타', icon: '📦' },
];

const CURRENCIES = ['USD', 'EUR', 'JPY', 'KRW', 'GBP', 'CNY', 'THB', 'VND', 'PEN', 'BRL'];

export default function ExpenseFormScreen() {
  const { tripId, diaryId } = useLocalSearchParams<{ tripId?: string; diaryId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeTrip } = useTrips();
  const { addExpense } = useExpenses();

  const effectiveTripId = tripId || activeTrip || '';

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('오류', '금액을 입력해주세요.');
      return;
    }

    addExpense({
      tripId: effectiveTripId,
      diaryId,
      date,
      category,
      amount: parseFloat(amount),
      currency,
      memo: memo.trim(),
    });

    router.back();
  };

  const formatDate = (d: Date) => {
    return d.toISOString().split('T')[0];
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(formatDate(selectedDate));
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
        <Button
          size="$4"
          circular
          backgroundColor="transparent"
          pressStyle={{ backgroundColor: '$accent' }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="$foreground" />
        </Button>
        <Text color="$foreground" fontSize={16} fontWeight="500">
          경비 추가
        </Text>
        <Button
          backgroundColor="$accent"
          pressStyle={{ backgroundColor: '$accentHover' }}
          borderRadius="$4"
          paddingHorizontal="$4"
          paddingVertical="$2"
          onPress={handleSubmit}
        >
          <Text color="$foreground" fontWeight="500">
            저장
          </Text>
        </Button>
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
          {diaryId && (
            <Text color="$mutedForeground" marginTop="$1" fontSize={14}>
              일기 날짜로 자동 설정됨
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
              placeholder="0.00"
              placeholderTextColor="$mutedForeground"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              color="$foreground"
            />
          </YStack>
          <YStack width={100}>
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

        {/* Memo */}
        <YStack marginBottom="$6">
          <Text color="$foreground" marginBottom="$2" fontWeight="500">
            메모
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
            value={memo}
            onChangeText={setMemo}
            color="$foreground"
          />
        </YStack>

        {/* Category */}
        <YStack marginBottom="$6">
          <Text color="$foreground" marginBottom="$3" fontWeight="500">
            카테고리
          </Text>
          <XStack flexWrap="wrap" gap="$3">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.value}
                onPress={() => setCategory(cat.value)}
                style={{ width: '22%' }}
              >
                <YStack
                  padding="$3"
                  borderRadius="$4"
                  borderWidth={2}
                  borderColor={category === cat.value ? '$primary' : '$border'}
                  backgroundColor={category === cat.value ? '$accent' : '$muted'}
                  alignItems="center"
                  gap="$1"
                  opacity={category === cat.value ? 0.4 : 1}
                >
                  <Text fontSize={24}>{cat.icon}</Text>
                  <Text color="$foreground" fontSize={12}>
                    {cat.label}
                  </Text>
                </YStack>
              </Pressable>
            ))}
          </XStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
