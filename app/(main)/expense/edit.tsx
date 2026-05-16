import CurrencyPicker from '@/components/expense/CurrencyPicker';
import SubmitButton from '@/components/ui/button/SubmitButton';
import FadeWrapper from '@/components/ui/FadeWrapper';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { Input } from '../../../components/ui';
import { inputStyle } from '../../../components/ui/Input';
import { useExpenses } from '../../../contexts';

export default function ExpenseEditScreen() {
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const router = useRouter();
  const { expenses, categories, updateExpense } = useExpenses();

  const expense = expenses.find((e) => e.id === expenseId);

  const [amount, setAmount] = useState(expense?.amount?.toString() ?? '');
  const [currency, setCurrency] = useState(expense?.currency ?? 'KRW');
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? categories[0]?.id ?? '');
  const [date, setDate] = useState(expense?.date ?? new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(expense?.description ?? '');
  const [location, setLocation] = useState(expense?.location ?? '');
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!expense) {
    return (
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
        <Text color="$mutedForeground">경비를 찾을 수 없습니다.</Text>
      </YStack>
    );
  }

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('오류', '금액을 입력해주세요.');
      return;
    }
    if (!categoryId) {
      Alert.alert('오류', '카테고리를 선택해주세요.');
      return;
    }

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
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <BackActionHeader label="경비 수정" onBack={() => router.back()}>
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
              <XStack {...inputStyle} alignItems="center">
                <Text color="$foreground">{date}</Text>
              </XStack>
            </Pressable>
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
            <Input placeholder="예: 점심 식사" value={description} onChangeText={setDescription} />
          </YStack>

          {/* Location */}
          <YStack marginBottom="$6">
            <Text color="$foreground" marginBottom="$2" fontWeight="500">
              장소
            </Text>
            <Input placeholder="예: 마추픽추" value={location} onChangeText={setLocation} />
          </YStack>
        </ScrollView>
      </FadeWrapper>
    </YStack>
  );
}
