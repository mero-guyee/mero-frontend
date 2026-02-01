import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Alert, Pressable, Platform } from 'react-native';
import { YStack, XStack, Text, Button, Input, Image } from 'tamagui';
import { ArrowLeft, X, Image as ImageIcon } from '@tamagui/lucide-icons';
import { useTrips } from '../../../../contexts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getTripById, updateTrip } = useTrips();

  const trip = getTripById(id || '');

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [newCountry, setNewCountry] = useState('');
  const [status, setStatus] = useState<'ongoing' | 'completed'>('ongoing');

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    if (trip) {
      setTitle(trip.title);
      setStartDate(trip.startDate);
      setEndDate(trip.endDate);
      setCoverImage(trip.coverImage);
      setCountries(trip.countries);
      setStatus(trip.status);
    }
  }, [trip]);

  if (!trip) {
    return (
      <YStack flex={1} backgroundColor="$background" justifyContent="center" alignItems="center">
        <Text color="$foreground">여행을 찾을 수 없습니다</Text>
      </YStack>
    );
  }

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('권한 필요', '이미지를 선택하려면 갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !startDate || !endDate) {
      Alert.alert('오류', '제목, 시작일, 종료일을 입력해주세요.');
      return;
    }

    updateTrip({
      id: trip.id,
      title: title.trim(),
      startDate,
      endDate,
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
      countries,
      status,
    });

    router.back();
  };

  const handleAddCountry = () => {
    if (newCountry.trim() && !countries.includes(newCountry.trim())) {
      setCountries([...countries, newCountry.trim()]);
      setNewCountry('');
    }
  };

  const handleRemoveCountry = (country: string) => {
    setCountries(countries.filter((c) => c !== country));
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(formatDate(selectedDate));
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(formatDate(selectedDate));
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
          모험 수정
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
        {/* Title */}
        <YStack marginBottom="$6">
          <Text color="$foreground" marginBottom="$2" fontWeight="500">
            모험의 이름
          </Text>
          <Input
            backgroundColor="$muted"
            borderWidth={2}
            borderColor="$border"
            borderRadius="$4"
            paddingHorizontal="$4"
            paddingVertical="$3"
            placeholder="예: 2026 남미 여행"
            placeholderTextColor="$mutedForeground"
            value={title}
            onChangeText={setTitle}
            color="$foreground"
          />
        </YStack>

        {/* Dates */}
        <XStack gap="$4" marginBottom="$6">
          <YStack flex={1}>
            <Text color="$foreground" marginBottom="$2" fontWeight="500">
              출발일
            </Text>
            <Pressable onPress={() => setShowStartPicker(true)}>
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
                <Text color={startDate ? '$foreground' : '$mutedForeground'}>
                  {startDate || 'YYYY-MM-DD'}
                </Text>
              </XStack>
            </Pressable>
          </YStack>
          <YStack flex={1}>
            <Text color="$foreground" marginBottom="$2" fontWeight="500">
              귀환일
            </Text>
            <Pressable onPress={() => setShowEndPicker(true)}>
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
                <Text color={endDate ? '$foreground' : '$mutedForeground'}>
                  {endDate || 'YYYY-MM-DD'}
                </Text>
              </XStack>
            </Pressable>
          </YStack>
        </XStack>

        {showStartPicker && (
          <DateTimePicker
            value={startDate ? new Date(startDate) : new Date()}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate ? new Date(endDate) : new Date()}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}

        {/* Countries */}
        <YStack marginBottom="$6">
          <Text color="$foreground" marginBottom="$2" fontWeight="500">
            거쳐갈 땅
          </Text>
          {countries.length > 0 && (
            <XStack flexWrap="wrap" gap="$2" marginBottom="$3">
              {countries.map((country) => (
                <XStack
                  key={country}
                  alignItems="center"
                  gap="$1"
                  paddingHorizontal="$3"
                  paddingVertical="$1.5"
                  backgroundColor="$accent"
                  borderRadius={20}
                >
                  <Text color="$foreground">{country}</Text>
                  <Pressable onPress={() => handleRemoveCountry(country)}>
                    <X size={12} color="$foreground" />
                  </Pressable>
                </XStack>
              ))}
            </XStack>
          )}
          <XStack gap="$2">
            <Input
              flex={1}
              backgroundColor="$muted"
              borderWidth={2}
              borderColor="$border"
              borderRadius="$4"
              paddingHorizontal="$4"
              paddingVertical="$3"
              placeholder="국가명을 입력하세요"
              placeholderTextColor="$mutedForeground"
              value={newCountry}
              onChangeText={setNewCountry}
              color="$foreground"
              onSubmitEditing={handleAddCountry}
            />
            <Button
              backgroundColor="$accent"
              pressStyle={{ backgroundColor: '$accentHover' }}
              borderRadius="$4"
              paddingHorizontal="$4"
              paddingVertical="$3"
              onPress={handleAddCountry}
            >
              <Text color="$foreground" fontWeight="500">
                추가
              </Text>
            </Button>
          </XStack>
        </YStack>

        {/* Status */}
        <YStack marginBottom="$6">
          <Text color="$foreground" marginBottom="$2" fontWeight="500">
            상태
          </Text>
          <XStack gap="$2">
            <Pressable style={{ flex: 1 }} onPress={() => setStatus('ongoing')}>
              <XStack
                flex={1}
                backgroundColor={status === 'ongoing' ? '$accent' : '$muted'}
                borderWidth={2}
                borderColor={status === 'ongoing' ? '$primary' : '$border'}
                borderRadius="$4"
                paddingVertical="$3"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="$foreground" fontWeight={status === 'ongoing' ? '600' : '400'}>
                  진행중
                </Text>
              </XStack>
            </Pressable>
            <Pressable style={{ flex: 1 }} onPress={() => setStatus('completed')}>
              <XStack
                flex={1}
                backgroundColor={status === 'completed' ? '$accent' : '$muted'}
                borderWidth={2}
                borderColor={status === 'completed' ? '$primary' : '$border'}
                borderRadius="$4"
                paddingVertical="$3"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="$foreground" fontWeight={status === 'completed' ? '600' : '400'}>
                  완료
                </Text>
              </XStack>
            </Pressable>
          </XStack>
        </YStack>

        {/* Cover Image */}
        <YStack marginBottom="$6">
          <Text color="$foreground" marginBottom="$2" fontWeight="500">
            📸 대표 풍경
          </Text>
          <Pressable onPress={handleImagePick}>
            <YStack
              backgroundColor="$muted"
              borderWidth={2}
              borderColor="$border"
              borderRadius="$4"
              overflow="hidden"
              minHeight={coverImage ? undefined : 192}
            >
              {coverImage ? (
                <YStack position="relative" aspectRatio={16 / 9}>
                  <Image
                    source={{ uri: coverImage }}
                    width="100%"
                    height="100%"
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      setCoverImage('');
                    }}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: '#E89B8F',
                      borderRadius: 12,
                      padding: 8,
                    }}
                  >
                    <X size={16} color="white" />
                  </Pressable>
                </YStack>
              ) : (
                <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" minHeight={192}>
                  <YStack
                    width={64}
                    height={64}
                    backgroundColor="$accent"
                    borderRadius={32}
                    alignItems="center"
                    justifyContent="center"
                    marginBottom="$3"
                    opacity={0.4}
                  >
                    <ImageIcon size={32} color="$primary" />
                  </YStack>
                  <Text color="$foreground" marginBottom="$1">
                    이미지를 탭하여 업로드
                  </Text>
                  <Text color="$mutedForeground" fontSize={14}>
                    PNG, JPG, WEBP 파일 지원
                  </Text>
                </YStack>
              )}
            </YStack>
          </Pressable>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
