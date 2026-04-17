import { paddingHorizontalGeneral } from '@/constants/theme';
import { TripStatus } from '@/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import FloatingActionButton from '@/components/ui/button/FloatingActionButton';
import FadeWrapper from '@/components/ui/FadeWrapper';
import { useIsFocused } from '@react-navigation/native';
import { Plane } from '@tamagui/lucide-icons';
import { FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, YStack } from 'tamagui';
import { TripCard } from '../../../components/trips/card/TripCard';
import { TripEmptyState } from '../../../components/trips/TripEmptyState';
import { TripHeader } from '../../../components/trips/TripHeader';
import { useTrips } from '../../../contexts';

export default function TripListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const { tripsByProgress, trips, setActiveTrip, isTripsLoading } = useTrips();

  const [filter, setFilter] = useState<'all' | TripStatus>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const filteredTrips = [...(filter === 'all' ? trips : tripsByProgress[filter])];
  const filteredAndSortedTrips = filteredTrips.sort((a, b) => {
    if (sort === 'newest') {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    } else {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }
  });

  const handleSelectTrip = (tripId: string) => {
    setActiveTrip(tripId);
    router.push('/(main)/backpack');
  };

  const handleCreateTrip = () => {
    router.push('/(main)/trips/new/Country');
  };

  const handleSettings = () => {
    router.push('/(main)/settings');
  };

  if (!isFocused) {
    return (
      <View flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Plane size={44} color="$mutedForeground" />
      </View>
    );
  }
  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <TripHeader
        filter={filter}
        setFilter={setFilter}
        sort={sort}
        setSort={setSort}
        onSettings={handleSettings}
      />
      {isTripsLoading ? (
        <View flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
          <Plane size={44} color="$mutedForeground" />
        </View>
      ) : (
        <FadeWrapper>
          <FlatList
            data={filteredAndSortedTrips}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: paddingHorizontalGeneral }}
            renderItem={({ item }) => (
              <TripCard trip={item} onPress={() => handleSelectTrip(item.id)} />
            )}
            ListEmptyComponent={<TripEmptyState onCreateTrip={handleCreateTrip} />}
            showsVerticalScrollIndicator={false}
          />
          <FloatingActionButton onPress={() => handleCreateTrip()} noBottomTabBar>
            <Plane size={44} strokeWidth={1} />
          </FloatingActionButton>
        </FadeWrapper>
      )}
    </YStack>
  );
}
