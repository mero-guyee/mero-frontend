import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Alert, Pressable, Modal, Platform } from 'react-native';
import { YStack, XStack, Text, Button, Input, TextArea } from 'tamagui';
import { ArrowLeft, X, Plus, MapPin, Navigation } from '@tamagui/lucide-icons';
import { useTrips, useDiaries } from '../../../contexts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

// Mock location data for autocomplete
const MOCK_LOCATIONS = [
  '마추픽추, 페루',
  '마추픽추 역사 보호구역',
  '쿠스코, 페루',
  '쿠스코 역사 지구',
  '발파라이소, 칠레',
  '산티아고, 칠레',
  '우유니 소금사막, 볼리비아',
  '이과수 폭포, 브라질',
  '리우데자네이루, 브라질',
  '부에노스아이레스, 아르헨티나',
  '파타고니아, 아르헨티나',
  '갈라파고스 제도, 에콰도르',
  '카르타헤나, 콜롬비아',
];

export default function DiaryFormScreen() {
  const { diaryId } = useLocalSearchParams<{ diaryId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { trips, activeTrip } = useTrips();
  const { diaries, addDiary, updateDiary } = useDiaries();

  const existingDiary = diaryId ? diaries.find((d) => d.id === diaryId) : undefined;

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [content, setContent] = useState('');
  const [tripId, setTripId] = useState(activeTrip || trips[0]?.id || '');
  const [weather, setWeather] = useState('');
  const [temperature, setTemperature] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  // Location states
  const [locations, setLocations] = useState<string[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (existingDiary) {
      setTitle(existingDiary.title);
      setDate(existingDiary.date);
      setTime(existingDiary.time);
      setLocation(existingDiary.location);
      setCountry(existingDiary.country);
      setContent(existingDiary.content);
      setTripId(existingDiary.tripId);
      setWeather(existingDiary.weather || '');
      setTemperature(existingDiary.temperature?.toString() || '');
      setPhotoUrls(existingDiary.photos);
      if (existingDiary.location) {
        setLocations([existingDiary.location]);
      }
    }
  }, [existingDiary]);

  const handleSubmit = () => {
    if (!title.trim() || !tripId) {
      Alert.alert('오류', '제목과 여행을 선택해주세요.');
      return;
    }

    const diaryData = {
      tripId,
      title: title.trim(),
      date,
      time,
      location: location.trim(),
      country: country.trim(),
      content: content.trim(),
      photos: photoUrls,
      weather: weather.trim() || undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
      tags: [],
    };

    if (existingDiary) {
      updateDiary({
        ...existingDiary,
        ...diaryData,
      });
    } else {
      addDiary(diaryData);
    }

    router.back();
  };

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const results = MOCK_LOCATIONS.filter((loc) =>
        loc.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectLocation = (loc: string) => {
    if (!locations.includes(loc)) {
      const newLocations = [...locations, loc];
      setLocations(newLocations);
      setLocation(newLocations.join(', '));
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowLocationModal(false);
  };

  const handleRemoveLocation = (index: number) => {
    const newLocations = locations.filter((_, i) => i !== index);
    setLocations(newLocations);
    setLocation(newLocations.join(', '));
  };

  const handleUseCurrentLocation = () => {
    const currentLoc = '현재 위치 (GPS)';
    if (!locations.includes(currentLoc)) {
      const newLocations = [...locations, currentLoc];
      setLocations(newLocations);
      setLocation(newLocations.join(', '));
    }
    setShowLocationModal(false);
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
          {existingDiary ? '유랑 수정' : '새 유랑'}
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
            📅 머문 날
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
              <Text color={date ? '$foreground' : '$mutedForeground'}>{date || 'YYYY-MM-DD'}</Text>
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

        {/* Location */}
        <YStack marginBottom="$6">
          <XStack alignItems="center" justifyContent="space-between" marginBottom="$2">
            <Text color="$foreground" fontWeight="500">
              📍 머문 곳
            </Text>
            <Button
              size="$3"
              backgroundColor="$accent"
              pressStyle={{ backgroundColor: '$accentHover' }}
              borderRadius="$3"
              onPress={() => setShowLocationModal(true)}
            >
              <XStack alignItems="center" gap="$1.5">
                <Plus size={16} color="$foreground" />
                <Text color="$foreground" fontSize={14}>
                  위치 추가
                </Text>
              </XStack>
            </Button>
          </XStack>

          {locations.length > 0 && (
            <XStack flexWrap="wrap" gap="$2" marginBottom="$3">
              {locations.map((loc, index) => (
                <XStack
                  key={index}
                  alignItems="center"
                  gap="$2"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  backgroundColor="$accent"
                  borderRadius="$3"
                  opacity={0.4}
                >
                  <MapPin size={14} color="$foreground" />
                  <Text color="$foreground" fontSize={14}>
                    {loc}
                  </Text>
                  <Pressable onPress={() => handleRemoveLocation(index)}>
                    <X size={14} color="$foreground" />
                  </Pressable>
                </XStack>
              ))}
            </XStack>
          )}
        </YStack>

        {/* Title */}
        <YStack marginBottom="$6">
          <Text color="$foreground" marginBottom="$2" fontWeight="500">
            이야기 제목
          </Text>
          <Input
            backgroundColor="$muted"
            borderWidth={2}
            borderColor="$border"
            borderRadius="$4"
            paddingHorizontal="$4"
            paddingVertical="$3"
            placeholder="제목을 입력하세요"
            placeholderTextColor="$mutedForeground"
            value={title}
            onChangeText={setTitle}
            color="$foreground"
          />
        </YStack>

        {/* Content */}
        <YStack marginBottom="$6">
          <Text color="$foreground" marginBottom="$2" fontWeight="500">
            이야기
          </Text>
          <TextArea
            backgroundColor="$muted"
            borderWidth={2}
            borderColor="$border"
            borderRadius="$4"
            paddingHorizontal="$4"
            paddingVertical="$3"
            placeholder="이야기를 작성하세요..."
            placeholderTextColor="$mutedForeground"
            value={content}
            onChangeText={setContent}
            color="$foreground"
            minHeight={200}
            textAlignVertical="top"
          />
        </YStack>
      </ScrollView>

      {/* Location Modal */}
      <Modal visible={showLocationModal} transparent animationType="fade">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}
          onPress={() => setShowLocationModal(false)}
        >
          <Pressable
            style={{ width: '100%', maxWidth: 400 }}
            onPress={(e) => e.stopPropagation()}
          >
            <YStack backgroundColor="$card" borderRadius="$6" padding="$6">
              {/* Modal Header */}
              <XStack alignItems="center" justifyContent="space-between" marginBottom="$5">
                <Text color="$foreground" fontSize={18} fontWeight="600">
                  위치 추가
                </Text>
                <Button
                  size="$3"
                  circular
                  backgroundColor="transparent"
                  pressStyle={{ backgroundColor: '$accent' }}
                  onPress={() => {
                    setShowLocationModal(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  <X size={20} color="$foreground" />
                </Button>
              </XStack>

              {/* Current Location Button */}
              <Pressable onPress={handleUseCurrentLocation}>
                <XStack
                  backgroundColor="$accent"
                  borderRadius="$4"
                  padding="$4"
                  alignItems="center"
                  gap="$3"
                  marginBottom="$4"
                  opacity={0.3}
                >
                  <YStack
                    width={40}
                    height={40}
                    backgroundColor="$primary"
                    borderRadius="$3"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Navigation size={20} color="white" />
                  </YStack>
                  <YStack>
                    <Text color="$foreground">현재 위치 사용</Text>
                    <Text color="$mutedForeground" fontSize={12}>
                      GPS로 현재 위치 가져오기
                    </Text>
                  </YStack>
                </XStack>
              </Pressable>

              {/* Search Input */}
              <YStack marginBottom="$3">
                <Text color="$foreground" fontSize={14} marginBottom="$2">
                  장소 검색
                </Text>
                <Input
                  backgroundColor="$muted"
                  borderWidth={2}
                  borderColor="$border"
                  borderRadius="$4"
                  paddingHorizontal="$4"
                  paddingVertical="$3"
                  placeholder="장소명을 입력하세요"
                  placeholderTextColor="$mutedForeground"
                  value={searchQuery}
                  onChangeText={handleSearchQueryChange}
                  color="$foreground"
                />
              </YStack>

              {/* Search Results */}
              <ScrollView style={{ maxHeight: 256 }}>
                {searchQuery && searchResults.length === 0 && (
                  <Text textAlign="center" color="$mutedForeground" paddingVertical="$4" fontSize={14}>
                    검색 결과가 없습니다
                  </Text>
                )}
                {searchResults.map((result, index) => (
                  <Pressable key={index} onPress={() => handleSelectLocation(result)}>
                    <XStack
                      backgroundColor="$muted"
                      borderRadius="$4"
                      padding="$3"
                      alignItems="center"
                      gap="$3"
                      marginBottom="$2"
                      borderWidth={2}
                      borderColor="$border"
                    >
                      <MapPin size={16} color="$primary" />
                      <Text color="$foreground" fontSize={14}>
                        {result}
                      </Text>
                    </XStack>
                  </Pressable>
                ))}
                {!searchQuery && (
                  <Text textAlign="center" color="$mutedForeground" paddingVertical="$4" fontSize={14}>
                    장소를 검색해보세요
                  </Text>
                )}
              </ScrollView>
            </YStack>
          </Pressable>
        </Pressable>
      </Modal>
    </YStack>
  );
}
