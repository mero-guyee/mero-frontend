import { YCard } from '@/components/ui/Card';
import FadeWrapper from '@/components/ui/FadeWrapper';
import TabScreenHeader from '@/components/ui/header/TabScreenHeader';
import { paddingHorizontalGeneral } from '@/constants/theme';
import { BookOpen, Calendar, MapPin, X } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, Text, XStack, YStack } from 'tamagui';
import { CircularButton } from '../../components/ui';
import { useFootprints, useTrips } from '../../contexts';
import { Footprint } from '../../types';

export default function MapViewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { trips, activeTrip } = useTrips();
  const { footprints } = useFootprints();

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  const activeTripData = activeTrip ? trips.find((t) => t.id === activeTrip) : null;

  const footprintsByCountry = useMemo(() => {
    return footprints.reduce(
      (acc, footprint) => {
        for (const loc of footprint.locations) {
          const country = loc.country;

          if (country) {
            if (!acc[country]) {
              acc[country] = [];
            }
            if (!acc[country].find((f) => f.id === footprint.id)) {
              acc[country].push(footprint);
            }
          }
        }
        return acc;
      },
      {} as Record<string, Footprint[]>
    );
  }, [footprints]);

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

  const getFilteredMemosForTimeline = () => {
    if (!selectedCountry) return [];
    const country = footprintsByCountry[selectedCountry] || [];
    if (selectedLocation) {
      return country.filter((m) => m.locations.some((loc) => loc.placeName === selectedLocation));
    }
    return country;
  };

  const timelineMemos = getFilteredMemosForTimeline().sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const handleViewFootprint = (footprintId: string) => {
    setShowTimelineModal(false);
    router.push(`/(main)/footprint/${footprintId}`);
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <TabScreenHeader label="지도" />
      <FadeWrapper>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: paddingHorizontalGeneral, paddingBottom: 100 }}
        >
          {/* Map Placeholder */}
          <YCard alignItems="center" justifyContent="center" marginBottom="$4">
            <Text fontSize={48} marginBottom="$2">
              🗺️
            </Text>
            <Text color="$mutedForeground">지도 뷰</Text>
            <Text color="$mutedForeground" fontSize={14} marginTop="$1">
              (지도 라이브러리 연동 필요)
            </Text>
          </YCard>

          {/* Countries List */}
          <YStack>
            <Text color="$foreground" fontSize={16} fontWeight="600" marginBottom="$3">
              거쳐간 땅
            </Text>
            <YStack gap="$3">
              {Object.entries(footprintsByCountry).map(([country, countryMemos]) => (
                <YCard key={country} padding="$4">
                  <Pressable onPress={() => handleCountryClick(country)}>
                    <XStack alignItems="center" justifyContent="space-between" marginBottom="$2">
                      <Text color="$foreground" fontSize={16} fontWeight="500">
                        {country}
                      </Text>
                      <Text color="$mutedForeground" fontSize={14}>
                        {countryMemos.length}개 기록
                      </Text>
                    </XStack>
                  </Pressable>
                  <YStack gap="$1">
                    {countryMemos.slice(0, 3).map((memo) => {
                      const placeName = memo.locations.find(
                        (l) => l.country === country
                      )?.placeName;
                      return (
                        <Pressable
                          key={memo.id}
                          onPress={() => placeName && handleLocationClick(country, placeName)}
                        >
                          <Text color="$mutedForeground" paddingVertical="$1">
                            • {placeName || memo.title}
                          </Text>
                        </Pressable>
                      );
                    })}
                    {countryMemos.length > 3 && (
                      <Text color="$mutedForeground">외 {countryMemos.length - 3}개 장소</Text>
                    )}
                  </YStack>
                </YCard>
              ))}
            </YStack>
          </YStack>

          {footprints.length === 0 && (
            <YStack alignItems="center" justifyContent="center" paddingVertical={80}>
              <Text fontSize={48} marginBottom="$4">
                🌍
              </Text>
              <Text color="$foreground" marginBottom="$1">
                아직 여행 기록이 없습니다
              </Text>
              <Text color="$mutedForeground">새로운 여행을 떠나보세요</Text>
            </YStack>
          )}
        </ScrollView>

        {/* Timeline Modal */}
        <Modal visible={showTimelineModal} animationType="slide" transparent>
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'flex-end',
            }}
            onPress={() => setShowTimelineModal(false)}
          >
            <Pressable onPress={(e) => e.stopPropagation()} style={{ height: '75%' }}>
              <YStack
                backgroundColor="$card"
                borderTopLeftRadius="$6"
                borderTopRightRadius="$6"
                flex={1}
              >
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
                      {timelineMemos.length}개의 기록
                    </Text>
                  </YStack>
                  <CircularButton size="$3" onPress={() => setShowTimelineModal(false)}>
                    <X size={20} color="$foreground" />
                  </CircularButton>
                </XStack>

                {/* Timeline Content */}
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
                  {timelineMemos.length === 0 ? (
                    <YStack alignItems="center" paddingVertical={48}>
                      <Text color="$mutedForeground">기록이 없습니다</Text>
                    </YStack>
                  ) : (
                    <YStack gap="$4">
                      {timelineMemos.map((memo, index) => (
                        <YStack key={memo.id} position="relative">
                          {/* Timeline Line */}
                          {index < timelineMemos.length - 1 && (
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

                          <Pressable onPress={() => handleViewFootprint(memo.id)}>
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
                              >
                                <MapPin size={20} color="white" />
                              </YStack>

                              {/* Memo Card */}
                              <YStack
                                flex={1}
                                backgroundColor="$card"
                                borderRadius="$4"
                                padding="$4"
                                borderWidth={2}
                                borderColor="$border"
                              >
                                <XStack
                                  alignItems="flex-start"
                                  justifyContent="space-between"
                                  marginBottom="$2"
                                >
                                  <Text color="$foreground" fontWeight="500" flex={1}>
                                    {memo.title}
                                  </Text>
                                  <XStack alignItems="center" gap="$1" marginLeft="$2">
                                    <Calendar size={14} color="$mutedForeground" />
                                    <Text color="$mutedForeground" fontSize={12}>
                                      {new Date(memo.date).toLocaleDateString('ko-KR', {
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </Text>
                                  </XStack>
                                </XStack>

                                {memo.locations[0]?.placeName && (
                                  <XStack alignItems="center" gap="$1" marginBottom="$2">
                                    <MapPin size={14} color="$mutedForeground" />
                                    <Text color="$mutedForeground" fontSize={14}>
                                      {memo.locations[0].placeName}
                                    </Text>
                                  </XStack>
                                )}

                                {memo.content && (
                                  <Text color="$mutedForeground" fontSize={14} numberOfLines={2}>
                                    {memo.content}
                                  </Text>
                                )}

                                {memo.photoUrls && memo.photoUrls.length > 0 && (
                                  <XStack gap="$2" marginTop="$3">
                                    {memo.photoUrls.slice(0, 3).map((photo, i) => (
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
                                    {memo.photoUrls.length > 3 && (
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
                                          +{memo.photoUrls.length - 3}
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
      </FadeWrapper>
    </YStack>
  );
}
