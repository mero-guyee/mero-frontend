import LocationPicker from '@/components/location/LocationPicker';
import SubmitButton from '@/components/ui/button/SubmitButton';
import FadeWrapper from '@/components/ui/FadeWrapper';
import FormLabel from '@/components/ui/form/FormLabel';
import PageNavigator from '@/components/ui/form/PageNavigator';
import BackActionHeader from '@/components/ui/header/BackActionHeader';
import { inputStyle } from '@/components/ui/Input';
import { formatGeocode } from '@/utils/location/location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Camera, MapPin, X } from '@tamagui/lucide-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { Image, Text, TextArea, XStack, YStack } from 'tamagui';
import { Input } from '../../../components/ui';
import { useFootprints, useTrips } from '../../../contexts';
import { FootprintLocation } from '../../../types';

export default function FootprintFormScreen() {
  const { footprintId } = useLocalSearchParams<{ footprintId?: string }>();
  const router = useRouter();
  const { height } = useWindowDimensions();
  const { trips, activeTrip } = useTrips();
  const { footprints, addFootprint, updateFootprint } = useFootprints();

  const existingFootprint = footprintId ? footprints.find((f) => f.id === footprintId) : undefined;

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [tripId, setTripId] = useState(activeTrip || trips[0]?.id || '');
  const [weatherInfo, setWeatherInfo] = useState('');
  const [locations, setLocations] = useState<FootprintLocation[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageHeight, setPageHeight] = useState(height);
  const outerScrollRef = useRef<ScrollView>(null);

  const handleNavigatePage = () => {
    const nextPage = currentPage === 0 ? 1 : 0;
    outerScrollRef.current?.scrollTo({ y: nextPage * pageHeight, animated: true });
  };

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
        latitude,
        longitude,
      };
      setLocations([...locations, newLocation]);
    });
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <BackActionHeader
        label={existingFootprint ? '유랑 수정' : '새 유랑'}
        onBack={() => router.back()}
      >
        <SubmitButton onPress={handleSubmit} />
      </BackActionHeader>

      <FadeWrapper>
        <YStack flex={1}>
          {/* 섹션 간 스냅 스크롤 */}
          <ScrollView
            ref={outerScrollRef}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onLayout={(e) => setPageHeight(e.nativeEvent.layout.height)}
            onScroll={(e) => {
              if (pageHeight > 0) {
                setCurrentPage(Math.round(e.nativeEvent.contentOffset.y / pageHeight));
              }
            }}
            style={{ flex: 1 }}
          >
            {/* Section 1: 기록 정보 */}
            <ScrollView
              style={{ height: pageHeight }}
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              <YStack marginBottom="$5">
                <FormLabel marginBottom="$2">머문 날</FormLabel>
                <Pressable onPress={() => setShowDatePicker(true)}>
                  <XStack {...inputStyle} paddingVertical="$3" minHeight={44} alignItems="center">
                    <Text color={date ? '$foreground' : '$mutedForeground'} fontSize={15}>
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

              <YStack marginBottom="$5">
                <FormLabel marginBottom="$2">머문 곳</FormLabel>
                <Pressable onPress={() => setShowLocationPicker(true)}>
                  <XStack
                    {...inputStyle}
                    paddingVertical="$3"
                    minHeight={44}
                    alignItems="center"
                    gap="$2"
                  >
                    <MapPin size={15} color="$mutedForeground" />
                    <Text color="$mutedForeground" fontSize={15}>
                      장소 검색
                    </Text>
                  </XStack>
                </Pressable>
                <LocationPicker
                  visible={showLocationPicker}
                  onClose={() => setShowLocationPicker(false)}
                  onConfirm={handleConfirm}
                />
                {locations.length > 0 && (
                  <XStack flexWrap="wrap" gap="$2" marginTop="$3">
                    {locations.map((loc, index) => (
                      <XStack
                        key={index}
                        alignItems="center"
                        gap="$2"
                        paddingHorizontal="$3"
                        paddingVertical="$2"
                        backgroundColor="$accent"
                        borderRadius="$3"
                      >
                        <MapPin size={12} color="$mutedForeground" />
                        <Text color="$foreground" fontSize={13}>
                          {loc.placeName}
                          {loc.country ? `, ${loc.country}` : ''}
                        </Text>
                        <Pressable onPress={() => handleRemoveLocation(index)}>
                          <X size={12} color="$mutedForeground" />
                        </Pressable>
                      </XStack>
                    ))}
                  </XStack>
                )}
              </YStack>

              <YStack marginBottom="$5">
                <FormLabel marginBottom="$2">날씨</FormLabel>
                <Input
                  placeholder="예: 맑음 18°C"
                  placeholderTextColor="$mutedForeground"
                  value={weatherInfo}
                  onChangeText={setWeatherInfo}
                />
              </YStack>
            </ScrollView>

            {/* Section 2: 이야기 */}
            <ScrollView
              style={{ height: pageHeight }}
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              <YStack flex={1} justifyContent="flex-start" gap="$3">
                <TextArea
                  placeholder="제목을 입력해주세요"
                  placeholderTextColor="$mutedForeground"
                  value={title}
                  onChangeText={setTitle}
                  color="$foreground"
                  borderWidth={0}
                  padding={0}
                />
                <YStack borderBottomWidth={1} borderColor="$secondary" />
                <TextArea
                  placeholder="어떤 여행이었나요? 자유롭게 작성해주세요"
                  placeholderTextColor="$mutedForeground"
                  value={content}
                  onChangeText={setContent}
                  color="$foreground"
                  minHeight={200}
                  padding={0}
                  verticalAlign={'top'}
                  borderWidth={0}
                />
              </YStack>
              <YStack>
                <XStack alignItems="center" justifyContent="space-between" marginBottom="$3">
                  <FormLabel>사진</FormLabel>
                  <Pressable onPress={handleAddPhoto}>
                    <XStack alignItems="center" gap="$1">
                      <Camera size={15} color="$primary" />
                      <Text color="$primary" fontSize={13}>
                        추가
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
          </ScrollView>

          {/* 페이지 네비게이션 */}
          <PageNavigator currentPage={currentPage} onPress={handleNavigatePage} />
        </YStack>
      </FadeWrapper>
    </YStack>
  );
}
