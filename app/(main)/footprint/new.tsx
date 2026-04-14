import LocationPicker from '@/components/location/LocationPicker';
import SubmitButton from '@/components/ui/button/SubmitButton';
import FadeWrapper from '@/components/ui/FadeWrapper';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { formatGeocode } from '@/utils/location/location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Camera, MapPin, X } from '@tamagui/lucide-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, Text, TextArea, XStack, YStack } from 'tamagui';
import { CircularButton, Input } from '../../../components/ui';
import { useFootprints, useTrips } from '../../../contexts';
import { FootprintLocation } from '../../../types';

const MOCK_LOCATIONS = [
  '마추픽추, 페루',
  '쿠스코, 페루',
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

export default function FootprintFormScreen() {
  const { footprintId } = useLocalSearchParams<{ footprintId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { trips, activeTrip } = useTrips();
  const { footprints, addFootprint, updateFootprint } = useFootprints();

  const existingFootprint = footprintId ? footprints.find((f) => f.id === footprintId) : undefined;

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [tripId, setTripId] = useState(activeTrip || trips[0]?.id || '');
  const [weatherInfo, setWeatherInfo] = useState('');
  const [locations, setLocations] = useState<FootprintLocation[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  useEffect(() => {
    if (existingFootprint) {
      setTitle(existingFootprint.title);
      setDate(existingFootprint.date);
      setContent(existingFootprint.content);
      setTripId(existingFootprint.tripId);
      setWeatherInfo(existingFootprint.weatherInfo || '');
      setLocations(existingFootprint.locations);
      setPhotoUrls(existingFootprint.photoUrls ?? []);
    }
  }, [existingFootprint]);

  const handleAddPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUrls((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim() || !tripId) {
      Alert.alert('오류', '제목과 여행을 선택해주세요.');
      return;
    }

    const footprintData = {
      tripId,
      title: title.trim(),
      date,
      content: content.trim(),
      locations,
      photoUrls,
      weatherInfo: weatherInfo.trim() || undefined,
    };

    if (existingFootprint) {
      updateFootprint({ ...existingFootprint, ...footprintData });
    } else {
      addFootprint(footprintData);
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleRemoveLocation = (index: number) => {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    formatGeocode(latitude, longitude).then(({ placeName, city, country }) => {
      const newLocation: FootprintLocation = {
        placeName,
        country,
        city,
        latitude: latitude,
        longitude: longitude,
      };

      setLocations([...locations, newLocation]);
    });
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <BackActionHeader
        label={existingFootprint ? '유랑 수정' : '새 유랑'}
        onBack={() => router.back()}
      >
        <SubmitButton onPress={handleSubmit} />
      </BackActionHeader>

      {/* 성능 문제시 리팩토링 필요 */}
      <FadeWrapper>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 24 }}
        >
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
                <Text color={date ? '$foreground' : '$mutedForeground'}>
                  {date || 'YYYY-MM-DD'}
                </Text>
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
            </XStack>
            <LocationPicker onConfirm={handleConfirm} />

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
                      {loc.placeName}
                      {loc.country ? `, ${loc.country}` : ''}
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

          {/* Weather */}
          <YStack marginBottom="$6">
            <Text color="$foreground" marginBottom="$2" fontWeight="500">
              🌤 날씨
            </Text>
            <Input
              backgroundColor="$muted"
              borderWidth={2}
              borderColor="$border"
              borderRadius="$4"
              paddingHorizontal="$4"
              paddingVertical="$3"
              placeholder="예: 맑음 18°C"
              placeholderTextColor="$mutedForeground"
              value={weatherInfo}
              onChangeText={setWeatherInfo}
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

          {/* Photos */}
          <YStack marginBottom="$6">
            <XStack alignItems="center" justifyContent="space-between" marginBottom="$2">
              <Text color="$foreground" fontWeight="500">
                📸 사진
              </Text>
              <Pressable onPress={handleAddPhoto}>
                <XStack alignItems="center" gap="$1">
                  <Camera size={16} color="$primary" />
                  <Text color="$primary" fontSize={14}>
                    사진 추가
                  </Text>
                </XStack>
              </Pressable>
            </XStack>

            {photoUrls.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$2">
                  {photoUrls.map((uri, index) => (
                    <YStack key={index} position="relative">
                      <Image
                        source={{ uri }}
                        width={100}
                        height={100}
                        borderRadius={8}
                        objectFit="cover"
                      />
                      <Pressable
                        onPress={() => handleRemovePhoto(index)}
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          borderRadius: 10,
                          padding: 3,
                        }}
                      >
                        <X size={12} color="white" />
                      </Pressable>
                    </YStack>
                  ))}
                </XStack>
              </ScrollView>
            )}
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
                <XStack alignItems="center" justifyContent="space-between" marginBottom="$5">
                  <Text color="$foreground" fontSize={18} fontWeight="600">
                    위치 추가
                  </Text>
                  <CircularButton
                    size="$3"
                    onPress={() => {
                      setShowLocationModal(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                  >
                    <X size={20} color="$foreground" />
                  </CircularButton>
                </XStack>

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

                <ScrollView style={{ maxHeight: 256 }}>
                  {searchQuery && searchResults.length === 0 && (
                    <Text
                      textAlign="center"
                      color="$mutedForeground"
                      paddingVertical="$4"
                      fontSize={14}
                    >
                      검색 결과가 없습니다
                    </Text>
                  )}
                </ScrollView>
              </YStack>
            </Pressable>
          </Pressable>
        </Modal>
      </FadeWrapper>
    </YStack>
  );
}
