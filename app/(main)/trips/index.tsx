import { Backpack, MapPin, Plus, Settings } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Image, Text, XStack, YStack } from 'tamagui';
import { useExpenses, useFootprints, useTrips } from '../../../contexts';
import { Trip } from '../../../types';

// 원본 TripList.tsx 변환
export default function TripListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { trips, setActiveTrip } = useTrips();
  const { footprints } = useFootprints();
  const { expenses } = useExpenses();

  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const filteredTrips = trips
    .filter((trip) => filter === 'all')
    .sort((a, b) => {
      if (sort === 'newest') {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      } else {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
    });

  const getTripStats = (tripId: string) => {
    const tripDiaries = footprints.filter((f) => f.tripId === tripId);
    const tripExpenses = expenses.filter((e) => e.tripId === tripId);
    const totalAmount = tripExpenses.reduce((sum, e) => sum + e.amount, 0);
    const currency = tripExpenses[0]?.currency || 'USD';

    return {
      footprintCount: tripDiaries.length,
      totalExpense: totalAmount,
      currency,
    };
  };

  const handleSelectTrip = (tripId: string) => {
    setActiveTrip(tripId);
    router.push(`/(main)/trips/${tripId}`);
  };

  const handleCreateTrip = () => {
    router.push('/(main)/trips/new');
  };

  const handleSettings = () => {
    router.push('/(main)/settings');
  };

  const renderTripCard = ({ item: trip }: { item: Trip }) => {
    const stats = getTripStats(trip.id);
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const today = new Date();
    const totalDays =
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysPassed = Math.max(
      0,
      Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const progress = Math.min(100, (daysPassed / totalDays) * 100);

    return (
      <Pressable onPress={() => handleSelectTrip(trip.id)}>
        <YStack
          backgroundColor="$card"
          borderRadius="$6"
          borderWidth={2}
          borderColor="$border"
          overflow="hidden"
          marginBottom="$4"
          style={{
            shadowColor: '#5C4033',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {/* Cover Image */}
          <YStack height={180} overflow="hidden">
            <Image
              source={{ uri: trip.imageUrl }}
              width="100%"
              height="100%"
              resizeMode="cover"
            />
            <YStack
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              height={80}
              style={{
                background: 'linear-gradient(to top, rgba(92, 64, 51, 0.4), transparent)',
              }}
            />
          </YStack>

          {/* Content */}
          <YStack padding="$5" gap="$3">
            <Text fontSize={18} fontWeight="600" color="$foreground">
              {trip.title}
            </Text>

            {trip.startDate < trip.endDate && (
              <YStack backgroundColor="$muted" borderRadius="$4" padding="$3">
                <XStack justifyContent="space-between" marginBottom="$2">
                  <Text color="$mutedForeground" fontSize={14}>
                    진행 중 ✨
                  </Text>
                  <Text color="$mutedForeground" fontSize={14}>
                    D+{daysPassed} / {totalDays}일
                  </Text>
                </XStack>
                <YStack
                  height={10}
                  backgroundColor="$secondary"
                  borderRadius={5}
                  overflow="hidden"
                >
                  <YStack
                    height={10}
                    backgroundColor="$primary"
                    borderRadius={5}
                    width={`${progress}%`}
                  />
                </YStack>
              </YStack>
            )}

            <Text color="$mutedForeground" fontSize={14}>
              {trip.startDate} - {trip.endDate}
            </Text>

            <XStack alignItems="center" gap="$1.5">
              <MapPin size={16} color="$mutedForeground" />
              <Text color="$mutedForeground" fontSize={14}>
                {trip.countries.join(', ')}
              </Text>
            </XStack>
          </YStack>
        </YStack>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <YStack alignItems="center" justifyContent="center" paddingVertical="$10" paddingHorizontal="$4">
      <YStack
        width={200}
        height={200}
        backgroundColor="$accent"
        borderRadius={100}
        alignItems="center"
        justifyContent="center"
        marginBottom="$6"
        opacity={0.8}
      >
        <Text fontSize={80}>🎒</Text>
      </YStack>
      <Text fontSize={20} fontWeight="600" color="$foreground" marginBottom="$2">
        첫 여정을 시작해보세요
      </Text>
      <Text color="$mutedForeground" textAlign="center" marginBottom="$6">
        새로운 모험의 기록을 남겨보세요
      </Text>
      <Button
        height={48}
        paddingHorizontal="$6"
        backgroundColor="$primary"
        borderRadius="$6"
        pressStyle={{ backgroundColor: '$primaryHover' }}
        onPress={handleCreateTrip}
      >
        <Text color="white" fontWeight="600">
          여정 만들기
        </Text>
      </Button>
    </YStack>
  );

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      {/* Header */}
      <YStack
        backgroundColor="$card"
        borderBottomWidth={2}
        borderBottomColor="$border"
        style={{
          shadowColor: '#5C4033',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <XStack alignItems="center" justifyContent="space-between" padding="$4">
          <XStack alignItems="center" gap="$3">
            <YStack
              width={48}
              height={48}
              backgroundColor="$accent"
              borderRadius={24}
              alignItems="center"
              justifyContent="center"
            >
              <Backpack size={24} color="$foreground" />
            </YStack>
            <YStack>
              <Text fontSize={18} fontWeight="600" color="$foreground">
                {}씨의 기록
              </Text>
              <Text fontSize={14} color="$mutedForeground">
                세계는 넓고 갈 곳은 많습니다
              </Text>
            </YStack>
          </XStack>
          <XStack gap="$2">
            <Button
              size="$4"
              backgroundColor="transparent"
              borderRadius="$4"
              pressStyle={{ backgroundColor: '$muted' }}
              onPress={handleSettings}
            >
              <Settings size={20} color="$foreground" />
            </Button>
            <Button
              size="$4"
              backgroundColor="$accent"
              borderRadius="$4"
              pressStyle={{ backgroundColor: '$accentHover' }}
              onPress={handleCreateTrip}
            >
              <Plus size={20} color="$foreground" />
            </Button>
          </XStack>
        </XStack>

        {/* Filters */}
        <XStack padding="$4" paddingTop={0} gap="$2">
          <YStack
            flex={1}
            backgroundColor="$muted"
            borderRadius="$4"
            borderWidth={2}
            borderColor="$border"
            paddingHorizontal="$4"
            paddingVertical="$2.5"
          >
            <Pressable onPress={() => setFilter(filter === 'all' ? 'ongoing' : filter === 'ongoing' ? 'completed' : 'all')}>
              <Text color="$foreground" fontSize={14}>
                {filter === 'all' ? '전체' : filter === 'ongoing' ? '진행 중' : '완료됨'}
              </Text>
            </Pressable>
          </YStack>
          <YStack
            flex={1}
            backgroundColor="$muted"
            borderRadius="$4"
            borderWidth={2}
            borderColor="$border"
            paddingHorizontal="$4"
            paddingVertical="$2.5"
          >
            <Pressable onPress={() => setSort(sort === 'newest' ? 'oldest' : 'newest')}>
              <Text color="$foreground" fontSize={14}>
                {sort === 'newest' ? '최신순' : '오래된 순'}
              </Text>
            </Pressable>
          </YStack>
        </XStack>
      </YStack>

      {/* Trip List */}
      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item.id}
        renderItem={renderTripCard}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  );
}
