import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Pressable, Modal } from 'react-native';
import { YStack, XStack, Text, Button, Image } from 'tamagui';
import { X, Calendar, MapPin, BookOpen } from '@tamagui/lucide-icons';
import { useTrips } from '../../contexts/TripContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Diary } from '../../types';
import { useDiaries } from '../../contexts';

export default function MapViewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { trips, activeTrip } = useTrips();
  const {diaries} = useDiaries();

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  const activeTripData = activeTrip ? trips.find((t) => t.id === activeTrip) : null;
  const filteredDiaries = diaries.filter((d) => !activeTrip || d.tripId === activeTrip);

  const diariesByCountry = useMemo(() => {
    return filteredDiaries.reduce((acc, diary) => {
      if (diary.country) {
        if (!acc[diary.country]) {
          acc[diary.country] = [];
        }
        acc[diary.country].push(diary);
      }
      return acc;
    }, {} as Record<string, Diary[]>);
  }, [filteredDiaries]);

  const handleCountryClick = (country: string) => {
    setSelectedCountry(country);
    setSelectedLocation(null);
    setShowTimelineModal(true);
  };

  const handleLocationClick = (country: string, location: string) => {
    setSelectedCountry(country);
    setSelectedLocation(location);
    setShowTimelineModal(true);
  };

  const getFilteredDiariesForTimeline = () => {
    if (!selectedCountry) return [];
    const countryDiaries = diariesByCountry[selectedCountry] || [];
    if (selectedLocation) {
      return countryDiaries.filter((d) => d.location === selectedLocation);
    }
    return countryDiaries;
  };

  const timelineDiaries = getFilteredDiariesForTimeline().sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleViewDiary = (diaryId: string) => {
    setShowTimelineModal(false);
    router.push(`/diary/${diaryId}`);
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <YStack
        backgroundColor="$card"
        paddingTop={insets.top}
        paddingHorizontal="$4"
        paddingBottom="$3"
        borderBottomWidth={2}
        borderBottomColor="$primary"
        style={{ borderBottomColor: 'rgba(155, 196, 209, 0.25)' }}
      >
        <Text color="$foreground" fontSize={18} fontWeight="600">
          👣 지도
        </Text>
        {activeTripData && (
          <Text color="$mutedForeground" fontSize={14} marginTop="$0.5">
            {activeTripData.title}
          </Text>
        )}
      </YStack>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Map Placeholder */}
        <YStack
          backgroundColor="$card"
          borderRadius="$6"
          aspectRatio={4 / 3}
          alignItems="center"
          justifyContent="center"
          borderWidth={2}
          borderColor="$border"
          marginBottom="$4"
        >
          <Text fontSize={48} marginBottom="$2">🗺️</Text>
          <Text color="$mutedForeground">지도 뷰</Text>
          <Text color="$mutedForeground" fontSize={14} marginTop="$1">
            (지도 라이브러리 연동 필요)
          </Text>
        </YStack>

        {/* Countries List */}
        <YStack>
          <Text color="$foreground" fontSize={16} fontWeight="600" marginBottom="$3">
            거쳐간 땅
          </Text>
          <YStack gap="$3">
            {Object.entries(diariesByCountry).map(([country, countryDiaries]) => (
              <YStack
                key={country}
                backgroundColor="$card"
                borderRadius="$6"
                padding="$4"
                borderWidth={2}
                borderColor="$border"
              >
                <Pressable onPress={() => handleCountryClick(country)}>
                  <XStack alignItems="center" justifyContent="space-between" marginBottom="$2">
                    <Text color="$foreground" fontSize={16} fontWeight="500">
                      {country}
                    </Text>
                    <Text color="$mutedForeground" fontSize={14}>
                      {countryDiaries.length}개 기록
                    </Text>
                  </XStack>
                </Pressable>
                <YStack gap="$1">
                  {countryDiaries.slice(0, 3).map((diary) => (
                    <Pressable
                      key={diary.id}
                      onPress={() => handleLocationClick(country, diary.location)}
                    >
                      <Text color="$mutedForeground" paddingVertical="$1">
                        • {diary.location}
                      </Text>
                    </Pressable>
                  ))}
                  {countryDiaries.length > 3 && (
                    <Text color="$mutedForeground">외 {countryDiaries.length - 3}개 장소</Text>
                  )}
                </YStack>
              </YStack>
            ))}
          </YStack>
        </YStack>

        {filteredDiaries.length === 0 && (
          <YStack alignItems="center" justifyContent="center" paddingVertical={80}>
            <Text fontSize={48} marginBottom="$4">🌍</Text>
            <Text color="$foreground" marginBottom="$1">아직 여행 기록이 없습니다</Text>
            <Text color="$mutedForeground">새로운 여행을 떠나보세요</Text>
          </YStack>
        )}
      </ScrollView>

      {/* Timeline Modal */}
      <Modal visible={showTimelineModal} transparent animationType="slide">
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setShowTimelineModal(false)}
        >
          <Pressable
            style={{ maxHeight: '85%' }}
            onPress={(e) => e.stopPropagation()}
          >
            <YStack backgroundColor="$card" borderTopLeftRadius="$6" borderTopRightRadius="$6" flex={1}>
              {/* Modal Header */}
              <XStack
                alignItems="center"
                justifyContent="space-between"
                padding="$5"
                borderBottomWidth={2}
                borderBottomColor="$border"
                style={{ borderBottomColor: 'rgba(155, 196, 209, 0.25)' }}
              >
                <YStack>
                  <XStack alignItems="center" gap="$2">
                    <BookOpen size={20} color="$foreground" />
                    <Text color="$foreground" fontSize={18} fontWeight="600">
                      {selectedLocation || selectedCountry}
                    </Text>
                  </XStack>
                  <Text color="$mutedForeground" fontSize={14} marginTop="$1">
                    {timelineDiaries.length}개의 기록
                  </Text>
                </YStack>
                <Button
                  size="$3"
                  circular
                  backgroundColor="transparent"
                  pressStyle={{ backgroundColor: '$accent' }}
                  onPress={() => setShowTimelineModal(false)}
                >
                  <X size={20} color="$foreground" />
                </Button>
              </XStack>

              {/* Timeline Content */}
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
                {timelineDiaries.length === 0 ? (
                  <YStack alignItems="center" paddingVertical={48}>
                    <Text color="$mutedForeground">기록이 없습니다</Text>
                  </YStack>
                ) : (
                  <YStack gap="$4">
                    {timelineDiaries.map((diary, index) => (
                      <YStack key={diary.id} position="relative">
                        {/* Timeline Line */}
                        {index < timelineDiaries.length - 1 && (
                          <YStack
                            position="absolute"
                            left={19}
                            top={50}
                            width={2}
                            height="100%"
                            backgroundColor="$primary"
                            opacity={0.3}
                          />
                        )}

                        <Pressable onPress={() => handleViewDiary(diary.id)}>
                          <XStack>
                            {/* Timeline Dot */}
                            <YStack
                              width={40}
                              height={40}
                              backgroundColor="$primary"
                              borderRadius={20}
                              alignItems="center"
                              justifyContent="center"
                              marginRight="$3"
                              style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 2,
                              }}
                            >
                              <MapPin size={20} color="white" />
                            </YStack>

                            {/* Diary Card */}
                            <YStack
                              flex={1}
                              backgroundColor="$card"
                              borderRadius="$4"
                              padding="$4"
                              borderWidth={2}
                              borderColor="$border"
                            >
                              <XStack alignItems="flex-start" justifyContent="space-between" marginBottom="$2">
                                <Text color="$foreground" fontWeight="500" flex={1}>
                                  {diary.title}
                                </Text>
                                <XStack alignItems="center" gap="$1" marginLeft="$2">
                                  <Calendar size={14} color="$mutedForeground" />
                                  <Text color="$mutedForeground" fontSize={12}>
                                    {new Date(diary.date).toLocaleDateString('ko-KR', {
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </Text>
                                </XStack>
                              </XStack>

                              {diary.location && (
                                <XStack alignItems="center" gap="$1" marginBottom="$2">
                                  <MapPin size={14} color="$mutedForeground" />
                                  <Text color="$mutedForeground" fontSize={14}>
                                    {diary.location}
                                  </Text>
                                </XStack>
                              )}

                              {diary.content && (
                                <Text color="$mutedForeground" fontSize={14} numberOfLines={2}>
                                  {diary.content}
                                </Text>
                              )}

                              {diary.photos && diary.photos.length > 0 && (
                                <XStack gap="$2" marginTop="$3">
                                  {diary.photos.slice(0, 3).map((photo, i) => (
                                    <YStack
                                      key={i}
                                      width={64}
                                      height={64}
                                      borderRadius="$3"
                                      overflow="hidden"
                                      borderWidth={2}
                                      borderColor="$border"
                                    >
                                      <Image
                                        source={{ uri: photo }}
                                        width="100%"
                                        height="100%"
                                        resizeMode="cover"
                                      />
                                    </YStack>
                                  ))}
                                  {diary.photos.length > 3 && (
                                    <YStack
                                      width={64}
                                      height={64}
                                      borderRadius="$3"
                                      backgroundColor="$accent"
                                      alignItems="center"
                                      justifyContent="center"
                                      opacity={0.3}
                                    >
                                      <Text color="$foreground" fontSize={14}>
                                        +{diary.photos.length - 3}
                                      </Text>
                                    </YStack>
                                  )}
                                </XStack>
                              )}
                            </YStack>
                          </XStack>
                        </Pressable>
                      </YStack>
                    ))}
                  </YStack>
                )}
              </ScrollView>
            </YStack>
          </Pressable>
        </Pressable>
      </Modal>
    </YStack>
  );
}
